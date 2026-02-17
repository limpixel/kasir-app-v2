<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Ubah kolom status untuk mendukung lebih banyak status
            $table->string('status', 50)->change();
            
            // Tambahkan kolom baru untuk manajemen transaksi yang lebih baik
            $table->string('order_status', 50)->default('pending')->after('status'); // pending, processing, shipping, delivered, cancelled
            $table->date('order_date')->nullable()->after('order_status');
            $table->date('shipping_date')->nullable()->after('order_date');
            $table->date('delivered_date')->nullable()->after('shipping_date');
            $table->date('cancelled_date')->nullable()->after('delivered_date');
            $table->text('notes')->nullable()->after('cancelled_date'); // Catatan internal
            $table->text('customer_notes')->nullable()->after('notes'); // Catatan dari customer
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'order_status',
                'order_date',
                'shipping_date',
                'delivered_date',
                'cancelled_date',
                'notes',
                'customer_notes',
            ]);
            
            // Kembalikan kolom status ke enum
            $table->enum('status', ['unpaid', 'paid', 'sending', 'accepted'])->change();
        });
    }
};
