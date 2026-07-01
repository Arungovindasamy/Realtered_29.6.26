import React from "react";

const RejectReturnModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="ret-modal-overlay" onClick={onClose}>
      <div className="ret-modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ fontSize: 18, margin: "0 0 10px 0", fontWeight: 700, color: "#0F172A" }}>
          Reject Return Request
        </h2>
        <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px 0", lineHeight: 1.5 }}>
          Are you sure you want to reject this return request?
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button className="ret-btn ret-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="ret-btn ret-btn-danger" onClick={onConfirm}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReturnModal;
