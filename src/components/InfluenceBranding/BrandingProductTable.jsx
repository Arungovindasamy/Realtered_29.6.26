import React from "react";
import { Rocket, Power, Eye } from "lucide-react";
import "./BrandingProductTable.css";

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f1f3f6' rx='8'/%3E%3Ctext x='30' y='35' text-anchor='middle' fill='%23b0b7c3' font-size='22'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E";

const resolveWixImage = (img) => {
  if (!img) return null;
  const raw =
    typeof img === "string"
      ? img
      : img.src || img.url || img.image || img.imageUrl || null;
  if (!raw) return null;
  if (raw.startsWith("data:")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  if (raw.startsWith("wix:image://")) {
    const withoutScheme = raw.replace(/^wix:image:\/\//, "");
    const withoutVersion = withoutScheme.replace(/^v1\//, "");
    const hashIdx = withoutVersion.indexOf("#");
    const pathPart = hashIdx !== -1 ? withoutVersion.substring(0, hashIdx) : withoutVersion;
    const fileId = pathPart.split("/")[0];
    if (fileId.includes(".")) {
      return `https://static.wixstatic.com/media/${fileId}`;
    }
    return `https://static.wixstatic.com/media/${fileId}~mv2.jpg`;
  }
  return null;
};

const BrandingProductTable = ({ 
  products = [], 
  selectedIds = new Set(), 
  onSelectRow, 
  onSelectAll, 
  onOpenModal, 
  onOpenDetails,
  isSelectionMode = false,
  activeTab
}) => {
  const isAllSelected = products.length > 0 && products.every(p => selectedIds.has(p.Table_ID));

  const handleSelectAllChange = (e) => {
    onSelectAll(e.target.checked);
  };

  return (
    <div className="ib-table-card">
      <div className="ib-table-wrap">
        <table className="ib-table">
          <thead>
            <tr>
              {isSelectionMode && (
                <th className="ib-col-check">
                  <label className="ib-checkbox-label">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAllChange}
                    />
                    <span className="ib-custom-checkbox"></span>
                  </label>
                </th>
              )}
              <th className="ib-col-image">Product</th>
              <th className="ib-col-name">Name</th>
              <th className="ib-col-price">Price</th>
              <th className="ib-col-status">Status</th>
              <th className="ib-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isSelected = selectedIds.has(product.Table_ID);
              const isPromoted = product.sellAndEarn === true;
              const imgUrl = resolveWixImage(product.mainmedia) || FALLBACK_IMG;
              const price = Number(product.price) || 0;
              const discount = product.discount || {};
              const finalPrice = discount?.type && discount.value != null
                ? (discount.type === "AMOUNT" ? Math.max(0, price - discount.value) : Math.max(0, price - (price * discount.value) / 100))
                : price;
              const stock = Number(product.inventory) || 0;

              return (
                <tr key={product.Table_ID} className={isSelected ? "row-selected" : ""}>
                  {isSelectionMode && (
                    <td className="ib-col-check">
                      <label className="ib-checkbox-label">
                        <input
                           type="checkbox"
                           checked={isSelected}
                           onChange={() => onSelectRow(product.Table_ID)}
                        />
                        <span className="ib-custom-checkbox"></span>
                      </label>
                    </td>
                  )}
                  <td className="ib-col-image">
                    <img
                      src={imgUrl}
                      alt={product.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                      className="ib-product-img"
                    />
                  </td>
                  <td className="ib-col-name">
                    <span 
                      className="ib-product-name-link" 
                      onClick={() => onOpenDetails(product)}
                      title="View specifications drawer"
                    >
                      {product.name || "-"}
                    </span>
                  </td>
                  <td className="ib-col-price">
                    <span className="ib-price-value">₹{finalPrice.toLocaleString()}</span>
                  </td>
                  <td className="ib-col-status">
                    <span className={`ib-status-badge ${isPromoted ? "enabled" : "disabled"}`}>
                      <span className="ib-status-dot"></span>
                      {isPromoted ? "Branding Active" : "Not Active"}
                    </span>
                  </td>
                  <td className="ib-col-actions">
                    <div className="ib-actions-cell">
                      {activeTab === "promoted" ? (
                        <button 
                          className="ib-action-icon-btn info-btn"
                          title="View Details"
                          onClick={() => onOpenDetails(product)}
                        >
                          <Eye size={15} />
                        </button>
                      ) : (
                        <button
                          className="ib-action-row-btn btn-primary-gradient"
                          onClick={() => onOpenModal(product, "enable")}
                        >
                          <Rocket size={14} />
                          <span>Promote</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BrandingProductTable;
