// src/pages/Settings/ShippingReturnPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  Truck,
  PackageCheck,
  Boxes,
  Route,
  Timer,
  RotateCcw,
  Repeat,
  Undo2,
  ShieldAlert,
  Wallet,
  AlertTriangle,
  ClipboardCheck,
  Gavel,
  Scale,
  RefreshCw,
  BadgeCheck,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import "./ShippingReturnPage.css";

/* ── Content data ─────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "shipping-policy",
    num: 1,
    icon: Truck,
    title: "Shipping Policy",
    content: [
      {
        type: "sub-section",
        label: "1.1",
        heading: "Order Fulfilment Requirements",
        icon: PackageCheck,
        points: [
          "Sellers must dispatch all confirmed orders within the dispatch time shown in the Seller Dashboard.",
          "Only in-stock products should be listed as available.",
          "Orders must not be delayed due to procurement after order confirmation.",
          "If dispatch delay is unavoidable, seller must inform Haatza immediately with a valid reason.",
        ],
      },
      {
        type: "info-box",
        text: "Repeated delays may result in: Order cancellation, Seller penalties, Reduced visibility, Temporary suspension.",
      },
      {
        type: "sub-section",
        label: "1.2",
        heading: "Packaging Standards (Mandatory Compliance)",
        icon: Boxes,
        points: [
          "All shipments must follow Indian packaging and labeling rules. Packages must include wherever applicable: Manufacturer / packer / importer name & address.",
          "Net quantity / weight / volume.",
          "MRP inclusive of all taxes.",
          "Manufacturing / packing date.",
          "Expiry / best-before date.",
          "Batch / lot number.",
          "Required compliance marks (BIS, FSSAI, etc.).",
        ],
      },
      {
        type: "para",
        text: "Packaging must be: Tamper-resistant, Transit-safe, Properly sealed, and Suitable for the product category. Improper packaging leading to damage will be treated as seller fault.",
      },
      {
        type: "sub-section",
        label: "1.3",
        heading: "Logistics Partner Rules",
        icon: Route,
        points: [
          "Sellers must ship using Haatza-approved logistics partners.",
          "Self-shipping is not allowed unless officially approved.",
          "Shipment tracking must be generated within 24 hours of dispatch.",
          "Fake or manual tracking entries are strictly prohibited.",
        ],
      },
      {
        type: "sub-section",
        label: "1.4",
        heading: "Delivery SLA Compliance",
        icon: Timer,
        points: [
          "Sellers must meet delivery timelines shown at checkout.",
          "Seller-caused delays may result in: Customer refund, Logistics charge recovery, Seller performance score impact.",
        ],
      },
    ],
  },
  {
    id: "return-policy",
    num: 2,
    icon: RotateCcw,
    title: "Return Policy",
    content: [
      {
        type: "sub-section",
        label: "2.1",
        heading: "Mandatory Return Acceptance Cases",
        icon: ShieldAlert,
        points: [
          "Sellers must accept returns if customer reports: Product damaged on delivery.",
          "Manufacturing defect.",
          "Wrong item or variant delivered.",
          "Missing components or accessories.",
          "Expired product delivered.",
          "Product does not match listing description or images.",
        ],
      },
      {
        type: "highlight-card",
        icon: ShieldAlert,
        heading: "Seller-Fault Returns",
        text: "These are classified as Seller-Fault Returns. Return refusal in these cases is not allowed.",
        color: "amber",
      },
      {
        type: "sub-section",
        label: "2.2",
        heading: "Optional Change-of-Mind Returns",
        icon: Repeat,
        points: [
          "Change-of-mind returns are not legally mandatory.",
          "Sellers may enable or disable this option at listing level.",
          "If enabled, seller must honor the stated return terms.",
          "Haatza recommends enabling this to improve buyer trust and conversions.",
        ],
      },
      {
        type: "sub-section",
        label: "2.3",
        heading: "Return Window Rules",
        icon: Timer,
        points: [
          "Non-perishable products: Minimum 7 days.",
          "Electronics: 7–10 days.",
          "Fashion: 7–10 days.",
          "Perishable products: Not returnable unless damaged.",
          "Hygiene items: Not returnable unless defective.",
        ],
      },
      {
        type: "para",
        text: "Category overrides may apply.",
      },
    ],
  },
  {
    id: "exchange-policy",
    num: 3,
    icon: Repeat,
    title: "Exchange Policy",
    content: [
      {
        type: "sub-section",
        label: "3.1",
        heading: "Exchange Enablement",
        icon: Repeat,
        points: [
          "If seller enables Exchange on a product, eligible exchange requests must be accepted.",
          "Replacement must match original product specifications or approved variant.",
          "Replacement must be dispatched within platform SLA.",
        ],
      },
      {
        type: "sub-section",
        label: "3.2",
        heading: "Exchange Restrictions",
        icon: ShieldAlert,
        points: [
          "Haatza may limit multiple exchanges per order.",
          "Repeat exchanges by the same buyer may be restricted.",
          "Category-based exchange eligibility may apply.",
          "Repeated exchange abuse may be converted into a refund.",
        ],
      },
    ],
  },
  {
    id: "reverse-logistics",
    num: 4,
    icon: Undo2,
    title: "Reverse Logistics & Cost Responsibility",
    content: [
      {
        type: "sub-section",
        label: "4.1",
        heading: "When Seller Enables Return / Exchange",
        icon: Wallet,
        points: [
          "Seller is responsible for: Return pickup cost.",
          "Reverse shipping cost.",
          "Inspection handling cost.",
          "Exchange re-shipping cost.",
          "Repacking & processing cost.",
        ],
      },
      {
        type: "para",
        text: "These charges will be deducted from seller settlement after notification.",
      },
      {
        type: "sub-section",
        label: "4.2",
        heading: "Seller-Fault Return Cost (Mandatory)",
        icon: AlertTriangle,
        points: [
          "If return reason is damage, defect, wrong item, or misdescription: Seller bears full logistics cost.",
          "Refund cost.",
          "Replacement shipping cost.",
        ],
      },
      {
        type: "info-box",
        text: "Customer must not be charged.",
      },
      {
        type: "sub-section",
        label: "4.3",
        heading: "Verification-Based Rejection Protection",
        icon: ClipboardCheck,
        points: [
          "Returns are verified using inspection reports, images, packaging checks, and order data.",
          "If misuse is verified, return or refund may be rejected and logistics cost reassigned where legally allowed.",
        ],
      },
    ],
  },
  {
    id: "return-sla",
    num: 5,
    icon: Timer,
    title: "Return Processing SLA",
    content: [
      {
        type: "bullet-list",
        items: [
          "Seller must act on return requests within platform SLA.",
          "Seller must approve or reject with valid reason.",
          "No response within SLA may result in auto decision by Haatza.",
          "Auto decisions are binding.",
        ],
      },
    ],
  },
  {
    id: "refund-policy",
    num: 6,
    icon: Wallet,
    title: "Refund Policy",
    highlight: { label: "7 Working Days", color: "blue" },
    content: [
      {
        type: "sub-section",
        label: "6.1",
        heading: "Refund Timeline",
        icon: Timer,
        points: [
          "Refund must be approved after product verification.",
          "Refunds will be processed within 7 working days of approval.",
        ],
      },
      {
        type: "sub-section",
        label: "6.2",
        heading: "Platform Direct Refund Authority",
        icon: ShieldAlert,
        points: [
          "If seller delays or refuses a valid refund: Haatza may refund buyer directly.",
          "Recover amount from seller payout.",
          "Recover logistics and handling charges.",
        ],
      },
      {
        type: "para",
        text: "Seller will be notified.",
      },
    ],
  },
  {
    id: "cod-rto",
    num: 7,
    icon: Truck,
    title: "COD & Delivery Failure Rules",
    content: [
      {
        type: "bullet-list",
        items: [
          "COD and prepaid orders follow the same return rules.",
          "RTO caused by seller fault will be charged to seller.",
          "High RTO ratio may trigger seller penalties.",
        ],
      },
    ],
  },
  {
    id: "compliance-duties",
    num: 8,
    icon: ClipboardCheck,
    title: "Seller Listing & Compliance Duties",
    content: [
      {
        type: "para",
        text: "Seller must ensure:",
      },
      {
        type: "bullet-list",
        items: [
          "Accurate product descriptions.",
          "Real product images.",
          "Correct specifications.",
          "Valid certifications where required (BIS, FSSAI, CDSCO, Legal Metrology).",
          "Proper tax invoices.",
          "No misleading claims.",
        ],
      },
    ],
  },
  {
    id: "non-compliance",
    num: 9,
    icon: AlertTriangle,
    title: "Non-Compliance Actions",
    content: [
      {
        type: "para",
        text: "Haatza may enforce:",
      },
      {
        type: "bullet-list",
        items: [
          "Settlement deductions.",
          "Return charge recovery.",
          "Listing suppression.",
          "Seller score downgrade.",
          "Account suspension.",
          "Account termination.",
        ],
      },
      {
        type: "para",
        text: "Based on violation severity and frequency.",
      },
    ],
  },
  {
    id: "dispute-resolution",
    num: 10,
    icon: Gavel,
    title: "Dispute Resolution Method",
    content: [
      {
        type: "para",
        text: "Disputes are evaluated based on logistics reports, inspection images, order records, and communication logs.",
      },
      {
        type: "para",
        text: "Haatza's decision after review will be final for platform settlement purposes.",
      },
    ],
  },
  {
    id: "governing-law",
    num: 11,
    icon: Scale,
    title: "Governing Law",
    content: [
      {
        type: "para",
        text: "This policy operates under Indian laws including:",
      },
      {
        type: "bullet-list",
        items: [
          "Consumer Protection Act, 2019.",
          "Consumer Protection (E-Commerce) Rules, 2020.",
          "Legal Metrology Rules.",
          "GST & tax regulations.",
          "Category-specific laws.",
        ],
      },
    ],
  },
  {
    id: "policy-updates",
    num: 12,
    icon: RefreshCw,
    title: "Policy Updates",
    content: [
      {
        type: "para",
        text: "Haatza may update this policy periodically. Continued use of the platform means acceptance of the updated policy.",
      },
    ],
  },
];

/* ── Sub-components ───────────────────────────────────────── */

function SectionContent({ content }) {
  return (
    <div className="sr-section-body">
      {content.map((block, i) => {
        if (block.type === "para") {
          return (
            <p key={i} className="sr-para">
              {block.text}
            </p>
          );
        }

        if (block.type === "highlight-card") {
          const Icon = block.icon;
          return (
            <div key={i} className={`sr-highlight-card sr-highlight-${block.color}`}>
              <div className="sr-highlight-icon">
                <Icon size={20} />
              </div>
              <div>
                <div className="sr-highlight-heading">{block.heading}</div>
                <div className="sr-highlight-text">{block.text}</div>
              </div>
            </div>
          );
        }

        if (block.type === "sub-section") {
          const Icon = block.icon;
          return (
            <div key={i} className="sr-sub-section">
              <div className="sr-sub-header">
                <span className="sr-sub-label">{block.label}</span>
                <Icon size={14} className="sr-sub-icon" />
                <span className="sr-sub-heading">{block.heading}</span>
              </div>
              <ul className="sr-point-list">
                {block.points.map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === "info-box") {
          return (
            <div key={i} className="sr-info-box">
              <span className="sr-info-dot" />
              {block.text}
            </div>
          );
        }

        if (block.type === "bullet-list") {
          return (
            <ul key={i} className="sr-bullet-list">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
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
    <div className={`sr-accordion ${isOpen ? "sr-accordion-open" : ""}`}>
      <button className="sr-acc-header" onClick={onToggle} aria-expanded={isOpen}>
        <div className="sr-acc-left">
          <span className="sr-acc-num">{section.num}</span>
          <div className="sr-acc-icon">
            <Icon size={16} />
          </div>
          <span className="sr-acc-title">{section.title}</span>
          {section.highlight && (
            <span className={`sr-acc-badge sr-badge-${section.highlight.color}`}>
              {section.highlight.label}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className="sr-acc-chevron"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>
      {isOpen && <SectionContent content={section.content} />}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────── */
function ShippingReturnPage() {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState(0);

  const toggle = (i) => setOpenSection(openSection === i ? -1 : i);

  return (
    <div className="sr-page">
      {/* ── Hero ── */}
      <header className="sr-hero">
        <button
          className="sr-back-btn"
          onClick={() => navigate("/dashboard/settings")}
          aria-label="Back to settings"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="sr-hero-left">
          <span className="sr-hero-badge">
            <RefreshCw size={12} />
            Updated Policy
          </span>
          <h1 className="sr-hero-title">Shipping &amp; Return Policy</h1>
          <p className="sr-hero-sub">
            Shipping, Return, Exchange &amp; Refund rules and responsibilities
            for all sellers on the Haatza marketplace.
          </p>
          <div className="sr-hero-meta">
            <span className="sr-meta-item">
              <BadgeCheck size={13} />
              Last updated: June 2025
            </span>
            <span className="sr-meta-item">
              <ShieldAlert size={13} />
              12 Sections
            </span>
          </div>
        </div>

        <div className="sr-hero-illo" aria-hidden="true">
          <div className="sr-illo-ring sr-illo-ring-1" />
          <div className="sr-illo-ring sr-illo-ring-2" />
          <div className="sr-illo-center">
            <Truck size={30} />
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="sr-body">
        <div className="sr-intro-card">
          <p className="sr-intro-text">
            This Shipping, Return, Exchange &amp; Refund Policy defines the
            mandatory rules and responsibilities for all sellers listing and
            selling products on the Haatza marketplace platform. This policy
            is designed in alignment with applicable Indian laws including
            the Consumer Protection Act, 2019, Consumer Protection
            (E-Commerce) Rules, 2020, Legal Metrology Rules, and other
            applicable regulations. By listing products on Haatza, you agree
            to comply with this policy.
          </p>
        </div>

        <div className="sr-sections">
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
        <div className="sr-contact-card">
          <div className="sr-contact-header">
            <div className="sr-contact-icon">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="sr-contact-title">Haatza Seller Support</div>
              <div className="sr-contact-sub">
                Have questions about shipping or returns? We're here.
              </div>
            </div>
          </div>
          <div className="sr-contact-divider" />
          <div className="sr-contact-rows">
            <a href="mailto:sales@haatza.com" className="sr-contact-row">
              <div className="sr-contact-row-icon">
                <Mail size={15} />
              </div>
              <div>
                <div className="sr-contact-row-label">Email</div>
                <div className="sr-contact-row-val">sales@haatza.com</div>
              </div>
            </a>
            <a href="tel:+919148079015" className="sr-contact-row">
              <div className="sr-contact-row-icon">
                <Phone size={15} />
              </div>
              <div>
                <div className="sr-contact-row-label">Phone</div>
                <div className="sr-contact-row-val">+91 9148079015</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingReturnPage;