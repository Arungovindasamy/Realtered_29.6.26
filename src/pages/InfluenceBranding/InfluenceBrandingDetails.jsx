import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, BadgePercent, HelpCircle, Eye, Power, Rocket, X } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { getProductDetails } from "../../services/sellerService";
import "./InfluenceBrandingDetails.css";

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

export default function InfluenceBrandingDetails() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isPromoted, setIsPromoted] = useState(false);

  useEffect(() => {
    if (details) {
      let resolved = details.sellAndEarn === true;
      try {
        const raw = localStorage.getItem("haatza_branding_local_overrides");
        if (raw) {
          const overrides = JSON.parse(raw);
          if (overrides[String(tableId)]) {
            resolved = overrides[String(tableId)].status === true;
          }
        }
      } catch (e) {
        console.error("Error reading overrides in details:", e);
      }
      setIsPromoted(resolved);
    }
  }, [details, tableId]);


  const [actionLoading, setActionLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToastMsg = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    if (!tableId) {
      navigate("/dashboard/influencer");
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProductDetails(tableId);
        setDetails(res);
      } catch (err) {
        console.error("Error loading product details overview:", err);
        setError("Failed to fetch product specifications details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [tableId, navigate]);

  const handleActionClick = async (type) => {
    setActionLoading(true);
    const isEnable = type === "enable";

    try {
      const response = await axios.post("https://haatza.com/_functions/updateInfluencerBranding", {
        tableId: [tableId],
        influencerBranding: isEnable
      });

      if (response.data?.status === "success") {
        try {
          const raw = localStorage.getItem("haatza_branding_local_overrides") || "{}";
          const overrides = JSON.parse(raw);
          overrides[String(tableId)] = { status: isEnable, timestamp: Date.now() };
          localStorage.setItem("haatza_branding_local_overrides", JSON.stringify(overrides));
        } catch (e) {
          console.error("Error saving overrides:", e);
        }

        setIsPromoted(isEnable);

        showToastMsg(
          isEnable 
            ? "Influence branding enabled successfully!" 
            : "Influence branding stopped successfully!",
          "success"
        );
        
        // Wait briefly for toast and navigate back immediately updating search state context
        setTimeout(() => {
          navigate("/dashboard/influencer", { 
            state: { 
              fromTab: isEnable ? "promoted" : "not_promoted",
              updatedProductId: tableId,
              updatedStatus: isEnable
            } 
          });
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating influencer status from details page:", err);
      showToastMsg("Failed to update promotion status. Please try again.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ibd-loading-screen">
        <div className="ibd-spinner" />
        <p>Loading specifications details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="ibd-error-screen">
        <AlertTriangle size={48} color="#EF4444" />
        <h3>Failed to load product specifications</h3>
        <p>{error || "We couldn't retrieve the specifications details for this product ID."}</p>
        <button onClick={() => navigate("/dashboard/influencer")} className="ibd-back-to-list-btn">
          Back to Influencer Branding
        </button>
      </div>
    );
  }

  // Setup media image slides
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
  const price = Number(details.price) || 0;
  const discount = details.discount || {};
  const finalPrice = discount?.type && discount.value != null
    ? (discount.type === "AMOUNT" ? Math.max(0, price - discount.value) : Math.max(0, price - (price * discount.value) / 100))
    : price;
  const stock = Number(details.inventory) || 0;

  const specList = [
    { label: "Fabric", value: details.fabric || "Cotton / Poly Blend" },
    { label: "Fit/Shape", value: details.fit || "Oversize" },
    { label: "Net Quantity (N)", value: details.quantity || "1" },
    { label: "Neck", value: details.neck || "Round Neck" },
    { label: "Occasion", value: details.occasion || "Casual Wear" },
    { label: "Pattern", value: details.pattern || "Printed / Solid" },
    { label: "Sleeve Length", value: details.sleeve || "Short Sleeves" },
    { label: "Country of Origin", value: details.origin || "India" },
    { label: "Print Or Pattern Type", value: details.printType || "Graphic Print" }
  ];

  const sizes = ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="ibd-page-wrapper">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            className={`ibd-toast ibd-toast-${toast.type}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ibd-header-navigation">
        <button 
          className="ibd-back-btn" 
          onClick={() => {
            const prevTab = location.state?.fromTab || (isPromoted ? "promoted" : "not_promoted");
            navigate("/dashboard/influencer", { state: { fromTab: prevTab } });
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Influencer Branding</span>
        </button>
      </div>

      <div className="ibd-details-grid">
        {/* Left Column - Product Image Slider */}
        <div className="ibd-column ibd-media-card glass-card">
          <div className="ibd-media-slider">
            <img 
              src={activeImage} 
              alt={details.name} 
              className="ibd-slider-main-image"
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
            />
            {images.length > 1 && (
              <div className="ibd-slider-dots">
                {images.map((_, idx) => (
                  <button 
                    key={idx} 
                    className={`ibd-slider-dot ${idx === activeImgIndex ? "active" : ""}`}
                    onClick={() => setActiveImgIndex(idx)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="ibd-thumbnail-strip">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className={`ibd-thumbnail-item ${idx === activeImgIndex ? "selected" : ""}`}
                onClick={() => setActiveImgIndex(idx)}
              >
                <img src={img} alt="thumbnail" onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Product Meta and specs */}
        <div className="ibd-column ibd-meta-card glass-card">
          <div className="ibd-meta-header">
            <div className="ibd-badges-row">
              <span className="ibd-brand-badge">{details.brand || localStorage.getItem("companyName") || ""}</span>
              <span className="ibd-category-badge">{details.category || details.categoryName || "General"}</span>
            </div>
            <h1 className="ibd-product-title">{details.name || "Untitled Product"}</h1>
            <div className="ibd-pricing-row">
              <span className="ibd-price-num">₹{finalPrice.toLocaleString()}</span>
              <span className={`ibd-stock-badge ${stock === 0 ? "out" : stock < 20 ? "low" : "in"}`}>
                {stock === 0 ? "Out of Stock" : stock < 20 ? `Low Stock (${stock})` : `In Stock (${stock})`}
              </span>
            </div>
          </div>

          <div className="ibd-section-divider"></div>

          {/* Product Description */}
          <div className="ibd-meta-section">
            <h3 className="ibd-section-title">Product Description</h3>
            <p className="ibd-description-text">
              {details.description || "No description provided for this listing. High-quality creator branding product matching Haatza standard specifications details."}
            </p>
          </div>

          <div className="ibd-section-divider"></div>

          {/* Sizes badges */}
          <div className="ibd-meta-section">
            <h3 className="ibd-section-title">Available Sizes</h3>
            <div className="ibd-sizes-flex">
              {sizes.map((s, idx) => (
                <div key={idx} className="ibd-size-badge">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="ibd-section-divider"></div>

          {/* Influencer Branding Details Section */}
          <div className="ibd-meta-section">
            <h3 className="ibd-section-title">Influencer Branding Information</h3>
            <div className="ibd-influencer-status-box">
              <div className="ibd-status-icon-wrap">
                <HelpCircle size={22} className="ibd-status-icon" />
              </div>
              <div className="ibd-status-info">
                <span className="ibd-status-label">Branding Promotion Status</span>
                <span className={`ibd-status-value ${isPromoted ? "active" : "inactive"}`}>
                  {isPromoted ? "Active (Currently Promoted by Creators)" : "Not Active (Available to Promote)"}
                </span>
                <p className="ibd-status-description">
                  {isPromoted 
                    ? "Creators are currently reviewing and promoting this product. Direct traffic conversions will yield commission payouts."
                    : "Start promoting this item to unlock performance-based influencer marketing reach with no upfront fee."}
                </p>
              </div>
            </div>

            <div className="ibd-benefit-mini-grid">
              <div className="ibd-benefit-mini-item">
                <ShieldCheck size={16} />
                <span>Zero Upfront Marketing Fees</span>
              </div>
              <div className="ibd-benefit-mini-item">
                <BadgePercent size={16} />
                <span>Flat Sales Commission Model</span>
              </div>
            </div>
          </div>

          <div className="ibd-section-divider"></div>

          {/* Action buttons */}
          <div className="ibd-actions-section">
            {isPromoted ? (
              <button 
                className="ibd-action-btn ibd-stop-btn"
                onClick={() => handleActionClick("disable")}
                disabled={actionLoading}
              >
                <Power size={16} />
                <span>{actionLoading ? "Processing..." : "Stop Promoting"}</span>
              </button>
            ) : (
              <button 
                className="ibd-action-btn ibd-promote-btn"
                onClick={() => handleActionClick("enable")}
                disabled={actionLoading}
              >
                <Rocket size={16} />
                <span>{actionLoading ? "Processing..." : "Start Promoting"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Specifications table card */}
      <div className="ibd-specs-container glass-card">
        <h2 className="ibd-section-title">Product Specifications</h2>
        <div className="ibd-specs-grid">
          {specList.map((spec, idx) => (
            <div key={idx} className="ibd-spec-row">
              <span className="ibd-spec-label">{spec.label}</span>
              <span className="ibd-spec-value">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
