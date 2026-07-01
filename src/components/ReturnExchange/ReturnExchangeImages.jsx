import React, { useState } from "react";
import { Image as ImageIcon, Maximize2, X } from "lucide-react";

const ReturnExchangeImages = ({ images }) => {
  const [activeImagePreview, setActiveImagePreview] = useState(null);

  const getImageUrl = (img) => {
    if (!img) return "";
    return img.src || img.url || img;
  };

  if (!Array.isArray(images) || images.length === 0) {
    return (
      <div style={{ 
        display: "flex", 
        gap: 10, 
        alignItems: "center", 
        padding: "16px", 
        background: "#F8FAFC", 
        borderRadius: "12px", 
        border: "1px dashed #E2E8F0" 
      }}>
        <ImageIcon size={18} style={{ color: "#94A3B8" }} />
        <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
          No return evidence images uploaded.
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="ret-gallery">
        {images.map((img, i) => {
          const url = getImageUrl(img);
          return (
            <div 
              key={i} 
              style={{ position: "relative", display: "inline-block" }} 
              onClick={() => setActiveImagePreview(url)}
            >
              <img
                src={url}
                alt={`Return Proof ${i + 1}`}
                className="ret-gallery-img"
              />
              <div style={{
                position: "absolute",
                right: 6,
                bottom: 6,
                background: "rgba(15,23,42,0.6)",
                color: "#FFFFFF",
                padding: 4,
                borderRadius: 6,
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}>
                <Maximize2 size={10} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Preview Zoom */}
      {activeImagePreview && (
        <div className="ret-lightbox-overlay" onClick={() => setActiveImagePreview(null)}>
          <button className="ret-lightbox-close" onClick={() => setActiveImagePreview(null)}>
            <X size={24} />
          </button>
          <img
            src={activeImagePreview}
            alt="Full Proof Zoom Preview"
            className="ret-lightbox-img"
          />
        </div>
      )}
    </>
  );
};

export default ReturnExchangeImages;
