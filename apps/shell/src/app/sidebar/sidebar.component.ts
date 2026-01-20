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
    { label: 'Dashboard', route: '/dashboard', icon: 'grid'},
    { label: 'System Overview', route: '/system-overview', icon: 'server' },
    { label: 'Production History', route: '/production-history', icon: 'history' },
    { label: 'Builds', route: '/builds', icon: 'folder' },
    { label: 'Architecture', route: '/architecture', icon: 'cpu' },
    { label: 'AI Lab', route: '/ai-lab', icon: 'beaker' },
    { label: 'Engineering Notes', route: '/engineering-notes', icon: 'book' },
    { label: 'Now', route: '/now', icon: 'clock' },
    { label: 'Ping Me', route: '/ping-me', icon: 'message-circle' },
  ];

  sidebarActions = [
      { icon: 'github', url: 'https://github.com/rajakalavala' }, // Replace with actual links if known, or placeholders
      { icon: 'linkedin', url: 'https://linkedin.com/in/rajakalavala' },
      { icon: 'download', action: 'download' }
  ];
}
