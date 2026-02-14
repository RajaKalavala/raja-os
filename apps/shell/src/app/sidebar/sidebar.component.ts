import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
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

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'About Me', route: '/aboutme', icon: 'resume' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Experience', route: '/experience', icon: 'history' },
    { label: 'Blogs', route: '/blogs', icon: 'book' },
  ];

  sidebarActions = [
    { icon: 'github', url: 'https://github.com/rajakalavala' },
    { icon: 'linkedin', url: 'https://linkedin.com/in/rajakalavala' },
  ];

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
}
