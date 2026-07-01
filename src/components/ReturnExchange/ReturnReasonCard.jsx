import React from "react";
import { AlertTriangle } from "lucide-react";

const ReturnReasonCard = ({ reason, message }) => {
  return (
    <div className="ret-card">
      <h3 className="ret-section-title">
        <AlertTriangle size={18} />
        Return Reason
      </h3>
      <div className="ret-reason-box">
        <span className="ret-reason-title">{reason || "Not specified"}</span>
        {message && <p className="ret-reason-msg">"{message}"</p>}
      </div>
    </div>
  );
};

export default ReturnReasonCard;
