import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Experience', route: '/experience', icon: 'history' },
    { label: 'Blogs', route: '/blogs', icon: 'book' },
  ];

  sidebarActions = [
    { icon: 'github', url: 'https://github.com/rajakalavala' },
    { icon: 'linkedin', url: 'https://linkedin.com/in/rajakalavala' },
    { icon: 'download', action: 'download' },
  ];

  onNavItemClick() {
    if (this.isMobile()) {
      this.closed.emit();
    }
  }

  onClose() {
    this.closed.emit();
  }
}
