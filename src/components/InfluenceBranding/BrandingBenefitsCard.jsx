import React from "react";
import { Users, BadgePercent, Eye, BarChart } from "lucide-react";
import "./BrandingBenefitsCard.css";

const BrandingBenefitsCard = () => {
  const benefits = [
    {
      title: "Creator Promotion",
      desc: "Get professional content creators and influencers talking about your products on Instagram and YouTube.",
      icon: <Users size={20} />,
      bgColor: "#EAF1FF",
      iconColor: "#2962FF",
    },
    {
      title: "Performance Based Cost",
      desc: "No upfront fees. Pay only a flat commission (like 7% of net revenue) when an actual customer purchase is confirmed.",
      icon: <BadgePercent size={20} />,
      bgColor: "#E8F9EE",
      iconColor: "#00C853",
    },
    {
      title: "Better Reach",
      desc: "Instantly expand your brand visibility across niche customer segments that are traditionally hard to target.",
      icon: <Eye size={20} />,
      bgColor: "#FFF4E5",
      iconColor: "#FF9800",
    },
    {
      title: "Increased Conversions",
      desc: "Harness the authentic connection of content creators to convert viewer interest into orders and repeat purchases.",
      icon: <BarChart size={20} />,
      bgColor: "#F5F3FF",
      iconColor: "#8B5CF6",
    },
  ];

  return (
    <div className="ib-benefits-panel">
      <div className="ib-benefits-header">
        <h3 className="ib-benefits-title">Why Enable Creator Promotion?</h3>
        <p className="ib-benefits-subtitle">Unlocks performance-based digital growth tools without upfront fees.</p>
      </div>

      <div className="ib-benefits-grid">
        {benefits.map((b, idx) => (
          <div key={idx} className="ib-benefit-card">
            <div 
              className="ib-benefit-icon-container"
              style={{ backgroundColor: b.bgColor, color: b.iconColor }}
            >
              {b.icon}
            </div>
            <div className="ib-benefit-info">
              <h4 className="ib-benefit-title">{b.title}</h4>
              <p className="ib-benefit-desc">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandingBenefitsCard;
