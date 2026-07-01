import React from "react";

const ReturnExchangeStatusBadge = ({ status }) => {
  const getStatusBadgeClass = (statusText = "") => {
    const s = statusText.toLowerCase();
    if (s.includes("approved")) return "approved";
    if (s.includes("rejected")) return "rejected";
    if (s.includes("shipped")) return "shipped";
    if (s.includes("exchange")) return "exchange";
    return "requested"; // Default fallback (e.g., Return Requested)
  };

  return (
    <span className={`ret-badge ${getStatusBadgeClass(status)}`}>
      {status || "Return Requested"}
    </span>
  );
};

export default ReturnExchangeStatusBadge;
