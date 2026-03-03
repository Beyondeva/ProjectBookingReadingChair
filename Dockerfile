FROM php:7.4-apache

# Fix: disable conflicting MPM modules, keep only mpm_prefork
RUN a2dismod mpm_event mpm_worker 2>/dev/null; a2enmod mpm_prefork rewrite

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy API files to Apache document root
COPY api/ /var/www/html/

# Set correct permissions
RUN chown -R www-data:www-data /var/www/html

# Railway uses PORT env var — configure Apache to listen on $PORT
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

EXPOSE 80

CMD ["apache2-foreground"]
