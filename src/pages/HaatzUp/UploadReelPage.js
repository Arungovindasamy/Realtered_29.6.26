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
import { haatzupService, uploadMediaFile, fetchCategories, resolveWixImage } from "../../services/sellerService";
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
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [generatingHashtags, setGeneratingHashtags] = useState(false);
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [publishType, setPublishType] = useState("publishNow"); // "publishNow" | "scheduled"
  const [uploadStartTime, setUploadStartTime] = useState("");

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

  // Set upload start time
  useEffect(() => {
    setUploadStartTime(new Date().toISOString());
  }, []);

  // Load Products & Categories
  const loadProductsAndCategories = useCallback(async () => {
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    if (!resolvedSellerId || resolvedSellerId === "null" || resolvedSellerId === "undefined") {
      setError("Seller session not found. Please login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Products
      const res = await haatzupService.getProductsForPromotion(resolvedSellerId, 1, 15);
      
      if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
        console.log("[HaatzUp] product selection API params:", { sellerId: resolvedSellerId, page: 1, limit: 15 });
        console.log("[HaatzUp] product selection API response:", res);
      }

      const dataProducts = res?.message?.data || [];
      const productList = Array.isArray(dataProducts) ? dataProducts : [];
      
      // Filter out products missing fields
      const filtered = productList.filter(p => {
        const id = p.productId || p.id || p._id || p.Table_ID;
        const name = p.name;
        const mainMedia = p.mainMedia || p.main_media || p.mainmedia;
        return Boolean(id) && Boolean(name) && Boolean(mainMedia);
      });

      setProducts(filtered);
      if (filtered.length > 0) {
        const firstId = filtered[0].productId || filtered[0].id || filtered[0]._id || filtered[0].Table_ID;
        setSelectedProductIds([firstId]);
      }

      // 2. Categories
      const cats = await fetchCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error("[UploadReelPage] Failed loading products or categories:", err);
      setError("Failed to load products/categories for promotion.");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadProductsAndCategories();
  }, [loadProductsAndCategories]);

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

  // Helper to extract GUID from video URL
  const extractVideoGuid = (urlStr) => {
    if (!urlStr) return "";
    if (!urlStr.includes("/")) return urlStr; // It's already a GUID
    try {
      const cleanUrl = urlStr.trim();
      const bunnyMatch = cleanUrl.match(/vz-[a-f0-9-]+\.b-cdn\.net\/([a-f0-9-]+)/i);
      if (bunnyMatch && bunnyMatch[1]) return bunnyMatch[1];
      const videosMatch = cleanUrl.match(/\/videos\/([a-f0-9-]+)/i);
      if (videosMatch && videosMatch[1]) return videosMatch[1];
      const urlObj = new URL(cleanUrl);
      const parts = urlObj.pathname.split("/").filter(Boolean);
      if (parts.length > 0) {
        const last = parts[parts.length - 1];
        const dotIndex = last.lastIndexOf(".");
        const name = dotIndex !== -1 ? last.substring(0, dotIndex) : last;
        if ((name.startsWith("play_") || name === "thumbnail" || name === "preview") && parts.length > 1) {
          return parts[parts.length - 2];
        }
        return name;
      }
    } catch (e) {
      console.error("Error extracting video GUID:", e);
    }
    return urlStr;
  };

  // Helper to extract video duration using video metadata
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(Math.round(video.duration) || 0);
      };
      video.onerror = () => {
        resolve(0);
      };
      video.src = window.URL.createObjectURL(file);
    });
  };

  // Hashtags generator
  const handleGenerateHashtags = async () => {
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();

    if (!resolvedSellerId) {
      showToast("Seller session not found. Please login again.", "error");
      return;
    }

    // Resolve the full product objects for selected IDs
    const selectedProducts = products.filter((p) => {
      const id = p.productId || p.id || p._id || p.Table_ID;
      return selectedProductIds.includes(id);
    });

    if (selectedProducts.length === 0) {
      showToast("Please select at least one product to generate hashtags.", "error");
      return;
    }

    // Build the products array matching the backend contract
    const productsPayload = selectedProducts.map((product) => ({
      productId: product.productId || product.id || product._id || product.Table_ID || "",
      productName: product.productName || product.name || product.title || "",
      category: product.category || product.categoryName || product.productCategory || "",
      caption: caption || ""
    }));

    const payload = {
      sellerId: resolvedSellerId,
      products: productsPayload
    };

    setGeneratingHashtags(true);
    try {
      const res = await haatzupService.generateHashtags(payload);

      if (process.env.NODE_ENV !== "production") {
        console.log("[generateHashtags] parsed response:", res);
      }

      if (res?.status === "success" && Array.isArray(res?.message)) {
        // Flatten all hashtags arrays from each product entry
        const allHashtags = res.message
          .flatMap((item) => (Array.isArray(item.hashtags) ? item.hashtags : []))
          .filter(Boolean);

        // Deduplicate
        const uniqueHashtags = [...new Set(allHashtags)];

        if (process.env.NODE_ENV !== "production") {
          console.log("[generateHashtags] parsed hashtags:", uniqueHashtags);
        }

        setGeneratedHashtags(uniqueHashtags);
        if (uniqueHashtags.length === 0) {
          showToast("No hashtags generated. Try adding a caption.", "info");
        }
      } else {
        setGeneratedHashtags([]);
        const errMsg = typeof res?.message === "string" ? res.message : "Failed to generate hashtags";
        showToast(errMsg, "error");
      }
    } catch (err) {
      console.error("[UploadReelPage] Failed generating hashtags:", err);
      showToast(err?.response?.data?.message || err.message || "Failed to generate hashtags", "error");
    } finally {
      setGeneratingHashtags(false);
    }
  };


  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    
    if (!resolvedSellerId) {
      showToast("Seller ID session missing", "error");
      return;
    }
    if (selectedProductIds.length === 0) {
      showToast("Please tag at least one product", "error");
      return;
    }
    if (!videoFile) {
      showToast("Please select a video file to upload", "error");
      return;
    }
    if (!caption.trim()) {
      showToast("Please enter a caption", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Step 1: Extract duration
      console.log("[UploadReelPage] Extracting video duration...");
      const videoDuration = await getVideoDuration(videoFile);
      setUploadProgress(20);

      // Step 2: Upload media file to get public URL
      console.log("[UploadReelPage] Uploading media file to obtain public URL...");
      const videoUrl = await uploadMediaFile(videoFile);
      console.log("[UploadReelPage] Media upload success. URL:", videoUrl);
      setUploadProgress(60);

      // Step 3: Extract guid
      const guid = extractVideoGuid(videoUrl);
      if (!guid) {
        throw new Error("Failed to extract video GUID/ID from uploaded media");
      }

      // Step 4: Build final hashtags array — AI-generated merged with any manual input
      const manualHashtags = hashtagsInput
        .split(/[\s,]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => (tag.startsWith("#") ? tag : `#${tag}`));

      // Merge AI-generated (already parsed strings) with manual; deduplicate
      const finalHashtags = [...new Set([...generatedHashtags, ...manualHashtags])];

      // Step 5: Call uploadhaatzupVideo API
      const payload = {
        tableId: "",
        sellerId: resolvedSellerId,
        productId: selectedProductIds,
        url: guid,
        tags: selectedCategories,
        videoLengthSeconds: Number(videoDuration) || 0,
        uploadDate: uploadStartTime || new Date().toISOString(),
        caption: caption.trim(),
        hastag: finalHashtags,
        status: "In Review"
      };

      if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
        console.log("[HaatzUp] uploadhaatzupVideo payload:", payload);
      }

      const res = await haatzupService.uploadHaatzUpVideo(payload);

      if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
        console.log("[HaatzUp] uploadhaatzupVideo response:", res);
      }

      if (res?.status === "success" && res?.message?.action === "Video Created Successfully") {
        setUploadProgress(100);
        showToast("HaatzUp reel uploaded successfully!");
        setTimeout(() => {
          navigate("/haatzup");
        }, 1200);
      } else {
        throw new Error(res?.message?.action || res?.message || "Failed to create video record on server");
      }
    } catch (err) {
      console.error("[UploadReelPage] Upload failed:", err);
      showToast(err.message || "Failed to upload video reel.", "error");
    } finally {
      setUploading(false);
    }
  };

  const isUploadDisabled = uploading || !videoFile || selectedProductIds.length === 0 || !caption.trim() || (publishType === "scheduled" && !confirmedSchedule);

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
            <button type="button" onClick={loadProductsAndCategories} style={{ marginTop: "12px", padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
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

              {/* Product Picker */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                  Tag Products (Select one or more)
                </h3>
                {products.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "14px" }}>No products available for promotion.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "12px", background: "#f8fafc" }}>
                    {products.map((prod) => {
                      const id = prod.productId || prod.id || prod._id || prod.Table_ID;
                      const isChecked = selectedProductIds.includes(id);
                      return (
                        <label
                          key={id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "6px 12px",
                            background: isChecked ? "#eff6ff" : "#ffffff",
                            border: isChecked ? "1px solid #2563eb" : "1px solid #e2e8f0",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(prev => [...prev, id]);
                              } else {
                                setSelectedProductIds(prev => prev.filter(item => item !== id));
                              }
                            }}
                            style={{ width: "16px", height: "16px", accentColor: "#2563eb" }}
                          />
                          {prod.mainMedia && (
                            <img
                              src={resolveWixImage(prod.mainMedia || prod.mainmedia)}
                              alt={prod.name}
                              style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>
                              {prod.name}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Category Tags Selection */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                  Category Tags (Select at least one)
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {categories.map((cat) => {
                    const name = cat.name;
                    const isSelected = selectedCategories.includes(name);
                    return (
                      <button
                        key={cat.CategoryID || name}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategories(prev => prev.filter(c => c !== name));
                          } else {
                            setSelectedCategories(prev => [...prev, name]);
                          }
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "20px",
                          border: isSelected ? "1px solid #2563eb" : "1px solid #cbd5e1",
                          backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                          color: isSelected ? "#2563eb" : "#475569",
                          fontSize: "12px",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hashtags Input & Generator */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                    Hashtags
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateHashtags}
                    disabled={generatingHashtags}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2563eb",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer"
                    }}
                  >
                    {generatingHashtags ? "Generating..." : "Generate AI Hashtags"}
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Enter hashtags (comma or space separated)"
                  value={hashtagsInput}
                  onChange={(e) => setHashtagsInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />

                {generatedHashtags.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "6px" }}>Suggested AI Hashtags (Click to add):</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {generatedHashtags.map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => {
                            const normalizedTag = tag.startsWith("#") ? tag : `#${tag}`;
                            const currentTags = hashtagsInput.split(/[\s,]+/).filter(Boolean);
                            if (!currentTags.includes(normalizedTag)) {
                              setHashtagsInput(prev => prev ? `${prev} ${normalizedTag}` : normalizedTag);
                            }
                          }}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            backgroundColor: "#f1f5f9",
                            color: "#0f172a",
                            fontSize: "11px",
                            cursor: "pointer"
                          }}
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Publish Options Section matching reference */}
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>
                  Publish
                </h3>

                <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "8px 16px" }}>
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
