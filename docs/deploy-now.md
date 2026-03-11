# 🚀 Deploy RajaOS to Vercel NOW

## Quick Start (5 minutes)

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Easiest)
1. Go to **[vercel.com/new](https://vercel.com/new)**
2. Sign in with GitHub
3. Click "Import Project"
4. Select `RajaKalavala/raja-os`
5. Configure:
   - **Framework**: Other (or leave auto-detect)
   - **Root Directory**: `.` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/apps/shell`
6. Click **Deploy** ✨

#### Option B: Via CLI (Advanced)
```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Step 3: Visit Your Live App
After ~3-5 minutes, your app will be live at:
- **Production**: `https://raja-os.vercel.app`
- **Custom Domain** (optional): Configure in Vercel Dashboard

## What Gets Deployed

✅ **Shell (Host)** - Main application
✅ **Dashboard MFE** - With all interactive features
✅ **Experience MFE** - Landing page
✅ **Dark/Light Theme** - Fully functional
✅ **Module Federation** - All remotes bundled

## Configuration Already Done

✅ `vercel.json` - Build config
✅ `.vercelignore` - Optimized deployments
✅ `package.json` - Build scripts
✅ Production build tested locally

## After Deployment

### Add Custom Domain
1. Vercel Dashboard → Your Project
2. Settings → Domains
3. Add your domain (e.g., `rajaos.dev`)
4. Follow DNS instructions

### Enable Analytics
1. Vercel Dashboard → Your Project
2. Analytics tab
3. Enable Web Analytics

### Set Environment Variables (if needed)
1. Settings → Environment Variables
2. Add variables for Production/Preview/Development

## Automatic Updates

✅ Every push to `main` → Auto-deploys to production
✅ Every PR → Auto-creates preview deployment
✅ Build status shown in GitHub commits

## Troubleshooting

**Build fails?**
- Check build logs in Vercel Dashboard
- Verify local build works: `npm run build`

**404 on routes?**
- Already configured in `vercel.json`
- All routes redirect to `index.html`

**Need help?**
- See full guide: `docs/deployment.md`
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)

## Preview Before Production

Want to test first?
```bash
vercel
# Creates a preview deployment (not production)
```

Then when ready:
```bash
vercel --prod
```

---

**Ready to deploy?** Just run `git push` and visit [vercel.com/new](https://vercel.com/new)! 🎉
