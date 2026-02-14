import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin, catchError, of } from 'rxjs';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubUser {
  public_repos: number;
  followers: number;
  following: number;
  name: string;
  avatar_url: string;
}

interface GitHubRepo {
  stargazers_count: number;
  name: string;
}

interface ContributionData {
  total: {
    [year: string]: number;
  };
  contributions: Array<{
    date: string;
    count: number;
    level: number;
  }>;
}

@Component({
  selector: 'app-github-heatmap',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './github-heatmap.component.html',
  styleUrls: ['./github-heatmap.component.scss'],
})
export class GithubHeatmapComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private readonly GITHUB_USERNAME = 'RajaKalavala';

  // Stats signals
  totalContributions = signal(0);
  currentStreak = signal(0);
  starsEarned = signal(0);
  repoCount = signal(0);
  isLoading = signal(true);
  hasError = signal(false);

  // Heatmap data
  weeks: ContributionDay[][] = [];

  // For animation
  private animationFrames: number[] = [];

  ngOnInit(): void {
    this.fetchGitHubData();
  }

  ngOnDestroy(): void {
    this.animationFrames.forEach((frame) => cancelAnimationFrame(frame));
  }

  private fetchGitHubData(): void {
    const userUrl = `https://api.github.com/users/${this.GITHUB_USERNAME}`;
    const reposUrl = `https://api.github.com/users/${this.GITHUB_USERNAME}/repos?per_page=100`;
    const contributionsUrl = `https://github-contributions-api.jogruber.de/v4/${this.GITHUB_USERNAME}?y=last`;

    forkJoin({
      user: this.http.get<GitHubUser>(userUrl).pipe(catchError(() => of(null))),
      repos: this.http
        .get<GitHubRepo[]>(reposUrl)
        .pipe(catchError(() => of([]))),
      contributions: this.http
        .get<ContributionData>(contributionsUrl)
        .pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ user, repos, contributions }) => {
        // Process user data
        if (user) {
          this.animateValue(this.repoCount, user.public_repos);
        }

        // Calculate total stars from all repos
        if (repos && repos.length > 0) {
          const totalStars = repos.reduce(
            (sum, repo) => sum + (repo.stargazers_count || 0),
            0,
          );
          this.animateValue(this.starsEarned, totalStars);
        }

        // Process contribution data
        if (contributions) {
          this.processContributions(contributions);
        } else {
          // Fallback: generate placeholder data
          this.generateFallbackHeatmap();
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
        this.generateFallbackHeatmap();
      },
    });
  }

  private processContributions(data: ContributionData): void {
    // Calculate total contributions from all years in the response
    // The API returns totals per year, so sum them all for the displayed period
    let totalContribs = 0;
    if (data.total && typeof data.total === 'object') {
      totalContribs = Object.values(data.total).reduce((sum, count) => sum + count, 0);
    }
    // Fallback: calculate from contributions array if total is empty
    if (totalContribs === 0 && data.contributions) {
      totalContribs = data.contributions.reduce((sum, day) => sum + day.count, 0);
    }
    this.animateValue(this.totalContributions, totalContribs);

    // Calculate current streak
    const streak = this.calculateStreak(data.contributions);
    this.animateValue(this.currentStreak, streak);

    // Build heatmap grid (last 20 weeks)
    this.buildHeatmapGrid(data.contributions);
  }

  private calculateStreak(
    contributions: ContributionData['contributions'],
  ): number {
    if (!contributions || contributions.length === 0) return 0;

    // Sort by date descending
    const sorted = [...contributions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const contribDate = new Date(sorted[i].date);
      contribDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      // Check if this day matches our expected streak day
      if (contribDate.getTime() === expectedDate.getTime()) {
        if (sorted[i].count > 0) {
          streak++;
        } else if (i === 0) {
          // Today has no contributions, but check yesterday
          continue;
        } else {
          break;
        }
      } else if (i === 0 && sorted[i].count > 0) {
        // First contribution is from yesterday, start counting
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (contribDate.getTime() === yesterday.getTime()) {
          streak++;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  private buildHeatmapGrid(
    contributions: ContributionData['contributions'],
  ): void {
    const weeksCount = 32; // 1 year
    const today = new Date();

    // Create a map for quick lookup
    const contribMap = new Map<string, ContributionDay>();
    contributions.forEach((c) => {
      contribMap.set(c.date, {
        date: c.date,
        count: c.count,
        level: c.level,
      });
    });

    this.weeks = [];

    for (let week = 0; week < weeksCount; week++) {
      const weekData: ContributionDay[] = [];

      for (let day = 0; day < 7; day++) {
        const dayOffset = (weeksCount - week - 1) * 7 + (6 - day);
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);

        const dateStr = date.toISOString().split('T')[0];
        const contrib = contribMap.get(dateStr);

        weekData.push({
          date: dateStr,
          count: contrib?.count || 0,
          level: contrib?.level || 0,
        });
      }

      this.weeks.push(weekData);
    }
  }

  private generateFallbackHeatmap(): void {
    const weeksCount = 52; // 1 year
    const today = new Date();

    this.weeks = [];

    for (let week = 0; week < weeksCount; week++) {
      const weekData: ContributionDay[] = [];

      for (let day = 0; day < 7; day++) {
        const dayOffset = (weeksCount - week - 1) * 7 + (6 - day);
        const date = new Date(today);
        date.setDate(date.getDate() - dayOffset);

        weekData.push({
          date: date.toISOString().split('T')[0],
          count: 0,
          level: 0,
        });
      }

      this.weeks.push(weekData);
    }
  }

  private animateValue(
    signalRef: ReturnType<typeof signal<number>>,
    targetValue: number,
  ): void {
    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeOutQuart,
      );

      signalRef.set(currentValue);

      if (progress < 1) {
        const frame = requestAnimationFrame(animate);
        this.animationFrames.push(frame);
      }
    };

    const frame = requestAnimationFrame(animate);
    this.animationFrames.push(frame);
  }

  getLevelClass(level: number): string {
    return `level-${level}`;
  }

  getTooltipText(day: ContributionDay): string {
    const date = new Date(day.date);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (day.count === 0) {
      return `No contributions on ${dateStr}`;
    }
    return `${day.count} contribution${day.count > 1 ? 's' : ''} on ${dateStr}`;
  }
}
