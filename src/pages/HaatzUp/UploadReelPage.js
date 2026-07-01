import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  AlertCircle,
  Film,
  RefreshCw,
  Clock
} from "lucide-react";
import { getSellerId } from "../../utils/sellerSession";
import { haatzupService, uploadMediaFile } from "../../services/sellerService";
import "./UploadReelPage.css";

const MAX_FILE_SIZE_MB = 100;

const UploadReelPage = () => {
  const sellerId = getSellerId();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // API Data
  const [products, setProducts] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [publishType, setPublishType] = useState("publishNow"); // "publishNow" | "scheduled"

  // Schedule States
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => new Date());
  const [scheduledTime, setScheduledTime] = useState(() => {
    const d = new Date();
    const hrs = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}`;
  });
  const [confirmedSchedule, setConfirmedSchedule] = useState(null);

  // Validation & Toast
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load Products for Promotion
  const loadProducts = useCallback(async () => {
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    if (!resolvedSellerId || resolvedSellerId === "null" || resolvedSellerId === "undefined") {
      setError("Seller session not found. Please login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await haatzupService.getProductsForPromotion(resolvedSellerId);
      const parsedProducts = res?.data || res?.message?.products || res?.products || res || [];
      const productList = Array.isArray(parsedProducts) ? parsedProducts : [];
      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProductId(productList[0].id || productList[0]._id || productList[0].productId || "");
      }
    } catch (err) {
      console.error("[UploadReelPage] Failed loading products:", err);
      setError("Failed to load products for promotion.");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // File Selection & Validation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    const errors = { ...validationErrors };
    delete errors.file;

    if (!file.type.startsWith("video/")) {
      errors.file = "Unsupported format. Please select a video file (MP4, MOV).";
      setValidationErrors(errors);
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > MAX_FILE_SIZE_MB) {
      errors.file = `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
      setValidationErrors(errors);
      return;
    }

    setVideoFile(file);
    setValidationErrors(errors);
  };

  const removeSelectedFile = () => {
    setVideoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Schedule Modal Calendar State & Helpers
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const realToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    setCalendarMonth(new Date(y, m - 1, 1));
  };

  const handleNextMonth = () => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    setCalendarMonth(new Date(y, m + 1, 1));
  };

  const handleDateSelect = (dayNum) => {
    const y = calendarMonth.getFullYear();
    const m = calendarMonth.getMonth();
    const selected = new Date(y, m, dayNum);
    selected.setHours(0, 0, 0, 0);
    if (selected < realToday) return; // disable past dates
    setScheduledDate(selected);
  };

  const formatDisplaySchedule = (sched) => {
    if (!sched || !sched.date) return "";
    const d = sched.date;
    const day = d.getDate();
    const monthStr = d.toLocaleDateString("en-US", { month: "short" });
    const year = d.getFullYear();
    
    // Format time 12hr AM/PM
    const [hrsStr, minsStr] = (sched.time || "12:00").split(":");
    let hrs = parseInt(hrsStr, 10);
    const ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12 || 12;
    const timeFormatted = `${String(hrs).padStart(2, "0")}:${minsStr} ${ampm}`;

    return `${day} ${monthStr} ${year}, ${timeFormatted}`;
  };

  const handleConfirmSchedule = () => {
    const now = new Date();
    const checkDate = new Date(scheduledDate);
    const [hrs, mins] = scheduledTime.split(":").map(Number);
    checkDate.setHours(hrs, mins, 0, 0);

    if (checkDate <= now) {
      showToast("Scheduled date & time must be in the future", "error");
      return;
    }

    setConfirmedSchedule({ date: scheduledDate, time: scheduledTime, fullDate: checkDate });
    setPublishType("scheduled");
    setShowScheduleModal(false);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    
    if (!resolvedSellerId) {
      showToast("Seller ID session missing", "error");
      return;
    }
    if (!videoFile) {
      showToast("Please select a video file to upload", "error");
      return;
    }
    if (publishType === "scheduled" && !confirmedSchedule) {
      showToast("Please select a scheduled date and time", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Upload media file to get public URL
      console.log("[UploadReelPage] Uploading media file to obtain public URL...");
      const videoUrl = await uploadMediaFile(videoFile);
      console.log("[UploadReelPage] Media upload success. URL:", videoUrl);
      setUploadProgress(60);

      // Format scheduledAt YYYY-MM-DD HH:mm:ss if scheduled
      let scheduledAtStr = undefined;
      if (publishType === "scheduled" && confirmedSchedule) {
        const cd = confirmedSchedule.fullDate;
        const yyyy = cd.getFullYear();
        const mm = String(cd.getMonth() + 1).padStart(2, "0");
        const dd = String(cd.getDate()).padStart(2, "0");
        const hh = String(cd.getHours()).padStart(2, "0");
        const min = String(cd.getMinutes()).padStart(2, "0");
        const ss = "00";
        scheduledAtStr = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
      }

      // Step 2: Call uploadhaatzupVideo API
      const payload = {
        sellerId: resolvedSellerId,
        productId: selectedProductId || "",
        url: videoUrl,
        caption: caption.trim(),
        publishType: publishType === "scheduled" ? "scheduled" : "now",
        ...(scheduledAtStr ? { scheduledAt: scheduledAtStr } : {})
      };

      console.log("[UploadReelPage] Submitting uploadhaatzupVideo payload:", payload);
      await haatzupService.uploadhaatzupVideo(payload, (percent) => {
        setUploadProgress(60 + Math.round((percent * 40) / 100));
      });

      setUploadProgress(100);
      showToast("HaatzUp reel uploaded successfully!");
      setTimeout(() => {
        navigate("/haatzup");
      }, 1200);
    } catch (err) {
      console.error("[UploadReelPage] Upload failed:", err);
      showToast(err.message || "Failed to upload video reel.", "error");
    } finally {
      setUploading(false);
    }
  };

  const isUploadDisabled = uploading || !videoFile || (publishType === "scheduled" && !confirmedSchedule);

  return (
    <div className="ur-page-root" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {toast && (
        <div className={`ur-toast-banner ${toast.type}`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Blue Top Navigation Header matching reference */}
      <div style={{ backgroundColor: "#2563eb", color: "#ffffff", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          type="button"
          onClick={() => navigate("/haatzup")}
          style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}
          aria-label="Back to HaatzUp"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#ffffff" }}>
          Upload Reel
        </h1>
      </div>

      <div style={{ maxWidth: "640px", margin: "24px auto", padding: "0 16px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", background: "#ffffff", borderRadius: "16px" }}>
            <RefreshCw size={32} className="spinner-icon" color="#2563eb" />
            <p style={{ color: "#64748b", marginTop: "12px" }}>Loading form...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "32px", textAlign: "center", background: "#ffffff", borderRadius: "16px" }}>
            <AlertCircle size={40} color="#ef4444" />
            <p style={{ color: "#ef4444", marginTop: "12px", fontWeight: "600" }}>{error}</p>
            <button type="button" onClick={loadProducts} style={{ marginTop: "12px", padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", marginBottom: "24px" }}>
              
              {/* Top Row: Tap to Upload box & Caption input (Image 2 & 4 style) */}
              <div style={{ display: "flex", gap: "20px", marginBottom: "24px", alignItems: "flex-start" }}>
                {/* Left Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "120px",
                    height: "150px",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "12px",
                    border: "2px dashed #cbd5e1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: "8px",
                    textAlign: "center",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    style={{ display: "none" }}
                  />
                  {videoFile ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <Film size={32} color="#2563eb" />
                      <span style={{ fontSize: "11px", fontWeight: "600", color: "#334155", marginTop: "6px", wordBreak: "break-all", lineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {videoFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSelectedFile(); }}
                        style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} color="#94a3b8" style={{ marginBottom: "8px" }} />
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                        Tap to Upload
                      </span>
                    </>
                  )}
                </div>

                {/* Right Side: Caption input and char counter */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "150px" }}>
                  <textarea
                    placeholder="Enter Caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={180}
                    style={{
                      width: "100%",
                      height: "110px",
                      border: "none",
                      borderBottom: "1px solid #cbd5e1",
                      borderRadius: "0",
                      padding: "8px 0",
                      fontSize: "15px",
                      color: "#0f172a",
                      outline: "none",
                      resize: "none",
                      backgroundColor: "transparent"
                    }}
                  />
                  <div style={{ textAlign: "right", fontSize: "13px", color: "#94a3b8", fontWeight: "500" }}>
                    {caption.length}/180
                  </div>
                </div>
              </div>

              {/* Publish Options Section matching reference */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                  Publish
                </h3>

                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "8px 16px" }}>
                  {/* Option 1: Publish now */}
                  <div
                    onClick={() => {
                      setPublishType("publishNow");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 0",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9"
                    }}
                  >
                    <input
                      type="radio"
                      name="publishOption"
                      checked={publishType === "publishNow"}
                      onChange={() => setPublishType("publishNow")}
                      style={{ width: "20px", height: "20px", accentColor: "#2563eb", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                      Publish now
                    </span>
                  </div>

                  {/* Option 2: Schedule later */}
                  <div
                    onClick={() => {
                      setPublishType("scheduled");
                      setShowScheduleModal(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 0",
                      cursor: "pointer"
                    }}
                  >
                    <input
                      type="radio"
                      name="publishOption"
                      checked={publishType === "scheduled"}
                      onChange={() => {
                        setPublishType("scheduled");
                        setShowScheduleModal(true);
                      }}
                      style={{ width: "20px", height: "20px", accentColor: "#2563eb", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "15px", fontWeight: "500", color: "#0f172a" }}>
                      Schedule later
                    </span>
                  </div>
                </div>

                {/* Selected Schedule Preview underneath (Image 4 style) */}
                {publishType === "scheduled" && confirmedSchedule && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px", paddingLeft: "16px", color: "#334155", fontSize: "14px", fontWeight: "500" }}>
                    <Clock size={18} color="#475569" />
                    <span>{formatDisplaySchedule(confirmedSchedule)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress Bar if uploading */}
            {uploading && (
              <div style={{ background: "#ffffff", padding: "16px 24px", borderRadius: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "8px" }}>
                  <span>Uploading video reel...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#2563eb", transition: "width 0.3s ease" }} />
                </div>
              </div>
            )}

            {/* Bottom Submit Button */}
            <button
              type="submit"
              disabled={isUploadDisabled}
              style={{
                width: "100%",
                backgroundColor: isUploadDisabled ? "#cbd5e1" : "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "16px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "16px",
                cursor: isUploadDisabled ? "not-allowed" : "pointer",
                boxShadow: isUploadDisabled ? "none" : "0 4px 12px rgba(37, 99, 235, 0.25)",
                transition: "all 0.2s ease"
              }}
            >
              {uploading ? "Processing..." : "Upload HaatzUp"}
            </button>
          </form>
        )}
      </div>

      {/* Schedule Post Modal matching Reference Image 3 */}
      {showScheduleModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowScheduleModal(false)}>
          <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "#ffffff", borderTopLeftRadius: "24px", borderTopRightRadius: "24px", padding: "24px", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                Schedule Post
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Single Month Calendar Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "16px", fontWeight: "600", color: "#334155" }}>
                <span>{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</span>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <button type="button" onClick={handlePrevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}>
                  <ChevronLeft size={20} />
                </button>
                <button type="button" onClick={handleNextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0 }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "12px" }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                <span key={idx} style={{ fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: "8px", textAlign: "center", marginBottom: "20px" }}>
              {(() => {
                const year = calendarMonth.getFullYear();
                const month = calendarMonth.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInM = new Date(year, month + 1, 0).getDate();
                
                const grid = [];
                for (let i = 0; i < firstDay; i++) grid.push(null);
                for (let d = 1; d <= daysInM; d++) grid.push(d);

                return grid.map((dayNum, idx) => {
                  if (!dayNum) return <div key={`emp-${idx}`} style={{ height: "36px" }} />;
                  const dateObj = new Date(year, month, dayNum);
                  dateObj.setHours(0, 0, 0, 0);
                  const isPast = dateObj < realToday;
                  const isSelected = scheduledDate &&
                    scheduledDate.getFullYear() === year &&
                    scheduledDate.getMonth() === month &&
                    scheduledDate.getDate() === dayNum;

                  return (
                    <div key={dayNum} style={{ height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleDateSelect(dayNum)}
                        disabled={isPast}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: "none",
                          backgroundColor: isSelected ? "#2563eb" : "transparent",
                          color: isPast ? "#cbd5e1" : (isSelected ? "#ffffff" : "#334155"),
                          fontWeight: isSelected ? "700" : "500",
                          fontSize: "14px",
                          cursor: isPast ? "not-allowed" : "pointer"
                        }}
                      >
                        {dayNum}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>

            <div style={{ borderTop: "1px solid #e2e8f0", margin: "16px 0" }} />

            {/* Time Row matching Reference Image 3 */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <Clock size={20} color="#475569" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#0f172a",
                  outline: "none",
                  cursor: "pointer"
                }}
              />
            </div>

            {/* Modal Bottom Continue Button */}
            <button
              type="button"
              onClick={handleConfirmSchedule}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                padding: "14px",
                borderRadius: "12px",
                fontWeight: "600",
                fontSize: "16px",
                cursor: "pointer"
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReelPage;
