import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContributionDay {
  date: Date;
  count: number;
  level: number; // 0-4
}

@Component({
  selector: 'app-github-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './github-heatmap.component.html',
  styleUrls: ['./github-heatmap.component.scss']
})
export class GithubHeatmapComponent implements OnInit {
  totalContributions = signal(1893);
  currentStreak = signal(12);
  starsEarned = signal(47);
  repoCount = signal(28);

  weeks: ContributionDay[][] = [];

  ngOnInit(): void {
    this.generateHeatmapData();
  }

  private generateHeatmapData(): void {
    const today = new Date();
    const weeksCount = 20;
    const daysPerWeek = 7;

    for (let week = 0; week < weeksCount; week++) {
      const weekData: ContributionDay[] = [];

      for (let day = 0; day < daysPerWeek; day++) {
        const dayOffset = (weeksCount - week - 1) * 7 + (daysPerWeek - day - 1);
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);

        // Generate random contribution count (0-15)
        const count = Math.floor(Math.random() * 16);
        const level = this.getContributionLevel(count);

        weekData.push({ date, count, level });
      }

      this.weeks.push(weekData);
    }
  }

  private getContributionLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  getLevelClass(level: number): string {
    return `level-${level}`;
  }

  getTooltipText(day: ContributionDay): string {
    const dateStr = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${day.count} contributions on ${dateStr}`;
  }
}
