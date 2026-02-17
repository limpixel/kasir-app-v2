<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id', 'cashier_id', 'customer_id',
        'customer_name', 'customer_phone', 'customer_address',
        'province', 'city', 'district', 'ward', 'shipping_cost',
        'payment_method', 'status', 'payment_status', 'payment_details',
        'invoice', 'cash', 'change',
        'discount', 'grand_total',
        'order_status', 'order_date', 'shipping_date', 'delivered_date', 'cancelled_date',
        'notes', 'customer_notes',
        'payment_proof', 'payment_proof_uploaded_at'
    ];

    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function profits()
    {
        return $this->hasMany(Profit::class);
    }

    protected function createdAt(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Carbon::parse($value)->format('d-M-Y H:i:s'),
        );
    }
    
    protected $casts = [
        'payment_details' => 'array', // Untuk menghandle field json
    ];
}
