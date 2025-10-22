# Puppet Master Web UI - Visual Deployment Guide

## 📋 Overview

This visual guide shows you exactly what to do, step by step, to deploy your Puppet Master Web UI.

---

## 🎯 Step 1: Prepare Your Server

### What You Need:
```
✅ Ubuntu 22.04 Server
✅ Puppet Master Running
✅ PuppetDB Running at https://puppet.emudhra.local:8081
✅ SSH Access to Server
✅ Supabase Account (free tier is fine)
```

### Get Your Supabase Credentials:

1. **Login to Supabase**: https://supabase.com/dashboard

2. **Find Your Project Settings**:
   ```
   Supabase Dashboard
   └── Select Your Project
       └── Settings (gear icon)
           └── API
               ├── Project URL: https://xxxxx.supabase.co
               └── Project API keys
                   └── anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Copy These Two Values** - You'll need them!

---

## 🚀 Step 2: Run the Setup Script

### On Your Server:

```bash
# Navigate to where you extracted the puppet-ui folder
cd /path/to/puppet-ui

# Make the setup script executable
chmod +x scripts/setup.sh

# Run the setup script
./scripts/setup.sh
```

### What Happens:
```
┌─────────────────────────────────────────┐
│  Installing Node.js...         ✓        │
│  Installing Nginx...           ✓        │
│  Creating directories...       ✓        │
│  Installing dependencies...    ✓        │
│  Building application...       ✓        │
│  Configuring Nginx...          ✓        │
└─────────────────────────────────────────┘
```

### You'll Be Asked For:

```
>>> Enter your information:

Supabase URL: https://xxxxx.supabase.co
Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PuppetDB URL (default: http://localhost:8082): [Press Enter]
Server domain or IP: 192.168.1.100
```

---

## 👤 Step 3: Create Your Admin User

### Part A: Create Auth User in Supabase

```
Supabase Dashboard
└── Authentication
    └── Users
        └── Add user (+ button)
            ├── Email: admin@yourdomain.com
            ├── Password: ••••••••••
            ├── Auto Confirm User: [✓] CHECKED
            └── Create user [Click]
```

**Visual Flow:**
```
┌──────────────────────────────────────┐
│  Supabase Dashboard                  │
│  ┌────────────────────────────────┐  │
│  │ Authentication                 │  │
│  │   Users (3)                    │  │
│  │   ┌──────────────────────────┐ │  │
│  │   │ + Add user               │ │  │
│  │   └──────────────────────────┘ │  │
│  │                                │  │
│  │   Email: admin@yourdomain.com │  │
│  │   Password: ••••••••          │  │
│  │   ☑ Auto Confirm User         │  │
│  │                                │  │
│  │   [Create user]                │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Part B: Add User to Database

```
Supabase Dashboard
└── SQL Editor
    └── New Query
        └── Paste this SQL:
```

```sql
INSERT INTO users (email, full_name, role, is_active)
SELECT email, 'System Administrator', 'admin', true
FROM auth.users
WHERE email = 'admin@yourdomain.com';
```

**Then click "RUN" or press Ctrl+Enter**

```
┌──────────────────────────────────────┐
│  SQL Editor                          │
│  ┌────────────────────────────────┐  │
│  │ 1  INSERT INTO users (email... │  │
│  │ 2  SELECT email, 'System ...'  │  │
│  │ 3  FROM auth.users             │  │
│  │ 4  WHERE email = 'admin@...'   │  │
│  └────────────────────────────────┘  │
│                                      │
│  [RUN] ← Click this                  │
│                                      │
│  ✓ Success. 1 row inserted.          │
└──────────────────────────────────────┘
```

---

## 🌐 Step 4: Access Your Application

### Open Your Browser:

```
http://192.168.1.100
(or your server IP/domain)
```

### You'll See the Login Screen:

```
┌─────────────────────────────────────────────┐
│                                             │
│         🔒 Puppet Master UI                 │
│                                             │
│     Sign in to manage your infrastructure   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📧 Email Address                    │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │ you@example.com                 │ │   │
│  │ └─────────────────────────────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 🔑 Password                         │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │ ••••••••                        │ │   │
│  │ └─────────────────────────────────┘ │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │       🔓 Sign In                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### After Login - Dashboard:

```
┌──────────────────────────────────────────────────────────┐
│  🔶 Puppet Master UI    [Dashboard] [Nodes] [Reports] ...│
│                                                           │
│  Dashboard                                                │
│  Overview of your Puppet infrastructure                   │
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────┐│
│  │ Total      │  │ Active     │  │ Failed     │  │ Un- ││
│  │ Nodes      │  │ Nodes      │  │ Nodes      │  │ chgd││
│  │            │  │            │  │            │  │     ││
│  │    42      │  │    40      │  │     2      │  │  38 ││
│  └────────────┘  └────────────┘  └────────────┘  └─────┘│
│                                                           │
│  Recent Nodes                    Recent Reports           │
│  ┌─────────────────────────┐    ┌────────────────────┐   │
│  │ ✓ node1.local           │    │ ✓ node1.local      │   │
│  │ ✗ node2.local           │    │ ⟳ node3.local      │   │
│  │ ✓ node3.local           │    │ ✓ node4.local      │   │
│  └─────────────────────────┘    └────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 🎨 Application Features Overview

### Navigation:

```
Top Menu:
┌─────────────────────────────────────────────────────────┐
│ 🔶 Puppet Master UI                                     │
│                                                         │
│  [Dashboard] [Nodes] [Reports] [Facts] [Query] [Logout]│
└─────────────────────────────────────────────────────────┘
```

### 1. Dashboard
```
Purpose: Overview of your infrastructure
Shows:  • Total node count
        • Active/Failed/Unchanged nodes
        • Recent node activity
        • Latest reports
```

### 2. Nodes
```
Purpose: Manage and monitor nodes
Features: • Search nodes by name
          • Filter by status
          • View detailed node info
          • See catalog/facts timestamps
```

### 3. Reports
```
Purpose: Analyze Puppet run reports
Features: • View all reports
          • Filter by status/node
          • See run duration
          • Check configuration changes
```

### 4. Facts
```
Purpose: Browse node facts
Features: • List all fact names
          • View fact values per node
          • Search facts
          • View complex JSON facts
```

### 5. Query
```
Purpose: Execute custom PuppetDB queries
Features: • Write PQL queries
          • Pre-built examples
          • JSON result viewer
          • Query documentation
```

---

## 🔍 Verification Checklist

After deployment, verify everything works:

### ✅ Basic Checks:

```bash
# 1. Check Nginx is running
sudo systemctl status nginx

# Should show: "active (running)"
```

```bash
# 2. Test PuppetDB proxy
curl http://localhost:8082/pdb/query/v4/nodes

# Should return JSON with node data
```

```bash
# 3. Check application files exist
ls -la /var/www/puppet-ui/dist/

# Should show index.html and assets folder
```

### ✅ Browser Checks:

```
1. [ ] Login page loads
2. [ ] Can login with credentials
3. [ ] Dashboard shows node counts
4. [ ] Nodes page shows list of nodes
5. [ ] Can click on a node to see details
6. [ ] Reports page shows recent reports
7. [ ] Facts page shows fact names
8. [ ] Can select a fact and see values
9. [ ] Query page loads with examples
10. [ ] Can execute a test query
11. [ ] Can logout successfully
```

---

## 🐛 Troubleshooting Visual Guide

### Problem: Can't Access Web UI

```
Browser shows: "This site can't be reached"

Check:
┌─────────────────────────────────────┐
│ 1. Is Nginx running?                │
│    $ sudo systemctl status nginx    │
│                                     │
│ 2. Is firewall open?                │
│    $ sudo ufw status                │
│    $ sudo ufw allow 80              │
│                                     │
│ 3. Correct IP/domain?               │
│    $ hostname -I                    │
└─────────────────────────────────────┘
```

### Problem: Login Fails

```
Error: "Invalid credentials"

Check:
┌─────────────────────────────────────┐
│ 1. User exists in Supabase?         │
│    Dashboard → Authentication → Users│
│                                     │
│ 2. User in database?                │
│    Run in SQL Editor:               │
│    SELECT * FROM users              │
│    WHERE email = 'your@email.com';  │
│                                     │
│ 3. Correct password?                │
│    Try password reset in Supabase   │
└─────────────────────────────────────┘
```

### Problem: No Nodes/Data Showing

```
Dashboard shows: "0 nodes" or errors

Check:
┌─────────────────────────────────────┐
│ 1. PuppetDB accessible?             │
│    $ curl -k https://puppet.       │
│      emudhra.local:8081/pdb/       │
│      query/v4/nodes                 │
│                                     │
│ 2. Proxy working?                   │
│    $ curl http://localhost:8082/   │
│      pdb/query/v4/nodes             │
│                                     │
│ 3. Check browser console (F12)      │
│    Look for network errors          │
└─────────────────────────────────────┘
```

---

## 🔒 Optional: Add HTTPS

### Why?
- Secure your login
- Encrypt all data
- Professional setup

### How?

```bash
# Step 1: Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Step 2: Get certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Step 3: Follow prompts
# Certbot will:
# ✓ Verify domain ownership
# ✓ Get certificate
# ✓ Configure Nginx automatically
# ✓ Set up auto-renewal

# Done! Now access via:
# https://your-domain.com
```

**Before HTTPS:**
```
http://your-domain.com → ⚠️ Not Secure
```

**After HTTPS:**
```
https://your-domain.com → 🔒 Secure
```

---

## 📊 System Resource Usage

### Typical Resource Consumption:

```
┌─────────────────────────────────┐
│ Component     │ Memory │ CPU   │
├─────────────────────────────────┤
│ Nginx         │  ~10MB │ <1%   │
│ Node (build)  │ ~200MB │ Temp  │
│ Application   │   ~5MB │ <1%   │
├─────────────────────────────────┤
│ Total         │ ~215MB │ <2%   │
└─────────────────────────────────┘

Note: Node is only used during build,
not in production runtime.
```

---

## 🎓 Understanding the Architecture

### Data Flow:

```
1. You open browser
   ↓
2. Browser loads React app from Nginx
   ↓
3. You login → Supabase authenticates
   ↓
4. Dashboard loads → Browser calls PuppetDB
   ↓
5. Request goes to Nginx proxy (port 8082)
   ↓
6. Nginx adds CORS headers
   ↓
7. Nginx forwards to PuppetDB (:8081)
   ↓
8. PuppetDB returns node data
   ↓
9. Browser displays in nice UI
```

### Why This Setup?

```
Browser → Nginx Proxy → PuppetDB
         ↑
         └─ Adds CORS headers
         └─ Handles SSL
         └─ Provides security
```

Without proxy, browsers block direct PuppetDB access (CORS policy).

---

## 📱 Mobile Access

Your Puppet Master UI works on mobile devices too!

### From Your Phone:

1. **Connect to same network** as server
2. **Open browser** (Chrome/Safari)
3. **Navigate to** `http://server-ip`
4. **Login** with your credentials

### Mobile View:
```
┌────────────────┐
│ ☰  Puppet UI   │  ← Hamburger menu
├────────────────┤
│                │
│  Total Nodes   │
│      42        │
│                │
│  Active: 40    │
│  Failed: 2     │
│                │
│  [View Nodes]  │
│                │
└────────────────┘
```

---

## 🎯 Quick Commands Reference

### Frequently Used:

```bash
# Restart everything
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log

# Test PuppetDB
curl http://localhost:8082/pdb/query/v4/nodes

# Check if running
sudo systemctl status nginx

# Rebuild app (after code changes)
cd /var/www/puppet-ui && npm run build
```

---

## ✨ You're Done!

Your Puppet Master now has a modern web interface!

### What You Can Do Now:

- ✅ Monitor all nodes in real-time
- ✅ View detailed reports
- ✅ Search and browse facts
- ✅ Execute custom queries
- ✅ Manage from anywhere
- ✅ Use on mobile devices

### Next Steps:

1. Create additional users (operators, viewers)
2. Set up HTTPS for secure access
3. Bookmark the URL
4. Train your team
5. Enjoy modern Puppet management!

---

**Need Help?**
- See `QUICKSTART.md` for detailed troubleshooting
- See `DEPLOYMENT.md` for advanced configuration
- See `README.md` for project overview

**Happy Puppet Managing! 🚀**
