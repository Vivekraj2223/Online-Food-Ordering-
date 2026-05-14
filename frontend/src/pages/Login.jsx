import { useState } from "react";
import axios from "axios";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/login", form);

    setMessage(res.data.message);

    if (res.data.success) {
      window.location.href = "/";
    }
  };

  return (
    <div className="form-container">
      <h2>User Login</h2>

      <form onSubmit={loginUser}>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="btn">Login</button>
      </form>

      <p className={message.includes("successful") ? "message" : "error"}>
        {message}
      </p>
    </div>
  );
}

export default Login;