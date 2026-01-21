# Setup

Link to this page: [NX Module Federation](https://github.com/raja-os/nx-angular-mfe)

### Step 1: Create Nx Monorepo (Angular)

```bash
npx create-nx-workspace@latest raja-os
```

### Step 2: Install Angular MFE Support

```bash
npm install @nx/angular
npm install @angular-architects/module-federation
```

### Step 3: Add Host App

Static App:

```bash
npx nx g @nx/angular:host apps/shell --prefix=app
```

Dynamic App:

```bash
npx nx g @nx/angular:host apps/shell --prefix=app --dynamic
```

### Step 4: Add MFE Apps

```bash
npx nx g @nx/angular:remote apps/mfe/dashboard --prefix=raja
```

### Step 5: Add Shared Libraries

```bash
npx nx g @nx/angular:lib libs/design-system
```
