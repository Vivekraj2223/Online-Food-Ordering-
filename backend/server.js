const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const db = require("./db");

const app = express();
const PORT = 5000;

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: "food_ordering_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false
    }
}));

app.get("/", (req, res) => {
    res.send("Backend server is running");
});

// User signup
app.post("/api/signup", async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, phone, address], (err) => {
        if (err) {
            return res.json({
                success: false,
                message: "Email already exists or signup failed"
            });
        }

        res.json({
            success: true,
            message: "Signup successful"
        });
    });
});

// User login
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err) {
            return res.json({
                success: false,
                message: "Login error"
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid email or password"
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.json({
            success: true,
            message: "Login successful",
            user: req.session.user
        });
    });
});

// Get user profile
app.get("/api/profile", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;

    const sql = "SELECT id, name, email, phone, address, created_at FROM users WHERE id = ?";

    db.query(sql, [user_id], (err, results) => {
        if (err || results.length === 0) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: results[0]
        });
    });
});

// Update user profile
app.put("/api/profile/update", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;
    const { name, phone, address } = req.body;

    const sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";

    db.query(sql, [name, phone, address, user_id], (err) => {
        if (err) {
            return res.json({
                success: false,
                message: "Profile update failed"
            });
        }

        req.session.user.name = name;

        res.json({
            success: true,
            message: "Profile updated successfully"
        });
    });
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy();
    res.json({
        success: true,
        message: "Logout successful"
    });
});

// Get food items
app.get("/api/foods", (req, res) => {
    const sql = "SELECT * FROM food_items WHERE status='Available'";

    db.query(sql, (err, results) => {
        if (err) {
            return res.json([]);
        }

        res.json(results);
    });
});

// Add to cart
app.post("/api/cart/add", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;
    const { food_id } = req.body;

    const checkSql = "SELECT * FROM cart WHERE user_id = ? AND food_id = ?";

    db.query(checkSql, [user_id, food_id], (err, results) => {
        if (err) {
            return res.json({
                success: false,
                message: "Cart error"
            });
        }

        if (results.length > 0) {
            const updateSql = "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND food_id = ?";

            db.query(updateSql, [user_id, food_id], () => {
                res.json({
                    success: true,
                    message: "Cart updated"
                });
            });
        } else {
            const insertSql = "INSERT INTO cart (user_id, food_id, quantity) VALUES (?, ?, 1)";

            db.query(insertSql, [user_id, food_id], () => {
                res.json({
                    success: true,
                    message: "Added to cart"
                });
            });
        }
    });
});

// Get cart items
// Get cart items
app.get("/api/cart", (req, res) => {
    if (!req.session.user) {
        return res.json([]);
    }

    const user_id = req.session.user.id;

    const sql = `
        SELECT cart.id, cart.food_id, food_items.name, food_items.price, food_items.image, cart.quantity,
        (food_items.price * cart.quantity) AS total
        FROM cart
        JOIN food_items ON cart.food_id = food_items.id
        WHERE cart.user_id = ?
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.json([]);
        }

        res.json(results);
    });
});

// Remove cart item
app.delete("/api/cart/:id", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const cartId = req.params.id;
    const user_id = req.session.user.id;

    const sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";

    db.query(sql, [cartId, user_id], () => {
        res.json({
            success: true,
            message: "Item removed"
        });
    });
});

// Place order
app.post("/api/order/place", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;

    const cartSql = `
        SELECT cart.food_id, cart.quantity, food_items.price
        FROM cart
        JOIN food_items ON cart.food_id = food_items.id
        WHERE cart.user_id = ?
    `;

    db.query(cartSql, [user_id], (err, cartItems) => {
        if (err) {
            return res.json({
                success: false,
                message: "Order error"
            });
        }

        if (cartItems.length === 0) {
            return res.json({
                success: false,
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;

        cartItems.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        const orderSql = "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";

        db.query(orderSql, [user_id, totalAmount], (err, orderResult) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Order failed"
                });
            }

            const orderId = orderResult.insertId;

            cartItems.forEach(item => {
                const orderItemSql = "INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)";
                db.query(orderItemSql, [orderId, item.food_id, item.quantity, item.price]);
            });

            const clearCartSql = "DELETE FROM cart WHERE user_id = ?";

            db.query(clearCartSql, [user_id], () => {
                res.json({
                    success: true,
                    message: "Order placed successfully"
                });
            });
        });
    });
});

// Get user orders
app.get("/api/orders", (req, res) => {
    if (!req.session.user) {
        return res.json([]);
    }

    const user_id = req.session.user.id;

    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC";

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.json([]);
        }

        res.json(results);
    });
});

// Admin login
app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?";

    db.query(sql, [username, password], (err, results) => {
        if (err || results.length === 0) {
            return res.json({
                success: false,
                message: "Invalid admin login"
            });
        }

        req.session.admin = {
            id: results[0].id,
            username: results[0].username
        };

        res.json({
            success: true,
            message: "Admin login successful"
        });
    });
});

// Admin add food
app.post("/api/admin/food/add", (req, res) => {
    if (!req.session.admin) {
        return res.json({
            success: false,
            message: "Admin login required"
        });
    }

    const { name, category, price, image, description, status } = req.body;

    const sql = "INSERT INTO food_items (name, category, price, image, description, status) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [name, category, price, image, description, status], (err) => {
        if (err) {
            return res.json({
                success: false,
                message: "Food add failed"
            });
        }

        res.json({
            success: true,
            message: "Food added successfully"
        });
    });
});

// Admin delete food
app.delete("/api/admin/food/:id", (req, res) => {
    if (!req.session.admin) {
        return res.json({
            success: false,
            message: "Admin login required"
        });
    }

    const id = req.params.id;

    const sql = "DELETE FROM food_items WHERE id = ?";

    db.query(sql, [id], () => {
        res.json({
            success: true,
            message: "Food deleted successfully"
        });
    });
});

// Admin view all orders
app.get("/api/admin/orders", (req, res) => {
    if (!req.session.admin) {
        return res.json([]);
    }

    const sql = `
        SELECT orders.id, users.name, users.email, orders.total_amount, orders.order_status, orders.order_date
        FROM orders
        JOIN users ON orders.user_id = users.id
        ORDER BY orders.order_date DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.json([]);
        }

        res.json(results);
    });
});

// Admin update order status
app.put("/api/admin/orders/:id", (req, res) => {
    if (!req.session.admin) {
        return res.json({
            success: false,
            message: "Admin login required"
        });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    const sql = "UPDATE orders SET order_status = ? WHERE id = ?";

    db.query(sql, [status, orderId], () => {
        res.json({
            success: true,
            message: "Order status updated"
        });
    });
});
// Get last ordered items of logged-in user
app.get("/api/user/last-ordered-items", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;

    const lastOrderSql = `
        SELECT id 
        FROM orders 
        WHERE user_id = ? 
        ORDER BY order_date DESC 
        LIMIT 1
    `;

    db.query(lastOrderSql, [user_id], (err, orderResult) => {
        if (err) {
            return res.json({
                success: false,
                message: "Failed to fetch last order"
            });
        }

        if (orderResult.length === 0) {
            return res.json({
                success: true,
                items: []
            });
        }

        const lastOrderId = orderResult[0].id;

        const itemsSql = `
            SELECT food_items.id AS food_id, food_items.name, food_items.image, order_items.quantity, order_items.price,
            (order_items.quantity * order_items.price) AS total
            FROM order_items
            JOIN food_items ON order_items.food_id = food_items.id
            WHERE order_items.order_id = ?
        `;

        db.query(itemsSql, [lastOrderId], (err, itemsResult) => {
            if (err) {
                return res.json({
                    success: false,
                    message: "Failed to fetch ordered items"
                });
            }

            res.json({
                success: true,
                items: itemsResult
            });
        });
    });
});
// Increase cart item quantity
app.put("/api/cart/increase/:foodId", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;
    const food_id = req.params.foodId;

    const sql = "UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND food_id = ?";

    db.query(sql, [user_id, food_id], (err) => {
        if (err) {
            return res.json({
                success: false,
                message: "Quantity increase failed"
            });
        }

        res.json({
            success: true,
            message: "Quantity increased"
        });
    });
});

// Decrease cart item quantity
app.put("/api/cart/decrease/:foodId", (req, res) => {
    if (!req.session.user) {
        return res.json({
            success: false,
            message: "Please login first"
        });
    }

    const user_id = req.session.user.id;
    const food_id = req.params.foodId;

    const checkSql = "SELECT quantity FROM cart WHERE user_id = ? AND food_id = ?";

    db.query(checkSql, [user_id, food_id], (err, results) => {
        if (err || results.length === 0) {
            return res.json({
                success: false,
                message: "Item not found in cart"
            });
        }

        const quantity = results[0].quantity;

        if (quantity > 1) {
            const updateSql = "UPDATE cart SET quantity = quantity - 1 WHERE user_id = ? AND food_id = ?";

            db.query(updateSql, [user_id, food_id], (err) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: "Quantity decrease failed"
                    });
                }

                res.json({
                    success: true,
                    message: "Quantity decreased"
                });
            });
        } else {
            const deleteSql = "DELETE FROM cart WHERE user_id = ? AND food_id = ?";

            db.query(deleteSql, [user_id, food_id], (err) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: "Item remove failed"
                    });
                }

                res.json({
                    success: true,
                    message: "Item removed from cart"
                });
            });
        }
    });
});
// Save contact message
app.post("/api/contact", (req, res) => {
    const user_id = req.session.user ? req.session.user.id : null;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.json({
            success: false,
            message: "All fields are required"
        });
    }

    const sql = `
        INSERT INTO contact_messages (user_id, name, email, subject, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, name, email, subject, message], (err) => {
        if (err) {
            return res.json({
                success: false,
                message: "Message not sent"
            });
        }

        res.json({
            success: true,
            message: "Message sent successfully"
        });
    });
});
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});

// Keeps backend alive on your system
setInterval(() => {}, 1000);