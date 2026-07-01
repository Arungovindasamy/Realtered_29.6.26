import React, { useState, useEffect } from "react";
import { X, ArrowLeft, ShieldCheck, HelpCircle, Truck, RefreshCcw } from "lucide-react";
import { getProductDetails } from "../../services/sellerService";
import "./BrandingInfoCard.css";

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f1f3f6' rx='8'/%3E%3Ctext x='30' y='35' text-anchor='middle' fill='%23b0b7c3' font-size='22'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E";

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

const BrandingInfoCard = ({ product, isOpen, onClose, onActionClick }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    if (!product || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(product.Table_ID);
        setDetails(res);
      } catch (err) {
        console.error("Error loading drawer details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleAction = (e) => {
    e.stopPropagation();
    onActionClick(product, details?.sellAndEarn === true ? "disable" : "enable");
  };

  // Setup visual media slides
  const images = [];
  if (details?.mainmedia) images.push(resolveWixImage(details.mainmedia));
  if (Array.isArray(details?.productImages)) {
    details.productImages.forEach(img => {
      const url = resolveWixImage(img);
      if (url && !images.includes(url)) images.push(url);
    });
  }
  if (images.length === 0) images.push(FALLBACK_IMG);

  const activeImage = images[activeImgIndex] || images[0];

  const price = details?.price || product.price || 0;
  const isPromoted = details ? details.sellAndEarn === true : product.sellAndEarn === true;

  // Mock specs matching screenshot if not present in API data
  const specList = [
    { label: "Fabric", value: details?.fabric || "Cotton / Poly Blend" },
    { label: "Fit/Shape", value: details?.fit || "Oversize" },
    { label: "Net Quantity (N)", value: details?.quantity || "1" },
    { label: "Neck", value: details?.neck || "Round Neck" },
    { label: "Occasion", value: details?.occasion || "Casual Wear" },
    { label: "Pattern", value: details?.pattern || "Printed / Solid" },
    { label: "Sleeve Length", value: details?.sleeve || "Short Sleeves" },
    { label: "Country of Origin", value: details?.origin || "India" },
    { label: "Print Or Pattern Type", value: details?.printType || "Graphic Print" }
  ];

  // Mock sizes list matching screenshot
  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="ib-drawer-overlay" onClick={onClose}>
      <div className="ib-drawer-card" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="ib-drawer-header">
          <button className="ib-drawer-back-btn" onClick={onClose}>
            <ArrowLeft size={20} />
            <span className="ib-drawer-header-title">Product Details</span>
          </button>
          <button className="ib-drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="ib-drawer-loading">
            <div className="ib-drawer-spinner" />
            <p>Fetching specifications...</p>
          </div>
        ) : (
          <div className="ib-drawer-body">
            {/* Image Slider Wrapper */}
            <div className="ib-drawer-media-wrap">
              <img 
                src={activeImage} 
                alt="Product visual" 
                className="ib-drawer-main-img" 
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
              />
              {images.length > 1 && (
                <div className="ib-drawer-dots">
                  {images.map((_, idx) => (
                    <button 
                      key={idx} 
                      className={`ib-drawer-dot ${idx === activeImgIndex ? "active" : ""}`}
                      onClick={() => setActiveImgIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta Info */}
            <div className="ib-drawer-meta-section">
              <span className="ib-drawer-brand-label">Brand: <strong>{details?.brand || product.brand || localStorage.getItem("companyName") || ""}</strong></span>
              <h3 className="ib-drawer-name">{details?.name || product.name || "Untitled Listing"}</h3>
              <div className="ib-drawer-price-row">
                <span className="ib-drawer-price-label">Price:</span>
                <span className="ib-drawer-price-val">₹{price.toLocaleString()}</span>
              </div>
            </div>

            {/* Size badges list matching screenshot */}
            <div className="ib-drawer-sizes-section">
              <span className="ib-drawer-section-label">Available Sizes</span>
              <div className="ib-drawer-sizes-grid">
                {sizes.map((s, idx) => (
                  <div key={idx} className="ib-drawer-size-badge">
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Specced Policies COD / Return */}
            <div className="ib-drawer-policies">
              <div className="ib-policy-item">
                <Truck size={18} className="ib-policy-icon" />
                <div className="ib-policy-text">
                  <span className="ib-policy-title">Accept COD</span>
                  <span className="ib-policy-sub">Cash on Delivery Available</span>
                </div>
              </div>
              <div className="ib-policy-item">
                <RefreshCcw size={18} className="ib-policy-icon" />
                <div className="ib-policy-text">
                  <span className="ib-policy-title">Product Return</span>
                  <span className="ib-policy-sub">7 Days Easy Return/Exchange</span>
                </div>
              </div>
            </div>

            {/* Variant Price Difference Grid */}
            <div className="ib-drawer-section ib-drawer-variants">
              <h4 className="ib-drawer-section-label">Variant Price Difference</h4>
              <div className="ib-variants-table-wrap">
                <table className="ib-variants-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.slice(1, 5).map((s, idx) => (
                      <tr key={idx}>
                        <td>{s}</td>
                        <td className="ib-variant-price-cell">₹{price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Specifications Grid Table */}
            <div className="ib-drawer-section ib-drawer-specs">
              <h4 className="ib-drawer-section-label">Specifications</h4>
              <div className="ib-specs-grid">
                {specList.map((spec, idx) => (
                  <div key={idx} className="ib-spec-row">
                    <span className="ib-spec-label">{spec.label}</span>
                    <span className="ib-spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sticky Actions Footer */}
        {!loading && (
          <div className="ib-drawer-footer">
            <button 
              className={`ib-drawer-action-btn ${isPromoted ? "disable-btn" : "promote-btn"}`}
              onClick={handleAction}
            >
              {isPromoted ? "Stop Promoting" : "Promote"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingInfoCard;
