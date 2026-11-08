# CRI Recon

Web reconnaissance tool. Subdomain discovery, HTTP probing, directory enumeration, WAF detection, security header analysis — dari satu halaman.

Untuk pembelajaran OSINT. Milik meronga.web.id.

---

## Apa ini

CRI Recon itu tools yang gabungin beberapa teknik recon dasar jadi satu halaman web. Target masukin, fitur dipilih, klik "Jalankan Recon", hasilnya keluar.

Bentuknya web app pakai Next.js 14. UI-nya glassmorphism — transparan, blur, ada efek shining. Deploy ke Vercel juga langsung bisa.

## Fitur

- **Subdomain Enumeration** —ambil data dari Certificate Transparency logs (crt.sh API). Data real, bukan fiktif.
- **HTTP Probe** —request ke http/https target, dapat status code, title page, server header, content-type.
- **Directory Bruteforce** —wordlist common path, cek response 200/301/302.
- **WAF & Tech Detect** —baca header untuk deteksi WAF (Cloudflare, Sucuri, dll), server, tech stack.
- **Security Check** —audit security header: X-Frame-Options, CSP, HSTS, X-XSS-Protection, X-Content-Type-Options, dll.

## Cara Pakai

### Development lokal

```bash
cd meronga-recon
npm install
npm run dev
```

Buka `http://localhost:3000`.

### Build & production

```bash
npm run build
npm start
```

### Deploy ke Vercel

1. Push ke GitHub (lihat bagian Git di bawah).
2. Buka [vercel.com](https://vercel.com) — login / buat akun gratis.
3. Klik "Add New Project" → connect repo GitHub.
4. Vercel auto-deteksi Next.js. Setting default, klik "Deploy".
5. Selesai — dapat URL `*.vercel.app`.

Gak perlu API key atau config khusus. Tools ini pakai API publik (crt.sh) dan HTTP request biasa.

## Contoh Hasil

### Subdomain

Dari crt.sh, dapat daftar subdomain yang pernah terdaftar di certificate transparency.

```
sub1.example.com
sub2.example.com
api.example.com
www.example.com
```

### HTTP Probe

- `https://example.com` → 200, title "Example Domain", server "nginx"
- `https://www.example.com` → 200, title sama

### Directory Bruteforce

Dari wordlist 200+ path, cek yang merespons. Hasilnya list path yang ada.

### WAF Detect

Baca header server, x-powered-by, dll. Kalau ada Cloudflare, Sucuri, Incapsula — detect.

### Security Check

Cek hilangnya header keamanan: CSP, X-Frame-Options, HSTS, dll. Keluarkan finding dengan level high/medium/low.

## Struktur Proyek

```
meronga-recon/
├── src/
│   ├── app/
│   │   ├── page.tsx          # halaman utama
│   │   ├── layout.tsx        # layout + watermark
│   │   ├── globals.css       # glassmorphism styles
│   │   └── api/
│   │       └── recon/
│   │           └── route.ts  # recon engine (API route)
│   └── components/
│       ├── Header.tsx
│       ├── ReconForm.tsx
│       ├── Results.tsx
│       ├── Footer.tsx
│       └── Watermark.tsx
├── public/
│   └── favicon.svg
├── package.json
├── next.config.js
├── tsconfig.json
├── .gitignore
└── README.md
```

## Catatan

- **Results ephemeral** — hasil recon tidak disimpan. Setelah halaman di-refresh, hasil hilang.
- **Public, no auth** — untuk belajar. Tidak ada login.
- **Rate limit** — karena pakai crt.sh API dan HTTP request ke target, kalau terlalu banyak request dalam waktu singkat bisa terblock. Threads diatur sesuai.
- **Port scan tidak included** — port scanning butuh akses network level yang nggak tersedia di Vercel serverless. Tools ini fokus application-layer recon.

## Lisensi & Attribution

- Project name: **CRI Recon**
- Domain: **meronga.web.id**
- Untuk pembelajaran OSINT.
- Watermark `meronga.web.id` tertulis di halaman.

## Development Notes

Rekon engine ada di `src/app/api/recon/route.ts`. Bisa di-edit atau di-extend dengan teknik recon lain.

UI di `src/app/globals.css` — tinggal ganti warna/theme di `:root` CSS variables.

Glassmorphism effect pakai `backdrop-filter: blur()` dengan semi-transparent backgrounds.

---

Built with Next.js 14. Deployed on Vercel.
