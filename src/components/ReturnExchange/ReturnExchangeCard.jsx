import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, DollarSign, Eye } from "lucide-react";
import ReturnExchangeStatusBadge from "./ReturnExchangeStatusBadge";

const ReturnExchangeCard = ({ item, activeTab }) => {
  const navigate = useNavigate();

  const handleNavigate = (e) => {
    e.stopPropagation(); // Stop card click handler
    navigate(`/return-exchange/details/${item.TableID}`);
  };

  const handleCardClick = () => {
    navigate(`/return-exchange/details/${item.TableID}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="ret-item-card" 
      onClick={handleCardClick}
    >
      <img
        src={item.productimage || "https://static.wixstatic.com/media/4b1349_8e8421c69837468eac76e48dd6c74279~mv2.jpg"}
        alt={item.items || "Return Product"}
        className="ret-card-img"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='1.5'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
        }}
      />

      <div className="ret-card-info-wrap" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h3 className="ret-card-name" style={{ fontSize: "16px", fontWeight: "600", color: "#0F172A", margin: "0 0 4px 0" }}>
              {item.items || "N/A"}
            </h3>
            <span style={{ fontSize: "13px", color: "#64748B", fontWeight: "600" }}>Order ID: #{item.orderId}</span>
          </div>
          <ReturnExchangeStatusBadge status={item.status} />
        </div>

        <div style={{ display: "flex", gap: "32px", borderTop: "1px dashed #E2E8F0", paddingTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748B" }}>
            <Calendar size={14} />
            <span>Date: <strong>{formatDate(activeTab === "Exchange" ? item.exchangeDate : item.returnDate)}</strong></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#64748B" }}>
            <DollarSign size={14} />
            <span>Amount: <strong style={{ color: "#2962FF", fontSize: "15px" }}>₹{item.totalAmount || 0}</strong></span>
          </div>
        </div>
      </div>

      <div className="ret-card-action-wrap" style={{ flexShrink: 0 }}>
        <button 
          className="ret-btn ret-btn-primary" 
          onClick={handleNavigate}
          style={{ padding: "12px 24px", borderRadius: "12px" }}
        >
          <Eye size={16} />
          View Details
        </button>
      </div>
    </div>
  );
};

export default ReturnExchangeCard;
