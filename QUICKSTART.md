# Puppet Master Web UI - Quick Start Guide

This guide will help you quickly deploy the Puppet Master Web UI in production.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Ubuntu 22.04 server (or similar Linux distribution)
- [ ] Puppet Master installed and running
- [ ] PuppetDB installed at `https://puppet.emudhra.local:8081`
- [ ] Supabase account with project created
- [ ] Root or sudo access to the server
- [ ] Domain name or server IP address (optional but recommended)

## Quick Deployment (5 Steps)

### Step 1: Download and Extract the Project

```bash
# If you have the project as a zip/tar file
cd /tmp
# Extract it, then:
cd puppet-ui

# Or if cloning from git
git clone <your-repo-url>
cd puppet-ui
```

### Step 2: Run the Automated Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will:
- Install Node.js and Nginx
- Copy files to `/var/www/puppet-ui`
- Build the production application
- Configure Nginx for PuppetDB proxy
- Set up the web server
- Configure firewall rules

**During setup, you'll be asked to provide:**
1. Supabase URL
2. Supabase Anon Key
3. PuppetDB URL (default: `http://localhost:8082`)
4. Your domain name or server IP

### Step 3: Create Your Admin User

#### 3.1 In Supabase Dashboard:

1. Go to `https://supabase.com/dashboard`
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - Email: `admin@yourdomain.com`
   - Password: (create a strong password)
   - Check **Auto Confirm User**
6. Click **Create User**

#### 3.2 Add User to Database:

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the SQL from `scripts/create-user.sql`:

```sql
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'System Administrator', 'admin', true
FROM auth.users
WHERE email = 'admin@yourdomain.com';
```

3. Click **Run** to execute

### Step 4: Access Your Application

Open your browser and navigate to:

```
http://your-server-ip
```

or

```
http://your-domain.com
```

Login with:
- **Email**: `admin@yourdomain.com`
- **Password**: (the password you created)

### Step 5: Verify PuppetDB Connection

After logging in, you should see:
- Dashboard with node statistics
- List of nodes in the Nodes section
- Recent reports
- Fact data

If you see "Failed to load data" errors, check the troubleshooting section below.

## Optional: Set Up HTTPS (Recommended for Production)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Follow the prompts
# Certbot will automatically configure HTTPS in Nginx
```

## Troubleshooting

### Problem: Cannot connect to PuppetDB

**Solution:**

```bash
# Test PuppetDB directly
curl -k https://puppet.emudhra.local:8081/pdb/query/v4/nodes

# If that works, test the proxy
curl http://localhost:8082/pdb/query/v4/nodes

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Ensure Nginx proxy is running
sudo systemctl status nginx
```

### Problem: Login fails or shows "Invalid credentials"

**Solution:**

```bash
# Check if user exists in database
# Run in Supabase SQL Editor:
SELECT * FROM users WHERE email = 'admin@yourdomain.com';

# If user doesn't exist, run the create-user.sql script again
```

### Problem: White screen after login

**Solution:**

```bash
# Check browser console for errors (F12 in browser)
# Common issues:

# 1. PuppetDB not accessible
curl http://localhost:8082/pdb/query/v4/nodes

# 2. Check Nginx configuration
sudo nginx -t

# 3. Check application logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Problem: PuppetDB URL is wrong

**Solution:**

If your PuppetDB is at a different URL:

```bash
# Edit the environment file
sudo nano /var/www/puppet-ui/.env

# Update VITE_PUPPETDB_URL
VITE_PUPPETDB_URL=http://your-correct-url

# Rebuild the application
cd /var/www/puppet-ui
npm run build

# Restart Nginx
sudo systemctl restart nginx
```

### Problem: SSL certificate errors when connecting to PuppetDB

**Solution:**

The Nginx proxy configuration includes `proxy_ssl_verify off;` which bypasses SSL verification for self-signed certificates. If you need proper SSL verification:

```bash
# Edit the proxy config
sudo nano /etc/nginx/sites-available/puppetdb-proxy

# Change:
proxy_ssl_verify off;

# To:
proxy_ssl_verify on;
proxy_ssl_trusted_certificate /path/to/puppet/ca.pem;

# Restart Nginx
sudo systemctl restart nginx
```

## Testing Your Deployment

### Test Checklist:

1. **Authentication**
   - [ ] Can login with admin credentials
   - [ ] Can logout successfully
   - [ ] Session persists on page refresh

2. **Dashboard**
   - [ ] Shows total node count
   - [ ] Displays node statuses
   - [ ] Shows recent reports

3. **Nodes**
   - [ ] Lists all Puppet nodes
   - [ ] Can search nodes
   - [ ] Can filter by status
   - [ ] Can view node details

4. **Reports**
   - [ ] Shows recent reports
   - [ ] Can filter by status
   - [ ] Can view report details

5. **Facts**
   - [ ] Lists fact names
   - [ ] Can view fact values
   - [ ] Can search facts

6. **Query**
   - [ ] Can execute PuppetDB queries
   - [ ] Shows query results

## Manual Setup (Alternative to Script)

If the automated script doesn't work, follow the detailed manual steps in `DEPLOYMENT.md`.

## Configuration Files Reference

### Main Application Config
- **Location**: `/var/www/puppet-ui/.env`
- **Purpose**: Application environment variables

### Nginx Web Server Config
- **Location**: `/etc/nginx/sites-available/puppet-ui`
- **Purpose**: Serves the web application

### Nginx PuppetDB Proxy Config
- **Location**: `/etc/nginx/sites-available/puppetdb-proxy`
- **Purpose**: Proxies requests to PuppetDB with CORS

## Common Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# Reload Nginx (no downtime)
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx

# View Nginx access logs
sudo tail -f /var/log/nginx/access.log

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test PuppetDB proxy
curl http://localhost:8082/pdb/query/v4/nodes

# Rebuild application
cd /var/www/puppet-ui
npm run build
```

## Accessing from Different Devices

To access from other computers on your network:

1. **Find your server IP:**
   ```bash
   hostname -I
   ```

2. **Ensure firewall allows HTTP:**
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   ```

3. **Access from browser:**
   ```
   http://server-ip-address
   ```

## Security Recommendations

1. **Always use HTTPS in production** (see Optional HTTPS setup above)
2. **Use strong passwords** for all user accounts
3. **Restrict PuppetDB proxy** to localhost only (already configured)
4. **Enable fail2ban** for brute force protection:
   ```bash
   sudo apt install fail2ban
   ```
5. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade
   ```

## Next Steps

After successful deployment:

1. Create additional user accounts with different roles (operator, viewer)
2. Set up regular database backups through Supabase
3. Configure monitoring and alerting for your infrastructure
4. Customize the application branding if needed
5. Set up automated SSL certificate renewal

## Support

For detailed documentation, see:
- `DEPLOYMENT.md` - Complete deployment guide
- `README.md` - Project overview and development guide

For PuppetDB API documentation:
- https://puppet.com/docs/puppetdb/latest/api/

For Supabase documentation:
- https://supabase.com/docs

---

**You're now ready to manage your Puppet infrastructure through the web interface!**
