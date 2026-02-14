#!/bin/bash

# Build script for Vercel deployment
# This script builds all MFEs and copies them to the shell output directory

set -e

echo "🏗️ Building all applications for production..."

# Build all remotes and shell in one command to ensure fresh build
echo "🏠 Building all applications..."
npx nx run-many -t build --configuration=production --projects=dashboard,experience,aboutme,projects,blogs,shell --skip-nx-cache

# Copy remote builds to shell output directory
echo "📁 Copying remotes to shell output..."
mkdir -p dist/apps/shell/dashboard
mkdir -p dist/apps/shell/experience
mkdir -p dist/apps/shell/aboutme
mkdir -p dist/apps/shell/projects
mkdir -p dist/apps/shell/blogs

cp -r dist/apps/mfe/dashboard/* dist/apps/shell/dashboard/
cp -r dist/apps/mfe/experience/* dist/apps/shell/experience/
cp -r dist/apps/mfe/aboutme/* dist/apps/shell/aboutme/
cp -r dist/apps/mfe/projects/* dist/apps/shell/projects/
cp -r dist/apps/mfe/blogs/* dist/apps/shell/blogs/

# Update manifest with relative paths for production
echo "📝 Creating production manifest..."
cat > dist/apps/shell/module-federation.manifest.json << 'EOF'
{
  "dashboard": "/dashboard/mf-manifest.json",
  "experience": "/experience/mf-manifest.json",
  "aboutme": "/aboutme/mf-manifest.json",
  "projects": "/projects/mf-manifest.json",
  "blogs": "/blogs/mf-manifest.json"
}
EOF

echo "✅ Build complete! Output in dist/apps/shell/"
