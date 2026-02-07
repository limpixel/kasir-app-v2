<?php

namespace App\Http\Controllers\Apps;

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

class TransactionController extends Controller
{
    
    public function index()
    {
        //get cart
        $carts = Cart::with('product')->where('cashier_id', auth()->user()->id)->latest()->get();

        //get all customers
        $customers = Customer::latest()->get();

        $carts_total = 0;
        foreach ($carts as $cart) {
            $carts_total += $cart->price ; // Assuming your quantity column is named 'quantity'
        }


        // recent transactions for dashboard monitoring
        $transactions = Transaction::with('details.product', 'customer', 'cashier')
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Dashboard/Transactions/Index', [
            'carts' => $carts,
            'carts_total' => $carts_total,
            'customers' => $customers,
            'transactions' => $transactions,
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
     * Update the status of a transaction (AJAX).
     * Expects JSON: { status: 'pending'|'completed'|'cancelled' }
     */
    public function updateStatus(Request $request, $id)
    {
        $data = $request->validate([
            'status' => ['required', 'string', 'in:pending,completed,cancelled']
        ]);

        $transaction = Transaction::where('id', $id)->first();

        if (! $transaction) {
            return response()->json(['success' => false, 'message' => 'Transaction not found.'], 404);
        }
        // Determine allowed enum values for `status` column (MySQL)
        $allowed = null;
        try {
            $col = DB::select("SHOW COLUMNS FROM `{$transaction->getTable()}` WHERE Field = 'status'");
            if (!empty($col) && isset($col[0]->Type)) {
                // Type looks like: enum('unpaid','paid','sending')
                if (preg_match("/^enum\((.*)\)$/", $col[0]->Type, $matches)) {
                    $vals = str_getcsv($matches[1], ',', "'");
                    $allowed = array_map(function($v){ return trim($v, "'"); }, $vals);
                }
            }
        } catch (\Exception $e) {
            // ignore, will validate later
            $allowed = null;
        }

        $incoming = $data['status'];

        // Map legacy UI statuses to DB enum values when necessary
        $map = [
            'pending' => 'unpaid',
            'completed' => 'paid',
            'cancelled' => 'unpaid',
        ];

        $dbValue = $incoming;
        if (is_array($allowed)) {
            if (!in_array($incoming, $allowed, true)) {
                // try mapping
                if (isset($map[$incoming]) && in_array($map[$incoming], $allowed, true)) {
                    $dbValue = $map[$incoming];
                } else {
                    return response()->json(['success' => false, 'message' => 'Requested status not supported by database.'], 422);
                }
            }
        } else {
            // no schema info; try mapping known synonyms
            if (isset($map[$incoming])) {
                $dbValue = $map[$incoming];
            }
        }

        $transaction->status = $dbValue;

        // If the transactions table has a payment_status column, update it accordingly
        if (Schema::hasColumn($transaction->getTable(), 'payment_status')) {
            $paymentStatus = 'pending';
            if ($incoming === 'completed' || $dbValue === 'paid') {
                $paymentStatus = 'paid';
            } elseif ($incoming === 'cancelled') {
                $paymentStatus = 'cancelled';
            } elseif ($incoming === 'pending') {
                $paymentStatus = 'pending';
            }

            $transaction->payment_status = $paymentStatus;
        }

        $transaction->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated.',
            'status' => $transaction->status,
            'payment_status' => Schema::hasColumn($transaction->getTable(), 'payment_status') ? $transaction->payment_status : null,
        ]);
    }
}
