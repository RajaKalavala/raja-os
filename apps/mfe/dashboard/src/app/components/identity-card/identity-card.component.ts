import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface MoodConfig {
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-identity-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './identity-card.component.html',
  styleUrls: ['./identity-card.component.scss'],
})
export class IdentityCardComponent implements OnInit, OnDestroy {
  name = 'Raja Kalavala';
  title = 'Principal Software Architect';
  location = 'Bangalore';
  isOnline = true;
  openToWork = false;

  // Dev Uptime - Start date of coding career
  private readonly careerStartDate = new Date('2016-10-03');

  taglines = [
    'I build things that make people smile.',
    'Turning coffee into code since 2016.',
    'Architecture enthusiast & problem solver.',
    'Making complex systems simple.',
  ];

  currentTagline = signal<string>('');
  currentTime = signal<string>('');
  currentMood = signal<MoodConfig>({ emoji: '🚀', label: 'Deep Focus' });

  // Dev Uptime signals
  devUptimeYears = signal<number>(0);
  devUptimeDays = signal<number>(0);
  devUptimeTimer = signal<string>('00:00:00');

  private taglineIndex = 0;
  private charIndex = 0;
  private typingInterval: ReturnType<typeof setInterval> | null = null;
  private timeInterval: ReturnType<typeof setInterval> | null = null;
  private isDeleting = false;

  socialLinks = [
    { url: 'https://github.com/RajaKalavala', icon: 'github' },
    { url: 'https://www.linkedin.com/in/rajakalavala/', icon: 'linkedin' },
    { url: 'https://x.com/raja_kalavala', icon: 'twitter' },
    { url: 'https://www.instagram.com/_raja.k_/', icon: 'instagram' },
  ];

  ngOnInit(): void {
    this.startTypingAnimation();
    this.updateTime();
    this.updateMood();
    this.updateDevUptime();
    this.timeInterval = setInterval(() => {
      this.updateTime();
      this.updateMood();
      this.updateDevUptime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.typingInterval) clearInterval(this.typingInterval);
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  private startTypingAnimation(): void {
    this.typingInterval = setInterval(
      () => {
        const currentText = this.taglines[this.taglineIndex];

        if (!this.isDeleting) {
          // Typing
          this.currentTagline.set(currentText.substring(0, this.charIndex + 1));
          this.charIndex++;

          if (this.charIndex === currentText.length) {
            // Pause before deleting
            this.isDeleting = true;
            setTimeout(() => {}, 2000);
          }
        } else {
          // Deleting
          this.currentTagline.set(currentText.substring(0, this.charIndex - 1));
          this.charIndex--;

          if (this.charIndex === 0) {
            this.isDeleting = false;
            this.taglineIndex = (this.taglineIndex + 1) % this.taglines.length;
          }
        }
      },
      this.isDeleting ? 50 : 100,
    );
  }

  private updateTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    this.currentTime.set(
      `${displayHours.toString().padStart(2, '0')}:${displayMinutes}:${displaySeconds} ${ampm}`,
    );
  }

  private updateMood(): void {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 10) {
      this.currentMood.set({ emoji: '☕', label: 'Coffee Mode' });
    } else if (hour >= 10 && hour < 18) {
      this.currentMood.set({ emoji: '🚀', label: 'Deep Focus' });
    } else if (hour >= 18 && hour < 21) {
      this.currentMood.set({ emoji: '🌙', label: 'Wind Down' });
    } else {
      this.currentMood.set({ emoji: '🎮', label: 'Recharge' });
    }
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
