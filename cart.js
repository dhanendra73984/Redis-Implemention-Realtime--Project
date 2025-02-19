const db = require("./db");
const redis = require("./redisClient");

// Get cart items by userId
const getCart = async (req, res) => {
  const { userId } = req.params;
  const cacheKey = `cart_${userId}`;

  try {
    const cachedCart = await redis.get(cacheKey);
    if (cachedCart) {
      console.log("🔵 Fetching Cart from Redis");
      return res.json(JSON.parse(cachedCart));
    }

    console.log("🟠 Fetching Cart from MySQL");
    const [cartItems] = await db.query(
      "SELECT c.*, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?",
      [userId]
    );

    await redis.setex(cacheKey, 300, JSON.stringify(cartItems));

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add or update cart item
const updateCart = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  try {
    await db.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = ?",
      [user_id, product_id, quantity, quantity]
    );

    await redis.del(`cart_${user_id}`);

    res.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a cart item
const deleteCartItem = async (req, res) => {
  const { user_id, product_id } = req.body;

  try {
    await db.query("DELETE FROM cart WHERE user_id=? AND product_id=?", [user_id, product_id]);

    await redis.del(`cart_${user_id}`);

    res.json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Clear entire cart for a user
const clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    await db.query("DELETE FROM cart WHERE user_id=?", [userId]);

    await redis.del(`cart_${userId}`);

    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getCart,
  updateCart,
  deleteCartItem,
  clearCart
};
