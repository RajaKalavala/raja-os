import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ADMIN_KEY = 'rajaos_admin_logged_in';
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'admin123';

  // Signal to track admin status
  isAdminLoggedIn = signal<boolean>(this.checkAdminStatus());

  constructor() {}

  /**
   * Check if admin is logged in from localStorage
   */
  private checkAdminStatus(): boolean {
    return localStorage.getItem(this.ADMIN_KEY) === 'true';
  }

  /**
   * Attempt to login with provided credentials
   * @returns true if login successful, false otherwise
   */
  login(username: string, password: string): boolean {
    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      localStorage.setItem(this.ADMIN_KEY, 'true');
      this.isAdminLoggedIn.set(true);
      return true;
    }
    return false;
  }

  /**
   * Logout the admin user
   */
  logout(): void {
    localStorage.removeItem(this.ADMIN_KEY);
    this.isAdminLoggedIn.set(false);
  }

  /**
   * Get current admin status
   */
  isAdmin(): boolean {
    return this.isAdminLoggedIn();
  }
}
