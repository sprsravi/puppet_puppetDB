#!/bin/bash

# Puppet Master Web UI - Production Setup Script
# This script automates the deployment process on Ubuntu 22.04

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Puppet Master Web UI - Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should NOT be run as root${NC}"
   echo "Please run as a regular user with sudo privileges"
   exit 1
fi

# Function to print section headers
print_section() {
    echo ""
    echo -e "${YELLOW}>>> $1${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_section "Step 1: Installing System Dependencies"

# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js if not present
if ! command_exists node; then
    print_section "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "Node.js already installed: $(node --version)"
fi

# Install Nginx if not present
if ! command_exists nginx; then
    print_section "Installing Nginx..."
    sudo apt install -y nginx
else
    echo "Nginx already installed"
fi

print_section "Step 2: Setting Up Application Directory"

# Create application directory
APP_DIR="/var/www/puppet-ui"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Copy application files
echo "Copying application files..."
cp -r ./* $APP_DIR/
cd $APP_DIR

print_section "Step 3: Configuring Environment Variables"

# Check if .env exists
if [ ! -f "$APP_DIR/.env" ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo -e "${RED}IMPORTANT: You must edit $APP_DIR/.env with your credentials${NC}"
    echo "Please provide the following information:"
    read -p "Supabase URL: " SUPABASE_URL
    read -p "Supabase Anon Key: " SUPABASE_KEY
    read -p "PuppetDB URL (default: http://localhost:8082): " PUPPETDB_URL
    PUPPETDB_URL=${PUPPETDB_URL:-http://localhost:8082}

    cat > $APP_DIR/.env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
VITE_PUPPETDB_URL=$PUPPETDB_URL
EOF
    echo "Environment file created successfully"
fi

print_section "Step 4: Installing Application Dependencies"

npm install

print_section "Step 5: Building Production Application"

npm run build

print_section "Step 6: Configuring Nginx Proxy for PuppetDB"

# Create PuppetDB proxy configuration
sudo tee /etc/nginx/sites-available/puppetdb-proxy > /dev/null << 'EOF'
server {
    listen 127.0.0.1:8082;
    server_name localhost;

    location / {
        # Proxy to PuppetDB
        proxy_pass https://puppet.emudhra.local:8081;
        proxy_ssl_verify off;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Client-Info, Apikey' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Client-Info, Apikey';
            add_header 'Content-Length' 0;
            add_header 'Content-Type' 'text/plain';
            return 204;
        }

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable PuppetDB proxy
sudo ln -sf /etc/nginx/sites-available/puppetdb-proxy /etc/nginx/sites-enabled/

print_section "Step 7: Configuring Nginx for Web Application"

# Get server domain/IP
read -p "Enter your domain name or server IP (e.g., puppet-ui.example.com or 192.168.1.100): " SERVER_NAME

# Create web application configuration
sudo tee /etc/nginx/sites-available/puppet-ui > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    root $APP_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

# Enable web application
sudo ln -sf /etc/nginx/sites-available/puppet-ui /etc/nginx/sites-enabled/

print_section "Step 8: Testing and Reloading Nginx"

# Test Nginx configuration
if sudo nginx -t; then
    echo "Nginx configuration is valid"
    sudo systemctl reload nginx
    echo "Nginx reloaded successfully"
else
    echo -e "${RED}Nginx configuration has errors. Please check and fix them.${NC}"
    exit 1
fi

print_section "Step 9: Configuring Firewall"

# Configure UFW if it's available
if command_exists ufw; then
    sudo ufw allow 'Nginx Full'
    sudo ufw allow ssh
    echo "Firewall rules updated"
else
    echo "UFW not installed, skipping firewall configuration"
fi

print_section "Setup Complete!"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a user account in Supabase:"
echo "   - Go to your Supabase Dashboard > Authentication > Users"
echo "   - Add a new user with email and password"
echo ""
echo "2. Add the user to the database:"
echo "   Run this SQL in Supabase SQL Editor:"
echo "   INSERT INTO users (email, full_name, role, is_active)"
echo "   SELECT email, 'Admin User', 'admin', true"
echo "   FROM auth.users WHERE email = 'your-email@example.com';"
echo ""
echo "3. Access your application:"
echo "   http://$SERVER_NAME"
echo ""
echo "4. Optional - Set up SSL with Let's Encrypt:"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $SERVER_NAME"
echo ""
echo "5. Test PuppetDB connection:"
echo "   curl http://localhost:8082/pdb/query/v4/nodes"
echo ""
echo "For detailed documentation, see DEPLOYMENT.md"
echo ""
