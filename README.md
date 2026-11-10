# DonaChain Frontend

React + JSX + Vite frontend untuk API Laravel DonaChain.

## Menjalankan
```bash
npm install
npm run dev
```
Buat `.env` dari `.env.example`, lalu sesuaikan `VITE_API_BASE_URL` bila backend tidak berjalan di `http://127.0.0.1:8000/api`.
Buka URL Vite, biasanya `http://localhost:5173`.

## Routing
- `/` — Daftar campaign aktif
- `/login` dan `/register` — Autentikasi Donatur/Creator
- `/campaigns/:id` — Detail campaign dan milestone
- `/dashboard` — Dashboard Donatur/Creator
- `/admin` — Antrean verifikasi Admin

## Struktur
```text
src/
├── components/ (layout, protected route)
├── context/ (autentikasi)
├── lib/ (API client, format)
├── pages/ (campaign, dashboard, auth)
└── styles/
```

Permintaan API memakai bearer token Sanctum yang disimpan selama tab browser terbuka. Donasi, wallet, dan transaksi on-chain sengaja belum tersedia pada tahap Web 2; jangan menampilkan alur transaksi seolah-olah berhasil sebelum integrasi smart contract Sepolia dibuat.
