#!/bin/bash

# Build script for Vercel deployment
# This script builds all MFEs and copies them to the shell output directory

set -e

echo "🏗️ Building all applications for production..."

# Build the remotes first
echo "📦 Building dashboard remote..."
npx nx build dashboard --prod

echo "📦 Building experience remote..."
npx nx build experience --prod

# Build the shell (host)
echo "🏠 Building shell (host)..."
npx nx build shell --prod

# Copy remote builds to shell output directory
echo "📁 Copying remotes to shell output..."
mkdir -p dist/apps/shell/dashboard
mkdir -p dist/apps/shell/experience

cp -r dist/apps/mfe/dashboard/* dist/apps/shell/dashboard/
cp -r dist/apps/mfe/experience/* dist/apps/shell/experience/

# Update manifest with relative paths for production
echo "📝 Creating production manifest..."
cat > dist/apps/shell/module-federation.manifest.json << 'EOF'
{
  "dashboard": "/dashboard/mf-manifest.json",
  "experience": "/experience/mf-manifest.json"
}
EOF

echo "✅ Build complete! Output in dist/apps/shell/"
