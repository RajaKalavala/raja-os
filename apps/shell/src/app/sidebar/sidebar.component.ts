import { Component, input, output, inject, computed, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { SupabaseService } from '@org/supabase';
import { JarvisNudgeService, JarvisNudge } from '@org/jarvis';

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
export class SidebarComponent implements OnDestroy {
  isOpen = input(false);
  isMobile = input(false);
  closed = output<void>();
  themeService = inject(ThemeService);
  supabaseService = inject(SupabaseService);
  nudgeService = inject(JarvisNudgeService);
  private router = inject(Router);

  showNudgePanel = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'About Me', route: '/aboutme', icon: 'person' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Experience', route: '/experience', icon: 'history' },
    { label: 'My Planner', route: '/planner', icon: 'clipboard', adminOnly: true },
    { label: 'Jarvis', route: '/jarvis', icon: 'cpu', adminOnly: true },
    { label: 'Blogs', route: '/blogs', icon: 'book' },
    { label: 'Terminal', route: '/terminal', icon: 'terminal', adminOnly: true },
  ];

  readonly visibleMenuItems = computed(() =>
    this.menuItems.filter((item) => !item.adminOnly || this.supabaseService.isAdmin())
  );

  constructor() {
    // Load nudges when admin logs in (no background generation)
    effect(() => {
      if (this.supabaseService.isAdmin()) {
        this.nudgeService.loadNudges();
      }
    });
  }

  ngOnDestroy() {
    // reserved for future background nudge cleanup
  }

  toggleNudgePanel() {
    this.showNudgePanel.update((v) => !v);
    if (this.showNudgePanel()) {
      this.nudgeService.markAllAsRead();
    }
  }

  closeNudgePanel() {
    this.showNudgePanel.set(false);
  }

  onNudgeAction(nudge: JarvisNudge) {
    if (nudge.actionRoute) {
      this.router.navigateByUrl(nudge.actionRoute);
    }
    this.nudgeService.dismissNudge(nudge.id);
    this.showNudgePanel.set(false);
    if (this.isMobile()) {
      this.closed.emit();
    }
  }

  onNudgeSnooze(nudge: JarvisNudge) {
    this.nudgeService.snoozeNudge(nudge.id, 4); // Snooze 4 hours
  }

  onNudgeDismiss(nudge: JarvisNudge) {
    this.nudgeService.dismissNudge(nudge.id);
  }

  getNudgePriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

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
