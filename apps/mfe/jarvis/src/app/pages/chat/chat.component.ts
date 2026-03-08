import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JarvisService, JarvisChatMessage } from '@org/jarvis';

@Component({
  selector: 'raja-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-page">
      <div class="chat-container">
        <!-- Messages -->
        <div class="chat-messages" #messagesContainer>
          @if (messages().length === 0) {
            <div class="chat-empty">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                  <line x1="9" y1="1" x2="9" y2="4"></line>
                  <line x1="15" y1="1" x2="15" y2="4"></line>
                </svg>
              </div>
              <h3>Talk to Jarvis</h3>
              <p>Ask about your goals, tasks, habits — or just brainstorm.</p>
              <div class="quick-prompts">
                <button class="quick-prompt" (click)="usePrompt('Am I on track with my goals this week?')">Am I on track this week?</button>
                <button class="quick-prompt" (click)="usePrompt('What should I focus on today?')">What should I focus on?</button>
                <button class="quick-prompt" (click)="usePrompt('What did I ship last week?')">What did I ship last week?</button>
                <button class="quick-prompt" (click)="usePrompt('Start a 90-minute focus session')">Start a focus session</button>
              </div>
            </div>
          }

          @for (msg of messages(); track msg.id) {
            <div class="chat-message" [class.user-msg]="msg.role === 'user'" [class.ai-msg]="msg.role === 'assistant'">
              <div class="msg-avatar">
                @if (msg.role === 'user') {
                  <span>R</span>
                } @else {
                  <span>J</span>
                }
              </div>
              <div class="msg-content">
                <div class="msg-text">{{ msg.content }}</div>
                <div class="msg-time">{{ msg.createdAt | date:'shortTime' }}</div>
              </div>
            </div>
          }

          @if (isLoading()) {
            <div class="chat-message ai-msg">
              <div class="msg-avatar"><span>J</span></div>
              <div class="msg-content">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <div class="chat-input-wrapper">
            <textarea
              class="chat-input"
              [(ngModel)]="inputText"
              (keydown)="onKeydown($event)"
              placeholder="Ask Jarvis anything..."
              rows="1"
              #chatInput
            ></textarea>
            <button class="send-btn" (click)="send()" [disabled]="!inputText.trim() || isLoading()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div class="chat-actions">
            <button class="action-btn" (click)="clearChat()">Clear chat</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      max-width: 800px;
      margin: 0 auto;
      height: calc(100vh - 160px);
      display: flex;
      flex-direction: column;
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--jarvis-surface, #111111);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 12px;
      overflow: hidden;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .chat-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      color: var(--jarvis-text-muted, #6b7280);

      .empty-icon {
        color: var(--jarvis-primary, #10b981);
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        font-size: 18px;
        color: var(--jarvis-text, #e5e7eb);
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        margin: 0 0 24px;
      }
    }

    .quick-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }

    .quick-prompt {
      padding: 8px 14px;
      border-radius: 20px;
      border: 1px solid var(--jarvis-border, #1f1f1f);
      background: transparent;
      color: var(--jarvis-text-muted, #6b7280);
      font-size: 13px;
      cursor: pointer;
      transition: all 150ms;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);

      &:hover {
        border-color: var(--jarvis-primary, #10b981);
        color: var(--jarvis-primary, #10b981);
      }
    }

    .chat-message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .msg-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-msg .msg-avatar {
      background: rgba(59, 130, 246, 0.2);
      color: #3b82f6;
    }

    .ai-msg .msg-avatar {
      background: rgba(16, 185, 129, 0.2);
      color: #10b981;
    }

    .msg-content {
      flex: 1;
      min-width: 0;
    }

    .msg-text {
      font-size: 14px;
      line-height: 1.7;
      color: var(--jarvis-text, #e5e7eb);
      white-space: pre-wrap;
    }

    .msg-time {
      font-size: 11px;
      color: var(--jarvis-text-muted, #6b7280);
      margin-top: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 8px 0;

      span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--jarvis-primary, #10b981);
        animation: typing 1.4s infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes typing {
      0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
      30% { opacity: 1; transform: scale(1); }
    }

    .chat-input-area {
      padding: 16px;
      border-top: 1px solid var(--jarvis-border, #1f1f1f);
    }

    .chat-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    .chat-input {
      flex: 1;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--jarvis-border, #1f1f1f);
      border-radius: 8px;
      color: var(--jarvis-text, #e5e7eb);
      font-size: 14px;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);
      resize: none;
      outline: none;

      &:focus {
        border-color: var(--jarvis-primary, #10b981);
      }

      &::placeholder {
        color: var(--jarvis-text-muted, #6b7280);
      }
    }

    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: var(--jarvis-primary, #10b981);
      border: none;
      color: #000;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 150ms;

      &:hover:not(:disabled) {
        background: #059669;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .chat-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .action-btn {
      background: transparent;
      border: none;
      color: var(--jarvis-text-muted, #6b7280);
      font-size: 12px;
      cursor: pointer;
      font-family: var(--jarvis-font, 'JetBrains Mono', monospace);

      &:hover {
        color: var(--jarvis-text, #e5e7eb);
      }
    }
  `],
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private jarvisService = inject(JarvisService);

  messages = signal<JarvisChatMessage[]>([]);
  isLoading = signal(false);
  inputText = '';

  private shouldScroll = false;

  async ngOnInit() {
    const history = await this.jarvisService.getChatHistory();
    this.messages.set(history);
    this.shouldScroll = true;
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.messagesContainer) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  usePrompt(text: string) {
    this.inputText = text;
    this.send();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  async send() {
    if (!this.inputText.trim() || this.isLoading()) return;

    const userText = this.inputText.trim();
    this.inputText = '';

    const userMsg: JarvisChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText,
      createdAt: new Date(),
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    this.shouldScroll = true;
    this.isLoading.set(true);

    try {
      const response = await this.jarvisService.chat(userText);

      const aiMsg: JarvisChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        createdAt: new Date(),
      };

      this.messages.update(msgs => [...msgs, aiMsg]);
      this.shouldScroll = true;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Something went wrong';
      const aiMsg: JarvisChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${errMsg}`,
        createdAt: new Date(),
      };
      this.messages.update(msgs => [...msgs, aiMsg]);
    }

    this.isLoading.set(false);
  }

  clearChat() {
    this.messages.set([]);
    this.jarvisService.clearChatHistory();
  }

  private scrollToBottom() {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
