#!/bin/bash

# Docker Development Helper Script

echo "=== Kasir App Docker Setup ==="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to create .env if not exists
create_env() {
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "✅ .env file created"
    else
        echo "✅ .env file already exists"
    fi
}

# Function to build and start containers
start_containers() {
    echo "🐳 Building and starting Docker containers..."
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo "✅ Containers started successfully"
    else
        echo "❌ Failed to start containers"
        exit 1
    fi
}

# Function to show status
show_status() {
    echo ""
    echo "=== Container Status ==="
    docker-compose ps
    
    echo ""
    echo "=== Application URLs ==="
    echo "🌐 Main Application: http://localhost:8000"
    echo "🗄️  MySQL: localhost:3306"
    echo "🔴 Redis: localhost:6379"
    
    if [ "$1" = "--with-nginx" ]; then
        echo "🌐 Nginx (Production): http://localhost"
    fi
    
    echo ""
    echo "=== Useful Commands ==="
    echo "View logs: docker-compose logs -f"
    echo "Stop containers: docker-compose down"
    echo "Restart containers: docker-compose restart"
    echo "Access app container: docker-compose exec app bash"
}

# Main execution
main() {
    check_docker
    create_env
    
    # Check if nginx profile is requested
    if [ "$1" = "--production" ]; then
        echo "🚀 Starting with Nginx (Production mode)..."
        docker-compose --profile production up -d --build
        show_status --with-nginx
    elif [ "$1" = "--development" ]; then
        echo "🛠️ Starting with Node.js (Development mode)..."
        docker-compose --profile development up -d --build
        show_status
    else
        start_containers
        show_status
    fi
    
    echo ""
    echo "🎉 Setup complete! Your Kasir App is now running."
}

# Run main function with all arguments
main "$@"