FROM bitnami/laravel 

# Build argument for environment
ARG ENV=production
ENV APP_ENV=${ENV}

WORKDIR /app

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy the entire application
COPY . .

# Set up environment configuration
# We'll use a shell command to handle conditional file existence
RUN if [ -f .env.${ENV} ]; then \
    cp .env.${ENV} .env.example; \
    else \
    echo "Using default .env.example"; \
    fi

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]