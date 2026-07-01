// src/components/common/TermsOfUsePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./TermsOfUsePage.css";

const CloseX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const FileText = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const Mail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const MapPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const TERMS_SECTIONS = [
  {
    n: "01",
    title: "Acceptance of Terms",
    body: "By using this platform, you agree to these Terms. If you do not agree, please do not use the platform.",
  },
  {
    n: "02",
    title: "Definitions",
    body: '"Platform" means the Haatza Seller app and website. "Seller" means any registered user selling through Haatza. "We"/"Us"/"Haatza" refers to Haatza India Private Limited.',
  },
  {
    n: "03",
    title: "Eligibility",
    body: "You must be 18+ years old and legally authorized to conduct business in India to register.",
  },
  {
    n: "04",
    title: "Seller Registration",
    body: "You must provide accurate business info including name, email, GSTIN (if applicable), and bank details.",
  },
  {
    n: "05",
    title: "Seller Responsibilities",
    body: "List genuine products, fulfill orders promptly, maintain stock, update pricing, and avoid prohibited items.",
  },
  {
    n: "06",
    title: "Product Listings",
    body: "Ensure accuracy of product details. We may remove listings that violate laws or our policies.",
  },
  {
    n: "07",
    title: "Fees and Commissions",
    body: "No joining fees. A commission is deducted from each successful sale, visible in your dashboard.",
  },
  {
    n: "08",
    title: "Payments & Settlements",
    body: "Earnings are settled to your bank after deductions. We may hold payments for suspicious activities.",
  },
  {
    n: "09",
    title: "Returns & Refunds",
    body: "Returns must be handled as per our return policy. Excessive issues may lead to penalties or suspension.",
  },
  {
    n: "10",
    title: "Intellectual Property",
    body: "You own your content but grant us the right to use it for listing and marketing. Don't upload others' IP.",
  },
  {
    n: "11",
    title: "Platform Usage Restrictions",
    body: "You may not misuse the platform, commit fraud, or reverse-engineer our systems.",
  },
  {
    n: "12",
    title: "Suspension & Termination",
    body: "Accounts may be suspended or terminated for violations, fraud, or legal issues.",
  },
  {
    n: "13",
    title: "Limitation of Liability",
    body: "We are not liable for business loss, delays, or third-party actions.",
  },
  {
    n: "14",
    title: "Privacy & Data Protection",
    body: "Data is protected as per our Privacy Policy. Shared only with service providers or authorities if required.",
  },
  {
    n: "15",
    title: "Modifications",
    body: "We may update these Terms. Continued use means you accept the changes.",
  },
  {
    n: "16",
    title: "Governing Law & Jurisdiction",
    body: "These Terms are governed by Indian law. Disputes fall under Bengaluru jurisdiction.",
  },
];

function TermsOfUsePage() {
  const navigate = useNavigate();

  // ─── Smart close: go back in history if possible, else fall back ───────
  // Works whether opened from /signin, /signup, or /dashboard/settings.
  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/signin");
    }
  };

  return (
    <div className="tou-root">

      {/* Close */}
      <button className="tou-close-fab" onClick={handleClose} aria-label="Close">
        <CloseX />
      </button>

      {/* Hero */}
      <div className="tou-hero">
        <div className="tou-hero-inner">
          <div className="tou-hero-badge"><FileText /><span>Legal Agreement</span></div>
          <h1 className="tou-hero-title">Terms &amp; Conditions for Haatza Seller</h1>
          <p className="tou-hero-subtitle">
            By registering or using the Haatza Seller platform, you agree to be legally bound by these Terms and Conditions.
          </p>
        </div>
        <div className="tou-hero-art">
          <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="100" cy="160" rx="65" ry="12" fill="#ffffff" fillOpacity="0.08"/>
            <rect x="55" y="20" width="90" height="120" rx="8" fill="url(#tg)"/>
            <rect x="67" y="38" width="66" height="6" rx="3" fill="white" fillOpacity="0.5"/>
            <rect x="67" y="54" width="66" height="6" rx="3" fill="white" fillOpacity="0.35"/>
            <rect x="67" y="70" width="46" height="6" rx="3" fill="white" fillOpacity="0.35"/>
            <rect x="67" y="92" width="66" height="6" rx="3" fill="white" fillOpacity="0.35"/>
            <rect x="67" y="108" width="46" height="6" rx="3" fill="white" fillOpacity="0.35"/>
            <circle cx="148" cy="34" r="12" fill="#4CAF50" fillOpacity="0.9"/>
            <path d="M143 34 L147 38 L154 30" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="tg" x1="55" y1="20" x2="145" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgba(255,255,255,0.35)"/>
                <stop offset="1" stopColor="rgba(255,255,255,0.1)"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="tou-content">

        {TERMS_SECTIONS.map((s) => (
          <section className="tou-section" key={s.n}>
            <div className="tou-section-label">{s.n}</div>
            <h2 className="tou-section-title">{s.title}</h2>
            <p className="tou-para">{s.body}</p>
          </section>
        ))}

        {/* 17 — Contact & Grievances */}
        <section className="tou-section">
          <div className="tou-section-label">17</div>
          <h2 className="tou-section-title">Contact &amp; Grievances</h2>
          <p className="tou-para">For any concerns regarding these Terms, please reach out to us through the following channels.</p>
          <div className="tou-contact-card">
            <div className="tou-contact-block">
              <div className="tou-contact-icon"><Mail /></div>
              <div>
                <label>Email</label>
                <a href="mailto:grievance@haatzaseller.in">grievance@haatzaseller.in</a>
              </div>
            </div>
            <div className="tou-contact-divider" />
            <div className="tou-contact-block">
              <div className="tou-contact-icon"><MapPin /></div>
              <div>
                <label>Address</label>
                <address>
                  #126, RNS Plaza, KIADB Layout, 1st Main,<br />
                  Near Tech Mahindra gate 1, Electronic City Phase 2,<br />
                  Doddanagamangala Road, Bengaluru, Karnataka 560100
                </address>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default TermsOfUsePage;