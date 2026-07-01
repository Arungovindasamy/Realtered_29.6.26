import React, { useState, useEffect } from "react";
import { Layers, ShieldCheck, ShieldAlert, Award } from "lucide-react";
import "./BrandingStats.css";

// Reusable CountUp component
const AnimatedCount = ({ value, duration = 800, isPercent = false }) => {
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
      setCount(progress * endValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isPercent) {
    return <>{count.toFixed(1)}%</>;
  }
  return <>{Math.floor(count).toLocaleString()}</>;
};

const BrandingStats = ({ total = 0, enabled = 0, disabled = 0 }) => {
  const coverage = total > 0 ? (enabled / total) * 100 : 0;

  const statsList = [
    {
      id: "total",
      label: "Total Products",
      value: total,
      icon: <Layers size={20} />,
      themeClass: "ib-stat-total",
      isPercent: false,
    },
    {
      id: "enabled",
      label: "Branding Enabled",
      value: enabled,
      icon: <ShieldCheck size={20} />,
      themeClass: "ib-stat-enabled",
      isPercent: false,
    },
    {
      id: "disabled",
      label: "Branding Disabled",
      value: disabled,
      icon: <ShieldAlert size={20} />,
      themeClass: "ib-stat-disabled",
      isPercent: false,
    },
    {
      id: "coverage",
      label: "Branding Coverage",
      value: coverage,
      icon: <Award size={20} />,
      themeClass: "ib-stat-coverage",
      isPercent: true,
    },
  ];

  return (
    <div className="ib-stats-grid">
      {statsList.map((stat) => (
        <div key={stat.id} className={`ib-stat-card ${stat.themeClass}`}>
          <div className="ib-stat-header">
            <span className="ib-stat-label">{stat.label}</span>
            <div className="ib-stat-icon-wrap">{stat.icon}</div>
          </div>
          <div className="ib-stat-body">
            <span className="ib-stat-value">
              <AnimatedCount value={stat.value} isPercent={stat.isPercent} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandingStats;
