import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatItem {
  icon: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-life-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './life-stats.component.html',
  styleUrls: ['./life-stats.component.scss'],
})
export class LifeStatsComponent {
  stats: StatItem[] = [
    { icon: 'book', value: '8', label: 'Books Read This Year' },
    { icon: 'lightbulb', value: '12', label: 'Ideas Logged' },
    { icon: 'git-commit', value: '1.9K', label: 'Git Commits' },
    { icon: 'brain', value: '14', label: 'Concepts Learned This Month' },
  ];
}
