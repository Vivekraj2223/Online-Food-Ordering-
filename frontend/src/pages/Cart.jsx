import { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const loadCart = () => {
    axios.get("/api/cart").then(res => {
      setCart(res.data);
    });
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (id) => {
    const res = await axios.delete(`/api/cart/${id}`);
    setMessage(res.data.message);
    loadCart();
  };

  const increaseQuantity = async (foodId) => {
    const res = await axios.put(`/api/cart/increase/${foodId}`);

    if (res.data.success) {
      loadCart();
    } else {
      setMessage(res.data.message);
    }
  };

  const decreaseQuantity = async (foodId) => {
    const res = await axios.put(`/api/cart/decrease/${foodId}`);

    if (res.data.success) {
      loadCart();
    } else {
      setMessage(res.data.message);
    }
  };

  const placeOrder = async () => {
    const res = await axios.post("/api/order/place");
    setMessage(res.data.message);
    loadCart();
  };

  const totalAmount = cart.reduce((sum, item) => {
    return sum + Number(item.total);
  }, 0);

  return (
    <div className="cart-page">
      <h2 className="section-title">My Cart</h2>

      {message && (
        <p className={message.includes("success") || message.includes("removed") ? "message" : "error"}>
          {message}
        </p>
      )}

      {cart.length === 0 ? (
        <div className="empty-cart-box">
          <h3>Your cart is empty</h3>
          <p>Add some delicious food items from the menu.</p>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map(item => (
              <div className="cart-card" key={item.id}>
                <img
                  src={`/images/${item.image}`}
                  alt={item.name}
                  className="cart-img"
                />

                <div className="cart-content">
                  <h3>{item.name}</h3>
                  <p className="cart-price">₹{item.price}</p>

                  <div className="cart-quantity-box">
                    <button onClick={() => decreaseQuantity(item.food_id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.food_id)}>
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-right">
                  <h4>₹{item.total}</h4>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-card">
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items</span>
              <span>{cart.length}</span>
            </div>

            <div className="summary-row">
              <span>Total Quantity</span>
              <span>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </div>

            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>

            <button onClick={placeOrder} className="place-order-btn">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;