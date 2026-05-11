import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Products.css";

const CATEGORIES = [
  "All",
  "Espresso",
  "Latte",
  "Tea",
  "Pastries",
  "Beans",
  "Equipment",
];

function Products({ setUser }) {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const categoryRefs = useRef({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();

      console.log(data);

      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const cat = searchParams.get("cat");

    if (cat) {
      const match = CATEGORIES.find(
        (c) => c.toLowerCase() === cat.toLowerCase()
      );

      if (match) {
        setActiveCategory(match);
      }
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      activeCategory !== "All" &&
      categoryRefs.current[activeCategory]
    ) {
      categoryRefs.current[activeCategory].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeCategory]);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) =>
            p.category &&
            p.category.toLowerCase() ===
              activeCategory.toLowerCase()
        );

  const grouped = {};

  if (activeCategory === "All") {
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";

      if (!grouped[cat]) grouped[cat] = [];

      grouped[cat].push(p);
    });
  }

  return (
    <>
      <Navbar
        setUser={setUser}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <div className="shop-page">
        <section className="products-section">

          {activeCategory === "All" ? (
            Object.keys(grouped).length === 0 ? (
              <div className="no-products-msg">
                No products available.
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div
                  key={cat}
                  className="category-section"
                  ref={(el) => (categoryRefs.current[cat] = el)}
                >
                  <div className="section-title">
                    <h2>{cat}</h2>
                  </div>

                  <div className="products-grid">
                    {items.map((product) => (
                      <ProductCard
                        key={product.product_id}
                        product={product}
                      />
                    ))}
                  </div>
                </div>
              ))
            )
          ) : (
            <div
              className="category-section"
              ref={(el) =>
                (categoryRefs.current[activeCategory] = el)
              }
            >
              <div className="section-title">
                <h2>{activeCategory}</h2>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="no-products-msg">
                  No products in this category yet.
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.product_id}
                      product={product}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

        </section>
      </div>
    </>
  );
}

function ProductCard({ product }) {

  const imageUrl =
    product.image_url &&
    product.image_url.trim() !== ""
      ? product.image_url
      : "https://via.placeholder.com/400x300?text=No+Image";

  const addToCart = () => {

    let cart =
      JSON.parse(localStorage.getItem("cart")) || [];

    cart.push(product);

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(`${product.name} added to cart`);
  };

  const buyNow = () => {

    const quantity = prompt(
      "How many would you like?"
    );

    if (!quantity) return;

    const addons = prompt(
      "Add-ons? (example: extra shot)"
    );

    const order = {
      ...product,
      quantity,
      addons,
      date: new Date().toLocaleString(),
    };

    let orders =
      JSON.parse(localStorage.getItem("orders")) || [];

    orders.push(order);

    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Purchase successful!");
  };

  return (
    <div className="product-card">

      <img
        src={imageUrl}
        alt={product.name}
        onError={(e) => {
          e.target.src =
            "https://via.placeholder.com/400x300?text=Image+Error";
        }}
      />

      <div className="product-info">

        <h3>{product.name}</h3>

        <p className="product-price">
          ₱{product.price}
        </p>

        <div className="product-buttons">

          <button
            className="add-to-cart-btn"
            onClick={addToCart}
          >
            Add To Cart
          </button>

          <button
            className="buy-btn"
            onClick={buyNow}
          >
            Purchase
          </button>

        </div>

      </div>

    </div>
  );
}

export default Products;