import React, { useEffect, useCallback } from "react";
import "./LogoutConfirmModal.css";

/**
 * LogoutConfirmModal
 *
 * A centered confirmation popup — no dark overlay, no blur, no layout shift.
 * All existing auth / session logic is handled by the caller; this component
 * only decides whether the user confirmed or cancelled.
 *
 * Props
 *   isOpen   {boolean}  — controls visibility
 *   onYes    {function} — called when the user clicks "Yes"
 *   onNo     {function} — called when the user clicks "No" or closes the popup
 */
function LogoutConfirmModal({ isOpen, onYes, onNo }) {
  /* Close on Escape key */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) onNo();
    },
    [isOpen, onNo]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    /* Transparent, non-blurring positioner */
    <div className="lcm-positioner" role="dialog" aria-modal="true" aria-labelledby="lcm-title">
      <div className="lcm-card">
        {/* Header */}
        <div className="lcm-header">
          <div className="lcm-title-row">
            <div className="lcm-icon-wrap" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <h2 id="lcm-title" className="lcm-title">Logout</h2>
          </div>
          <button
            className="lcm-close-btn"
            onClick={onNo}
            aria-label="Cancel logout"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="lcm-divider" />

        {/* Body */}
        <p className="lcm-message">Do you really want to exit the web page?</p>

        {/* Actions */}
        <div className="lcm-actions">
          <button className="lcm-btn lcm-btn--no" onClick={onNo}>
            No
          </button>
          <button className="lcm-btn lcm-btn--yes" onClick={onYes}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;