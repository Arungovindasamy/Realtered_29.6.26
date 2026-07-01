import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import "./OrdersView.css";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

const renderProductOption = (option) => {
  if (!option) return "-";
  if (typeof option === "object") {
    return option.Size || option.size || Object.values(option)[0] || "-";
  }
  return String(option);
};

const getStatusBadgeClass = (status) => {
  if (status === "Order Placed" || status === "Order Confirmed") {
    return "status-confirmed";
  } else if (status === "Shipped") {
    return "status-shipped";
  } else if (status === "Order Cancelled") {
    return "status-cancelled";
  }
  return "status-pending";
};

const OrdersView = ({ orders = [], loading, statusType }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return orders.slice(start, start + itemsPerPage);
  }, [orders, currentPage]);

  const handleViewDetails = (order) => {
    navigate(`/dashboard/orders/details/${order.tableId}`, { state: { fromTab: statusType } });
  };

  if (loading) {
    return (
      <div className="orders-view-loading">
        {/* Skeleton Table for Desktop */}
        <div className="desktop-only orders-table-skeleton glass-card">
          <div className="skeleton-header-row"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-img-sm" />
              <div className="skeleton skeleton-text-short" />
              <div className="skeleton skeleton-text-medium" />
              <div className="skeleton skeleton-text-short" />
              <div className="skeleton skeleton-text-short" />
              <div className="skeleton skeleton-text-short" />
              <div className="skeleton skeleton-text-badge" />
              <div className="skeleton skeleton-btn" />
            </div>
          ))}
        </div>
        {/* Skeleton Cards for Mobile */}
        <div className="mobile-only mobile-cards-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mobile-skeleton-item">
              <div className="skeleton skeleton-circle" />
              <div className="skeleton-lines">
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line medium" />
                <div className="skeleton skeleton-line short" />
                <div className="skeleton skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="orders-view-container">
      {/* DESKTOP & TABLET VIEW */}
      <div className="desktop-only orders-table-wrapper glass-card">
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Order ID</th>
                <th>Product Name</th>
                <th>Size</th>
                <th>Order Date</th>
                <th>Estimated Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const statusClass = getStatusBadgeClass(order.status);
                return (
                  <tr key={order.tableId} className="order-table-row">
                    <td>
                      <div className="table-product-thumbnail">
                        <img
                          src={order.productimage || "https://via.placeholder.com/50"}
                          alt={order.items || "Product"}
                        />
                      </div>
                    </td>
                    <td className="table-order-id">#{order.orderId}</td>
                    <td className="table-product-name" title={order.items}>
                      <span className="order-product-link" onClick={(e) => { e.stopPropagation(); handleViewDetails(order); }}>
                        {order.items}
                      </span>
                    </td>
                    <td>
                      <span className="table-meta-text">{renderProductOption(order.productOption)}</span>
                    </td>
                    <td>
                      <span className="table-meta-text">
                        {order.createdDate ? new Date(order.createdDate).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="table-meta-text">
                        {order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${statusClass}`}>{order.status}</span>
                    </td>
                    <td>
                      <button className="btn-table-action" onClick={() => handleViewDetails(order)}>
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

        {/* Desktop Pagination */}
        {totalPages > 1 && (
          <div className="table-pagination">
            <span className="pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
            </span>
            <div className="pagination-controls">
              <button
                className="btn-pagination"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn-pagination-page ${currentPage === i + 1 ? "active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="btn-pagination"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="mobile-only mobile-order-cards">
        {orders.map((order) => {
          return (
            <div
              key={order.tableId}
              className="mobile-order-item"
              onClick={() => handleViewDetails(order)}
            >
              <div className="mobile-order-img-wrap">
                <img
                  src={order.productimage || "https://via.placeholder.com/80"}
                  alt={order.items || "Product"}
                />
              </div>
              <div className="mobile-order-details">
                <p className="mobile-order-id">Order ID: {order.orderId}</p>
                <p className="mobile-order-name">Product: {order.items}</p>
                <p className="mobile-order-status">
                  Status: <span>{order.status}</span>
                </p>
                {order.productOption && (
                  <p className="mobile-order-size">Size: {renderProductOption(order.productOption)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersView;
