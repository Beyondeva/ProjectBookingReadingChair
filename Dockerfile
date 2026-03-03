FROM php:7.4-apache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy API files to Apache document root
COPY api/ /var/www/html/

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html

# Expose port (Railway uses PORT env var)
EXPOSE 80

# Apache runs on port 80 by default, Railway maps it
CMD ["apache2-foreground"]
