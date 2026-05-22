import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import Login from "./login";
import Register from "./register";
import Home from "./pages/Home";
import AdminDashboard from "./admin/AdminDashboard";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import ItemPage from "./pages/ItemPage";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import music from "./assets/music.mp3";

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );

  const audioRef = useRef(null);

  useEffect(() => {
    const enableAudio = async () => {
      try {
        if (audioRef.current) {
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
        }
      } catch (err) {
        console.log("Waiting for user interaction...");
      }
    };

    const handleUserInteraction = () => {
      enableAudio();
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    return () => document.removeEventListener("click", handleUserInteraction);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={music} type="audio/mpeg" />
      </audio>

      <BrowserRouter>
        <Routes>

          {/* DEFAULT */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              user
                ? isAdmin
                  ? <Navigate to="/admin" />
                  : <Navigate to="/home" />
                : <Login setUser={setUser} />
            }
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={user ? <Navigate to="/home" /> : <Register setUser={setUser} />}
          />

          {/* HOME — regular users only */}
          <Route
            path="/home"
            element={
              !user
                ? <Navigate to="/login" />
                : isAdmin
                  ? <Navigate to="/admin" />
                  : <Home setUser={setUser} />
            }
          />

          {/* PRODUCTS */}
          <Route
            path="/products"
            element={user && !isAdmin ? <Products setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* ITEM DETAIL */}
          <Route
            path="/item/:id"
            element={user && !isAdmin ? <ItemPage setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={user ? <Profile setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* CART */}
          <Route
            path="/cart"
            element={user && !isAdmin ? <Cart setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* ORDERS */}
          <Route
            path="/orders"
            element={user && !isAdmin ? <Orders setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* ADMIN — admin only, redirects regular users away */}
          <Route
            path="/admin"
            element={
              !user
                ? <Navigate to="/login" />
                : isAdmin
                  ? <AdminDashboard />
                  : <Navigate to="/home" />
            }
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;