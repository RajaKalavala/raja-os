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

### Step 3: Create Shell App

```bash
npx nx g @nx/angular:app shell --routing --style=scss
```

