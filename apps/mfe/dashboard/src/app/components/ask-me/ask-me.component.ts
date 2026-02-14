import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface QAPair {
  keywords: string[];
  response: string;
}

interface TerminalLine {
  type: 'command' | 'response' | 'system';
  text: string;
  isTyping?: boolean;
}

@Component({
  selector: 'app-ask-me',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ask-me.component.html',
  styleUrls: ['./ask-me.component.scss'],
})
export class AskMeComponent implements AfterViewChecked {
  @ViewChild('terminalBody') private terminalBody!: ElementRef;
  @ViewChild('inputField') private inputField!: ElementRef;

  command = '';
  lines = signal<TerminalLine[]>([
    { type: 'system', text: "Welcome to Raja's Terminal. Type 'help' for available commands." },
  ]);
  isProcessing = signal<boolean>(false);
  currentTypingText = signal<string>('');
  private shouldScroll = false;

  // Pre-programmed Q&A pairs
  private qaDatabase: QAPair[] = [
    {
      keywords: ['name', 'who are you', 'introduce', 'about'],
      response:
        "I'm Raja Kalavala, a Principal Software Architect passionate about building scalable systems and great user experiences.",
    },
    {
      keywords: ['experience', 'years', 'how long'],
      response:
        '9+ years of experience in software development, working with enterprise applications, micro frontends, and cloud architecture.',
    },
    {
      keywords: ['tech', 'stack', 'technologies', 'skills', 'work with'],
      response:
        'Tech Stack: Angular, React, Node.js, TypeScript, Python, AWS, Docker, Kubernetes, and Micro Frontend Architecture.',
    },
    {
      keywords: ['hire', 'available', 'work', 'job', 'open to'],
      response:
        'Status: Open to interesting opportunities. Contact via LinkedIn or email for collaborations.',
    },
    {
      keywords: ['contact', 'reach', 'email', 'connect'],
      response:
        'Contact: LinkedIn(/in/rajakalavala) | Twitter(@raja_kalavala) | GitHub(/RajaKalavala)',
    },
    {
      keywords: ['project', 'portfolio', 'built', 'work on'],
      response:
        'Projects: Enterprise dashboards, E-commerce platforms, Healthcare systems, and this portfolio. Check /projects for more.',
    },
    {
      keywords: ['education', 'degree', 'study', 'college'],
      response:
        "Education: Bachelor's in Computer Science. Continuous learner through real-world projects and tech exploration.",
    },
    {
      keywords: ['hobby', 'hobbies', 'free time', 'fun'],
      response:
        'Hobbies: Reading tech blogs, exploring new frameworks, gaming, and building side projects.',
    },
    {
      keywords: ['location', 'where', 'based', 'live', 'city'],
      response:
        'Location: Bangalore, India (Tech Hub). Open to remote opportunities worldwide.',
    },
    {
      keywords: ['ai', 'chatgpt', 'llm', 'machine learning'],
      response:
        'AI Interest: Exploring LLMs, building AI-powered features, and integrating ML into applications. Exciting times!',
    },
    {
      keywords: ['architecture', 'design', 'system'],
      response:
        'Expertise: Micro frontends, microservices, event-driven architecture, and scalable system design.',
    },
  ];

  private commands: { [key: string]: string } = {
    help: `Available commands:
  about     - Learn about me
  skills    - View my tech stack
  contact   - Get contact info
  projects  - See my work
  clear     - Clear terminal
  Or just ask any question!`,
    clear: '__CLEAR__',
    about:
      "I'm Raja Kalavala, Principal Software Architect with 9+ years of experience building scalable systems.",
    skills:
      'Angular | React | Node.js | TypeScript | Python | AWS | Docker | K8s | Micro Frontends',
    contact:
      'LinkedIn: /in/rajakalavala | Twitter: @raja_kalavala | GitHub: /RajaKalavala',
    projects:
      'Navigate to /projects to explore my portfolio including enterprise apps and open-source work.',
  };

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    if (this.terminalBody) {
      const element = this.terminalBody.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  executeCommand(): void {
    if (!this.command.trim() || this.isProcessing()) return;

    const cmd = this.command.trim();
    this.command = '';

    // Add command to terminal
    this.lines.update((l) => [...l, { type: 'command', text: cmd }]);
    this.shouldScroll = true;

    // Process command
    this.isProcessing.set(true);

    setTimeout(() => {
      const response = this.getResponse(cmd);

      if (response === '__CLEAR__') {
        this.lines.set([
          { type: 'system', text: 'Terminal cleared. Type "help" for commands.' },
        ]);
        this.isProcessing.set(false);
        return;
      }

      // Start typing effect
      this.typeResponse(response);
    }, 300);
  }

  private getResponse(cmd: string): string {
    const lowerCmd = cmd.toLowerCase().trim();

    // Check for exact command match
    if (this.commands[lowerCmd]) {
      return this.commands[lowerCmd];
    }

    // Check Q&A database
    for (const qa of this.qaDatabase) {
      if (qa.keywords.some((keyword) => lowerCmd.includes(keyword))) {
        return qa.response;
      }
    }

    // Default response
    return `Command not recognized: "${cmd}". Type "help" for available commands or ask me anything!`;
  }

  private typeResponse(text: string): void {
    // Add empty response line that will be typed into
    this.lines.update((l) => [...l, { type: 'response', text: '', isTyping: true }]);
    this.shouldScroll = true;

    let index = 0;
    const typingSpeed = 15; // ms per character

    const typeChar = () => {
      if (index < text.length) {
        this.lines.update((l) => {
          const newLines = [...l];
          const lastLine = newLines[newLines.length - 1];
          if (lastLine.isTyping) {
            lastLine.text = text.substring(0, index + 1);
          }
          return newLines;
        });
        this.shouldScroll = true;
        index++;
        setTimeout(typeChar, typingSpeed);
      } else {
        // Typing complete
        this.lines.update((l) => {
          const newLines = [...l];
          const lastLine = newLines[newLines.length - 1];
          if (lastLine.isTyping) {
            lastLine.isTyping = false;
          }
          return newLines;
        });
        this.isProcessing.set(false);
        this.focusInput();
      }
    };

    typeChar();
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.executeCommand();
    }
  }

  focusInput(): void {
    setTimeout(() => {
      if (this.inputField) {
        this.inputField.nativeElement.focus();
      }
    }, 10);
  }
}
