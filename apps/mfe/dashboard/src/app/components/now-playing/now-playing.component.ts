import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Track {
  title: string;
  artist: string;
  albumArt?: string;
  duration: number; // in seconds
  currentTime: number; // in seconds
}

@Component({
  selector: 'app-now-playing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss']
})
export class NowPlayingComponent implements OnInit, OnDestroy {
  currentTrack: Track = {
    title: 'Midnight City',
    artist: 'M83',
    duration: 243, // 4:03
    currentTime: 127 // 2:07
  };

  progress = signal<number>(0);
  isPlaying = signal<boolean>(true);
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.updateProgress();
    this.startProgressSimulation();
  }

  ngOnDestroy(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  private updateProgress(): void {
    const progressPercent = (this.currentTrack.currentTime / this.currentTrack.duration) * 100;
    this.progress.set(progressPercent);
  }

  private startProgressSimulation(): void {
    // Simulate progress moving forward slowly
    this.progressInterval = setInterval(() => {
      if (this.isPlaying()) {
        this.currentTrack.currentTime += 1;
        if (this.currentTrack.currentTime >= this.currentTrack.duration) {
          this.currentTrack.currentTime = 0; // Loop back
        }
        this.updateProgress();
      }
    }, 1000);
  }

  togglePlay(): void {
    this.isPlaying.set(!this.isPlaying());
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
