import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { LandingComponent } from './landing/landing.component';

export const appRoutes: Route[] = [
  {
    path: 'planner',
    loadChildren: () =>
      loadRemote<typeof import('planner/Routes')>('planner/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
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
  {
    path: 'aboutme',
    loadChildren: () =>
      loadRemote<typeof import('aboutme/Routes')>('aboutme/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'projects',
    loadChildren: () =>
      loadRemote<typeof import('projects/Routes')>('projects/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'blogs',
    loadChildren: () =>
      loadRemote<typeof import('blogs/Routes')>('blogs/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
];
