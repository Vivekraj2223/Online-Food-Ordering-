import { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get("/api/orders").then(res => {
      setOrders(res.data);
    });
  }, []);

  return (
    <>
      <h2 className="section-title">My Orders</h2>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>₹{order.total_amount}</td>
                <td>{order.order_status}</td>
                <td>{new Date(order.order_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Orders;