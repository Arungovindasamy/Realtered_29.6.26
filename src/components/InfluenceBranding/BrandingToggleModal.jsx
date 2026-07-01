import React from "react";
import "./BrandingToggleModal.css";

const BrandingToggleModal = ({ isOpen, onClose, onConfirm, type, count = 1 }) => {
  if (!isOpen) return null;

  const isEnable = type === "enable" || type === "single-promote";
  const title = isEnable ? "Start Promote" : "Stop Promote";

  return (
    <div className="ib-modal-overlay" onClick={onClose}>
      <div className="ib-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ib-modal-body">
          <h3 className="ib-modal-title">{title}</h3>

          {isEnable ? (
            <div className="ib-modal-bullets" style={{ marginTop: "16px", textAlign: "left" }}>
              <div className="ib-modal-bullet" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                <span className="ib-bullet-emoji" style={{ fontSize: "18px", lineHeight: "1.3", flexShrink: 0 }}>📢</span>
                <p style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0, color: "#1A1A1A" }}>
                  <strong>Get Featured on Instagram & YouTube!</strong> Creator marketing details promote your products, bringing you more sales.
                </p>
              </div>
              <div className="ib-modal-bullet" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                <span className="ib-bullet-emoji" style={{ fontSize: "18px", lineHeight: "1.3", flexShrink: 0 }}>💸</span>
                <p style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0, color: "#1A1A1A" }}>
                  <strong>Only 7% of net revenue</strong> – No upfront cost!
                </p>
              </div>
              <div className="ib-modal-bullet" style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
                <span className="ib-bullet-emoji" style={{ fontSize: "18px", lineHeight: "1.3", flexShrink: 0 }}>💡</span>
                <p style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0, color: "#1A1A1A" }}>
                  Ready to boost your business?
                </p>
              </div>
              <div className="ib-modal-bullet" style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span className="ib-bullet-emoji" style={{ fontSize: "18px", lineHeight: "1.3", flexShrink: 0 }}>✅</span>
                <p style={{ fontSize: "13.5px", lineHeight: "1.5", margin: 0, color: "#1A1A1A" }}>
                  Yes, I'm In! | <span className="ib-bullet-emoji-inline" style={{ fontSize: "14px" }}>❌</span> No, Maybe Later
                </p>
              </div>
            </div>
          ) : (
            <p className="ib-modal-description" style={{ marginTop: "16px" }}>
              {count > 1 
                ? "Are you sure you want to stop promoting the selected products?"
                : "Do you want to stop promoting this product?"}
            </p>
          )}
        </div>

        <div className="ib-modal-footer">
          <button className="ib-modal-btn ib-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="ib-modal-btn ib-btn-ok" onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingToggleModal;
