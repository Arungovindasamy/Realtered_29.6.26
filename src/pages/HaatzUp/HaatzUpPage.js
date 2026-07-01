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
import { haatzupService } from "../../services/sellerService";
import "./HaatzUpPage.css";

const HaatzUpPage = () => {
  const sellerId = getSellerId();
  const navigate = useNavigate();

  // API Data
  const [videos, setVideos] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.message?.data)) return response.message.data;
    if (Array.isArray(response?.message?.videos)) return response.message.videos;
    if (Array.isArray(response?.message)) return response.message;
    if (Array.isArray(response?.data)) return response.data;
    return [];
  };

  // Helper to resolve video URL (Task 2)
  const getVideoUrl = (item) =>
    item?.url ||
    item?.videoUrl ||
    item?.video ||
    item?.mediaUrl ||
    item?.bunnyVideoUrl ||
    item?.videoLink ||
    "";

  // Load Data
  const loadPageData = useCallback(async () => {
    const resolvedSellerId = (sellerId || getSellerId() || "").trim();
    if (!resolvedSellerId || resolvedSellerId === "null" || resolvedSellerId === "undefined") {
      console.warn("[HaatzUpPage] Missing sellerId. API call skipped.");
      setError("Seller session not found. Please login again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = `https://haatza.com/_functions/SellerwiseHaatzUp?sellerId=${resolvedSellerId}&page=1&limit=12`;
      console.log("[HaatzUp] sellerId:", resolvedSellerId);
      console.log("[HaatzUp] API URL:", url);

      const response = await haatzupService.getPromotionalVideos(resolvedSellerId).catch(err => {
        console.warn("[HaatzUpPage] getPromotionalVideos catch:", err?.message);
        if (err?.response && err.response.status >= 500) {
          throw err;
        }
        return { data: [] };
      });

      console.log("[HaatzUp] raw API response:", response);
      const normalizedVideos = extractHaatzUpVideos(response);
      console.log("[HaatzUp] normalized videos:", normalizedVideos);

      // Task 2: Filter only real uploaded reels that contain an actual video URL
      const uploadedReels = normalizedVideos.filter((item) => {
        const videoUrl = getVideoUrl(item);
        return item && typeof item === "object" && Boolean(videoUrl);
      });

      console.log("[HaatzUp] uploaded reels after filter:", uploadedReels);
      console.log("[HaatzUp] video count:", uploadedReels.length);

      setVideos(uploadedReels);

    } catch (err) {
      console.error("[HaatzUpPage] Error fetching data:", err);
      setError("Failed to fetch promotional video reels from server. Please try again.");
      showToast("Error loading reels data", "error");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

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

      {loading ? (
        <div className="hz-skeleton-layout" style={{ background: "#ffffff", padding: "40px", borderRadius: "16px", minHeight: "450px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RefreshCw size={32} className="spinner-icon" color="#2563eb" />
        </div>
      ) : error ? (
        <div className="hz-error-container">
          <div className="hz-error-card">
            <AlertCircle size={48} className="error-icon" />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn-retry-sync" onClick={loadPageData}>
              <RefreshCw size={16} />
              <span>Retry Load</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="hz-mobile-container">
          {videos.length === 0 ? (
            /* Clean Empty State Matching Mobile Reference Screenshot 2 (Task 4) */
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
            /* Simple Video List / Grid when real uploaded reels exist (Task 5 safely mapped fields) */
            <div className="hz-videos-wrapper">
              <div className="hz-videos-grid">
                {videos.map((item, idx) => {
                  const videoUrl = getVideoUrl(item);
                  const title = item.title || item.caption || item.videoTitle || item.name || "Uploaded Reel";
                  const productName = item.productName || item.product?.name || item.productTitle || "";
                  const status = item.status || item.approvalStatus || item.videoStatus || "";
                  const views = item.views || item.totalViews || 0;
                  const likes = item.likes || item.totalLikes || 0;

                  return (
                    <div key={item.id || item._id || idx} className="reel-item-card">
                      <div className="reel-thumbnail-area">
                        {item.thumbnailUrl || item.thumbnail ? (
                          <img src={item.thumbnailUrl || item.thumbnail} alt={title} className="thumbnail-img" />
                        ) : (
                          <div className="default-thumbnail">
                            <Video size={28} className="thm-icon" />
                          </div>
                        )}
                        <button type="button" className="play-hover-btn" onClick={() => setSelectedVideo({ ...item, url: videoUrl, title })}>
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

      {/* Video Player Modal Preview */}
      {selectedVideo && (
        <div className="hz-video-preview-modal" onClick={() => setSelectedVideo(null)}>
          <div className="modal-video-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h4>{selectedVideo.title || "Video Preview"}</h4>
              <button className="close-btn" onClick={() => setSelectedVideo(null)}>&times;</button>
            </div>
            <div className="video-player-frame">
              {selectedVideo.url || selectedVideo.videoUrl ? (
                <video src={selectedVideo.url || selectedVideo.videoUrl} controls autoPlay className="main-video-elt" />
              ) : (
                <div className="no-video-url-placeholder">No Video Stream Available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HaatzUpPage;
