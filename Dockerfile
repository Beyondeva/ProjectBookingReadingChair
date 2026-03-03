FROM php:7.4-cli

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Copy API files
WORKDIR /app
COPY api/ /app/

# Railway requires listening on $PORT (default 8080)
ENV PORT=8080

# Use PHP built-in server (no Apache = no MPM issues)
CMD php -S 0.0.0.0:${PORT} -t /app
