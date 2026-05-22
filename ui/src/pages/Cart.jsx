import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Cart.css";

function Cart({ setUser }) {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  const removeItem = (cartId) => {
    const updated = cart.filter((item) => item.cartId !== cartId);
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const updateQty = (cartId, delta) => {
    const updated = cart.map((item) => {
      if (item.cartId === cartId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    localStorage.setItem("cart", JSON.stringify(updated));
    setCart(updated);
  };

  const clearCart = () => {
    if (window.confirm("Clear entire cart?")) {
      localStorage.setItem("cart", JSON.stringify([]));
      setCart([]);
    }
  };

  const checkoutAll = () => {
    if (cart.length === 0) return;
    const now = new Date().toLocaleString();
    const newOrders = cart.map((item) => ({
      ...item,
      date: now,
      orderId: Date.now() + Math.random(),
      status: "ordered",
    }));
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders = [...orders, ...newOrders];
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("cart", JSON.stringify([]));
    setCart([]);
    alert("All items checked out! Go to Orders to track.");
    navigate("/orders");
  };

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <>
      <Navbar setUser={setUser} />

      <div className="cart-page">
        <div className="cart-header">
          <h1>🛒 My Cart</h1>
          {cart.length > 0 && (
            <button className="cart-clear-btn" onClick={clearCart}>
              Clear All
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add items from the shop to get started.</p>
            <button onClick={() => navigate("/products")}>Browse Products</button>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <CartItem
                  key={item.cartId}
                  item={item}
                  onRemove={removeItem}
                  onQty={updateQty}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="cart-summary-inner">
                <div className="cart-summary-row">
                  <span>Items</span>
                  <span>{cart.length}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>₱{total.toFixed(2)}</span>
                </div>
                <button className="cart-checkout-btn" onClick={checkoutAll}>
                  Checkout All →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CartItem({ item, onRemove, onQty }) {
  const imageUrl =
    item.image_url && item.image_url.trim() !== ""
      ? item.image_url
      : "https://via.placeholder.com/100x100?text=No+Image";

  const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  return (
    <div className="cart-item">
      <img
        src={imageUrl}
        alt={item.name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/100x100?text=Err";
        }}
      />
      <div className="cart-item-info">
        <h3>{item.name}</h3>
        {item.addons && (
          <p className="cart-item-addons">Add-ons: {item.addons}</p>
        )}
        <p className="cart-item-price">₱{item.price} each</p>
      </div>
      <div className="cart-item-controls">
        <div className="cart-qty-row">
          <button onClick={() => onQty(item.cartId, -1)}>−</button>
          <span>{item.quantity}</span>
          <button onClick={() => onQty(item.cartId, 1)}>+</button>
        </div>
        <p className="cart-item-subtotal">₱{subtotal}</p>
        <button
          className="cart-remove-btn"
          onClick={() => onRemove(item.cartId)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default Cart;