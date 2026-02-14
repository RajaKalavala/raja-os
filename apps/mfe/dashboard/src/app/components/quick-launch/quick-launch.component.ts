import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface QuickAction {
  label: string;
  icon: string;
  route?: string;
  action?: 'download';
  downloadUrl?: string;
}

@Component({
  selector: 'app-quick-launch',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-launch.component.html',
  styleUrl: './quick-launch.component.scss',
})
export class QuickLaunchComponent {
  private router = inject(Router);

  actions: QuickAction[] = [
    { label: 'Resume', icon: 'resume', action: 'download', downloadUrl: 'images/Raja-Resume.pdf' },
    { label: 'Terminal', icon: 'terminal', route: '/terminal' },
    { label: 'Projects', icon: 'projects', route: '/builds' },
    { label: 'Contact', icon: 'contact', route: '/ping-me' },
  ];

  handleAction(action: QuickAction) {
    if (action.action === 'download' && action.downloadUrl) {
      this.downloadFile(action.downloadUrl, 'Raja-Resume.pdf');
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
  }

  private downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
