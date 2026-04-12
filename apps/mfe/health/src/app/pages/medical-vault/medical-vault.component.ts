import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '@org/supabase';
import { HealthAiService } from '@org/health';
import { HealthDocument, HealthDocumentType } from '@org/health';

@Component({
  selector: 'raja-medical-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="vault-page">
      <div class="page-header">
        <h1>Medical Vault</h1>
        <p class="subtitle">Your private medical document archive</p>
      </div>

      <!-- Upload Zone -->
      <div class="upload-zone"
        [class.drag-over]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        <input #fileInput type="file" hidden
          accept=".pdf,.jpg,.jpeg,.png,.heic,.doc,.docx"
          multiple
          (change)="onFileSelect($event)">
        <div class="upload-content">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green, #22c55e)" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <p class="upload-text">Drag & drop medical reports here, or click to browse</p>
          <p class="upload-hint">Supports PDF, Images (JPG, PNG, HEIC), DOC/DOCX</p>
        </div>
      </div>

      <!-- Upload Progress -->
      <div class="upload-progress" *ngIf="uploading()">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
        </div>
        <span class="progress-text">Uploading... {{ uploadProgress() }}%</span>
      </div>

      <!-- Documents List -->
      <div class="documents-section" *ngIf="documents().length > 0">
        <h3>Documents ({{ documents().length }})</h3>
        <div class="document-list">
          <div class="document-card" *ngFor="let doc of documents()">
            <div class="doc-icon" [ngClass]="'doc-type-' + doc.documentType">
              <svg *ngIf="doc.fileType.includes('pdf')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <svg *ngIf="doc.fileType.includes('image')" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div class="doc-info">
              <span class="doc-title">{{ doc.title }}</span>
              <span class="doc-meta">
                {{ doc.documentType | titlecase }} &middot; {{ doc.documentDate || 'No date' }}
              </span>
            </div>
            <div class="doc-status">
              <span class="status-badge" [ngClass]="'status-' + doc.aiExtractionStatus">
                {{ doc.aiExtractionStatus }}
              </span>
            </div>
            <button class="doc-action" (click)="analyzeDocument(doc)" *ngIf="doc.aiExtractionStatus === 'pending'"
              title="Run AI analysis">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </button>
            <button class="doc-action delete" (click)="deleteDocument(doc)" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- AI Extraction Results -->
      <div class="extraction-section" *ngIf="selectedDocExtractions().length > 0">
        <h3>AI Extracted Data</h3>
        <div class="extraction-table">
          <div class="extraction-row header">
            <span>Label</span>
            <span>Value</span>
            <span>Unit</span>
            <span>Reference Range</span>
            <span>Status</span>
          </div>
          <div class="extraction-row" *ngFor="let ext of selectedDocExtractions()"
            [class.flagged]="ext.isFlagged">
            <span>{{ ext.label }}</span>
            <span class="ext-value">{{ ext.value }}</span>
            <span>{{ ext.unit || '-' }}</span>
            <span>{{ ext.referenceRangeLow && ext.referenceRangeHigh ? ext.referenceRangeLow + ' - ' + ext.referenceRangeHigh : '-' }}</span>
            <span class="status-indicator" [ngClass]="ext.isFlagged ? 'flag-' + ext.flagDirection : 'normal'">
              {{ ext.isFlagged ? ext.flagDirection?.toUpperCase() : 'Normal' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="documents().length === 0 && !uploading()">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary, #9ca3af)" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>No medical documents yet</p>
        <p class="hint">Upload your first report to get started</p>
      </div>
    </div>
  `,
  styles: [`
    .vault-page { max-width: 1000px; margin: 0 auto; }

    .page-header {
      margin-bottom: 24px;
      h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #111827); margin: 0 0 4px 0; }
      .subtitle { color: var(--text-secondary, #6b7280); font-size: 14px; margin: 0; }
    }

    .upload-zone {
      padding: 40px;
      border: 2px dashed var(--border-primary, #e5e7eb);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 200ms;
      margin-bottom: 24px;
      background: var(--bg-card, #ffffff);

      &:hover, &.drag-over {
        border-color: var(--accent-green, #22c55e);
        background: rgba(34, 197, 94, 0.04);
      }
    }

    .upload-content { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .upload-text { font-size: 14px; font-weight: 500; color: var(--text-primary, #111827); margin: 0; }
    .upload-hint { font-size: 12px; color: var(--text-tertiary, #9ca3af); margin: 0; }

    .upload-progress {
      margin-bottom: 24px;
      .progress-bar {
        height: 6px; background: var(--bg-card-alt, #f3f4f6); border-radius: 3px; overflow: hidden;
        .progress-fill { height: 100%; background: var(--accent-green, #22c55e); transition: width 200ms; border-radius: 3px; }
      }
      .progress-text { font-size: 12px; color: var(--text-secondary, #6b7280); margin-top: 4px; display: block; }
    }

    .documents-section {
      h3 { font-size: 16px; font-weight: 600; color: var(--text-primary, #111827); margin: 0 0 12px 0; }
    }

    .document-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }

    .document-card {
      display: flex; align-items: center; gap: 12px; padding: 14px 16px;
      background: var(--bg-card, #ffffff); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px; transition: all 150ms;

      &:hover { border-color: var(--border-primary, #d1d5db); }
    }

    .doc-icon {
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      border-radius: 8px; background: var(--bg-icon, #f3f4f6); color: var(--text-secondary, #6b7280);

      &.doc-type-lab_report { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.doc-type-imaging { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
      &.doc-type-prescription { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    }

    .doc-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .doc-title { font-size: 14px; font-weight: 500; color: var(--text-primary, #111827); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .doc-meta { font-size: 12px; color: var(--text-tertiary, #9ca3af); }

    .status-badge {
      font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 4px; text-transform: capitalize;

      &.status-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      &.status-processing { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.status-completed { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
      &.status-failed { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    }

    .doc-action {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      border: none; border-radius: 6px; cursor: pointer; background: transparent;
      color: var(--text-secondary, #6b7280); transition: all 150ms;

      &:hover { background: var(--bg-card-alt, #f3f4f6); color: var(--accent-green, #22c55e); }
      &.delete:hover { color: #ef4444; }
    }

    .extraction-section {
      h3 { font-size: 16px; font-weight: 600; color: var(--text-primary, #111827); margin: 0 0 12px 0; }
    }

    .extraction-table {
      background: var(--bg-card, #ffffff); border: 1px solid var(--border-light, #e5e7eb);
      border-radius: 10px; overflow: hidden;
    }

    .extraction-row {
      display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
      padding: 10px 16px; font-size: 13px; border-bottom: 1px solid var(--border-light, #e5e7eb);
      color: var(--text-primary, #111827);

      &.header { font-weight: 600; font-size: 12px; color: var(--text-secondary, #6b7280); text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg-card-alt, #f9fafb); }
      &.flagged { background: rgba(239, 68, 68, 0.04); }
      &:last-child { border-bottom: none; }
    }

    .ext-value { font-weight: 600; }

    .status-indicator {
      font-size: 11px; font-weight: 600;
      &.normal { color: var(--accent-green, #22c55e); }
      &.flag-high { color: #ef4444; }
      &.flag-low { color: #f59e0b; }
    }

    .empty-state {
      padding: 64px 32px; text-align: center;
      p { color: var(--text-secondary, #6b7280); margin: 8px 0 0 0; }
      .hint { font-size: 12px; color: var(--text-tertiary, #9ca3af); }
    }
  `],
})
export class MedicalVaultComponent {
  private supabase = inject(SupabaseService);
  private healthAi = inject(HealthAiService);
  private client = this.supabase.client;

  documents = signal<HealthDocument[]>([]);
  selectedDocExtractions = signal<any[]>([]);
  isDragOver = signal(false);
  uploading = signal(false);
  uploadProgress = signal(0);

  async ngOnInit() {
    await this.loadDocuments();
  }

  async loadDocuments() {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return;

    const { data } = await this.client
      .from('health_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      this.documents.set(data.map(row => this.toDocument(row)));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files) {
      await this.uploadFiles(Array.from(files));
    }
  }

  async onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await this.uploadFiles(Array.from(input.files));
      input.value = '';
    }
  }

  async uploadFiles(files: File[]) {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return;

    this.uploading.set(true);
    this.uploadProgress.set(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const year = new Date().getFullYear();
      const storagePath = `${userId}/${year}/${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await this.client.storage
        .from('health-documents')
        .upload(storagePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }

      // Create document record
      const { error: insertError } = await this.client
        .from('health_documents')
        .insert({
          user_id: userId,
          title: file.name.replace(/\.[^.]+$/, ''),
          document_type: 'other',
          storage_path: storagePath,
          file_name: file.name,
          file_type: file.type || 'application/octet-stream',
          file_size_bytes: file.size,
          body_systems: [],
          tags: [],
          ai_extraction_status: 'pending',
        });

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      this.uploadProgress.set(Math.round(((i + 1) / files.length) * 100));
    }

    this.uploading.set(false);
    await this.loadDocuments();
  }

  async analyzeDocument(doc: HealthDocument) {
    const userId = this.supabase.currentUser()?.id;
    if (!userId) return;

    // Update status to processing
    await this.client
      .from('health_documents')
      .update({ ai_extraction_status: 'processing' })
      .eq('id', doc.id);

    await this.loadDocuments();

    try {
      // Get the file from storage
      const { data: fileData } = await this.client.storage
        .from('health-documents')
        .download(doc.storagePath);

      if (!fileData) throw new Error('Could not download file');

      // Convert to base64 for AI processing
      const base64 = await this.fileToBase64(fileData);

      // Call AI for analysis
      const analysis = await this.healthAi.analyzeDocument(base64, doc.fileType);

      // Update document with AI results
      await this.client
        .from('health_documents')
        .update({
          ai_extraction_status: 'completed',
          ai_summary: analysis.summary,
          document_type: analysis.documentType,
          document_date: analysis.documentDate,
          provider_name: analysis.providerName,
          facility_name: analysis.facilityName,
          body_systems: analysis.bodySystems,
        })
        .eq('id', doc.id);

      // Insert extractions
      if (analysis.extractions.length > 0) {
        const extractions = analysis.extractions.map(ext => ({
          user_id: userId,
          document_id: doc.id,
          extraction_type: ext.type,
          label: ext.label,
          value: ext.value,
          value_numeric: ext.valueNumeric,
          unit: ext.unit,
          reference_range_low: ext.referenceRangeLow,
          reference_range_high: ext.referenceRangeHigh,
          is_flagged: ext.isFlagged,
          flag_direction: ext.flagDirection,
          body_system: ext.bodySystem,
          confidence: ext.confidence,
        }));

        await this.client.from('health_document_extractions').insert(extractions);

        // Auto-seed lab results for lab_value extractions
        const labExtractions = analysis.extractions.filter(e => e.type === 'lab_value' && e.valueNumeric != null);
        if (labExtractions.length > 0) {
          const labResults = labExtractions.map(ext => ({
            user_id: userId,
            document_id: doc.id,
            biomarker_name: ext.label,
            biomarker_key: ext.label.toLowerCase().replace(/\s+/g, '_'),
            panel: ext.bodySystem,
            value: ext.valueNumeric!,
            unit: ext.unit || '',
            reference_low: ext.referenceRangeLow,
            reference_high: ext.referenceRangeHigh,
            is_flagged: ext.isFlagged,
            flag_direction: ext.flagDirection,
            lab_date: analysis.documentDate || new Date().toISOString().split('T')[0],
          }));

          await this.client.from('health_lab_results').insert(labResults);
        }
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      await this.client
        .from('health_documents')
        .update({ ai_extraction_status: 'failed' })
        .eq('id', doc.id);
    }

    await this.loadDocuments();
  }

  async deleteDocument(doc: HealthDocument) {
    // Delete from storage
    await this.client.storage
      .from('health-documents')
      .remove([doc.storagePath]);

    // Delete from database (cascades to extractions)
    await this.client
      .from('health_documents')
      .delete()
      .eq('id', doc.id);

    await this.loadDocuments();
  }

  private async fileToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private toDocument(row: any): HealthDocument {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      documentType: row.document_type,
      storagePath: row.storage_path,
      fileName: row.file_name,
      fileType: row.file_type,
      fileSizeBytes: row.file_size_bytes,
      bodySystems: row.body_systems || [],
      documentDate: row.document_date,
      providerName: row.provider_name,
      facilityName: row.facility_name,
      tags: row.tags || [],
      aiExtractionStatus: row.ai_extraction_status,
      aiSummary: row.ai_summary,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
