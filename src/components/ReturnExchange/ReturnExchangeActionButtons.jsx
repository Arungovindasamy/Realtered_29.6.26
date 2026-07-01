import React from "react";
import { Truck } from "lucide-react";

const ReturnExchangeActionButtons = ({
  onTrack,
  loading = false
}) => {
  return (
    <div className="ret-actions-row">
      <button 
        className="ret-btn ret-btn-primary" 
        onClick={onTrack}
        disabled={loading}
      >
        <Truck size={16} />
        Tracking ID
      </button>
    </div>
  );
};

export default ReturnExchangeActionButtons;
