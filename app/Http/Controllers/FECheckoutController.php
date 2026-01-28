<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FECheckoutController extends Controller
{
    public function index() {
        
        $products = Product::when(request()->search, function ($products) {
            $products = $products->where('title', 'like', '%' . request()->search . '%');
        })->with('category')->latest()->get();

        $categories = Category::all();

        return Inertia::render('CartPage', [
            'products' => $products,
            'categories' => $categories
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
}
