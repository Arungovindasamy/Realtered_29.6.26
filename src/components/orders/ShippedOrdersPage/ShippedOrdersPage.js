import React from "react";
import OrdersView from "../OrdersView";

const ShippedOrdersPage = ({ orders = [], loading }) => {
  return (
    <div className="shipped-orders-page">
      <OrdersView orders={orders} loading={loading} statusType="shipped" />
    </div>
  );
};

export default ShippedOrdersPage;
