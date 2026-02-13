import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dev-uptime',
  templateUrl: './dev-uptime.component.html',
  styleUrl: './dev-uptime.component.scss',
  standalone: true,
})
export class DevUptimeComponent implements OnInit, OnDestroy {
  // Dev Uptime - Start date of coding career
  private readonly careerStartDate = new Date('2016-10-03');

  // Dev Uptime signals
  devUptimeYears = signal<number>(0);
  devUptimeDays = signal<number>(0);
  devUptimeTimer = signal<string>('00:00:00');

  private timeInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.updateDevUptime();
    this.timeInterval = setInterval(() => {
      this.updateDevUptime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  private updateDevUptime(): void {
    const now = new Date();
    const diff = now.getTime() - this.careerStartDate.getTime();

    // Calculate years and remaining days
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const days = totalDays % 365;

    this.devUptimeYears.set(years);
    this.devUptimeDays.set(days);

    // Calculate time elapsed today (simulating uptime timer)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    this.devUptimeTimer.set(`${hours}:${minutes}:${seconds}`);
  }
}
