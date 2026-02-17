<?php

use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FECheckoutController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

use App\Http\Controllers\GalleryController;

Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery');
Route::get('/gallery-detail/{id}', [GalleryController::class, 'show'])->name('gallery.detail');


Route::middleware(['auth'])->group(function () {
    Route::get('/cart', [FECheckoutController::class, 'index'])->name('cart.index');
    Route::post('/cart/add', [FECheckoutController::class, 'add'])->name('cart.add');
    Route::delete('/cart/{id}', [FECheckoutController::class, 'remove'])->name('cart.remove');
    Route::delete('/cart', [FECheckoutController::class, 'clear'])->name('cart.clear');
    Route::post('/cart/save-transaction', [FECheckoutController::class, 'saveTransaction'])->name('cart.save-transaction');
    Route::get('/cart/transactions', [FECheckoutController::class, 'getTransactions'])->name('cart.transactions');
});



 


Route::group(['prefix' => 'dashboard', 'middleware' => ['auth']], function () {
    Route::get('/', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('dashboard');
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');
    // roles route
    Route::resource('/roles', RoleController::class)->except(['create', 'edit', 'show']);
    // users route
    Route::resource('/users', UserController::class)->except('show');

    Route::resource('categories', CategoryController::class);
    Route::resource('products', ProductController::class);
    Route::resource('customers', CustomerController::class);
    //route transaction
    Route::get('/transactions', [\App\Http\Controllers\Apps\TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/transactions/{id}', [\App\Http\Controllers\Apps\TransactionController::class, 'show'])->name('transactions.show');
    Route::put('/transactions/{id}/update-status', [\App\Http\Controllers\Apps\TransactionController::class, 'updateStatus'])->name('transactions.update-status');
    Route::post('/transactions/export', [\App\Http\Controllers\Apps\TransactionController::class, 'export'])->name('transactions.export');
    Route::get('/api/notifications', [\App\Http\Controllers\Apps\TransactionController::class, 'getNotifications'])->name('api.notifications');
    Route::post('/api/notifications/mark-read', [\App\Http\Controllers\Apps\TransactionController::class, 'markNotificationsAsRead'])->name('api.notifications.mark-read');
    
    // Payment proof upload routes
    Route::get('/transactions/{invoice}/upload-proof', [\App\Http\Controllers\Apps\TransactionController::class, 'showUploadProof'])->name('transactions.upload-proof');
    Route::post('/transactions/{id}/store-proof', [\App\Http\Controllers\Apps\TransactionController::class, 'storePaymentProof'])->name('transactions.store-proof');

    //route transaction searchProduct
    Route::post('/transactions/searchProduct', [\App\Http\Controllers\Apps\TransactionController::class, 'searchProduct'])->name('transactions.searchProduct');

    //route transaction addToCart
    Route::post('/transactions/addToCart', [\App\Http\Controllers\Apps\TransactionController::class, 'addToCart'])->name('transactions.addToCart');

    //route transaction destroyCart
    Route::delete('/transactions/{cart_id}/destroyCart', [\App\Http\Controllers\Apps\TransactionController::class, 'destroyCart'])->name('transactions.destroyCart');

    //route transaction store
    Route::post('/transactions/store', [\App\Http\Controllers\Apps\TransactionController::class, 'store'])->name('transactions.store');
    Route::get('/transactions/{invoice}/print', [\App\Http\Controllers\Apps\TransactionController::class, 'print'])->name('transactions.print');

    // update transaction status (AJAX)
    Route::patch('/transactions/{id}/status', [\App\Http\Controllers\Apps\TransactionController::class, 'updateStatus'])->name('transactions.updateStatus');


    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/api/customer-transactions/{userId}', [ProfileController::class, 'getCustomerTransactions'])->name('profile.customer.transactions');
});

require __DIR__ . '/auth.php';
