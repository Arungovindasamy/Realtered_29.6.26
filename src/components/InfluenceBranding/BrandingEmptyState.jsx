import React from "react";
import { Sparkles } from "lucide-react";
import "./BrandingEmptyState.css";

const BrandingEmptyState = ({ title = "No Products Found", desc = "Add products to start using Influence Branding." }) => {
  return (
    <div className="ib-empty-card">
      <div className="ib-empty-icon-wrap">
        <Sparkles size={36} className="ib-empty-icon" />
      </div>

      <h3 className="ib-empty-title">{title}</h3>
      <p className="ib-empty-subtitle">{desc}</p>
    </div>
  );
};

export default BrandingEmptyState;
