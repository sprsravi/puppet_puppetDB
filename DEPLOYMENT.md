# Puppet Master Web UI - Production Deployment Guide

This guide provides step-by-step instructions to deploy your Puppet Master Web UI in production on Ubuntu 22.04.

## Prerequisites

- Ubuntu 22.04 server
- Puppet Master installed and running
- PuppetDB installed and accessible at `https://puppet.emudhra.local:8081`
- Node.js 18+ and npm installed
- Domain name or server IP address
- SSL certificates (if using HTTPS)

## Step 1: Prepare the Server

### 1.1 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.2 Install Node.js and npm

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 1.3 Install Nginx (Web Server)

```bash
sudo apt install -y nginx
```

### 1.4 Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

## Step 2: Configure PuppetDB for CORS

Since the web UI will connect to PuppetDB from the browser, you need to configure CORS.

### 2.1 Create Nginx Proxy for PuppetDB

Create a new Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/puppetdb-proxy
```

Add the following configuration:

```nginx
server {
    listen 8082;
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
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/puppetdb-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 2.2 Update PuppetDB URL in Application

```bash
# Navigate to your project directory
cd /tmp/cc-agent/58524226/project

# Update the PuppetDB URL
nano src/services/puppetdb.ts
```

Change the URL from:
```typescript
const PUPPETDB_URL = 'https://puppet.emudhra.local:8081';
```

To:
```typescript
const PUPPETDB_URL = 'http://localhost:8082';
```

## Step 3: Set Up Supabase Authentication

### 3.1 Create a User Account

Sign up for the first user account using Supabase Auth:

```bash
# Using the Supabase CLI or via SQL in Supabase Dashboard
# First, create the auth user in Supabase Dashboard:
# Go to Authentication > Users > Add User
# Email: admin@yourdomain.com
# Password: (set a strong password)
# Confirm email automatically
```

### 3.2 Add User to Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Get the auth user ID first
SELECT id, email FROM auth.users WHERE email = 'admin@yourdomain.com';

-- Insert into users table (replace the UUID with the actual auth.users.id)
INSERT INTO users (id, email, full_name, role, is_active)
VALUES (
  '<auth-user-id-from-above>',
  'admin@yourdomain.com',
  'System Administrator',
  'admin',
  true
);
```

Alternative method using Supabase Auth API:

```sql
-- This automatically syncs with auth.users
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'System Administrator', 'admin', true
FROM auth.users
WHERE email = 'admin@yourdomain.com'
ON CONFLICT (email) DO NOTHING;
```

## Step 4: Deploy the Application

### 4.1 Clone or Copy the Project

```bash
# Create application directory
sudo mkdir -p /var/www/puppet-ui
sudo chown -R $USER:$USER /var/www/puppet-ui

# Copy the project files
cp -r /tmp/cc-agent/58524226/project/* /var/www/puppet-ui/
cd /var/www/puppet-ui
```

### 4.2 Install Dependencies

```bash
npm install
```

### 4.3 Build the Production Application

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Step 5: Configure Nginx for the Web Application

### 5.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/puppet-ui
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or server IP

    root /var/www/puppet-ui/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
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
```

### 5.2 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/puppet-ui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Configure SSL (HTTPS) - Recommended

### 6.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete the SSL setup.

## Step 7: Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow SSH (if not already allowed)
sudo ufw allow ssh

# Enable firewall
sudo ufw enable
```

## Step 8: Test the Deployment

### 8.1 Check Nginx Status

```bash
sudo systemctl status nginx
```

### 8.2 Test PuppetDB Connectivity

```bash
curl http://localhost:8082/pdb/query/v4/nodes
```

### 8.3 Access the Web UI

Open your browser and navigate to:
- `http://your-domain.com` (or `http://your-server-ip`)
- `https://your-domain.com` (if SSL is configured)

### 8.4 Login

Use the credentials you created in Step 3:
- Email: admin@yourdomain.com
- Password: (the password you set)

## Step 9: Production Monitoring and Maintenance

### 9.1 Monitor Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 9.2 Set Up Log Rotation

Nginx log rotation is configured by default. Verify:

```bash
cat /etc/logrotate.d/nginx
```

### 9.3 Regular Backups

Backup the Supabase database regularly through the Supabase dashboard.

## Troubleshooting

### Issue: Cannot Connect to PuppetDB

**Solution:**
```bash
# Test direct PuppetDB connection
curl -k https://puppet.emudhra.local:8081/pdb/query/v4/nodes

# Check Nginx proxy logs
sudo tail -f /var/log/nginx/error.log

# Verify proxy is running
sudo netstat -tulpn | grep :8082
```

### Issue: CORS Errors in Browser Console

**Solution:**
Ensure the PuppetDB proxy configuration includes proper CORS headers. Check `/etc/nginx/sites-available/puppetdb-proxy`.

### Issue: Login Not Working

**Solution:**
```bash
# Check Supabase connection
# Verify .env file has correct credentials
cat /var/www/puppet-ui/.env

# Check if user exists in database
# Run in Supabase SQL Editor:
SELECT * FROM users WHERE email = 'admin@yourdomain.com';
```

### Issue: White Screen After Login

**Solution:**
```bash
# Check browser console for errors
# Verify PuppetDB proxy is accessible
curl http://localhost:8082/pdb/query/v4/nodes

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Security Best Practices

### 10.1 Restrict PuppetDB Proxy Access

Edit `/etc/nginx/sites-available/puppetdb-proxy`:

```nginx
# Only allow local connections
listen 127.0.0.1:8082;
```

### 10.2 Enable Fail2Ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 10.3 Regular Updates

```bash
# Update system packages weekly
sudo apt update && sudo apt upgrade -y

# Update Node.js packages
cd /var/www/puppet-ui
npm audit fix
```

## Alternative Deployment Options

### Option 1: Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t puppet-ui .
docker run -d -p 80:80 puppet-ui
```

### Option 2: Using PM2 with Preview Server

```bash
cd /var/www/puppet-ui
npm install -g serve
pm2 start "serve -s dist -p 3000" --name puppet-ui
pm2 save
pm2 startup
```

## Accessing Different Puppet Master Environments

If you have multiple Puppet Masters or environments:

### Edit PuppetDB URL Configuration

Create environment-specific builds:

```bash
# Production environment
VITE_PUPPETDB_URL=http://prod-puppet.local:8082 npm run build

# Staging environment
VITE_PUPPETDB_URL=http://staging-puppet.local:8082 npm run build
```

Or use Nginx to proxy multiple PuppetDB instances:

```nginx
# Add to Nginx configuration
location /api/prod/ {
    proxy_pass https://prod-puppet.emudhra.local:8081/;
    # Add CORS headers...
}

location /api/staging/ {
    proxy_pass https://staging-puppet.emudhra.local:8081/;
    # Add CORS headers...
}
```

## Support and Additional Resources

- PuppetDB API Documentation: https://puppet.com/docs/puppetdb/latest/api/
- Supabase Documentation: https://supabase.com/docs
- Nginx Documentation: https://nginx.org/en/docs/

## Quick Reference Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# Rebuild application
cd /var/www/puppet-ui && npm run build

# Check application logs
sudo tail -f /var/log/nginx/access.log

# Test PuppetDB connection
curl http://localhost:8082/pdb/query/v4/nodes

# Backup configuration
sudo tar -czf puppet-ui-backup-$(date +%Y%m%d).tar.gz /var/www/puppet-ui /etc/nginx/sites-available/puppet-ui /etc/nginx/sites-available/puppetdb-proxy
```

---

Your Puppet Master Web UI is now deployed and ready for production use!
