import React from "react";
import "./QualityInsights.css";

/* ── Lucide-style inline SVG icons ─────────────────────────── */
const Icon = ({ d, size = 20, stroke = "currentColor", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d}
  </svg>
);

const icons = {
  shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  smile:    <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></>,
  refresh:  <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
  alert:    <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  image:    <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
  package:  <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  edit:     <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  truck:    <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  check:    <><polyline points="20 6 9 17 4 12"/></>,
  star:     <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  trendUp:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  trendDn:  <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></>,
  award:    <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
};

/* ── Helpers ─────────────────────────────────────────────────── */
function StarRating({ value, max = 5, size = 14 }) {
  return (
    <span className="qi-stars" aria-label={`${value} out of ${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "qi-star" : "qi-star qi-star--empty"}
          style={{ fontSize: size }}>★</span>
      ))}
    </span>
  );
}

function ProgressBar({ pct, color = "blue" }) {
  return (
    <div className="qi-progress-bar">
      <div className={`qi-progress-bar__fill qi-progress-bar__fill--${color}`}
        style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────── */
function KpiCard({ color, icon, value, label, trend, trendDir, sub }) {
  return (
    <div className={`qi-kpi-card qi-kpi-card--${color}`}>
      <div className="qi-kpi-card__glow" />
      <div className="qi-kpi-card__top">
        <div className="qi-kpi-card__icon-wrap">
          <Icon d={icon} size={22} />
        </div>
        <span className={`qi-kpi-card__trend qi-kpi-card__trend--${trendDir}`}>
          <Icon d={trendDir === "up" ? icons.trendUp : trendDir === "down" ? icons.trendDn : null}
            size={12} />
          {trend}
        </span>
      </div>
      <div className="qi-kpi-card__value">{value}</div>
      <div className="qi-kpi-card__label">{label}</div>
      <div className="qi-kpi-card__sub">{sub}</div>
    </div>
  );
}

/* ── Monthly Return Trends (Bar Chart) ───────────────────────── */
const returnData = [
  { m: "Jan", v: 3.1 }, { m: "Feb", v: 2.8 }, { m: "Mar", v: 3.5 },
  { m: "Apr", v: 2.2 }, { m: "May", v: 2.0 }, { m: "Jun", v: 2.1 },
];
const maxReturn = Math.max(...returnData.map(d => d.v));

function ReturnBarChart() {
  return (
    <div>
      <div className="qi-bar-chart-wrap">
        {returnData.map((d, i) => (
          <div key={i} className="qi-bar-col">
            <div className="qi-bar"
              style={{
                height: `${(d.v / maxReturn) * 130}px`,
                background: d.m === "Jun"
                  ? "linear-gradient(180deg,#2962ff,#5b8aff)"
                  : "linear-gradient(180deg,#c7d6ff,#dce8ff)",
                borderRadius: "6px 6px 0 0",
              }}
              title={`${d.m}: ${d.v}%`}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 6 }}>
        {returnData.map((d, i) => (
          <div key={i} className="qi-bar-label">{d.m}</div>
        ))}
      </div>
      <div className="qi-chart-legend" style={{ marginTop: 10 }}>
        <div className="qi-legend-item">
          <div className="qi-legend-dot" style={{ background: "#2962ff" }} />
          Return Rate (%)
        </div>
      </div>
    </div>
  );
}

/* ── Defect Trends (Line Chart as SVG) ───────────────────────── */
const defectData = [12, 10, 14, 9, 7, 8];
const months     = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

function DefectLineChart() {
  const W = 320, H = 120, PAD = { t: 10, r: 10, b: 30, l: 28 };
  const maxD = Math.max(...defectData);
  const pts = defectData.map((v, i) => ({
    x: PAD.l + (i / (defectData.length - 1)) * (W - PAD.l - PAD.r),
    y: PAD.t + (1 - v / maxD) * (H - PAD.t - PAD.b),
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`;

  return (
    <div className="qi-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="qi-chart-svg">
        <defs>
          <linearGradient id="defectGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = PAD.t + t * (H - PAD.t - PAD.b);
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke="#f1f3f6" strokeWidth="1" />
              <text x={PAD.l - 4} y={y + 4} className="qi-chart-axis" textAnchor="end">
                {Math.round(maxD * (1 - t))}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#defectGrad)" />
        <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2.5"
          strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4}
            fill="#fff" stroke="#ef4444" strokeWidth="2.5" />
        ))}
        {months.map((m, i) => (
          <text key={i} x={pts[i].x} y={H - 6} className="qi-chart-axis" textAnchor="middle">
            {m}
          </text>
        ))}
      </svg>
      <div className="qi-chart-legend">
        <div className="qi-legend-item">
          <div className="qi-legend-dot" style={{ background: "#ef4444" }} />
          Defect Reports
        </div>
      </div>
    </div>
  );
}

/* ── Rating Trends (multi-line SVG) ─────────────────────────── */
const ratingData = {
  "5★": [4.5, 4.6, 4.7, 4.7, 4.8, 4.8],
  "Avg": [4.1, 4.2, 4.4, 4.5, 4.7, 4.8],
};
const ratingColors = { "5★": "#2962ff", "Avg": "#10b981" };

function RatingLineChart() {
  const W = 320, H = 120, PAD = { t: 10, r: 10, b: 30, l: 30 };
  const minV = 3.8, maxV = 5;
  const toY = v => PAD.t + (1 - (v - minV) / (maxV - minV)) * (H - PAD.t - PAD.b);
  const toX = i => PAD.l + (i / (months.length - 1)) * (W - PAD.l - PAD.r);

  return (
    <div className="qi-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="qi-chart-svg">
        <defs>
          {Object.entries(ratingColors).map(([k, c]) => (
            <linearGradient key={k} id={`rg_${k}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.12" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.5, 1].map((t, i) => {
          const y = PAD.t + t * (H - PAD.t - PAD.b);
          const v = (maxV - t * (maxV - minV)).toFixed(1);
          return (
            <g key={i}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y}
                stroke="#f1f3f6" strokeWidth="1" />
              <text x={PAD.l - 4} y={y + 4} className="qi-chart-axis" textAnchor="end">{v}</text>
            </g>
          );
        })}
        {Object.entries(ratingData).map(([key, vals]) => {
          const pts = vals.map((v, i) => ({ x: toX(i), y: toY(v) }));
          const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          const area = `${line} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`;
          return (
            <g key={key}>
              <path d={area} fill={`url(#rg_${key})`} />
              <path d={line} fill="none" stroke={ratingColors[key]} strokeWidth="2.5"
                strokeLinejoin="round" strokeLinecap="round" />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3.5}
                  fill="#fff" stroke={ratingColors[key]} strokeWidth="2" />
              ))}
            </g>
          );
        })}
        {months.map((m, i) => (
          <text key={i} x={toX(i)} y={H - 6} className="qi-chart-axis" textAnchor="middle">{m}</text>
        ))}
      </svg>
      <div className="qi-chart-legend">
        {Object.entries(ratingColors).map(([k, c]) => (
          <div key={k} className="qi-legend-item">
            <div className="qi-legend-dot" style={{ background: c }} />
            {k}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Rating Distribution Donut ───────────────────────────────── */
const ratingDist = [
  { stars: "5 Stars", pct: 62, color: "#2962ff" },
  { stars: "4 Stars", pct: 22, color: "#5b8aff" },
  { stars: "3 Stars", pct: 9,  color: "#10b981" },
  { stars: "2 Stars", pct: 4,  color: "#f59e0b" },
  { stars: "1 Star",  pct: 3,  color: "#ef4444" },
];

function DonutChart() {
  const R = 48, CX = 60, CY = 60, STROKE = 14;
  const circum = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="qi-donut-wrap">
      <svg width={120} height={120} className="qi-donut-svg">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f1f3f6" strokeWidth={STROKE} />
        {ratingDist.map((d, i) => {
          const dash = (d.pct / 100) * circum;
          const el = (
            <circle key={i} cx={CX} cy={CY} r={R}
              fill="none" stroke={d.color} strokeWidth={STROKE}
              strokeDasharray={`${dash} ${circum - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text x={CX} y={CY - 6} textAnchor="middle"
          style={{ fontSize: 16, fontWeight: 800, fill: "#0f1117", fontFamily: "Plus Jakarta Sans" }}>
          4.8
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle"
          style={{ fontSize: 10, fill: "#9ca3af", fontFamily: "Plus Jakarta Sans" }}>
          / 5.0
        </text>
      </svg>
      <div className="qi-donut-legend">
        {ratingDist.map((d, i) => (
          <div key={i} className="qi-donut-legend-item">
            <div className="qi-donut-legend-item__left">
              <div className="qi-donut-swatch" style={{ background: d.color }} />
              <span className="qi-donut-legend-item__label">{d.stars}</span>
            </div>
            <span className="qi-donut-legend-item__val">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Top Products Data ────────────────────────────────────────── */
const products = [
  { emoji: "👟", name: "Running Pro X200", sku: "SKU-8821", score: 97, rating: 4.9, returns: "0.8%", status: "excellent" },
  { emoji: "👕", name: "Premium Cotton Tee", sku: "SKU-4412", score: 94, rating: 4.7, returns: "1.2%", status: "good" },
  { emoji: "🎒", name: "Urban Backpack 30L", sku: "SKU-3305", score: 91, rating: 4.6, returns: "1.8%", status: "good" },
  { emoji: "⌚", name: "Smart Watch Series 3", sku: "SKU-7761", score: 88, rating: 4.4, returns: "2.4%", status: "warning" },
  { emoji: "🧢", name: "Classic Cap - Black", sku: "SKU-2290", score: 85, rating: 4.3, returns: "3.1%", status: "warning" },
];

const statusLabel = { excellent: "Excellent", good: "Good", warning: "Review", critical: "Critical" };

/* ── Recommendations Data ────────────────────────────────────── */
const recommendations = [
  {
    icon: icons.image, iconBg: "rgba(41,98,255,0.1)", iconColor: "#2962ff",
    badgeClass: "qi-badge--good", badge: "ℹ High Impact",
    title: "Improve Product Images",
    desc: "Products with 6+ high-quality images see 34% fewer returns. Add lifestyle shots and size-reference photos.",
  },
  {
    icon: icons.package, iconBg: "rgba(245,158,11,0.1)", iconColor: "#f59e0b",
    badgeClass: "qi-badge--warning", badge: "⚠ Medium Priority",
    title: "Enhance Packaging Quality",
    desc: "3 recent defect reports cited damaged packaging. Upgrade protective inner liners for fragile SKUs.",
  },
  {
    icon: icons.refresh, iconBg: "rgba(239,68,68,0.1)", iconColor: "#ef4444",
    badgeClass: "qi-badge--warning", badge: "⚠ Action Needed",
    title: "Reduce Return Reasons",
    desc: "\"Size mismatch\" accounts for 41% of returns. Add a size guide video and detailed measurement chart.",
  },
  {
    icon: icons.edit, iconBg: "rgba(16,185,129,0.1)", iconColor: "#10b981",
    badgeClass: "qi-badge--excellent", badge: "✓ Quick Win",
    title: "Improve Product Descriptions",
    desc: "Listings with bullet-point specs and material callouts get 28% better quality ratings consistently.",
  },
];

/* ── Page Component ───────────────────────────────────────────── */
export default function QualityInsights() {
  return (
    <div className="qi-page">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="qi-header">
        <div className="qi-header__eyebrow">
          <Icon d={icons.award} size={12} />
          Quality Insights
        </div>
        <h1 className="qi-header__title">Quality Insights</h1>
        <p className="qi-header__subtitle">
          Monitor product quality performance and improve customer satisfaction.
        </p>
        <div className="qi-header__meta">
          <span className="qi-header__badge">● All Systems Healthy</span>
          <span className="qi-header__date">Last updated: Jun 25, 2026 · 09:41 AM</span>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="qi-kpi-grid">
        <KpiCard color="blue" icon={icons.shield}
          value="96%" label="Product Quality Score"
          trend="+2.1%" trendDir="up"
          sub="vs 93.9% last month" />
        <KpiCard color="green" icon={icons.smile}
          value="4.8/5" label="Customer Satisfaction"
          trend="+0.2" trendDir="up"
          sub="Based on 1,284 reviews" />
        <KpiCard color="amber" icon={icons.refresh}
          value="2.1%" label="Return Rate"
          trend="-0.4%" trendDir="up"
          sub="Down from 2.5% last month" />
        <KpiCard color="red" icon={icons.alert}
          value="8" label="Defect Reports"
          trend="-3 this week" trendDir="up"
          sub="12 reported last period" />
      </div>

      {/* ── Overview + Customer Ratings ────────────────────────── */}
      <div className="qi-two-col">
        {/* Quality Overview */}
        <div className="qi-card" style={{ marginBottom: 0 }}>
          <h2 className="qi-section-title">
            <Icon d={icons.award} size={16} color="#2962ff" />
            Product Quality Overview
          </h2>
          <div className="qi-overview-grid">
            <div className="qi-metric-block">
              <div className="qi-metric-block__label">Quality Score</div>
              <div className="qi-metric-block__val">96%</div>
              <ProgressBar pct={96} color="blue" />
              <div className="qi-metric-block__pct">96 / 100 pts</div>
            </div>
            <div className="qi-metric-block">
              <div className="qi-metric-block__label">Approval Rate</div>
              <div className="qi-metric-block__val">98.3%</div>
              <ProgressBar pct={98.3} color="green" />
              <div className="qi-metric-block__pct">589 / 599 listings</div>
            </div>
            <div className="qi-metric-block">
              <div className="qi-metric-block__label">Listing Compliance</div>
              <ul className="qi-compliance-list">
                {[
                  { label: "Images", pct: 100, c: "#10b981" },
                  { label: "Description", pct: 96, c: "#2962ff" },
                  { label: "Pricing", pct: 100, c: "#10b981" },
                  { label: "Category Tags", pct: 88, c: "#f59e0b" },
                ].map(it => (
                  <li key={it.label} className="qi-compliance-item">
                    <span className="qi-compliance-item__left">
                      <span className="qi-compliance-dot" style={{ background: it.c }} />
                      {it.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: it.c }}>{it.pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="qi-metric-block">
              <div className="qi-metric-block__label">Packaging Quality</div>
              <div className="qi-metric-block__val">4.6<span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 400 }}>/5</span></div>
              <StarRating value={4.6} size={16} />
              <div style={{ marginTop: 10 }} className="qi-rating-row">
                {[
                  { label: "Durability", v: 90 },
                  { label: "Presentation", v: 82 },
                  { label: "Eco-friendly", v: 74 },
                ].map(r => (
                  <div key={r.label} className="qi-rating-line">
                    <span style={{ minWidth: 88, fontSize: 11, color: "#6b7280" }}>{r.label}</span>
                    <div className="qi-rating-track">
                      <div className="qi-rating-fill" style={{ width: `${r.v}%` }} />
                    </div>
                    <span className="qi-rating-count">{r.v}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Rating Distribution */}
        <div className="qi-card" style={{ marginBottom: 0 }}>
          <h2 className="qi-section-title">
            <Icon d={icons.star} size={16} color="#f59e0b" />
            Customer Rating Distribution
          </h2>
          <DonutChart />
          <div style={{ marginTop: 18 }}>
            <div className="qi-metric-block__label" style={{ marginBottom: 10 }}>Rating Breakdown</div>
            <div className="qi-rating-row">
              {[
                { s: 5, count: 797, pct: 62 },
                { s: 4, count: 283, pct: 22 },
                { s: 3, count: 116, pct: 9 },
                { s: 2, count: 51, pct: 4 },
                { s: 1, count: 37, pct: 3 },
              ].map(r => (
                <div key={r.s} className="qi-rating-line">
                  <span className="qi-rating-line__star">★</span>
                  <span style={{ fontSize: 12, minWidth: 14 }}>{r.s}</span>
                  <div className="qi-rating-track">
                    <div className="qi-rating-fill" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="qi-rating-count">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Performance Charts ─────────────────────────────────── */}
      <div className="qi-three-col">
        <div className="qi-card" style={{ marginBottom: 0 }}>
          <h2 className="qi-section-title">
            <Icon d={icons.refresh} size={15} color="#2962ff" />
            Monthly Return Trends
          </h2>
          <ReturnBarChart />
        </div>
        <div className="qi-card" style={{ marginBottom: 0 }}>
          <h2 className="qi-section-title">
            <Icon d={icons.alert} size={15} color="#ef4444" />
            Product Defect Trends
          </h2>
          <DefectLineChart />
        </div>
        <div className="qi-card" style={{ marginBottom: 0 }}>
          <h2 className="qi-section-title">
            <Icon d={icons.star} size={15} color="#f59e0b" />
            Customer Rating Trends
          </h2>
          <RatingLineChart />
        </div>
      </div>

      {/* ── Top Products Table ──────────────────────────────────── */}
      <div className="qi-card">
        <h2 className="qi-section-title">
          <Icon d={icons.award} size={16} color="#2962ff" />
          Top Quality Products
        </h2>
        <div className="qi-table-wrap">
          <table className="qi-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quality Score</th>
                <th>Customer Rating</th>
                <th>Return Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div className="qi-table__product">
                      <div className="qi-table__product-avatar"
                        style={{ background: "#f5f7ff", fontSize: 20 }}>
                        {p.emoji}
                      </div>
                      <div>
                        <div className="qi-table__product-name">{p.name}</div>
                        <div className="qi-table__product-sku">{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="qi-table__score-bar">
                      <div className="qi-table__score-track">
                        <div className="qi-table__score-fill" style={{ width: `${p.score}%` }} />
                      </div>
                      <span className="qi-table__score-num">{p.score}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <StarRating value={Math.round(p.rating)} size={13} />
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{p.rating}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.returns}</td>
                  <td>
                    <span className={`qi-badge qi-badge--${p.status}`}>
                      {p.status === "excellent" && "✓ "}
                      {p.status === "good" && "● "}
                      {p.status === "warning" && "⚠ "}
                      {statusLabel[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recommendations ────────────────────────────────────── */}
      <div className="qi-card" style={{ marginBottom: 0 }}>
        <h2 className="qi-section-title">
          <Icon d={icons.check} size={16} color="#10b981" />
          Quality Recommendations
        </h2>
        <div className="qi-rec-grid">
          {recommendations.map((r, i) => (
            <div key={i} className="qi-rec-item">
              <div className="qi-rec-item__icon"
                style={{ background: r.iconBg, color: r.iconColor }}>
                <Icon d={r.icon} size={18} stroke={r.iconColor} />
              </div>
              <div>
                <div style={{ marginBottom: 6 }}>
                  <span className={`qi-badge ${r.badgeClass}`}>{r.badge}</span>
                </div>
                <div className="qi-rec-item__title">{r.title}</div>
                <div className="qi-rec-item__desc">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}