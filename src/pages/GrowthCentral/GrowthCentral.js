import React, { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Target,
  ShoppingBag,
  Megaphone,
  Camera,
  PackagePlus,
  Tag,
  Sparkles,
  Award,
  Truck,
  ShieldCheck,
  Star,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
} from "lucide-react";
import "./GrowthCentral.css";

/* ────────────────────────────────────────────────────────────
   STATIC SAMPLE DATA
   ──────────────────────────────────────────────────────────── */

const HERO_STATS = {
  growthScore: 85,
  revenueGrowth: 24,
  ordersGrowth: 18,
};

const GROWTH_CARDS = [
  {
    key: "sales",
    label: "Sales Growth",
    metric: "₹4.82L",
    sub: "this month",
    growth: 24,
    icon: TrendingUp,
    trend: [12, 18, 14, 22, 28, 24, 32, 38],
  },
  {
    key: "customers",
    label: "Customer Growth",
    metric: "1,284",
    sub: "active buyers",
    growth: 16,
    icon: Users,
    trend: [20, 22, 19, 25, 27, 24, 30, 34],
  },
  {
    key: "visibility",
    label: "Product Visibility",
    metric: "58.3K",
    sub: "impressions",
    growth: 31,
    icon: Eye,
    trend: [10, 16, 15, 20, 26, 30, 29, 36],
  },
  {
    key: "conversion",
    label: "Conversion Rate",
    metric: "4.6%",
    sub: "store average",
    growth: 9,
    icon: Target,
    trend: [4, 4.2, 3.9, 4.3, 4.1, 4.4, 4.5, 4.6],
  },
];

const OPPORTUNITIES = [
  {
    key: "ads",
    title: "Run Sponsored Ads",
    desc: "Boost visibility on top search results and reach more buyers actively shopping.",
    impact: "High impact",
    icon: Megaphone,
    cta: "Create Campaign",
  },
  {
    key: "influencer",
    title: "Join Influencer Campaigns",
    desc: "Partner with creators on HaatzUp to showcase your products to a wider audience.",
    impact: "High impact",
    icon: Camera,
    cta: "Explore Campaigns",
  },
  {
    key: "listings",
    title: "Improve Product Listings",
    desc: "Add better images, titles and descriptions to increase click-through rate.",
    impact: "Medium impact",
    icon: Sparkles,
    cta: "Edit Listings",
  },
  {
    key: "inventory",
    title: "Add More Inventory",
    desc: "Low stock on best-sellers can cost you sales. Restock to stay buyer-ready.",
    impact: "Medium impact",
    icon: PackagePlus,
    cta: "Manage Inventory",
  },
  {
    key: "seasonal",
    title: "Seasonal Promotions",
    desc: "Launch limited-time offers timed with upcoming festive and seasonal demand.",
    impact: "High impact",
    icon: Tag,
    cta: "Plan Promotion",
  },
];

const REVENUE_TREND = [38, 42, 40, 48, 52, 49, 58, 62, 60, 68, 72, 78];
const ORDERS_TREND = [120, 132, 128, 145, 150, 142, 160, 172, 168, 180, 190, 205];
const TRAFFIC_TREND = [22, 26, 24, 30, 35, 33, 40, 46, 44, 52, 58, 64];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ACHIEVEMENTS = [
  {
    key: "orders100",
    title: "100 Orders Completed",
    desc: "You've successfully fulfilled over 100 orders.",
    icon: ShoppingBag,
    tone: "blue",
  },
  {
    key: "toprated",
    title: "Top Rated Seller",
    desc: "Maintained an average rating above 4.5 stars.",
    icon: Star,
    tone: "gold",
  },
  {
    key: "fastship",
    title: "Fast Shipping Badge",
    desc: "Consistently shipped orders within 24 hours.",
    icon: Truck,
    tone: "green",
  },
  {
    key: "quality",
    title: "Quality Excellence Badge",
    desc: "Low return rate with consistently high product quality.",
    icon: ShieldCheck,
    tone: "purple",
  },
];

const RECOMMENDED_ACTIONS = [
  {
    key: "add-products",
    title: "Add 10 more products",
    desc: "Sellers with larger catalogs see up to 2x more impressions.",
    icon: PackagePlus,
  },
  {
    key: "descriptions",
    title: "Improve product descriptions",
    desc: "Clear, detailed descriptions improve conversion rate.",
    icon: Sparkles,
  },
  {
    key: "campaigns",
    title: "Participate in upcoming campaigns",
    desc: "Seasonal campaigns are launching soon — get featured early.",
    icon: Megaphone,
  },
  {
    key: "delivery",
    title: "Enable faster delivery options",
    desc: "Faster delivery options increase buyer trust and repeat orders.",
    icon: Truck,
  },
];

/* ────────────────────────────────────────────────────────────
   SMALL CHART HELPERS (pure SVG, no chart library dependency)
   ──────────────────────────────────────────────────────────── */

function buildSparklinePath(values, width, height, padding = 4) {
  if (!values.length) return { line: "", area: "" };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + (height - padding * 2) * (1 - (v - min) / range);
    return [x, y];
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(2)},${height - padding} L${points[0][0].toFixed(2)},${height - padding} Z`;

  return { line, area, points };
}

function MiniTrendChart({ values, positive = true, height = 44, width = 120 }) {
  const { line, area } = useMemo(() => buildSparklinePath(values, width, height), [values, width, height]);
  const gradientId = useMemo(() => `mini-grad-${Math.random().toString(36).slice(2)}`, []);
  const color = positive ? "#2962ff" : "#ef4444";

  return (
    <svg className="mini-trend" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendAreaChart({ values, labels, color = "#2962ff", height = 220, suffix = "" }) {
  const width = 600;
  const padding = 28;
  const { points } = useMemo(() => buildSparklinePath(values, width, height, padding), [values, width, height, padding]);
  const [hoverIdx, setHoverIdx] = useState(null);
  const gradId = useMemo(() => `area-grad-${Math.random().toString(36).slice(2)}`, []);

  if (!points) return null;

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ");
  const areaD = `${lineD} L${points[points.length - 1][0].toFixed(2)},${height - padding} L${points[0][0].toFixed(2)},${height - padding} Z`;

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="trend-chart__svg"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.30" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={padding}
            x2={width - padding}
            y1={padding + (height - padding * 2) * f}
            y2={padding + (height - padding * 2) * f}
            className="trend-chart__grid"
          />
        ))}

        <path d={areaD} fill={`url(#${gradId})`} stroke="none" />
        <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p[0] - (width / points.length) / 2}
              y={0}
              width={width / points.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
            {hoverIdx === i && (
              <>
                <line x1={p[0]} x2={p[0]} y1={padding} y2={height - padding} className="trend-chart__hover-line" />
                <circle cx={p[0]} cy={p[1]} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
              </>
            )}
          </g>
        ))}
      </svg>

      {hoverIdx !== null && (
        <div
          className="trend-chart__tooltip"
          style={{ left: `${(points[hoverIdx][0] / width) * 100}%` }}
        >
          <span className="trend-chart__tooltip-label">{labels[hoverIdx]}</span>
          <span className="trend-chart__tooltip-value">
            {suffix === "₹" ? `₹${(values[hoverIdx] * 1000).toLocaleString("en-IN")}` : `${values[hoverIdx]}${suffix}`}
          </span>
        </div>
      )}

      <div className="trend-chart__axis">
        {labels.map((l, i) => (
          <span key={l} className={i % 2 === 0 ? "" : "trend-chart__axis-dim"}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function RadialScore({ value = 0, size = 132, stroke = 12 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="radial-score" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="radial-score__bar"
        />
      </svg>
      <div className="radial-score__label">
        <span className="radial-score__value">{value}</span>
        <span className="radial-score__max">/100</span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   PAGE
   ──────────────────────────────────────────────────────────── */

function GrowthCentral() {
  return (
    <div className="growth-page">
      {/* ── Page Header ──────────────────────────────────── */}
      <div className="growth-page__header">
        <div>
          <h1 className="growth-page__title">Growth Central</h1>
          <p className="growth-page__subtitle">
            Discover opportunities to grow your business and increase sales.
          </p>
        </div>
      </div>

      {/* ── Hero Banner ──────────────────────────────────── */}
      <section className="growth-hero">
        <div className="growth-hero__glow growth-hero__glow--a" />
        <div className="growth-hero__glow growth-hero__glow--b" />

        <div className="growth-hero__score">
          <RadialScore value={HERO_STATS.growthScore} />
          <div className="growth-hero__score-text">
            <span className="growth-hero__score-label">Growth Score</span>
            <span className="growth-hero__score-caption">Your store is performing well this month</span>
          </div>
        </div>

        <div className="growth-hero__stats">
          <div className="growth-hero__stat">
            <span className="growth-hero__stat-label">
              <TrendingUp size={16} /> Monthly Revenue Growth
            </span>
            <span className="growth-hero__stat-value">+{HERO_STATS.revenueGrowth}%</span>
          </div>
          <div className="growth-hero__stat">
            <span className="growth-hero__stat-label">
              <ShoppingBag size={16} /> Orders Growth
            </span>
            <span className="growth-hero__stat-value">+{HERO_STATS.ordersGrowth}%</span>
          </div>
        </div>

        <button className="growth-hero__cta" type="button">
          View Growth Report
          <ArrowUpRight size={18} />
        </button>
      </section>

      {/* ── Growth KPI Cards ─────────────────────────────── */}
      <section className="growth-cards">
        {GROWTH_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div className="growth-card" key={card.key}>
              <div className="growth-card__top">
                <span className="growth-card__icon">
                  <Icon size={20} />
                </span>
                <span className="growth-card__badge">
                  <TrendingUp size={13} />
                  {card.growth}%
                </span>
              </div>
              <p className="growth-card__metric">{card.metric}</p>
              <p className="growth-card__label">
                {card.label} <span className="growth-card__sub">· {card.sub}</span>
              </p>
              <MiniTrendChart values={card.trend} />
            </div>
          );
        })}
      </section>

      {/* ── Growth Opportunities ─────────────────────────── */}
      <section className="growth-section">
        <div className="growth-section__heading">
          <h2>Growth Opportunities</h2>
          <p>Targeted actions that can move the needle on your store's performance.</p>
        </div>

        <div className="opportunity-grid">
          {OPPORTUNITIES.map((op) => {
            const Icon = op.icon;
            return (
              <div className="opportunity-card" key={op.key}>
                <div className="opportunity-card__icon">
                  <Icon size={22} />
                </div>
                <span
                  className={`opportunity-card__impact ${
                    op.impact === "High impact" ? "opportunity-card__impact--high" : ""
                  }`}
                >
                  {op.impact}
                </span>
                <h3 className="opportunity-card__title">{op.title}</h3>
                <p className="opportunity-card__desc">{op.desc}</p>
                <button className="opportunity-card__cta" type="button">
                  {op.cta}
                  <ChevronRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Revenue Analytics ────────────────────────────── */}
      <section className="growth-section">
        <div className="growth-section__heading">
          <h2>Revenue Analytics</h2>
          <p>Track how your revenue, orders and traffic have evolved this year.</p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card analytics-card--wide">
            <div className="analytics-card__head">
              <span className="analytics-card__icon analytics-card__icon--blue">
                <LineChartIcon size={18} />
              </span>
              <div>
                <h3>Revenue Trend</h3>
                <p>Last 12 months, in ₹ thousands</p>
              </div>
            </div>
            <TrendAreaChart values={REVENUE_TREND} labels={MONTH_LABELS} color="#2962ff" suffix="₹" />
          </div>

          <div className="analytics-card">
            <div className="analytics-card__head">
              <span className="analytics-card__icon analytics-card__icon--green">
                <BarChart3 size={18} />
              </span>
              <div>
                <h3>Orders Trend</h3>
                <p>Last 12 months</p>
              </div>
            </div>
            <TrendAreaChart values={ORDERS_TREND} labels={MONTH_LABELS} color="#16a34a" />
          </div>

          <div className="analytics-card">
            <div className="analytics-card__head">
              <span className="analytics-card__icon analytics-card__icon--purple">
                <Activity size={18} />
              </span>
              <div>
                <h3>Traffic Growth</h3>
                <p>Visitors, last 12 months (K)</p>
              </div>
            </div>
            <TrendAreaChart values={TRAFFIC_TREND} labels={MONTH_LABELS} color="#9333ea" />
          </div>
        </div>
      </section>

      {/* ── Achievements & Milestones ────────────────────── */}
      <section className="growth-section">
        <div className="growth-section__heading">
          <h2>Achievements &amp; Milestones</h2>
          <p>Badges you've earned for great performance as a seller.</p>
        </div>

        <div className="achievement-grid">
          {ACHIEVEMENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div className={`achievement-card achievement-card--${a.tone}`} key={a.key}>
                <div className="achievement-card__icon">
                  <Icon size={24} />
                </div>
                <h3 className="achievement-card__title">{a.title}</h3>
                <p className="achievement-card__desc">{a.desc}</p>
                <span className="achievement-card__check">
                  <Award size={14} /> Earned
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Recommended Actions ──────────────────────────── */}
      <section className="growth-section growth-section--last">
        <div className="growth-section__heading">
          <h2>Recommended Actions</h2>
          <p>Quick wins our system suggests based on your store's current data.</p>
        </div>

        <div className="recommend-panel">
          {RECOMMENDED_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <div className="recommend-row" key={action.key}>
                <div className="recommend-row__icon">
                  <Icon size={18} />
                </div>
                <div className="recommend-row__text">
                  <h4>{action.title}</h4>
                  <p>{action.desc}</p>
                </div>
                <button className="recommend-row__cta" type="button">
                  Take Action
                  <ChevronRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default GrowthCentral;