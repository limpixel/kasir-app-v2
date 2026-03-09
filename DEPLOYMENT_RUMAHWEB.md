# 📤 Panduan Hosting di RumahWeb.com

Panduan lengkap untuk deploy aplikasi **KasirApp (Point of Sales)** ke hosting RumahWeb.com.

---

## 📋 Daftar Isi

- [Persyaratan Sistem](#persyaratan-sistem)
- [Persiapan File Project](#persiapan-file-project)
- [Upload File ke Hosting](#upload-file-ke-hosting)
- [Setup Database](#setup-database)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Install Dependencies](#install-dependencies)
- [Setup Storage & Permissions](#setup-storage--permissions)
- [Build Frontend Assets](#build-frontend-assets)
- [Setup SSL/HTTPS](#setup-sslhttps)
- [Testing & Troubleshooting](#testing--troubleshooting)

---

## 🛠️ Persyaratan Sistem

RumahWeb menyediakan beberapa paket hosting. Pastikan Anda memilih paket yang memenuhi persyaratan:

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **PHP Version** | 8.2+ | 8.2/8.3 |
| **Database** | MySQL 5.7+ | MySQL 8.0 |
| **Storage** | 2 GB | 5 GB+ |
| **RAM** | 512 MB | 1 GB+ |
| **Extensions** | PDO, Mbstring, OpenSSL, JSON | Same + Redis |

### ✅ Paket RumahWeb yang Direkomendasikan:
- **Hosting Premium** (mulai dari 15rb/bulan)
- **Hosting Business** (untuk traffic lebih tinggi)
- **Cloud Hosting** (skalabilitas lebih baik)

---

## 📦 Persiapan File Project

### 1. **Siapkan File untuk Upload**

Di komputer lokal, jalankan perintah berikut:

```bash
cd /path/to/kasir-app

# Install dependencies (jika belum)
composer install --optimize-autoloader --no-dev

# Build frontend assets
npm install
npm run build

# Hapus folder yang tidak perlu
rm -rf node_modules
rm -rf vendor
rm -rf .git
rm -rf tests
rm -rf storage/logs/*
rm -rf storage/framework/cache/*
rm -rf storage/framework/sessions/*
rm -rf storage/framework/views/*
```

### 2. **Compress Project**

```bash
# Zip semua file (kecuali folder besar)
zip -r kasir-app.zip . \
  -x "node_modules/*" \
  -x "vendor/*" \
  -x ".git/*" \
  -x "tests/*" \
  -x "storage/logs/*" \
  -x "storage/framework/cache/*" \
  -x "storage/framework/sessions/*" \
  -x "storage/framework/views/*" \
  -x "*.zip"
```

**Ukuran file zip ideal:** 20-50 MB (tanpa vendor & node_modules)

---

## 📤 Upload File ke Hosting

### **Opsi 1: Via cPanel File Manager** (Recommended untuk pemula)

1. **Login ke cPanel RumahWeb**
   - URL: `https://namadomain.com/cpanel`
   - Username & Password dari email aktivasi RumahWeb

2. **Buka File Manager**
   - Klik icon **File Manager**
   - Navigate ke folder `public_html` atau `htdocs`

3. **Upload File ZIP**
   - Klik tombol **Upload** (panah ke atas)
   - Pilih file `kasir-app.zip`
   - Tunggu hingga upload selesai (100%)

4. **Extract File**
   - Klik kanan pada `kasir-app.zip`
   - Pilih **Extract**
   - Confirm extraction
   - Tunggu proses extract selesai

5. **Pindahkan ke Root (Optional)**
   - Jika file ter-extract ke subfolder, pindahkan semua isi ke `public_html`
   - Select All → Move → `/public_html/`

---

### **Opsi 2: Via FTP (FileZilla)**

1. **Download FileZilla** dari https://filezilla-project.org/

2. **Koneksi ke Server**
   - Host: `ftp.namadomain.com` atau IP server
   - Username: username cPanel
   - Password: password cPanel
   - Port: 21

3. **Upload File**
   - Local site: Pilih folder project di komputer
   - Remote site: Navigate ke `public_html`
   - Drag & drop semua file (kecuali `node_modules`, `vendor`, `.git`)

**⏱️ Estimasi waktu upload:** 10-30 menit (tergantung kecepatan internet)

---

### **Opsi 3: Via SSH/Terminal** (Advanced - Jika hosting support SSH)

```bash
# Upload via SCP dari komputer lokal
scp kasir-app.zip user@server:/home/username/public_html/

# SSH ke server
ssh username@server

# Extract
cd /home/username/public_html
unzip kasir-app.zip

# Cleanup
rm kasir-app.zip
```

---

## 🗄️ Setup Database

### 1. **Buat Database Baru**

1. Login ke **cPanel RumahWeb**
2. Klik **MySQL Databases** (di bagian Databases)
3. **Create a new database:**
   - Database Name: `username_kasir` (ganti `username` dengan username cPanel Anda)
   - Klik **Create Database**

4. **Create Database User:**
   - Username: `username_admin`
   - Password: `password_kuat_anda` (minimal 10 karakter, kombinasi huruf, angka, simbol)
   - Klik **Create User**

5. **Add User to Database:**
   - User: `username_admin`
   - Database: `username_kasir`
   - Privileges: **ALL PRIVILEGES** ✅
   - Klik **Add**

### 2. **Catat Informasi Database**

Simpan informasi berikut untuk konfigurasi `.env`:
```
DB_HOST=localhost
DB_DATABASE=username_kasir
DB_USERNAME=username_admin
DB_PASSWORD=password_kuat_anda
```

---

## ⚙️ Konfigurasi Environment

### 1. **Edit File .env**

1. Di **File Manager**, navigate ke folder project
2. Cari file `.env`
3. Klik kanan → **Edit**
4. Update konfigurasi berikut:

```env
APP_NAME=KasirApp
APP_ENV=production
APP_KEY=base64:WFYj80isxe3nUB2FuFzsuuOp/lpOZfLl4Ib62csHEN4=
APP_DEBUG=false
APP_URL=https://namadomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=username_kasir
DB_USERNAME=username_admin
DB_PASSWORD=password_kuat_anda

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

**⚠️ PENTING:**
- Set `APP_DEBUG=false` untuk production (keamanan!)
- Ganti `APP_URL` dengan domain Anda
- Pastikan `DB_*` sesuai dengan database yang dibuat

5. Klik **Save Changes**

---

### 2. **Generate App Key (Jika Belum Ada)**

Jika `APP_KEY` masih kosong atau error:

**Via Terminal/SSH:**
```bash
cd /home/username/public_html
php artisan key:generate
```

**Via Web (Alternatif):**
1. Buat file `generate-key.php` di File Manager:
```php
<?php
echo 'base64:' . base64_encode(random_bytes(32));
```
2. Akses via browser: `https://namadomain.com/generate-key.php`
3. Copy hasil dan paste ke `.env` sebagai `APP_KEY`
4. Hapus file `generate-key.php` setelah selesai

---

## 📥 Install Dependencies

### 1. **Install Composer Dependencies**

**Via SSH (Recommended):**
```bash
cd /home/username/public_html
composer install --optimize-autoloader --no-dev
```

**Via cPanel Terminal:**
- Di cPanel, cari **Terminal** atau **SSH Access**
- Jalankan perintah yang sama

**Jika Hosting Tidak Support SSH:**
1. Install di komputer lokal:
   ```bash
   composer install --optimize-autoloader --no-dev
   ```
2. Upload folder `vendor` via FTP
3. ⏱️ Upload folder vendor: 30-60 menit

---

### 2. **Install NPM Dependencies & Build**

**Via SSH:**
```bash
cd /home/username/public_html
npm install --production
npm run build
```

**Jika Hosting Tidak Support Node.js:**
1. Build di komputer lokal:
   ```bash
   npm install
   npm run build
   ```
2. Upload folder `public/build` dan `public/assets` via FTP
3. Upload `node_modules` jika diperlukan (biasanya tidak perlu untuk production)

---

## 📁 Setup Storage & Permissions

### 1. **Create Storage Link**

**Via SSH/Terminal:**
```bash
cd /home/username/public_html
php artisan storage:link
```

**Via File Manager (Manual):**
1. Navigate ke `storage/app/public`
2. Copy semua file di dalamnya
3. Paste ke `public/storage`

---

### 2. **Set Permissions**

**Via SSH:**
```bash
# Set folder permissions
chmod -R 755 /home/username/public_html/storage
chmod -R 755 /home/username/public_html/bootstrap/cache
chmod 644 /home/username/public_html/.env

# Set ownership (jika perlu)
chown -R username:username /home/username/public_html
```

**Via File Manager:**
1. Klik kanan folder `storage` → **Change Permissions**
2. Set ke `755`
3. Lakukan hal yang sama untuk `bootstrap/cache`

---

## 🗄️ Migrate Database & Seed

### 1. **Jalankan Migration**

**Via SSH:**
```bash
cd /home/username/public_html
php artisan migrate --force
```

**Via Web Browser (Alternatif):**
1. Buat file `migrate.php`:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Artisan;

echo "Running migrations...\n";
Artisan::call('migrate', ['--force' => true]);
echo Artisan::output();
```
2. Akses: `https://namadomain.com/migrate.php`
3. Tunggu hingga selesai
4. **Hapus file `migrate.php`** setelah selesai!

---

### 2. **Seed Database (Optional)**

```bash
php artisan db:seed --force
```

Atau combine dengan migrate:
```bash
php artisan migrate:seed --force
```

---

## 🏗️ Build Frontend Assets

### 1. **Jika Hosting Support Node.js**

```bash
npm run build
```

### 2. **Jika Hosting Tidak Support Node.js**

**Build di Lokal:**
```bash
# Di komputer lokal
npm run build

# Upload folder berikut via FTP:
# - public/build
# - public/assets (jika ada)
```

---

## 🔒 Setup SSL/HTTPS

### 1. **Aktivasi SSL di RumahWeb**

1. Login ke **cPanel**
2. Cari **SSL/TLS Status** atau **Let's Encrypt**
3. Pilih domain Anda
4. Klik **Run AutoSSL** atau **Issue Certificate**
5. Tunggu 5-10 menit hingga SSL aktif

### 2. **Force HTTPS Redirect**

Edit file `.htaccess` di root folder:

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

## ✅ Testing & Troubleshooting

### 1. **Test Aplikasi**

Buka browser dan akses:
```
https://namadomain.com
```

**Login dengan default credentials:**
- Email: `admin@sniffy.com`
- Password: `password`

---

### 2. **Common Errors & Solutions**

#### ❌ Error 500 - Internal Server Error

**Penyebab:** Permission salah atau `.env` bermasalah

**Solusi:**
```bash
# Check permissions
chmod -R 755 storage bootstrap/cache
chmod 644 .env

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

#### ❌ Error: Class 'PDO' not found

**Penyebab:** PHP Extension PDO tidak aktif

**Solusi:**
1. Di cPanel, cari **Select PHP Version**
2. Klik **Extensions**
3. Centang `pdo_mysql`
4. Save

---

#### ❌ Error: SQLSTATE[HY000] [2002] Connection refused

**Penyebab:** Database connection salah

**Solusi:**
- Cek `.env` - pastikan `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` benar
- Pastikan database user sudah di-assign ke database dengan **ALL PRIVILEGES**

---

#### ❌ Error: The requested URL was not found on this server

**Penyebab:** `.htaccess` bermasalah atau mod_rewrite tidak aktif

**Solusi:**
1. Pastikan file `.htaccess` ada di root folder
2. Di cPanel → **Select PHP Version** → **Options**
3. Pastikan `mod_rewrite` aktif

---

#### ❌ Error: Target class [driver] does not exist

**Penyebab:** Composer autoload bermasalah

**Solusi:**
```bash
composer dump-autoload --optimize
```

---

#### ❌ Error: storage/logs/laravel.log not writable

**Penyebab:** Permission folder storage salah

**Solusi:**
```bash
chmod -R 775 storage
chown -R username:username storage
```

---

## 🚀 Optimasi Performance

### 1. **Enable OPcache**

Di cPanel → **Select PHP Version** → **Options**:
- Set `opcache.enable=1`
- Set `opcache.memory_consumption=128`

### 2. **Optimize Autoload**

```bash
composer dump-autoload --optimize --classmap-authoritative
```

### 3. **Enable Cache**

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**⚠️ Note:** Setiap kali ada perubahan code, jalankan:
```bash
php artisan cache:clear
php artisan config:clear
```

---

## 📊 Monitoring & Maintenance

### 1. **Check Logs**

File log ada di: `storage/logs/laravel.log`

```bash
# View log tail
tail -f storage/logs/laravel.log
```

### 2. **Clear Cache Berkala**

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 3. **Backup Database**

Di cPanel → **phpMyAdmin**:
1. Pilih database `username_kasir`
2. Klik **Export**
3. Pilih format **SQL**
4. Download backup

---

## 📞 Support RumahWeb

Jika mengalami kendala dengan hosting:

- **Live Chat:** 24/7 di website RumahWeb
- **Ticket System:** Via client area
- **Phone:** (021) 3141 999
- **Email:** support@rumahweb.com

---

## ✅ Checklist Deploy

- [ ] Upload semua file ke hosting
- [ ] Buat database & user
- [ ] Konfigurasi `.env`
- [ ] Install composer dependencies
- [ ] Build frontend assets
- [ ] Setup storage link
- [ ] Set permissions
- [ ] Run migrations
- [ ] Aktivasi SSL
- [ ] Test aplikasi
- [ ] Enable cache & optimasi

---

**🎉 Selamat! Aplikasi KasirApp Anda sudah live di RumahWeb!**

---

## 🔗 Referensi Tambahan

- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [RumahWeb Knowledge Base](https://www.rumahweb.com/knowledgebase/)
- [cPanel Documentation](https://docs.cpanel.net/)

---

**Dibuat dengan ❤️ untuk komunitas developer Indonesia**
