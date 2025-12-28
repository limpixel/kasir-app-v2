# Use PHP 8.2 official image
FROM php:8.2-apache

# Set working directory
WORKDIR /var/www/html

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    jpegoptim optipng pngquant gifsicle \
    vim \
    supervisor \
    cron \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath zip \
    && docker-php-ext-enable pdo_mysql mbstring exif pcntl bcmath zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Clear package cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www/html

# Copy entrypoint script
COPY --chown=www-data:www-data docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Change current user to www-data
USER www-data

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Set entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]

# Copy PHP configuration
RUN cp /usr/local/etc/php/php.ini-production /usr/local/etc/php/php.ini

# Set Apache configuration
RUN a2enmod rewrite \
    && sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
    && sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/html\/public/g' /etc/apache2/sites-available/000-default.conf

# Create storage link
RUN php artisan storage:link

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Expose port 80
EXPOSE 80

# Start Apache when container starts
CMD ["apache2-foreground"]
