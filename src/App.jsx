import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Auth from "./Auth";

export default function App() {
  return (
    <Routes>
      {/* AUTH ROUTE */}
      <Route path="/auth" element={<Auth />} />

      {/* MAIN APP - Home component handles everything including sidebar */}
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
