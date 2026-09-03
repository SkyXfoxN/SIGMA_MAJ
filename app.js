/* app.js — Pengikat: muat naik Excel -> takrifan slaid -> paparan & eksport. */

(function () {
  let DATA = JSON.parse(JSON.stringify(window.DEFAULT_DATA));
  let SPEC = [];

  const $ = (id) => document.getElementById(id);
  const deck = $("deck"), notes = $("notes");

  function note(cls, html) {
    const d = document.createElement("div");
    d.className = "note " + cls;
    d.innerHTML = html;
    notes.appendChild(d);
  }
  const clearNotes = () => { notes.innerHTML = ""; };

  function fitSlides() {
    const avail = Math.min(window.innerWidth - 48, 1240);
    const scale = Math.min(1, avail / (13.333 * 96));
    document.querySelectorAll(".slide").forEach((s) => {
      s.style.transform = "scale(" + scale + ")";
      s.style.marginBottom = (7.5 * 96 * (scale - 1)) + "px";
    });
  }

  function render() {
    SPEC = buildSpec(DATA);
    const n = renderHTML(SPEC, deck);
    $("count").textContent = SPEC.length + " slaid";
    $("period").textContent = DATA.info.periode || "-";
    fitSlides();
    return n;
  }

  /* ── Muat naik Excel ─────────────────────────────────── */
  $("file").addEventListener("change", function (e) {
    const f = e.target.files[0];
    if (!f) return;
    clearNotes();
    const fr = new FileReader();
    fr.onload = function (ev) {
      try {
        const wb = XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
        const res = parseWorkbook(wb);
        DATA = res.data;
        render();
        note("ok", "<b>" + f.name + "</b> berjaya dimuat naik. Slaid telah dikemas kini.");
        if (res.warn.length) {
          note("warn", "<b>" + res.warn.length + " amaran:</b><br>" + res.warn.slice(0, 12).join("<br>") +
            (res.warn.length > 12 ? "<br>... dan " + (res.warn.length - 12) + " lagi." : ""));
        }
      } catch (err) {
        note("err", "<b>Gagal membaca fail.</b> " + err.message);
      }
      e.target.value = "";
    };
    fr.readAsArrayBuffer(f);
  });

  /* ── Butang ──────────────────────────────────────────── */
  $("btnUpload").addEventListener("click", () => $("file").click());

  $("btnTemplate").addEventListener("click", function () {
    buildTemplate(DATA, "Templat_Laporan_MAJ.xlsx");
  });

  $("btnPptx").addEventListener("click", function () {
    const b = this;
    b.disabled = true; b.textContent = "Menjana...";
    const name = "Laporan_MAJ_" + String(DATA.info.periode || "Laporan").replace(/\s+/g, "_") + ".pptx";
    renderPPTX(SPEC, name)
      .then(() => { clearNotes(); note("ok", "Fail PowerPoint <b>" + name + "</b> telah dimuat turun."); })
      .catch((err) => { clearNotes(); note("err", "<b>Gagal menjana PPTX.</b> " + err.message); })
      .then(() => { b.disabled = false; b.textContent = "Muat turun PPTX"; });
  });

  $("btnPdf").addEventListener("click", function () {
    clearNotes();
    note("ok", "Dalam kotak cetakan: pilih <b>Save as PDF</b>, saiz kertas <b>Custom 13.33 x 7.5 inci</b> " +
      "(atau Landscape), dan matikan <b>Headers and footers</b>.");
    setTimeout(() => window.print(), 350);
  });

  window.addEventListener("resize", fitSlides);
  render();
  note("ok", "Memaparkan <b>data demo</b>. Muat turun templat Excel, isi angka sebenar, kemudian muat naik semula.");
})();
