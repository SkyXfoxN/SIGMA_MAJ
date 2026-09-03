/* spec.js - Takrifan slaid.
   INI SATU-SATUNYA tempat susun atur ditakrifkan; penjana HTML dan PPTX
   kedua-duanya membacanya.

   Setiap tajuk dan setiap ayat dapatan mempunyai ID. Ayat automatik
   dijana daripada data, tetapi boleh ditindih melalui helaian "Teks"
   dalam fail Excel. */

(function () {
  const L = (o) => Object.keys(o || {});
  const V = (o) => Object.values(o || {});
  const num = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
  const dtxt = (d) => (d >= 0 ? "\u25B2" : "\u25BC") + " " + Math.abs(d).toFixed(1) + "%  vs bulan lepas";
  const dcol = (d) => (d >= 0 ? C.MOSS : C.CRIMSON);
  const ageSegs = (o) => L(o).map((l, i) => ({ label: l, value: num(o[l]), color: AGEING_COLORS[i] }));

  window.buildSpec = function (D) {
    const g = (sek, st) => (D.d[sek] && D.d[sek][st]) || {};
    const tr = (k) => (D.trend.siri[k] || []).map(num);
    const BULAN = D.trend.bulan;
    const periode = D.info.periode;
    const teks = D.teks || {};
    const REG = [];
    const slides = [];

    /* Teks boleh ubah: kosong dalam Excel = guna ayat automatik */
    function T(key, auto, desc) {
      REG.push({ key: key, desc: desc || "", auto: String(auto == null ? "" : auto) });
      const v = teks[key];
      return v == null || String(v).trim() === "" ? auto : String(v);
    }

    /* Kad + carta + ayat dapatan. Kedudukan carta dikira automatik. */
    function CC(o) {
      const headH = o.note ? 0.78 : 0.58;
      const findH = o.find === null ? 0 : (o.findH || 0.5);
      const pad = 0.22;
      const ix = o.x + pad, iw = o.w - pad * 2;
      const iy = o.y + headH, ih = o.h - headH - findH - 0.1;
      const card = {
        t: "card", x: o.x, y: o.y, w: o.w, h: o.h,
        title: T(o.id + ".tajuk", o.title, "Tajuk kad"),
        note: o.note ? T(o.id + ".nota", o.note, "Nota kecil") : null,
      };
      const out = [card];
      if (o.body) {
        if (o.body.k === "segment") {
          out.push({ t: "segment", x: ix + 0.06, y: iy + (ih - 0.85) / 2,
            w: iw - 0.12, barH: 0.6, segs: o.body.segs });
        } else {
          card.body = Object.assign({}, o.body, { x: ix, y: iy, w: iw, h: ih });
        }
      }
      if (findH) {
        out.push({ t: "finding", x: o.x + 0.28, y: o.y + o.h - findH + 0.02,
          w: o.w - 0.56, h: findH - 0.06,
          text: T(o.id + ".dapatan", o.find, "Ayat dapatan") });
      }
      return out;
    }

    const SW = 3.9, SG = 0.25, HW = (G.COL - 0.25) / 2;
    const R1 = 1.25, RH = 2.72, R2 = 4.13;   /* grid dua baris */

    /* ═══ TAJUK ═══ */
    slides.push({ kind: "title", info: D.info });

    /* ═══════════ 1. MEDIA SOSIAL ═══════════ */
    slides.push({
      kind: "section", num: 1, title: T("S1.tajuk", "Media Sosial", "Tajuk seksyen"),
      items: ["Extract aduan dari media sosial", "Daftarkan aduan ke dalam MAJ",
        "Respons komen pengadu", "Jawab DM & pertanyaan"],
    });

    const mR = g("Media", "Ringkasan");
    const mCap = num(mR.Capture), mDM = num(mR.DM);
    const mAktif = num(mR.Aktif), mSel = num(mR.Selesai);
    const mAge = g("Media", "Ageing");
    const mPlat = g("Media", "Platform"), mKat = g("Media", "Kategori");
    const mPBT = g("Media", "PBT"), mStat = g("Media", "Status");

    slides.push({
      kind: "content", section: "Media Sosial",
      title: T("M1.tajuk", "Statistik Keseluruhan", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: R1, w: SW, h: 1.35, label: "Aduan di-capture", value: mCap, color: C.INK, sub: dtxt(num(mR.Capture_Delta)), subColor: dcol(num(mR.Capture_Delta)) },
        { t: "stat", x: G.M + SW + SG, y: R1, w: SW, h: 1.35, label: "DM diterima", value: mDM, color: C.INK, sub: dtxt(num(mR.DM_Delta)), subColor: dcol(num(mR.DM_Delta)) },
        { t: "stat", x: G.M + (SW + SG) * 2, y: R1, w: SW, h: 1.35, label: "Purata aduan sehari", value: Math.round(mCap / 21), fill: C.INK, color: C.WHITE, labelColor: C.ICE, sub: "Berasaskan 21 hari bekerja", subColor: C.ICE },
      ].concat(CC({
        id: "M1.trend", x: G.M, y: 2.85, w: G.CW, h: 4.0,
        title: "Trend bulanan aduan di-capture", note: "Enam bulan terakhir",
        body: { k: "col", labels: BULAN, values: tr("Media_Capture"), color: C.TEAL },
        find: fTrend(tr("Media_Capture"), BULAN, "aduan dijumpai"),
      })),
    });

    slides.push({
      kind: "content", section: "Media Sosial",
      title: T("M2.tajuk", "Pecahan Sumber & Kategori", "Tajuk slaid"), periode,
      blocks: CC({
        id: "M2.platform", x: G.M, y: R1, w: G.COL, h: RH, findH: 0.44,
        title: "Sumber platform",
        body: { k: "donut", labels: L(mPlat), values: V(mPlat).map(num), colors: SERIES },
        find: fTop(mPlat, "aduan"),
      }).concat(CC({
        id: "M2.pbt", x: G.M, y: R2, w: G.COL, h: RH, findH: 0.44,
        title: "Pecahan ikut PBT",
        body: { k: "col", labels: L(mPBT), values: V(mPBT).map(num), color: C.SLATE },
        find: fTop(mPBT, "aduan"),
      })).concat(CC({
        id: "M2.kategori", x: G.COL_X2, y: R1, w: G.COL, h: 5.60,
        title: "Kategori aduan dijumpai", note: "Sepuluh teratas",
        body: { k: "bar", labels: L(mKat), values: V(mKat).map(num), color: C.OCEAN },
        find: fTop(mKat, "aduan"),
      })),
    });

    slides.push({
      kind: "content", section: "Media Sosial",
      title: T("M3.tajuk", "Status Semasa Aduan", "Tajuk slaid"), periode,
      blocks: CC({
        id: "M3.status", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan status", note: mCap + " aduan didaftarkan melalui media sosial",
        body: { k: "donut", labels: L(mStat), values: V(mStat).map(num), colors: SERIES },
        find: fStatus(mStat, ["Diselesaikan", "Ditolak"]),
      }).concat([
        { t: "stat", x: G.COL_X2, y: G.TOP, w: HW, h: 1.35, label: "Masih aktif", value: mAktif, color: C.AMBER, sub: pct(mAktif, mCap) + "% daripada jumlah aduan" },
        { t: "stat", x: G.COL_X2 + HW + 0.25, y: G.TOP, w: HW, h: 1.35, label: "Telah selesai", value: mSel, color: C.MOSS, sub: pct(mSel, mCap) + "% daripada jumlah aduan" },
      ]).concat(CC({
        id: "M3.ageing", x: G.COL_X2, y: 2.85, w: G.COL, h: 4.0,
        title: "Ageing aduan masih aktif", note: "Tempoh aduan tergantung sejak didaftarkan",
        body: { k: "segment", segs: ageSegs(mAge) },
        find: fAge(mAge),
      })),
    });

    const mDMp = g("Media", "DM_Platform");
    slides.push({
      kind: "content", section: "Media Sosial",
      title: T("M4.tajuk", "DM & Pertanyaan", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: R1, w: SW, h: 1.35, label: "DM diterima", value: mDM, color: C.INK, sub: dtxt(num(mR.DM_Delta)), subColor: dcol(num(mR.DM_Delta)) },
        { t: "stat", x: G.M + SW + SG, y: R1, w: SW, h: 1.35, label: "Dijadikan aduan rasmi", value: num(mR.DM_Jadi_Aduan), color: C.OCEAN, sub: pct(num(mR.DM_Jadi_Aduan), mDM) + "% daripada DM diterima" },
        { t: "stat", x: G.M + (SW + SG) * 2, y: R1, w: SW, h: 1.35, label: "Selesai terus di DM", value: num(mR.DM_Selesai_Terus), color: C.MOSS, sub: "Tidak perlu didaftarkan sebagai aduan" },
      ].concat(CC({
        id: "M4.trend", x: G.M, y: 2.85, w: G.COL, h: 4.0,
        title: "Trend bulanan DM diterima",
        body: { k: "col", labels: BULAN, values: tr("Media_DM"), color: C.SLATE },
        find: fTrend(tr("Media_DM"), BULAN, "DM"),
      })).concat(CC({
        id: "M4.platform", x: G.COL_X2, y: 2.85, w: G.COL, h: 4.0,
        title: "Pecahan DM ikut platform",
        body: { k: "donut", labels: L(mDMp), values: V(mDMp).map(num), colors: SERIES },
        find: fTop(mDMp, "DM"),
      })),
    });

    /* ═══════════ 2. CUSTOMER SERVICE ═══════════ */
    slides.push({
      kind: "section", num: 2, title: T("S2.tajuk", "Customer Service", "Tajuk seksyen"),
      items: ["Daftar aduan SISPAA ke MAJ", "Tutup aduan MAJ kembali ke SISPAA",
        "Jawab e-mel pengadu", "Jawab pertanyaan WhatsApp"],
    });

    const cR = g("CS", "Ringkasan");
    const cDit = num(cR.Diterima), cAkt = num(cR.Aktif);
    const cTut = num(cR.Ditutup), cBaki = num(cR.Belum_Tutup);
    const cAge = g("CS", "Ageing_Aktif");
    const cPBT = g("CS", "PBT"), cKat = g("CS", "Kategori"), cStat = g("CS", "Status_Aktif");

    slides.push({
      kind: "content", section: "Customer Service",
      title: T("C1.tajuk", "Statistik Keseluruhan - Kitaran SISPAA", "Tajuk slaid"), periode,
      blocks: [{
        t: "funnel", x: G.M, y: G.TOP, w: G.CW, h: 1.9, steps: [
          { label: "Diterima &\ndidaftar", value: cDit, fill: C.INK, labelColor: C.ICE, valueColor: C.WHITE, note: dtxt(num(cR.Diterima_Delta)), noteColor: C.ICE },
          { label: "Masih aktif\ndi MAJ", value: cAkt, fill: C.MIST, labelColor: C.MUTED, valueColor: C.AMBER, note: "Kerja belum siap", noteColor: C.MUTED },
          { label: "Ditutup di\nSISPAA", value: cTut, fill: C.MIST, labelColor: C.MUTED, valueColor: C.MOSS, note: "Kitaran lengkap", noteColor: C.MUTED },
          { label: "Siap tetapi\nbelum ditutup", value: cBaki, fill: C.PALE_RED, labelColor: C.DARK_RED, valueColor: C.CRIMSON, note: "Perlu tindakan CS", noteColor: C.DARK_RED },
        ],
      }].concat(CC({
        id: "C1.trend", x: G.M, y: 3.42, w: G.CW, h: 3.43,
        title: "Trend bulanan aduan SISPAA diterima",
        body: { k: "col", labels: BULAN, values: tr("CS_Diterima"), color: C.TEAL },
        find: fTrend(tr("CS_Diterima"), BULAN, "aduan"),
      })),
    });

    slides.push({
      kind: "content", section: "Customer Service",
      title: T("C2.tajuk", "Pecahan Aduan SISPAA", "Tajuk slaid"), periode,
      blocks: CC({
        id: "C2.pbt", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan ikut PBT", note: cDit + " aduan diterima",
        body: { k: "donut", labels: L(cPBT), values: V(cPBT).map(num), colors: SERIES },
        find: fTop(cPBT, "aduan"),
      }).concat(CC({
        id: "C2.kategori", x: G.COL_X2, y: G.TOP, w: G.COL, h: 5.60,
        title: "Kategori aduan", note: "Sepuluh teratas",
        body: { k: "bar", labels: L(cKat), values: V(cKat).map(num), color: C.OCEAN },
        find: fTop(cKat, "aduan"),
      })),
    });

    const cLewat = num(cAge["16-30 hari"]) + num(cAge["30+ hari"]);
    slides.push({
      kind: "content", section: "Customer Service",
      title: T("C3.tajuk", "Status Semasa Aduan Aktif", "Tajuk slaid"), periode,
      blocks: CC({
        id: "C3.status", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan status", note: cAkt + " aduan masih dalam proses",
        body: { k: "donut", labels: L(cStat), values: V(cStat).map(num), colors: SERIES },
        find: fTop(cStat, "aduan"),
      }).concat(CC({
        id: "C3.ageing", x: G.COL_X2, y: G.TOP, w: G.COL, h: RH,
        title: "Ageing aduan aktif", note: "Tempoh aduan tergantung",
        body: { k: "segment", segs: ageSegs(cAge) },
        find: fAge(cAge),
      })).concat([
        { t: "stat", x: G.COL_X2, y: R2, w: HW, h: 1.5, label: "Melebihi 15 hari", value: cLewat, color: C.AMBER, sub: pct(cLewat, cAkt) + "% daripada aduan aktif" },
        { t: "stat", x: G.COL_X2 + HW + 0.25, y: R2, w: HW, h: 1.5, label: "Melebihi 30 hari", value: num(cAge["30+ hari"]), color: C.CRIMSON, sub: "Perlu diangkat dalam mesyuarat" },
        { t: "insight", x: G.COL_X2, y: 5.95, w: G.COL, text: T("C3.insight", "Aduan yang telah selesai dikeluarkan dari kiraan ini - elak kira dua kali.", "Ayat insight") },
      ]),
    });

    slides.push({
      kind: "content", section: "Customer Service",
      title: T("C4.tajuk", "E-mel & WhatsApp", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: R1, w: SW, h: 1.35, label: "E-mel dijawab", value: num(cR.Emel_Dijawab), color: C.INK },
        { t: "stat", x: G.M + SW + SG, y: R1, w: SW, h: 1.35, label: "WhatsApp dijawab", value: num(cR.WA_Dijawab), color: C.INK },
        { t: "stat", x: G.M + (SW + SG) * 2, y: R1, w: SW, h: 1.35, label: "Jumlah keseluruhan dijawab", value: num(cR.Emel_Dijawab) + num(cR.WA_Dijawab), fill: C.INK, color: C.WHITE, labelColor: C.ICE, sub: "E-mel dan WhatsApp digabungkan", subColor: C.ICE },
      ].concat(CC({
        id: "C4.trend", x: G.M, y: 2.85, w: 7.7, h: 4.0,
        title: "Trend bulanan", note: "E-mel berbanding WhatsApp",
        body: { k: "line", labels: BULAN, series: [
          { name: "E-mel", values: tr("CS_Emel"), color: C.OCEAN },
          { name: "WhatsApp", values: tr("CS_WA"), color: C.TEAL }] },
        find: fSplit(num(cR.WA_Dijawab), num(cR.Emel_Dijawab), "WhatsApp", "e-mel"),
      })).concat([
        { t: "card", x: 8.55, y: 2.85, w: 4.2, h: 4.0,
          title: T("C4.catatan.tajuk", "Catatan", "Tajuk kad") },
        { t: "para", x: 8.83, y: 3.5, w: 3.64, h: 3.1,
          text: T("C4.catatan", "Tulis catatan bulan ini di sini melalui helaian Teks dalam fail Excel.", "Catatan manual") },
      ]),
    });

    /* ═══════════ 3. LAPANGAN ═══════════ */
    slides.push({
      kind: "section", num: 3, title: T("S3.tajuk", "Lapangan", "Tajuk seksyen"),
      items: ["QC aduan & tanda perlu lawatan", "Laksana lawatan tapak & rekod hasil",
        "Daftar aduan pencegahan"],
    });

    const lR = g("Lawatan", "Ringkasan"), lPBT = g("Lawatan", "PBT");
    const lKat = g("Lawatan", "Kategori"), lZon = g("Lawatan", "Zon");
    const lStat = g("Lawatan", "Status"), lAge = g("Lawatan", "Ageing_Tersangkut");
    const lTot = num(lR.Total), lBrg = num(lR.Bergerak), lTsk = num(lR.Tersangkut);

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Lawatan Tapak (QC)",
      title: T("L1.tajuk", "Statistik Keseluruhan", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: R1, w: SW, h: 1.35, label: "Lawatan Tapak (QC)", value: lTot, fill: C.INK, color: C.WHITE, labelColor: C.ICE, sub: dtxt(num(lR.Delta)), subColor: C.ICE },
        { t: "stat", x: G.M + SW + SG, y: R1, w: SW, h: 1.35, label: "Purata sehari bekerja", value: Math.round(lTot / 21), color: C.INK, sub: "Berasaskan 21 hari bekerja" },
        { t: "stat", x: G.M + (SW + SG) * 2, y: R1, w: SW, h: 1.35, label: "PBT tertinggi", value: L(lPBT)[0] || "-", color: C.TEAL, vsize: 34, sub: num(V(lPBT)[0]) + " lawatan dilaksana" },
      ].concat(CC({
        id: "L1.trend", x: G.M, y: 2.85, w: 7.7, h: 4.0,
        title: "Trend bulanan Lawatan Tapak (QC)",
        body: { k: "col", labels: BULAN, values: tr("Lawatan"), color: C.TEAL },
        find: fTrend(tr("Lawatan"), BULAN, "lawatan"),
      })).concat(CC({
        id: "L1.pbt", x: 8.55, y: 2.85, w: 4.2, h: 4.0,
        title: "Pecahan ikut PBT",
        body: { k: "donut", labels: L(lPBT), values: V(lPBT).map(num), colors: SERIES },
        find: fTop(lPBT, "lawatan"),
      })),
    });

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Lawatan Tapak (QC)",
      title: T("L2.tajuk", "Pecahan Aduan Dilawat", "Tajuk slaid"), periode,
      blocks: CC({
        id: "L2.kategori", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Kategori aduan dilawat", note: "Sepuluh teratas",
        body: { k: "bar", labels: L(lKat), values: V(lKat).map(num), color: C.OCEAN },
        find: fTop(lKat, "lawatan"),
      }).concat(CC({
        id: "L2.zon", x: G.COL_X2, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan ikut zon", note: "Menunjukkan kawasan tumpuan lawatan",
        body: { k: "col", labels: L(lZon), values: V(lZon).map(num), color: C.TEAL },
        find: fTop(lZon, "lawatan"),
      })),
    });

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Lawatan Tapak (QC)",
      title: T("L3.tajuk", "Status Aduan Selepas Lawatan", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: G.TOP, w: HW, h: 1.5, label: "Telah bergerak", value: lBrg, color: C.MOSS, sub: pct(lBrg, lTot) + "% daripada aduan dilawat" },
        { t: "stat", x: G.M + HW + 0.25, y: G.TOP, w: HW, h: 1.5, label: "Masih tersangkut", value: lTsk, color: C.CRIMSON, sub: pct(lTsk, lTot) + "% daripada aduan dilawat" },
      ].concat(CC({
        id: "L3.ageing", x: G.M, y: 3.0, w: G.COL, h: 3.85,
        title: "Ageing aduan masih tersangkut", note: "Tempoh tergantung selepas lawatan",
        body: { k: "segment", segs: ageSegs(lAge) },
        find: fAge(lAge),
      })).concat(CC({
        id: "L3.status", x: G.COL_X2, y: G.TOP, w: G.COL, h: 5.60,
        title: "Status semasa aduan dilawat", note: lTot + " aduan telah dilawat pada " + periode,
        body: { k: "donut", labels: L(lStat), values: V(lStat).map(num), colors: [C.AMBER, C.OCEAN, C.MOSS] },
        find: fStatus(lStat, ["Diselesaikan", "Selesai Sementara"]),
      })),
    });

    const pR = g("Pencegahan", "Ringkasan"), pPBT = g("Pencegahan", "PBT");
    const pKat = g("Pencegahan", "Kategori"), pZon = g("Pencegahan", "Zon");
    const pStat = g("Pencegahan", "Status"), pAge = g("Pencegahan", "Ageing_Aktif");
    const pTot = num(pR.Total), pAkt = num(pR.Aktif), pSel = num(pR.Selesai);

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Aduan Pencegahan",
      title: T("L4.tajuk", "Statistik Keseluruhan", "Tajuk slaid"), periode,
      blocks: [
        { t: "stat", x: G.M, y: R1, w: SW, h: 1.35, label: "Aduan pencegahan didaftar", value: pTot, fill: C.INK, color: C.WHITE, labelColor: C.ICE, sub: dtxt(num(pR.Delta)), subColor: C.ICE },
        { t: "stat", x: G.M + SW + SG, y: R1, w: SW, h: 1.35, label: "Dalam tindakan", value: pAkt, color: C.AMBER, sub: pct(pAkt, pTot) + "% daripada jumlah didaftar" },
        { t: "stat", x: G.M + (SW + SG) * 2, y: R1, w: SW, h: 1.35, label: "Telah selesai", value: pSel, color: C.MOSS, sub: pct(pSel, pTot) + "% daripada jumlah didaftar" },
      ].concat(CC({
        id: "L4.trend", x: G.M, y: 2.85, w: 7.7, h: 4.0,
        title: "Trend bulanan aduan pencegahan",
        note: "Isu dikesan sendiri oleh pegawai semasa turun padang",
        body: { k: "col", labels: BULAN, values: tr("Pencegahan"), color: C.MOSS },
        find: fTrend(tr("Pencegahan"), BULAN, "aduan pencegahan"),
      })).concat(CC({
        id: "L4.pbt", x: 8.55, y: 2.85, w: 4.2, h: 4.0,
        title: "Pecahan ikut PBT",
        body: { k: "donut", labels: L(pPBT), values: V(pPBT).map(num), colors: SERIES },
        find: fTop(pPBT, "aduan"),
      })),
    });

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Aduan Pencegahan",
      title: T("L5.tajuk", "Pecahan Isu Dikesan", "Tajuk slaid"), periode,
      blocks: CC({
        id: "L5.kategori", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Kategori isu dikesan", note: "Susunan tertinggi ke terendah",
        body: { k: "bar", labels: L(pKat), values: V(pKat).map(num), color: C.MOSS },
        find: fTop(pKat, "isu"),
      }).concat(CC({
        id: "L5.zon", x: G.COL_X2, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan ikut zon",
        note: "Zon dengan isu berulang wajar dijadualkan rondaan tetap",
        body: { k: "col", labels: L(pZon), values: V(pZon).map(num), color: C.TEAL },
        find: fTop(pZon, "isu"),
      })),
    });

    slides.push({
      kind: "content", section: "Lapangan \u00B7 Aduan Pencegahan",
      title: T("L6.tajuk", "Status Semasa", "Tajuk slaid"), periode,
      blocks: CC({
        id: "L6.status", x: G.M, y: G.TOP, w: G.COL, h: 5.60,
        title: "Pecahan status", note: pTot + " aduan pencegahan didaftarkan",
        body: { k: "donut", labels: L(pStat), values: V(pStat).map(num), colors: [C.AMBER, C.MOSS] },
        find: fSplit(pSel, pAkt, "telah selesai", "masih dalam tindakan"),
      }).concat([
        { t: "stat", x: G.COL_X2, y: G.TOP, w: HW, h: 1.5, label: "Dalam tindakan", value: pAkt, color: C.AMBER, sub: "Belum selesai sepenuhnya" },
        { t: "stat", x: G.COL_X2 + HW + 0.25, y: G.TOP, w: HW, h: 1.5, label: "Telah selesai", value: pSel, color: C.MOSS, sub: "Kerja pembaikan selesai" },
      ]).concat(CC({
        id: "L6.ageing", x: G.COL_X2, y: 3.0, w: G.COL, h: 3.85,
        title: "Ageing aduan dalam tindakan",
        body: { k: "segment", segs: ageSegs(pAge) },
        find: fAge(pAge),
      })),
    });

    window.TEXT_KEYS = REG;
    return slides;
  };
})();
