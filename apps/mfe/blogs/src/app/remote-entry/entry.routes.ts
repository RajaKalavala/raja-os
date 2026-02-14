import { Route } from '@angular/router';
import { BlogListComponent } from '../blogs/blog-list/blog-list.component';
import { BlogDetailComponent } from '../blogs/blog-detail/blog-detail.component';

export const remoteRoutes: Route[] = [
  { path: '', component: BlogListComponent },
  { path: ':slug', component: BlogDetailComponent },
];
