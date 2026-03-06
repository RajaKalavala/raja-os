import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../../../apps/shell/src/environments/environment';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  role: 'admin' | 'viewer';
  avatar_url: string | null;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  currentUser = signal<User | null>(null);
  currentProfile = signal<Profile | null>(null);
  isAdmin = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this.loadProfile(session.user.id);
      } else {
        this.currentProfile.set(null);
        this.isAdmin.set(false);
      }
    });

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this.loadProfile(session.user.id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  private async loadProfile(userId: string) {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      this.currentProfile.set(data as Profile);
      this.isAdmin.set(data.role === 'admin');
    }
    this.isLoading.set(false);
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
    this.currentProfile.set(null);
    this.isAdmin.set(false);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
