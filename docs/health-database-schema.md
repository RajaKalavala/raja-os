# RajaOS Health App — Database Schema

## Overview

This document defines the complete database schema for the RajaOS Health application — a personal health archive that stores medical reports, daily health metrics, lab results, medications, and AI-powered health insights.

**Target audience**: Database administrators, backend developers, API developers.

---

## File Storage Strategy

All files (medical reports, images, scanned documents, prescriptions) are stored in **cloud object storage** (e.g., AWS S3, Supabase Storage, Google Cloud Storage, Azure Blob). The database stores only the **file access URL** so that the frontend can load files directly by querying the database.

**Pattern:**
- On upload: file goes to cloud storage, a public/signed URL is generated
- The URL is stored in the `file_url` column of the relevant table
- On query: the UI receives the URL and renders the file (image, PDF, etc.) directly

**URL format examples:**
```
https://storage.example.com/health-documents/{user_id}/2026/lab-report-jan.pdf
https://storage.example.com/health-documents/{user_id}/2026/xray-chest.jpg
```

**Security**: Files should be stored in a private bucket. Use signed URLs with expiry (e.g., 1 hour) or implement an API proxy that checks authentication before serving the file.

---

## Entity Relationship Diagram (Text)

```
users (auth system)
  |
  |-- 1:N -- health_vitals
  |-- 1:N -- health_documents
  |             |-- 1:N -- health_document_extractions
  |             |-- 1:N -- health_lab_results (via document_id)
  |-- 1:N -- health_lab_results (also standalone)
  |-- 1:N -- health_medications
  |             |-- 1:N -- health_medication_logs
  |-- 1:N -- health_daily_log
  |-- 1:N -- health_goals
  |-- 1:N -- health_chat_sessions
  |-- 1:1 -- health_profile
  |-- 1:N -- health_import_sessions
```

---

## Tables

### 1. `health_profile`

Stores the user's static health profile — blood type, allergies, emergency contacts, insurance. One row per user.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table. **UNIQUE** — one profile per user |
| `blood_type` | VARCHAR(5) | YES | NULL | e.g., `A+`, `O-`, `AB+` |
| `date_of_birth` | DATE | YES | NULL | User's date of birth |
| `height_cm` | DECIMAL(5,1) | YES | NULL | Height in centimeters |
| `weight_kg` | DECIMAL(5,1) | YES | NULL | Current weight in kg |
| `allergies` | JSON | YES | `[]` | Array of objects: `[{"substance": "Penicillin", "reaction": "Anaphylaxis", "severity": "severe"}]` |
| `chronic_conditions` | JSON | YES | `[]` | Array of strings: `["Asthma", "Type 2 Diabetes"]` |
| `primary_physician` | JSON | YES | NULL | Object: `{"name": "Dr. Smith", "phone": "+1-555-1234", "clinic": "City Hospital", "specialty": "Internal Medicine"}` |
| `emergency_contacts` | JSON | YES | `[]` | Array of objects: `[{"name": "Jane Doe", "relation": "Spouse", "phone": "+1-555-5678"}]` |
| `insurance` | JSON | YES | NULL | Object: `{"provider": "Blue Cross", "policy_number": "BC123456", "group_number": "GRP789"}` |
| `organ_donor` | BOOLEAN | YES | NULL | Whether user is an organ donor |
| `profile_photo_url` | TEXT | YES | NULL | URL to user's profile photo in cloud storage |
| `notes` | TEXT | YES | NULL | Any additional health notes |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |
| `updated_at` | TIMESTAMP | NO | `now()` | Last update time |

**Constraints:** `UNIQUE(user_id)`

---

### 2. `health_vitals`

Stores time-series health metrics from Apple Watch, wearables, or manual entry. This is the high-volume table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `metric_type` | VARCHAR(50) | NO | — | Metric identifier (see Metric Types below) |
| `value` | DECIMAL(10,3) | NO | — | Numeric value of the measurement |
| `unit` | VARCHAR(30) | NO | — | Unit of measurement (e.g., `bpm`, `steps`, `hours`, `kg`, `%`) |
| `source` | VARCHAR(30) | NO | `'manual'` | Data source: `apple_health`, `manual`, `oura`, `garmin`, `fitbit` |
| `device_name` | VARCHAR(100) | YES | NULL | Device that recorded the metric (e.g., `Apple Watch Series 9`) |
| `recorded_at` | TIMESTAMP | NO | — | When the measurement was actually taken |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |

**Indexes:**
- `(user_id, metric_type, recorded_at DESC)` — primary query pattern
- `(user_id, recorded_at DESC)` — for date-range queries across all metrics

**Metric Types:**

| metric_type | unit | Description |
|-------------|------|-------------|
| `heart_rate` | bpm | Instantaneous heart rate |
| `resting_hr` | bpm | Resting heart rate (daily average) |
| `hrv` | ms | Heart rate variability (SDNN) |
| `steps` | steps | Step count |
| `active_energy` | kcal | Active calories burned |
| `basal_energy` | kcal | Basal/resting calories burned |
| `sleep_hours` | hours | Total sleep duration |
| `sleep_quality` | score | Sleep quality score (0-100) |
| `sleep_deep` | hours | Deep sleep duration |
| `sleep_rem` | hours | REM sleep duration |
| `sleep_light` | hours | Light sleep duration |
| `spo2` | % | Blood oxygen saturation |
| `respiratory_rate` | breaths/min | Respiratory rate |
| `weight_kg` | kg | Body weight |
| `body_fat_pct` | % | Body fat percentage |
| `vo2_max` | mL/kg/min | VO2 max estimate |
| `blood_pressure_systolic` | mmHg | Systolic blood pressure |
| `blood_pressure_diastolic` | mmHg | Diastolic blood pressure |
| `blood_glucose` | mg/dL | Blood glucose level |
| `body_temperature` | celsius | Body temperature |
| `mindful_minutes` | minutes | Mindfulness/meditation duration |
| `water_intake` | ml | Water consumed |
| `caffeine_intake` | mg | Caffeine consumed |

---

### 3. `health_documents`

Stores metadata about uploaded medical documents. **Actual files are in cloud storage; this table stores the URL.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `title` | VARCHAR(255) | NO | — | User-facing document title |
| `document_type` | VARCHAR(30) | NO | `'other'` | Type classification (see Document Types below) |
| `file_url` | TEXT | NO | — | **Full URL to the file in cloud storage** (PDF, image, etc.) |
| `file_name` | VARCHAR(255) | NO | — | Original file name (e.g., `blood-work-jan-2026.pdf`) |
| `file_type` | VARCHAR(50) | NO | — | MIME type: `application/pdf`, `image/jpeg`, `image/png`, `image/heic`, `application/msword` |
| `file_size_bytes` | BIGINT | YES | NULL | File size in bytes |
| `thumbnail_url` | TEXT | YES | NULL | **URL to a thumbnail preview** (auto-generated for images/PDFs) |
| `body_systems` | JSON | YES | `[]` | Array of body systems: `["cardiovascular", "endocrine"]` |
| `document_date` | DATE | YES | NULL | Date **on the document** (not upload date) |
| `provider_name` | VARCHAR(255) | YES | NULL | Doctor/provider who issued the document |
| `facility_name` | VARCHAR(255) | YES | NULL | Hospital/clinic name |
| `tags` | JSON | YES | `[]` | User-defined tags: `["annual checkup", "blood work"]` |
| `ai_extraction_status` | VARCHAR(20) | NO | `'pending'` | AI processing status: `pending`, `processing`, `completed`, `failed` |
| `ai_summary` | TEXT | YES | NULL | AI-generated 2-3 sentence summary of the document |
| `ai_model_used` | VARCHAR(50) | YES | NULL | Which AI model processed this: `gpt-4o`, `claude-sonnet`, `gemini-pro` |
| `notes` | TEXT | YES | NULL | User's personal notes about this document |
| `created_at` | TIMESTAMP | NO | `now()` | Upload time |
| `updated_at` | TIMESTAMP | NO | `now()` | Last update time |

**Document Types:**
`lab_report`, `imaging`, `prescription`, `discharge_summary`, `referral`, `insurance`, `vaccination`, `dental`, `eye_exam`, `therapy_notes`, `other`

**Indexes:**
- `(user_id, document_type, created_at DESC)`
- `(user_id, document_date DESC)`

---

### 4. `health_document_extractions`

Stores structured data that AI extracts from each document (lab values, diagnoses, medications found, findings).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `document_id` | UUID | NO | — | FK to `health_documents`. **ON DELETE CASCADE** |
| `extraction_type` | VARCHAR(30) | NO | — | What was extracted: `lab_value`, `diagnosis`, `medication`, `vital_sign`, `finding`, `recommendation`, `procedure` |
| `label` | VARCHAR(255) | NO | — | Name of the extracted item (e.g., `Hemoglobin A1c`, `Total Cholesterol`) |
| `value` | TEXT | NO | — | Extracted value as string (e.g., `5.7`, `Normal`, `Positive`) |
| `value_numeric` | DECIMAL(10,3) | YES | NULL | Numeric value if applicable |
| `unit` | VARCHAR(30) | YES | NULL | Unit of measurement |
| `reference_range_low` | DECIMAL(10,3) | YES | NULL | Lower bound of normal range |
| `reference_range_high` | DECIMAL(10,3) | YES | NULL | Upper bound of normal range |
| `is_flagged` | BOOLEAN | NO | `false` | Whether value is outside reference range |
| `flag_direction` | VARCHAR(15) | YES | NULL | `high`, `low`, `critical_high`, `critical_low` |
| `body_system` | VARCHAR(50) | YES | NULL | Related body system: `cardiovascular`, `endocrine`, `hematology`, etc. |
| `confidence` | DECIMAL(3,2) | YES | NULL | AI confidence score (0.00 - 1.00) |
| `created_at` | TIMESTAMP | NO | `now()` | Extraction time |

**Indexes:**
- `(document_id)`
- `(user_id, extraction_type)`

---

### 5. `health_lab_results`

Normalized biomarker values tracked over time. Can be auto-populated from document extractions or entered manually.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `document_id` | UUID | YES | NULL | FK to `health_documents` (NULL if manually entered). **ON DELETE SET NULL** |
| `biomarker_name` | VARCHAR(100) | NO | — | Display name: `Hemoglobin A1c`, `LDL Cholesterol`, `TSH` |
| `biomarker_key` | VARCHAR(50) | NO | — | Normalized key for grouping: `hba1c`, `ldl_cholesterol`, `tsh` |
| `panel` | VARCHAR(50) | YES | NULL | Lab panel grouping: `cbc`, `metabolic`, `lipid`, `thyroid`, `liver`, `kidney`, `vitamin`, `hormone`, `iron` |
| `value` | DECIMAL(10,3) | NO | — | Numeric result |
| `unit` | VARCHAR(30) | NO | — | Unit of measurement |
| `reference_low` | DECIMAL(10,3) | YES | NULL | Lower bound of normal |
| `reference_high` | DECIMAL(10,3) | YES | NULL | Upper bound of normal |
| `is_flagged` | BOOLEAN | NO | `false` | Whether outside reference range |
| `flag_direction` | VARCHAR(15) | YES | NULL | `high`, `low`, `critical_high`, `critical_low` |
| `lab_date` | DATE | NO | — | Date the lab test was performed |
| `lab_name` | VARCHAR(255) | YES | NULL | Laboratory name (e.g., `Quest Diagnostics`) |
| `ordered_by` | VARCHAR(255) | YES | NULL | Ordering physician |
| `report_url` | TEXT | YES | NULL | **URL to the original lab report file** (can reference the same URL from health_documents) |
| `notes` | TEXT | YES | NULL | User notes |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |

**Indexes:**
- `(user_id, biomarker_key, lab_date DESC)` — primary query for trend charts
- `(user_id, panel, lab_date DESC)` — panel-level queries
- `(user_id, is_flagged)` — flagged results lookup

**Common Biomarkers Reference:**

| biomarker_key | panel | unit | Typical Reference Range |
|---------------|-------|------|------------------------|
| `hba1c` | metabolic | % | 4.0 - 5.6 |
| `fasting_glucose` | metabolic | mg/dL | 70 - 100 |
| `total_cholesterol` | lipid | mg/dL | < 200 |
| `ldl_cholesterol` | lipid | mg/dL | < 100 |
| `hdl_cholesterol` | lipid | mg/dL | > 40 |
| `triglycerides` | lipid | mg/dL | < 150 |
| `tsh` | thyroid | mIU/L | 0.4 - 4.0 |
| `free_t4` | thyroid | ng/dL | 0.8 - 1.8 |
| `hemoglobin` | cbc | g/dL | 13.5 - 17.5 |
| `wbc` | cbc | K/uL | 4.5 - 11.0 |
| `platelets` | cbc | K/uL | 150 - 400 |
| `creatinine` | kidney | mg/dL | 0.7 - 1.3 |
| `egfr` | kidney | mL/min | > 60 |
| `alt` | liver | U/L | 7 - 56 |
| `ast` | liver | U/L | 10 - 40 |
| `vitamin_d` | vitamin | ng/mL | 30 - 100 |
| `vitamin_b12` | vitamin | pg/mL | 200 - 900 |
| `iron` | iron | mcg/dL | 60 - 170 |
| `ferritin` | iron | ng/mL | 12 - 300 |
| `testosterone` | hormone | ng/dL | 300 - 1000 |
| `cortisol` | hormone | mcg/dL | 6 - 23 |

---

### 6. `health_medications`

Tracks prescription medications and supplements.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `name` | VARCHAR(255) | NO | — | Medication/supplement name |
| `category` | VARCHAR(20) | NO | `'medication'` | `medication`, `supplement`, `vitamin`, `otc` |
| `dosage` | VARCHAR(50) | NO | — | e.g., `10mg`, `500mg`, `1 capsule` |
| `frequency` | VARCHAR(30) | NO | — | `once_daily`, `twice_daily`, `three_daily`, `weekly`, `as_needed` |
| `times_of_day` | JSON | YES | `[]` | Array of times: `["morning", "evening"]` or `["08:00", "20:00"]` |
| `route` | VARCHAR(30) | YES | NULL | `oral`, `topical`, `injection`, `inhaled`, `sublingual` |
| `prescribed_by` | VARCHAR(255) | YES | NULL | Prescribing doctor |
| `prescribed_for` | VARCHAR(255) | YES | NULL | Condition/reason (e.g., `High cholesterol`) |
| `start_date` | DATE | NO | — | When started taking |
| `end_date` | DATE | YES | NULL | When stopped (NULL = ongoing) |
| `is_active` | BOOLEAN | NO | `true` | Currently taking? |
| `reminder_enabled` | BOOLEAN | NO | `false` | Push notification reminders |
| `reminder_times` | JSON | YES | `[]` | Reminder times: `["08:00", "20:00"]` |
| `prescription_url` | TEXT | YES | NULL | **URL to prescription document/image in cloud storage** |
| `notes` | TEXT | YES | NULL | Additional notes |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |
| `updated_at` | TIMESTAMP | NO | `now()` | Last update time |

**Indexes:**
- `(user_id, is_active)`

---

### 7. `health_medication_logs`

Daily medication adherence tracking — did the user take their medication?

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `medication_id` | UUID | NO | — | FK to `health_medications`. **ON DELETE CASCADE** |
| `log_date` | DATE | NO | — | Which day |
| `taken` | BOOLEAN | NO | — | Was it taken? |
| `taken_at` | TIMESTAMP | YES | NULL | Exact time taken |
| `skipped_reason` | VARCHAR(255) | YES | NULL | Why skipped (if not taken) |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |

**Constraints:** `UNIQUE(user_id, medication_id, log_date)`

---

### 8. `health_daily_log`

Subjective daily wellness log — mood, energy, stress, symptoms. One entry per user per day.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `log_date` | DATE | NO | — | Which day |
| `mood_score` | SMALLINT | YES | NULL | 1-10 scale (1=terrible, 10=excellent) |
| `energy_score` | SMALLINT | YES | NULL | 1-10 scale |
| `stress_score` | SMALLINT | YES | NULL | 1-10 scale (1=no stress, 10=extreme stress) |
| `sleep_quality` | SMALLINT | YES | NULL | 1-10 scale |
| `symptoms` | JSON | YES | `[]` | Array of strings: `["headache", "fatigue", "brain_fog", "nausea"]` |
| `water_glasses` | SMALLINT | YES | NULL | Glasses of water consumed |
| `exercise_minutes` | SMALLINT | YES | NULL | Minutes of exercise |
| `exercise_type` | VARCHAR(50) | YES | NULL | `run`, `gym`, `yoga`, `walk`, `swim`, `cycling`, `other` |
| `alcohol_units` | SMALLINT | YES | NULL | Alcohol units consumed (0 = none) |
| `notes` | TEXT | YES | NULL | Free-form daily notes |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |
| `updated_at` | TIMESTAMP | NO | `now()` | Last update time |

**Constraints:**
- `UNIQUE(user_id, log_date)`
- `CHECK (mood_score BETWEEN 1 AND 10)`
- `CHECK (energy_score BETWEEN 1 AND 10)`
- `CHECK (stress_score BETWEEN 1 AND 10)`
- `CHECK (sleep_quality BETWEEN 1 AND 10)`

---

### 9. `health_goals`

Health-specific goals with target tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `title` | VARCHAR(255) | NO | — | Goal title (e.g., `Reach 75kg`, `Lower LDL below 100`) |
| `category` | VARCHAR(30) | NO | — | `weight`, `fitness`, `nutrition`, `sleep`, `lab_target`, `habit`, `mental_health` |
| `metric_type` | VARCHAR(50) | YES | NULL | Links to `health_vitals.metric_type` for auto-tracking |
| `biomarker_key` | VARCHAR(50) | YES | NULL | Links to `health_lab_results.biomarker_key` for lab goals |
| `target_value` | DECIMAL(10,3) | YES | NULL | Target number |
| `target_unit` | VARCHAR(30) | YES | NULL | Unit for the target |
| `baseline_value` | DECIMAL(10,3) | YES | NULL | Starting value when goal was set |
| `current_value` | DECIMAL(10,3) | YES | NULL | Latest tracked value |
| `deadline` | DATE | YES | NULL | Target completion date |
| `status` | VARCHAR(20) | NO | `'active'` | `active`, `achieved`, `paused`, `abandoned` |
| `notes` | TEXT | YES | NULL | Notes |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |
| `updated_at` | TIMESTAMP | NO | `now()` | Last update time |

---

### 10. `health_chat_sessions`

Stores AI health advisor chat history. Each row is a single message.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `session_id` | UUID | NO | — | Groups messages into a conversation |
| `role` | VARCHAR(10) | NO | — | `user` or `assistant` |
| `content` | TEXT | NO | — | Message text |
| `model_used` | VARCHAR(50) | YES | NULL | AI model: `gpt-4o`, `claude-sonnet`, `gemini-pro` |
| `metadata` | JSON | YES | NULL | Additional metadata (tokens used, latency, etc.) |
| `created_at` | TIMESTAMP | NO | `now()` | Message time |

**Constraints:** `CHECK (role IN ('user', 'assistant'))`

**Indexes:**
- `(user_id, session_id, created_at ASC)` — load a conversation in order

---

### 11. `health_import_sessions`

Tracks data imports from Apple Health, wearables, or CSV files.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | auto-generate | Primary key |
| `user_id` | UUID | NO | — | FK to users table |
| `source` | VARCHAR(30) | NO | `'apple_health_xml'` | Import source: `apple_health_xml`, `csv`, `oura_api`, `garmin_api` |
| `file_name` | VARCHAR(255) | YES | NULL | Name of the imported file |
| `file_url` | TEXT | YES | NULL | **URL to the original import file in cloud storage** (for audit trail) |
| `records_parsed` | INTEGER | NO | `0` | Total records found in the file |
| `records_inserted` | INTEGER | NO | `0` | New records inserted |
| `records_skipped` | INTEGER | NO | `0` | Duplicates skipped |
| `date_range_start` | DATE | YES | NULL | Earliest data point in the import |
| `date_range_end` | DATE | YES | NULL | Latest data point in the import |
| `status` | VARCHAR(20) | NO | `'processing'` | `processing`, `completed`, `failed` |
| `error_message` | TEXT | YES | NULL | Error details if failed |
| `import_date` | TIMESTAMP | NO | `now()` | When the import was initiated |
| `created_at` | TIMESTAMP | NO | `now()` | Row creation time |

---

## Security

### Row-Level Security (RLS)

Every table must enforce that users can only access their own data:

```
All tables: user can SELECT, INSERT, UPDATE, DELETE WHERE user_id = authenticated_user_id
```

### File Access Security

- Cloud storage bucket should be **private** (no public access)
- Generate **signed URLs with expiry** (1 hour recommended) when the user requests a file
- API should verify the authenticated user owns the document before generating a signed URL

---

## API Endpoints (Recommended)

### Health Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/profile` | Get user's health profile |
| PUT | `/api/health/profile` | Create or update health profile |

### Health Vitals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/vitals?metric_type=heart_rate&from=2026-01-01&to=2026-04-13` | Query vitals by type and date range |
| GET | `/api/health/vitals/latest` | Get latest value for each metric type |
| POST | `/api/health/vitals` | Insert one or more vital readings (manual entry) |
| POST | `/api/health/vitals/import` | Bulk import from Apple Health XML or CSV |

### Medical Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/documents` | List all documents (with filters: type, date range) |
| GET | `/api/health/documents/:id` | Get document details + extractions |
| POST | `/api/health/documents/upload` | Upload file to storage, create DB record, return `file_url` |
| POST | `/api/health/documents/:id/analyze` | Trigger AI analysis on a document |
| DELETE | `/api/health/documents/:id` | Delete document (removes file from storage + DB records) |

### Lab Results
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/labs?biomarker_key=hba1c&from=2025-01-01` | Query lab results by biomarker and date |
| GET | `/api/health/labs/flagged` | Get all flagged/out-of-range results |
| GET | `/api/health/labs/panels` | Get latest results grouped by panel |
| POST | `/api/health/labs` | Manually add a lab result |

### Medications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/medications?active=true` | List medications (filter active/inactive) |
| POST | `/api/health/medications` | Add medication |
| PUT | `/api/health/medications/:id` | Update medication |
| DELETE | `/api/health/medications/:id` | Remove medication |
| POST | `/api/health/medications/:id/log` | Log medication taken/skipped for a date |
| GET | `/api/health/medications/:id/adherence?from=2026-01-01` | Get adherence history |

### Daily Log
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/daily-log?from=2026-04-01&to=2026-04-13` | Get daily logs for date range |
| PUT | `/api/health/daily-log/:date` | Create or update daily log for a date |

### Health Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/goals?status=active` | List goals |
| POST | `/api/health/goals` | Create a goal |
| PUT | `/api/health/goals/:id` | Update a goal |
| DELETE | `/api/health/goals/:id` | Delete a goal |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/chat/sessions` | List chat sessions |
| GET | `/api/health/chat/sessions/:session_id` | Get messages for a session |
| POST | `/api/health/chat` | Send a message, get AI response |

### Import Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/imports` | List import history |
| POST | `/api/health/imports/apple-health` | Upload and process Apple Health XML |

---

## File Upload Flow (for API developers)

```
1. Client uploads file via POST /api/health/documents/upload
   - Body: multipart/form-data with file + metadata (title, document_type, document_date)

2. Server:
   a. Validates file type (PDF, JPG, PNG, HEIC, DOC, DOCX)
   b. Uploads file to cloud storage at path: {user_id}/{year}/{timestamp}-{filename}
   c. Generates the access URL (signed URL or permanent path)
   d. If image: generates a thumbnail, uploads it, stores thumbnail_url
   e. Inserts row into health_documents with file_url and thumbnail_url
   f. Returns the created document record (including file_url)

3. Client can now display the file using the file_url from the DB query
   - Images: <img src="{file_url}">
   - PDFs: embedded viewer or <iframe src="{file_url}">

4. Optionally: Client calls POST /api/health/documents/:id/analyze
   - Server sends file content to AI model for extraction
   - Results stored in health_document_extractions
   - Lab values auto-seeded into health_lab_results
```

---

## Notes for Database Team

1. **UUID generation**: Use `gen_random_uuid()` (PostgreSQL) or equivalent for auto-generating primary keys
2. **Timestamps**: Store all timestamps in UTC. Let the frontend handle timezone conversion
3. **JSON columns**: Use native JSON/JSONB type (PostgreSQL JSONB recommended for indexing). If using MySQL, use JSON type
4. **Soft deletes**: Not implemented in this schema. If needed, add `deleted_at TIMESTAMP NULL` to tables
5. **Pagination**: All list endpoints should support `limit` and `offset` (or cursor-based pagination for high-volume tables like `health_vitals`)
6. **File size limits**: Recommend 50MB max per document upload
7. **Data retention**: `health_vitals` can grow very large (100k+ rows per user per year from Apple Watch). Consider partitioning by `user_id` and `recorded_at` if needed
8. **Deduplication**: For vitals imports, use `(user_id, metric_type, source, recorded_at)` as a unique constraint to prevent duplicate entries on re-import
