import React from "react";
import { Sparkles } from "lucide-react";
import "./BrandingHeader.css";

const BrandingHeader = () => {
  return (
    <div className="ib-header-wrap">
      <div className="ib-header-left">
        <h1 className="ib-header-title">Influence Branding</h1>
        <p className="ib-header-subtitle">
          Boost product visibility and drive sales through creators and influencers.
        </p>
      </div>
      <div className="ib-header-right">
        <div className="ib-program-badge">
          <Sparkles size={14} className="ib-badge-icon" />
          <span>Creator Marketing Program</span>
        </div>
      </div>
    </div>
  );
};

export default BrandingHeader;
