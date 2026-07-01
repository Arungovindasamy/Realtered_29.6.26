import React, { useState, useEffect, useMemo, useRef } from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { sellerService } from "../../services/sellerService";
import { useAuth } from "../../context/AuthContext";
import { 
  ReturnExchangeTabs, 
  ReturnExchangeFilters, 
  ReturnExchangeList 
} from "../../components/ReturnExchange";
import "./ReturnExchange.css";

const ReturnExchange = () => {
  const { user } = useAuth();
  const [returnsList, setReturnsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Return");

  // Date Picker States
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch sellerId from storage
  const sellerId = useMemo(() => {
    const canonical = sessionStorage.getItem("__haatza_sellerId") || localStorage.getItem("__haatza_sellerId");
    if (canonical) return canonical;

    try {
      const stored = JSON.parse(localStorage.getItem("haatzaSeller"));
      return user?.sellerId || stored?.sellerId || stored?.data?.sellerId || localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId") || "";
    } catch {
      return user?.sellerId || localStorage.getItem("sellerId") || sessionStorage.getItem("sellerId") || "";
    }
  }, [user]);

  const loadReturns = async () => {
    if (!sellerId) {
      setReturnsList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await sellerService.fetchReturns(sellerId);
      let list = [];
      if (response && response.status === "success") {
        list = response.message?.data || response.data || [];
      }

      // Fetch details for each return item in parallel to enrich them with variant/size info
      const enrichedReturns = await Promise.all(
        list.map(async (item) => {
          try {
            const detailsRes = await sellerService.fetchReturnDetails(item.TableID);
            if (detailsRes && detailsRes.status === "success") {
              const details = detailsRes.message || detailsRes.data || {};
              return {
                ...item,
                productOption: details.productOption || item.productOption
              };
            }
          } catch (err) {
            console.warn(`Failed to enrich return details for TableID ${item.TableID}:`, err);
          }
          return item;
        })
      );

      setReturnsList(enrichedReturns);
    } catch (err) {
      console.error("Error in loadReturns workflow:", err);
      setError("Failed to load return requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

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

  // Filter and group by Tab & Search
  const filteredItems = useMemo(() => {
    let result = [...returnsList];

    // 1. Search Query Filter (Searches by Order ID, Customer Name, or Product Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          String(item.orderId || "").toLowerCase().includes(q) ||
          String(item.customerName || "").toLowerCase().includes(q) ||
          String(item.items || "").toLowerCase().includes(q)
      );
    }

    // 2. Date Range Filter
    if (startDate && endDate) {
      result = result.filter((item) => {
        const reqDateStr = activeTab === "Exchange" ? item.exchangeDate : item.returnDate;
        if (!reqDateStr) return false;
        const created = new Date(reqDateStr);
        const createdTime = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
        const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
        return createdTime >= startTime && createdTime <= endTime;
      });
    } else if (startDate) {
      result = result.filter((item) => {
        const reqDateStr = activeTab === "Exchange" ? item.exchangeDate : item.returnDate;
        if (!reqDateStr) return false;
        const created = new Date(reqDateStr);
        const createdTime = new Date(created.getFullYear(), created.getMonth(), created.getDate()).getTime();
        const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
        return createdTime === startTime;
      });
    }

    // 3. Tab Filter
    return result.filter((item) => {
      const status = (item.status || "").toLowerCase();
      if (activeTab === "Exchange") {
        return status.includes("exchange") || status.includes("shipped");
      }
      if (activeTab === "Claim") {
        return status.includes("claim") || status.includes("payout") || status.includes("reimburse");
      }
      // "Return" Tab default fallback
      return !status.includes("exchange") && !status.includes("shipped") && !status.includes("claim");
    });
  }, [returnsList, searchQuery, activeTab, startDate, endDate]);

  // Count tab elements for badge updates
  const counts = useMemo(() => {
    let returnCount = 0;
    let exchangeCount = 0;
    let claimCount = 0;

    returnsList.forEach((item) => {
      const status = (item.status || "").toLowerCase();
      if (status.includes("exchange") || status.includes("shipped")) {
        exchangeCount++;
      } else if (status.includes("claim") || status.includes("payout") || status.includes("reimburse")) {
        claimCount++;
      } else {
        returnCount++;
      }
    });

    return { Return: returnCount, Exchange: exchangeCount, Claim: claimCount };
  }, [returnsList]);

  return (
    <div className="ret-container">
      {/* Page Header */}
      <div className="ret-header ret-card">
        <div className="ret-title-area">
          <h1>Return / Exchange</h1>
          <p>Manage customer product returns, exchange requests, and claims</p>
        </div>
        
        {/* Controls: Search, Tabs, and Refresh */}
        <div className="ret-controls" style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", alignItems: "stretch" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", width: "100%", alignItems: "center" }}>
            <ReturnExchangeFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            
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

            <button className="ret-btn ret-btn-secondary" onClick={loadReturns} disabled={loading} style={{ flexShrink: 0 }}>
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              Refresh
            </button>
          </div>
          
          <ReturnExchangeTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />
        </div>
      </div>

      {/* Main List Area */}
      <ReturnExchangeList 
        items={filteredItems} 
        activeTab={activeTab} 
        loading={loading} 
        error={error} 
        refreshAction={loadReturns}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ReturnExchange;
