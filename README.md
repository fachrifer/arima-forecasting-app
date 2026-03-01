# ARIMA Forecasting — Modul Pembelajaran & Aplikasi Interaktif

Aplikasi web untuk memprediksi utilisasi sumber daya komputasi (CPU, Memory, Storage) menggunakan model **ARIMA** dan **SARIMA**. Tersedia dalam dua varian: **aplikasi saja** dan **aplikasi + modul pembelajaran interaktif**.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur](#fitur)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Instalasi & Menjalankan](#instalasi--menjalankan)
  - [Mode Development (Lokal)](#mode-development-lokal)
  - [Mode Production (Docker)](#mode-production-docker)
- [Format Data CSV](#format-data-csv)
- [Cara Menggunakan Aplikasi](#cara-menggunakan-aplikasi)
- [API Reference](#api-reference)
- [Konfigurasi](#konfigurasi)
- [Teknologi](#teknologi)
- [Troubleshooting](#troubleshooting)

---

## Gambaran Umum

Aplikasi ini dibangun sebagai sarana pembelajaran dan eksplorasi metode *time series forecasting* dengan konteks nyata: memprediksi utilisasi infrastruktur TI. Pengguna dapat membaca modul teori yang komprehensif (varian full), kemudian langsung mencoba forecasting dengan data CSV mereka sendiri tanpa perlu menulis kode.

**Alur penggunaan:**

```
Upload CSV → Pilih Metrik → Tentukan Periode → Proses → Lihat Dashboard Hasil → Ekspor
```

---

## Fitur

### Modul Pembelajaran *(hanya varian full)*

| BAB | Topik |
|-----|-------|
| BAB I | Pendahuluan — latar belakang dan tujuan penelitian |
| BAB II | Landasan Teori — Time Series, ARIMA, SARIMA, ADF Test, Auto ARIMA, Metrik Evaluasi |
| BAB III | Metodologi — tahapan penelitian dan alur kerja |
| BAB IV | Implementasi — detail teknis sistem |
| BAB V | Kesimpulan dan rekomendasi |

### Aplikasi Forecasting

- **Upload CSV** dengan drag-and-drop
- **Multi-metrik**: pilih CPU, Memory, dan/atau Storage — diproses paralel
- **Periode prediksi**: 1–60 bulan via slider + input angka, dengan indikator akurasi
- **Auto ARIMA/SARIMA**: parameter dipilih otomatis menggunakan `pmdarima`
- **Dashboard interaktif**: KPI strip, grafik dengan CI 95%, panel diagnostik
- **Penjelasan lompatan forecast**: notifikasi otomatis jika ada deviasi signifikan di awal forecast
- **Diagnostik model**: order `(p,d,q)`, seasonal order `(P,D,Q,m)`, AIC, BIC, ADF Test
- **Evaluasi performa**: MAPE, RMSE, MAE — dengan penjelasan jika metrik kosong
- **Ekspor CSV**: unduh tabel hasil forecast beserta batas interval
- **Ekspor PDF**: laporan lengkap beserta grafik forecast tertanam
- **Dark mode**: toggle terang/gelap, tersimpan di `localStorage`

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Browser / User                   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (port 3000)
┌─────────────────────▼───────────────────────────────┐
│              Frontend (Next.js)                     │
│  - Aplikasi Forecasting Dashboard (CSR)             │
│  - Halaman Modul (SSR) — varian full saja           │
│  - Komponen Chart (Recharts)                        │
│  - Render rumus matematika (KaTeX)                  │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (port 8000)
┌─────────────────────▼───────────────────────────────┐
│              Backend (FastAPI)                      │
│  POST /api/forecast                                 │
│  - Parsing & validasi CSV (pandas)                  │
│  - Auto ARIMA/SARIMA (pmdarima)                     │
│  - Uji stasioneritas ADF (statsmodels)              │
│  - Kalkulasi MAPE, RMSE, MAE                        │
│  GET  /api/health                                   │
└─────────────────────────────────────────────────────┘
```

---

## Struktur Proyek

```
arima-forecasting-app/
├── frontend/                        # Aplikasi Next.js
│   ├── public/                      # Aset statis publik
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Layout root + ThemeProvider
│   │   │   ├── page.tsx             # Halaman beranda (varian full)
│   │   │   ├── globals.css          # CSS global & kelas prose-custom
│   │   │   ├── aplikasi/
│   │   │   │   ├── page.tsx         # Dashboard forecasting
│   │   │   │   └── components/
│   │   │   │       └── ForecastChart.tsx
│   │   │   └── modul/               # Modul pembelajaran (varian full)
│   │   │       ├── layout.tsx
│   │   │       ├── page.tsx
│   │   │       ├── pendahuluan/
│   │   │       ├── landasan-teori/
│   │   │       ├── metodologi/
│   │   │       ├── implementasi/
│   │   │       └── kesimpulan/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx       # Navigasi atas + dark mode toggle
│   │   │       └── ThemeProvider.tsx
│   │   ├── middleware.ts            # Route guard (app-only vs full)
│   │   └── lib/
│   │       └── api.ts               # HTTP client ke backend
│   ├── Dockerfile                   # Multi-stage build
│   ├── next.config.ts
│   ├── postcss.config.mjs
│   └── package.json
│
├── backend/                         # API FastAPI
│   ├── app/
│   │   ├── main.py                  # Entry point, CORS middleware
│   │   ├── routers/
│   │   │   └── forecast.py          # Endpoint POST /api/forecast
│   │   ├── services/
│   │   │   ├── arima_engine.py      # Logika Auto ARIMA & forecasting
│   │   │   └── evaluation.py        # Fungsi MAPE, RMSE, MAE
│   │   └── models/
│   │       └── schemas.py           # Pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml               # Varian app-only
├── docker-compose.full.yml          # Varian full (+ modul)
├── data_dummy.csv                   # Contoh data CSV untuk pengujian
└── README.md
```

---

## Prasyarat

### Untuk Development Lokal

| Kebutuhan | Versi Minimum |
|-----------|--------------|
| Node.js   | >= 20        |
| npm       | >= 10        |
| Python    | >= 3.11      |

### Untuk Docker

| Kebutuhan | Versi Minimum |
|-----------|--------------|
| Docker Desktop | >= 4.0 (includes Compose v2) |

> **Windows:** Pastikan **Docker Desktop sudah berjalan** (ikon paus di system tray aktif) sebelum menjalankan perintah `docker compose`. Docker Desktop menggunakan backend WSL 2 — jika baru diinstall, restart komputer terlebih dahulu.

---

## Instalasi & Menjalankan

### Mode Development (Lokal)

#### 1. Clone repositori

```bash
git clone https://github.com/fachrifer/arima-forecasting-app.git
cd arima-forecasting-app
```

#### 2. Jalankan Backend

```bash
cd backend
```

**macOS / Linux:**
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend berjalan di: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`

#### 3. Jalankan Frontend *(terminal baru)*

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: `http://localhost:3000`

> **Catatan:** Pada mode development, **semua halaman** (termasuk `/modul`) selalu tampil karena `NEXT_PUBLIC_INCLUDE_MODUL` belum di-set. Perilaku dua varian hanya aktif saat build Docker.

---

### Mode Production (Docker)

Tersedia **dua varian image** frontend yang dikontrol lewat build arg `NEXT_PUBLIC_INCLUDE_MODUL`:

| Varian | File Compose | Halaman tersedia | Perilaku `/` |
|--------|-------------|-----------------|-------------|
| **App-only** | `docker-compose.yml` | `/aplikasi` saja | Langsung buka Aplikasi |
| **Full** | `docker-compose.full.yml` | `/aplikasi` + `/modul/*` | Buka Beranda |

#### Langkah-langkah

**1. Pastikan Docker Desktop berjalan**

Buka Docker Desktop dan tunggu hingga status menunjukkan *"Docker Desktop is running"* (ikon paus berhenti beranimasi di system tray).

Verifikasi:
```bash
docker info
```
Jika tidak ada error, Docker siap digunakan.

**2. Clone repositori** *(jika belum)*

```bash
git clone https://github.com/fachrifer/arima-forecasting-app.git
cd arima-forecasting-app
```

**3a. Build & jalankan — Image App-only** *(tanpa modul)*

```bash
docker compose up --build
```

**3b. Build & jalankan — Image Full** *(dengan modul pembelajaran)*

```bash
docker compose -f docker-compose.full.yml up --build
```

> Build pertama membutuhkan waktu sekitar **5–15 menit** karena mengunduh base image dan mengkompilasi dependensi Python (`statsmodels`, `pmdarima`). Build selanjutnya jauh lebih cepat karena cache layer.

**4. Akses aplikasi**

| Layanan | URL |
|---------|-----|
| Aplikasi Web | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |

**5. Hentikan container**

```bash
# App-only:
docker compose down

# Full:
docker compose -f docker-compose.full.yml down
```

**Jalankan di background** *(tanpa log di terminal)*:

```bash
docker compose up --build -d
docker compose -f docker-compose.full.yml up --build -d

# Lihat log:
docker compose logs -f
```

---

## Format Data CSV

File CSV yang diunggah harus memiliki format berikut:

| Kolom | Tipe | Deskripsi | Contoh |
|-------|------|-----------|--------|
| `Tanggal` | Date | Tanggal observasi (`DD/MM/YYYY` atau `YYYY-MM-DD`) | `01/01/2022` |
| `CPU` | Float (%) | Persentase penggunaan CPU | `72.5` |
| `Memory` | Float (GB/TB) | Penggunaan memori | `128.5` |
| `Storage` | Float (GB/TB) | Penggunaan disk | `820.3` |

**Contoh isi file CSV:**

```csv
Tanggal,CPU,Memory,Storage
01/01/2022,65.2,128.1,820.1
01/02/2022,68.7,131.3,825.5
01/03/2022,70.1,133.0,831.2
01/04/2022,72.5,134.8,838.4
```

**Ketentuan:**
- Minimal **kolom `Tanggal` + satu kolom metrik**
- Minimal **6 baris data** agar model dapat dilatih
- Minimal **24 baris** untuk mengaktifkan SARIMA (pola musiman)
- Data diurutkan otomatis berdasarkan `Tanggal`
- Nilai kosong (`NaN`) dihapus otomatis

File `data_dummy.csv` di root repositori dapat digunakan untuk pengujian awal.

---

## Cara Menggunakan Aplikasi

1. **Buka** `http://localhost:3000` — pada image app-only, langsung masuk ke halaman Aplikasi.

2. **Unggah file CSV**: seret file ke area upload atau klik untuk memilih. Klik accordion "Format CSV yang diperlukan" untuk melihat struktur yang diharapkan.

3. **Pilih Metrik**: klik satu atau lebih dari CPU / Memory / Storage. Setiap metrik diproses secara paralel.

4. **Tentukan Periode Prediksi**: geser slider atau ketik angka (1–60 bulan). Indikator warna menunjukkan tingkat akurasi:
   - 🟢 Hijau: ≤ 12 bulan (akurasi tinggi)
   - 🟡 Kuning: ≤ 24 bulan (akurasi sedang)
   - 🔴 Merah: > 24 bulan (akurasi rendah)

5. **Klik "Jalankan Forecast"**: sistem akan menjalankan ADF Test → Auto ARIMA/SARIMA → Evaluasi → mengembalikan hasil.

6. **Analisis Dashboard**:
   - **KPI Strip**: ringkasan nilai historis terakhir, forecast pertama/terakhir, delta, dan MAPE
   - **Grafik**: garis abu = historis, garis putus-putus berwarna = forecast, area transparan = CI 95%
   - **Panel Diagnostik**: order model, AIC/BIC, status stasioneritas
   - **Evaluasi**: MAPE (kualitas forecast), RMSE, MAE

7. **Ekspor hasil**:
   - **CSV**: klik "Ekspor CSV" di bagian Tabel Data Forecast
   - **PDF**: klik "PDF" di header dashboard metrik

---

## API Reference

### `POST /api/forecast`

Menjalankan forecasting untuk satu metrik.

**Request** (`multipart/form-data`):

| Field | Tipe | Wajib | Deskripsi |
|-------|------|-------|-----------|
| `file` | File | Ya | File CSV |
| `metric` | String | Ya | `CPU`, `Memory`, atau `Storage` |
| `forecast_months` | Integer | Ya | Jumlah bulan prediksi (1–60) |

**Response** (`application/json`):

```json
{
  "historical": [
    { "date": "2022-01-01", "value": 65.2, "lower_ci": null, "upper_ci": null }
  ],
  "forecast": [
    { "date": "2025-01-01", "value": 75.4, "lower_ci": 70.1, "upper_ci": 80.7 }
  ],
  "diagnostics": {
    "order": [1, 1, 1],
    "seasonal_order": [1, 0, 1, 12],
    "aic": 234.56,
    "bic": 248.90,
    "adf_statistic": -3.821,
    "adf_pvalue": 0.0023,
    "is_stationary": true
  },
  "metrics": {
    "mape": 4.32,
    "rmse": 2.15,
    "mae": 1.87
  },
  "model_summary": "SARIMAX Results ..."
}
```

**Error Responses:**

| Status | Penyebab |
|--------|----------|
| `400` | Bukan CSV, kolom tidak ditemukan, data < 6 baris, nilai parameter tidak valid |
| `500` | Kegagalan internal saat menjalankan model |

---

### `GET /api/health`

Cek status backend.

```json
{ "status": "healthy" }
```

---

## Konfigurasi

### Variabel Build Frontend

| Variabel | Default | Deskripsi |
|----------|---------|-----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL backend yang dipanggil browser |
| `NEXT_PUBLIC_INCLUDE_MODUL` | `false` | `true` = aktifkan halaman modul |

Untuk **development lokal** (opsional), buat `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_INCLUDE_MODUL=true
```

Untuk **Docker**, kedua variabel sudah dikonfigurasi di masing-masing file compose.

> **Deploy ke server remote:** Ubah `NEXT_PUBLIC_API_URL` di `docker-compose.yml` / `docker-compose.full.yml` menjadi IP atau domain server:
> ```yaml
> NEXT_PUBLIC_API_URL: http://192.168.1.100:8000
> ```

### Variabel Environment Backend

| Variabel | Default | Deskripsi |
|----------|---------|-----------|
| `PYTHONUNBUFFERED` | `1` | Nonaktifkan buffering log Python |

---

## Teknologi

### Frontend

| Library | Fungsi |
|---------|--------|
| Next.js 16 | Framework React, App Router, standalone build |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling utility-first |
| Recharts | Grafik interaktif (ComposedChart) |
| KaTeX + react-katex | Render rumus matematika LaTeX |
| react-dropzone | Upload file drag-and-drop |
| papaparse | Parse & export CSV di browser |
| jspdf + html2canvas | Export laporan PDF dengan gambar chart |
| lucide-react | Ikon SVG |
| react-syntax-highlighter | Highlight kode di modul |

### Backend

| Library | Fungsi |
|---------|--------|
| FastAPI | Framework API async |
| Python 3.11+ | Runtime |
| pandas | Manipulasi data time series |
| numpy | Komputasi numerik |
| statsmodels | Uji ADF (stasioneritas) |
| pmdarima | Auto ARIMA / SARIMA |
| uvicorn | ASGI web server |
| pydantic v2 | Validasi data & schemas |

### Infrastruktur

| Alat | Fungsi |
|------|--------|
| Docker | Containerization |
| Docker Compose v2 | Orkestrasi multi-container |

---

## Troubleshooting

### Docker Desktop tidak berjalan (Windows)

**Gejala:** `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified`

**Solusi:**
1. Buka **Docker Desktop** dari Start Menu
2. Tunggu hingga ikon paus di system tray berhenti beranimasi
3. Jalankan `docker info` untuk verifikasi
4. Jika masih error: klik kanan ikon Docker → **Restart**
5. Jika WSL 2 perlu update: ikuti petunjuk yang muncul di Docker Desktop

---

### Frontend tidak bisa terhubung ke backend

**Gejala:** Error "Failed to fetch" saat klik "Jalankan Forecast"

**Solusi:**
1. Cek backend: buka `http://localhost:8000/api/health` → harus mengembalikan `{"status":"healthy"}`
2. Pastikan kedua container jalan: `docker compose ps`
3. Periksa `NEXT_PUBLIC_API_URL` sudah mengarah ke URL backend yang benar

---

### Error "Time series must have at least 6 data points"

**Penyebab:** CSV terlalu sedikit data atau banyak nilai kosong.

**Solusi:** Pastikan ada minimal 6 baris valid pada kolom metrik yang dipilih. Gunakan `data_dummy.csv` sebagai referensi format.

---

### Metrik evaluasi (MAPE/RMSE/MAE) kosong

**Penyebab:** Evaluasi menggunakan *train/test split* (80%/20%). Jika model gagal pada subset train (data tidak cukup atau tidak stasioner), metrik tidak dapat dihitung.

**Solusi:** Tambahkan lebih banyak data historis. Minimal 24 baris untuk hasil yang optimal.

---

### SARIMA tidak aktif, hanya ARIMA biasa

**Penyebab:** Data kurang dari 24 baris.

**Penjelasan:** SARIMA membutuhkan setidaknya 2 siklus musiman penuh. Sistem otomatis *fallback* ke ARIMA non-musiman jika data < 24 bulan.

---

### Build Docker lambat / timeout saat install Python packages

**Penyebab:** `statsmodels` dan `pmdarima` cukup besar dan perlu dikompilasi.

**Solusi:**
```bash
# Tampilkan progress detail untuk monitoring
docker compose build --progress=plain

# Jika timeout, coba ulang — layer sudah ter-cache sebagian
docker compose up --build
```

---

### Port sudah digunakan

**Gejala:** `address already in use` saat menjalankan Docker atau server lokal.

**Solusi (macOS/Linux):**
```bash
lsof -i :3000
lsof -i :8000
```

**Solusi (Windows PowerShell):**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
# Catat PID, lalu:
taskkill /PID <pid> /F
```

Atau ubah port di `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"   # akses via localhost:3001
```
