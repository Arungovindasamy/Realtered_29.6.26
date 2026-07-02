import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Video,
  Play,
  AlertCircle,
  Eye,
  Heart,
  Clock
} from "lucide-react";
import { getSellerId } from "../../utils/sellerSession";
import { haatzupService, resolveWixImage } from "../../services/sellerService";
import "./HaatzUpPage.css";

const HaatzUpPage = () => {
  const sellerId = getSellerId();
  const navigate = useNavigate();

  // API Data
  const [videos, setVideos] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Helper to extract videos safely from API response (Task 3)
  const extractHaatzUpVideos = (response) => {
    if (response && response.message && Array.isArray(response.message.data)) {
      return response.message.data;
    }
    return [];
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

  // Helper to resolve video URL (Task 2)
  const resolveVideoUrl = (url) => {
    if (!url) return "";
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }
    return `https://vz-f80d8841-fc3.b-cdn.net/${cleanUrl}/play_720p.mp4`;
  };

  // Helper to resolve thumbnail URL
  const resolveThumbnailUrl = (item) => {
    if (item?.thumbnailUrl) return item.thumbnailUrl;
    if (item?.thumbnail) return item.thumbnail;
    
    const url = item?.url;
    if (url) {
      const cleanUrl = url.trim();
      if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
        const guid = extractVideoGuid(cleanUrl);
        if (guid && guid !== cleanUrl) {
          return `https://vz-f80d8841-fc3.b-cdn.net/${guid}/thumbnail.jpg`;
        }
        return "";
      } else {
        return `https://vz-f80d8841-fc3.b-cdn.net/${cleanUrl}/thumbnail.jpg`;
      }
    }
    return "";
  };

  // Load Data function handling pagination
  const fetchVideos = useCallback(async (pageNum, append = false) => {
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    if (!resolvedSellerId || resolvedSellerId === "null" || resolvedSellerId === "undefined") {
      console.warn("[HaatzUpPage] Missing sellerId. API call skipped.");
      setError("Seller session not found. Please login again.");
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await haatzupService.getPromotionalVideos(resolvedSellerId, pageNum, 12).catch(err => {
        console.warn("[HaatzUpPage] getPromotionalVideos catch:", err?.message);
        if (err?.response && err.response.status >= 500) {
          throw err;
        }
        return { status: "success", message: { data: [], pagination: { totalPages: 1, totalItems: 0, page: 1 } } };
      });

      const normalizedVideos = extractHaatzUpVideos(response);

      // Parse pagination parameters
      const totalPagesVal = response?.message?.pagination?.totalPages ?? 1;
      setTotalPages(totalPagesVal);
      setPage(pageNum);

      // Filter only real uploaded reels that contain an actual video URL and belong to the logged-in seller
      const uploadedReels = normalizedVideos.filter((item) => {
        if (!item || typeof item !== "object") return false;
        const videoUrl = item.url;
        const matchesSeller = String(item.sellerId || "").trim() === resolvedSellerId;
        const isRealUrl = Boolean(videoUrl) && !videoUrl.includes("sample") && !videoUrl.includes("demo") && !videoUrl.includes("static");
        const isNotStatic = !String(item.caption || "").toLowerCase().includes("demo") && !String(item.caption || "").toLowerCase().includes("sample");
        return matchesSeller && isRealUrl && isNotStatic;
      });

      setVideos((prev) => {
        if (!append) return uploadedReels;
        const getStableKey = (item) => item.tableId || item._id || item.id || item.url;
        const prevKeys = new Set(prev.map(getStableKey));
        const newReels = uploadedReels.filter(item => !prevKeys.has(getStableKey(item)));
        return [...prev, ...newReels];
      });

    } catch (err) {
      console.error("[HaatzUpPage] Error fetching data:", err);
      setError("Failed to fetch promotional video reels from server. Please try again.");
      showToast("Error loading reels data", "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sellerId]);

  useEffect(() => {
    fetchVideos(1, false);
  }, [fetchVideos]);

  // Infinite Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || page >= totalPages) return;
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        fetchVideos(page + 1, true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, loading, loadingMore, fetchVideos]);

  // Fetch Reel Details
  const fetchVideoDetails = async (video) => {
    const tableId = video.tableId || video._id || video.id;
    if (!tableId) {
      setSelectedVideoDetails(video);
      return;
    }
    setLoadingDetails(true);
    try {
      const response = await haatzupService.getHaatzUpDetails(tableId);
      const details = response?.data || response?.message || {};
      setSelectedVideoDetails({
        ...video,
        ...details
      });
    } catch (err) {
      console.error("[HaatzUpPage] Error fetching video details:", err);
      setSelectedVideoDetails(video); // Fallback to list item details
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close Details Modal
  const closeDetailsModal = () => {
    setSelectedVideo(null);
    setSelectedVideoDetails(null);
  };

  // Handle Play Click
  const handlePlayClick = (item) => {
    const videoUrl = resolveVideoUrl(item.url);
    const title = item.title || item.caption || item.videoTitle || item.name || "Uploaded Reel";
    setSelectedVideo({ ...item, url: videoUrl, title });
    fetchVideoDetails(item);
  };

  // Delete Video Flow
  const handleDeleteVideo = async (video) => {
    const tableId = video.tableId || video._id || video.id;
    if (!tableId) {
      showToast("Cannot delete: missing tableId", "error");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this promotional video?")) {
      return;
    }

    try {
      const response = await haatzupService.deleteHaatzUpVideo(tableId);
      if (response?.status === "success") {
        showToast("Video deleted successfully");
        setVideos(prev => prev.filter(v => (v.tableId || v._id || v.id) !== tableId));
        closeDetailsModal();
        fetchVideos(1, false);
      } else {
        showToast(response?.message || "Failed to delete video", "error");
      }
    } catch (err) {
      console.error("[HaatzUpPage] Delete failed:", err);
      showToast(err.message || "Failed to delete video reel.", "error");
    }
  };

  return (
    <div className="hz-page-root">
      {toast && (
        <div className={`hz-toast-banner ${toast.type}`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="hz-page-header">
        <div className="hz-header-left">
          <nav className="hz-breadcrumb">
            <span>Dashboard</span> &gt; <span>Boost Sales</span> &gt; <span className="active">HaatzUp</span>
          </nav>
          <h1 className="hz-page-title">Upload Promotional Video</h1>
        </div>
      </div>

      {loading && videos.length === 0 ? (
        <div className="hz-skeleton-layout" style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", minHeight: "450px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={32} className="spinner-icon" color="#2563eb" />
        </div>
      ) : error && videos.length === 0 ? (
        <div className="hz-error-container">
          <div className="hz-error-card">
            <AlertCircle size={48} className="error-icon" />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn-retry-sync" onClick={() => fetchVideos(1, false)}>
              <RefreshCw size={16} />
              <span>Retry Load</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="hz-mobile-container">
          {videos.length === 0 ? (
            /* Clean Empty State Matching Mobile Reference Screenshot 2 */
            <div className="hz-clean-empty-state">
              <div className="hz-empty-illustration">
                <div className="hz-box-wrap">
                  <div className="hz-notification-bubble">0</div>
                  <Video size={40} color="#ef4444" />
                </div>
              </div>
              <h3 className="hz-empty-title">No videos uploaded yet</h3>

              <div className="hz-empty-action-wrap">
                <button
                  type="button"
                  className="btn-upload-haatzup-lg"
                  onClick={() => navigate("/haatzup/upload-reel")}
                >
                  Upload HaatzUp
                </button>
              </div>
            </div>
          ) : (
            /* Simple Video List / Grid when real uploaded reels exist */
            <div className="hz-videos-wrapper">
              <div className="hz-videos-grid">
                {videos.map((item, idx) => {
                  const videoUrl = resolveVideoUrl(item.url);
                  const title = item.title || item.caption || item.videoTitle || item.name || "Uploaded Reel";
                  const productName = item.productName || item.product?.name || item.productTitle || "";
                  const status = item.status || item.approvalStatus || item.videoStatus || "";
                  const views = item.views || item.totalViews || 0;
                  const likes = item.likes || item.totalLikes || 0;
                  const thumb = resolveThumbnailUrl(item);

                  return (
                    <div key={item.id || item._id || idx} className="reel-item-card">
                      <div className="reel-thumbnail-area">
                        {thumb ? (
                          <img src={thumb} alt={title} className="thumbnail-img" />
                        ) : (
                          <div className="default-thumbnail">
                            <Video size={28} className="thm-icon" />
                          </div>
                        )}
                        <button type="button" className="play-hover-btn" onClick={() => handlePlayClick(item)}>
                          <Play size={20} fill="#fff" />
                        </button>
                      </div>

                      <div className="reel-info-area">
                        <h4 className="reel-title-text">{title}</h4>
                        {productName && (
                          <div className="reel-associated-product">
                            <span className="prod-label">Product:</span>
                            <span className="prod-val">{productName}</span>
                          </div>
                        )}
                        <div className="reel-footer-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "#64748b" }}>
                          {status ? (
                            <span className="status-badge" style={{ padding: "2px 6px", borderRadius: "4px", background: "#e2e8f0", fontSize: "11px", fontWeight: "600" }}>{status}</span>
                          ) : <span />}
                          <span>👁 {views}  ❤️ {likes}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {loadingMore && (
                <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
                  <RefreshCw size={24} className="spinner-icon" color="#2563eb" />
                </div>
              )}

              <div className="hz-bottom-btn-container">
                <button
                  type="button"
                  className="btn-upload-haatzup-lg"
                  onClick={() => navigate("/haatzup/upload-reel")}
                >
                  Upload HaatzUp
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal Preview & Details */}
      {selectedVideo && (
        <div className="hz-video-preview-modal" onClick={closeDetailsModal}>
          <div className="modal-video-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h4>{selectedVideo.title || "Video Preview"}</h4>
              <button className="close-btn" onClick={closeDetailsModal}>&times;</button>
            </div>
            <div className="video-player-frame">
              {selectedVideo.url ? (
                <video src={selectedVideo.url} controls autoPlay className="main-video-elt" />
              ) : (
                <div className="no-video-url-placeholder">No Video Stream Available</div>
              )}
            </div>

            <div style={{ padding: "16px 20px", borderTop: "1px solid #f1f5f9", maxHeight: "250px", overflowY: "auto" }}>
              {loadingDetails ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
                  <RefreshCw size={20} className="spinner-icon" color="#2563eb" />
                </div>
              ) : (
                <>
                  {selectedVideoDetails?.caption && (
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Caption</span>
                      <p style={{ margin: 0, fontSize: "13px", color: "#0f172a", fontWeight: "500" }}>{selectedVideoDetails.caption}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>Status</span>
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#2563eb", background: "#eff6ff", padding: "2px 6px", borderRadius: "4px" }}>
                        {selectedVideoDetails?.status || "Pending"}
                      </span>
                    </div>
                    {selectedVideoDetails?.uploadDate && (
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748b", display: "block", textAlign: "right" }}>Uploaded On</span>
                        <span style={{ fontSize: "12px", color: "#334155" }}>
                          {new Date(selectedVideoDetails.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedVideoDetails?.products && Array.isArray(selectedVideoDetails.products) && selectedVideoDetails.products.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "6px" }}>Tagged Products</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedVideoDetails.products.map((prod, pIdx) => (
                          <div key={prod.productId || pIdx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px", background: "#f8fafc", borderRadius: "8px" }}>
                            {prod.mainMedia && (
                              <img src={resolveWixImage(prod.mainMedia)} alt={prod.name} style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h5 style={{ margin: 0, fontSize: "12px", color: "#0f172a", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {prod.name}
                              </h5>
                              <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: "500" }}>
                                ₹{prod.discountedPrice || prod.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteVideo(selectedVideoDetails)}
                    style={{
                      width: "100%",
                      backgroundColor: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      padding: "10px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "12px"
                    }}
                  >
                    Delete Video
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaatzUpPage;
