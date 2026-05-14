import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import axios from "axios";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Orders from "./pages/Orders";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.withCredentials = true;

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("/api/profile").then(res => {
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="navbar">
      <div className="logo">FoodZone</div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">My Orders</Link>
        <Link to="/contact">Contact</Link>

        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Signup</Link>}

        <Link to="/admin-login">Admin</Link>

        {user && (
          <Link to="/profile" className="profile-circle">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Link>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>

      <div className="footer">
        <p>&copy; 2026 FoodZone. All Rights Reserved.</p>
      </div>
    </>
  );
}

export default App;