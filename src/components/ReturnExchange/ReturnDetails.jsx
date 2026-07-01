import React from "react";
import { Info, User, ShoppingBag, AlertTriangle, ImageIcon } from "lucide-react";
import ReturnImagesGallery from "./ReturnImagesGallery";
import ReturnExchangeStatusBadge from "./ReturnExchangeStatusBadge";

const ReturnDetails = ({ 
  item, 
  onApproveExchange, 
  onRejectRequest, 
  onTrackShipment, 
  onDownloadPackingSlip 
}) => {
  
  const getStatusBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("requested")) {
      if (s.includes("exchange")) return "requested exchange";
      return "requested";
    }
    if (s.includes("approved")) return "approved";
    if (s.includes("rejected")) return "rejected";
    if (s.includes("shipped")) return "shipped";
    return "requested";
  };

  const isReturnRequested = (item.status || "").toLowerCase() === "return requested";
  const isExchangeShipped = (item.status || "").toLowerCase() === "exchange shipped" || (item.status || "").toLowerCase() === "shipped";

  return (
    <div className="ret-detail-container" style={{ width: "100%" }}>
      {/* Left Column */}
      <div className="ret-details-main">
        {/* Section 1: Order Information */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <Info size={18} />
            Order Information
          </h3>
          <div className="ret-info-grid">
            <div className="ret-info-block">
              <span className="ret-info-label">Order ID</span>
              <span className="ret-info-val">{item.orderId || "-"}</span>
            </div>
            <div className="ret-info-block">
              <span className="ret-info-label">Exchange Order ID</span>
              <span className="ret-info-val">{item.exchangeOrderId || "-"}</span>
            </div>
            <div className="ret-info-block">
              <span className="ret-info-label">Return Order ID</span>
              <span className="ret-info-val">{item.returnOrderId || "-"}</span>
            </div>
            <div className="ret-info-block">
              <span className="ret-info-label">Invoice Number</span>
              <span className="ret-info-val">{item.invoiceNumber || "-"}</span>
            </div>
            <div className="ret-info-block">
              <span className="ret-info-label">Status</span>
              <div style={{ marginTop: "4px" }}>
                <ReturnExchangeStatusBadge status={item.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Product Information */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <ShoppingBag size={18} />
            Product Information
          </h3>
          <div className="ret-product-row">
            <img
              src={item.productimage || "https://static.wixstatic.com/media/4b1349_8e8421c69837468eac76e48dd6c74279~mv2.jpg"}
              alt={item.items}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
              }}
            />
            <div className="ret-product-details">
              <h4 className="ret-product-name">{item.items || "N/A"}</h4>
              <div className="ret-product-meta">
                <span>Size: <strong>{item.productOption?.Size || item.productOption?.size || "N/A"}</strong></span>
                <span>Quantity: <strong>{item.quantity || 1}</strong></span>
                <span>Unit Price: <strong>₹{item.itemPrice || item.totalAmount || 0}</strong></span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="ret-detail-label">Total Amount</span>
              <div className="ret-detail-price" style={{ fontSize: "20px" }}>₹{item.totalAmount || 0}</div>
            </div>
          </div>
        </div>

        {/* Section 4: Return Reason */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <AlertTriangle size={18} />
            Return Reason
          </h3>
          <div className="ret-reason-box">
            <span className="ret-reason-title">{item.reason || "Material, finishing, or performance problem"}</span>
            {item.message && <p className="ret-reason-msg">"{item.message}"</p>}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="ret-details-sidebar">
        {/* Section 2: Customer Information */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <User size={18} />
            Customer Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="ret-info-block">
              <span className="ret-info-label">Customer Name</span>
              <span className="ret-info-val" style={{ fontSize: 16 }}>{item.customerName || "-"}</span>
            </div>
            <div className="ret-info-block ret-address-block">
              <span className="ret-info-label">Delivery Address</span>
              <p>{item.customerAddress || "No delivery address provided."}</p>
            </div>
          </div>
        </div>

        {/* Section 5: Uploaded Images */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <ImageIcon size={18} />
            Return Evidence Images
          </h3>
          <ReturnImagesGallery images={item.returnimage} />
        </div>
      </div>
    </div>
  );
};

export default ReturnDetails;
