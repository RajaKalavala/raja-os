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
    { label: 'Tasks', route: '/tasks', icon: 'checklist', badge: 10 },
    { label: 'Calendar', route: '/calendar', icon: 'calendar' },
    { label: 'Analytics', route: '/analytics', icon: 'bar-chart' },
    { label: 'Team', route: '/team', icon: 'group' },
  ];

  generalItems: GeneralItem[] = [
    { label: 'Settings', icon: 'settings' },
    { label: 'Help', icon: 'help' },
    { label: 'Logout', icon: 'logout' },
  ];

  onGeneralItemClick(item: GeneralItem): void {
    if (item.action) {
      item.action();
    }
    console.log(`${item.label} clicked`);
  }
}
