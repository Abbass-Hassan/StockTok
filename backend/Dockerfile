FROM bitnami/laravel 

# Build arguments for environment and API key
ARG ENV=production
ARG OPENAI_API_KEY
ENV APP_ENV=${ENV}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

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