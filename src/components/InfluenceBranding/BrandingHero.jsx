import React from "react";
import { motion } from "framer-motion";
import { Rocket, ShieldCheck, Zap, Users, TrendingUp } from "lucide-react";
import "./BrandingHero.css";

const BrandingHero = () => {
  const chips = [
    { label: "More Reach", icon: <TrendingUp size={13} /> },
    { label: "More Engagement", icon: <Zap size={13} /> },
    { label: "Creator Marketing", icon: <Users size={13} /> },
    { label: "Pay Only On Sales", icon: <ShieldCheck size={13} /> },
  ];

  return (
    <motion.div 
      className="ib-hero-card"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="ib-hero-glow-1"></div>
      <div className="ib-hero-glow-2"></div>

      <div className="ib-hero-content">
        <div className="ib-hero-icon-container">
          <Rocket size={28} className="ib-hero-rocket-icon" />
        </div>
        <div className="ib-hero-info">
          <h2 className="ib-hero-title">Influence Branding</h2>
          <p className="ib-hero-subtitle">
            Promote your items directly through professional creators and influencers. Expand your brand's digital reach and drive incremental revenue, paying only when a sale is confirmed.
          </p>
          <div className="ib-hero-chips-wrap">
            {chips.map((chip, idx) => (
              <div key={idx} className="ib-hero-chip">
                {chip.icon}
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrandingHero;
