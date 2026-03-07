import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { SupabaseService } from '@org/supabase';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true,
})
export class SidebarComponent {
  isOpen = input(false);
  isMobile = input(false);
  closed = output<void>();
  themeService = inject(ThemeService);
  supabaseService = inject(SupabaseService);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'About Me', route: '/aboutme', icon: 'person' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Experience', route: '/experience', icon: 'history' },
    { label: 'My Planner', route: '/planner', icon: 'clipboard', adminOnly: true },
    { label: 'Blogs', route: '/blogs', icon: 'book' },
  ];

  readonly visibleMenuItems = computed(() =>
    this.menuItems.filter((item) => !item.adminOnly || this.supabaseService.isAdmin())
  );

  onNavItemClick() {
    if (this.isMobile()) {
      this.closed.emit();
    }
  }

  onClose() {
    this.closed.emit();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openAdminLogin() {
    // Trigger admin login modal in dashboard via localStorage event
    localStorage.setItem('openAdminLogin', Date.now().toString());
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'openAdminLogin',
        newValue: Date.now().toString(),
      }),
    );
    if (this.isMobile()) {
      this.closed.emit();
    }
  }

  async adminLogout() {
    await this.supabaseService.signOut();
    if (this.isMobile()) {
      this.closed.emit();
    }
  }
}
