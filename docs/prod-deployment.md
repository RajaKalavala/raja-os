# Production Deployment - Enabling a New MFE

This guide documents every step required to make a new micro frontend (MFE) available in the production deployment on Vercel.

## Prerequisites

- The MFE has been generated, builds successfully (`npx nx build <name>`), and works locally with `npx nx serve shell`.
- The MFE is already configured as a Module Federation remote with `exposes: { './Routes': '...' }` in its `module-federation.config.ts`.

## Checklist

There are **5 files** that must be updated. Missing any one of them will cause a `RUNTIME-004: Failed to locate remote` error in production.

### 1. Shell Module Federation Config

**File:** `apps/shell/module-federation.config.ts`

Add the new remote name to the `remotes` array.

```ts
const config: ModuleFederationConfig = {
  name: 'shell',
  remotes: ['dashboard', 'experience', '<new-mfe>'],
};
```

### 2. Local Development Manifest

**File:** `apps/shell/public/module-federation.manifest.json`

Add an entry pointing to the MFE's local dev server port.

```json
{
  "dashboard": "http://localhost:4202/mf-manifest.json",
  "<new-mfe>": "http://localhost:<port>/mf-manifest.json"
}
```

### 3. Production Manifest (reference)

**File:** `apps/shell/public/module-federation.manifest.prod.json`

Add an entry with the relative production path.

```json
{
  "dashboard": "/dashboard/mf-manifest.json",
  "<new-mfe>": "/<new-mfe>/mf-manifest.json"
}
```

### 4. Shell Routes

**File:** `apps/shell/src/app/app.routes.ts`

Add a route that lazy-loads the new remote.

```ts
{
  path: '<new-mfe>',
  loadChildren: () =>
    loadRemote<typeof import('<new-mfe>/Routes')>('<new-mfe>/Routes').then(
      (m) => m!.remoteRoutes,
    ),
},
```

### 5. Vercel Build Script (critical for production)

**File:** `scripts/build-for-vercel.sh`

Three changes are needed in this file:

**a) Add to the build command's `--projects` list:**

```bash
npx nx run-many -t build --configuration=production \
  --projects=dashboard,experience,...,<new-mfe>,shell --skip-nx-cache
```

**b) Add mkdir + cp commands to copy the build output:**

```bash
mkdir -p dist/apps/shell/<new-mfe>
cp -r dist/apps/mfe/<new-mfe>/* dist/apps/shell/<new-mfe>/
```

**c) Add to the inline production manifest JSON:**

```json
"<new-mfe>": "/<new-mfe>/mf-manifest.json"
```

## How It Works

Understanding the build pipeline helps prevent mistakes:

1. **Local dev** - The shell fetches `/module-federation.manifest.json` (the local manifest with `localhost` URLs). Each MFE runs on its own port and serves its own `mf-manifest.json`.

2. **Production build** (`scripts/build-for-vercel.sh`) -
   - Nx builds each MFE independently into `dist/apps/mfe/<name>/`.
   - The script copies each MFE's build output into `dist/apps/shell/<name>/` so everything is served from a single origin.
   - A production manifest is written to `dist/apps/shell/module-federation.manifest.json` with relative paths (`/<name>/mf-manifest.json`) instead of localhost URLs.

3. **Runtime** (`apps/shell/src/main.ts`) -
   - The shell fetches the manifest, registers all remotes via `@module-federation/enhanced/runtime`, then bootstraps Angular.
   - When a user navigates to a route, `loadRemote()` fetches the remote's `mf-manifest.json` and loads its JavaScript bundles.

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `RUNTIME-004: Failed to locate remote` | Remote not registered in manifest or build output missing | Verify all 5 files above are updated |
| 404 on `/<name>/mf-manifest.json` | MFE not built or not copied to shell output dir | Check build script `--projects` list and `cp` command |
| Works locally but not in production | Local manifest has the entry but production manifest doesn't | Update `build-for-vercel.sh` inline manifest JSON |
| `ChunkLoadError` | MFE built but with wrong `publicPath` | Ensure `webpack.prod.config.ts` uses `publicPath: 'auto'` |

## Quick Copy-Paste Template

Replace `<name>` and `<port>` with your MFE's values:

```bash
# 1. module-federation.config.ts - add '<name>' to remotes array
# 2. module-federation.manifest.json - add:
"<name>": "http://localhost:<port>/mf-manifest.json"
# 3. module-federation.manifest.prod.json - add:
"<name>": "/<name>/mf-manifest.json"
# 4. app.routes.ts - add route with loadRemote('<name>/Routes')
# 5. build-for-vercel.sh - add <name> to --projects, mkdir, cp, and manifest JSON
```
