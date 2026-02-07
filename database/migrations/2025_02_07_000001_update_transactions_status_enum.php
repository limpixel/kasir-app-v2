<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Modify status enum to match required values
        // Using raw statement for MySQL. Adjust if using different DB.
        DB::statement("ALTER TABLE `transactions` MODIFY `status` ENUM('unpaid','paid','sending','accepted') NOT NULL DEFAULT 'unpaid'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE `transactions` MODIFY `status` ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'pending'");
    }
};
