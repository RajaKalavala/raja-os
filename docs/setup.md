# Setup

### Step 1: Create Nx Monorepo (Angular)

```bash
npx create-nx-workspace@latest raja-os
```

### Step 2: Install Angular MFE Support

```bash
npm install @nx/angular
npm install @angular-architects/module-federation
```

### Step 3: Create Shell app

```bash
npx nx g @nx/angular:app ./apps/shell --routing --style=scss
```

### Step 4: Configure Shell app as Host

```bash
nx g @angular-architects/module-federation:init --project shell --type host
```