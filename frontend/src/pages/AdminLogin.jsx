import { useState } from "react";
import axios from "axios";

function AdminLogin() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const login = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/admin/login", form);
    setMessage(res.data.message);

    if (res.data.success) {
      setTimeout(() => {
        window.location.href = "/admin-dashboard";
      }, 1000);
    }
  };

  return (
    <div className="form-container">
      <h2>Admin Login</h2>

      <form onSubmit={login}>
        <input name="username" placeholder="Enter Username" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Enter Password" onChange={handleChange} required />
        <button className="btn">Login</button>
      </form>

      <p className={message.includes("successful") ? "message" : "error"}>{message}</p>
    </div>
  );
}

export default AdminLogin;