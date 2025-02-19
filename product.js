const db = require("./db");
const redis = require("./redisClient");

// Get all products (with Redis caching)
const getAllProducts = async (req, res) => {
  try {
    const cacheKey = "all_products";
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      console.log("🔵 Fetching from Redis Cache");
      return res.json(JSON.parse(cachedData));
    }

    console.log("🟠 Fetching from MySQL");
    const [rows] = await db.query("SELECT * FROM products");

    await redis.setex(cacheKey, 600, JSON.stringify(rows));

    res.json(rows);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, image_url } = req.body;
    
    await db.query(
      "INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, category_id, image_url]
    );

    await redis.del("all_products");  // Clear cache

    res.json({ message: "Product added successfully" });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, image_url } = req.body;

    await db.query(
      "UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?, image_url=? WHERE id=?",
      [name, description, price, stock, category_id, image_url, id]
    );

    await redis.del("all_products");  // Clear cache

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM products WHERE id=?", [id]);

    await redis.del("all_products");  // Clear cache

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct
};
