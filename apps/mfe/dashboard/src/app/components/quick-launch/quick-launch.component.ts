import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AskMeComponent } from '../ask-me/ask-me.component';

interface QuickAction {
  label: string;
  icon: string;
  route?: string;
  action?: 'download' | 'modal';
  downloadUrl?: string;
}

@Component({
  selector: 'app-quick-launch',
  standalone: true,
  imports: [CommonModule, AskMeComponent],
  templateUrl: './quick-launch.component.html',
  styleUrl: './quick-launch.component.scss',
})
export class QuickLaunchComponent {
  private router = inject(Router);

  showTerminalModal = signal(false);

  actions: QuickAction[] = [
    { label: 'Resume', icon: 'resume', action: 'download', downloadUrl: 'images/Raja-Resume.pdf' },
    { label: 'Terminal', icon: 'terminal', action: 'modal' },
    { label: 'Projects', icon: 'projects', route: '/projects' },
    { label: 'Contact', icon: 'contact', route: '/aboutme' },
  ];

  handleAction(action: QuickAction) {
    if (action.action === 'download' && action.downloadUrl) {
      this.downloadFile(action.downloadUrl, 'Raja-Resume.pdf');
    } else if (action.action === 'modal') {
      this.showTerminalModal.set(true);
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
  }

  closeTerminalModal() {
    this.showTerminalModal.set(false);
  }

  onModalBackdropClick(event: MouseEvent) {
    // Close modal only if clicking on the backdrop (not the content)
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeTerminalModal();
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
