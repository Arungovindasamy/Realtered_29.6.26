import React from "react";
import OrdersView from "../OrdersView";

const ConfirmedOrdersPage = ({ orders = [], loading }) => {
  return (
    <div className="confirmed-orders-page">
      <OrdersView orders={orders} loading={loading} statusType="confirmed" />
    </div>
  );
};

export default ConfirmedOrdersPage;
