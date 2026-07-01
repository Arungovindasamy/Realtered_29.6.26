import React from "react";
import "./BrandingLoadingSkeleton.css";

const BrandingLoadingSkeleton = () => {
  return (
    <div className="ib-skeleton-container">
      {/* Stats Cards Skeleton */}
      <div className="ib-skel-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="ib-skel-card">
            <div className="ib-skel-shimmer ib-skel-text" style={{ width: 80 }} />
            <div className="ib-skel-shimmer ib-skel-text" style={{ width: 120, height: 24, marginTop: 12 }} />
          </div>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="ib-skel-search-bar">
        <div className="ib-skel-shimmer ib-skel-input" />
        <div className="ib-skel-shimmer ib-skel-tabs" />
      </div>

      {/* Product Table Skeleton */}
      <div className="ib-skel-table-wrap">
        <div className="ib-skel-table-header">
          <div className="ib-skel-shimmer ib-skel-text" style={{ width: "100%" }} />
        </div>
        <div className="ib-skel-table-rows">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="ib-skel-table-row">
              <div className="ib-skel-shimmer ib-skel-check" />
              <div className="ib-skel-shimmer ib-skel-img" />
              <div className="ib-skel-shimmer ib-skel-text" style={{ width: "35%" }} />
              <div className="ib-skel-shimmer ib-skel-text" style={{ width: 50 }} />
              <div className="ib-skel-shimmer ib-skel-text" style={{ width: 50 }} />
              <div className="ib-skel-shimmer ib-skel-badge" />
              <div className="ib-skel-shimmer ib-skel-btn" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandingLoadingSkeleton;
