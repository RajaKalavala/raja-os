import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { LandingComponent } from './landing/landing.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      loadRemote<typeof import('dashboard/Routes')>('dashboard/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'experience',
    loadChildren: () =>
      loadRemote<typeof import('experience/Routes')>('experience/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
];
