<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FECheckoutController extends Controller
{
    public function index() {
        
        $products = Product::when(request()->search, function ($products) {
            $products = $products->where('title', 'like', '%' . request()->search . '%');
        })->with('category')->latest()->get();

        $categories = Category::all();

        // load recent transactions for the authenticated user
        $transactions = [];
        if (auth()->check()) {
            $transactions = Transaction::where('user_id', auth()->id())
                ->with('details.product')
                ->latest()
                ->get()
                ->map(function ($transaction) {
                    return [
                        'id' => $transaction->id,
                        'invoice' => $transaction->invoice,
                        'customer_name' => $transaction->customer_name,
                        'customer_phone' => $transaction->customer_phone,
                        'customer_address' => $transaction->customer_address,
                        'payment_method' => $transaction->payment_method,
                        'grand_total' => $transaction->grand_total,
                        'status' => $transaction->status,
                        'created_at' => is_string($transaction->created_at) ? $transaction->created_at : $transaction->created_at->format('d-m-Y H:i'),
                        'items' => $transaction->details->map(function ($detail) {
                            return [
                                'product_name' => $detail->product->title ?? 'N/A',
                                'qty' => $detail->qty,
                                'price' => $detail->price,
                                'subtotal' => $detail->qty * $detail->price,
                            ];
                        }),
                    ];
                });
        }

        return Inertia::render('CartPage', [
            'products' => $products,
            'categories' => $categories,
            'csrf_token' => csrf_token(),
            'transactions' => $transactions,
        ]);
    }


    public function add(Request $request)
    {
        $cart = session()->get('cart', []);

        $found = false;

        foreach ($cart as &$item) {
            if ($item['product_id'] == $request->product_id) {
                $item['qty'] += 1;
                $item['subtotal'] = $item['qty'] * $item['price'];
                $found = true;
                break;
            }
        }

        if (!$found) {
            $cart[] = [
                'product_id' => $request->product_id,
                'name' => $request->name,
                'price' => $request->price,
                'qty' => 1,
                'subtotal' => $request->price,
            ];
        }

        session(['cart' => $cart]);

        return back();
    }

    public function remove($id)
    {
        $cart = collect(session('cart'))
            ->reject(fn ($item) => $item['product_id'] == $id)
            ->values()
            ->toArray();

        session(['cart' => $cart]);

        return back();
    }

    public function clear()
    {
        session()->forget('cart');
        return back();
    }

    public function saveTransaction(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'customer_name' => 'required|string',
            'customer_phone' => 'required|string',
            'customer_address' => 'required|string',
            'payment_method' => 'required|string',
            'grand_total' => 'required|numeric',
        ]);

        try {
            // Create invoice number
            $invoice = 'INV-' . date('YmdHis') . '-' . Str::random(6);

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => auth()->id(),
                'invoice' => $invoice,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'payment_method' => $request->payment_method,
                'grand_total' => $request->grand_total,
                'cash' => $request->grand_total,
                'change' => 0,
                'discount' => 0,
                    // default status for new transactions
                    'status' => 'unpaid',
                    'cashier_id' => auth()->id(),
            ]);

            // Create transaction details
            foreach ($request->items as $item) {
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['id'],
                    'qty' => $item['qty'],
                    'price' => $item['sell_price'],
                    'note' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil disimpan',
                'invoice' => $invoice,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function getTransactions()
    {
        $transactions = Transaction::where('user_id', auth()->id())
            ->with('details.product')
            ->latest()
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice' => $transaction->invoice,
                    'customer_name' => $transaction->customer_name,
                    'customer_phone' => $transaction->customer_phone,
                    'customer_address' => $transaction->customer_address,
                    'payment_method' => $transaction->payment_method,
                    'grand_total' => $transaction->grand_total,
                    'status' => $transaction->status,
                    'created_at' => is_string($transaction->created_at) ? $transaction->created_at : $transaction->created_at->format('d-m-Y H:i'),
                    'items' => $transaction->details->map(function ($detail) {
                        return [
                            'product_name' => $detail->product->title ?? 'N/A',
                            'qty' => $detail->qty,
                            'price' => $detail->price,
                            'subtotal' => $detail->qty * $detail->price,
                        ];
                    }),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }
}
