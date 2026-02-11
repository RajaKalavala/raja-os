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
  styleUrls: ['./life-stats.component.scss']
})
export class LifeStatsComponent implements OnInit {
  stats: StatItem[] = [
    { icon: 'coffee', value: 847, displayValue: signal('0'), label: 'Coffees This Year' },
    { icon: 'bug', value: 2341, displayValue: signal('0'), label: 'Bugs Squashed' },
    { icon: 'commit', value: 1893, displayValue: signal('0'), label: 'Git Commits' },
    { icon: 'code', value: 284000, displayValue: signal('0'), label: 'Lines of Code', suffix: '+' },
  ];

  ngOnInit(): void {
    this.animateCounters();
  }

  private animateCounters(): void {
    const duration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;

    this.stats.forEach((stat, index) => {
      let currentFrame = 0;
      const increment = stat.value / totalFrames;

      // Stagger the animations
      setTimeout(() => {
        const interval = setInterval(() => {
          currentFrame++;
          const currentValue = Math.min(Math.round(increment * currentFrame), stat.value);
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M' + (suffix || '');
    } else if (num >= 1000) {
      return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'k' + (suffix || '');
    }
    return num.toLocaleString() + (suffix || '');
  }
}
