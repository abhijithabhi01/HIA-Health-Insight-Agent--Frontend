import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Auth from "./Auth";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });
  const [activeChatId, setActiveChatId] = useState(null);
  const toggleSidebar = () => setIsSidebarOpen((p) => !p);

  return (
    <Routes>
      {/* AUTH ROUTE */}
      <Route path="/auth" element={<Auth />} />

      {/* MAIN APP */}
      <Route
        path="/"
        element={
          <div className="flex h-screen bg-black text-gray-100 overflow-hidden">

            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              activeChatId={activeChatId}
              onSelectChat={setActiveChatId}
            />




            <main className="flex-1 flex flex-col overflow-hidden">
              <Home
                toggleSidebar={toggleSidebar}
                isSidebarOpen={isSidebarOpen}
                activeChatId={activeChatId}
              />
            </main>
          </div>
        }
      />
    </Routes>
  );
}