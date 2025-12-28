# Aplikasi Kasir (Point of Sales) 

## Tech Stack

- Laravel 11.x
- Inertia
- React
- TailwindCSS
- MySQL
- Redis
- Docker

------------
## 🐳 Docker Setup (Recommended)

### Prerequisites
- Docker & Docker Compose installed
- Git

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/aryadwiputra/point-of-sales 
cd point-of-sales
```

2. **Run Setup Script**
```bash
./docker-setup.sh
```

3. **Access Application**
- 🌐 Main Application: http://localhost:8000
- 🗄️  MySQL: localhost:3306
- 🔴 Redis: localhost:6379

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Access app container
docker-compose exec app bash

# Development mode (with Node.js hot reload)
./docker-setup.sh --development

# Production mode (with Nginx)
./docker-setup.sh --production
```

------------
## 💻 Manual Installation (Without Docker)

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Redis (optional)

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/aryadwiputra/point-of-sales 
```

2. **Install Dependencies**
```bash
cd point-of-sales
composer install
npm install
cp .env.example .env
php artisan key:generate
```

3. **Configure Environment**
Edit `.env` file and update database settings:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=point_of_sales
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. **Run Laravel Commands**
```bash
php artisan config:cache
php artisan storage:link
php artisan route:clear
```

5. **Database Setup**
```bash
php artisan migrate --seed
```

6. **Build Assets**
```bash
npm run build
# For development: npm run dev
```

7. **Start Application**
```bash
php artisan serve
```

------------
## 📁 Project Structure

```
├── app/                    # Laravel application code
├── docker/                 # Docker configuration files
│   ├── nginx/             # Nginx configuration
│   └── mysql/             # MySQL configuration
├── resources/js/          # React components
├── database/              # Database migrations & seeders
├── public/                # Public assets
├── storage/               # Application storage
├── Dockerfile             # PHP application container
├── docker-compose.yml     # Multi-service orchestration
├── docker-entrypoint.sh   # Application startup script
└── docker-setup.sh        # Setup automation script
```

------------
## 🔧 Development

### Docker Development
```bash
# Start with hot reload
./docker-setup.sh --development

# Access Node.js container for asset building
docker-compose exec node npm run dev
```

### Manual Development
```bash
# Install dependencies
composer install
npm install

# Run development servers
php artisan serve
npm run dev
```

------------
## 📝 Environment Variables

Key environment variables in `.env`:

```bash
# Application
APP_NAME=KasirApp
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=mysql              # Use 'mysql' for Docker, '127.0.0.1' for manual
DB_DATABASE=kasir_db
DB_USERNAME=kasir_user
DB_PASSWORD=kasir_password

# Cache
CACHE_DRIVER=redis         # Use 'redis' for Docker, 'database' for manual
REDIS_HOST=redis           # Use 'redis' for Docker, '127.0.0.1' for manual
```

------------
## 🐛 Troubleshooting

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build

# Clear Docker cache
docker system prune -a

# Check container logs
docker-compose logs app
docker-compose logs mysql
```

### Common Issues
1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Permission errors**: Run `chmod +x docker-setup.sh docker-entrypoint.sh`
3. **Database connection**: Ensure MySQL container is running
4. **Asset building**: Clear cache with `php artisan cache:clear`

------------
## 📄 License

This project is open-sourced software licensed under the MIT license.

