# ARIMA Forecasting — Modul Pembelajaran & Aplikasi Interaktif

Aplikasi web lengkap untuk mempelajari dan menerapkan metode **ARIMA** dan **SARIMA** dalam memprediksi utilisasi sumber daya komputasi (CPU, Memory, Disk). Terdiri dari dua bagian utama: **modul teori interaktif** dan **aplikasi forecasting berbasis upload CSV**.

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

Aplikasi ini dibangun sebagai sarana pembelajaran dan eksplorasi metode *time series forecasting* dengan konteks nyata: memprediksi utilisasi infrastruktur TI. Pengguna dapat membaca modul teori yang komprehensif, kemudian langsung mencoba forecasting dengan data CSV mereka sendiri tanpa perlu menulis kode.

**Alur penggunaan:**

```
Upload CSV → Pilih Metrik → Tentukan Periode → Proses → Lihat Grafik & Metrik Evaluasi → Ekspor Hasil
```

---

## Fitur

### Modul Pembelajaran

| BAB | Topik |
|-----|-------|
| BAB I | Pendahuluan — latar belakang dan tujuan penelitian |
| BAB II | Landasan Teori — Time Series, ARIMA, SARIMA, ADF Test, Auto ARIMA, Metrik Evaluasi, Docker |
| BAB III | Metodologi — tahapan penelitian dan alur kerja |
| BAB IV | Implementasi — detail teknis sistem |
| BAB V | Kesimpulan dan rekomendasi |

### Aplikasi Forecasting

- **Upload CSV** dengan drag-and-drop
- **Pilih metrik**: CPU, Memory, atau Storage
- **Periode prediksi**: 1–5 tahun ke depan
- **Auto ARIMA/SARIMA**: parameter dipilih otomatis menggunakan `pmdarima`
- **Grafik interaktif**: data historis + hasil prediksi + confidence interval 95%
- **Diagnostik model**: order `(p,d,q)`, seasonal order `(P,D,Q,m)`, AIC, BIC, ADF Test
- **Evaluasi performa**: MAPE, RMSE, MAE pada data uji (20% terakhir)
- **Ekspor CSV**: unduh hasil forecast beserta batas interval

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    Browser / User                   │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP (port 3000)
┌─────────────────────▼───────────────────────────────┐
│              Frontend (Next.js 15)                  │
│  - Halaman Modul (SSR/CSR)                          │
│  - Aplikasi Forecasting (CSR)                       │
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
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Layout root (Navbar)
│   │   │   ├── page.tsx             # Halaman beranda
│   │   │   ├── globals.css          # CSS global & kelas prose-custom
│   │   │   ├── aplikasi/
│   │   │   │   ├── page.tsx         # Halaman aplikasi forecasting
│   │   │   │   └── components/
│   │   │   │       └── ForecastChart.tsx  # Komponen grafik Recharts
│   │   │   └── modul/
│   │   │       ├── layout.tsx       # Layout sidebar modul
│   │   │       ├── page.tsx         # Gambaran umum modul
│   │   │       ├── pendahuluan/     # BAB I
│   │   │       ├── landasan-teori/  # BAB II
│   │   │       ├── metodologi/      # BAB III
│   │   │       ├── implementasi/    # BAB IV
│   │   │       └── kesimpulan/      # BAB V
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── Navbar.tsx       # Navigasi atas
│   │   └── lib/
│   │       └── api.ts               # Fungsi HTTP client ke backend
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
│   │       └── schemas.py           # Pydantic request/response schemas
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml               # Orkestrasi multi-container
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
| Docker    | >= 24        |
| Docker Compose | >= 2.20 |

---

## Instalasi & Menjalankan

### Mode Development (Lokal)

#### 1. Clone atau masuk ke direktori proyek

```bash
cd arima-forecasting-app
```

#### 2. Jalankan Backend

```bash
cd backend

# Buat virtual environment
python -m venv .venv

# Aktifkan virtual environment
source .venv/bin/activate          # macOS / Linux
# .venv\Scripts\activate           # Windows

# Install dependensi Python
pip install -r requirements.txt

# Jalankan server backend
uvicorn app.main:app --reload --port 8000
```

Backend akan berjalan di: `http://localhost:8000`  
Dokumentasi API interaktif (Swagger): `http://localhost:8000/docs`

#### 3. Jalankan Frontend (terminal baru)

```bash
cd frontend

# Install dependensi Node.js
npm install

# Jalankan development server
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

> **Catatan:** Frontend secara default mengarah ke backend di `http://localhost:8000`. Jika port backend berbeda, ubah variabel `NEXT_PUBLIC_API_URL` (lihat bagian [Konfigurasi](#konfigurasi)).

---

### Mode Production (Docker)

Cara paling mudah untuk menjalankan seluruh sistem sekaligus:

```bash
# Dari root direktori proyek
docker compose up --build
```

Perintah ini akan:
1. Build image Docker untuk backend (Python/FastAPI)
2. Build image Docker untuk frontend (Next.js)
3. Menjalankan kedua container secara bersamaan

Setelah berhasil:

| Layanan | URL |
|---------|-----|
| Frontend (Aplikasi Web) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |

Untuk menghentikan semua container:

```bash
docker compose down
```

Untuk menjalankan di background (tanpa menampilkan log):

```bash
docker compose up --build -d
```

Untuk melihat log setelah berjalan di background:

```bash
docker compose logs -f
```

---

## Format Data CSV

File CSV yang diunggah harus memiliki format berikut:

| Kolom     | Tipe       | Deskripsi                                  | Contoh         |
|-----------|------------|--------------------------------------------|----------------|
| `Tanggal` | Date       | Tanggal observasi (format: `DD/MM/YYYY` atau `YYYY-MM-DD`) | `01/01/2022`   |
| `CPU`     | Float (%)  | Persentase penggunaan CPU                  | `72.5`         |
| `Memory`  | Float (%)  | Persentase penggunaan memori               | `68.3`         |
| `Storage` | Float      | Penggunaan disk (GB atau TB, konsisten)    | `1.24`         |

**Contoh isi file CSV:**

```csv
Tanggal,CPU,Memory,Storage
01/01/2022,65.2,58.1,1.10
01/02/2022,68.7,61.3,1.15
01/03/2022,70.1,63.0,1.21
01/04/2022,72.5,64.8,1.24
...
```

**Ketentuan data:**
- Minimal **6 baris data** agar model dapat dilatih
- Untuk mengaktifkan model **SARIMA** (musiman), dibutuhkan minimal **24 baris** (2 tahun data bulanan)
- Data akan diurutkan otomatis berdasarkan kolom `Tanggal`
- Nilai kosong (`NaN`) pada metrik yang dipilih akan dihapus secara otomatis

---

## Cara Menggunakan Aplikasi

1. **Buka halaman Aplikasi** melalui menu navigasi atas atau tombol "Coba Aplikasi" di beranda.

2. **Unggah file CSV**: seret file ke area upload atau klik untuk memilih file dari komputer.

3. **Pilih Metrik**: klik salah satu dari tiga tombol — CPU, Memory, atau Storage — sesuai data yang ingin di-forecast.

4. **Tentukan Periode Prediksi**: geser slider untuk memilih horizon prediksi antara 1 hingga 5 tahun.

5. **Klik "Proses Forecast"**: sistem akan:
   - Melakukan uji stasioneritas (ADF Test)
   - Mencari parameter ARIMA/SARIMA terbaik secara otomatis
   - Menghitung prediksi beserta confidence interval 95%
   - Mengevaluasi akurasi pada 20% data terakhir (test set)

6. **Analisis hasil**:
   - **Grafik**: garis biru = data historis, garis ungu = prediksi, area biru muda = interval kepercayaan
   - **Diagnostik Model**: order `(p,d,q)` yang dipilih, AIC/BIC, dan status stasioneritas data
   - **Evaluasi**: nilai MAPE (akurasi utama), RMSE, dan MAE

7. **Ekspor CSV**: klik tombol "Ekspor CSV" untuk mengunduh tabel hasil forecast.

---

## API Reference

### `POST /api/forecast`

Endpoint utama untuk menjalankan forecasting.

**Request** (multipart/form-data):

| Field           | Tipe    | Wajib | Deskripsi                                      |
|-----------------|---------|-------|------------------------------------------------|
| `file`          | File    | Ya    | File CSV dengan kolom Tanggal, CPU/Memory/Storage |
| `metric`        | String  | Ya    | Salah satu dari: `CPU`, `Memory`, `Storage`    |
| `forecast_years`| Integer | Ya    | Jumlah tahun prediksi (1–5)                    |

**Response** (JSON):

```json
{
  "historical": [
    { "date": "2022-01-01", "value": 65.2, "lower_ci": null, "upper_ci": null }
  ],
  "forecast": [
    { "date": "2024-01-01", "value": 75.4, "lower_ci": 70.1, "upper_ci": 80.7 }
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
| `400`  | File bukan CSV, kolom tidak ditemukan, data terlalu sedikit (< 6 baris), nilai `metric` atau `forecast_years` tidak valid |
| `500`  | Kegagalan internal saat menjalankan model ARIMA |

---

### `GET /api/health`

Cek status backend.

**Response:**

```json
{ "status": "healthy" }
```

---

## Konfigurasi

### Variabel Environment Frontend

| Variabel              | Default                  | Deskripsi                             |
|-----------------------|--------------------------|---------------------------------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000`  | URL base backend API                  |

Untuk development lokal, buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Untuk Docker, nilai ini sudah dikonfigurasi di `docker-compose.yml`:

```yaml
args:
  NEXT_PUBLIC_API_URL: http://localhost:8000
```

### Variabel Environment Backend

| Variabel          | Default | Deskripsi                            |
|-------------------|---------|--------------------------------------|
| `PYTHONUNBUFFERED`| `1`     | Nonaktifkan buffering log Python     |

---

## Teknologi

### Frontend

| Library | Versi | Fungsi |
|---------|-------|--------|
| [Next.js](https://nextjs.org) | 15 | Framework React dengan App Router |
| [React](https://react.dev) | 19 | UI library |
| [TypeScript](https://typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling utility-first |
| [Recharts](https://recharts.org) | 2 | Grafik interaktif |
| [KaTeX](https://katex.org) | - | Render rumus matematika LaTeX |
| [react-katex](https://github.com/talyssonoc/react-katex) | - | Komponen React untuk KaTeX |
| [react-dropzone](https://react-dropzone.js.org) | - | Upload file drag-and-drop |
| [papaparse](https://www.papaparse.com) | - | Parse/export CSV di browser |
| [lucide-react](https://lucide.dev) | - | Ikon SVG |

### Backend

| Library | Versi | Fungsi |
|---------|-------|--------|
| [FastAPI](https://fastapi.tiangolo.com) | 0.115+ | Framework API async |
| [Python](https://python.org) | 3.11+ | Runtime |
| [pandas](https://pandas.pydata.org) | - | Manipulasi data & time series |
| [numpy](https://numpy.org) | - | Komputasi numerik |
| [statsmodels](https://statsmodels.org) | - | Uji statistik (ADF Test) |
| [pmdarima](https://alkaline-ml.com/pmdarima) | - | Auto ARIMA / SARIMA |
| [uvicorn](https://uvicorn.org) | - | ASGI web server |
| [pydantic](https://docs.pydantic.dev) | v2 | Validasi data & schemas |

### Infrastruktur

| Alat | Fungsi |
|------|--------|
| [Docker](https://docker.com) | Containerization |
| [Docker Compose](https://docs.docker.com/compose) | Orkestrasi multi-container |

---

## Troubleshooting

### Frontend tidak bisa terhubung ke backend

**Gejala:** Error "Failed to fetch" atau "Network Error" saat klik "Proses Forecast"

**Solusi:**
1. Pastikan backend sudah berjalan: buka `http://localhost:8000/api/health` di browser — harus mengembalikan `{"status":"healthy"}`
2. Periksa variabel `NEXT_PUBLIC_API_URL` di `frontend/.env.local` sudah mengarah ke URL backend yang benar
3. Jika menggunakan Docker, pastikan kedua container sudah running: `docker compose ps`

---

### Error "Time series must have at least 6 data points"

**Penyebab:** Data CSV terlalu sedikit atau banyak nilai kosong pada kolom yang dipilih.

**Solusi:** Pastikan CSV memiliki minimal 6 baris data yang valid (tidak kosong) pada kolom metrik yang dipilih.

---

### SARIMA tidak aktif, hanya ARIMA biasa

**Penyebab:** Data kurang dari 24 baris (kurang dari 2 tahun data bulanan).

**Penjelasan:** SARIMA membutuhkan setidaknya 2 siklus musiman penuh untuk mendeteksi pola. Dengan data < 24 bulan, sistem otomatis fallback ke ARIMA non-musiman.

---

### Build Docker gagal (timeout saat install Python packages)

**Penyebab:** Package seperti `statsmodels` dan `pmdarima` cukup besar.

**Solusi:**
```bash
# Tambahkan timeout yang lebih lama
DOCKER_BUILDKIT=1 docker compose build --progress=plain
```

---

### Port sudah digunakan

**Gejala:** Error `address already in use` saat menjalankan Docker atau server lokal.

**Solusi:**
```bash
# Cek proses yang menggunakan port 3000 atau 8000
lsof -i :3000
lsof -i :8000

# Hentikan proses tersebut, atau ubah port di docker-compose.yml
```
