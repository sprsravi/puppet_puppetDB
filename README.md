# Puppet Master Web UI

A modern, self-hosted web interface for managing Puppet infrastructure with PuppetDB integration.

## Features

### Authentication & Security
- Secure login/logout with session management
- Role-based access control (Admin, Operator, Viewer)
- Audit logging for compliance
- Supabase-powered authentication

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
- Timestamp monitoring for catalogs, facts, and reports

### Reports Viewer
- Browse all Puppet run reports
- Filter by status and node name
- Detailed report information (duration, timestamps, versions)
- Transaction and catalog tracking

### Facts Browser
- Browse all available fact names
- View fact values across all nodes
- Search and filter capabilities
- Support for complex fact values with JSON display
- Environment-specific fact viewing

### PuppetDB Query Interface
- Direct PuppetDB query execution
- Pre-built example queries
- JSON syntax highlighting for results
- Query documentation integration

### Additional Features
- Responsive design (mobile & desktop)
- Clean, modern UI with professional styling
- Direct PuppetDB REST API integration
- Comprehensive error handling
- Real-time data updates

## Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Nginx Server   │
│  (Port 80/443)  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ React   │ │ Nginx Proxy  │
│ Web UI  │ │ (Port 8082)  │
└─────────┘ └──────┬───────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌──────────┐              ┌─────────────┐
│ Supabase │              │  PuppetDB   │
│   Auth   │              │   :8081     │
└──────────┘              └─────────────┘
```

## Quick Start

### Prerequisites

- Ubuntu 22.04 server
- Puppet Master installed and running
- PuppetDB accessible at `https://puppet.emudhra.local:8081`
- Supabase account

### Installation

1. **Run the setup script:**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Create admin user in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - Add a new user
   - Run the SQL from `scripts/create-user.sql`

3. **Access the application:**
   ```
   http://your-server-ip
   ```

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md)

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Fast deployment guide with troubleshooting
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Comprehensive production deployment guide
- **[scripts/create-user.sql](scripts/create-user.sql)** - SQL for creating user accounts

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Backend API**: PuppetDB REST API
- **Web Server**: Nginx
- **State Management**: React Context API

## Project Structure

```
puppet-ui/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Nodes.tsx        # Node management
│   │   ├── Reports.tsx      # Report viewer
│   │   ├── Facts.tsx        # Facts browser
│   │   ├── Query.tsx        # Query interface
│   │   └── Login.tsx        # Authentication
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state
│   ├── services/
│   │   └── puppetdb.ts      # PuppetDB API client
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── App.tsx              # Main application
│   └── main.tsx             # Application entry
├── scripts/
│   ├── setup.sh             # Automated setup script
│   └── create-user.sql      # User creation SQL
├── QUICKSTART.md            # Quick start guide
├── DEPLOYMENT.md            # Full deployment guide
└── README.md                # This file
```

## Configuration

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_PUPPETDB_URL=http://localhost:8082
```

### PuppetDB Configuration

The application connects to PuppetDB through an Nginx proxy to handle CORS. Configuration is in:
- `/etc/nginx/sites-available/puppetdb-proxy`

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## User Roles

### Admin
- Full access to all features
- Can view all nodes, reports, and facts
- Can execute custom queries
- View audit logs

### Operator
- Read and write access
- Can view nodes, reports, and facts
- Limited administrative functions

### Viewer
- Read-only access
- Can view all data
- Cannot modify settings or execute queries

## Security Features

- Secure authentication with Supabase
- Row Level Security (RLS) policies
- Session management with expiration
- Audit logging for all actions
- HTTPS support (with SSL configuration)
- CORS protection
- Security headers (X-Frame-Options, X-Content-Type-Options)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Cannot connect to PuppetDB

```bash
# Test PuppetDB directly
curl -k https://puppet.emudhra.local:8081/pdb/query/v4/nodes

# Test proxy
curl http://localhost:8082/pdb/query/v4/nodes

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Login issues

```sql
-- Verify user exists in Supabase SQL Editor
SELECT * FROM users WHERE email = 'your-email@example.com';
```

For more troubleshooting, see [QUICKSTART.md](QUICKSTART.md#troubleshooting)

## Performance

- Optimized production build with Vite
- Gzip compression enabled
- Static asset caching (1 year)
- Code splitting for faster loads
- Lazy loading for components

## Maintenance

### Regular Tasks

1. **Update packages:**
   ```bash
   cd /var/www/puppet-ui
   npm update
   npm audit fix
   npm run build
   ```

2. **Monitor logs:**
   ```bash
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Backup database:**
   - Use Supabase dashboard for automated backups

4. **Update SSL certificates:**
   ```bash
   sudo certbot renew
   ```

## Contributing

This is a self-hosted application for your infrastructure. Feel free to customize it for your needs.

## License

This project is provided as-is for infrastructure management purposes.

## Support

For issues or questions:
- Check [QUICKSTART.md](QUICKSTART.md) for common solutions
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup
- Consult [PuppetDB API docs](https://puppet.com/docs/puppetdb/latest/api/)
- Check [Supabase documentation](https://supabase.com/docs)

## Acknowledgments

- Built with React and TypeScript
- Styled with Tailwind CSS
- Icons by Lucide
- Authentication by Supabase
- Infrastructure management by Puppet

---

**Ready to manage your Puppet infrastructure with style!**
