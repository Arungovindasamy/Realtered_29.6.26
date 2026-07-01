import React from "react";
import { Search, X } from "lucide-react";
import "./BrandingSearchBar.css";

const BrandingSearchBar = ({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  setActiveTab,
  promotedCount = 0,
  notPromotedCount = 0
}) => {
  return (
    <div className="ib-search-bar-wrap">
      {/* Search Bar Input */}
      <div className="ib-search-input-container">
        <Search size={18} className="ib-search-icon" />
        <input
          type="text"
          className="ib-search-input"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="ib-search-clear-btn" onClick={() => setSearchQuery("")}>
            <X size={15} />
          </button>
        )}
      </div>

      {/* Tabs Filter Switches */}
      <div className="ib-tabs-container">
        <button
          className={`ib-tab-btn ${activeTab === "promoted" ? "active" : ""}`}
          onClick={() => setActiveTab("promoted")}
        >
          <span>Promoted</span>
          <span className="ib-tab-badge bg-green">{promotedCount}</span>
        </button>
        <button
          className={`ib-tab-btn ${activeTab === "not_promoted" ? "active" : ""}`}
          onClick={() => setActiveTab("not_promoted")}
        >
          <span>Not Promoted</span>
          <span className="ib-tab-badge bg-grey">{notPromotedCount}</span>
        </button>
      </div>
    </div>
  );
};

export default BrandingSearchBar;
