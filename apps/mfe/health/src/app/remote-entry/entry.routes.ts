import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    children: [
      { path: '', loadComponent: () => import('../pages/health-home/health-home.component').then(m => m.HealthHomeComponent) },
      { path: 'vitals', loadComponent: () => import('../pages/vitals/vitals.component').then(m => m.VitalsComponent) },
      { path: 'vault', loadComponent: () => import('../pages/medical-vault/medical-vault.component').then(m => m.MedicalVaultComponent) },
      { path: 'labs', loadComponent: () => import('../pages/lab-tracker/lab-tracker.component').then(m => m.LabTrackerComponent) },
      { path: 'advisor', loadComponent: () => import('../pages/health-advisor/health-advisor.component').then(m => m.HealthAdvisorComponent) },
      { path: 'medications', loadComponent: () => import('../pages/medications/medications.component').then(m => m.MedicationsComponent) },
      { path: 'emergency', loadComponent: () => import('../pages/emergency-card/emergency-card.component').then(m => m.EmergencyCardComponent) },
      { path: 'body-map', loadComponent: () => import('../pages/body-map/body-map.component').then(m => m.BodyMapComponent) },
      { path: 'correlations', loadComponent: () => import('../pages/correlations/correlations.component').then(m => m.CorrelationsComponent) },
      { path: 'timeline', loadComponent: () => import('../pages/timeline/health-timeline.component').then(m => m.HealthTimelineComponent) },
    ],
  },
];
