import React, { useState, useEffect } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Total price calculation function
  const totalPrice = () => {
    let total = 0;
    cart?.forEach((item) => {
      total += item.price;
    });
    return total.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  };

  // Remove item from cart
  const removeCartItem = (productId) => {
    const updatedCart = cart.filter((item) => item._id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      // Validate required fields
      if (!auth?.user?._id || !cart || cart.length === 0) {
        throw new Error("User ID or cart items are missing.");
      }
  
      // Perform order placement logic here
      const response = await axios.post("/api/v1/auth/order", {
        products: cart.map(item => item._id), // Send only product IDs
        buyer: auth.user._id,
      });
      setLoading(false);
      // Clear cart after successful order placement
      setCart([]);
      localStorage.removeItem("cart");
      // Redirect to user orders page
      navigate("/dashboard/user/orders");
      toast.success("Order placed successfully!");
    } catch (error) {
      setLoading(false);
      console.error("Error placing order:", error);
      toast.error("Failed to place order yo. Please try again.");
    }
  };
  

  return (
    <Layout>
      <div className="cart-page">
        {/* Cart items section */}
        <div className="container">
          <div className="row">
            <div className="col-md-7">
              {cart?.map((product) => (
                <div className="row card flex-row" key={product._id}>
                  {/* Display product image, name, description, and price */}
                  {/* You can customize this section based on your product data */}
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${product._id}`}
                      className="card-img-top"
                      alt={product.name}
                      width="100%"
                      height="130px"
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{product.name}</p>
                    <p>{product.description.substring(0, 30)}</p>
                    <p>Price: {product.price}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    {/* Button to remove item from cart */}
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(product._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart summary section */}
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total: {totalPrice()}</h4>
              {/* Conditionally render address update or login button */}
              {!auth?.user?.address ? (
                <div className="mb-3">
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              ) : null}
              <div className="mt-2">
                {/* Button to place order */}
                <button
                  className="btn btn-primary"
                  onClick={handlePlaceOrder}
                  disabled={!auth?.user?.address || loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
