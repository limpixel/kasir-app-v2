# 📤 Panduan Deploy ke RumahWeb.com (Cara Manual - ZIP File)

Panduan **LENGKAP** dan **SIMPEL** untuk deploy aplikasi **KasirApp (Point of Sales)** ke hosting RumahWeb.com menggunakan metode **ZIP File** via cPanel.

> ✅ **Metode ini cocok untuk pemula** - Tidak perlu SSH, tidak perlu terminal!

---

## 📋 Daftar Isi

1. [Persiapan di Komputer Lokal](#1-persiapan-di-komputer-lokal)
2. [Upload ZIP ke RumahWeb](#2-upload-zip-ke-rumahweb)
3. [Setup Database](#3-setup-database)
4. [Konfigurasi .env](#4-konfigurasi-env)
5. [Install Composer & Build](#5-install-composer--build)
6. **PENTING:** [Setup Storage & Migrate](#6-setup-storage--migrate)
7. [Aktivasi SSL](#7-aktivasi-ssl)
8. [Testing](#8-testing)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Persiapan di Komputer Lokal

### Langkah 1: Build Project

Buka terminal/command prompt di folder project `kasir-app`:

```bash
# Install dependencies
composer install --optimize-autoloader --no-dev

# Build frontend (React + Vite)
npm install
npm run build
```

Tunggu hingga selesai. File `public/build` akan dibuat otomatis.

---

### Langkah 2: Hapus Folder Besar

Hapus folder berikut untuk mengurangi ukuran ZIP:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force vendor
Remove-Item -Recurse -Force .git
Remove-Item -Recurse -Force tests
Remove-Item -Recurse -Force storage\logs
Remove-Item -Recurse -Force storage\framework\cache
Remove-Item -Recurse -Force storage\framework\sessions
Remove-Item -Recurse -Force storage\framework\views

# Mac/Linux
rm -rf node_modules vendor .git tests storage/logs/* storage/framework/cache/* storage/framework/sessions/* storage/framework/views/*
```

---

### Langkah 3: Compress ke ZIP

**Windows:**
1. Select semua file & folder di `kasir-app`
2. Klik kanan → **Send to** → **Compressed (zipped) folder**
3. Nama file: `kasir-app.zip`

**Mac:**
1. Select semua file & folder
2. Klik kanan → **Compress**
3. Rename jadi `kasir-app.zip`

**Ukuran ideal:** 20-50 MB

---

## 2. Upload ZIP ke RumahWeb

### Langkah 1: Login ke cPanel

1. Buka browser
2. Akses: `https://namadomain.com/cpanel`
3. Masukkan username & password dari email aktivasi RumahWeb

---

### Langkah 2: Buka File Manager

1. Di halaman cPanel, cari section **FILES**
2. Klik icon **File Manager**

![File Manager](https://i.imgur.com/example1.png)

---

### Langkah 3: Navigate ke public_html

1. Di sidebar kiri, klik **public_html** (atau **htdocs**)
2. Jika ada file default, hapus atau rename saja

---

### Langkah 4: Upload File ZIP

1. Klik tombol **Upload** (icon panah ke atas di toolbar)
2. Klik **Select File**
3. Pilih file `kasir-app.zip` dari komputer
4. Tunggu hingga progress bar 100%
5. Klik **Go Back**

---

### Langkah 5: Extract ZIP

1. Klik kanan pada `kasir-app.zip`
2. Pilih **Extract**
3. Confirm dengan klik **Extract File(s)**
4. Tunggu hingga selesai
5. Klik **Close**

---

### Langkah 6: Pindahkan ke Root (Jika Perlu)

Jika file ter-extract ke dalam subfolder (misal: `kasir-app/`):

1. Buka folder tersebut
2. **Select All** (klik checkbox paling atas)
3. Klik **Move** di toolbar
4. Ketik: `/public_html/`
5. Klik **Move Files**

---

## 3. Setup Database

### Langkah 1: Buat Database

1. Kembali ke halaman utama cPanel
2. Di section **DATABASES**, klik **MySQL Databases**

![MySQL Databases](https://i.imgur.com/example2.png)

3. Scroll ke **Create a new database**
4. Ketik nama: `kasir` (akan jadi `username_kasir`)
5. Klik **Create Database**

---

### Langkah 2: Buat User Database

1. Scroll ke **MySQL Users**
2. Klik **Create a new user**
3. Isi:
   - **Username:** `admin` (akan jadi `username_admin`)
   - **Password:** `PasswordKuat123!` (gunakan password generator)
4. Klik **Create User**

---

### Langkah 3: Assign User ke Database

1. Scroll ke **Add User To Database**
2. Pilih:
   - **User:** `username_admin`
   - **Database:** `username_kasir`
3. Klik **Add**
4. Centang **ALL PRIVILEGES**
5. Klik **Make Changes**

✅ Database siap!

---

### Langkah 4: Catat Informasi Database

Simpan di notepad:

```
DB_HOST=localhost
DB_DATABASE=username_kasir
DB_USERNAME=username_admin
DB_PASSWORD=PasswordKuat123!
```

---

## 4. Konfigurasi .env

### Langkah 1: Edit File .env

1. Kembali ke **File Manager**
2. Navigate ke folder project di `public_html`
3. Cari file `.env`
4. Klik kanan → **Edit**
5. Klik **Edit** lagi di popup confirm

---

### Langkah 2: Update Konfigurasi

Ganti bagian berikut:

```env
APP_NAME=KasirApp
APP_ENV=production
APP_DEBUG=false
APP_URL=https://namadomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=username_kasir
DB_USERNAME=username_admin
DB_PASSWORD=PasswordKuat123!

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

> ⚠️ **PENTING:**
> - Ganti `namadomain.com` dengan domain Anda
> - Ganti `username_kasir` dan `username_admin` sesuai database
> - Set `APP_DEBUG=false` untuk keamanan!

---

### Langkah 3: Save

1. Klik **Save Changes**
2. Klik **Close**

---

## 5. Install Composer & Build

### Opsi A: Jika Hosting Support Terminal/cPanel SSH

1. Di cPanel, cari **Terminal** atau **SSH Access**
2. Klik dan tunggu koneksi
3. Jalankan perintah berikut:

```bash
cd public_html

# Install composer dependencies
composer install --optimize-autoloader --no-dev

# Jika perlu build ulang
npm run build
```

---

### Opsi B: Jika Hosting TIDAK Support Terminal (PALING UMUM)

#### Langkah 1: Install Composer di Komputer Lokal

Di komputer Anda:

```bash
composer install --optimize-autoloader --no-dev
```

Tunggu hingga selesai. Folder `vendor` akan dibuat.

---

#### Langkah 2: Upload Folder Vendor

1. Download **FileZilla** dari https://filezilla-project.org/
2. Install dan buka FileZilla
3. Isi koneksi:
   - **Host:** `ftp.namadomain.com`
   - **Username:** username cPanel
   - **Password:** password cPanel
   - **Port:** 21
4. Klik **Quickconnect**

---

#### Langkah 3: Upload via FileZilla

1. **Panel Kiri (Local):** Navigate ke folder `kasir-app/vendor`
2. **Panel Kanan (Remote):** Navigate ke `public_html`
3. Drag folder `vendor` dari kiri ke kanan
4. Tunggu upload selesai (30-60 menit)

![FileZilla Upload](https://i.imgur.com/example3.png)

---

#### Langkah 4: Upload public/build

Jika `npm run build` sudah dijalankan di lokal:

1. Di FileZilla, navigate ke `kasir-app/public/build`
2. Upload folder `build` ke `public_html/public/`

---

## 6. Setup Storage & Migrate

### Langkah 1: Buat Folder Storage Link

Karena tidak bisa pakai `php artisan storage:link`, kita buat manual:

1. Di **File Manager**, navigate ke `storage/app/public`
2. **Select All** file di dalamnya
3. **Copy** file-file tersebut
4. Navigate ke `public/storage`
5. **Paste** file-file tersebut

Jika folder `public/storage` belum ada, buat folder baru bernama `storage` di dalam `public/`.

---

### Langkah 2: Set Permissions

1. Di File Manager, klik kanan folder **storage**
2. Pilih **Change Permissions**
3. Set ke **755** atau **775**
4. Klik **Change Permissions**

Lakukan hal yang sama untuk folder **bootstrap/cache**.

---

### Langkah 3: Jalankan Migration (Via Web)

Karena tidak ada terminal, kita buat script PHP:

#### Buat File migrate.php

1. Di File Manager, klik **+ File**
2. Nama file: `migrate.php`
3. Lokasi: `/public_html/migrate.php`
4. Klik **Create New File**

---

#### Edit migrate.php

Klik kanan `migrate.php` → **Edit**, lalu paste code ini:

```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "<h2>Running Migrations...</h2>";
echo "<pre>";

echo "Step 1: Clearing cache...\n";
Artisan::call('config:clear');
Artisan::call('cache:clear');
echo Artisan::output();

echo "Step 2: Running migrations...\n";
Artisan::call('migrate', ['--force' => true]);
echo Artisan::output();

echo "Step 3: Seeding database...\n";
Artisan::call('db:seed', ['--force' => true]);
echo Artisan::output();

echo "Step 4: Creating storage link...\n";
try {
    Artisan::call('storage:link');
    echo Artisan::output();
} catch (\Exception $e) {
    echo "Storage link already exists or error: " . $e->getMessage() . "\n";
}

echo "\n";
echo "==========================================\n";
echo "✅ MIGRATION COMPLETED SUCCESSFULLY!\n";
echo "==========================================\n";
echo "\n";
echo "⚠️ PENTING: HAPUS FILE migrate.php SETELAH INI!\n";

echo "</pre>";
?>
```

---

#### Jalankan Migration

1. Save file `migrate.php`
2. Buka browser
3. Akses: `https://namadomain.com/migrate.php`
4. Tunggu hingga muncul pesan **✅ MIGRATION COMPLETED SUCCESSFULLY!**
5. **SEGERA HAPUS FILE `migrate.php`** dari File Manager untuk keamanan!

---

## 7. Aktivasi SSL

### Langkah 1: Aktifkan SSL di cPanel

1. Kembali ke halaman utama cPanel
2. Di section **SECURITY**, cari **SSL/TLS Status** atau **Let's Encrypt**
3. Klik icon tersebut

---

### Langkah 2: Run AutoSSL

1. Pilih domain Anda (centang checkbox)
2. Klik **Run AutoSSL** atau **Issue Certificate**
3. Tunggu 5-10 menit
4. Refresh halaman hingga status menunjukkan **Secure** ✅

---

### Langkah 3: Force HTTPS Redirect

1. Di **File Manager**, navigate ke `public_html`
2. Cari file `.htaccess`
3. Klik kanan → **Edit**
4. Tambahkan code ini di paling atas:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

5. **Save Changes**

---

## 8. Testing

### Langkah 1: Akses Aplikasi

1. Buka browser (mode Incognito/Private)
2. Akses: `https://namadomain.com`
3. Halaman login harus muncul

---

### Langkah 2: Login

Gunakan default credentials:

- **Email:** `admin@sniffy.com`
- **Password:** `password`

---

### Langkah 3: Test Fitur

1. ✅ Login berhasil
2. ✅ Dashboard muncul
3. ✅ Menu Produk, Kategori, Customer terlihat
4. ✅ Transaksi bisa diakses
5. ✅ Upload gambar berfungsi

---

## 9. Troubleshooting

### ❌ Error 500 - Internal Server Error

**Penyebab:** Permission atau cache bermasalah

**Solusi:**

1. Buat file `fix.php` di File Manager:

```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "Fixing...\n\n";

echo "1. Clear config cache...\n";
Artisan::call('config:clear');
echo Artisan::output();

echo "2. Clear application cache...\n";
Artisan::call('cache:clear');
echo Artisan::output();

echo "3. Clear route cache...\n";
Artisan::call('route:clear');
echo Artisan::output();

echo "4. Clear view cache...\n";
Artisan::call('view:clear');
echo Artisan::output();

echo "\n✅ DONE! Refresh halaman Anda.\n";
echo "⚠️ HAPUS FILE fix.php SETELAH INI!\n";
?>
```

2. Akses: `https://namadomain.com/fix.php`
3. Hapus file `fix.php` setelah selesai

---

### ❌ Error: SQLSTATE[HY000] [2002] Connection refused

**Penyebab:** Database connection salah

**Solusi:**
1. Edit `.env`
2. Pastikan:
   - `DB_HOST=localhost`
   - `DB_DATABASE=username_kasir` (sesuai database)
   - `DB_USERNAME=username_admin` (sesuai user)
   - `DB_PASSWORD=...` (password yang benar)
3. Clear cache via `fix.php` di atas

---

### ❌ Error: Class 'PDO' not found

**Penyebab:** PHP Extension PDO tidak aktif

**Solusi:**
1. Di cPanel, cari **Select PHP Version**
2. Klik **Extensions**
3. Centang `pdo_mysql`
4. Save

---

### ❌ Error: The requested URL was not found on this server

**Penyebab:** `.htaccess` bermasalah

**Solusi:**
1. Pastikan file `.htaccess` ada di root folder
2. Isi `.htaccess` dengan:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

### ❌ Error: storage/logs/laravel.log not writable

**Penyebab:** Permission folder storage salah

**Solusi:**
1. Di File Manager, klik kanan folder **storage**
2. **Change Permissions**
3. Set ke **775** atau **777**
4. Lakukan juga untuk **bootstrap/cache**

---

### ❌ Halaman Blank Putih

**Penyebab:** Error tapi `APP_DEBUG=false`

**Solusi:**
1. Edit `.env`
2. Set `APP_DEBUG=true` (sementara!)
3. Refresh halaman untuk lihat error
4. Setelah fixed, set kembali `APP_DEBUG=false`

---

## ✅ Checklist Deploy

Centang setiap langkah yang sudah selesai:

- [ ] Build project di lokal (`npm run build`)
- [ ] Install composer di lokal (`composer install --no-dev`)
- [ ] Hapus folder besar (node_modules, vendor, .git, tests)
- [ ] Compress ke ZIP
- [ ] Upload ZIP ke cPanel File Manager
- [ ] Extract ZIP
- [ ] Pindahkan ke root (jika perlu)
- [ ] Buat database di cPanel
- [ ] Buat user database
- [ ] Assign user ke database dengan ALL PRIVILEGES
- [ ] Edit file `.env` (database, APP_URL, APP_DEBUG=false)
- [ ] Upload folder `vendor` via FileZilla
- [ ] Upload folder `public/build` via FileZilla
- [ ] Copy file dari `storage/app/public` ke `public/storage`
- [ ] Set permissions folder `storage` dan `bootstrap/cache`
- [ ] Buat dan jalankan `migrate.php`
- [ ] Hapus `migrate.php` setelah selesai
- [ ] Aktivasi SSL di cPanel
- [ ] Edit `.htaccess` untuk force HTTPS
- [ ] Test login ke aplikasi
- [ ] Hapus `fix.php` jika sudah tidak perlu

---

## 🎉 Selamat!

Aplikasi **KasirApp** Anda sudah **LIVE** di RumahWeb!

---

## 📞 Butuh Bantuan?

### RumahWeb Support
- **Live Chat:** 24/7 di https://www.rumahweb.com/
- **Ticket:** Via client area
- **Phone:** (021) 3141 999

### Dokumentasi Tambahan
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [cPanel Documentation](https://docs.cpanel.net/)

---

**Good luck! 🚀**
