import React from "react";

const TrackShipmentModal = ({ isOpen, onClose, trackingId, loading, details }) => {
  if (!isOpen) return null;

  return (
    <div className="ret-modal-overlay" onClick={onClose}>
      <div className="ret-modal-box" style={{ maxWidth: "550px" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "14px", marginBottom: "16px" }}>
          <h3 style={{ fontSize: 16, margin: 0, fontWeight: 700, color: "#0F172A" }}>
            Track Shipment
          </h3>
          <button 
            className="ret-btn ret-btn-secondary" 
            style={{ padding: "4px 8px", fontSize: 11, borderRadius: 8 }} 
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", padding: "30px 0" }}>
            <div className="ret-spinner ret-spinner-dark" />
            <span style={{ fontSize: 13, color: "#64748B" }}>Fetching live tracking details...</span>
          </div>
        ) : details ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 20, background: "#F8FAFC", padding: 12, borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }}>
              <div>Status: <strong style={{ color: "#2E7D32" }}>{details.status || details.message?.status || "In Transit"}</strong></div>
              <div>AWB Number: <strong>{trackingId || details.waybill}</strong></div>
            </div>
            
            <div className="ret-timeline" style={{ marginTop: "10px" }}>
              <div className="ret-timeline-item active">
                <div className="ret-timeline-dot" />
                <span className="ret-timeline-status">{details.status || "Exchange Shipment Registered"}</span>
                <span className="ret-timeline-time">{new Date().toLocaleString()}</span>
                <span className="ret-timeline-details">Delhivery AWB Waybill registered and ready for courier pickup.</span>
              </div>
              <div className="ret-timeline-item">
                <div className="ret-timeline-dot" />
                <span className="ret-timeline-status">In Transit</span>
                <span className="ret-timeline-time">-</span>
                <span className="ret-timeline-details">Package sorted at fulfillment center.</span>
              </div>
              <div className="ret-timeline-item">
                <div className="ret-timeline-dot" />
                <span className="ret-timeline-status">Pending Courier Pickup</span>
                <span className="ret-timeline-time">-</span>
                <span className="ret-timeline-details">Awaiting courier dispatch.</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px 0", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
            No tracking information found for waybill {trackingId}.
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackShipmentModal;
