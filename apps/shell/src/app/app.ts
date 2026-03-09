import { Component, signal, HostListener, OnInit, inject, effect } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from './sidebar/sidebar.component';
import { JarvisMascotComponent } from './jarvis-mascot/jarvis-mascot.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ThemeService } from './services/theme.service';
import { SupabaseService } from '@org/supabase';
import { JarvisService } from '@org/jarvis';

@Component({
  imports: [RouterModule, FormsModule, SidebarComponent, JarvisMascotComponent, CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'shell';
  protected showSidebar = false;
  protected isMobileMenuOpen = signal(false);
  protected isMobile = signal(false);
  protected themeService = inject(ThemeService);
  private supabaseService = inject(SupabaseService);
  private jarvisService = inject(JarvisService);

  // Jarvis Morning Briefing
  showBriefingOverlay = signal(false);
  briefingData = signal<any>(null);

  // Jarvis Quick Capture
  showCaptureModal = signal(false);
  captureInput = '';
  captureProcessing = signal(false);
  captureResult = signal<any>(null);

  private readonly MOBILE_BREAKPOINT = 768;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showSidebar = event.url !== '/';
        // Close mobile menu on navigation
        this.isMobileMenuOpen.set(false);
      });

    // Auto-show morning briefing on first daily admin login
    effect(() => {
      const isAdmin = this.supabaseService.isAdmin();
      if (isAdmin && this.showSidebar) {
        const today = new Date().toISOString().split('T')[0];
        const lastBriefingDate = localStorage.getItem('jarvis-last-briefing-date');
        if (lastBriefingDate !== today) {
          this.showBriefingOverlay.set(true);
          this.loadBriefing();
        }
      }
    });
  }

  ngOnInit() {
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'J') {
      event.preventDefault();
      this.showCaptureModal.update((v) => !v);
      if (!this.showCaptureModal()) {
        this.resetCapture();
      }
    }
  }

  private checkMobile() {
    const wasMobile = this.isMobile();
    this.isMobile.set(window.innerWidth < this.MOBILE_BREAKPOINT);
    // Close mobile menu when switching to desktop
    if (wasMobile && !this.isMobile()) {
      this.isMobileMenuOpen.set(false);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  // ─── Morning Briefing ─────────────────────────────────

  private async loadBriefing() {
    try {
      const briefing = await this.jarvisService.getTodaysBriefing();
      if (briefing) {
        this.briefingData.set(briefing);
      }
    } catch {
      // Silently fail — briefing is non-critical
    }
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  dismissBriefing() {
    this.showBriefingOverlay.set(false);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('jarvis-last-briefing-date', today);
  }

  goToJarvis() {
    this.dismissBriefing();
    this.router.navigate(['/jarvis/briefing']);
  }

  // ─── Quick Capture ────────────────────────────────────

  async submitCapture() {
    if (!this.captureInput.trim() || this.captureProcessing()) return;
    this.captureProcessing.set(true);
    try {
      const result = await this.jarvisService.captureThought(this.captureInput.trim());
      this.captureResult.set(result);
      this.captureInput = '';
    } catch {
      // Silently fail
    } finally {
      this.captureProcessing.set(false);
    }
  }

  closeCaptureModal() {
    this.showCaptureModal.set(false);
    this.resetCapture();
  }

  private resetCapture() {
    this.captureInput = '';
    this.captureResult.set(null);
    this.captureProcessing.set(false);
  }
}
