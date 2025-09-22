#!/bin/bash

# VSMS Environment Setup Script
# This script creates the necessary environment files with default values

echo "🔧 Setting up VSMS environment files..."

# Generate random secrets
JWT_SECRET=$(openssl rand -base64 32)
AUTH_SECRET=$(openssl rand -base64 32)

# Create root .env file
echo "📁 Creating root .env file..."
cat > .env << EOF
# Database Configuration for Docker
MYSQL_ROOT_PASSWORD=password
MYSQL_DATABASE=vehicle_sales
EOF

# Create backend .env file
echo "📁 Creating backend/.env file..."
cat > backend/.env << EOF
# Database Configuration
DOCKER_DATABASE_URL=mysql://root:password@mysql:3306/vehicle_sales
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=vehicle_sales

# For production, use PostgreSQL - REPLACE WITH YOUR DATABASE URL
DATABASE_URL=your-postgres-connection-string

# Application Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET=$JWT_SECRET

# AWS Configuration (Required for file uploads) - REPLACE WITH YOUR VALUES
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_CLOUDFRONT_URL=your-cloudfront-url

# OpenAI Configuration (Optional - for AI features) - REPLACE WITH YOUR KEY
OPENAI_API_KEY=your-openai-api-key
EOF

# Create frontend .env.local file
echo "📁 Creating frontend/.env.local file..."
cat > frontend/.env.local << EOF
# NextAuth v5 Configuration
AUTH_SECRET=$AUTH_SECRET
AUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://backend:3001
EOF

echo ""
echo "✅ Environment files created successfully!"
