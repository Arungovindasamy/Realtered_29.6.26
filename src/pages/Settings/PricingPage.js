// src/pages/Settings/PricingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  IndianRupee,
  Percent,
  Receipt,
  Clock,
  Tag,
  ShieldCheck,
  FileEdit,
  Mail,
  Phone,
  MessageSquare,
  BadgePercent,
  Landmark,
  Scale,
  BadgeCheck,
  RefreshCw,
} from "lucide-react";
import "./PricingPage.css";

/* ── Content data ─────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "introduction",
    num: 1,
    icon: FileEdit,
    title: "Introduction",
    content: [
      {
        type: "para",
        text: 'This Pricing & Commission Policy ("Policy") applies to all sellers registered on the Haatza Seller Platform ("Platform") and governs the charges, commission structure, settlement timelines, and applicable taxes.',
      },
      {
        type: "para",
        text: "This Policy is in accordance with the Consumer Protection (E-Commerce) Rules, 2020, the Goods and Services Tax (GST) Act, and other applicable Indian laws.",
      },
      {
        type: "para",
        text: "By registering and listing products on Haatza, sellers agree to comply with this Policy and all applicable laws.",
      },
    ],
  },
  {
    id: "commission",
    num: 2,
    icon: BadgePercent,
    title: "Commission Structure",
    highlight: { label: "0% Commission", color: "green" },
    content: [
      {
        type: "highlight-card",
        icon: BadgePercent,
        heading: "Zero Commission on Sales",
        text: "Haatza does not charge any sales commission on products sold through the Platform.",
        color: "green",
      },
      {
        type: "para",
        text: "Sellers receive the full sale value of their products, excluding applicable government taxes and statutory deductions mentioned in this Policy.",
      },
    ],
  },
  {
    id: "taxes",
    num: 3,
    icon: Receipt,
    title: "Applicable Taxes & Charges",
    content: [
      {
        type: "sub-section",
        label: "A",
        heading: "Goods and Services Tax (GST)",
        icon: Landmark,
        points: [
          "GST will be applied according to the GST rate applicable to the product category.",
          "Sellers are responsible for GST compliance, including proper invoicing and GSTIN declaration.",
        ],
      },
      {
        type: "sub-section",
        label: "B",
        heading: "Tax Collected at Source (TCS)",
        icon: Percent,
        points: [
          "As per Section 52 of the Income Tax Act, 1961, Haatza is required to collect TCS at 1% (0.5% CGST + 0.5% SGST or 1% IGST) on the net taxable value of sales made through the Platform.",
          "TCS will be deducted from the settlement amount and deposited with the government on behalf of the seller.",
          "Sellers may claim TCS credit while filing returns.",
        ],
      },
    ],
  },
  {
    id: "settlement",
    num: 4,
    icon: Clock,
    title: "Settlement Timeline",
    highlight: { label: "7 Business Days", color: "blue" },
    content: [
      {
        type: "bullet-list",
        items: [
          "Settlement Period: Payments to Sellers will be processed within 7 (seven) business days from the date of successful delivery of the product to the customer.",
          "Settlement will be made directly to the bank account registered by the Seller with Haatza.",
          "Deductions (if any) for TCS, applicable GST on service charges, and other statutory deductions will be made before the settlement.",
        ],
      },
    ],
  },
  {
    id: "pricing-responsibility",
    num: 5,
    icon: Tag,
    title: "Pricing Responsibility of Sellers",
    content: [
      {
        type: "bullet-list",
        items: [
          "Sellers are free to determine the selling price of their products in accordance with applicable laws.",
          "Pricing must comply with the Legal Metrology (Packaged Commodities) Rules, 2011.",
          "Product prices must be inclusive of applicable taxes and clearly displayed to customers.",
        ],
      },
    ],
  },
  {
    id: "ecommerce",
    num: 6,
    icon: ShieldCheck,
    title: "Compliance with E-Commerce Laws",
    content: [
      {
        type: "bullet-list",
        items: [
          "All sellers must comply with the Consumer Protection (E-Commerce) Rules, 2020, including transparent pricing, no misleading advertisements, and honoring offers/promises made to customers.",
          "Sellers must ensure that product descriptions are accurate and that no unfair trade practices are followed.",
        ],
      },
    ],
  },
  {
    id: "amendments",
    num: 7,
    icon: RefreshCw,
    title: "Amendments to Policy",
    content: [
      {
        type: "para",
        text: "Haatza reserves the right to modify this Policy at any time to comply with legal requirements or business needs.",
      },
      {
        type: "para",
        text: "Sellers will be informed about significant changes in advance whenever applicable.",
      },
    ],
  },
];

/* ── Sub-components ───────────────────────────────────────── */

function SectionContent({ content }) {
  return (
    <div className="pp-section-body">
      {content.map((block, i) => {
        if (block.type === "para") {
          return (
            <p key={i} className="pp-para">
              {block.text}
            </p>
          );
        }

        if (block.type === "highlight-card") {
          const Icon = block.icon;
          return (
            <div key={i} className={`pp-highlight-card pp-highlight-${block.color}`}>
              <div className="pp-highlight-icon">
                <Icon size={20} />
              </div>
              <div>
                <div className="pp-highlight-heading">{block.heading}</div>
                <div className="pp-highlight-text">{block.text}</div>
              </div>
            </div>
          );
        }

        if (block.type === "sub-section") {
          const Icon = block.icon;
          return (
            <div key={i} className="pp-sub-section">
              <div className="pp-sub-header">
                <span className="pp-sub-label">{block.label}</span>
                <Icon size={14} className="pp-sub-icon" />
                <span className="pp-sub-heading">{block.heading}</span>
              </div>
              <ul className="pp-point-list">
                {block.points.map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "timeline-steps") {
          return (
            <div key={i} className="pp-timeline">
              {block.steps.map((step, j) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={j}>
                    <div className="pp-timeline-step">
                      <div className="pp-timeline-icon">
                        <Icon size={16} />
                      </div>
                      <div className="pp-timeline-label">{step.label}</div>
                      <div className="pp-timeline-sub">{step.sub}</div>
                    </div>
                    {j < block.steps.length - 1 && (
                      <div className="pp-timeline-arrow">→</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          );
        }

        if (block.type === "info-box") {
          return (
            <div key={i} className="pp-info-box">
              <span className="pp-info-dot" />
              {block.text}
            </div>
          );
        }

        if (block.type === "bullet-list") {
          return (
            <ul key={i} className="pp-bullet-list">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "compliance-grid") {
          return (
            <div key={i} className="pp-compliance-grid">
              {block.items.map((item, j) => {
                const Icon = item.icon;
                return (
                  <div key={j} className="pp-compliance-card">
                    <div className="pp-compliance-icon">
                      <Icon size={15} />
                    </div>
                    <div className="pp-compliance-label">{item.label}</div>
                    <div className="pp-compliance-sub">{item.sub}</div>
                  </div>
                );
              })}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function AccordionSection({ section, isOpen, onToggle }) {
  const Icon = section.icon;
  return (
    <div className={`pp-accordion ${isOpen ? "pp-accordion-open" : ""}`}>
      <button className="pp-acc-header" onClick={onToggle} aria-expanded={isOpen}>
        <div className="pp-acc-left">
          <span className="pp-acc-num">{section.num}</span>
          <div className="pp-acc-icon">
            <Icon size={16} />
          </div>
          <span className="pp-acc-title">{section.title}</span>
          {section.highlight && (
            <span className={`pp-acc-badge pp-badge-${section.highlight.color}`}>
              {section.highlight.label}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className="pp-acc-chevron"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>
      {isOpen && <SectionContent content={section.content} />}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
function PricingPage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(0);

  const toggle = (i) => setOpenSection(openSection === i ? -1 : i);

  return (
    <div className="pp-page">
      {/* ── Hero ── */}
      <header className="pp-hero">
        <button
  className="pp-back-btn"
  onClick={() => navigate("/dashboard/settings")}
  aria-label="Back to settings"
>
  <ChevronLeft size={18} strokeWidth={2.5} color="currentColor" />
</button>

        <div className="pp-hero-left">
          <span className="pp-hero-badge">
            <RefreshCw size={12} />
            Updated Policy
          </span>
          <h1 className="pp-hero-title">Pricing &amp; Commission Policy</h1>
          <p className="pp-hero-sub">
            Understand Haatza's pricing, settlement process, taxes, and seller
            responsibilities.
          </p>
          <div className="pp-hero-meta">
            <span className="pp-meta-item">
              <BadgeCheck size={13} />
              Last updated: June 2025
            </span>
            <span className="pp-meta-item">
              <ShieldCheck size={13} />
              7 Sections
            </span>
          </div>
        </div>

        <div className="pp-hero-illo" aria-hidden="true">
          <div className="pp-illo-ring pp-illo-ring-1" />
          <div className="pp-illo-ring pp-illo-ring-2" />
          <div className="pp-illo-center">
            <IndianRupee size={32} />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="pp-body">
        <div className="pp-sections">
          {SECTIONS.map((section, i) => (
            <AccordionSection
              key={section.id}
              section={section}
              isOpen={openSection === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        {/* ── Contact card ── */}
        <div className="pp-contact-card">
          <div className="pp-contact-header">
            <div className="pp-contact-icon">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="pp-contact-title">Haatza Seller Support</div>
              <div className="pp-contact-sub">
                Have questions about pricing or commissions? We're here.
              </div>
            </div>
          </div>
          <div className="pp-contact-divider" />
          <div className="pp-contact-rows">
            <a href="mailto:sales@haatza.com" className="pp-contact-row">
              <div className="pp-contact-row-icon">
                <Mail size={15} />
              </div>
              <div>
                <div className="pp-contact-row-label">Email</div>
                <div className="pp-contact-row-val">sales@haatza.com</div>
              </div>
            </a>
            <a href="tel:+919148079015" className="pp-contact-row">
              <div className="pp-contact-row-icon">
                <Phone size={15} />
              </div>
              <div>
                <div className="pp-contact-row-label">Phone</div>
                <div className="pp-contact-row-val">+91 9148079015</div>
              </div>
            </a>
          </div>
       
        </div>
      </div>
    </div>
  );
}

export default PricingPage;