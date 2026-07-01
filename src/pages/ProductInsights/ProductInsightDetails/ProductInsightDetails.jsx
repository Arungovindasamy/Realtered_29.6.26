import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  ShoppingBag,
  Eye,
  Users,
  MousePointerClick
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { resolveSellerEmail, resolveSellerId } from "../../../utils/sellerSession";
import { getProductDetails, getProductStats, fetchSellerListings } from "../../../services/sellerService";
import "./ProductInsightDetails.css";

const FALLBACK_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f1f3f6' rx='8'/%3E%3Ctext x='30' y='35' text-anchor='middle' fill='%23b0b7c3' font-size='22'%3E%F0%9F%93%A6%3C/text%3E%3C/svg%3E";

const computeFinalPrice = (price, discount) => {
  const numPrice = Number(price) || 0;
  if (!discount?.type || discount.value == null) return numPrice;
  if (discount.type === "AMOUNT")     return Math.max(0, numPrice - discount.value);
  if (discount.type === "PERCENTAGE") return Math.max(0, numPrice - (numPrice * discount.value) / 100);
  return numPrice;
};

// Reusable animated count up effect for KPI numbers
const AnimatedCount = ({ value, duration = 800 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = Number(value) || 0;

    if (endValue === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count.toLocaleString()}</>;
};

// TrafficChart (PieChart) using Viewed, Interested, Clicks, and Orders counters
function TrafficChart({ reach, impression, clicks, sales }) {
  const data = [
    { name: "Viewed", value: Number(reach) || 0, color: "#2962ff" },
    { name: "Interested", value: Number(impression) || 0, color: "#10b981" },
    { name: "Clicks", value: Number(clicks) || 0, color: "#8b5cf6" },
    { name: "Orders", value: Number(sales) || 0, color: "#b91c1c" },
  ].filter((item) => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value" style={{ color: payload[0].payload.color || "#2962ff" }}>
            Count: <strong>{payload[0].value.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pi-chart-card">
      <div className="pi-chart-header">
        <div>
          <h3 className="pi-chart-card-title">Activity Breakdown</h3>
          <p className="pi-chart-card-subtitle">Distribution of user actions for this product</p>
        </div>
      </div>

      <div className="pi-chart-canvas-wrapper" style={{ width: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {data.length === 0 ? (
          <div style={{ color: "#64748b" }}>No traffic data available</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                minAngle={15}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// Product Traffic Trend chart rendered as a Bar Chart (as requested)
function RevenueChart({ trendReport }) {
  const currentData = (trendReport || []).map((item) => {
    let formattedDate = item.date || item.name || "";
    try {
      const dateObj = new Date(item.date);
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, "0");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[dateObj.getMonth()];
        formattedDate = `${day} ${month}`;
      }
    } catch (e) {
      // ignore
    }
    return {
      name: formattedDate,
      count: item.count || 0,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value" style={{ color: "#ffffff" }}>
            Count: <strong>{payload[0].value.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pi-chart-card">
      <div className="pi-chart-header">
        <div className="pi-chart-title-wrap">
          <h3 className="pi-chart-card-title">Product Traffic Trend</h3>
          <p className="pi-chart-card-subtitle">Performance activities track over dates</p>
        </div>
      </div>

      <div className="pi-chart-canvas-wrapper" style={{ width: "100%", height: 320 }}>
        {currentData.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#64748b" }}>
            No trend report data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f6" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar name="Traffic" dataKey="count" fill="#2962ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const getCategoryName = (product) => {
  if (!product) return "";
  if (typeof product.categoryName === "string" && product.categoryName) return product.categoryName;
  if (Array.isArray(product.categoryName)) {
    const firstStr = product.categoryName.find(c => typeof c === "string" && c);
    if (firstStr) return firstStr;
  }
  if (product.category) {
    if (typeof product.category === "string" && product.category) return product.category;
    if (Array.isArray(product.category)) {
      const firstStr = product.category.find(c => typeof c === "string" && c);
      if (firstStr) return firstStr;
    }
    if (typeof product.category === "object") return product.category.name || product.category.title || "";
  }
  if (product.subCategory) {
    if (typeof product.subCategory === "string" && product.subCategory) return product.subCategory;
    if (Array.isArray(product.subCategory)) {
      const firstStr = product.subCategory.find(c => typeof c === "string" && c);
      if (firstStr) return firstStr;
    }
    if (typeof product.subCategory === "object") return product.subCategory.name || product.subCategory.title || "";
  }
  return "";
};

const getBrandName = (product) => {
  if (product.brand) {
    if (typeof product.brand === "object") return product.brand.name || product.brand.title || "";
    if (typeof product.brand === "string") return product.brand;
  }
  return "";
};

export default function ProductInsightDetails() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [productDetails, setProductDetails] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchProductAnalytics = useCallback(async (selectedId) => {
    setLoading(true);
    setError(null);
    try {
      const detailsRes = await getProductDetails(selectedId);

      const candidates = [
        detailsRes?.message?.body?.product,
        detailsRes?.message?.body,
        detailsRes?.body?.product,
        detailsRes?.body,
        detailsRes?.message?.data,
        detailsRes?.message,
        detailsRes?.data,
        detailsRes
      ];
      const details = candidates.find(
        (c) =>
          c &&
          typeof c === "object" &&
          !Array.isArray(c) &&
          (c.name || c.price != null || c.status || c.Table_ID)
      ) ?? detailsRes;

      if (!details || (!details.name && !details.title)) {
        throw new Error("Product details not found or invalid.");
      }
      setProductDetails(details);

      // Extract seller session email and ID
      const email = resolveSellerEmail();
      const sellerId = resolveSellerId();

      // Fetch the actual seller_products response to extract categoryName
      const listRes = await fetchSellerListings({ email, page: 1, limit: 100, type: "mylisting" });
      const list = listRes?.products || [];
      const matchingProduct = list.find(p => (p.Table_ID || p.tableId || p.id) === selectedId);

      let categoryName = "";
      if (matchingProduct) {
        categoryName = getCategoryName(matchingProduct);
      }
      if (!categoryName && details) {
        categoryName = getCategoryName(details);
      }

      // Parameter validation
      if (!selectedId) {
        console.error("Product Insights Details: Missing tableId validation. Skipping Product Stats API call.");
      }
      if (!categoryName) {
        console.error("Product Insights Details: Missing categoryName validation. Skipping Product Stats API call.");
      }

      let stats = null;
      if (selectedId && categoryName) {
        const statsRes = await getProductStats({ sellerId, tableId: selectedId, categoryName });
        stats = statsRes?.message?.data || statsRes?.data || statsRes;
      } else {
        console.warn("Product Stats API call skipped due to missing tableId or categoryName parameters.");
      }

      setAnalyticsData(stats);
    } catch (err) {
      console.error(`Error loading insights for ${selectedId}:`, err);
      setError(err.message || "Unable to load product insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tableId) {
      fetchProductAnalytics(tableId);
    } else {
      navigate("/dashboard/productinsight");
    }
  }, [tableId, fetchProductAnalytics, navigate]);

  // Set document title for SEO
  useEffect(() => {
    if (productDetails?.name || productDetails?.title) {
      document.title = `${productDetails.name || productDetails.title} - Product Insights`;
    } else {
      document.title = "Product Insights Details - Seller Portal";
    }
  }, [productDetails]);

  if (loading) {
    return (
      <div className="pi-page-outer" id="product-insights-detail-loading">
        <div className="pi-skeleton-header">
          <div className="pi-skeleton-line short" style={{ width: "20%" }} />
          <div className="pi-skeleton-line title" style={{ width: "40%" }} />
        </div>
        <div className="pi-details-skeleton-card">
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <div className="pi-skeleton-line" style={{ width: "80px", height: "80px", borderRadius: "12px" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className="pi-skeleton-line" style={{ width: "50%", height: "24px" }} />
              <div className="pi-skeleton-line" style={{ width: "30%", height: "16px" }} />
            </div>
          </div>
          <div className="pi-skeleton-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            <div className="pi-skeleton-line" style={{ height: "100px", borderRadius: "12px" }} />
            <div className="pi-skeleton-line" style={{ height: "100px", borderRadius: "12px" }} />
            <div className="pi-skeleton-line" style={{ height: "100px", borderRadius: "12px" }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pi-page-outer" id="product-insights-detail-error">
        <div className="pi-error-card">
          <div className="pi-error-icon-wrap">
            <AlertTriangle size={48} />
          </div>
          <h2 className="pi-error-title">Unable to load product insights</h2>
          <p className="pi-error-desc">{error}</p>
          <div className="pi-error-actions">
            <button className="pi-btn-retry" onClick={() => fetchProductAnalytics(tableId)}>
              <RefreshCw size={16} /> Retry
            </button>
            <button className="pi-btn-back" onClick={() => navigate("/dashboard/productinsight")}>
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse values from API response mapping
  const interestedCount = analyticsData?.impression !== undefined ? analyticsData.impression : 0;
  const viewsCount = analyticsData?.views !== undefined ? analyticsData.views : (analyticsData?.reach || 0);
  const ordersCount = analyticsData?.orders !== undefined ? analyticsData.orders : (analyticsData?.sales || 0);

  // Conditional Clicks card
  const hasClicks = analyticsData?.clicks !== undefined && analyticsData?.clicks !== null;
  const clicksCount = hasClicks ? analyticsData.clicks : 0;

  // Compute final price (and display only this)
  const finalPrice = computeFinalPrice(productDetails?.price, productDetails?.discount);

  const displayBrand = getBrandName(productDetails);
  const displayCategory = getCategoryName(productDetails);

  return (
    <div className="pi-page-outer" id="product-insights-details-page">
      {/* Header Row */}
      <div className="pi-header-row">
        <div className="pi-breadcrumb">
          <span onClick={() => navigate("/dashboard")}>Dashboard</span>
          <ChevronRight size={14} />
          <span onClick={() => navigate("/dashboard/productinsight")}>Product Insight</span>
          <ChevronRight size={14} />
          <span className="pi-breadcrumb-active">{productDetails?.name || "Product Detail"}</span>
        </div>

        <button className="pi-btn-back-nav" onClick={() => navigate("/dashboard/productinsight")} id="back-to-products-list">
          <ArrowLeft size={14} /> All Products
        </button>
      </div>

      {/* Product Information Card (Strictly without Edit, View Product, Share Product buttons, and Inventory/Stock info) */}
      <div className="pi-product-header-card glass-card">
        <div className="pi-header-main-info">
          <img
            className="pi-header-img"
            src={productDetails?.mainmedia || FALLBACK_IMG}
            alt={productDetails?.name || "Product image"}
            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
          />
          <div className="pi-header-text-details">
            <h1 className="pi-header-product-title">{productDetails?.name || productDetails?.title || "Untitled Product"}</h1>
            <div className="pi-header-meta-row">
              {displayBrand && <span className="pi-meta-badge">Brand: {displayBrand}</span>}
              <span className="pi-meta-badge">Final Price: ₹{finalPrice.toFixed(2)}</span>
              {displayCategory && <span className="pi-meta-badge">Category: {displayCategory}</span>}
              <span className="status-badge status-approved">{productDetails?.status || "Approved"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pi-sections-container">
        {/* Metric Cards Section (Interested [Green], Viewed [Blue], Orders [Orange/Red]. NO Clicks, NO Inventory) */}
        <div className="pi-kpi-grid" id="metrics-cards-grid">
          {/* Card 1: Interested (Green) */}
          <div className="pi-kpi-card pi-kpi-green" id="kpi-interested-card">
            <div className="pi-kpi-header">
              <span className="pi-kpi-title">Interested</span>
              <span className="pi-kpi-icon-wrap icon-green">
                <Users size={20} />
              </span>
            </div>
            <div className="pi-kpi-body">
              <h2 className="pi-kpi-value">
                <AnimatedCount value={interestedCount} />
              </h2>
              <span className="pi-kpi-muted">Product page views</span>
            </div>
          </div>

          {/* Card 2: Viewed (Blue) */}
          <div className="pi-kpi-card pi-kpi-blue" id="kpi-viewed-card">
            <div className="pi-kpi-header">
              <span className="pi-kpi-title">Viewed</span>
              <span className="pi-kpi-icon-wrap icon-blue">
                <Eye size={20} />
              </span>
            </div>
            <div className="pi-kpi-body">
              <h2 className="pi-kpi-value">
                <AnimatedCount value={viewsCount} />
              </h2>
              <span className="pi-kpi-muted">Search & category views</span>
            </div>
          </div>

          {/* Card 3: Orders (Orange) */}
          <div className="pi-kpi-card pi-kpi-orange" id="kpi-orders-card">
            <div className="pi-kpi-header">
              <span className="pi-kpi-title">Orders</span>
              <span className="pi-kpi-icon-wrap icon-orange">
                <ShoppingBag size={20} />
              </span>
            </div>
            <div className="pi-kpi-body">
              <h2 className="pi-kpi-value">
                <AnimatedCount value={ordersCount} />
              </h2>
              <span className="pi-kpi-muted">Total orders placed</span>
            </div>
          </div>

          {/* Card 4: Clicks (Purple, conditionally displayed if clicks data is present) */}
          {hasClicks && (
            <div className="pi-kpi-card pi-kpi-purple" id="kpi-clicks-card">
              <div className="pi-kpi-header">
                <span className="pi-kpi-title">Clicks</span>
                <span className="pi-kpi-icon-wrap icon-purple">
                  <MousePointerClick size={20} />
                </span>
              </div>
              <div className="pi-kpi-body">
                <h2 className="pi-kpi-value">
                  <AnimatedCount value={clicksCount} />
                </h2>
                <span className="pi-kpi-muted">Product card clicks</span>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Breakdown & Trend charts displayed side by side */}
        <div className="pi-traffic-grid">
          <RevenueChart trendReport={analyticsData?.trendReport} />
          <TrafficChart
            reach={viewsCount}
            impression={interestedCount}
            clicks={clicksCount}
            sales={ordersCount}
          />
        </div>
      </div>
    </div>
  );
}
