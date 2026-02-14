import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FunFact {
  emoji: string;
  text: string;
}

@Component({
  selector: 'app-fun-facts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fun-facts.component.html',
  styleUrl: './fun-facts.component.scss',
})
export class FunFactsComponent implements OnInit, OnDestroy {
  facts: FunFact[] = [
    {
      emoji: '🧩',
      text: 'Enjoys breaking things just to understand how they work',
    },
    {
      emoji: '📚',
      text: 'Bookmarks docs and then Googles the same thing again',
    },
    { emoji: '🧹', text: 'Refactors code to feel emotionally organized' },
    { emoji: '🧪', text: 'Trusts tests… but still runs the app manually' },
    { emoji: '🎮', text: 'Debugs code in dreams sometimes' },
    { emoji: '🚀', text: 'Deployed to prod on a Friday and survived' },
    { emoji: '🌙', text: 'Best ideas come at 2 AM' },
    { emoji: '🎧', text: 'Codes faster with lo-fi beats' },
    {
      emoji: '📺',
      text: 'Learns half of coding tips from random tech YouTube videos',
    },
    { emoji: '🧘', text: 'Finds inner peace after a green CI build' },
  ];

  currentIndex = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startAutoRotate();
  }

  ngOnDestroy() {
    this.stopAutoRotate();
  }

  private startAutoRotate() {
    this.intervalId = setInterval(() => {
      this.next();
    }, 4000);
  }

  private stopAutoRotate() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next() {
    this.currentIndex.update((i) => (i + 1) % this.facts.length);
  }

  goTo(index: number) {
    this.currentIndex.set(index);
    // Reset timer on manual navigation
    this.stopAutoRotate();
    this.startAutoRotate();
  }

  get currentFact(): FunFact {
    return this.facts[this.currentIndex()];
  }
}
