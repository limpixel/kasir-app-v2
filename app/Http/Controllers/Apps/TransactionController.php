<?php

namespace App\Http\Controllers\Apps;

use App\Services\JabodetabekValidatorService;
use Inertia\Inertia;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Response;

class TransactionController extends Controller
{
    private JabodetabekValidatorService $jabodetabekValidator;

    public function __construct(JabodetabekValidatorService $jabodetabekValidator)
    {
        $this->jabodetabekValidator = $jabodetabekValidator;
    }

    /**
     * Display transaction management page with statistics
     */
    public function index(Request $request)
    {
        // Build query with filters
        $query = Transaction::with('details.product', 'customer', 'cashier');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        // Payment status filter
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('status', $request->payment_status);
        }

        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->latest()->paginate(20)->withQueryString();

        // Calculate statistics
        $statistics = [
            'total_transactions' => Transaction::count(),
            'today_transactions' => Transaction::whereDate('created_at', today())->count(),
            'total_revenue' => Transaction::sum('grand_total'),
            'pending_orders' => Transaction::where('order_status', 'pending')->count(),
        ];

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Display transaction detail
     */
    public function show($id)
    {
        $transaction = Transaction::with('details.product', 'customer', 'cashier')->findOrFail($id);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'order_status' => ['required', 'string', 'in:pending,processing,shipping,delivered,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $transaction = Transaction::findOrFail($id);

        $transaction->order_status = $data['order_status'];
        
        // Set date based on status
        switch ($data['order_status']) {
            case 'processing':
                $transaction->order_date = now();
                break;
            case 'shipping':
                $transaction->shipping_date = now();
                break;
            case 'delivered':
                $transaction->delivered_date = now();
                $transaction->status = 'accepted';
                break;
            case 'cancelled':
                $transaction->cancelled_date = now();
                break;
        }

        if (isset($data['notes'])) {
            $transaction->notes = $data['notes'];
        }

        $transaction->save();

        return back()->with('success', 'Status berhasil diperbarui');
    }

    /**
     * Export transactions to CSV
     */
    public function export(Request $request)
    {
        // Build query with same filters as index
        $query = Transaction::with('details.product', 'customer', 'cashier');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('status', $request->payment_status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $transactions = $query->latest()->get();

        // Create CSV content
        $csvData = "Invoice,Tanggal,Nama Pelanggan,Telepon,Alamat,Status Order,Status Pembayaran,Total,Cashier\n";
        
        foreach ($transactions as $transaction) {
            $csvData .= sprintf(
                "%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                $transaction->invoice,
                $transaction->created_at,
                $transaction->customer_name ?? 'Umum',
                $transaction->customer_phone ?? '-',
                str_replace('"', '""', $transaction->customer_address ?? '-'),
                $transaction->order_status,
                $transaction->status,
                $transaction->grand_total,
                $transaction->cashier->name ?? '-'
            );
        }

        $filename = 'transaksi_' . date('Y-m-d_His') . '.csv';

        return Response::make($csvData, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }


    public function searchProduct(Request $request)
    {
        //find product by barcode
        $product = Product::where('barcode', $request->barcode)->first();

        if ($product) {
            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        }

        return response()->json([
            'success' => false,
            'data' => null
        ]);
    }


    public function addToCart(Request $request)
    {
        // Cari produk berdasarkan ID yang diberikan
        $product = Product::whereId($request->product_id)->first();

        // Jika produk tidak ditemukan, redirect dengan pesan error
        if (!$product) {
            return redirect()->back()->with('error', 'Product not found.');
        }

        // Cek stok produk
        if ($product->stock < $request->qty) {
            return redirect()->back()->with('error', 'Out of Stock Product!.');
        }

        // Cek keranjang
        $cart = Cart::with('product')
            ->where('product_id', $request->product_id)
            ->where('cashier_id', auth()->user()->id)
            ->first();

        if ($cart) {
            // Tingkatkan qty
            $cart->increment('qty', $request->qty);

            // Jumlahkan harga * kuantitas
            $cart->price = $cart->product->sell_price * $cart->qty;

            $cart->save();
        } else {
            // Insert ke keranjang
            Cart::create([
                'cashier_id' => auth()->user()->id,
                'product_id' => $request->product_id,
                'qty' => $request->qty,
                'price' => $request->sell_price * $request->qty,
            ]);
        }

        return redirect()->route('transactions.index')->with('success', 'Product Added Successfully!.');
    }



    public function destroyCart($cart_id)
    {
        $cart = Cart::with('product')->whereId($cart_id)->first();

        if ($cart) {
            $cart->delete();
            return back();
        } else {
            // Handle case where no cart is found (e.g., redirect with error message)
            return back()->withErrors(['message' => 'Cart not found']);
        }

    }


    public function store(Request $request)
    {
        // Validate customer location for Jabodetabek region
        if ($request->customer_id) {
            $customer = Customer::find($request->customer_id);
            if ($customer && !$this->jabodetabekValidator->isJabodetabek($customer->city, $customer->province, $customer->address)) {
                return redirect()->back()
                    ->withErrors(['location' => 'Maaf, kami hanya melayani pembelian untuk wilayah Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi).'])
                    ->withInput();
            }
        }

        /**
         * algorithm generate no invoice
         */
        $length = 10;
        $random = '';
        for ($i = 0; $i < $length; $i++) {
            $random .= rand(0, 1) ? rand(0, 9) : chr(rand(ord('a'), ord('z')));
        }

        //generate no invoice
        $invoice = 'TRX-' . Str::upper($random);

        //insert transaction
        $transaction = Transaction::create([
            'cashier_id' => auth()->user()->id,
            'customer_id' => $request->customer_id,
            'invoice' => $invoice,
            'cash' => $request->cash,
            'change' => $request->change,
            'discount' => $request->discount,
            'grand_total' => $request->grand_total,
        ]);

        //get carts
        $carts = Cart::where('cashier_id', auth()->user()->id)->get();

        //insert transaction detail
        foreach ($carts as $cart) {

            //insert transaction detail
            $transaction->details()->create([
                'transaction_id' => $transaction->id,
                'product_id' => $cart->product_id,
                'qty' => $cart->qty,
                'price' => $cart->price,
            ]);

            //get price
            $total_buy_price = $cart->product->buy_price * $cart->qty;
            $total_sell_price = $cart->product->sell_price * $cart->qty;

            //get profits
            $profits = $total_sell_price - $total_buy_price;

            //insert provits
            $transaction->profits()->create([
                'transaction_id' => $transaction->id,
                'total' => $profits,
            ]);

            //update stock product
            $product = Product::find($cart->product_id);
            $product->stock = $product->stock - $cart->qty;
            $product->save();

        }

        //delete carts
        Cart::where('cashier_id', auth()->user()->id)->delete();

        // return response()->json([
        //     'success' => true,
        //     'data' => $transaction
        // ]);
        return to_route('transactions.print', $transaction->invoice);
    }

    public function print($invoice)
    {
        //get transaction
        $transaction = Transaction::with('details.product', 'cashier', 'customer')->where('invoice', $invoice)->firstOrFail();

        return Inertia::render('Dashboard/Transactions/Print', [
            'transaction' => $transaction
        ]);
    }

    /**
     * Get notifications for dashboard
     */
    public function getNotifications(Request $request)
    {
        $limit = $request->get('limit', 10);
        
        // Get recent transactions with details
        $transactions = Transaction::with(['details.product', 'cashier', 'customer'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice' => $transaction->invoice,
                    'customer_name' => $transaction->customer_name,
                    'customer_phone' => $transaction->customer_phone,
                    'order_status' => $transaction->order_status,
                    'status' => $transaction->status,
                    'grand_total' => $transaction->grand_total,
                    'payment_method' => $transaction->payment_method,
                    'created_at' => $transaction->created_at,
                    'details_count' => $transaction->details->count(),
                ];
            });

        // Count unread notifications (transactions from last 24 hours)
        $unreadCount = Transaction::where('created_at', '>=', now()->subHours(24))
            ->where('order_status', 'pending')
            ->count();

        return response()->json([
            'notifications' => $transactions,
            'unread_count' => $unreadCount,
            'total_count' => $transactions->count(),
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markNotificationsAsRead(Request $request)
    {
        // In a real implementation, you would store read status in database
        // For now, we'll just return success
        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai sebagai dibaca',
        ]);
    }

    /**
     * Show upload payment proof page
     */
    public function showUploadProof($invoice)
    {
        $transaction = Transaction::with('details.product', 'cashier', 'customer')
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Inertia::render('Transactions/UploadPaymentProof', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Store payment proof
     */
    public function storePaymentProof(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
        ]);

        $transaction = Transaction::findOrFail($id);

        // Upload file
        if ($request->hasFile('payment_proof')) {
            $file = $request->file('payment_proof');
            $fileName = 'payment_proof_' . $transaction->invoice . '_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store in storage/app/public/payment-proofs
            $filePath = $file->storeAs('payment-proofs', $fileName, 'public');

            // Update transaction
            $transaction->payment_proof = $filePath;
            $transaction->payment_proof_uploaded_at = now();
            $transaction->status = 'paid'; // Set status to paid
            $transaction->save();

            return response()->json([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil diupload',
                'file_path' => $filePath,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada file yang diupload',
        ], 400);
    }
}
