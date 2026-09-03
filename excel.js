/* excel.js — Jana templat Excel dan hurai fail yang dimuat naik.
   Skema 4 helaian, format panjang supaya senang diedit. */

(function () {
  const SHEETS = { INFO: "Info", DATA: "Data", TREND: "Trend", TEKS: "Teks" };

  const INFO_KEYS = [
    ["tajuk", "Tajuk Laporan"], ["sistem", "Nama Sistem"], ["periode", "Periode"],
    ["disediakan", "Disediakan Oleh"], ["tarikh_jana", "Tarikh Jana"], ["sumber", "Sumber Data"],
  ];

  /* ── Jana templat daripada data semasa ─────────────────── */
  window.buildTemplate = function (D, filename) {
    const wb = XLSX.utils.book_new();

    const info = [["Kunci", "Nilai"]];
    INFO_KEYS.forEach(([k, label]) => info.push([label, D.info[k] || ""]));
    const wsI = XLSX.utils.aoa_to_sheet(info);
    wsI["!cols"] = [{ wch: 22 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsI, SHEETS.INFO);

    const data = [["Seksyen", "Set", "Label", "Nilai"]];
    Object.keys(D.d).forEach((sek) => {
      Object.keys(D.d[sek]).forEach((set) => {
        Object.keys(D.d[sek][set]).forEach((lbl) => {
          data.push([sek, set, lbl, D.d[sek][set][lbl]]);
        });
      });
    });
    const wsD = XLSX.utils.aoa_to_sheet(data);
    wsD["!cols"] = [{ wch: 18 }, { wch: 22 }, { wch: 32 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsD, SHEETS.DATA);

    const trend = [["Bulan", "Siri", "Nilai"]];
    Object.keys(D.trend.siri).forEach((siri) => {
      D.trend.bulan.forEach((b, i) => trend.push([b, siri, D.trend.siri[siri][i]]));
    });
    const wsT = XLSX.utils.aoa_to_sheet(trend);
    wsT["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsT, SHEETS.TREND);

    // Helaian Teks: senarai setiap tajuk & ayat yang boleh diubah.
    // buildSpec dipanggil dahulu supaya senarai ID lengkap.
    buildSpec(D);
    const seen = {};
    const teks = [["ID", "Perkara", "Teks Automatik (rujukan sahaja)", "Teks Ubahsuai"]];
    (window.TEXT_KEYS || []).forEach((t) => {
      if (seen[t.key]) return;
      seen[t.key] = 1;
      teks.push([t.key, t.desc, t.auto, (D.teks && D.teks[t.key]) || ""]);
    });
    const wsX = XLSX.utils.aoa_to_sheet(teks);
    wsX["!cols"] = [{ wch: 20 }, { wch: 16 }, { wch: 70 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsX, SHEETS.TEKS);

    XLSX.writeFile(wb, filename);
  };

  /* ── Hurai fail yang dimuat naik ───────────────────────── */
  window.parseWorkbook = function (wb) {
    const warn = [];
    const need = [SHEETS.INFO, SHEETS.DATA, SHEETS.TREND];
    need.forEach((n) => { if (!wb.Sheets[n]) throw new Error("Helaian '" + n + "' tiada dalam fail Excel."); });

    const rows = (name) => (wb.Sheets[name] ? XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false }) : []);

    // Info
    const info = {};
    const labelToKey = {};
    INFO_KEYS.forEach(([k, label]) => { labelToKey[label.toLowerCase()] = k; });
    rows(SHEETS.INFO).slice(1).forEach((r) => {
      const k = labelToKey[String(r[0] || "").trim().toLowerCase()];
      if (k) info[k] = String(r[1] == null ? "" : r[1]);
    });
    INFO_KEYS.forEach(([k, label]) => { if (!info[k]) { info[k] = ""; warn.push("Info '" + label + "' kosong."); } });

    // Data
    const d = {};
    rows(SHEETS.DATA).slice(1).forEach((r, i) => {
      const sek = String(r[0] || "").trim(), set = String(r[1] || "").trim(), lbl = String(r[2] || "").trim();
      if (!sek || !set || !lbl) { if (r.length) warn.push("Data baris " + (i + 2) + " tidak lengkap - dilangkau."); return; }
      const v = r[3];
      const nv = typeof v === "number" ? v : parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
      d[sek] = d[sek] || {};
      d[sek][set] = d[sek][set] || {};
      d[sek][set][lbl] = isNaN(nv) ? 0 : nv;
    });

    // Trend
    const bulan = [], siri = {};
    rows(SHEETS.TREND).slice(1).forEach((r) => {
      const b = String(r[0] || "").trim(), sr = String(r[1] || "").trim();
      if (!b || !sr) return;
      if (bulan.indexOf(b) === -1) bulan.push(b);
      siri[sr] = siri[sr] || [];
      const v = r[2];
      siri[sr].push(typeof v === "number" ? v : parseFloat(v) || 0);
    });

    // Teks: hanya lajur "Teks Ubahsuai" dibaca. Kosong = guna ayat automatik,
    // supaya ayat sentiasa mengikut data terkini.
    const teks = {};
    rows(SHEETS.TEKS).slice(1).forEach((r) => {
      const id = String(r[0] || "").trim();
      const v = r[3] == null ? "" : String(r[3]).trim();
      if (id && v) teks[id] = v;
    });

    // Semakan asas
    const mustHave = [["Media", "Ringkasan"], ["Media", "Platform"], ["CS", "Ringkasan"],
      ["Lawatan", "Ringkasan"], ["Pencegahan", "Ringkasan"]];
    mustHave.forEach(([a, b]) => {
      if (!d[a] || !d[a][b]) warn.push("Set '" + a + " / " + b + "' tiada - slaid berkaitan mungkin kosong.");
    });
    if (!bulan.length) warn.push("Helaian Trend kosong - carta trend tidak akan dipaparkan.");

    return { data: { info, d, trend: { bulan, siri }, teks }, warn };
  };
})();
