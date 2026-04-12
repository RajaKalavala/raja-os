import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '@org/supabase';
import { HealthAiService, HealthContextService, HealthAiModelName } from '@org/health';

@Component({
  selector: 'raja-health-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advisor-page">
      <div class="advisor-header">
        <div class="header-left">
          <h1>Health Advisor</h1>
          <p class="subtitle">AI-powered health insights from your data</p>
        </div>
        <div class="model-selector">
          <label>AI Model:</label>
          <select [ngModel]="activeModel()" (ngModelChange)="switchModel($event)">
            <option *ngFor="let provider of configuredProviders()" [value]="provider.name">
              {{ provider.displayName }}
            </option>
          </select>
        </div>
      </div>

      <div class="disclaimer">
        This is an AI assistant, not a medical professional. Always consult your physician for clinical decisions.
      </div>

      <!-- Quick Prompts -->
      <div class="quick-prompts" *ngIf="messages().length === 0">
        <h3>Ask about your health</h3>
        <div class="prompts-grid">
          <button class="prompt-card" *ngFor="let prompt of quickPrompts" (click)="sendMessage(prompt)">
            {{ prompt }}
          </button>
        </div>
      </div>

      <!-- Chat Messages -->
      <div class="chat-messages" #chatContainer>
        <div class="message" *ngFor="let msg of messages()" [ngClass]="'message-' + msg.role">
          <div class="message-avatar">
            {{ msg.role === 'user' ? 'You' : 'AI' }}
          </div>
          <div class="message-content">
            <div class="message-text" [innerHTML]="formatMessage(msg.content)"></div>
            <span class="message-meta" *ngIf="msg.role === 'assistant' && msg.modelUsed">
              via {{ msg.modelUsed }}
            </span>
          </div>
        </div>

        <div class="typing-indicator" *ngIf="isLoading()">
          <div class="message message-assistant">
            <div class="message-avatar">AI</div>
            <div class="message-content">
              <div class="dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area">
        <textarea
          [(ngModel)]="inputText"
          (keydown.enter)="onEnter($event)"
          placeholder="Ask about your health data..."
          rows="1"
          [disabled]="isLoading()">
        </textarea>
        <button class="send-btn" (click)="sendMessage()" [disabled]="!inputText.trim() || isLoading()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .advisor-page {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 120px);
    }

    .advisor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); margin: 0 0 4px 0; }
      .subtitle { color: var(--text-secondary, #6b7280); font-size: 14px; margin: 0; }
    }

    .model-selector {
      display: flex;
      align-items: center;
      gap: 8px;

      label { font-size: 12px; color: var(--text-secondary, #6b7280); }

      select {
        padding: 6px 10px;
        border: 1px solid var(--border-primary, #e5e7eb);
        border-radius: 6px;
        background: var(--bg-card, #ffffff);
        color: var(--text-primary, #111827);
        font-size: 13px;
        cursor: pointer;
      }
    }

    .disclaimer {
      padding: 10px 14px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
      font-size: 12px;
      color: #b45309;
      margin-bottom: 16px;
    }

    .quick-prompts {
      margin-bottom: 24px;
      h3 { font-size: 14px; font-weight: 600; color: var(--text-secondary, #6b7280); margin: 0 0 12px 0; }
    }

    .prompts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 8px;
    }

    .prompt-card {
      padding: 12px 16px;
      background: var(--bg-card, #ffffff);
      border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-primary, #111827);
      cursor: pointer;
      text-align: left;
      transition: all 150ms;

      &:hover {
        border-color: var(--accent-green, #22c55e);
        background: rgba(34, 197, 94, 0.04);
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .message-user .message-avatar {
      background: var(--accent-green, #22c55e);
      color: white;
    }

    .message-assistant .message-avatar {
      background: var(--bg-icon, #f3f4f6);
      color: var(--text-secondary, #6b7280);
    }

    .message-content { flex: 1; min-width: 0; }

    .message-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--text-primary, #111827);
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    .message-meta {
      font-size: 11px;
      color: var(--text-tertiary, #9ca3af);
      margin-top: 4px;
      display: block;
    }

    .typing-indicator .dots {
      display: flex;
      gap: 4px;
      padding: 8px 0;

      span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-tertiary, #9ca3af);
        animation: bounce 1.4s infinite both;

        &:nth-child(2) { animation-delay: 0.16s; }
        &:nth-child(3) { animation-delay: 0.32s; }
      }
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .chat-input-area {
      display: flex;
      gap: 8px;
      padding: 16px 0 0;
      border-top: 1px solid var(--border-light, #e5e7eb);

      textarea {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid var(--border-primary, #e5e7eb);
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        color: var(--text-primary, #111827);
        background: var(--bg-card, #ffffff);
        resize: none;
        outline: none;
        min-height: 40px;
        max-height: 120px;

        &:focus { border-color: var(--accent-green, #22c55e); }
        &::placeholder { color: var(--text-tertiary, #9ca3af); }
      }

      .send-btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 8px;
        background: var(--accent-green, #22c55e);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 150ms;

        &:hover:not(:disabled) { background: var(--accent-green-dark, #16a34a); }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
      }
    }
  `],
})
export class HealthAdvisorComponent {
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  private supabase = inject(SupabaseService);
  private healthAi = inject(HealthAiService);
  private healthContext = inject(HealthContextService);
  private client = this.supabase.client;

  messages = signal<{ role: string; content: string; modelUsed?: string }[]>([]);
  isLoading = signal(false);
  inputText = '';
  sessionId = crypto.randomUUID();

  activeModel = this.healthAi.activeModel;
  configuredProviders = signal(this.healthAi.getConfiguredProviders());

  quickPrompts = [
    'What do my recent labs say about my health?',
    'How has my sleep been this week?',
    'Am I getting enough exercise?',
    'What should I focus on to improve my health?',
    'Are there any concerning trends in my vitals?',
    'Give me a summary of my health status',
  ];

  switchModel(model: HealthAiModelName) {
    this.healthAi.setModel(model);
  }

  onEnter(event: Event) {
    const keyEvent = event as KeyboardEvent;
    if (!keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage(text?: string) {
    const message = text || this.inputText.trim();
    if (!message || this.isLoading()) return;

    const userId = this.supabase.currentUser()?.id;
    this.inputText = '';

    // Add user message
    this.messages.update(msgs => [...msgs, { role: 'user', content: message }]);
    this.scrollToBottom();

    // Save user message to DB
    if (userId) {
      await this.client.from('health_chat_sessions').insert({
        user_id: userId,
        role: 'user',
        content: message,
        session_id: this.sessionId,
      });
    }

    this.isLoading.set(true);

    try {
      // Build health context
      const context = await this.healthContext.buildContext();

      // Call AI
      const response = await this.healthAi.chat(message, context);
      const modelUsed = this.healthAi.activeModel();

      // Add assistant message
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: response,
        modelUsed,
      }]);

      // Save to DB
      if (userId) {
        await this.client.from('health_chat_sessions').insert({
          user_id: userId,
          role: 'assistant',
          content: response,
          model_used: modelUsed,
          session_id: this.sessionId,
        });
      }
    } catch (err: any) {
      this.messages.update(msgs => [...msgs, {
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get a response. Check your API key configuration.'}`,
      }]);
    }

    this.isLoading.set(false);
    this.scrollToBottom();
  }

  formatMessage(text: string): string {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer?.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
