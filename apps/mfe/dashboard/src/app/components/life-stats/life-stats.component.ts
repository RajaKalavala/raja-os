import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatItem {
  icon: string;
  value: number;
  displayValue: WritableSignal<string>;
  label: string;
  suffix?: string;
}

@Component({
  selector: 'app-life-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './life-stats.component.html',
  styleUrls: ['./life-stats.component.scss'],
})
export class LifeStatsComponent implements OnInit {
  stats: StatItem[] = [
    {
      icon: 'book',
      value: 8,
      displayValue: signal('0'),
      label: 'Books Read This Year',
    },
    {
      icon: 'lightbulb',
      value: 12,
      displayValue: signal('0'),
      label: 'Ideas Logged',
    },
    {
      icon: 'git-commit',
      value: 1900,
      displayValue: signal('0'),
      label: 'Git Commits',
      suffix: 'K',
    },
    {
      icon: 'brain',
      value: 14,
      displayValue: signal('0'),
      label: 'New Concepts Learned This Month',
    },
  ];

  ngOnInit(): void {
    this.animateCounters();
  }

  private animateCounters(): void {
    const duration = 500; // 2 seconds
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;

    this.stats.forEach((stat, index) => {
      let currentFrame = 0;
      const increment = stat.value / totalFrames;

      // Stagger the animations
      setTimeout(() => {
        const interval = setInterval(() => {
          currentFrame++;
          const currentValue = Math.min(
            Math.round(increment * currentFrame),
            stat.value,
          );
          stat.displayValue.set(this.formatNumber(currentValue, stat.suffix));

          if (currentFrame >= totalFrames) {
            clearInterval(interval);
            stat.displayValue.set(this.formatNumber(stat.value, stat.suffix));
          }
        }, 1000 / frameRate);
      }, index * 150); // 150ms stagger between each counter
    });
  }

  private formatNumber(num: number, suffix?: string): string {
    if (suffix === 'K') {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
