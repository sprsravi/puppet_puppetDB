# Puppet Master Web UI - Setup Summary

## What You Have

A complete, production-ready web interface for managing your Puppet Master infrastructure with:

✅ **Secure Authentication** - Login/logout with Supabase
✅ **Dashboard** - Real-time infrastructure overview
✅ **Node Management** - Browse and monitor all nodes
✅ **Reports Viewer** - Analyze Puppet run reports
✅ **Facts Browser** - Search and view node facts
✅ **Query Interface** - Execute custom PuppetDB queries
✅ **Role-Based Access** - Admin, Operator, and Viewer roles
✅ **Audit Logging** - Track all user actions
✅ **Responsive Design** - Works on mobile and desktop

## 3-Step Quick Deploy

### 1️⃣ Run Setup Script (5 minutes)

```bash
cd /path/to/puppet-ui
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**You'll be prompted for:**
- Supabase URL (from your Supabase project)
- Supabase Anon Key (from your Supabase project)
- PuppetDB URL (default: http://localhost:8082)
- Your server domain/IP

### 2️⃣ Create Admin User (2 minutes)

**In Supabase Dashboard:**
1. Go to Authentication → Users → Add User
2. Email: `admin@yourdomain.com`
3. Password: (create strong password)
4. Check "Auto Confirm User"

**In Supabase SQL Editor:**
```sql
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'System Administrator', 'admin', true
FROM auth.users
WHERE email = 'admin@yourdomain.com';
```

### 3️⃣ Access & Login (1 minute)

Open browser: `http://your-server-ip`

Login with your admin credentials.

**Done! 🎉**

---

## File Structure Overview

```
puppet-ui/
│
├── 📖 README.md              ← Project overview
├── 🚀 QUICKSTART.md          ← Fast deployment (you are here)
├── 📚 DEPLOYMENT.md          ← Detailed deployment guide
├── 📝 SETUP_SUMMARY.md       ← This file
│
├── scripts/
│   ├── setup.sh              ← Automated setup script
│   └── create-user.sql       ← User creation SQL
│
├── src/
│   ├── components/           ← React UI components
│   ├── services/             ← PuppetDB API client
│   ├── contexts/             ← Authentication state
│   └── lib/                  ← Supabase client
│
└── .env                      ← Configuration (created by setup)
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Your Browser                       │
│                                                       │
│  ┌─────────┐  ┌──────┐  ┌────────┐  ┌───────────┐  │
│  │Dashboard│  │Nodes │  │Reports │  │ Facts/Query│  │
│  └─────────┘  └──────┘  └────────┘  └───────────┘  │
└───────────────────────┬──────────────────────────────┘
                        │ HTTP/HTTPS
                        ▼
        ┌───────────────────────────────┐
        │   Nginx Web Server (Port 80)  │
        │   /var/www/puppet-ui/dist     │
        └───────────┬───────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌────────────────┐    ┌──────────────────┐
│   Supabase     │    │  Nginx Proxy     │
│  (Auth & DB)   │    │  (Port 8082)     │
│                │    │  + CORS          │
└────────────────┘    └────────┬─────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │    PuppetDB        │
                    │  :8081 REST API    │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │  Puppet Master     │
                    │   Infrastructure   │
                    └────────────────────┘
```

## What Gets Installed

### System Packages
- Node.js 20.x (JavaScript runtime)
- Nginx (web server and proxy)
- npm packages (React, TypeScript, etc.)

### Configuration Files Created
- `/var/www/puppet-ui/` - Application files
- `/etc/nginx/sites-available/puppet-ui` - Web server config
- `/etc/nginx/sites-available/puppetdb-proxy` - PuppetDB proxy config
- `/var/www/puppet-ui/.env` - Environment variables

### Nginx Ports Used
- **Port 80** - Web application (HTTP)
- **Port 443** - Web application (HTTPS, if SSL configured)
- **Port 8082** - PuppetDB proxy (localhost only)

## Important URLs

After deployment:

- **Web UI**: `http://your-server-ip` or `http://your-domain.com`
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **PuppetDB API**: `https://puppet.emudhra.local:8081`
- **PuppetDB Proxy**: `http://localhost:8082` (local only)

## Default Credentials

**After you create them:**
- Email: `admin@yourdomain.com`
- Password: (what you set in Supabase)

## Testing Your Deployment

### Quick Health Check

```bash
# 1. Test PuppetDB proxy
curl http://localhost:8082/pdb/query/v4/nodes

# 2. Check Nginx status
sudo systemctl status nginx

# 3. View application logs
sudo tail -f /var/log/nginx/access.log

# 4. Test web server
curl http://localhost
```

### Browser Test Checklist

1. ✅ Can access login page
2. ✅ Can login with credentials
3. ✅ Dashboard shows node statistics
4. ✅ Can navigate to Nodes page
5. ✅ Can see list of nodes
6. ✅ Can view node details
7. ✅ Can see reports
8. ✅ Can browse facts
9. ✅ Can execute queries
10. ✅ Can logout

## Common Issues & Quick Fixes

### Issue: "Cannot connect to PuppetDB"

**Fix:**
```bash
# Test proxy
curl http://localhost:8082/pdb/query/v4/nodes

# If fails, restart Nginx
sudo systemctl restart nginx
```

### Issue: "Login failed"

**Fix:**
```sql
-- Check user exists in Supabase SQL Editor
SELECT * FROM users WHERE email = 'your-email@example.com';

-- If not exists, run create-user.sql again
```

### Issue: "White screen after login"

**Fix:**
```bash
# Check browser console (F12) for errors
# Usually a PuppetDB connection issue

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### Issue: Wrong PuppetDB URL

**Fix:**
```bash
# Edit environment file
sudo nano /var/www/puppet-ui/.env

# Change VITE_PUPPETDB_URL to correct value
VITE_PUPPETDB_URL=http://your-correct-url

# Rebuild
cd /var/www/puppet-ui
npm run build
sudo systemctl restart nginx
```

## Adding SSL/HTTPS (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Follow prompts
# Certificate auto-renews every 90 days
```

## Managing Users

### Add Additional Users

1. Create auth user in Supabase Dashboard
2. Run SQL:

```sql
-- Add operator user
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'Operator Name', 'operator', true
FROM auth.users WHERE email = 'operator@domain.com';

-- Add viewer user
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'Viewer Name', 'viewer', true
FROM auth.users WHERE email = 'viewer@domain.com';
```

### Deactivate User

```sql
UPDATE users SET is_active = false WHERE email = 'user@domain.com';
```

## Maintenance Commands

```bash
# Restart Nginx
sudo systemctl restart nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# Update application
cd /var/www/puppet-ui
npm update
npm run build
sudo systemctl reload nginx

# Backup configuration
sudo tar -czf puppet-ui-backup.tar.gz \
  /var/www/puppet-ui \
  /etc/nginx/sites-available/puppet-ui \
  /etc/nginx/sites-available/puppetdb-proxy
```

## Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Strong passwords for all users
- [ ] Firewall configured (UFW)
- [ ] Regular system updates scheduled
- [ ] Nginx security headers enabled
- [ ] PuppetDB proxy restricted to localhost
- [ ] Supabase RLS policies active
- [ ] Audit logs being monitored

## Performance Tips

1. **Enable Gzip** (already configured)
2. **Cache static assets** (already configured)
3. **Use HTTPS** with HTTP/2
4. **Monitor Nginx logs** for slow queries
5. **Regular database backups** in Supabase

## Getting Help

### Documentation
- **QUICKSTART.md** - Fast start guide with troubleshooting
- **DEPLOYMENT.md** - Complete deployment instructions
- **README.md** - Project overview

### External Resources
- PuppetDB API: https://puppet.com/docs/puppetdb/latest/api/
- Supabase Docs: https://supabase.com/docs
- Nginx Docs: https://nginx.org/en/docs/

## Next Steps After Deployment

1. ✅ Set up HTTPS with SSL certificate
2. ✅ Create additional user accounts (operators, viewers)
3. ✅ Configure automated backups
4. ✅ Set up monitoring and alerts
5. ✅ Document your custom configurations
6. ✅ Train team members on the interface

## System Requirements

### Minimum
- 2 CPU cores
- 2GB RAM
- 10GB disk space
- Ubuntu 22.04 or similar

### Recommended
- 4 CPU cores
- 4GB RAM
- 20GB disk space
- Ubuntu 22.04 LTS

## Support Information

**This is a self-hosted application.** You have full control and can customize it as needed.

All source code is in the `src/` directory and can be modified to fit your requirements.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│         PUPPET MASTER WEB UI - QUICK REF            │
├─────────────────────────────────────────────────────┤
│ Application Path: /var/www/puppet-ui                │
│ Web Config:       /etc/nginx/sites-available/       │
│                   puppet-ui                          │
│ Proxy Config:     /etc/nginx/sites-available/       │
│                   puppetdb-proxy                     │
│ Logs:             /var/log/nginx/                   │
│ Environment:      /var/www/puppet-ui/.env           │
├─────────────────────────────────────────────────────┤
│ COMMANDS                                            │
│ Restart Nginx:    sudo systemctl restart nginx      │
│ View Logs:        sudo tail -f /var/log/nginx/      │
│                   error.log                          │
│ Rebuild App:      cd /var/www/puppet-ui &&          │
│                   npm run build                      │
│ Test PuppetDB:    curl http://localhost:8082/       │
│                   pdb/query/v4/nodes                 │
└─────────────────────────────────────────────────────┘
```

---

**Your Puppet infrastructure management is now modernized!** 🚀
