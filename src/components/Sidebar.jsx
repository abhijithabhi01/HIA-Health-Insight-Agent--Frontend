import { Search, Image, Grid3x3, Box, FolderKanban, MessageSquarePlus, X, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const chats = [
    'Patient Care Plan',
    'Medication Analysis',
    'Symptom Checker',
    'Lab Results Review',
    'Health Risk Assessment',
    'Nutrition Guidance',
    'Exercise Recommendations',
    'Mental Health Support',
  ];
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 inset-y-0 left-0
  bg-zinc-950 border-r border-zinc-800
  transition-all duration-300 ease-in-out
  ${isOpen ? 'w-72' : 'w-0'}
  overflow-hidden`}
      >


        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4  flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm">
                HIA
              </div>
              Health Insight Agent
            </div>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X />
            </button>
          </div>

          {/* Menu */}
          <div className="p-3 space-y-1 text-sm text-gray-300 ">
            <Link
              style={{ textDecoration: 'none', color: 'white' }}
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-zinc-900"
            >
              <MessageSquarePlus size={16} /> New chat
            </Link>

            <Link
            style={{ textDecoration: 'none', color: 'white' }}
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-zinc-900"
            >
              <Search size={16} /> Search chats
            </Link>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className="text-xs text-gray-500 mb-2">Your chats</p>
            {chats.map((chat, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded hover:bg-zinc-900 cursor-pointer text-sm"
              >
                {chat}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <input
                type="text"
                placeholder="Search chats..."
                className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
                autoFocus
              />

              {/* CLOSE */}
              <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* RESULTS */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              <div className="p-3 rounded-lg hover:bg-zinc-800 cursor-pointer">
                ✏️ New chat
              </div>

              <p className="px-3 py-2 text-xs text-gray-400">Today</p>
              <ChatItem title="Responsive HIA Frontend Fix" />

              <p className="px-3 py-2 text-xs text-gray-400">Previous 7 Days</p>
              <ChatItem title="Internship request update" />
              <ChatItem title="MCA deep learning project ideas" />
              <ChatItem title="Kaggle Day 1a Summary" />
              <ChatItem title="Kaggle internet access error" />
            </div>
          </div>
        </div>
      )}

    </>
  );
}

function SidebarButton({ icon, label }) {
  return (
    <button className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-zinc-900">
      {icon}
      {label}
    </button>
  );
}
function ChatItem({ title }) {
  return (
    <div className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm flex items-center gap-2">
      💬 {title}
    </div>
  );
}
