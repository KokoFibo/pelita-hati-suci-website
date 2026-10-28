# Pelita Hati Suci — Website (Astro + GSAP)

Website 6 halaman dalam **Bahasa Indonesia (default)** dan **繁體中文 (Traditional Chinese)**, tema terang default + tema gelap,
menu hamburger untuk mobile, dan **blog** (Artikel & Wacana) berbasis Markdown.
Warna & tipografi mengikuti sistem desain *Maitri Lotus Sanctuary*.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # hasil di ./dist
npm run preview
```

Ganti `site` di `astro.config.mjs` dengan domain produksi (dipakai untuk canonical & hreflang).

## Rute

| Halaman | Indonesia | 繁體中文 |
|---|---|---|
| Beranda | `/` | `/zh/` |
| Ajaran Kasih Semesta | `/ajaran-kasih-semesta/` | `/zh/universal-love/` |
| Pendidikan Moral & Anak | `/pendidikan-moral-anak/` | `/zh/moral-education/` |
| Budaya Vegetarian | `/budaya-vegetarian/` | `/zh/vegetarian-culture/` |
| Jadwal Kelas Dharma | `/jadwal-kelas-dharma/` | `/zh/dharma-schedule/` |
| Artikel & Wacana (blog) | `/artikel-wacana/` | `/zh/articles/` |
| Detail artikel | `/artikel-wacana/<key>/` | `/zh/articles/<key>/` |

Urutan menu: Beranda · Ajaran · Pendidikan · Budaya Vegetarian · **Jadwal Kelas Dharma** · Artikel & Wacana.
Pemetaan URL ada di satu tempat: `src/i18n/utils.ts` (`routes`). Tombol bahasa otomatis menuju halaman/artikel padanannya.

## Menambah artikel blog

Buat **dua file** dengan `key` yang sama (satu per bahasa):

```
src/content/blog/id/judul-artikel.md
src/content/blog/zh/judul-artikel.md
```

```md
---
lang: id                 # id | zh
key: judul-artikel       # sama di kedua bahasa -> menjadi URL
title: "Judul artikel"
description: "Ringkasan 1-2 kalimat (dipakai di kartu & SEO)"
date: 2026-04-01
category: silence        # maitri | family | veg | silence | story
readMinutes: 5
author: "Nama penulis"
cover: mindfulness       # garden | dhammasala | community | culinary | respect | education | mindfulness
tags: ["TagSatu", "TagDua"]
featured: false          # true = tampil sebagai sorotan di halaman blog
---

Isi artikel dalam Markdown (## judul bagian, daftar, > kutipan, **tebal**).
```

Foto sampul baru: taruh WebP di `public/images/` dan daftarkan di `src/i18n/images.ts` + enum `cover` di `src/content.config.ts`.
Blog memiliki: kartu bergambar, filter kategori, pencarian, sorotan, halaman detail dengan bar progres baca, tombol salin tautan,
artikel sebelumnya/berikutnya, dan artikel terkait.

## Struktur

```
src/
  content/blog/{id,zh}/ ← artikel (Markdown)
  content.config.ts     ← skema koleksi blog
  i18n/id.ts, zh.ts     ← SEMUA teks antarmuka. zh.ts bertipe sama dengan id.ts (kunci selalu sinkron)
  i18n/utils.ts         ← rute & helper bahasa
  layouts/Base.astro    ← <head>, SEO, hreflang, font, skrip tema
  components/           ← Header (hamburger), Footer, Hero, Faq, Cta, Rsvp, ...
  views/                ← isi tiap halaman (dipakai bersama oleh id & zh)
  pages/                ← file route tipis: id di root, zh di /zh
  scripts/animations.ts ← GSAP (ScrollTrigger)
  scripts/ui.ts         ← tema, drawer menu, FAQ, filter, form
  styles/global.css     ← token warna terang/gelap + semua komponen
public/images/hero-garden-*.webp ← foto hero
```

## Gambar hero
Hero Beranda & Ajaran memakai foto taman (`public/images/hero-garden-720.webp` dan `-1200.webp`, sudah dioptimalkan dari 4,2 MB menjadi
118 KB / 315 KB dan dimuat responsif lewat `srcset`). Untuk menggantinya, buat dua versi WebP (lebar 720 dan 1200) lalu ubah entri `garden`
di `src/i18n/images.ts`; perbarui juga teks `alt` di `src/i18n/id.ts` dan `zh.ts`.

## Tema & bahasa
- Terang adalah default (tidak mengikuti setelan sistem); pilihan pengguna disimpan di `localStorage` (`phs-theme-v2`).
- Font Mandarin (Noto Serif/Sans TC) hanya dimuat pada halaman `/zh/`.
- Terang & Bahasa Indonesia adalah default (tidak mengikuti setelan sistem/browser; tidak ada pengalihan bahasa otomatis).
- Desktop: tombol bahasa berupa slider; saat diklik, thumb bergeser halus (GSAP) ke bahasa tujuan sebelum halaman berpindah. Dengan `prefers-reduced-motion`, langsung berpindah tanpa animasi.
- Di layar kecil, header menampilkan **satu tombol bahasa** berlabel `ID` / `中` (menuju bahasa lainnya) dan **satu tombol tema**, di samping hamburger; drawer hanya berisi menu.
- Menu penuh tampil mulai 1440px (Indonesia, label lebih panjang) atau 1240px (Mandarin); di bawahnya memakai hamburger.

## Footer
Tahun hak cipta otomatis mengikuti tahun berjalan; kredit "Desain web oleh Kokofibo.com" ada di `src/components/Footer.astro` (teksnya di `footer.designBy` pada `id.ts`/`zh.ts`).

## Animasi GSAP
Intro hero, reveal saat scroll, stagger kartu, parallax foto, header yang menyembunyikan diri saat scroll turun, tombol magnetik,
drawer menu mobile, akordeon FAQ, transisi filter, dan bar progres baca artikel. Menghormati `prefers-reduced-motion`; konten tetap
tampil bila JavaScript gagal.

## Perlu Anda lengkapi
- **Formulir** (RSVP & newsletter) masih front-end saja; sambungkan di `src/scripts/ui.ts` (cari `TODO`).
- **Tombol "Unduh PDF"** di halaman blog masih `href="#"` (berkas PDF belum ada).
- **Kontak**: tombol "Hubungi Sahabat Dharma" menuju blok alamat di footer; tambahkan nomor WhatsApp/peta yang sebenarnya.
- Isi artikel, tanggal, testimoni, dan terjemahan Mandarin perlu ditinjau oleh penutur/pengelola konten Anda.
- Ikon: Material Symbols (subset via Google Fonts). Ikon baru -> tambahkan di `src/i18n/iconNames.ts` (urut abjad).
