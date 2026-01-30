import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./components/Home";
import Auth from "./Auth";

export default function App() {
  const [isAuth, setIsAuth] = useState(
    () => !!localStorage.getItem("token")
  );

  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/auth"
        element={
          isAuth ? <Navigate to="/" replace /> : <Auth setIsAuth={setIsAuth} />
        }
      />

      {/* HOME */}
      <Route
        path="/"
        element={
          isAuth ? <Home /> : <Navigate to="/auth" replace />
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
