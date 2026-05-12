import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import Navbar from "./components/Navbar";
import Login from "./login";
import Register from "./register";
import Home from "./pages/Home";
import AdminDashboard from "./admin/AdminDashboard";
import Products from "./pages/Products";
import Profile from "./pages/Profile";

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

    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, []);

  return (
    <>
      {/* GLOBAL MUSIC */}
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
            element={user ? <Navigate to="/home" /> : <Login setUser={setUser} />}
          />

          {/* REGISTER */}
          <Route
            path="/register"
            element={user ? <Navigate to="/home" /> : <Register setUser={setUser} />}
          />

          {/* HOME */}
          <Route
            path="/home"
            element={user ? <Home setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* PRODUCTS */}
          <Route
            path="/products"
            element={user ? <Products setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={user ? <Profile setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* CART */}
          <Route
            path="/cart"
            element={
              user ? (
                <>
                  <Navbar setUser={setUser} />
                  <div style={{ padding: "50px", color: "white", fontSize: "2rem" }}>
                    🛒 Cart Page
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ORDERS */}
          <Route
            path="/orders"
            element={
              user ? (
                <>
                  <Navbar setUser={setUser} />
                  <div style={{ padding: "50px", color: "white", fontSize: "2rem" }}>
                    📦 Orders Page
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* MESSAGES */}
          <Route
            path="/messages"
            element={
              user ? (
                <>
                  <Navbar setUser={setUser} />
                  <div style={{ padding: "50px", color: "white", fontSize: "2rem" }}>
                    💬 Messages Page
                  </div>
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/login" />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
