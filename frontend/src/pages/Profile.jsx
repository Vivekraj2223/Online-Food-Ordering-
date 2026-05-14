import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    created_at: ""
  });

  const [lastItems, setLastItems] = useState([]);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [showCartBar, setShowCartBar] = useState(false);

  const loadCart = () => {
    axios.get("/api/cart").then(res => {
      const totalQuantity = res.data.reduce((sum, item) => {
        return sum + item.quantity;
      }, 0);

      setCartCount(totalQuantity);
      setShowCartBar(totalQuantity > 0);
    });
  };

  useEffect(() => {
    axios.get("/api/profile").then(res => {
      if (res.data.success) {
        setUser(res.data.user);
        setLoggedIn(true);

        axios.get("/api/user/last-ordered-items").then(orderRes => {
          if (orderRes.data.success) {
            setLastItems(orderRes.data.items);
          }
        });

        loadCart();
      } else {
        setMessage(res.data.message);
        setLoggedIn(false);
      }
    });
  }, []);

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    const res = await axios.put("/api/profile/update", {
      name: user.name,
      phone: user.phone,
      address: user.address
    });

    setMessage(res.data.message);
  };

  const reorderItem = async (foodId) => {
    const res = await axios.post("/api/cart/add", {
      food_id: foodId
    });

    if (res.data.success) {
      setMessage("Item added to cart again");
      loadCart();
    } else {
      setMessage(res.data.message);
    }
  };

  const logout = async () => {
    await axios.post("/api/logout");
    window.location.href = "/";
  };

  if (loggedIn === null) {
    return (
      <div className="profile-page">
        <h2 className="section-title">Loading Profile...</h2>
      </div>
    );
  }

  if (loggedIn === false) {
    return (
      <div className="profile-page">
        <div className="login-required-card">
          <h2>Login Required</h2>
          <p>Please login first to view your profile.</p>
          <Link to="/login" className="btn login-required-btn">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2 className="section-title">My Profile</h2>

      {message && (
        <p className={message.includes("success") || message.includes("again") ? "message" : "error"}>
          {message}
        </p>
      )}

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>

          <div className="profile-info">
            <div>
              <span>Phone</span>
              <p>{user.phone || "Not added"}</p>
            </div>

            <div>
              <span>Address</span>
              <p>{user.address || "Not added"}</p>
            </div>

            <div>
              <span>Joined</span>
              <p>
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : "Not available"}
              </p>
            </div>
          </div>

          <button onClick={logout} className="logout-profile-btn">
            Logout
          </button>
        </div>

        <div className="profile-edit">
          <h2>Edit Profile</h2>

          <form onSubmit={updateProfile}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={user.name || ""}
              onChange={handleChange}
              required
            />

            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email || ""}
              disabled
            />

            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter Phone"
              value={user.phone || ""}
              onChange={handleChange}
            />

            <label>Address</label>
            <textarea
              name="address"
              placeholder="Enter Address"
              value={user.address || ""}
              onChange={handleChange}
            ></textarea>

            <button className="btn profile-btn">Update Profile</button>
          </form>
        </div>
      </div>

      <div className="last-order-section">
        <h2>Last Ordered Items</h2>

        {lastItems.length === 0 ? (
          <p className="empty-last-order">No order placed yet.</p>
        ) : (
          <div className="last-order-grid">
            {lastItems.map((item, index) => (
              <div className="last-order-card" key={index}>
                <img src={`/images/${item.image}`} alt={item.name} />

                <div className="last-order-details">
                  <h3>{item.name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ₹{item.price}</p>
                  <p>Total: ₹{item.total}</p>

                  <button
                    onClick={() => reorderItem(item.food_id)}
                    className="reorder-btn"
                  >
                    Re-order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCartBar && (
        <div className="bottom-cart-bar">
          <div>
            {cartCount} {cartCount === 1 ? "Item" : "Items"} added
          </div>

          <Link to="/cart" className="view-cart-link">
            View Cart ❯
          </Link>
        </div>
      )}
    </div>
  );
}

export default Profile;