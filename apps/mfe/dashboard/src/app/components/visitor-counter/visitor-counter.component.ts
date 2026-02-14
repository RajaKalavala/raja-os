import { Component, signal, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface CountAPIResponse {
  value: number;
}

@Component({
  selector: 'app-visitor-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visitor-counter.component.html',
  styleUrl: './visitor-counter.component.scss',
})
export class VisitorCounterComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);

  // CountAPI configuration
  private readonly NAMESPACE = 'raja-os-portfolio';
  private readonly KEY = 'visits';
  private readonly SESSION_KEY = 'raja-os-visited';
  private readonly BASE_COUNT = 24; // Initial seed value

  totalVisitors = signal(this.BASE_COUNT);
  isLoading = signal(true);
  hasError = signal(false);

  // For counting animation
  private animationFrame: number | null = null;

  ngOnInit() {
    this.trackVisit();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private trackVisit() {
    // Check if this session already counted
    const hasVisited = sessionStorage.getItem(this.SESSION_KEY);

    if (hasVisited) {
      // Just get the current count without incrementing
      this.getCount();
    } else {
      // First visit in this session - increment the counter
      this.incrementCount();
    }
  }

  private incrementCount() {
    const url = `https://api.countapi.xyz/hit/${this.NAMESPACE}/${this.KEY}`;

    this.http.get<CountAPIResponse>(url).subscribe({
      next: (response) => {
        // Mark session as visited
        sessionStorage.setItem(this.SESSION_KEY, 'true');
        this.animateCount(response.value);
        this.isLoading.set(false);
      },
      error: () => {
        // Fallback: try to at least get the count
        this.getCount();
      }
    });
  }

  private getCount() {
    const url = `https://api.countapi.xyz/get/${this.NAMESPACE}/${this.KEY}`;

    this.http.get<CountAPIResponse>(url).subscribe({
      next: (response) => {
        this.animateCount(response.value);
        this.isLoading.set(false);
      },
      error: () => {
        // If API fails completely, show the base count as fallback
        this.hasError.set(true);
        this.isLoading.set(false);
        this.totalVisitors.set(this.BASE_COUNT);
      }
    });
  }

  private animateCount(apiValue: number) {
    // Add base count to API value
    const targetValue = this.BASE_COUNT + apiValue;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

      this.totalVisitors.set(currentValue);

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  get formattedCount(): string {
    return this.totalVisitors().toLocaleString();
  }
}
