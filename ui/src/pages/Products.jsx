import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  const searchQuery = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState("All");
  const categoryRefs = useRef({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
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
      if (match) setActiveCategory(match);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeCategory !== "All" && categoryRefs.current[activeCategory]) {
      categoryRefs.current[activeCategory].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeCategory]);

  const filteredProducts = products
    .filter((p) =>
      activeCategory === "All"
        ? true
        : p.category &&
          p.category.toLowerCase() === activeCategory.toLowerCase()
    )
    .filter((p) =>
      searchQuery
        ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(searchQuery.toLowerCase()))
        : true
    );

  const grouped = {};
  if (activeCategory === "All" && !searchQuery) {
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

          {searchQuery ? (
            <div className="category-section">
              <div className="section-title">
                <h2>Search results for "{searchQuery}"</h2>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="no-products-msg">
                  No products found for "{searchQuery}".
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.product_id} product={product} />
                  ))}
                </div>
              )}
            </div>

          ) : activeCategory === "All" ? (
            Object.keys(grouped).length === 0 ? (
              <div className="no-products-msg">No products available.</div>
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
                      <ProductCard key={product.product_id} product={product} />
                    ))}
                  </div>
                </div>
              ))
            )

          ) : (
            <div
              className="category-section"
              ref={(el) => (categoryRefs.current[activeCategory] = el)}
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
                    <ProductCard key={product.product_id} product={product} />
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
  const navigate = useNavigate();

  const imageUrl =
    product.image_url && product.image_url.trim() !== ""
      ? product.image_url
      : "https://via.placeholder.com/400x300?text=No+Image";

  const goToItem = () => navigate(`/item/${product.product_id}`);

  return (
    <div className="product-card" onClick={goToItem}>
      <img
        src={imageUrl}
        alt={product.name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/400x300?text=Image+Error";
        }}
      />
      <div className="product-info">
        <h3 className="product-name-link">{product.name}</h3>
        <p className="product-price">₱{product.price}</p>
        <div className="product-buttons">
          <button className="buy-btn" onClick={(e) => { e.stopPropagation(); goToItem(); }}>
            View Item
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;