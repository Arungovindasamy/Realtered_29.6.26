import React from "react";

const ReturnExchangeTabs = ({ activeTab, setActiveTab, counts = { Return: 0, Exchange: 0, Claim: 0 } }) => {
  return (
    <>
      <div className="ret-tabs-dropdown-container">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="ret-status-select"
        >
          <option value="Return">Returns</option>
          <option value="Exchange">Exchanges</option>
          <option value="Claim">Claims</option>
        </select>
      </div>

      <div className="ret-tabs-container">
        <button
          className={`ret-tab ${activeTab === "Return" ? "active" : ""}`}
          onClick={() => setActiveTab("Return")}
        >
          <span>Returns</span>
          <span className="ret-tab-badge">{counts.Return || 0}</span>
        </button>
        <button
          className={`ret-tab ${activeTab === "Exchange" ? "active" : ""}`}
          onClick={() => setActiveTab("Exchange")}
        >
          <span>Exchanges</span>
          <span className="ret-tab-badge">{counts.Exchange || 0}</span>
        </button>
        <button
          className={`ret-tab ${activeTab === "Claim" ? "active" : ""}`}
          onClick={() => setActiveTab("Claim")}
        >
          <span>Claims</span>
          <span className="ret-tab-badge">{counts.Claim || 0}</span>
        </button>
      </div>
    </>
  );
};

export default ReturnExchangeTabs;
