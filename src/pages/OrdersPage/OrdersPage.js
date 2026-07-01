import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  RefreshCw,
  PackageCheck,
  Truck,
  XCircle,
  PackageSearch,
  ArrowLeft,
} from "lucide-react";
import { fetchSellerOrders } from "../../services/sellerService";
import ConfirmedOrdersPage from "../../components/orders/ConfirmedOrdersPage/ConfirmedOrdersPage";
import ShippedOrdersPage from "../../components/orders/ShippedOrdersPage/ShippedOrdersPage";
import CancelledOrdersPage from "../../components/orders/CancelledOrdersPage/CancelledOrdersPage";
import "../../components/orders/theme.css";
import "./OrdersPage.css";
const TABS = [
  { key: "confirmed", label: "Confirmed Orders", icon: PackageCheck },
  { key: "shipped", label: "Shipped Orders", icon: Truck },
  { key: "cancelled", label: "Cancelled Orders", icon: XCircle },
];

const CONFIRMED_STATUSES = ["Order Placed", "Order Confirmed"];
const SHIPPED_STATUSES = ["Shipped"];
const CANCELLED_STATUSES = ["Order Cancelled"];

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.fromTab || "confirmed");
  const [search, setSearch] = useState("");
  
  // Date Picker States
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const datePickerRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sellerId = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("haatzaSeller"));
      return user?.sellerId || stored?.sellerId || stored?.data?.sellerId || localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId") || "";
    } catch {
      return user?.sellerId || localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId") || "";
    }
  }, [user]);

  const loadOrders = async () => {
    if (!sellerId) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetchSellerOrders(sellerId);
      const list = Array.isArray(response) ? response : response?.message?.results || response?.items || response?.orders || [];
      setOrders(list);
    } catch (err) {
      console.error("Error fetching seller orders", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      list = list.filter((o) =>
        String(o.orderId || "").toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    if (startDate && endDate) {
      list = list.filter((o) => {
        const created = new Date(o.createdDate);
        const createdTime = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
        const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
        return createdTime >= startTime && createdTime <= endTime;
      });
    } else if (startDate) {
      list = list.filter((o) => {
        const created = new Date(o.createdDate);
        const createdTime = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
        const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        return createdTime === startTime;
      });
    }

    return list;
  }, [orders, search, startDate, endDate]);

  const grouped = useMemo(() => {
    const confirmed = filteredOrders.filter((o) => CONFIRMED_STATUSES.includes(o.status));
    const shipped = filteredOrders.filter((o) => SHIPPED_STATUSES.includes(o.status));
    const cancelled = filteredOrders.filter((o) => CANCELLED_STATUSES.includes(o.status));
    return { confirmed, shipped, cancelled };
  }, [filteredOrders]);

  const handleQuickPreset = (preset) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (preset === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      setStartDate(yesterday);
      setEndDate(yesterday);
    } else if (preset === "last7") {
      const last7 = new Date(today);
      last7.setDate(today.getDate() - 6);
      setStartDate(last7);
      setEndDate(today);
    } else if (preset === "last30") {
      const last30 = new Date(today);
      last30.setDate(today.getDate() - 29);
      setStartDate(last30);
      setEndDate(today);
    } else if (preset === "thisMonth") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    } else if (preset === "clear") {
      setStartDate(null);
      setEndDate(null);
    }
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const days = [];

    // Empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, date: null });
    }

    // Day cells
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        day: d,
        date: new Date(calendarYear, calendarMonth, d)
      });
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDayClassNames = (dayDate) => {
    if (!dayDate) return "orders-calendar-day-empty";

    const time = dayDate.getTime();
    const startTime = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime() : null;
    const endTime = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime() : null;
    const hoverTime = hoverDate ? new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate()).getTime() : null;

    let classes = "orders-calendar-day";

    if (startTime && time === startTime) {
      classes += " is-start-date";
    }
    if (endTime && time === endTime) {
      classes += " is-end-date";
    }

    if (startTime && endTime && time > startTime && time < endTime) {
      classes += " in-range";
    }

    if (startTime && !endTime && hoverTime && time > startTime && time <= hoverTime) {
      classes += " in-range-hover";
    }

    return classes;
  };

  const handleDayClick = (dayDate) => {
    if (!dayDate) return;

    const normalizedDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

    if (!startDate || (startDate && endDate)) {
      setStartDate(normalizedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (normalizedDate.getTime() >= startDate.getTime()) {
        setEndDate(normalizedDate);
        setShowDatePicker(false);
      } else {
        setStartDate(normalizedDate);
      }
    }
  };

  const formatDateText = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    if (startDate) {
      return `From ${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "Select Date Range";
  };

  return (
    <div className="haatza-page orders-page">
      <div className="orders-header glass-card">
        <div className="orders-header-top">
          <div>
            <h1 className="orders-title">Orders</h1>
            <p className="orders-subtitle">Manage customer orders, shipping, and fulfillment</p>
          </div>
          <div className="orders-header-actions">
            <button className="btn-secondary" onClick={loadOrders}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              Refresh Orders
            </button>
          </div>
        </div>

        <div className="orders-filters">
          <div className="orders-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by Order ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="orders-date-filter-wrapper" ref={datePickerRef}>
            <div className="orders-date-filter-trigger" onClick={() => setShowDatePicker(!showDatePicker)}>
              <Calendar size={18} />
              <span className="orders-date-text">{formatDateText()}</span>
              {startDate && (
                <button
                  className="orders-date-clear-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickPreset("clear");
                  }}
                >
                  &times;
                </button>
              )}
            </div>

            {showDatePicker && (
              <div className="orders-calendar-dropdown glass-card">
                <div className="orders-calendar-sidebar">
                    <button className="calendar-preset-btn" onClick={() => handleQuickPreset("today")}>Today</button>
                    <button className="calendar-preset-btn" onClick={() => handleQuickPreset("yesterday")}>Yesterday</button>
                    <button className="calendar-preset-btn" onClick={() => handleQuickPreset("last7")}>Last 7 Days</button>
                    <button className="calendar-preset-btn" onClick={() => handleQuickPreset("last30")}>Last 30 Days</button>
                    <button className="calendar-preset-btn" onClick={() => handleQuickPreset("thisMonth")}>This Month</button>
                    <button className="calendar-preset-btn clear-btn" onClick={() => handleQuickPreset("clear")}>Clear Filter</button>
                  </div>
                  <div className="orders-calendar-main">
                    <button className="orders-calendar-close-btn" onClick={() => setShowDatePicker(false)}>&times;</button>
                    <div className="orders-calendar-header">
                      <button className="calendar-nav-btn" onClick={handlePrevMonth}>&larr;</button>
                      <span className="calendar-month-label">{monthNames[calendarMonth]} {calendarYear}</span>
                      <button className="calendar-nav-btn" onClick={handleNextMonth}>&rarr;</button>
                    </div>
                    <div className="orders-calendar-weekdays">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>
                    <div className="orders-calendar-days-grid">
                      {calendarDays.map((d, index) => (
                        <button
                          key={index}
                          className={getDayClassNames(d.date)}
                          disabled={!d.day}
                          onClick={() => handleDayClick(d.date)}
                          onMouseEnter={() => d.date && setHoverDate(d.date)}
                        >
                          {d.day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="orders-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = grouped[tab.key]?.length || 0;
          return (
            <button
              key={tab.key}
              className={`order-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {Icon && <Icon size={16} />}
              <span>{tab.label}</span>
              <span className="tab-badge">{count}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="tab-underline"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="orders-status-dropdown-container">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="orders-status-select"
        >
          <option value="confirmed">Confirmed Orders</option>
          <option value="shipped">Shipped Orders</option>
          <option value="cancelled">Cancelled Orders</option>
        </select>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "confirmed" && (
            <ConfirmedOrdersPage orders={grouped.confirmed} loading={loading} onRefresh={loadOrders} />
          )}
          {activeTab === "shipped" && (
            <ShippedOrdersPage orders={grouped.shipped} loading={loading} onRefresh={loadOrders} />
          )}
          {activeTab === "cancelled" && (
            <CancelledOrdersPage orders={grouped.cancelled} loading={loading} onRefresh={loadOrders} />
          )}
        </motion.div>
      </AnimatePresence>

      {!loading && filteredOrders.length === 0 && (
        <div className="empty-state glass-card">
          <PackageSearch size={48} color="#2962FF" />
          <h3>No Orders Found</h3>
          <p>No orders are currently available.</p>
          <button className="btn-primary" onClick={loadOrders}>
            <RefreshCw size={16} />
            Refresh Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
