# Penjana Laporan Pemantauan Aduan — MyAduan Johor

Laman statik. Muat naik fail Excel, lihat 18 slaid terus dalam pelayar, muat turun sebagai **PowerPoint** atau **PDF landscape saiz slaid** (13.33" x 7.5").

Tiada pelayan, tiada pangkalan data. Semua pemprosesan berlaku dalam pelayar pengguna.

---

## Pasang di Netlify

1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret **seluruh folder ini** ke dalam kotak
3. Siap — Netlify beri URL

Untuk kemas kini: seret folder yang sama sekali lagi.

**Penting:** Jangan letak fail Excel berisi data aduan sebenar di dalam folder ini. Fail yang diletak di sini boleh dicapai oleh sesiapa yang tahu URL. Excel sepatutnya dimuat naik dari komputer setiap kali digunakan — dengan cara itu data tidak pernah meninggalkan pelayar.

Kalau mahu had capaian, aktifkan **Password protection** atau **Netlify Identity** di Site settings.

---

## Cara guna

| Butang | Fungsi |
|---|---|
| **Templat Excel** | Muat turun fail Excel dengan struktur betul dan data semasa sebagai contoh |
| **Muat naik Excel** | Baca fail yang telah diisi, kemas kini semua slaid serta-merta |
| **Muat turun PPTX** | Jana fail PowerPoint yang boleh diedit |
| **Muat turun PDF** | Buka kotak cetakan pelayar |

### Tetapan cetakan PDF

Dalam kotak cetakan Chrome:
- Destination: **Save as PDF**
- Paper size: **Custom** 13.33 x 7.5 inci, atau **Landscape**
- Margins: **None**
- Options: **Background graphics** dihidupkan, **Headers and footers** dimatikan

---

## Struktur fail Excel

Empat helaian. Nama helaian dan tajuk lajur **tidak boleh diubah**.

**`Info`** — Kunci | Nilai
Tajuk laporan, periode, siapa sediakan, dan sebagainya.

**`Data`** — Seksyen | Set | Label | Nilai
Semua pecahan angka. Contoh:

| Seksyen | Set | Label | Nilai |
|---|---|---|---|
| Media | Platform | Facebook | 97 |
| Media | Platform | Instagram | 65 |
| CS | Ringkasan | Diterima | 318 |

Susunan baris menentukan susunan dalam carta. Untuk tukar susunan kategori, susun semula baris dalam Excel.

**`Trend`** — Bulan | Siri | Nilai
Data enam bulan untuk carta trend.

**`Teks`** — ID | Perkara | Teks Automatik | Teks Ubahsuai
Setiap tajuk slaid, tajuk kad, dan ayat dapatan di bawah setiap carta.

Lajur **Teks Automatik** hanya rujukan — ia menunjukkan ayat yang sistem jana sendiri daripada data. Isi lajur **Teks Ubahsuai** hanya kalau mahu tulis sendiri.

Biarkan kosong = ayat dijana automatik dan sentiasa ikut data terkini.
Isi = ayat kau yang digunakan, kekal sampai kau padam.

Kalau ada set yang hilang, aplikasi tetap berjalan tetapi memaparkan amaran dan slaid berkenaan akan kosong.

---

## Struktur kod

```
index.html
assets/
  theme.js          Palet warna & geometri slaid
  spec.js           TAKRIFAN 30 SLAID  <- edit di sini
  render-html.js    Lukis slaid untuk paparan & PDF
  render-pptx.js    Bina fail PowerPoint
  excel.js          Jana templat & hurai fail
  app.js            Pengikat antara muka
  app.css           Gaya slaid & peraturan cetakan
  insights.js       Enjin ayat dapatan automatik
  data-default.js   Data demo
  vendor/           Pustaka (disimpan setempat, tiada CDN)
```

**Prinsip:** susun atur ditakrifkan **sekali sahaja** dalam `spec.js`. Kedua-dua penjana membacanya. Ubah kedudukan atau kandungan slaid di situ, dan PPTX serta PDF berubah serentak.

### Tukar warna

Semua dalam `assets/theme.js`:

```js
window.C = {
  INK: "12293D",     // navy — slaid tajuk & pembahagi
  TEAL: "13716E",    // aksen data utama
  AMBER: "CE7C2A",   // amaran
  CRIMSON: "9E3B3B", // kritikal
  ...
};
```

### Tambah slaid

Dalam `spec.js`, tambah objek ke dalam `slides`:

```js
slides.push({
  kind: "content", section: "Media Sosial", title: "Tajuk Baru", periode,
  blocks: [
    { t: "stat", x: G.M, y: 1.25, w: 3.9, h: 1.35,
      label: "Label", value: 123, color: C.INK, sub: "Nota kecil" },
    { t: "card", x: G.M, y: 2.85, w: G.CW, h: 4.0, title: "Tajuk kad",
      body: { k: "col", x: G.M + 0.3, y: 3.45, w: G.CW - 0.6, h: 3.2,
              labels: [...], values: [...], color: C.TEAL } },
  ],
});
```

Semua kedudukan dalam **inci**. Slaid ialah 13.333 x 7.5 inci.

Jenis blok: `stat`, `card`, `segment`, `insight`, `funnel`, `table`, `rank`, `label`
Jenis carta (dalam `body`): `col`, `bar`, `donut`, `line`

---

## Diuji

| Perkara | Status |
|---|---|
| Takrifan 30 slaid, kedudukan blok | Lulus — tiada blok terkeluar sempadan |
| Penjanaan PPTX | Lulus — fail sah, dibuka tanpa ralat |
| Kitaran Excel (jana templat, baca semula) | Lulus — 130 nilai, 0 perbezaan |
| Tindihan teks manual | Lulus — 89 baris boleh diubah |
| Binaan DOM untuk paparan HTML | Lulus — 22 carta, tiada ralat |
| **Paparan visual dalam pelayar sebenar** | **Belum diuji** |
| **PDF melalui cetakan pelayar** | **Belum diuji** |

Dua perkara terakhir tidak dapat diuji kerana persekitaran pembinaan tiada pelayar. Buka `index.html` dan semak paparan serta cetakan sebelum guna untuk laporan sebenar.

---

## Belum sedia

| Perkara | Tindakan |
|---|---|
| Sumber data Media Sosial | Bina helaian log |
| Sumber data e-mel / WhatsApp | Bina helaian log |
| Penanda aduan pencegahan | Tambah kolum baru **di hujung** Master_Engine |
| Butiran escalation | Tentukan penerima Peringatan 1-3 dan tindakan selepas Peringatan 3 |
| Data dalam `data-default.js` | Semua **dummy** — bukan angka sebenar |


---

## Seksyen yang disorokkan

Escalation dan Status Semasa Aduan (ikut PBT) telah dikeluarkan buat masa ini. Kod dan data untuk kedua-duanya boleh dipulangkan semula bila diperlukan — susun aturnya masih dikekalkan dalam sejarah projek.
