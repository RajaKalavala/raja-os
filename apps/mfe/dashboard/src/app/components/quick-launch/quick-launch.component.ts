import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface QuickAction {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-quick-launch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-launch.component.html',
  styleUrl: './quick-launch.component.scss',
})
export class QuickLaunchComponent {
  actions: QuickAction[] = [
    { label: 'Resume', icon: 'resume', route: '/resume' },
    { label: 'Terminal', icon: 'terminal', route: '/terminal' },
    { label: 'Projects', icon: 'projects', route: '/projects' },
    { label: 'Contact', icon: 'contact', route: '/ping-me' },
  ];

  navigate(route: string) {
    window.location.href = route;
  }
}
