# Puppet Master Web UI - Deployment Guide

Simple deployment guide for your Puppet Master Web UI.

## Prerequisites

- Ubuntu 22.04 (or similar)
- Puppet Master with PuppetDB running on **http://localhost:8080**
- Root or sudo access

## Quick Deployment (5 Minutes)

### Step 1: Install Requirements

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Verify installations
node --version  # Should show v20.x.x
nginx -v        # Should show nginx version
```

### Step 2: Build the Application

```bash
# Navigate to project directory
cd /path/to/puppet-ui

# Install dependencies
npm install

# Build production version
npm run build
```

### Step 3: Deploy to Nginx

```bash
# Create web directory
sudo mkdir -p /var/www/puppet-ui

# Copy built files
sudo cp -r dist/* /var/www/puppet-ui/

# Set permissions
sudo chown -R www-data:www-data /var/www/puppet-ui
```

### Step 4: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/puppet-ui > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/puppet-ui;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/puppet-ui /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 5: Configure Firewall

```bash
# Allow HTTP
sudo ufw allow 80/tcp

# If using HTTPS
sudo ufw allow 443/tcp

# Enable firewall (if not already enabled)
sudo ufw enable
```

### Step 6: Access the Application

1. Open browser: `http://your-server-ip`
2. Login with default credentials:
   - **Username**: `admin`
   - **Password**: `admin123`

**IMPORTANT**: Change the admin password immediately!

## Post-Installation

### Change Default Password

After logging in, open browser console (F12) and run:

```javascript
const { changePassword } = await import('./lib/auth.js');
changePassword('admin', 'your-new-secure-password');
```

Then logout and login with your new password.

### Add Additional Users

In browser console (F12):

```javascript
const { addUser } = await import('./lib/auth.js');

// Add an operator
addUser('operator1', 'password123', 'Operator User', 'operator');

// Add a viewer
addUser('viewer1', 'password123', 'Viewer User', 'viewer');
```

## PuppetDB Configuration

The application expects PuppetDB at `http://localhost:8080`.

### If Your PuppetDB is at a Different URL:

1. Edit `src/services/puppetdb.ts`:
   ```typescript
   const PUPPETDB_URL = 'http://your-puppetdb-server:port';
   ```

2. Rebuild and redeploy:
   ```bash
   npm run build
   sudo cp -r dist/* /var/www/puppet-ui/
   ```

### If PuppetDB Has CORS Issues:

Create an Nginx proxy:

```bash
sudo tee /etc/nginx/sites-available/puppetdb-proxy > /dev/null << 'EOF'
server {
    listen 8080;
    server_name localhost;

    location / {
        proxy_pass http://your-actual-puppetdb:8080;

        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type' always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/puppetdb-proxy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Optional: HTTPS Setup

### Using Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Follow the prompts
# Certificate will auto-renew every 90 days
```

### Using Self-Signed Certificate:

```bash
# Generate certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/puppet-ui.key \
  -out /etc/ssl/certs/puppet-ui.crt

# Update Nginx config
sudo tee /etc/nginx/sites-available/puppet-ui > /dev/null << 'EOF'
server {
    listen 443 ssl;
    server_name _;

    ssl_certificate /etc/ssl/certs/puppet-ui.crt;
    ssl_certificate_key /etc/ssl/private/puppet-ui.key;

    root /var/www/puppet-ui;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}
EOF

sudo nginx -t && sudo systemctl reload nginx
```

## Troubleshooting

### Cannot Access Web UI

```bash
# Check Nginx is running
sudo systemctl status nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check firewall
sudo ufw status

# Restart Nginx
sudo systemctl restart nginx
```

### Login Not Working

- Default username: `admin`, password: `admin123`
- Clear browser cache and localStorage (F12 → Application → Local Storage → Clear)
- Refresh the page

### No Data Showing

```bash
# Test PuppetDB connection
curl http://localhost:8080/pdb/query/v4/nodes

# If command fails, PuppetDB is not accessible
# Check PuppetDB status
sudo systemctl status puppetdb

# Check PuppetDB logs
sudo journalctl -u puppetdb -f
```

### CORS Errors in Browser Console

If you see CORS errors:
1. PuppetDB must allow cross-origin requests
2. Use the Nginx proxy solution (see "If PuppetDB Has CORS Issues" above)

## Updating the Application

```bash
# Navigate to project
cd /path/to/puppet-ui

# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install

# Rebuild
npm run build

# Deploy updated files
sudo cp -r dist/* /var/www/puppet-ui/

# Clear browser cache or hard refresh (Ctrl+Shift+R)
```

## Maintenance

### View Logs

```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Backup

```bash
# Backup Nginx config
sudo cp /etc/nginx/sites-available/puppet-ui ~/puppet-ui-nginx-backup.conf

# Note: User data is stored in browser localStorage (no server backup needed)
```

### Monitor Resources

```bash
# Check disk space
df -h /var/www/puppet-ui

# Check Nginx process
ps aux | grep nginx
```

## Security Best Practices

1. **Change default password immediately**
2. **Use HTTPS in production**
3. **Keep system updated**: `sudo apt update && sudo apt upgrade`
4. **Restrict firewall**: Only allow necessary ports
5. **Use strong passwords**: For all user accounts
6. **Regular updates**: Keep application updated

## System Requirements

### Minimum:
- 1 CPU core
- 512MB RAM
- 1GB disk space

### Recommended:
- 2 CPU cores
- 1GB RAM
- 5GB disk space

## Common Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# Test Nginx config
sudo nginx -t

# View Nginx status
sudo systemctl status nginx

# Rebuild application
cd /path/to/puppet-ui && npm run build

# Deploy changes
sudo cp -r dist/* /var/www/puppet-ui/
```

## Support

For issues:
1. Check browser console (F12) for JavaScript errors
2. Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Verify PuppetDB: `curl http://localhost:8080/pdb/query/v4/nodes`
4. See README.md for more troubleshooting

---

**Your Puppet infrastructure is now web-accessible!**
