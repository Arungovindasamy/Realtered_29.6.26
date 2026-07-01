import React from "react";
import { Info, User, ShoppingBag, AlertTriangle, ImageIcon } from "lucide-react";
import ReturnExchangeStatusBadge from "./ReturnExchangeStatusBadge";
import ReturnExchangeImages from "./ReturnExchangeImages";
import ReturnReasonCard from "./ReturnReasonCard";

const renderProductOption = (option) => {
  if (!option) return "-";
  if (typeof option === "object") {
    return option.Size || option.size || Object.values(option)[0] || "-";
  }
  return String(option);
};

const ReturnExchangeDetails = ({ item }) => {
  if (!item) return null;

  return (
    <div className="ret-details-grid" style={{ width: "100%" }}>
      
      {/* COLUMN 1: Order & Product Information */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Order Information Card */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <Info size={18} />
            Order Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="ret-info-block">
              <span className="ret-info-label">Order ID</span>
              <span className="ret-info-val">#{item.orderId || "-"}</span>
            </div>
            {item.exchangeOrderId && (
              <div className="ret-info-block">
                <span className="ret-info-label">Exchange Order ID</span>
                <span className="ret-info-val">#{item.exchangeOrderId}</span>
              </div>
            )}
            {item.returnOrderId && (
              <div className="ret-info-block">
                <span className="ret-info-label">Return Order ID</span>
                <span className="ret-info-val">#{item.returnOrderId}</span>
              </div>
            )}
            {item.invoiceNumber && (
              <div className="ret-info-block">
                <span className="ret-info-label">Invoice Number</span>
                <span className="ret-info-val">{item.invoiceNumber}</span>
              </div>
            )}
            <div className="ret-info-block">
              <span className="ret-info-label">Status</span>
              <div style={{ marginTop: "4px" }}>
                <ReturnExchangeStatusBadge status={item.status} />
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Card */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <ShoppingBag size={18} />
            Product Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <img
                src={item.productimage || "https://static.wixstatic.com/media/4b1349_8e8421c69837468eac76e48dd6c74279~mv2.jpg"}
                alt={item.items || "Product"}
                style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", border: "1px solid #E2E8F0" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="ret-product-name" style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A", margin: "0 0 6px 0", lineHeight: 1.4 }}>
                  {item.items || "N/A"}
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "#64748B" }}>
                  <span>Size: <strong>{renderProductOption(item.productOption)}</strong></span>
                  <span>Qty: <strong>{item.quantity || 1}</strong></span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #E2E8F0", paddingTop: "12px" }}>
              <span className="ret-detail-label">Total Amount</span>
              <span className="ret-detail-price" style={{ fontSize: "18px" }}>₹{item.totalAmount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 2: Customer Information */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="ret-card" style={{ height: "100%" }}>
          <h3 className="ret-section-title">
            <User size={18} />
            Customer Information
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="ret-info-block">
              <span className="ret-info-label">Customer Name</span>
              <span className="ret-info-val" style={{ fontSize: "15px" }}>{item.customerName || "-"}</span>
            </div>
            <div className="ret-info-block ret-address-block">
              <span className="ret-info-label">Delivery Address</span>
              <p style={{ marginTop: "6px", fontSize: "13px", lineHeight: "1.6", color: "#475569" }}>
                {item.customerAddress || "No delivery address provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Return Reason & Evidence Images */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Reason Card */}
        <ReturnReasonCard reason={item.reason} message={item.message} />

        {/* Evidence Card */}
        <div className="ret-card">
          <h3 className="ret-section-title">
            <ImageIcon size={18} />
            Evidence Images
          </h3>
          <div style={{ marginTop: "12px" }}>
            <ReturnExchangeImages images={item.returnimage} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default ReturnExchangeDetails;
