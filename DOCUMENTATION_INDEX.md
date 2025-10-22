# Documentation Index

Welcome to the Puppet Master Web UI documentation! This index helps you find the right guide for your needs.

## 🚀 Getting Started (Pick Your Style)

### For Quick Deployers
**[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - 3-step quick deploy (5-10 minutes)
- Fastest way to get running
- Perfect if you just want it working
- Includes troubleshooting

### For Visual Learners
**[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - Step-by-step with diagrams
- Screenshots and visual flow
- Perfect for first-time deployers
- See exactly what to click

### For Detailed Readers
**[QUICKSTART.md](QUICKSTART.md)** - Comprehensive quick start
- Testing checklist included
- Common problems solved
- Alternative deployment methods

### For Production Deployments
**[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete production guide
- Every detail explained
- Advanced configurations
- Security best practices
- Docker and PM2 options

## 📚 Reference Documentation

### Project Overview
**[README.md](README.md)** - Project information
- Feature list
- Architecture overview
- Technology stack
- Development setup

## 🛠️ Setup Resources

### Scripts
- **[scripts/setup.sh](scripts/setup.sh)** - Automated deployment script
- **[scripts/create-user.sql](scripts/create-user.sql)** - User creation SQL

### Configuration
- **[.env.example](.env.example)** - Environment variables template
- **[.env](.env)** - Your actual configuration (created during setup)

## 📖 How to Use This Documentation

### Scenario 1: "I just want it working NOW"
```
Read: SETUP_SUMMARY.md
Time: 10 minutes
Result: Working application
```

### Scenario 2: "I need to see what I'm doing"
```
Read: VISUAL_GUIDE.md
Time: 15 minutes
Result: Understanding + working application
```

### Scenario 3: "I want all the details"
```
Read: QUICKSTART.md → DEPLOYMENT.md
Time: 30 minutes
Result: Production-ready deployment
```

### Scenario 4: "I'm a developer"
```
Read: README.md → development section
Time: 20 minutes
Result: Development environment ready
```

### Scenario 5: "Something's broken"
```
Read: QUICKSTART.md → Troubleshooting
Or:   VISUAL_GUIDE.md → Troubleshooting
Time: 5 minutes
Result: Problem identified and fixed
```

## 🎯 Document Comparison

| Document | Length | Detail Level | Best For |
|----------|--------|--------------|----------|
| SETUP_SUMMARY.md | Short | Essential | Quick deploy |
| VISUAL_GUIDE.md | Medium | Visual | First-timers |
| QUICKSTART.md | Medium | Detailed | Most users |
| DEPLOYMENT.md | Long | Complete | Production |
| README.md | Medium | Overview | Understanding |

## 📋 Document Features

### SETUP_SUMMARY.md
- ✅ 3-step deployment
- ✅ Quick reference card
- ✅ Common commands
- ✅ Fast troubleshooting

### VISUAL_GUIDE.md
- ✅ Step-by-step screenshots
- ✅ Visual data flow
- ✅ UI mockups
- ✅ Troubleshooting diagrams

### QUICKSTART.md
- ✅ Prerequisites checklist
- ✅ Automated setup
- ✅ Testing procedures
- ✅ Security recommendations

### DEPLOYMENT.md
- ✅ Manual setup instructions
- ✅ Nginx configuration
- ✅ SSL/HTTPS setup
- ✅ Docker deployment
- ✅ Advanced security

### README.md
- ✅ Feature overview
- ✅ Architecture diagram
- ✅ Technology stack
- ✅ Development guide

## 🔍 Finding Information

### Authentication & Users
- Creating users: `scripts/create-user.sql`
- Login issues: `QUICKSTART.md` → Troubleshooting
- User roles: `README.md` → User Roles

### Configuration
- Environment setup: `.env.example`
- PuppetDB URL: `QUICKSTART.md` → Configuration
- Nginx setup: `DEPLOYMENT.md` → Step 5

### Troubleshooting
- Quick fixes: `SETUP_SUMMARY.md` → Common Issues
- Visual guide: `VISUAL_GUIDE.md` → Troubleshooting
- Detailed: `QUICKSTART.md` → Troubleshooting

### Security
- SSL/HTTPS: `DEPLOYMENT.md` → Step 6
- Best practices: `DEPLOYMENT.md` → Security
- Firewall: `QUICKSTART.md` → Step 5

### Deployment
- Automated: `scripts/setup.sh`
- Manual: `DEPLOYMENT.md`
- Docker: `DEPLOYMENT.md` → Alternative Options

## 📞 Support Resources

### Internal Documentation
1. Check relevant guide from list above
2. Search for keywords (Ctrl+F)
3. Follow troubleshooting sections

### External Resources
- PuppetDB API: https://puppet.com/docs/puppetdb/latest/api/
- Supabase Docs: https://supabase.com/docs
- Nginx Docs: https://nginx.org/en/docs/
- React Docs: https://react.dev

## 🎓 Learning Path

### Beginner Path
```
1. VISUAL_GUIDE.md (understand the system)
2. SETUP_SUMMARY.md (deploy it)
3. README.md (learn features)
```

### Intermediate Path
```
1. QUICKSTART.md (quick deploy)
2. README.md (explore features)
3. DEPLOYMENT.md (optimize setup)
```

### Advanced Path
```
1. README.md (architecture overview)
2. DEPLOYMENT.md (production setup)
3. Source code review (src/ directory)
```

## 📝 Documentation Updates

These documents are provided as-is. If you modify the application, consider updating:
- README.md for feature changes
- DEPLOYMENT.md for deployment procedure changes
- Configuration examples for new settings

## 🎯 Quick Links

### Most Common Tasks

| Task | Document | Section |
|------|----------|---------|
| Initial setup | SETUP_SUMMARY.md | Step 1-3 |
| Create user | scripts/create-user.sql | - |
| Add HTTPS | QUICKSTART.md | Optional |
| Fix login | QUICKSTART.md | Troubleshooting |
| PuppetDB issues | VISUAL_GUIDE.md | Troubleshooting |
| Commands | SETUP_SUMMARY.md | Quick Reference |

## 📊 Documentation Statistics

```
Total Documents: 6 main files
Total Words: ~15,000
Reading Time: 45-60 minutes (all)
Setup Time: 10-30 minutes
```

## ✅ Documentation Checklist

Use this to track what you've read:

- [ ] SETUP_SUMMARY.md - Quick overview
- [ ] VISUAL_GUIDE.md - Visual walkthrough
- [ ] QUICKSTART.md - Deployment guide
- [ ] DEPLOYMENT.md - Production setup
- [ ] README.md - Project overview
- [ ] scripts/create-user.sql - User setup

---

## 🎉 Ready to Start?

**Choose your journey:**

👉 **Just want it working?**
   → Start with `SETUP_SUMMARY.md`

👉 **Need to see steps?**
   → Start with `VISUAL_GUIDE.md`

👉 **Want full understanding?**
   → Start with `QUICKSTART.md`

👉 **Need production setup?**
   → Start with `DEPLOYMENT.md`

👉 **Are you a developer?**
   → Start with `README.md`

---

**All paths lead to a working Puppet Master Web UI! 🚀**
