/* render-html.js — Lukis slaid sebagai DOM. Digunakan untuk paparan
   dalam browser DAN untuk PDF (melalui cetakan browser). */

(function () {
  const charts = [];
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const IN = (v) => v + "in";
  const box = (b) => `left:${IN(b.x)};top:${IN(b.y)};width:${IN(b.w)};` + (b.h ? `height:${IN(b.h)};` : "");

  function el(cls, style, html) {
    const d = document.createElement("div");
    d.className = cls;
    if (style) d.setAttribute("style", style);
    if (html != null) d.innerHTML = html;
    return d;
  }

  /* ── Carta ─────────────────────────────────────────────── */
  const NOANIM = {
    animation: false, responsive: true, maintainAspectRatio: false,
    devicePixelRatio: 3,   /* tajam semasa cetakan PDF */
  };
  const AXIS_OFF = { grid: { display: false }, border: { display: false } };

  /* Chart.js mengukur BEKAS, bukan kanvas. Tanpa bekas bersaiz tepat,
     kanvas jatuh ke saiz lalai 300x150 dan carta jadi herot. */
  function mkCanvas(parent, b) {
    const wrap = el("blk chartwrap", box(b));
    const c = document.createElement("canvas");
    wrap.appendChild(c);
    parent.appendChild(wrap);
    return c;
  }

  function drawChart(parent, body) {
    const cv = mkCanvas(parent, body);
    let cfg;

    if (body.k === "col" || body.k === "bar") {
      const horiz = body.k === "bar";
      cfg = {
        type: "bar",
        data: {
          labels: body.labels,
          datasets: [{ data: body.values, backgroundColor: hx(body.color), barPercentage: horiz ? 0.72 : 0.62, categoryPercentage: 0.9 }],
        },
        options: Object.assign({}, NOANIM, {
          indexAxis: horiz ? "y" : "x",
          layout: { padding: horiz ? { right: 26 } : { top: 18 } },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
              anchor: "end", align: horiz ? "right" : "top", offset: 2,
              color: hx(C.TEXT), font: { size: 9, family: F.BODY },
              formatter: (v) => v,
            },
          },
          scales: {
            x: horiz
              ? Object.assign({ display: false, beginAtZero: true }, AXIS_OFF)
              : Object.assign({ ticks: { color: hx(C.MUTED), font: { size: 9.5, family: F.BODY } } }, AXIS_OFF),
            y: horiz
              ? Object.assign({ ticks: { color: hx(C.TEXT), font: { size: 9.5, family: F.BODY } } }, AXIS_OFF)
              : Object.assign({ display: false, beginAtZero: true }, AXIS_OFF),
          },
        }),
      };
    } else if (body.k === "donut") {
      cfg = {
        type: "doughnut",
        data: { labels: body.labels, datasets: [{ data: body.values, backgroundColor: (body.colors || SERIES).map(hx), borderWidth: 0 }] },
        options: Object.assign({}, NOANIM, {
          cutout: "55%",
          plugins: {
            legend: { position: "right", labels: { boxWidth: 9, boxHeight: 9, color: hx(C.TEXT), font: { size: 9.5, family: F.BODY }, padding: 8 } },
            tooltip: { enabled: false },
            datalabels: { color: "#fff", font: { size: 9, weight: "bold", family: F.BODY }, formatter: (v) => v },
          },
        }),
      };
    } else if (body.k === "line") {
      cfg = {
        type: "line",
        data: {
          labels: body.labels,
          datasets: body.series.map((s) => ({
            label: s.name, data: s.values,
            borderColor: hx(s.color), backgroundColor: hx(s.color),
            borderWidth: 2.5, pointRadius: 3.5, tension: 0.15, fill: false,
          })),
        },
        options: Object.assign({}, NOANIM, {
          plugins: {
            legend: { position: "top", labels: { boxWidth: 14, color: hx(C.TEXT), font: { size: 9.5, family: F.BODY } } },
            tooltip: { enabled: false }, datalabels: { display: false },
          },
          scales: {
            x: Object.assign({ ticks: { color: hx(C.MUTED), font: { size: 9.5, family: F.BODY } } }, AXIS_OFF),
            y: { beginAtZero: true, grid: { color: hx(C.LINE) }, border: { display: false }, ticks: { color: hx(C.MUTED), font: { size: 9, family: F.BODY } } },
          },
        }),
      };
    }
    charts.push(new Chart(cv, cfg));
  }

  /* ── Blok ──────────────────────────────────────────────── */
  function drawBlock(slide, b) {
    if (b.t === "stat") {
      const w = el("blk stat", `${box(b)};background:${hx(b.fill || C.MIST)}`);
      w.innerHTML =
        `<div class="stat-label" style="color:${hx(b.labelColor || C.MUTED)}">${esc(b.label)}</div>` +
        `<div class="stat-value" style="color:${hx(b.color || C.INK)};font-size:${b.vsize || 40}pt">${esc(b.value)}</div>` +
        (b.sub ? `<div class="stat-sub" style="color:${hx(b.subColor || C.MUTED)}">${esc(b.sub)}</div>` : "");
      slide.appendChild(w);

    } else if (b.t === "card") {
      const w = el("blk card", box(b));
      w.innerHTML = `<div class="card-title">${esc(b.title || "")}</div>` +
        (b.note ? `<div class="card-note">${esc(b.note)}</div>` : "");
      slide.appendChild(w);
      if (b.body) {
        if (['col','bar','donut','line'].indexOf(b.body.k) >= 0) drawChart(slide, b.body);
        else drawBlock(slide, Object.assign({ t: b.body.k }, b.body));
      }

    } else if (b.t === "segment") {
      const tot = b.segs.reduce((a, s) => a + s.value, 0) || 1;
      const w = el("blk segwrap", box(b));
      let bar = `<div class="segbar" style="height:${IN(b.barH || 0.46)}">`;
      b.segs.forEach((s) => {
        const p = (s.value / tot) * 100;
        bar += `<div class="seg" style="width:${p}%;background:${hx(s.color)}">` +
          (p > 7 ? `<span>${s.value}</span>` : "") + "</div>";
      });
      bar += "</div><div class='seglegend'>";
      b.segs.forEach((s) => {
        bar += `<div class="segleg"><i style="background:${hx(s.color)}"></i>${esc(s.label)}</div>`;
      });
      w.innerHTML = bar + "</div>";
      slide.appendChild(w);

    } else if (b.t === "insight") {
      const w = el("blk insight", box(b));
      w.innerHTML = `<i></i><span>${esc(b.text)}</span>`;
      slide.appendChild(w);

    } else if (b.t === "funnel") {
      const gap = 0.5, bw = (b.w - gap * (b.steps.length - 1)) / b.steps.length;
      b.steps.forEach((st, i) => {
        const bx = b.x + i * (bw + gap);
        const w = el("blk fstep", `left:${IN(bx)};top:${IN(b.y)};width:${IN(bw)};height:${IN(b.h)};background:${hx(st.fill)}`);
        w.innerHTML =
          `<div class="stat-label" style="color:${hx(st.labelColor)}">${esc(st.label).replace(/\n/g, "<br>")}</div>` +
          `<div class="fstep-value" style="color:${hx(st.valueColor)}">${esc(st.value)}</div>` +
          (st.note ? `<div class="stat-sub" style="color:${hx(st.noteColor)}">${esc(st.note)}</div>` : "");
        slide.appendChild(w);
        if (i < b.steps.length - 1) {
          slide.appendChild(el("blk farrow", `left:${IN(bx + bw + 0.09)};top:${IN(b.y + b.h / 2 - 0.13)};width:${IN(0.32)};height:${IN(0.26)}`));
        }
      });

    } else if (b.t === "table") {
      const w = el("blk", box(b));
      let h = `<table class="tbl" style="font-size:${(b.fs || 10.5) * 0.95}pt"><colgroup>` +
        b.colW.map((c) => `<col style="width:${IN(c)}">`).join("") + "</colgroup><thead><tr>";
      b.head.forEach((t, i) => { h += `<th class="${i ? "c" : ""}">${esc(t)}</th>`; });
      h += "</tr></thead><tbody>";
      b.rows.forEach((r) => {
        h += `<tr style="height:${IN(b.rowH || 0.32)}">`;
        r.forEach((cell, i) => {
          const o = typeof cell === "object" && cell !== null ? cell : { text: cell };
          h += `<td class="${i ? "c" : "b"}" style="color:${hx(o.color || C.TEXT)};${o.bold || !i ? "font-weight:700" : ""}">${esc(o.text)}</td>`;
        });
        h += "</tr>";
      });
      w.innerHTML = h + "</tbody></table>";
      slide.appendChild(w);

    } else if (b.t === "rank") {
      const max = Math.max.apply(null, b.items.map((i) => i[1])) || 1;
      const w = el("blk", box(b));
      let h = "";
      b.items.forEach((it) => {
        h += `<div class="rank"><span class="rl">${esc(it[0])}</span>` +
          `<span class="rb"><i style="width:${(it[1] / max) * 100}%;background:${hx(b.color || C.OCEAN)}"></i></span>` +
          `<span class="rv">${it[1]}</span></div>`;
      });
      w.innerHTML = h;
      slide.appendChild(w);

    } else if (b.t === "label") {
      slide.appendChild(el("blk minilabel", box(b), esc(b.text)));

    } else if (b.t === "finding") {
      if (b.text) slide.appendChild(el("blk finding", box(b), esc(b.text)));

    } else if (b.t === "para") {
      if (b.text) slide.appendChild(el("blk para", box(b), esc(b.text).replace(/\n/g, "<br>")));
    }
  }

  /* ── Slaid ─────────────────────────────────────────────── */
  window.renderHTML = function (spec, mount) {
    charts.forEach((c) => c.destroy());
    charts.length = 0;
    mount.innerHTML = "";
    let page = 0;

    spec.forEach((sl) => {
      const s = el("slide" + (sl.kind === "content" ? "" : " dark"));

      if (sl.kind === "title") {
        const i = sl.info;
        s.innerHTML =
          `<div class="t-band"></div>` +
          `<div class="t-eyebrow">${esc(i.sistem)}</div>` +
          `<div class="t-title">${esc(i.tajuk)}</div>` +
          `<div class="t-period">${esc(i.periode)}</div>` +
          `<div class="t-foot1"><span>Disediakan oleh</span> <b>${esc(i.disediakan)}</b></div>` +
          `<div class="t-foot2"><span>Sumber data</span> ${esc(i.sumber)}</div>` +
          `<div class="t-date"><span>Dijana</span> ${esc(i.tarikh_jana)}</div>`;

      } else if (sl.kind === "section") {
        s.innerHTML =
          `<div class="s-num">${sl.num}</div><div class="s-title">${esc(sl.title)}</div>` +
          `<div class="s-items">` + sl.items.map((t) => `<div class="s-item"><i></i>${esc(t)}</div>`).join("") + "</div>";

      } else {
        page += 1;
        s.innerHTML =
          `<div class="c-eyebrow">${esc(sl.section)}</div>` +
          `<div class="c-title">${esc(sl.title)}</div>` +
          `<div class="c-period">${esc(sl.periode)}</div>` +
          `<div class="c-foot">MyAduan Johor &nbsp;&middot;&nbsp; Laporan Pemantauan Aduan</div>` +
          `<div class="c-page">${page}</div>`;
      }
      mount.appendChild(s);
      if (sl.blocks) sl.blocks.forEach((b) => drawBlock(s, b));
    });
    return page;
  };
})();
