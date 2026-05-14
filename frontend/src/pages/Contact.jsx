import { useState } from "react";
import axios from "axios";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [responseMessage, setResponseMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const res = await axios.post("/api/contact", form);

    setResponseMessage(res.data.message);

    if (res.data.success) {
      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }
  };

  return (
    <div className="contact-page">
      <h2 className="section-title">Contact Us</h2>

      <div className="contact-wrapper">
        <div className="contact-info-box">
          <h3>Get in Touch</h3>
          <p>
            Have any question or issue with your order? Send us a message and
            we will contact you soon.
          </p>

          <div className="contact-detail">
            <strong>Email:</strong>
            <span>support@foodzone.com</span>
          </div>

          <div className="contact-detail">
            <strong>Phone:</strong>
            <span>+91 9876543210</span>
          </div>

          <div className="contact-detail">
            <strong>Address:</strong>
            <span>Gurugram, Haryana, India</span>
          </div>
        </div>

        <div className="contact-form-box">
          <h3>Send Message</h3>

          <form onSubmit={sendMessage}>
            <input
              type="text"
              name="name"
              placeholder="Enter Your Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter Your Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="subject"
              placeholder="Enter Subject"
              value={form.subject}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Enter Your Message"
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button className="btn">Send Message</button>
          </form>

          <p className={responseMessage.includes("successfully") ? "message" : "error"}>
            {responseMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;