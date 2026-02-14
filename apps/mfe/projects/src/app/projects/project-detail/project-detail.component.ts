import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../models/project.model';
import { PROJECTS_DATA } from '../data/projects.data';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
  standalone: true,
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  allProjects: Project[] = PROJECTS_DATA;

  relatedProjects = computed(() => {
    const current = this.project();
    if (!current) return [];

    return this.allProjects
      .filter((p) => p.id !== current.id)
      .filter(
        (p) =>
          p.category === current.category ||
          p.techStack.some((t) => current.techStack.includes(t))
      )
      .slice(0, 3);
  });

  previousProject = computed(() => {
    const current = this.project();
    if (!current) return null;

    const currentIndex = this.allProjects.findIndex((p) => p.id === current.id);
    if (currentIndex > 0) {
      return this.allProjects[currentIndex - 1];
    }
    return null;
  });

  nextProject = computed(() => {
    const current = this.project();
    if (!current) return null;

    const currentIndex = this.allProjects.findIndex((p) => p.id === current.id);
    if (currentIndex < this.allProjects.length - 1) {
      return this.allProjects[currentIndex + 1];
    }
    return null;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        const foundProject = this.allProjects.find((p) => p.slug === slug);
        if (foundProject) {
          this.project.set(foundProject);
          window.scrollTo(0, 0);
        } else {
          this.router.navigate(['/projects']);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  navigateToProject(slug: string): void {
    this.router.navigate(['/projects', slug]);
  }
}
