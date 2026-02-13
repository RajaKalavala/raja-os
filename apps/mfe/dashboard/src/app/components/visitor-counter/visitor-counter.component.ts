import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visitor-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visitor-counter.component.html',
  styleUrl: './visitor-counter.component.scss',
})
export class VisitorCounterComponent implements OnInit {
  totalVisitors = signal(4721);
  onlineNow = signal(3);

  ngOnInit() {
    // Simulate visitor count incrementing occasionally
    this.simulateVisitors();
  }

  private simulateVisitors() {
    // Random increment every 30-60 seconds
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.totalVisitors.update((v) => v + 1);
      }
    }, 30000);

    // Simulate online users fluctuation
    setInterval(() => {
      const change = Math.random() > 0.5 ? 1 : -1;
      this.onlineNow.update((v) => Math.max(1, Math.min(10, v + change)));
    }, 15000);
  }

  get formattedCount(): string {
    return this.totalVisitors().toLocaleString();
  }
}
