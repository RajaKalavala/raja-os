import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface DayFocusTime {
  day: string;
  minutes: number;
  hours: number;
}

interface TimerSession {
  date: string;
  duration: number; // in seconds
}

@Component({
  selector: 'app-time-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss',
})
export class TimeTrackerComponent implements OnInit, OnDestroy {
  // Timer state using signals
  hours = signal(0);
  minutes = signal(0);
  seconds = signal(0);
  isRunning = signal(false);
  isPaused = signal(false);

  private timerInterval: any;
  private startTime = 0;
  private elapsedTime = 0;

  // Weekly focus data
  weeklyFocus: DayFocusTime[] = [
    { day: 'Mon', minutes: 0, hours: 0 },
    { day: 'Tue', minutes: 0, hours: 0 },
    { day: 'Wed', minutes: 0, hours: 0 },
    { day: 'Thu', minutes: 0, hours: 0 },
    { day: 'Fri', minutes: 0, hours: 0 },
    { day: 'Sat', minutes: 0, hours: 0 },
    { day: 'Sun', minutes: 0, hours: 0 },
  ];

  ngOnInit(): void {
    this.loadWeeklyData();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Timer controls
  toggleTimer(): void {
    if (this.isRunning()) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer(): void {
    if (!this.isRunning()) {
      this.isRunning.set(true);
      this.isPaused.set(false);
      this.startTime = Date.now() - this.elapsedTime;

      this.timerInterval = setInterval(() => {
        this.elapsedTime = Date.now() - this.startTime;
        this.updateDisplay();
      }, 1000);
    }
  }

  pauseTimer(): void {
    if (this.isRunning()) {
      this.isRunning.set(false);
      this.isPaused.set(true);
      clearInterval(this.timerInterval);
    }
  }

  stopTimer(): void {
    if (this.isRunning() || this.isPaused()) {
      clearInterval(this.timerInterval);

      // Save session if there was any time tracked
      if (this.elapsedTime > 0) {
        this.saveSession(Math.floor(this.elapsedTime / 1000));
      }

      // Reset timer
      this.isRunning.set(false);
      this.isPaused.set(false);
      this.hours.set(0);
      this.minutes.set(0);
      this.seconds.set(0);
      this.elapsedTime = 0;
      this.startTime = 0;
    }
  }

  private updateDisplay(): void {
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    this.hours.set(Math.floor(totalSeconds / 3600));
    this.minutes.set(Math.floor((totalSeconds % 3600) / 60));
    this.seconds.set(totalSeconds % 60);
  }

  // Format number with leading zero
  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }

  // Save focus session
  private saveSession(durationInSeconds: number): void {
    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Adjust for Monday-first week (0 = Mon, 6 = Sun)
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // Get existing sessions from localStorage
    const sessions = this.getSessions();
    sessions.push({ date: dateKey, duration: durationInSeconds });
    localStorage.setItem('focusSessions', JSON.stringify(sessions));

    // Update weekly data
    this.loadWeeklyData();
  }

  private getSessions(): TimerSession[] {
    const data = localStorage.getItem('focusSessions');
    return data ? JSON.parse(data) : [];
  }

  private loadWeeklyData(): void {
    const sessions = this.getSessions();
    const today = new Date();

    // Reset weekly data
    this.weeklyFocus.forEach(day => {
      day.minutes = 0;
      day.hours = 0;
    });

    // Calculate start of current week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Aggregate sessions for current week
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const dayDiff = Math.floor((sessionDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff >= 0 && dayDiff < 7) {
        const totalMinutes = Math.floor(session.duration / 60);
        this.weeklyFocus[dayDiff].minutes += totalMinutes;
        this.weeklyFocus[dayDiff].hours = Math.floor(this.weeklyFocus[dayDiff].minutes / 60);
      }
    });
  }

  // Get max hours for chart scaling
  getMaxHours(): number {
    const max = Math.max(...this.weeklyFocus.map(d => d.hours + (d.minutes % 60) / 60));
    return Math.max(max, 1); // Minimum 1 hour for scale
  }

  // Get bar height percentage
  getBarHeight(day: DayFocusTime): number {
    const totalHours = day.hours + day.minutes / 60;
    const maxHours = this.getMaxHours();
    return (totalHours / maxHours) * 100;
  }

  // Format hours and minutes display
  formatDayTime(day: DayFocusTime): string {
    if (day.hours === 0 && day.minutes === 0) return '0m';
    if (day.hours === 0) return `${day.minutes}m`;
    if (day.minutes === 0) return `${day.hours}h`;
    return `${day.hours}h ${day.minutes % 60}m`;
  }

  // Check if today
  isToday(dayName: string): boolean {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const adjustedToday = today === 0 ? 6 : today - 1;
    return days[adjustedToday] === dayName;
  }

  // Get total weekly focus time
  getTotalWeeklyTime(): string {
    const totalMinutes = this.weeklyFocus.reduce((sum, d) => sum + d.minutes, 0);
    return this.formatDayTime({ day: '', minutes: totalMinutes, hours: 0 });
  }
}
