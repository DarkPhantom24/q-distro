"use client";

import React, { useState } from "react";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const fmtShort = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)}jt`
    : `${(n / 1_000).toFixed(0)}rb`;

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

interface ChartItem {
  bulan: string;
  omset: number;
  laba: number;
}

/* Catmull-Rom smooth path */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/* ─────────────────────────────────────────
   KOMPONEN UTAMA
───────────────────────────────────────── */
export default function Chart3DRed({ data }: { data: ChartItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  /* ── Canvas ── */
  const W      = 580;
  const H      = 300;

  /* ── Plot area ── */
  const PL = 50;   // padding left  (untuk Y-label)
  const PR = 10;   // padding right
  const PT = 28;   // padding top
  const PB = 42;   // padding bottom (untuk bulan label)

  const PW = W - PL - PR;
  const PH = H - PT - PB;

  /* ── 3D isometrik offset ── */
  const ISO_X = 10;   // lebar face samping (sumbu X isometrik)
  const ISO_Y = 5;    // tinggi face atas   (sumbu Y isometrik)

  const n      = data.length;
  const maxVal = Math.max(...data.map(d => d.omset)) * 1.12;

  /* Slot & bar width */
  const SLOT  = PW / n;
  const BAR_W = Math.min(SLOT * 0.55, 52);

  /* ── Kalkulasi geometri tiap bar ── */
  const bars = data.map((d, i) => {
    const cx   = PL + SLOT * i + SLOT / 2;
    const pct  = d.omset / maxVal;
    const bh   = Math.max(8, pct * PH);         // tinggi bar (2D front face)
    const bx   = cx - BAR_W / 2;                // kiri bawah front face
    const by   = PT + PH - bh;                  // atas front face

    /* 8 sudut isometrik ──────────────────────
       Front face  : fl (kiri atas), fr (kanan atas), br (kanan bawah), bl (kiri bawah)
       Top face    : tfl, tfr, tbr, tbl
       Right face  : rfr, rbl (sudut ekstra)
    ───────────────────────────────────────── */
    // Front
    const fl = { x: bx,           y: by          };
    const fr = { x: bx + BAR_W,   y: by          };
    const br = { x: bx + BAR_W,   y: by + bh     };
    const bl = { x: bx,           y: by + bh     };

    // Top face (shift ISO ke kanan-atas)
    const tfl = { x: fl.x + ISO_X, y: fl.y - ISO_Y };
    const tfr = { x: fr.x + ISO_X, y: fr.y - ISO_Y };
    const tbr = { x: br.x + ISO_X, y: br.y - ISO_Y }; // tidak dipakai untuk top
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tbl = { x: bl.x + ISO_X, y: bl.y - ISO_Y }; // tidak dipakai untuk top

    // Right face sudut
    const rfTR = { x: fr.x + ISO_X, y: fr.y - ISO_Y };
    const rfBR = { x: br.x + ISO_X, y: br.y - ISO_Y };

    return {
      ...d, i, cx, bx, by, bh, pct,
      fl, fr, br, bl,
      tfl, tfr,
      rfTR, rfBR,
    };
  });

  /* ── Line chart laba — anchor di tengah top face ── */
  const linePts = bars.map(b => ({
    x: b.cx + ISO_X / 2,
    y: (b.tfl.y + b.tfr.y) / 2 - Math.max(2, (b.laba / maxVal) * PH - b.bh) - 6,
  }));

  /* Lebih sederhana: laba langsung dipetakan ke Y plot biasa, top center bar */
  const labaPts = bars.map(b => ({
    x: b.cx,
    y: PT + PH - Math.max(4, (b.laba / maxVal) * PH),
  }));

  const labaLine = smoothPath(labaPts);
  const labaArea = `${labaLine} L ${labaPts[n - 1].x} ${PT + PH} L ${labaPts[0].x} ${PT + PH} Z`;

  /* ── Y-axis ticks ── */
  const YTICKS = [0.25, 0.5, 0.75, 1.0];

  /* ── Warna per state ── */
  const COL = {
    front:      "#D62828",
    frontHov:   "#ef4444",
    top:        "#b91c1c",
    topHov:     "#dc2626",
    right:      "#7f1d1d",
    rightHov:   "#991b1b",
    laba:       "#f97316",
    labaArea:   "#f9731620",
  };

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 300, overflow: "visible" }}
      >
        <defs>

          {/* ── Gradien front face (atas terang → bawah gelap) ── */}
          {bars.map((b, i) => {
            const isHov = hovered === i;
            return (
              <linearGradient key={`gf${i}`} id={`gf${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={isHov ? "#f87171" : "#ef4444"} />
                <stop offset="100%" stopColor={isHov ? "#D62828" : "#991b1b"} />
              </linearGradient>
            );
          })}

          {/* ── Gradien top face ── */}
          {bars.map((b, i) => {
            const isHov = hovered === i;
            return (
              <linearGradient key={`gt${i}`} id={`gt${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={isHov ? "#fca5a5" : "#ef4444"} />
                <stop offset="100%" stopColor={isHov ? "#ef4444" : "#b91c1c"} />
              </linearGradient>
            );
          })}

          {/* ── Gradien right face ── */}
          <linearGradient id="grRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          {/* ── Area laba ── */}
          <linearGradient id="labaAreaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>

          {/* ── Glow merah untuk bar hover ── */}
          <filter id="barGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Glow oranye untuk garis laba ── */}
          <filter id="labaGlow" x="-5%" y="-60%" width="110%" height="220%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* ── Bayangan lantai bar ── */}
          <filter id="floorShadow" x="-20%" y="-20%" width="140%" height="200%">
            <feDropShadow dx="2" dy="6" stdDeviation="4"
              floodColor="#D62828" floodOpacity="0.28" />
          </filter>

          {/* Clip plot */}
          <clipPath id="clip">
            <rect x={PL} y={PT - 4} width={PW + ISO_X + 2} height={PH + 8} />
          </clipPath>

          {/* Shimmer strip kiri front face */}
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0.22" />
            <stop offset="35%"  stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

        </defs>

        {/* ══════════════════════════════════════
            BACKGROUND PLOT
        ══════════════════════════════════════ */}
        <rect
          x={PL} y={PT}
          width={PW} height={PH}
          fill="url(#plotBg)" rx={6}
          stroke="#f0f0f0" strokeWidth={1}
        />
        <defs>
          <linearGradient id="plotBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fafafa" />
            <stop offset="100%" stopColor="#f5f5f5" />
          </linearGradient>
        </defs>

        {/* ══════════════════════════════════════
            Y-AXIS GRID + LABELS
        ══════════════════════════════════════ */}
        {YTICKS.map((v, i) => {
          const gy = PT + PH - v * PH;
          return (
            <g key={i}>
              <line
                x1={PL} y1={gy}
                x2={PL + PW} y2={gy}
                stroke={v === 1 ? "#e5e7eb" : "#eeeeee"}
                strokeWidth={1}
                strokeDasharray={v === 1 ? undefined : "4 3"}
              />
              <text
                x={PL - 7} y={gy + 3.5}
                textAnchor="end" fontSize={7.5}
                fill="#aaaaaa" fontWeight="500"
              >
                {fmtShort(maxVal * v)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <line
          x1={PL} y1={PT + PH}
          x2={PL + PW} y2={PT + PH}
          stroke="#d1d5db" strokeWidth={1.5}
        />

        {/* ══════════════════════════════════════
            HOVER VERTICAL GUIDE
        ══════════════════════════════════════ */}
        {hovered !== null && (
          <line
            x1={bars[hovered].cx} y1={PT}
            x2={bars[hovered].cx} y2={PT + PH}
            stroke="#D62828"
            strokeWidth={1}
            strokeOpacity={0.35}
            strokeDasharray="3 3"
          />
        )}

        {/* ══════════════════════════════════════
            LABA AREA + LINE (render dulu agar
            bar tampil di atas area)
        ══════════════════════════════════════ */}
        <path
          d={labaArea}
          fill="url(#labaAreaG)"
          clipPath="url(#clip)"
        />
        <path
          d={labaLine}
          fill="none"
          stroke={COL.laba}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#labaGlow)"
          clipPath="url(#clip)"
        />

        {/* ══════════════════════════════════════
            3D BARS
        ══════════════════════════════════════ */}
        {bars.map((b) => {
          const isHov = hovered === b.i;

          /* Koordinat polygon */
          // Front face: 4 sudut (kiri-atas, kanan-atas, kanan-bawah, kiri-bawah)
          const frontPts = `${b.fl.x},${b.fl.y} ${b.fr.x},${b.fr.y} ${b.br.x},${b.br.y} ${b.bl.x},${b.bl.y}`;

          // Top face: front-atas-kiri, front-atas-kanan, iso-atas-kanan, iso-atas-kiri
          const topPts = `${b.fl.x},${b.fl.y} ${b.fr.x},${b.fr.y} ${b.tfr.x},${b.tfr.y} ${b.tfl.x},${b.tfl.y}`;

          // Right face: front-atas-kanan, iso-atas-kanan, iso-bawah-kanan, front-bawah-kanan
          const rightPts = `${b.fr.x},${b.fr.y} ${b.rfTR.x},${b.rfTR.y} ${b.rfBR.x},${b.rfBR.y} ${b.br.x},${b.br.y}`;

          return (
            <g
              key={b.i}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(b.i)}
              onMouseLeave={() => setHovered(null)}
              filter={isHov ? "url(#barGlow)" : undefined}
            >
              {/* Lantai/bayangan elips */}
              {isHov && (
                <ellipse
                  cx={b.cx + ISO_X / 2}
                  cy={PT + PH + 3}
                  rx={BAR_W * 0.6}
                  ry={4}
                  fill="#D62828"
                  fillOpacity={0.18}
                />
              )}

              {/* Right face — paling gelap */}
              <polygon
                points={rightPts}
                fill="url(#grRight)"
                opacity={isHov ? 1 : 0.9}
              />

              {/* Front face — gradien vertikal */}
              <polygon
                points={frontPts}
                fill={`url(#gf${b.i})`}
              />

              {/* Shimmer kiri pada front face */}
              <polygon
                points={`${b.fl.x},${b.fl.y} ${b.fl.x + BAR_W * 0.38},${b.fl.y} ${b.fl.x + BAR_W * 0.38},${b.bl.y} ${b.bl.x},${b.bl.y}`}
                fill="url(#shine)"
              />

              {/* Top face — paling terang */}
              <polygon
                points={topPts}
                fill={`url(#gt${b.i})`}
                opacity={isHov ? 1 : 0.95}
              />

              {/* Garis tepi top face agar terlihat tajam */}
              <polygon
                points={topPts}
                fill="none"
                stroke="white"
                strokeWidth={isHov ? 0.8 : 0.5}
                strokeOpacity={0.4}
              />

              {/* Label nilai omset di atas bar */}
              <text
                x={b.tfl.x + (b.tfr.x - b.tfl.x) / 2}
                y={b.tfl.y - 6}
                textAnchor="middle"
                fontSize={isHov ? 9.5 : 8}
                fill={isHov ? "#D62828" : "#888"}
                fontWeight={isHov ? "800" : "600"}
              >
                {fmtShort(b.omset)}
              </text>

              {/* Label bulan */}
              <text
                x={b.cx}
                y={PT + PH + 18}
                textAnchor="middle"
                fontSize={9.5}
                fill={isHov ? "#D62828" : "#6b7280"}
                fontWeight={isHov ? "800" : "500"}
              >
                {b.bulan}
              </text>
            </g>
          );
        })}

        {/* ══════════════════════════════════════
            DOTS LABA
        ══════════════════════════════════════ */}
        {labaPts.map((p, i) => {
          const isHov = hovered === i;
          return (
            <g key={i}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && (
                <circle cx={p.x} cy={p.y} r={10}
                  fill={COL.laba} fillOpacity={0.15}
                />
              )}
              <circle
                cx={p.x} cy={p.y}
                r={isHov ? 5.5 : 4}
                fill="white"
                stroke={COL.laba}
                strokeWidth={isHov ? 2.4 : 1.8}
              />
              {isHov && (
                <circle cx={p.x} cy={p.y} r={2.2}
                  fill={COL.laba}
                />
              )}
            </g>
          );
        })}

        {/* ══════════════════════════════════════
            TOOLTIP
        ══════════════════════════════════════ */}
        {hovered !== null && (() => {
          const b  = bars[hovered];
          const lp = labaPts[hovered];
          const TW = 148, TH = 72, TR = 10;
          const rawX = b.cx - TW / 2;
          const tx = Math.max(PL, Math.min(rawX, PL + PW - TW));
          const refY = Math.min(b.by, lp.y);
          const ty = refY - TH - 14 < PT ? refY + 12 : refY - TH - 14;

          return (
            <g style={{ pointerEvents: "none" }}>
              {/* Shadow */}
              <rect x={tx + 2} y={ty + 3}
                width={TW} height={TH} rx={TR}
                fill="black" fillOpacity={0.14}
              />
              {/* Box */}
              <rect x={tx} y={ty}
                width={TW} height={TH} rx={TR}
                fill="#0f172a" fillOpacity={0.97}
                stroke="#1e293b" strokeWidth={1}
              />
              {/* Accent garis kiri merah */}
              <rect x={tx} y={ty + 12}
                width={3} height={TH - 24} rx={1.5}
                fill="#D62828"
              />
              {/* Judul bulan */}
              <text x={tx + 14} y={ty + 19}
                fontSize={10} fill="white" fontWeight="800">
                {b.bulan}
              </text>
              {/* Divider */}
              <line x1={tx + 12} y1={ty + 24}
                x2={tx + TW - 12} y2={ty + 24}
                stroke="#334155" strokeWidth={0.7}
              />
              {/* Omset row */}
              <rect x={tx + 12} y={ty + 30}
                width={7} height={7} rx={1.5}
                fill="#D62828"
              />
              <text x={tx + 24} y={ty + 37.5}
                fontSize={8.5} fill="#94a3b8">Omset</text>
              <text x={tx + TW - 12} y={ty + 37.5}
                textAnchor="end" fontSize={8.5}
                fill="white" fontWeight="700">
                {fmtShort(b.omset)}
              </text>
              {/* Laba row */}
              <circle cx={tx + 15.5} cy={ty + 51.5}
                r={3.5} fill={COL.laba}
              />
              <text x={tx + 24} y={ty + 55}
                fontSize={8.5} fill="#94a3b8">Laba</text>
              <text x={tx + TW - 12} y={ty + 55}
                textAnchor="end" fontSize={8.5}
                fill="white" fontWeight="700">
                {fmtShort(b.laba)}
              </text>
            </g>
          );
        })()}

      </svg>

      {/* ── Legend ── */}
      <div className="mt-2 flex items-center justify-center gap-6 text-[11px] text-gray-500">
        <span className="flex items-center gap-2">
          <span className="inline-flex items-end gap-0.5">
            <span className="inline-block w-2.5 h-3.5 rounded-sm bg-gradient-to-b from-[#ef4444] to-[#991b1b]" style={{ transform: "skewX(-4deg)" }} />
            <span className="inline-block w-2.5 h-5 rounded-sm bg-gradient-to-b from-[#ef4444] to-[#991b1b]" style={{ transform: "skewX(-4deg)" }} />
            <span className="inline-block w-2.5 h-3 rounded-sm bg-gradient-to-b from-[#ef4444] to-[#991b1b]" style={{ transform: "skewX(-4deg)" }} />
          </span>
          Omset
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-5 rounded" style={{ background: COL.laba }} />
          <span className="inline-block h-2.5 w-2.5 -ml-1.5 rounded-full border-2 bg-white" style={{ borderColor: COL.laba }} />
          Laba
        </span>
      </div>
    </div>
  );
}
