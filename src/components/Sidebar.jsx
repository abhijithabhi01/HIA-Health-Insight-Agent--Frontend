import { Search, MessageSquarePlus, X, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../api/chat.api';
import toast from 'react-hot-toast';
import { confirmToast } from './ConfirmToast';

export default function Sidebar({ isOpen, toggleSidebar, currentChatId, onChatSelect, onNewChat, refreshTrigger }) {
  const [chats, setChats] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  // Load all chats on mount
  useEffect(() => {
    loadChats();
  }, []);
  
  // Reload chats when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChats();
    }
  }, [currentChatId]);

  // Reload chats when refreshTrigger changes (e.g., after delete)
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadChats();
    }
  }, [refreshTrigger]);
  // Load user's chats
  const loadChats = async () => {
    try {
      const res = await chatAPI.getAllChats();
      setChats(res.data);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await chatAPI.searchChats(query);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    }
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    try {
      // Call the parent's new chat handler
      await onNewChat();

      // Reload chats to show the new one
    setTimeout(async () => {
      await loadChats();
    }, 100);

      // Close sidebar on mobile
      if (window.innerWidth < 1024) {
        toggleSidebar();
      }
    } catch (err) {
      console.error('Failed to create new chat:', err);
    }
  };

  // Handle chat deletion with toast confirmation
  const handleDeleteChat = async (chatId, e) => {
    e?.stopPropagation();

    confirmToast(
      'Are you sure you want to delete this chat?',
      async () => {
        try {
          await chatAPI.deleteChat(chatId);
          toast.success('Chat deleted');

          // Reload chats
          await loadChats();

          // If deleted chat was active, clear it
          if (currentChatId === chatId) {
            await onNewChat();
          }

          setOpenMenuId(null);
        } catch (err) {
          console.error('Failed to delete chat:', err);
          toast.error('Failed to delete chat');
        }
      }
    );
  };

  // Open rename modal
  const handleOpenRename = (chatId, currentTitle, e) => {
    e?.stopPropagation();
    setRenameChatId(chatId);
    setNewChatTitle(currentTitle);
    setRenameModalOpen(true);
    setOpenMenuId(null);
  };

  // Handle chat rename
  const handleRenameChat = async () => {
    if (!newChatTitle.trim()) {
      toast.error('Chat title cannot be empty');
      return;
    }

    try {
      await chatAPI.renameChat(renameChatId, newChatTitle);

      toast.success('Chat renamed');
      await loadChats();
      setRenameModalOpen(false);
      setRenameChatId(null);
      setNewChatTitle('');
    } catch (err) {
      console.error('Failed to rename chat:', err);
      toast.error('Failed to rename chat');
    }
  };


  // Handle chat selection
  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);

    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  // Group chats by date
  const groupChatsByDate = (chats) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const grouped = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      older: []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt);

      if (chatDate >= today) {
        grouped.today.push(chat);
      } else if (chatDate >= yesterday) {
        grouped.yesterday.push(chat);
      } else if (chatDate >= sevenDaysAgo) {
        grouped.previous7Days.push(chat);
      } else if (chatDate >= thirtyDaysAgo) {
        grouped.previous30Days.push(chat);
      } else {
        grouped.older.push(chat);
      }
    });

    return grouped;
  };

  const groupedChats = groupChatsByDate(chats);



  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => toggleSidebar()}        />
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
          <div className="p-4 flex items-center justify-between border-b border-zinc-800/50">
            <div className="flex items-center gap-2 font-medium text-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
                HIA
              </div>
              <span className="text-sm">Health Insight Agent</span>
            </div>
            <button 
  onClick={toggleSidebar} 
  className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/80 transition-all duration-200 text-gray-400 hover:text-white active:scale-95"
  aria-label="Close sidebar"
>
  <X className="w-5 h-5" />
</button>
          </div>

          {/* Menu */}
          <div className="p-3 space-y-1 text-sm text-gray-300">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-zinc-900 transition"
            >
              <MessageSquarePlus size={16} /> New chat
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-zinc-900 transition"
            >
              <Search size={16} /> Search chats
            </button>
          </div>

          {/* Chats */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            {chats.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No chats yet</p>
            ) : (
              <>
                {/* Today */}
                {groupedChats.today.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 mt-2">Today</p>
                    {groupedChats.today.map((chat) => (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        isActive={currentChatId === chat._id}
                        onClick={() => handleChatSelect(chat._id)}
                        onDelete={(e) => handleDeleteChat(chat._id, e)}
                        onRename={(e) => handleOpenRename(chat._id, chat.title, e)}
                        isMenuOpen={openMenuId === chat._id}
                        onMenuToggle={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Yesterday */}
                {groupedChats.yesterday.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 mt-4">Yesterday</p>
                    {groupedChats.yesterday.map((chat) => (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        isActive={currentChatId === chat._id}
                        onClick={() => handleChatSelect(chat._id)}
                        onDelete={(e) => handleDeleteChat(chat._id, e)}
                        onRename={(e) => handleOpenRename(chat._id, chat.title, e)}
                        isMenuOpen={openMenuId === chat._id}
                        onMenuToggle={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Previous 7 Days */}
                {groupedChats.previous7Days.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 mt-4">Previous 7 Days</p>
                    {groupedChats.previous7Days.map((chat) => (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        isActive={currentChatId === chat._id}
                        onClick={() => handleChatSelect(chat._id)}
                        onDelete={(e) => handleDeleteChat(chat._id, e)}
                        onRename={(e) => handleOpenRename(chat._id, chat.title, e)}
                        isMenuOpen={openMenuId === chat._id}
                        onMenuToggle={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Previous 30 Days */}
                {groupedChats.previous30Days.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 mt-4">Previous 30 Days</p>
                    {groupedChats.previous30Days.map((chat) => (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        isActive={currentChatId === chat._id}
                        onClick={() => handleChatSelect(chat._id)}
                        onDelete={(e) => handleDeleteChat(chat._id, e)}
                        onRename={(e) => handleOpenRename(chat._id, chat.title, e)}
                        isMenuOpen={openMenuId === chat._id}
                        onMenuToggle={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Older */}
                {groupedChats.older.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 mt-4">Older</p>
                    {groupedChats.older.map((chat) => (
                      <ChatItem
                        key={chat._id}
                        chat={chat}
                        isActive={currentChatId === chat._id}
                        onClick={() => handleChatSelect(chat._id)}
                        onDelete={(e) => handleDeleteChat(chat._id, e)}
                        onRename={(e) => handleOpenRename(chat._id, chat.title, e)}
                        isMenuOpen={openMenuId === chat._id}
                        onMenuToggle={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === chat._id ? null : chat._id);
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-xl">
            {/* HEADER */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
                autoFocus
              />

              {/* CLOSE */}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* RESULTS */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Type to search your chats...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No chats found
                </div>
              ) : (
                searchResults.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => {
                      handleChatSelect(chat._id);
                      setSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    className="px-3 py-2 rounded-lg hover:bg-zinc-800 cursor-pointer text-sm flex items-center gap-2"
                  >
                    💬 {chat.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Rename Chat</h2>

            <input
              type="text"
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameChat();
                } else if (e.key === 'Escape') {
                  setRenameModalOpen(false);
                }
              }}
              placeholder="Enter new chat name"
              className="w-full bg-zinc-800 px-4 py-2 rounded-lg outline-none text-sm text-gray-200 placeholder-gray-500 border border-zinc-700 focus:border-blue-500"
              autoFocus
            />

            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => {
                  setRenameModalOpen(false);
                  setRenameChatId(null);
                  setNewChatTitle('');
                }}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameChat}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm transition"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChatItem({ chat, isActive, onClick, onDelete, onRename, isMenuOpen, onMenuToggle }) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isMenuOpen) {
          onMenuToggle(event);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      onClick={onClick}
      className={`group relative px-3 py-2 rounded hover:bg-zinc-900 cursor-pointer text-sm transition flex items-center justify-between ${isActive ? 'bg-zinc-800 text-white' : 'text-gray-300'
        }`}
      title={chat.title}
    >
      <span className="truncate flex-1">{chat.title}</span>

      {/* Menu Button - Shows on hover or when active */}
      <button
        onClick={onMenuToggle}
        className={`p-1 rounded hover:bg-zinc-700 transition ${isMenuOpen || isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-10  w-44 bg-zinc-900 border border-zinc-900 rounded-xl shadow-lg overflow-hidden z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onRename}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0"
          >
            <Edit2 size={14} />
            Rename
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-zinc-800 border-none focus:outline-none focus:ring-0 text-red-400"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}