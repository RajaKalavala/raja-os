import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login-modal.component.html',
  styleUrls: ['./admin-login-modal.component.scss']
})
export class AdminLoginModalComponent {
  @Output() close = new EventEmitter<void>();

  username = '';
  password = '';
  errorMessage = signal<string>('');

  constructor(private authService: AuthService) {}

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter both username and password');
      return;
    }

    const success = this.authService.login(this.username, this.password);

    if (success) {
      this.close.emit();
    } else {
      this.errorMessage.set('Invalid username or password');
      this.password = ''; // Clear password on failed attempt
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    // Close modal if clicking on backdrop (not the modal content)
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
