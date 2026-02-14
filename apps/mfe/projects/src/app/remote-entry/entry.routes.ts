import { Route } from '@angular/router';
import { ProjectsListComponent } from '../projects/projects-list/projects-list.component';
import { ProjectDetailComponent } from '../projects/project-detail/project-detail.component';

export const remoteRoutes: Route[] = [
  { path: '', component: ProjectsListComponent },
  { path: ':slug', component: ProjectDetailComponent },
];
