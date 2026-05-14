import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Order Your Favourite Food Online</h1>
          <p>Fresh food, fast delivery, and easy ordering with FoodZone.</p>
          <Link to="/menu" className="btn">Order Now</Link>
        </div>
      </section>

      <section className="why-section">
        <h2 className="section-title">Why Choose FoodZone?</h2>

        <div className="why-container">
          <div className="why-card">
            <img src="/images/pizza.jpg" alt="Fresh Food" />
            <div className="why-content">
              <h3>Fresh Food</h3>
              <p>We serve fresh and tasty food prepared with quality ingredients.</p>
              <h4>Best Quality</h4>
            </div>
          </div>

          <div className="why-card">
            <img src="/images/burger.jpg" alt="Fast Delivery" />
            <div className="why-content">
              <h3>Fast Delivery</h3>
              <p>Quick ordering process with smooth and simple user experience.</p>
              <h4>Fast Service</h4>
            </div>
          </div>

          <div className="why-card">
            <img src="/images/biryani.jpg" alt="Easy Ordering" />
            <div className="why-content">
              <h3>Easy Ordering</h3>
              <p>Add food to cart, place order, and view your order history easily.</p>
              <h4>Simple System</h4>
            </div>
          </div>

          <div className="why-card">
            <img src="/images/coffee.jpg" alt="Secure Checkout" />
            <div className="why-content">
              <h3>Secure Checkout</h3>
              <p>Your profile, cart, orders, and contact messages are safely stored.</p>
              <h4>Safe System</h4>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;