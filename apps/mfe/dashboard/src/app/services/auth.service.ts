import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '@org/supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);

  isAdminLoggedIn = this.supabase.isAdmin;

  async login(email: string, password: string): Promise<{ error: string | null }> {
    return this.supabase.signIn(email, password);
  }

  async logout(): Promise<void> {
    await this.supabase.signOut();
  }

  isAdmin(): boolean {
    return this.supabase.isAdmin();
  }
}
