// src/pages/Settings/TermsPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  LayoutList,
  Gavel,
  Laptop,
  Check,
  Tag,
  PackageX,
  Headset,
  Scale,
  FileCheck,
  Users,
  Copyright,
  Shield,
  FileText,
  User,
  Building,
  Landmark,
  ArrowRightLeft,
  ArrowDown,
  ChevronDown,
  ChevronLeft,
  FileSignature,
  ClipboardCheck,
  ChevronUp,
  Wallet,
  Gift,
} from "lucide-react";
import "./TermsPage.css";

/* ── Static content data — Haatza Seller T&C (Original) ─────────────── */
const KPI_CARDS = [
  { icon: LayoutList, value: "7", label: "Policy Sections" },
  { icon: ShieldCheck, value: "100%", label: "Compliance Required" },
  { icon: Clock, value: "48 hrs", label: "Complaint Response" },
  { icon: RefreshCw, value: "14 days", label: "Refund Timeline" },
];

const LAWS = [
  {
    icon: Gavel,
    label: "Consumer Protection Act, 2019 & E-Commerce Rules, 2020",
    sub: "Requires transparency on returns, refunds, exchange, shipping, and country of origin.",
  },
  {
    icon: Laptop,
    label: "Information Technology Act, 2000",
    sub: "Governs valid electronic contracts and data protection obligations.",
  },
];

const ELIGIBILITY_ITEMS = [
  { label: "Legally compliant entity", sub: "Company, LLP, or proprietorship" },
  { label: "GST registration", sub: "Valid GSTIN required" },
  { label: "PAN details", sub: "Individual or entity PAN" },
  { label: "Contact details", sub: "Verified and up to date" },
  { label: "Written contract", sub: "Mandatory before listing any goods or services" },
];

const ACCORDIONS = [
  {
    icon: Tag,
    title: "Product & Pricing Transparency",
    points: [
      "Accurately display item descriptions, price breakdowns (including taxes, shipping, handling), disclaimers, warranty, and country of origin",
      "No exaggerated or false claims in listings or ads; no impersonation in reviews",
    ],
  },
  {
    icon: PackageX,
    title: "Returns, Refunds & Delivery",
    points: [
      "Accept returns/refunds for defective, deficient, misdescribed, or late-delivered goods",
      "Clearly state return, exchange, and refund policies, including who bears shipping costs and timelines (refunds processed within 14 days)",
    ],
  },
  {
    icon: Headset,
    title: "Grievance Redressal",
    points: [
      "Appoint a Grievance Officer, whose details must be displayed on the platform",
      "Acknowledge consumer complaints within 48 hours and resolve them within 1 month",
    ],
  },
  {
    icon: Scale,
    title: "Fair Trade Practices",
    points: [
      "Do not engage in unfair trade practices, price manipulation, or discrimination between sellers or goods and services",
      "Avoid attempts to post fake reviews or mislead consumers",
    ],
  },
];

const LIABILITY_ITEMS = [
  { icon: FileCheck, label: "Content responsibility", sub: "Sellers remain responsible for all listing and ad content" },
  { icon: ShieldCheck, label: "Product authenticity", sub: "Sellers are accountable for the authenticity of goods sold" },
  { icon: Users, label: "Third-party liability", sub: "Sellers must indemnify Haatza Seller for violations or disputes" },
  { icon: Copyright, label: "IP compliance", sub: "Copyright and trademarks of third parties must be respected" },
];

const DATA_ITEMS = [
  { icon: Shield, label: "IT Act compliance", sub: "Handle personal and sensitive consumer data per the IT Act and relevant privacy rules" },
  { icon: FileText, label: "Data use disclosure", sub: "Explicitly disclose data use, storage practices, and security measures" },
  { icon: ClipboardCheck, label: "Privacy Policy", sub: "Provide a detailed Privacy Policy mirroring these commitments" },
];

const DISPUTE_FLOW = [
  { icon: User, label: "Seller" },
  { icon: Headset, label: "Haatza Seller Platform" },
  { icon: Building, label: "Consumer Forum" },
  { icon: Check, label: "Resolution", success: true },
];

const FORUMS = [
  { icon: Landmark, label: "District Commission" },
  { icon: Landmark, label: "State Commission" },
  { icon: Landmark, label: "National Commission" },
  { icon: ArrowRightLeft, label: "Alternate Redressal" },
];

const TIMELINE_ITEMS = [
  {
    title: "Periodic Updates",
    body: "Haatza Seller may update these T&C periodically. Sellers will be notified and must comply with the updated terms.",
  },
  {
    title: "Violation Consequences",
    body: "Breach of T&C or applicable laws may result in:",
    badges: [
      { label: "Suspension", tone: "susp" },
      { label: "Termination", tone: "term" },
      { label: "De-listing", tone: "del" },
    ],
  },
];

const SUMMARY_CARDS = [
  { icon: FileCheck, title: "Registration Documentation", req: "Valid business entity, GSTIN, PAN, address, KYC" },
  { icon: FileSignature, title: "Written Agreement", req: "Mandatory seller-platform contract" },
  { icon: ClipboardCheck, title: "Product Info & Transparency", req: "Accurate listing with full price breakdown, origin, etc." },
  { icon: RefreshCw, title: "Returns & Refunds", req: "Policy clarity and compliance with legal timeframes" },
  { icon: Headset, title: "Grievance Mechanism", req: "Officer details and complaint resolution within defined timelines" },
  { icon: Scale, title: "Fair Practices", req: "No deception, unfair pricing, or fake reviews" },
  { icon: Shield, title: "Data & Privacy", req: "Compliance with IT Act standards, clear privacy notice" },
  { icon: Gavel, title: "Dispute Resolution", req: "Use of appropriate consumer forums or platforms" },
];

/* ── Static content data — Referral Program T&C (New) ─────────────── */
const REFERRAL_KPI_CARDS = [
  { icon: LayoutList, value: "7", label: "Policy Sections" },
  { icon: ShieldCheck, value: "100%", label: "Compliance Required" },
  { icon: Clock, value: "₹500", label: "Referral Reward" },
  { icon: RefreshCw, value: "Unlimited", label: "Referrals" },
];

/* ── Static content data — Referral FAQs (New) ───────────────────── */
const FAQ_ITEMS = [
  {
    question: "Share your referral code",
    answer: "Get your unique referral code from the Haatza Seller App and share it with new sellers via WhatsApp, Email, SMS, or any other method."
  },
  {
    question: "New seller signs up",
    answer: "The referred seller must enter your referral code manually during the sign-up process to be eligible for referral benefits."
  },
  {
    question: "New seller purchases subscription",
    answer: "The referral will only be considered valid once the referred seller purchases a paid subscription plan on Haatza."
  },
  {
    question: "Claim your reward",
    answer: "Once the referred seller subscribes, you can manually claim your ₹500 reward in the “Refer & Earn” section of the Haatza Seller App."
  }
];

/* ── Component ────────────────────────────────────────────── */
export default function TermsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openAccordion, setOpenAccordion] = useState(0);

  const isReferral = location.state?.type === "referral";
  const isFaq = location.state?.type === "faq";

  const [activeFaq, setActiveFaq] = useState({
    0: true,
    1: true,
    2: true,
    3: true
  });

  const toggleFaq = (index) => {
    setActiveFaq(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (isFaq) {
    return (
      <div className="terms-page">
        {/* ── Hero ── */}
        <header className="terms-hero">
          <button
            className="terms-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="terms-hero-left">
            <span className="terms-badge">
              <RefreshCw size={13} /> Updated FAQ
            </span>
            <h1>Frequently Asked Questions</h1>
            <p>
              Common questions and answers about the Haatza Seller referral program, rewards, eligibility, and rules.
            </p>
          </div>
          <div className="terms-hero-illo" aria-hidden="true">
            <div className="illo-circle">
              <Gift size={36} />
            </div>
          </div>
        </header>

        {/* FAQs List container */}
        <div className="terms-body">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = activeFaq[index];
            return (
              <div className="accordion" key={index}>
                <button
                  className="acc-header"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span className="acc-title">{faq.question}</span>
                  <ChevronDown
                    size={16}
                    className="acc-chevron"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                <div className={`acc-body ${isOpen ? "open" : ""}`}>
                  <div style={{ padding: "0 20px 18px 20px", fontSize: "13.5px", color: "#4b5563", lineHeight: "1.75" }}>
                    <p style={{ margin: 0 }}>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (isReferral) {
    return (
      <div className="terms-page">
        {/* ── Hero ── */}
        <header className="terms-hero">
          <button
            className="terms-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="terms-hero-left">
            <span className="terms-badge">
              <RefreshCw size={13} /> Updated Policy
            </span>
            <h1>Terms &amp; Conditions</h1>
            <p>
              Referral program terms, eligibility, reward structures, and
              platform guidelines for Refer &amp; Earn on Haatza Seller.
            </p>
          </div>
          <div className="terms-hero-illo" aria-hidden="true">
            <div className="illo-circle">
              <Scale size={36} />
            </div>
          </div>
        </header>

        {/* ── KPI bar ── */}
        <div className="terms-kpi-bar">
          {REFERRAL_KPI_CARDS.map(({ icon: Icon, value, label }) => (
            <div className="kpi-card" key={label}>
              <div className="kpi-icon">
                <Icon size={15} />
              </div>
              <div>
                <div className="kpi-val">{value}</div>
                <div className="kpi-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main content ── */}
        <div className="terms-body">

          {/* 1. Eligibility */}
          <section className="terms-section" id="eligibility">
            <div className="sec-header">
              <span className="sec-num">1</span>
              <h2>Eligibility</h2>
            </div>
            <div className="card">
              <p>
                The referral program is open to all registered sellers on the Haatza Seller platform who have successfully completed their onboarding.
              </p>
            </div>
          </section>

          {/* 2. Referral Process */}
          <section className="terms-section" id="referral-process">
            <div className="sec-header">
              <span className="sec-num">2</span>
              <h2>Referral Process</h2>
            </div>
            <div className="card">
              <p>
                Existing sellers can refer unlimited new sellers by sharing their unique referral code. The referred seller must manually enter this code during sign-up to be eligible for referral benefits.
              </p>
            </div>
          </section>

          {/* 3. Referral Benefits */}
          <section className="terms-section" id="referral-benefits">
            <div className="sec-header">
              <span className="sec-num">3</span>
              <h2>Referral Benefits</h2>
            </div>
            <div className="card">
              <p>
                The referring seller will receive a reward of ₹500 for every new seller they successfully refer who purchases a subscription plan. There is no limit — the more sellers you refer, the more rewards you earn. The referred seller will also receive exclusive onboarding benefits as part of the program.
              </p>
            </div>
          </section>

          {/* 4. Reward Claim */}
          <section className="terms-section" id="reward-claim">
            <div className="sec-header">
              <span className="sec-num">4</span>
              <h2>Reward Claim</h2>
            </div>
            <div className="card">
              <p>
                Referral rewards are not auto-credited. Eligible sellers must claim their reward through the Refer &amp; Earn section. Once claimed, rewards will be processed within 7 business days. Rewards are non-transferable and cannot be exchanged for cash.
              </p>
            </div>
          </section>

          {/* 5. Program Limitations */}
          <section className="terms-section" id="program-limitations">
            <div className="sec-header">
              <span className="sec-num">5</span>
              <h2>Program Limitations</h2>
            </div>
            <div className="card">
              <p>
                There is no limit to how many new sellers you can refer. However, self-referrals or referrals made through fraudulent or invalid means will result in disqualification and forfeiture of any rewards.
              </p>
            </div>
          </section>

          {/* 6. Modification and Termination */}
          <section className="terms-section" id="modification-termination">
            <div className="sec-header">
              <span className="sec-num">6</span>
              <h2>Modification and Termination</h2>
            </div>
            <div className="card">
              <p>
                Haatza Seller reserves the right to modify, suspend, or terminate the referral program at any time without prior notice. Updates will be communicated via the platform.
              </p>
            </div>
          </section>

          {/* 7. Acceptance of Terms */}
          <section className="terms-section" id="acceptance-terms">
            <div className="sec-header">
              <span className="sec-num">7</span>
              <h2>Acceptance of Terms</h2>
            </div>
            <div className="card">
              <p>
                By participating in the referral program, sellers agree to abide by these terms and conditions. Failure to comply may result in disqualification from the program.
              </p>
            </div>
          </section>

          {/* Support Info */}
          <div style={{ marginTop: "24px", color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic", textAlign: "center" }}>
            For questions or assistance regarding the referral program, please contact Haatza Seller Support.
          </div>
        </div>
      </div>
    );
  }

  // Original General terms & conditions layout:
  return (
    <div className="terms-page">
      {/* ── Hero ── */}
      <header className="terms-hero">
        <button
          className="terms-back-btn"
          onClick={() => navigate("/dashboard/settings")}
          aria-label="Back to settings"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="terms-hero-left">
          <span className="terms-badge">
            <RefreshCw size={13} /> Updated Policy
          </span>
          <h1>Terms &amp; Conditions</h1>
          <p>
            Seller policies, compliance requirements, legal obligations, and
            platform guidelines for operating on Haatza Seller.
          </p>
        </div>
        <div className="terms-hero-illo" aria-hidden="true">
          <div className="illo-circle">
            <Scale size={36} />
          </div>
        </div>
      </header>

      {/* ── KPI bar ── */}
      <div className="terms-kpi-bar">
        {KPI_CARDS.map(({ icon: Icon, value, label }) => (
          <div className="kpi-card" key={label}>
            <div className="kpi-icon">
              <Icon size={15} />
            </div>
            <div>
              <div className="kpi-val">{value}</div>
              <div className="kpi-lbl">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="terms-body">

        {/* 1. Introduction */}
        <section className="terms-section" id="introduction">
          <div className="sec-header">
            <span className="sec-num">1</span>
            <h2>Introduction</h2>
          </div>
          <div className="card">
            <p>
              Welcome to <strong>Haatza Seller</strong> (&ldquo;we&rdquo;,
              &ldquo;our&rdquo;, &ldquo;us&rdquo;). These Terms &amp;
              Conditions (&ldquo;T&amp;C&rdquo;) govern your use of our
              platform and sale of goods or services through it. By joining,
              selling, or transacting, you (&ldquo;Seller&rdquo;) agree to
              comply with these T&amp;C along with applicable Indian laws,
              including:
            </p>
            <div className="law-badges-stacked">
              {LAWS.map(({ icon: Icon, label, sub }) => (
                <div className="law-badge-row" key={label}>
                  <span className="law-badge-icon">
                    <Icon size={14} />
                  </span>
                  <div>
                    <div className="law-badge-title">{label}</div>
                    <div className="law-badge-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Eligibility */}
        <section className="terms-section" id="eligibility">
          <div className="sec-header">
            <span className="sec-num">2</span>
            <h2>Eligibility &amp; Registration</h2>
          </div>
          <div className="checklist">
            {ELIGIBILITY_ITEMS.map((item) => (
              <div className="check-card" key={item.label}>
                <div className="check-icon">
                  <Check size={14} />
                </div>
                <div>
                  <div className="check-label">{item.label}</div>
                  <div className="check-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Seller Obligations */}
        <section className="terms-section" id="obligations">
          <div className="sec-header">
            <span className="sec-num">3</span>
            <h2>Seller Obligations</h2>
          </div>
          {ACCORDIONS.map(({ icon: Icon, title, points }, i) => {
            const isOpen = openAccordion === i;
            return (
              <div className="accordion" key={title}>
                <button
                  className="acc-header"
                  onClick={() => setOpenAccordion(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span className="acc-icon">
                    <Icon size={16} />
                  </span>
                  <span className="acc-title">{title}</span>
                  <ChevronDown
                    size={16}
                    className="acc-chevron"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
                <div className={`acc-body ${isOpen ? "open" : ""}`}>
                  <ul className="acc-body-inner">
                    {points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>

        {/* 4. Liability & IP */}
        <section className="terms-section" id="liability">
          <div className="sec-header">
            <span className="sec-num">4</span>
            <h2>Liability &amp; IP</h2>
          </div>
          <div className="card">
            <div className="liability-grid">
              {LIABILITY_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div className="liab-card" key={label}>
                  <div className="liab-icon">
                    <Icon size={15} />
                  </div>
                  <div>
                    <div className="liab-label">{label}</div>
                    <div className="liab-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Data Protection */}
        <section className="terms-section" id="data">
          <div className="sec-header">
            <span className="sec-num">5</span>
            <h2>Data Protection &amp; Privacy</h2>
          </div>
          <div className="card">
            <div className="security-grid">
              {DATA_ITEMS.map(({ icon: Icon, label, sub }) => (
                <div className="sec-card" key={label}>
                  <div className="sec-card-icon">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="liab-label">{label}</div>
                    <div className="liab-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Dispute Resolution */}
        <section className="terms-section" id="disputes">
          <div className="sec-header">
            <span className="sec-num">6</span>
            <h2>Dispute Resolution</h2>
          </div>
          <div className="card">
            <div className="dispute-wrap">
              <div className="dispute-flow">
                {DISPUTE_FLOW.map(({ icon: Icon, label, success }, i) => (
                  <React.Fragment key={label}>
                    <div className={`dispute-node ${success ? "success" : ""}`}>
                      <Icon size={16} /> {label}
                    </div>
                    {i < DISPUTE_FLOW.length - 1 && (
                      <div className="dispute-arrow">
                        <ArrowDown size={18} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="dispute-info">
                <p>
                  Disputes may be resolved via the Consumer Disputes Redressal
                  Commissions or alternate redressal mechanisms. Sellers are
                  encouraged to co-operate with the platform and consumer
                  authorities in these processes.
                </p>
                <div className="forums">
                  {FORUMS.map(({ icon: Icon, label }) => (
                    <span className="forum-badge" key={label}>
                      <Icon size={14} /> {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Amendments */}
        <section className="terms-section" id="amendments">
          <div className="sec-header">
            <span className="sec-num">7</span>
            <h2>Amendments &amp; Termination</h2>
          </div>
          <div className="card">
            <div className="timeline">
              {TIMELINE_ITEMS.map((item) => (
                <div className="tl-item" key={item.title}>
                  <span className="tl-dot" />
                  <div className="tl-title">{item.title}</div>
                  <div className="tl-body">{item.body}</div>
                  {item.badges && (
                    <div className="violation-badges">
                      {item.badges.map((b) => (
                        <span className={`vio-badge vio-${b.tone}`} key={b.label}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Summary */}
        <section className="terms-section" id="summary">
          <div className="sec-header">
            <span className="sec-num">8</span>
            <h2>Summary</h2>
          </div>
          <div className="summary-grid">
            {SUMMARY_CARDS.map(({ icon: Icon, title, req }) => (
              <div className="sum-card" key={title}>
                <div className="sum-status">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="sum-title">{title}</div>
                  <div className="sum-req">{req}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}