# Puppet Master Web UI

A modern, self-hosted web interface for managing Puppet infrastructure with PuppetDB integration. Simple deployment with no external dependencies.

## Features

### Authentication & Security
- Simple username/password authentication
- Local browser storage (no database required)
- Role-based access control (Admin, Operator, Viewer)
- Default admin account included

### Dashboard
- Real-time infrastructure overview
- Node statistics (total, active, failed, unchanged)
- Recent reports timeline
- Quick status indicators

### Node Management
- Complete node listing with search and filtering
- Status-based filtering (unchanged, changed, failed)
- Detailed node information viewer
- Environment tracking

### Reports Viewer
- Browse all Puppet run reports
- Filter by status and node name
- Detailed report information
- Transaction tracking

### Facts Browser
- Browse all available fact names
- View fact values across all nodes
- Search and filter capabilities
- JSON display for complex facts

### PuppetDB Query Interface
- Direct PuppetDB query execution
- Pre-built example queries
- JSON results viewer

## Quick Start

### Prerequisites

- Ubuntu 22.04 (or similar Linux)
- Puppet Master with PuppetDB running on `http://localhost:8080`
- Node.js 18+ and npm
- Nginx web server

### Installation (3 Steps)

**1. Install dependencies:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx

# Navigate to project
cd /path/to/puppet-ui

# Install packages
npm install
```

**2. Build and deploy:**
```bash
# Build production version
npm run build

# Copy to web directory
sudo mkdir -p /var/www/puppet-ui
sudo cp -r dist/* /var/www/puppet-ui/
```

**3. Configure Nginx:**
```bash
sudo tee /etc/nginx/sites-available/puppet-ui > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    root /var/www/puppet-ui;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/puppet-ui /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

**4. Access:**
Open browser: `http://your-server-ip`

**Default login:**
- Username: `admin`
- Password: `admin123`

## Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Nginx Server   │
│  (Port 80)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Web UI   │
│  (Static Files) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    PuppetDB     │
│  localhost:8080 │
└─────────────────┘
```

## Configuration

### PuppetDB URL

The application connects to PuppetDB at `http://localhost:8080`. To change this:

Edit `src/services/puppetdb.ts`:
```typescript
const PUPPETDB_URL = 'http://your-puppetdb-url:port';
```

Then rebuild:
```bash
npm run build
sudo cp -r dist/* /var/www/puppet-ui/
```

### User Management

Users are stored in browser localStorage. To manage users:

**Add a new user (in browser console - F12):**
```javascript
// Import the auth module functions
const { addUser } = await import('./lib/auth.js');

// Add user
addUser('username', 'password', 'Full Name', 'admin');
// Roles: 'admin', 'operator', 'viewer'
```

**Change password:**
```javascript
const { changePassword } = await import('./lib/auth.js');
changePassword('username', 'newpassword');
```

**Delete user:**
```javascript
const { deleteUser } = await import('./lib/auth.js');
deleteUser('username');
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: LocalStorage-based
- **Backend API**: PuppetDB REST API
- **Web Server**: Nginx

## Development

### Setup

```bash
npm install
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Deployment

### Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to web server:**
   ```bash
   sudo cp -r dist/* /var/www/puppet-ui/
   ```

3. **Restart Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

### Optional: HTTPS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com
```

## User Roles

- **Admin**: Full access to all features
- **Operator**: Can view and manage nodes
- **Viewer**: Read-only access

## Troubleshooting

### Cannot connect to PuppetDB

```bash
# Test PuppetDB directly
curl http://localhost:8080/pdb/query/v4/nodes

# Check if PuppetDB is running
sudo systemctl status puppetdb

# Check PuppetDB logs
sudo journalctl -u puppetdb -f
```

### Login issues

If you can't login:
- Default credentials: `admin` / `admin123`
- Clear browser localStorage (F12 → Application → Local Storage → Clear)
- Refresh the page

### White screen after login

Check browser console (F12) for errors:
- Usually a PuppetDB connection issue
- Verify PuppetDB is accessible at `localhost:8080`

## Security

### Change Default Password

**IMPORTANT**: Change the default admin password after first login!

In browser console (F12):
```javascript
const { changePassword } = await import('./lib/auth.js');
changePassword('admin', 'your-secure-password');
```

### Security Best Practices

1. Change default password immediately
2. Use HTTPS in production (see Optional HTTPS Setup)
3. Restrict access with firewall rules
4. Keep system packages updated
5. Use strong passwords for all accounts

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Performance

- Optimized production build
- Gzip compression
- Static asset caching
- Code splitting

## Maintenance

```bash
# Update application
cd /path/to/puppet-ui
npm update
npm run build
sudo cp -r dist/* /var/www/puppet-ui/

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

## License

This project is provided as-is for infrastructure management purposes.

## Support

- Check browser console (F12) for errors
- Verify PuppetDB is running and accessible
- Consult [PuppetDB API docs](https://puppet.com/docs/puppetdb/latest/api/)

---

**Simple, fast, and effective Puppet management!**
