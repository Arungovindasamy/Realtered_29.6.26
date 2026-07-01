import React from "react";
import { RotateCcw, AlertCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReturnExchangeStatusBadge from "./ReturnExchangeStatusBadge";
import "../orders/OrdersView.css";

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

const renderItemSize = (item) => {
  if (!item) return "-";
  
  let option = item.productOption || item.productOptions || item.size || item.Size;
  if (!option) return "-";

  if (typeof option === "string") {
    const trimmed = option.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        option = JSON.parse(trimmed);
      } catch (e) {
        // not valid JSON
      }
    }
  }

  if (typeof option === "object" && option !== null) {
    return option.Size || option.size || Object.values(option)[0] || "-";
  }

  return String(option);
};

const ReturnExchangeList = ({ items, activeTab, loading, error, refreshAction, searchQuery }) => {
  const navigate = useNavigate();

  const handleNavigate = (tableId) => {
    navigate(`/return-exchange/details/${tableId}`);
  };

  if (activeTab === "Claim") {
    return (
      <div 
        className="ret-card ret-empty-state" 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: "80px 24px", 
          textAlign: "center",
          maxWidth: "600px",
          margin: "40px auto",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.03)"
        }}
      >
        <div 
          style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            background: "rgba(41, 98, 255, 0.05)", 
            color: "#2962FF", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            marginBottom: "24px" 
          }}
        >
          {/* Custom document with search and close cross icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="14" y2="17" />
            <circle cx="18" cy="18" r="4.5" fill="#EF4444" stroke="none" />
            <path d="m16.5 16.5 3 3" stroke="#FFF" strokeWidth="1.5" />
            <path d="m19.5 16.5-3 3" stroke="#FFF" strokeWidth="1.5" />
          </svg>
        </div>
        <p style={{ fontSize: "16px", color: "#475569", fontWeight: "600", marginBottom: "32px", maxWidth: "340px", lineHeight: "1.6" }}>
          Upgrade your plan to access this feature.
        </p>
        <button 
          className="ret-btn ret-btn-primary" 
          onClick={() => navigate("/dashboard/growplan")}
          style={{ padding: "14px 44px", borderRadius: "14px", fontSize: "15px", fontWeight: "700", boxShadow: "0 8px 20px rgba(41, 98, 255, 0.25)", border: "none", cursor: "pointer" }}
        >
          Upgrade Plan
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ret-card ret-loading-box">
        <div className="ret-spinner ret-spinner-dark" />
        <p>Fetching return records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ret-card ret-empty-state">
        <div className="ret-empty-icon-wrap" style={{ color: "#EF4444", background: "rgba(239, 68, 68, 0.05)" }}>
          <AlertCircle size={32} />
        </div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button className="ret-btn ret-btn-primary" style={{ marginTop: "16px" }} onClick={refreshAction}>
          Retry Now
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="ret-card ret-empty-state">
        <div className="ret-empty-icon-wrap">
          <RotateCcw size={32} />
        </div>
        <h3>No Requests Found</h3>
        <p>
          {searchQuery
            ? `No return or exchange items match the query "${searchQuery}" in this tab.`
            : `There are currently no active ${activeTab.toLowerCase()} requests in your account.`}
        </p>
      </div>
    );
  }

  return (
    <div className="orders-view-container" style={{ width: "100%" }}>
      {/* DESKTOP TABLE VIEW */}
      <div className="desktop-only orders-table-wrapper glass-card">
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Size</th>
                <th>Request Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const reqDate = activeTab === "Exchange" ? item.exchangeDate : item.returnDate;
                return (
                  <tr 
                    key={item.TableID} 
                    className="order-table-row" 
                  >
                    <td>
                      <div className="table-product-thumbnail">
                        <img
                          src={item.productimage || "https://static.wixstatic.com/media/4b1349_8e8421c69837468eac76e48dd6c74279~mv2.jpg"}
                          alt={item.items || "Product"}
                        />
                      </div>
                    </td>
                    <td className="table-order-id">#{item.orderId}</td>
                    <td className="table-product-name" title={item.items}>
                      <span 
                        className="order-product-link" 
                        onClick={(e) => { e.stopPropagation(); handleNavigate(item.TableID); }}
                      >
                        {item.items || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="table-meta-text">{renderItemSize(item)}</span>
                    </td>
                    <td>
                      <span className="table-meta-text">{formatDate(reqDate)}</span>
                    </td>
                    <td>
                      <span className="table-meta-text" style={{ fontWeight: 700, color: "#2962FF" }}>₹{item.totalAmount || 0}</span>
                    </td>
                    <td>
                      <ReturnExchangeStatusBadge status={item.status} />
                    </td>
                    <td>
                      <button 
                        className="btn-table-action" 
                        onClick={(e) => { e.stopPropagation(); handleNavigate(item.TableID); }}
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="mobile-only mobile-order-cards">
        {items.map((item) => {
          return (
            <div
              key={item.TableID}
              className="mobile-order-item"
              onClick={() => handleNavigate(item.TableID)}
            >
              <div className="mobile-order-img-wrap">
                <img
                  src={item.productimage || "https://static.wixstatic.com/media/4b1349_8e8421c69837468eac76e48dd6c74279~mv2.jpg"}
                  alt={item.items || "Product"}
                />
              </div>
              <div className="mobile-order-details">
                <p className="mobile-order-id">Order ID: #{item.orderId}</p>
                <p className="mobile-order-name">Product: {item.items || "N/A"}</p>
                <p className="mobile-order-size">Size: {renderItemSize(item)}</p>
                <p className="mobile-order-price" style={{ margin: "4px 0 0 0", fontWeight: 700, color: "#2962FF" }}>
                  Price: ₹{item.totalAmount || 0}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReturnExchangeList;
