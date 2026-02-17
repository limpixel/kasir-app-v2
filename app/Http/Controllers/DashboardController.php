<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics
     */
    public function index()
    {
        // Calculate statistics
        $statistics = [
            'categories' => Category::count(),
            'products' => Product::count(),
            'total_transactions' => Transaction::count(),
            'total_revenue' => Transaction::sum('grand_total'),
            'today_transactions' => Transaction::whereDate('created_at', today())->count(),
            'pending_orders' => Transaction::where('order_status', 'pending')->count(),
            'completed_orders' => Transaction::where('order_status', 'delivered')->count(),
        ];

        // Get recent transactions
        $recentTransactions = Transaction::with('details.product', 'customer', 'cashier')
            ->latest()
            ->take(10)
            ->get();

        // Get notifications for new transactions (last 24 hours)
        $newTransactionsCount = Transaction::where('created_at', '>=', now()->subHours(24))
            ->where('order_status', 'pending')
            ->count();

        return Inertia::render('Dashboard/Index', [
            'statistics' => $statistics,
            'recentTransactions' => $recentTransactions,
            'notifications' => [
                'new_transactions' => $newTransactionsCount,
            ],
        ]);
    }
}
