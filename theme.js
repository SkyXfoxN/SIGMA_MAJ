/* theme.js — Palet & geometri. Dikongsi oleh penjana HTML dan PPTX. */
window.C = {
  INK: "12293D", SLATE: "234B69", TEAL: "13716E", OCEAN: "3C88A6",
  AMBER: "CE7C2A", CRIMSON: "9E3B3B", MOSS: "5C8A5E",
  MIST: "EFF3F6", MIST2: "E3EAEF", LINE: "D5DEE5",
  TEXT: "1B2A36", MUTED: "6B7F8D", WHITE: "FFFFFF",
  PALE_RED: "F3E3E3", DARK_RED: "8A5A5A", ICE: "9BC7D6",
  INSIGHT_BG: "E7EFF0", INSIGHT_TX: "184C4B",
};

window.SERIES = [C.TEAL, C.OCEAN, C.AMBER, C.SLATE, C.MOSS, C.CRIMSON,
  "8FAEBD", "B99A55", "7FA8A6", "9A7A6B"];

window.AGEING_COLORS = [C.TEAL, C.OCEAN, C.AMBER, C.CRIMSON];

window.F = { HEAD: "Cambria", BODY: "Calibri" };

/* Geometri slaid dalam inci (13.333 x 7.5 landscape) */
window.G = {
  W: 13.333, H: 7.5, M: 0.55, CW: 12.2,
  TOP: 1.25, BOT: 6.85,
  COL: 5.98, COL_X2: 6.87,
  ROW_H: 2.68, ROW_Y2: 4.17,
};

window.hx = (c) => "#" + c;
