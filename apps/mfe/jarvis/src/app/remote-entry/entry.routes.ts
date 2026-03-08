import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      { path: '', loadComponent: () => import('../pages/jarvis-home/jarvis-home.component').then(m => m.JarvisHomeComponent) },
      { path: 'briefing', loadComponent: () => import('../pages/briefing/briefing.component').then(m => m.BriefingComponent) },
      { path: 'chat', loadComponent: () => import('../pages/chat/chat.component').then(m => m.ChatComponent) },
      { path: 'focus', loadComponent: () => import('../pages/focus/focus.component').then(m => m.FocusComponent) },
      { path: 'metrics', loadComponent: () => import('../pages/metrics/metrics.component').then(m => m.MetricsComponent) },
      { path: 'capture', loadComponent: () => import('../pages/capture/capture.component').then(m => m.CaptureComponent) },
      { path: 'review', loadComponent: () => import('../pages/review/review.component').then(m => m.ReviewComponent) },
      { path: 'memory', loadComponent: () => import('../pages/memory-manager/memory-manager.component').then(m => m.MemoryManagerComponent) },
    ],
  },
];
