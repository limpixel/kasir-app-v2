# 📊 Dokumentasi Aplikasi Kasir (Point of Sales)

## 📋 Daftar Isi
1. [Struktur Project](#struktur-project)
2. [Tech Stack](#tech-stack)
3. [Fitur Utama](#fitur-utama)
4. [Alur Kerja Sistem](#alur-kerja-sistem)
5. [Penjelasan Per Fitur](#penjelasan-per-fitur)

---

## 🏗️ Struktur Project

```
kasir-app/
├── app/                          # Logika aplikasi
│   ├── Http/
│   │   ├── Controllers/          # Mengatur permintaan HTTP
│   │   │   ├── Apps/            # Controller fitur utama
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── CustomerController.php
│   │   │   │   ├── ProductController.php
│   │   │   │   ├── TransactionController.php
│   │   │   │   └── SaleController.php
│   │   │   ├── UserController.php
│   │   │   ├── RoleController.php
│   │   │   ├── PermissionController.php
│   │   │   ├── ProfileController.php
│   │   │   └── FECheckoutController.php
│   │   ├── Middleware/           # Middleware untuk autentikasi & validasi
│   │   └── Requests/             # Form request validation
│   ├── Models/                   # Model basis data
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Category.php
│   │   ├── Customer.php
│   │   ├── Transaction.php
│   │   ├── TransactionDetail.php
│   │   ├── Cart.php
│   │   └── Profit.php
│   └── Providers/                # Service providers
│
├── database/                     # Database management
│   ├── migrations/              # Migrasi database
│   ├── seeders/                 # Data seeding
│   └── factories/               # Factory untuk testing
│
├── resources/                   # Frontend resources
│   ├── views/                   # View (Inertia React)
│   ├── js/                      # JavaScript/React components
│   └── css/                     # Stylesheet
│
├── routes/                      # Konfigurasi rute
│   ├── web.php                 # Web routes
│   ├── auth.php                # Auth routes
│   └── console.php             # Console routes
│
├── public/                      # Public assets
│   ├── storage/                # File uploads
│   ├── assets/
│   ├── css/
│   ├── js/
│   └── images/
│
├── storage/                     # Cache & logs
│   ├── app/                    # File storage
│   ├── framework/              # Cache files
│   └── logs/                   # Application logs
│
├── config/                      # Konfigurasi aplikasi
├── bootstrap/                   # Bootstrap aplikasi
├── docker/                      # Docker configuration
├── tests/                       # Unit & Feature tests
├── vendor/                      # Dependencies
│
├── docker-compose.yml          # Docker Compose config
├── Dockerfile                   # Docker image config
├── vite.config.js              # Vite bundler config
├── tailwind.config.js          # TailwindCSS config
├── package.json                # Node.js dependencies
└── composer.json               # PHP dependencies
```

---

## 🛠️ Tech Stack

### Backend
- **Laravel 11.x** - Framework PHP modern
- **Inertia.js** - Menghubungkan Laravel & React tanpa API
- **MySQL 8.0** - Database relasional
- **Redis** - Caching & session management
- **Spatie Laravel Permission** - Role & Permission management

### Frontend
- **React 18.2** - Library UI
- **TailwindCSS 3.2** - Utility-first CSS framework
- **Axios** - HTTP client
- **Headless UI** - Unstyled UI components
- **React Hot Toast** - Notification system
- **SweetAlert2** - Dialog notifications
- **JSBarcode** - Barcode generator
- **Dexie.js** - IndexedDB library untuk offline

### DevTools
- **Vite 5.0** - Build tool
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server
- **PHP 8.2** - Runtime environment

---

## ⭐ Fitur Utama

### 1. **Manajemen Produk**
- CRUD produk dengan kategori
- Upload gambar produk
- Barcode generator
- Tracking harga beli & jual
- Manajemen stok

### 2. **Transaksi/Penjualan (Checkout Process)**
- Checkout dengan cart system (di `/cart`)
- Pencarian produk real-time
- Multiple payment methods
- Diskon per transaksi
- Generate invoice & print receipt
- Perhitungan keuntungan otomatis

### 3. **Pencatat Transaksi (Transaction History)**
- Lihat history semua transaksi yang sudah di-checkout
- Search by invoice/customer/date
- Filter by cashier atau date range
- View detail & reprint invoice
- Analytics dashboard

### 3. **Manajemen Pelanggan**
- CRUD customer data
- Tracking riwayat pembelian
- Customer information management

### 4. **Manajemen Kategori**
- CRUD kategori produk
- Organisasi produk berdasarkan kategori

### 5. **User & Authentication**
- Registrasi & login
- Email verification
- Password reset
- Profile management
- Avatar upload

### 6. **Role & Permission Management**
- Multi-role system (Admin, Cashier, dll)
- Fine-grained permissions
- Dynamic role assignment

### 7. **Laporan & Analytics**
- Transaction history
- Profit tracking
- Dashboard overview

---

## 🔄 Alur Kerja Sistem

### Alur Autentikasi
```
User → Login → Middleware Auth Check → Dashboard/Admin Panel
```

### Alur Transaksi Penjualan
```
1. User masuk halaman checkout (/cart)
2. Cari & pilih produk (SearchProduct)
3. Produk ditambah ke cart (AddToCart)
4. Kelola cart (Edit qty, Remove item)
5. Input data pelanggan & diskon
6. Submit transaksi (Store) → Create transaction record
7. Generate invoice & print
8. Update stok & hitung keuntungan (Profit)
9. Transaksi tercatat di history (/dashboard/transactions)
```

### Alur Pencatatan Transaksi
```
Admin/Cashier → View /dashboard/transactions
              ↓
        List semua transaksi completed
              ↓
        Search, filter, sort
              ↓
        View detail transaksi
              ↓
        Reprint invoice jika perlu
```

### Alur Manajemen Data Master
```
Admin → CRUD Operations (Create, Read, Update, Delete) → Database
        ↓
      Validasi Input
      ↓
      Simpan/Update/Hapus
      ↓
      Response ke Frontend
```

---

## 📱 Penjelasan Per Fitur

### 🛍️ 1. FITUR PRODUK (Product Management)

#### Database Schema
```
products table:
- id (Primary Key)
- image (URL gambar produk)
- barcode (Unique identifier)
- title (Nama produk)
- description (Deskripsi)
- buy_price (Harga beli)
- sell_price (Harga jual)
- category_id (Foreign Key ke categories)
- stock (Jumlah stok tersedia)
- created_at, updated_at
```

#### Relasi Model
```php
Product → Category (Many-to-One)
Product → TransactionDetail (One-to-Many)
```

#### Routes
```
GET    /dashboard/products           # List semua produk
GET    /dashboard/products/create    # Form tambah produk
POST   /dashboard/products           # Simpan produk baru
GET    /dashboard/products/{id}/edit # Form edit produk
PUT    /dashboard/products/{id}      # Update produk
DELETE /dashboard/products/{id}      # Hapus produk
```

#### Workflow
1. **Create Produk**
   - Admin input data (nama, harga, stok, kategori)
   - Upload gambar produk
   - Generate barcode otomatis
   - Simpan ke database

2. **Read Produk**
   - Tampilkan list produk dengan pagination
   - Filter berdasarkan kategori
   - Pencarian produk

3. **Update Produk**
   - Edit data produk
   - Update gambar
   - Adjust harga & stok

4. **Delete Produk**
   - Hapus produk dari database
   - Automatic cascade jika ada relasi

---

### 📂 2. FITUR KATEGORI (Category Management)

#### Database Schema
```
categories table:
- id (Primary Key)
- name (Nama kategori)
- description (Deskripsi)
- created_at, updated_at
```

#### Relasi Model
```php
Category → Product (One-to-Many)
```

#### Routes
```
GET    /dashboard/categories         # List kategori
GET    /dashboard/categories/create  # Form tambah
POST   /dashboard/categories         # Simpan
GET    /dashboard/categories/{id}/edit # Form edit
PUT    /dashboard/categories/{id}    # Update
DELETE /dashboard/categories/{id}    # Hapus
```

#### Workflow
- Simple CRUD untuk manage kategori produk
- Setiap kategori dapat memiliki banyak produk
- Soft delete support (optional)

---

### 👥 3. FITUR PELANGGAN (Customer Management)

#### Database Schema
```
customers table:
- id (Primary Key)
- name (Nama pelanggan)
- phone (No. telepon)
- email (Email)
- address (Alamat)
- created_at, updated_at
```

#### Relasi Model
```php
Customer → Transaction (One-to-Many)
```

#### Routes
```
GET    /dashboard/customers          # List pelanggan
GET    /dashboard/customers/create   # Form tambah
POST   /dashboard/customers          # Simpan
GET    /dashboard/customers/{id}/edit # Form edit
PUT    /dashboard/customers/{id}     # Update
DELETE /dashboard/customers/{id}     # Hapus
```

#### Workflow
- CRUD customer data
- Track semua transaksi customer
- Search & filter customer

---

### 🧾 4. FITUR TRANSAKSI (Transaction History/Pencatat Transaksi)

#### Deskripsi
Fitur transaksi berfungsi sebagai **history/log pencatat transaksi yang sudah dilakukan**. User dapat melihat detail semua transaksi yang telah di-checkout, namun tidak dapat melakukan proses checkout di halaman ini. Proses checkout dilakukan di fitur **Cart (Frontend Checkout)**.

#### Database Schema
```
transactions table:
- id (Primary Key)
- cashier_id (Foreign Key ke users - siapa yang kasir)
- customer_id (Foreign Key ke customers)
- invoice (Nomor invoice unik)
- cash (Jumlah uang yang diterima)
- change (Kembalian)
- discount (Diskon total)
- grand_total (Total harga akhir)
- created_at, updated_at

transaction_details table:
- id (Primary Key)
- transaction_id (Foreign Key ke transactions)
- product_id (Foreign Key ke products)
- quantity (Jumlah item)
- price (Harga per item saat transaksi)
- subtotal (quantity × price)
- created_at, updated_at
```

#### Relasi Model
```php
Transaction → TransactionDetail (One-to-Many)
Transaction → Customer (Many-to-One)
Transaction → User/Cashier (Many-to-One)
Transaction → Profit (One-to-Many)
```

#### Routes
```
GET    /dashboard/transactions               # List semua transaksi yang sudah di-checkout
GET    /dashboard/transactions/{invoice}/print # Print/view detail invoice
```

#### Workflow

##### Step 1: Tampilkan History Transaksi
```
- Load semua data transaction dari database
- Eager load dengan customer & cashier info
- Paginate hasil (misal 20 per halaman)
- Tampilkan dalam bentuk tabel dengan kolom:
  * Invoice number
  * Customer name
  * Cashier name
  * Grand total
  * Diskon
  * Cash received
  * Kembalian (change)
  * Tanggal & waktu transaksi
  * Action buttons (View Detail, Print)
```

##### Step 2: Filter & Search
```
- Search by invoice number
- Filter by date range
- Filter by customer
- Filter by cashier
- Sort by tanggal (newest/oldest)
```

##### Step 3: View Detail Transaksi
```
GET /dashboard/transactions/{invoice}/print
- Query transaction berdasarkan invoice number
- Load transaction_details dengan product info
- Display detail breakdown:
  * Invoice number & tanggal
  * Customer info (nama, phone, address)
  * Cashier info
  * Item-by-item breakdown (produk, qty, harga, subtotal)
  * Diskon
  * Grand total
  * Payment info (cash, change)
  * Calculated profit per item & total
```

##### Step 4: Print Invoice
```
- Generate formatted receipt/invoice untuk print
- Include semua detail transaksi
- Barcode invoice (optional)
- POS printer format (80mm thermal printer compatible)
- Browser print dialog untuk user
```

##### Step 5: Analytics/Reporting
```
- Total transaksi hari ini
- Total revenue hari ini
- Total profit hari ini
- Top products (paling banyak terjual)
- Top customers (paling sering beli)
```

---

### 💰 5. FITUR PROFIT TRACKING

#### Database Schema
```
profits table:
- id (Primary Key)
- transaction_id (Foreign Key)
- product_id (Foreign Key)
- profit_amount (Harga jual - Harga beli)
- quantity (Jumlah terjual)
- total_profit (profit_amount × quantity)
- created_at, updated_at
```

#### Workflow
- Setiap kali transaksi selesai, otomatis hitung keuntungan
- Profit = (sell_price - buy_price) × quantity
- Track profit per produk dan per transaksi
- Laporan profit history

---

### 👤 6. FITUR USER & AUTHENTICATION

#### Database Schema
```
users table:
- id (Primary Key)
- name (Nama user)
- email (Email unik)
- password (Password terenkripsi)
- avatar (URL avatar)
- email_verified_at (Timestamp verifikasi)
- remember_token (Token remember me)
- created_at, updated_at
```

#### Routes
```
GET/POST   /register              # Registrasi user
GET/POST   /login                 # Login
POST       /logout                # Logout
GET/PATCH  /profile               # Edit profile
DELETE     /profile               # Delete account
```

#### Workflow
1. **Registrasi**
   - Input email & password
   - Validasi email belum terdaftar
   - Encrypt password
   - Send email verification
   - Create user record

2. **Login**
   - Input email & password
   - Validasi credentials
   - Check email verified
   - Create session/token
   - Redirect ke dashboard

3. **Profile Management**
   - View profile info
   - Update nama, email, avatar
   - Change password
   - Delete account

---

### 🔐 7. FITUR ROLE & PERMISSION

#### Database Schema
```
roles table:
- id, name, guard_name, created_at, updated_at

permissions table:
- id, name, guard_name, created_at, updated_at

model_has_roles table:
- role_id, model_id, model_type

role_has_permissions table:
- permission_id, role_id
```

#### Routes
```
GET    /dashboard/roles             # List roles
POST   /dashboard/roles             # Create role
PUT    /dashboard/roles/{id}        # Update role
DELETE /dashboard/roles/{id}        # Delete role

GET    /dashboard/permissions       # List permissions
```

#### Workflow
1. **Create Role**
   - Input nama role (Admin, Cashier, Manager)
   - Assign permissions ke role
   - Simpan role

2. **Assign Role to User**
   - Di user management, pilih role
   - User inherit semua permission dari role
   - Update middleware untuk check permissions

3. **Permission Check**
   - Middleware validate user memiliki permission
   - Return 403 jika tidak authorized
   - Log unauthorized access attempts

---

### 🛒 8. FITUR CART (Frontend Checkout/Point of Sales)

#### Deskripsi
Fitur cart adalah **proses checkout/point of sales** dimana user (cashier) dapat:
- Mencari produk
- Menambah produk ke cart
- Mengelola qty & item di cart
- Input diskon & info customer
- Submit transaksi
- Generate & print invoice

Proses ini akan membuat record di tabel `transactions` dan `transaction_details`.

#### Database Tables
```
carts table (temporary):
- id (Primary Key)
- session_id (Session user)
- product_id (Foreign Key ke products)
- quantity (Jumlah)
- created_at, updated_at

transactions table (after checkout):
- id, cashier_id, customer_id, invoice, cash, change, discount, grand_total
- created_at, updated_at

transaction_details table (after checkout):
- id, transaction_id, product_id, quantity, price, subtotal
- created_at, updated_at
```

#### Routes
```
GET    /cart                              # Tampilkan halaman cart/checkout
POST   /cart/add                          # Add item ke cart
DELETE /cart/{id}                         # Remove item dari cart
DELETE /cart                              # Clear semua cart

# Backend routes (bisa dipindah ke transaction controller jika perlu)
POST   /transactions/searchProduct        # Cari produk
POST   /transactions/addToCart            # Tambah ke cart (alt endpoint)
DELETE /transactions/{cart_id}/destroyCart # Hapus dari cart (alt endpoint)
POST   /transactions/store                # Submit transaksi & create record
GET    /transactions/{invoice}/print      # Print invoice setelah checkout
```

#### Step-by-Step Workflow

##### Step 1: Buka Halaman Checkout
```
GET /cart
- Tampilkan daftar produk (kategori, search bar)
- Tampilkan cart items saat ini (dari session/IndexedDB)
- Tampilkan form customer selection
- Tampilkan form diskon & payment
```

##### Step 2: Search Product
```
POST /transactions/searchProduct
Input: {query: "nama produk atau barcode"}

Backend:
- Query products where title LIKE '%query%' OR barcode = query
- Return hasil dengan product details (nama, harga, stok)
- Frontend tampilkan hasil search
```

##### Step 3: Add to Cart
```
POST /cart/add (atau POST /transactions/addToCart)
Input: {product_id, quantity}

Backend:
1. Validasi stok: if (product.stock < quantity) return error
2. Cek apakah product sudah di cart:
   - Jika ada: update quantity
   - Jika belum: insert baru ke carts table
3. Return updated cart dengan total harga
```

##### Step 4: Manage Cart
```
Frontend cart management:
- Lihat semua items dengan detail (nama, harga, qty, subtotal)
- Edit quantity per item
- Remove item dengan DELETE /cart/{cart_id}
- Real-time calculation: total = sum(subtotal)
```

##### Step 5: Input Checkout Details
```
Form input:
- Pilih Customer (dropdown atau form tambah baru)
- Input Diskon (nominal Rp atau %)
- Input Jumlah Uang (cash)
- Auto calculate kembalian (change = cash - grand_total)
- Validasi cash >= grand_total after diskon
```

##### Step 6: Submit Transaksi
```
POST /transactions/store
Input: {
  customer_id,
  discount (nominal),
  cash,
  cart_items: [{product_id, quantity, price}, ...]
}

Backend Process:
1. Validasi semua data (customer, items, cash)
2. Hitung totals:
   - subtotal_items = sum(price × qty per item)
   - grand_total = subtotal_items - discount
   - change = cash - grand_total
3. Generate invoice number (format: INV-YYYYMMDD-XXXXX)
4. Create transaction record
5. Loop setiap item di cart:
   - Create transaction_detail (product_id, qty, price, subtotal)
   - Decrement product stock: product.stock -= qty
   - Calculate profit: profit_amount = sell_price - buy_price
   - Create profit record: total_profit = profit_amount × qty
6. Clear cart dari session/IndexedDB
7. Return success + invoice_number + transaction_id
8. Frontend redirect ke print page atau show receipt modal
```

##### Step 7: Print Invoice
```
GET /transactions/{invoice}/print
- Load transaction dengan relasi details.product & customer
- Format untuk POS receipt (80mm thermal):
  * Header (nama toko, logo)
  * Invoice: INV-XXXXX | Tanggal: DD/MM/YYYY HH:mm
  * Cashier: nama cashier
  * Customer: nama customer (if ada)
  * ---
  * Items breakdown:
    Product Name          Qty  Price    Subtotal
    Item 1               2x   50.000   100.000
    Item 2               1x   100.000  100.000
  * ---
  * Subtotal:                          200.000
  * Diskon:                           (10.000)
  * Grand Total:                       190.000
  * Cash:                              200.000
  * Change:                            10.000
  * ---
  * Profit: 35.000
  * ---
  * Terima kasih!
  
- Browser print dialog (CTRL+P)
```

##### Step 8: Integration dengan Transaction History
```
Setelah checkout selesai & invoice di-print:
- Transaction sudah tersimpan di database
- User bisa lihat di "Transaction History" page
- Data sinkron untuk analytics & reporting
```

---

## 📊 Alur Data Flow Per Fitur

### Alur Transaksi Penjualan Lengkap (Cart → Transaction Recording)

```
┌─────────────────────────┐
│ Checkout Page (/cart)   │
│  Point of Sales View    │
└────────┬────────────────┘
         │
         ├─→ [Search Product] ──POST /transactions/searchProduct──→ Backend search
         │                                                          ↓
         │                                    Return filtered products
         │
         ├─→ [Add to Cart] ──POST /cart/add──→ Validate stok ──→ Save to carts table
         │                                      ↓
         │                              Return updated cart
         │
         ├─→ [Manage Cart Items]
         │  ├─→ View all items, qty, price
         │  └─→ Remove item ──DELETE /cart/{id}──→ Update cart
         │
         ├─→ [Input Checkout Details]
         │  ├─→ Select Customer
         │  ├─→ Input Diskon
         │  ├─→ Input Cash Amount
         │  └─→ Auto calculate Change
         │
         ├─→ [Submit Transaksi] ──POST /transactions/store──→ Backend Process:
         │                              │
         │                              ├─→ Validate data
         │                              ├─→ Calculate totals
         │                              ├─→ Generate invoice number
         │                              ├─→ Create transaction record
         │                              ├─→ Create transaction_details (per item)
         │                              ├─→ Update stok produk (decrement)
         │                              ├─→ Calculate & save profit
         │                              ├─→ Clear cart
         │                              └─→ Return success + invoice
         │
         └─→ [Print Invoice] ──GET /transactions/{invoice}/print──→ Format receipt
                                                                      ↓
                                                          Browser print dialog

┌─────────────────────────────────────────────────┐
│ Transaction History Page                        │
│ (/dashboard/transactions)                       │
│ - List semua transaksi yang sudah di-checkout  │
│ - Filter, search, analytics                    │
│ - View detail & reprint invoice                │
└─────────────────────────────────────────────────┘
```

### Comparison: Old Flow vs New Flow

**OLD (Transaksi = Checkout Process):**
```
/dashboard/transactions
├─ Search product
├─ Add to cart
├─ Checkout (create transaction)
└─ Print invoice
```

**NEW (Separated Concerns):**
```
/cart (Frontend Checkout Process)
├─ Search product
├─ Add to cart
├─ Checkout (create transaction)
└─ Print invoice
     ↓
/dashboard/transactions (Transaction History Only)
├─ List all completed transactions
├─ Search by invoice/date/customer
├─ View detail & reprint invoice
└─ Analytics & reporting
```

### Alur CRUD Produk

```
┌──────────────────┐
│ Admin Dashboard  │
│ Product Manager  │
└────────┬─────────┘
         │
         ├─→ [List Products]
         │     └─→ Query products + category + paginate ──→ Display table
         │
         ├─→ [Create Product]
         │     ├─→ Show form
         │     ├─→ Upload image ──→ Save ke /storage/products
         │     ├─→ Generate barcode
         │     ├─→ POST /products ──→ Validate & Save
         │     └─→ Success message
         │
         ├─→ [Update Product]
         │     ├─→ Load product data
         │     ├─→ Update form fields
         │     ├─→ PUT /products/{id} ──→ Validate & Update
         │     └─→ Success message
         │
         └─→ [Delete Product]
               ├─→ Confirm dialog
               ├─→ DELETE /products/{id}
               └─→ Remove from list
```

---

## 🔑 Key Concepts

### 1. **Middleware Authorization**
```php
// Protect dashboard routes
Route::group(['middleware' => ['auth']], function () {
    // Only authenticated users can access
});

// Role-based access
@can('view transactions')
    // Display transaction link
@endcan
```

### 2. **Validation**
```php
// Input validation di request class
$validated = $request->validated();

// Business logic validation di controller
if ($product->stock < $quantity) {
    return response()->json(['error' => 'Stok tidak cukup'], 422);
}
```

### 3. **Relationship Loading**
```php
// Eager load untuk optimize query
$transactions = Transaction::with(['customer', 'details.product'])->get();
```

### 4. **Attribute Casting**
```php
// Auto format data saat retrieve
protected $casts = [
    'email_verified_at' => 'datetime',
];
```

---

## 🚀 Cara Menjalankan Aplikasi

### Dengan Docker (Recommended)
```bash
# 1. Setup awal
./docker-setup.sh

# 2. Jalankan services
docker-compose up -d

# 3. Access aplikasi
# - Frontend: http://localhost:8000
# - MySQL: localhost:3306
# - Redis: localhost:6379
```

### Tanpa Docker
```bash
# 1. Install dependencies
composer install
npm install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Konfigurasi database di .env

# 4. Migrate & seed
php artisan migrate --seed

# 5. Link storage
php artisan storage:link

# 6. Run development server
php artisan serve
npm run dev
```

---

## 📝 File Penting

| File | Fungsi |
|------|--------|
| `routes/web.php` | Mendefinisikan semua routes |
| `app/Models/*` | Model & relasi database |
| `app/Http/Controllers/*` | Business logic & request handling |
| `database/migrations/*` | Schema database |
| `resources/js/*` | React components |
| `config/auth.php` | Authentication config |
| `config/permission.php` | Role & permission config |

---

## ✅ Kesimpulan

Aplikasi Kasir ini adalah sistem Point of Sales modern yang menggabungkan:
- **Backend robust** dengan Laravel 11
- **Frontend modern** dengan React & TailwindCSS
- **Database terstruktur** dengan relasi antar entitas
- **Security layer** dengan authentication & authorization
- **User experience** dengan real-time validation & feedback

Setiap fitur dirancang untuk mendukung operasional toko dengan efisien, dari inventory management hingga financial tracking.

---

**Last Updated:** January 2026
**Version:** 2.0
