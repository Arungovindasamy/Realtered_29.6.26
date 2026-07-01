import React from "react";
import OrdersView from "../OrdersView";

const CancelledOrdersPage = ({ orders = [], loading }) => {
  return (
    <div className="cancelled-orders-page">
      <OrdersView orders={orders} loading={loading} statusType="cancelled" />
    </div>
  );
};

export default CancelledOrdersPage;
