import React from "react";
import "./BrandingProductCard.css";

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

const BrandingProductCard = ({ 
  product, 
  isSelected = false, 
  onSelectRow, 
  onOpenDetails,
  isSelectionMode = false
}) => {
  if (!product) return null;

  const isPromoted = product.sellAndEarn === true;
  const imgUrl = resolveWixImage(product.mainmedia) || FALLBACK_IMG;
  const price = Number(product.price) || 0;
  const discount = product.discount || {};
  const finalPrice = discount?.type && discount.value != null
    ? (discount.type === "AMOUNT" ? Math.max(0, price - discount.value) : Math.max(0, price - (price * discount.value) / 100))
    : price;
  const stock = Number(product.inventory) || 0;

  const handleCardClick = () => {
    if (isSelectionMode) {
      onSelectRow(product.Table_ID);
    } else {
      onOpenDetails(product);
    }
  };

  return (
    <div 
      className={`ib-mobile-card ${isSelected ? "selected" : ""}`}
      onClick={handleCardClick}
    >
      {/* Checkbox (stop propagation to avoid opening details when checking) */}
      {isSelectionMode && (
        <div className="ib-mobile-card-check" onClick={(e) => e.stopPropagation()}>
          <label className="ib-checkbox-label">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectRow(product.Table_ID)}
            />
            <span className="ib-custom-checkbox"></span>
          </label>
        </div>
      )}

      {/* Image Thumbnail */}
      <img
        src={imgUrl}
        alt={product.name}
        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
        className="ib-mobile-card-img"
      />

      {/* Product Details info */}
      <div className="ib-mobile-card-info">
        <h4 className="ib-mobile-card-name">{product.name || "-"}</h4>
        <span className={`ib-mobile-card-status ${isPromoted ? "promoted" : "not-promoted"}`}>
          {isPromoted ? "Promoted" : "Not Promoted"}
        </span>
      </div>

      {/* Pricing info */}
      <div className="ib-mobile-card-right">
        <span className="ib-mobile-card-sale-label">
          {stock === 0 ? "Out of Stock" : stock < 20 ? "Low Stock" : "OnSale"}
        </span>
        <span className="ib-mobile-card-price">₹{finalPrice.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default BrandingProductCard;
