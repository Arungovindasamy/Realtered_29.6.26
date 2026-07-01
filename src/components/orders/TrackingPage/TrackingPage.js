import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, Clock, MapPin, Circle, PackageSearch } from "lucide-react";
import axios from "axios";
import "../theme.css";
import "./TrackingPage.css";

const formatExpectedDelivery = (dateString) => {
  if (!dateString) return "Not Available";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return dateString;
  }
};

const formatScanTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return dateTimeStr;
  }
};
const formatScanDate = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    const dateStr = d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    const weekdayStr = d.toLocaleDateString("en-US", { weekday: "short" });
    return `${dateStr} (${weekdayStr})`;
  } catch {
    return dateTimeStr;
  }
};

const TrackingPage = () => {
  const { waybill } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState(null);

  const fetchTrackingDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://haatza.com/_functions/trackshipping?waybill=${waybill}`
      );

      console.log(
        "Tracking Details Response",
        response.data
      );

      setTrackingData(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingDetails();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  // Extract shipment object from dynamic response mapping
  const shipment = trackingData?.message?.result?.data?.ShipmentData?.[0]?.Shipment;

  // Sorting scans: show latest event first
  const scans = shipment?.Scans || [];
  const sortedScans = [...scans].sort(
    (a, b) =>
      new Date(b.ScanDetail.ScanDateTime) -
      new Date(a.ScanDetail.ScanDateTime)
  );

  // Expected Delivery format
  const expectedDeliveryText = shipment?.ExpectedDeliveryDate
    ? formatExpectedDelivery(shipment.ExpectedDeliveryDate)
    : "Not Available";

  // Loading skeleton state
  if (loading) {
    return (
      <div className="haatza-page tracking-page">
        <div className="tracking-container">
          <div className="tracking-header-wrap">
            <div className="skeleton-button skeleton" />
            <div className="skeleton-title skeleton" />
          </div>
          <div className="glass-card skeleton-card">
            <div className="skeleton skeleton-text short" />
            <div className="skeleton skeleton-text medium" />
          </div>
          <div className="skeleton-info-banner skeleton" />
          <div className="glass-card skeleton-card">
            <div className="skeleton skeleton-text short" />
            <div className="skeleton skeleton-text medium" />
          </div>
          <div className="glass-card timeline-card">
            {[1, 2, 3].map((i) => (
              <div className="skeleton-timeline-item" key={i}>
                <div className="skeleton skeleton-time" />
                <div className="skeleton-dot-wrapper">
                  <div className="skeleton-dot" />
                  {i < 3 && <div className="skeleton-line" />}
                </div>
                <div className="skeleton-details">
                  <div className="skeleton skeleton-status" />
                  <div className="skeleton skeleton-location" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty/Error state
  if (!shipment || sortedScans.length === 0) {
    return (
      <div className="haatza-page tracking-page">
        <div className="tracking-container">
          <div className="tracking-header-wrap">
            <button className="back-button-circle" onClick={handleBack}>
              <ArrowLeft size={20} />
            </button>
            <h1 className="tracking-main-title">Order Tracking</h1>
          </div>

          <div className="empty-state glass-card tracking-empty-card">
            <div className="empty-state-icon-wrap">
              <PackageSearch size={56} />
            </div>
            <h3>Tracking Information Not Available</h3>
            <p>We couldn't retrieve tracking information for waybill #{waybill}.</p>
            <button className="back-to-orders-btn" onClick={() => navigate("/dashboard/orders")}>
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="haatza-page tracking-page">
      <div className="tracking-container">
        
        {/* Header */}
        <div className="tracking-header-wrap">
          <button className="back-button-circle" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="tracking-main-title">Order Tracking</h1>
        </div>

        {/* Top Summary Card */}
        <div className="glass-card tracking-top-card">
          <span className="carrier-badge">Delivery by Haatza</span>
          <span className="tracking-id-text">Tracking ID: {shipment.AWB}</span>
        </div>

        {/* Info Message */}
        <div className="tracking-info-banner">
          <Info size={18} className="info-icon" />
          <span className="info-text">
            This is the latest tracking information available for your order.
          </span>
        </div>

        {/* Expected Delivery Date Card */}
        <div className="glass-card expected-delivery-card">
          <div className="expected-label">Expected Delivery Date</div>
          <div className="expected-date">{expectedDeliveryText}</div>
        </div>

        {/* Timeline Card */}
        <div className="glass-card timeline-card">
          <div className="timeline-container">
            {sortedScans.map((scan, index) => {
              const isActive = index === 0; // The latest event has the active styling
              return (
                <div className="timeline-item" key={index}>
                  
                  {/* Time Column on Left */}
                  <div className="timeline-time-col">
                    <span className="time-text-wrap">
                      <Clock size={12} className="timeline-icon-small" />
                      {formatScanTime(scan.ScanDetail.ScanDateTime)}
                    </span>
                    <span className="date-text-wrap">
                      {formatScanDate(scan.ScanDetail.ScanDateTime)}
                    </span>
                  </div>

                  {/* Indicator Column */}
                  <div className="timeline-indicator-col">
                    {isActive ? (
                      <div className="timeline-dot active" />
                    ) : (
                      <Circle size={10} className="timeline-circle-icon" />
                    )}
                    {index < sortedScans.length - 1 && (
                      <div className="timeline-connector-line" />
                    )}
                  </div>

                  {/* Details Column on Right */}
                  <div className="timeline-details-col">
                    <div className="status-text">{scan.ScanDetail.Instructions}</div>
                    <div className="location-text">
                      <MapPin size={12} className="timeline-icon-small" />
                      {scan.ScanDetail.ScannedLocation}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackingPage;
