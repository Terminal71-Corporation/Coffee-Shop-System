import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRef, useEffect } from "react";

import Login from "./Login";
import Register from "./Register";
import music from "./assets/music.mp3";

function App() {
  const audioRef = useRef(null);

  useEffect(() => {
    const enableAudio = async () => {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.log("Waiting for user interaction...");
      }
    };

    // trigger on ANY click in the page
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
    <BrowserRouter>
      {/* GLOBAL MUSIC */}
      <audio ref={audioRef} loop>
        <source src={music} type="audio/mpeg" />
      </audio>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;