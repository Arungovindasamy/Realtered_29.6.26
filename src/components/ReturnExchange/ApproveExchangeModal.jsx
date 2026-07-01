import React from "react";

const ApproveExchangeModal = ({ orderId, isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="ret-bottom-sheet-overlay" 
      onClick={() => !loading && onClose()}
    >
      <div className="ret-bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ret-sheet-bar" />
        
        <div className="ret-sheet-header">
          <h2 className="ret-sheet-title">Approve Exchange Request</h2>
          <p className="ret-sheet-desc">Order ID: <strong>{orderId}</strong></p>
        </div>

        <div className="ret-sheet-body">
          Are you sure you want to approve this exchange request? This will initiate the exchange shipment process.
        </div>

        <div className="ret-sheet-actions">
          <button 
            className="ret-btn ret-btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            No
          </button>
          <button 
            className="ret-btn ret-btn-primary" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="ret-spinner" />
                Creating Shipment...
              </>
            ) : (
              "Yes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveExchangeModal;
