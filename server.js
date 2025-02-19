const express = require("express");
const productService = require("./product");
const cartService = require("./cart");

const app = express();
app.use(express.json());

// Product routes
app.get("/products", productService.getAllProducts);
app.post("/products", productService.addProduct);
app.put("/products/:id", productService.updateProduct);
app.delete("/products/:id", productService.deleteProduct);

// Cart routes
app.get("/cart/:userId", cartService.getCart);
app.post("/cart", cartService.updateCart);
app.delete("/cart/item", cartService.deleteCartItem); // Pass user_id & product_id in body
app.delete("/cart/:userId", cartService.clearCart); // Clear entire cart for a user

// Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
