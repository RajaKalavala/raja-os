import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Track {
  title: string;
  artist: string;
  src: string;
}

@Component({
  selector: 'app-now-playing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './now-playing.component.html',
  styleUrls: ['./now-playing.component.scss'],
})
export class NowPlayingComponent implements OnInit, OnDestroy {
  // Playlist with reliable royalty-free music
  playlist: Track[] = [
    {
      title: 'Relaxing Piano',
      artist: 'Ambient Sounds',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      title: 'Electronic Vibes',
      artist: 'Chill Beats',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      title: 'Acoustic Journey',
      artist: 'Focus Music',
      src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ];

  currentTrackIndex = signal<number>(0);
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  progress = signal<number>(0);
  isPlaying = signal<boolean>(false);
  volume = signal<number>(0.7);
  isLoading = signal<boolean>(false);
  hasError = signal<boolean>(false);

  private audio: HTMLAudioElement | null = null;

  get currentTrack(): Track {
    return this.playlist[this.currentTrackIndex()];
  }

  ngOnInit(): void {
    this.initAudio();
  }

  ngOnDestroy(): void {
    this.cleanupAudio();
  }

  private initAudio(): void {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'metadata';
    this.setupAudioListeners();
    this.loadTrack(0);
  }

  private cleanupAudio(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  private setupAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.audio) {
        this.duration.set(this.audio.duration);
        this.isLoading.set(false);
        this.hasError.set(false);
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.currentTime.set(this.audio.currentTime);
        const progressPercent =
          (this.audio.currentTime / this.audio.duration) * 100;
        this.progress.set(isNaN(progressPercent) ? 0 : progressPercent);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    this.audio.addEventListener('waiting', () => {
      this.isLoading.set(true);
    });

    this.audio.addEventListener('canplay', () => {
      this.isLoading.set(false);
    });

    this.audio.addEventListener('error', () => {
      this.isLoading.set(false);
      this.hasError.set(true);
      console.error('Audio loading error');
    });
  }

  private loadTrack(index: number): void {
    if (!this.audio) return;

    this.isLoading.set(true);
    this.hasError.set(false);
    this.currentTrackIndex.set(index);
    this.audio.src = this.currentTrack.src;
    this.audio.volume = this.volume();
    this.audio.load();
  }

  togglePlay(): void {
    if (!this.audio) return;

    if (this.isPlaying()) {
      this.audio.pause();
    } else {
      this.audio.play().catch((err) => {
        console.error('Playback failed:', err);
        this.hasError.set(true);
      });
    }
  }

  previousTrack(): void {
    if (!this.audio) return;

    const wasPlaying = this.isPlaying();
    let newIndex = this.currentTrackIndex() - 1;
    if (newIndex < 0) {
      newIndex = this.playlist.length - 1;
    }
    this.loadTrack(newIndex);
    if (wasPlaying) {
      setTimeout(() => {
        this.audio?.play().catch((err) => console.error('Play error:', err));
      }, 100);
    }
  }

  nextTrack(): void {
    if (!this.audio) return;

    const wasPlaying = this.isPlaying();
    let newIndex = this.currentTrackIndex() + 1;
    if (newIndex >= this.playlist.length) {
      newIndex = 0;
    }
    this.loadTrack(newIndex);
    if (wasPlaying) {
      setTimeout(() => {
        this.audio?.play().catch((err) => console.error('Play error:', err));
      }, 100);
    }
  }

  seekTo(event: MouseEvent): void {
    if (!this.audio) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    this.audio.currentTime = percentage * this.audio.duration;
  }

  setVolume(event: Event): void {
    if (!this.audio) return;

    const input = event.target as HTMLInputElement;
    const newVolume = parseFloat(input.value);
    this.volume.set(newVolume);
    this.audio.volume = newVolume;
  }

  formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
