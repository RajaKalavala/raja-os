import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Project, ProjectCategory } from '../models/project.model';
import { PROJECTS_DATA } from '../data/projects.data';
import { AutomationsComponent } from '../automations/automations.component';
import { SupabaseService } from '@org/supabase';

@Component({
  selector: 'app-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
  standalone: true,
  imports: [AutomationsComponent],
})
export class ProjectsListComponent {
  private readonly supabaseService = inject(SupabaseService);
  readonly isAdmin = this.supabaseService.isAdmin;

  // Tabs
  activeTab = signal<'automations' | 'products'>('products');

  searchQuery = signal<string>('');
  selectedCategory = signal<ProjectCategory>('All');

  categories: ProjectCategory[] = [
    'All',
    'Web Apps',
    'APIs',
    'Open Source',
    'Architecture',
    'Full-Stack',
  ];

  allProjects: Project[] = PROJECTS_DATA;

  filteredProjects = computed(() => {
    let projects = this.allProjects;

    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'All') {
      if (category === 'Open Source') {
        projects = projects.filter((p) => p.isOpenSource);
      } else {
        projects = projects.filter((p) => p.category === category);
      }
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      projects = projects.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.techStack.some((t) => t.toLowerCase().includes(query))
      );
    }

    return projects;
  });

  // Stats
  totalProjects = computed(() => this.allProjects.length);
  openSourceCount = computed(
    () => this.allProjects.filter((p) => p.isOpenSource).length
  );
  productionCount = computed(
    () => this.allProjects.filter((p) => p.isProduction).length
  );

  constructor(private router: Router) {}

  setTab(tab: 'automations' | 'products') {
    this.activeTab.set(tab);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  selectCategory(category: ProjectCategory): void {
    this.selectedCategory.set(category);
  }

  navigateToProject(slug: string): void {
    this.router.navigate(['/projects', slug]);
  }

  getVisibleTechStack(techStack: string[]): string[] {
    return techStack.slice(0, 4);
  }

  getRemainingCount(techStack: string[]): number {
    return Math.max(0, techStack.length - 4);
  }
}
