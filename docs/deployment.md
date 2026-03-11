# RajaOS - Vercel Deployment Guide

## Prerequisites

1. **GitHub Repository**: Code must be pushed to GitHub
   - Repository: `https://github.com/RajaKalavala/raja-os.git`

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select your GitHub account
   - Choose the `raja-os` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Select "Other" (Nx is auto-detected)
   - **Root Directory**: Leave as `.` (root)
   - **Build Command**: `npm run build` (or `npx nx build shell --prod`)
   - **Output Directory**: `dist/apps/shell/browser`
   - **Install Command**: `npm install`

4. **Environment Variables** (if needed)
   - Add any required environment variables
   - Example: `NODE_ENV=production`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~3-5 minutes)

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration Files

### `vercel.json`
The project includes a `vercel.json` configuration file with:
- Build command for Nx monorepo
- Output directory for Angular shell app
- SPA routing configuration
- Security headers

### Build Configuration
- **Build Command**: Builds the shell (host) application which includes all Module Federation remotes
- **Output**: Static files in `dist/apps/shell/browser`
- **Framework**: Angular 21 with Module Federation

## Module Federation Setup

The app uses Module Federation for micro-frontends:
- **Shell (Host)**: Main app on port 4200
- **Dashboard (Remote)**: Loaded dynamically on port 4202
- **Experience (Remote)**: Loaded dynamically on port 4203

In production, all remotes are bundled together during the shell build.

## Post-Deployment

### Custom Domain
1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `rajaos.dev`)
4. Follow DNS configuration instructions

### Environment Variables
Configure in: Project Settings → Environment Variables
- Add variables for different environments (Production, Preview, Development)

### Build Cache
Vercel automatically caches:
- `node_modules`
- Nx build cache
- Angular build artifacts

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `dependencies` (not just `devDependencies`)

### Module Federation Issues
- Ensure all remote apps are built before shell
- Check webpack configuration in `apps/*/webpack.config.ts`
- Verify paths in Module Federation config

### 404 on Routes
- Ensure `vercel.json` has correct routing configuration
- All routes should redirect to `index.html` for SPA

### Build Budget Exceeded
- Current budgets set in `project.json`:
  - Initial: 500kb warning, 1mb error
  - Component styles: 8kb warning, 12kb error

## Production URLs

After deployment, you'll receive:
- **Production URL**: `https://raja-os.vercel.app`
- **Preview URLs**: Auto-generated for each branch/PR

## Continuous Deployment

Vercel automatically:
- Deploys on every push to `main` branch → Production
- Creates preview deployments for PRs
- Runs build checks and provides deployment status

## Performance

- **Build Time**: ~3-5 minutes
- **Cold Start**: < 1 second (Static files)
- **CDN**: Global edge network
- **Automatic Optimizations**:
  - Image optimization
  - Automatic HTTPS
  - Gzip/Brotli compression

## Monitoring

View in Vercel Dashboard:
- Build logs
- Deployment history
- Analytics (if enabled)
- Function logs (for SSR if added)

## Resources

- [Vercel Nx Documentation](https://vercel.com/docs/frameworks/nx)
- [Angular on Vercel](https://vercel.com/docs/frameworks/angular)
- [Module Federation Guide](https://webpack.js.org/concepts/module-federation/)
