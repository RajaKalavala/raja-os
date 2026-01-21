import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

interface GeneralItem {
  label: string;
  icon: string;
  action?: () => void;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true,
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Experience', route: '/experience', icon: 'history' },
    { label: 'Blogs', route: '/blogs', icon: 'book' },
  ];

  sidebarActions = [
    { icon: 'github', url: 'https://github.com/rajakalavala' }, // Replace with actual links if known, or placeholders
    { icon: 'linkedin', url: 'https://linkedin.com/in/rajakalavala' },
    { icon: 'download', action: 'download' },
  ];
}
