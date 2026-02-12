import { Component, signal, HostListener, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  imports: [RouterModule, SidebarComponent, CommonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'shell';
  protected showSidebar = false;
  protected isMobileMenuOpen = signal(false);
  protected isMobile = signal(false);

  private readonly MOBILE_BREAKPOINT = 768;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showSidebar = event.url !== '/';
        // Close mobile menu on navigation
        this.isMobileMenuOpen.set(false);
      });
  }

  ngOnInit() {
    this.checkMobile();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
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
}
