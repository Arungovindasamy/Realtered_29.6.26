import React from "react";
import { Truck, Calendar, DollarSign, X } from "lucide-react";

const ExchangeShipmentModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  shippingCost, 
  expectedTat, 
  orderId 
}) => {
  if (!isOpen) return null;

  return (
    <div className="ret-modal-overlay" onClick={onClose}>
      <div className="ret-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 className="ret-sheet-title" style={{ display: "flex", alignItems: "center", gap: "10px", textAlign: "left" }}>
            <Truck size={22} style={{ color: "#2962FF" }} />
            Approve Exchange & Ship
          </h2>
          <button 
            onClick={onClose} 
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ret-sheet-desc" style={{ textAlign: "left", marginBottom: "20px" }}>
          Confirm exchange approval for Order ID: <strong>#{orderId}</strong>.
          We have fetched the shipment details via Delhivery API:
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F5F7FF",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(41, 98, 255, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <DollarSign size={20} style={{ color: "#2962FF" }} />
              <div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>SHIPPING COST</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B" }}>
                  {shippingCost !== null && shippingCost !== undefined ? `₹${shippingCost}` : "Fetching..."}
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F5F7FF",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(41, 98, 255, 0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Calendar size={20} style={{ color: "#2962FF" }} />
              <div>
                <div style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>EXPECTED DELIVERY</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#1E293B" }}>
                  {expectedTat ? `${expectedTat} Days` : "Fetching..."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ret-sheet-actions" style={{ display: "flex", gap: "12px" }}>
          <button 
            className="ret-btn ret-btn-secondary" 
            onClick={onClose}
            disabled={loading}
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </button>
          <button 
            className="ret-btn ret-btn-primary" 
            onClick={onConfirm}
            disabled={loading || shippingCost === null || expectedTat === null}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {loading ? (
              <>
                <div className="ret-spinner" style={{ marginRight: "8px" }} />
                Creating Shipment...
              </>
            ) : (
              "Create Shipment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeShipmentModal;
