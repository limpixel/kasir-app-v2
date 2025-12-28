<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    
    public function index()
    {
        $permissions = Permission::query()
            ->when(request()->search, fn($query) 
            => $query->where('name', 'like', '%' . request()
            ->search . '%'))
            ->select('id', 'name')
            ->latest()
            ->paginate(7)
            ->withQueryString();

        // render view
        return Inertia::render('Dashboard/Permissions/Index', [
            'permissions' => $permissions
        ]);
    }

}
