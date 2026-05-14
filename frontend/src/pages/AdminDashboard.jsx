import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [food, setFood] = useState({
    name: "",
    category: "",
    price: "",
    image: "food.jpg",
    description: "",
    status: "Available"
  });

  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const loadFoods = () => {
    axios.get("/api/foods").then(res => setFoods(res.data));
  };

  const loadOrders = () => {
    axios.get("/api/admin/orders").then(res => setOrders(res.data));
  };

  useEffect(() => {
    loadFoods();
    loadOrders();
  }, []);

  const handleChange = (e) => {
    setFood({ ...food, [e.target.name]: e.target.value });
  };

  const addFood = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/admin/food/add", food);
    setMessage(res.data.message);
    loadFoods();
  };

  const deleteFood = async (id) => {
    await axios.delete(`/api/admin/food/${id}`);
    loadFoods();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`/api/admin/orders/${id}`, { status });
    loadOrders();
  };

  return (
    <>
      <h2 className="section-title">Admin Dashboard</h2>
      <p className="message">{message}</p>

      <div className="admin-grid">
        <div className="form-container">
          <h2>Add Food Item</h2>

          <form onSubmit={addFood}>
            <input name="name" placeholder="Food Name" onChange={handleChange} required />
            <input name="category" placeholder="Category" onChange={handleChange} required />
            <input name="price" type="number" placeholder="Price" onChange={handleChange} required />
            <input name="image" placeholder="Image Name" onChange={handleChange} />
            <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>

            <select name="status" onChange={handleChange}>
              <option>Available</option>
              <option>Unavailable</option>
            </select>

            <button className="btn">Add Food</button>
          </form>
        </div>

        <div className="table-container">
          <h2>Manage Food Items</h2>
          <br />

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Food</th>
                <th>Price</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {foods.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <button className="btn" onClick={() => deleteFood(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container">
        <h2>All Orders</h2>
        <br />

        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.name}</td>
                <td>{order.email}</td>
                <td>₹{order.total_amount}</td>
                <td>{order.order_status}</td>
                <td>
                  <select onChange={(e) => updateStatus(order.id, e.target.value)}>
                    <option>Select</option>
                    <option>Pending</option>
                    <option>Preparing</option>
                    <option>Out for Delivery</option>
                    <option>Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminDashboard;