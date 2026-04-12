import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '@org/supabase';
import { HealthProfile, AllergyEntry, EmergencyContact } from '@org/health';

@Component({
  selector: 'raja-emergency-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="emergency-page">
      <div class="page-header">
        <h1>Emergency Card</h1>
        <p class="subtitle">Critical health info at a glance</p>
        <div class="header-actions">
          <button class="btn-edit" (click)="toggleEdit()" *ngIf="!editing()">Edit</button>
          <button class="btn-save" (click)="saveProfile()" *ngIf="editing()">Save</button>
          <button class="btn-cancel" (click)="toggleEdit()" *ngIf="editing()">Cancel</button>
          <button class="btn-print" (click)="printCard()">Print</button>
        </div>
      </div>

      <!-- View Mode -->
      <div class="emergency-card" *ngIf="!editing() && profile()" id="emergency-card-print">
        <div class="card-header">
          <div class="card-title">MEDICAL ID</div>
        </div>

        <div class="card-grid">
          <div class="card-section">
            <label>Blood Type</label>
            <span class="blood-type">{{ profile()?.bloodType || 'Not set' }}</span>
          </div>

          <div class="card-section">
            <label>Date of Birth</label>
            <span>{{ profile()?.dateOfBirth || 'Not set' }}</span>
          </div>

          <div class="card-section">
            <label>Height</label>
            <span>{{ profile()?.heightCm ? profile()!.heightCm + ' cm' : 'Not set' }}</span>
          </div>

          <div class="card-section full-width">
            <label>Allergies</label>
            <div class="allergy-list" *ngIf="profile()?.allergies?.length; else noAllergies">
              <div class="allergy-tag" *ngFor="let allergy of profile()?.allergies"
                [ngClass]="'severity-' + allergy.severity">
                <strong>{{ allergy.substance }}</strong>
                <span>{{ allergy.reaction }} ({{ allergy.severity }})</span>
              </div>
            </div>
            <ng-template #noAllergies><span class="no-data">No known allergies</span></ng-template>
          </div>

          <div class="card-section full-width">
            <label>Chronic Conditions</label>
            <div *ngIf="profile()?.chronicConditions?.length; else noConditions">
              <span class="condition-tag" *ngFor="let c of profile()?.chronicConditions">{{ c }}</span>
            </div>
            <ng-template #noConditions><span class="no-data">None listed</span></ng-template>
          </div>

          <div class="card-section full-width">
            <label>Emergency Contacts</label>
            <div class="contact-list" *ngIf="profile()?.emergencyContacts?.length; else noContacts">
              <div class="contact-row" *ngFor="let c of profile()?.emergencyContacts">
                <strong>{{ c.name }}</strong> ({{ c.relation }}) &mdash; {{ c.phone }}
              </div>
            </div>
            <ng-template #noContacts><span class="no-data">None listed</span></ng-template>
          </div>

          <div class="card-section full-width" *ngIf="profile()?.primaryPhysician">
            <label>Primary Physician</label>
            <div class="contact-row">
              <strong>{{ profile()?.primaryPhysician?.name }}</strong>
              {{ profile()?.primaryPhysician?.clinic ? ' - ' + profile()?.primaryPhysician?.clinic : '' }}
              {{ profile()?.primaryPhysician?.phone ? ' | ' + profile()?.primaryPhysician?.phone : '' }}
            </div>
          </div>

          <div class="card-section" *ngIf="profile()?.organDonor !== null">
            <label>Organ Donor</label>
            <span>{{ profile()?.organDonor ? 'Yes' : 'No' }}</span>
          </div>
        </div>
      </div>

      <!-- Edit Mode -->
      <div class="edit-form" *ngIf="editing()">
        <div class="form-group">
          <label>Blood Type</label>
          <select [(ngModel)]="editData.bloodType">
            <option value="">Select</option>
            <option *ngFor="let bt of bloodTypes" [value]="bt">{{ bt }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" [(ngModel)]="editData.dateOfBirth">
          </div>
          <div class="form-group">
            <label>Height (cm)</label>
            <input type="number" [(ngModel)]="editData.heightCm" placeholder="170">
          </div>
        </div>

        <div class="form-group">
          <label>Organ Donor</label>
          <select [(ngModel)]="editData.organDonor">
            <option [ngValue]="null">Not specified</option>
            <option [ngValue]="true">Yes</option>
            <option [ngValue]="false">No</option>
          </select>
        </div>

        <div class="form-group">
          <label>Chronic Conditions (comma-separated)</label>
          <input type="text" [(ngModel)]="conditionsText" placeholder="e.g., Asthma, Diabetes">
        </div>

        <div class="form-section">
          <div class="section-header">
            <label>Allergies</label>
            <button class="btn-add" (click)="addAllergy()">+ Add</button>
          </div>
          <div class="allergy-form" *ngFor="let a of editData.allergies; let i = index">
            <input type="text" [(ngModel)]="a.substance" placeholder="Substance">
            <input type="text" [(ngModel)]="a.reaction" placeholder="Reaction">
            <select [(ngModel)]="a.severity">
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
            <button class="btn-remove" (click)="editData.allergies.splice(i, 1)">x</button>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <label>Emergency Contacts</label>
            <button class="btn-add" (click)="addContact()">+ Add</button>
          </div>
          <div class="contact-form" *ngFor="let c of editData.emergencyContacts; let i = index">
            <input type="text" [(ngModel)]="c.name" placeholder="Name">
            <input type="text" [(ngModel)]="c.relation" placeholder="Relation">
            <input type="tel" [(ngModel)]="c.phone" placeholder="Phone">
            <button class="btn-remove" (click)="editData.emergencyContacts.splice(i, 1)">x</button>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <label>Primary Physician</label>
          </div>
          <div class="physician-form">
            <input type="text" [(ngModel)]="physicianName" placeholder="Doctor name">
            <input type="text" [(ngModel)]="physicianClinic" placeholder="Clinic">
            <input type="tel" [(ngModel)]="physicianPhone" placeholder="Phone">
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!editing() && !profile()">
        <p>No health profile set up yet.</p>
        <button class="btn-edit" (click)="toggleEdit()">Set Up Profile</button>
      </div>
    </div>
  `,
  styles: [`
    .emergency-page { max-width: 700px; margin: 0 auto; }

    .page-header {
      display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); margin: 0; flex: 1; }
      .subtitle { color: var(--text-secondary, #6b7280); font-size: 14px; margin: 0; width: 100%; }
    }

    .header-actions { display: flex; gap: 8px; }

    .btn-edit, .btn-save, .btn-cancel, .btn-print {
      padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 500;
      cursor: pointer; border: 1px solid var(--border-primary, #e5e7eb); transition: all 150ms;
    }

    .btn-edit, .btn-print { background: var(--bg-card, #ffffff); color: var(--text-primary, #111827); }
    .btn-save { background: var(--accent-green, #22c55e); color: white; border-color: transparent; }
    .btn-cancel { background: transparent; color: var(--text-secondary, #6b7280); }

    .emergency-card {
      background: var(--bg-card, #ffffff); border: 2px solid var(--border-primary, #e5e7eb);
      border-radius: 16px; overflow: hidden;
    }

    .card-header {
      background: #ef4444; padding: 16px 24px;
      .card-title { font-size: 18px; font-weight: 700; color: white; letter-spacing: 2px; }
    }

    .card-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 24px;
    }

    .card-section {
      &.full-width { grid-column: 1 / -1; }
      label { display: block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-tertiary, #9ca3af); margin-bottom: 4px; }
      span { font-size: 14px; color: var(--text-primary, #111827); }
    }

    .blood-type { font-size: 24px !important; font-weight: 700; color: #ef4444 !important; }

    .allergy-tag {
      display: inline-flex; flex-direction: column; padding: 6px 12px; border-radius: 6px;
      margin: 0 8px 8px 0; font-size: 13px;

      &.severity-severe { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); }
      &.severity-moderate { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); }
      &.severity-mild { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); }

      span { font-size: 11px; color: var(--text-secondary, #6b7280); }
    }

    .condition-tag {
      display: inline-block; padding: 4px 10px; border-radius: 4px;
      background: var(--bg-card-alt, #f3f4f6); font-size: 13px; margin: 0 6px 6px 0;
      color: var(--text-primary, #111827);
    }

    .contact-row { font-size: 14px; color: var(--text-primary, #111827); margin-bottom: 4px; }
    .no-data { font-size: 13px; color: var(--text-tertiary, #9ca3af); font-style: italic; }

    /* Edit Form Styles */
    .edit-form {
      background: var(--bg-card, #ffffff); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px;
    }

    .form-group {
      display: flex; flex-direction: column; gap: 4px;
      label { font-size: 12px; font-weight: 600; color: var(--text-secondary, #6b7280); }
      input, select {
        padding: 8px 12px; border: 1px solid var(--border-primary, #e5e7eb); border-radius: 6px;
        font-size: 14px; color: var(--text-primary, #111827); background: var(--bg-card, #ffffff);
      }
    }

    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-section {
      .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
        label { font-size: 12px; font-weight: 600; color: var(--text-secondary, #6b7280); }
      }
    }

    .btn-add { padding: 4px 10px; border: 1px dashed var(--accent-green, #22c55e); border-radius: 4px; background: transparent; color: var(--accent-green, #22c55e); font-size: 12px; cursor: pointer; }
    .btn-remove { padding: 4px 8px; border: none; background: transparent; color: #ef4444; cursor: pointer; font-size: 14px; }

    .allergy-form, .contact-form, .physician-form {
      display: flex; gap: 8px; margin-bottom: 8px; align-items: center;
      input, select {
        flex: 1; padding: 6px 10px; border: 1px solid var(--border-primary, #e5e7eb);
        border-radius: 6px; font-size: 13px; color: var(--text-primary, #111827);
        background: var(--bg-card, #ffffff);
      }
    }

    .empty-state { padding: 64px 32px; text-align: center;
      p { color: var(--text-secondary, #6b7280); margin-bottom: 16px; }
    }

    @media print {
      .page-header, .header-actions { display: none !important; }
      .emergency-card { border: 2px solid #000; }
    }
  `],
})
export class EmergencyCardComponent {
  private supabase = inject(SupabaseService);
  private client = this.supabase.client;

  profile = signal<HealthProfile | null>(null);
  editing = signal(false);

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  editData: {
    bloodType: string;
    dateOfBirth: string;
    heightCm: number | null;
    organDonor: boolean | null;
    allergies: AllergyEntry[];
    emergencyContacts: EmergencyContact[];
  } = {
    bloodType: '',
    dateOfBirth: '',
    heightCm: null,
    organDonor: null,
    allergies: [],
    emergencyContacts: [],
  };

  conditionsText = '';
  physicianName = '';
  physicianClinic = '';
  physicianPhone = '';

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return;

    const { data } = await this.client
      .from('health_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      this.profile.set({
        id: data.id,
        userId: data.user_id,
        bloodType: data.blood_type,
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        primaryPhysician: data.primary_physician,
        emergencyContacts: data.emergency_contacts || [],
        insurance: data.insurance,
        organDonor: data.organ_donor,
        heightCm: data.height_cm,
        dateOfBirth: data.date_of_birth,
      });
    }
  }

  toggleEdit() {
    if (!this.editing()) {
      const p = this.profile();
      this.editData = {
        bloodType: p?.bloodType || '',
        dateOfBirth: p?.dateOfBirth || '',
        heightCm: p?.heightCm || null,
        organDonor: p?.organDonor ?? null,
        allergies: p?.allergies ? [...p.allergies] : [],
        emergencyContacts: p?.emergencyContacts ? [...p.emergencyContacts] : [],
      };
      this.conditionsText = p?.chronicConditions?.join(', ') || '';
      this.physicianName = p?.primaryPhysician?.name || '';
      this.physicianClinic = p?.primaryPhysician?.clinic || '';
      this.physicianPhone = p?.primaryPhysician?.phone || '';
    }
    this.editing.update(v => !v);
  }

  addAllergy() {
    this.editData.allergies.push({ substance: '', reaction: '', severity: 'mild' });
  }

  addContact() {
    this.editData.emergencyContacts.push({ name: '', relation: '', phone: '' });
  }

  async saveProfile() {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return;

    const payload = {
      user_id: userId,
      blood_type: this.editData.bloodType || null,
      date_of_birth: this.editData.dateOfBirth || null,
      height_cm: this.editData.heightCm,
      organ_donor: this.editData.organDonor,
      allergies: this.editData.allergies.filter(a => a.substance.trim()),
      chronic_conditions: this.conditionsText.split(',').map(s => s.trim()).filter(Boolean),
      emergency_contacts: this.editData.emergencyContacts.filter(c => c.name.trim()),
      primary_physician: this.physicianName.trim()
        ? { name: this.physicianName, clinic: this.physicianClinic, phone: this.physicianPhone }
        : null,
    };

    const { error } = await this.client
      .from('health_profile')
      .upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      this.editing.set(false);
      await this.loadProfile();
    }
  }

  printCard() {
    window.print();
  }
}
