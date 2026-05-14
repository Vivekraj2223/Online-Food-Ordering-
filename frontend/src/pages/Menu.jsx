import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Menu() {
  const [foods, setFoods] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showCartBar, setShowCartBar] = useState(false);
  const [message, setMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const loadCart = () => {
    axios.get("/api/cart").then(res => {
      setCartItems(res.data);

      const totalQuantity = res.data.reduce((sum, item) => {
        return sum + item.quantity;
      }, 0);

      setCartCount(totalQuantity);
      setShowCartBar(totalQuantity > 0);
    });
  };

  useEffect(() => {
    axios.get("/api/foods").then(res => {
      setFoods(res.data);
    });

    loadCart();
  }, []);

  const getQuantity = (foodId) => {
    const item = cartItems.find(cartItem => cartItem.food_id === foodId);
    return item ? item.quantity : 0;
  };

  const addToCart = async (foodId) => {
    const res = await axios.post("/api/cart/add", {
      food_id: foodId
    });

    if (res.data.success) {
      loadCart();
    } else {
      setMessage(res.data.message);
    }
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

  const categories = [
    "All",
    ...new Set(foods.map(food => food.category))
  ];

  let filteredFoods = foods.filter(food => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || food.category === selectedCategory;

    const matchesType =
      selectedType === "All" || food.food_type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  if (sortOption === "price-low") {
    filteredFoods = [...filteredFoods].sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-high") {
    filteredFoods = [...filteredFoods].sort((a, b) => b.price - a.price);
  } else if (sortOption === "name-az") {
    filteredFoods = [...filteredFoods].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  return (
    <div className="menu-page">
      <h2 className="section-title">Our Menu</h2>

      {message && <p className="error">{message}</p>}

      <div className="menu-controls">
        <input
          type="text"
          placeholder="Search food item..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="food-search"
        />

        <div className="filter-row">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
          </select>
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <p className="empty-cart">No food item found.</p>
      ) : (
        <div className="food-container">
          {filteredFoods.map(food => {
            const quantity = getQuantity(food.id);

            return (
              <div className="food-card" key={food.id}>
                <div className="food-img-box">
                  <img src={`/images/${food.image}`} alt={food.name} />

                  <span
                    className={
                      food.food_type === "Non-Veg"
                        ? "food-type nonveg"
                        : "food-type veg"
                    }
                  >
                    <span></span>
                  </span>
                </div>

                <div className="food-card-body">
                  <div className="food-title-row">
                    <h3>{food.name}</h3>
                    <span className="rating-badge">★ 4.5</span>
                  </div>

                  <p>{food.description}</p>

                  <div className="food-bottom-row">
                    <h4>₹{food.price}</h4>

                    {quantity === 0 ? (
                      <button onClick={() => addToCart(food.id)} className="btn">
                        Add to Cart
                      </button>
                    ) : (
                      <div className="quantity-box">
                        <button onClick={() => decreaseQuantity(food.id)}>-</button>
                        <span>{quantity}</span>
                        <button onClick={() => increaseQuantity(food.id)}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default Menu;