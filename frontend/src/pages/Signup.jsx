import { useState } from "react";
import axios from "axios";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const signup = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/signup", form);
    setMessage(res.data.message);

    if (res.data.success) {
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
  };

  return (
    <div className="form-container">
      <h2>User Signup</h2>

      <form onSubmit={signup}>
        <input name="name" placeholder="Enter Name" onChange={handleChange} required />
        <input name="email" type="email" placeholder="Enter Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Enter Password" onChange={handleChange} required />
        <input name="phone" placeholder="Enter Phone Number" onChange={handleChange} />
        <textarea name="address" placeholder="Enter Address" onChange={handleChange}></textarea>
        <button className="btn">Signup</button>
      </form>

      <p className="message">{message}</p>
    </div>
  );
}

export default Signup;