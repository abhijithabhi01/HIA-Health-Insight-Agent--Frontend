import { useState, useRef, useEffect } from 'react';
import UserMenu from "./UserMenu";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { chatAPI } from "../api/chat.api";
import { analysisAPI } from "../api/analysis.api";
import toast from 'react-hot-toast';
import { confirmToast } from './ConfirmToast';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load specific chat by ID
  const loadChat = async (chatId) => {
    try {
      const res = await chatAPI.getChatById(chatId);
      setCurrentChatId(res.data._id);

      const mappedMessages = (res.data.messages || []).map(msg => ({
        role: msg.role,
        text: msg.content,
        files: msg.files || []
      }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error('Failed to load chat:', err);
      toast.error('Failed to load chat');
    }
  };

  // Handle chat selection from sidebar
  const handleChatSelect = (chatId) => {
    loadChat(chatId);
  };

  // Handle new chat creation
  const handleNewChat = async () => {
    try {
      setMessages([]);
      setCurrentChatId(null);
      setInput('');
      setFiles([]);

      toast.success('New chat started');
    } catch (err) {
      console.error('Failed to start new chat:', err);
    }
  };

  // File select handler
  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);

    const processed = selected.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "pdf",
      name: file.name,
    }));

    setFiles((prev) => [...prev, ...processed]);
  };

  // Remove file handler
  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // 🔥 NEW: Analyze uploaded file
  const analyzeFile = async (fileObj) => {
    try {
      setIsAnalyzing(true);

      toast.loading('Analyzing your report...', { id: 'analyzing' });

      // Call upload API
      const res = await analysisAPI.uploadAndAnalyze(fileObj.file);

      toast.success('Analysis complete!', { id: 'analyzing' });

      // Add analysis result to messages
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          text: "📄 Uploaded medical report for analysis",
          files: [fileObj]
        },
        {
          role: "assistant",
          text: res.data.insight,
          files: []
        }
      ]);

      // Clear files
      setFiles([]);

    } catch (err) {
      console.error('Analysis error:', err);
      toast.error(err.response?.data?.error || 'Failed to analyze report', { id: 'analyzing' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message (regular chat or with analysis)
  const sendMessage = async () => {
    // If there are files, trigger analysis instead of regular chat
    if (files.length > 0) {
      // Analyze the first file (you can modify to handle multiple)
      await analyzeFile(files[0]);
      return;
    }

    if (!input.trim()) return;

    let chatId = currentChatId;
    const userText = input;

    try {
      // Create chat if not exists
      if (!chatId) {
        const chatRes = await chatAPI.createChat("Health Insight Chat");
        chatId = chatRes.data._id;
        setCurrentChatId(chatId);
      }

      // Show user message
      setMessages((prev) => [
        ...prev,
        { role: "user", text: userText, files: [] },
      ]);

      setInput("");
      setIsTyping(true);

      // Call backend
      const res = await chatAPI.sendMessage(chatId, userText);

      // Show assistant response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.data.reply, files: [] },
      ]);
    } catch (err) {
      toast.error("Failed to get response");
    } finally {
      setIsTyping(false);
    }
  };

  // Delete chat
  async function handleDeleteChat() {
    if (!currentChatId) {
      toast.error('No chat selected');
      return;
    }

    confirmToast(
      'Are you sure you want to delete this chat?',
      async () => {
        try {
          await chatAPI.deleteChat(currentChatId);
          setMessages([]);
          setCurrentChatId(null);
          toast.success("Chat deleted");
        } catch {
          toast.error("Failed to delete chat");
        }
      }
    );
  }

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isAnalyzing]);

  // Format message text with proper styling
  const formatMessageText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          if (!line.trim()) return <div key={index} className="h-2"></div>;

          const isBullet = line.trim().startsWith('•') ||
            line.trim().startsWith('-') ||
            line.trim().startsWith('*') ||
            /^\d+\./.test(line.trim());

          const hasBold = line.includes('**');

          if (isBullet) {
            let content = line.trim();
            content = content.replace(/^[•\-*]\s*/, '').replace(/^\d+\.\s*/, '');

            if (hasBold) {
              const parts = content.split(/\*\*(.*?)\*\*/g);
              return (
                <div key={index} className="flex gap-2 items-start">
                  <span className="text-blue-400 mt-1">•</span>
                  <span className="flex-1">
                    {parts.map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-200">{part}</strong> : part
                    )}
                  </span>
                </div>
              );
            }

            return (
              <div key={index} className="flex gap-2 items-start">
                <span className="text-blue-400 mt-1">•</span>
                <span className="flex-1">{content}</span>
              </div>
            );
          }

          if (hasBold) {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <div key={index}>
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-200">{part}</strong> : part
                )}
              </div>
            );
          }

          return <div key={index}>{line}</div>;
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-gray-200">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-zinc-800 px-4 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition"
            title="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isSidebarOpen ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">HIA</span>
            <span className="bg-zinc-800 px-2 py-0.5 rounded text-xs">
              v1.0
            </span>
          </div>

          <UserMenu
            onDeleteChat={handleDeleteChat}
            onShareChat={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard');
            }}
          />
        </header>

        {/* Chat Area */}
        <section className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center gap-6">
              <h1 className="text-3xl font-light text-gray-300 text-center">
                Simplifying your health data into meaningful insights.
              </h1>

              {/* Upload hint */}
              <div className="flex flex-col items-center gap-3 text-gray-400 text-sm">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p>Upload a medical report image or PDF to get started</p>
              </div>
            </div>
          )}

          <div className="w-full px-4 sm:px-6 lg:px-24 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="bg-zinc-900 px-4 py-3 rounded-xl max-w-[75%] text-sm">
                  {formatMessageText(msg.text)}

                  {msg.files && msg.files.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {msg.files.map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setPreview(f)}
                          className="cursor-pointer"
                        >
                          {f.type === "image" ? (
                            <img
                              src={f.url}
                              alt={f.name}
                              className="w-24 h-24 object-cover rounded-lg border border-zinc-700"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-lg border border-zinc-700 flex items-center justify-center text-xs bg-zinc-800">
                              📄 PDF
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {(isTyping || isAnalyzing) && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 px-4 py-3 rounded-xl text-sm italic text-gray-400">
                  {isAnalyzing ? '🔍 Analyzing your medical report...' : 'HIA is thinking...'}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </section>

        {/* Footer */}
        <footer className="shrink-0 border-t border-zinc-800 px-4 py-4">
          <div className="w-full px-4 sm:px-6 lg:px-24">
            <div className="bg-zinc-900 rounded-2xl px-3 py-2 flex flex-col gap-2">
              {/* FILE PREVIEWS */}
              {files.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="relative group cursor-pointer"
                      onClick={() => setPreview(f)}
                    >
                      {f.type === "image" ? (
                        <img
                          src={f.url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg border border-zinc-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-zinc-700 flex items-center justify-center text-xs bg-zinc-800">
                          📄 PDF
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT ROW */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="
    w-10 h-10
    flex items-center justify-center
    rounded-full
    bg-zinc-800
    text-gray-300
    hover:bg-zinc-100 hover:text-gray-800
    transition
  "
                  title="Upload medical report"
                >
                  +
                </button>


                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={files.length > 0 ? "Press Enter to analyze..." : "Ask anything or upload a report"}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && files.length === 0) || isAnalyzing}
                  className={`
                    w-10 h-10
                    flex items-center justify-center
                    rounded-full
                    transition
    ${(input.trim() || files.length > 0) && !isAnalyzing
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-zinc-800 text-gray-500"
                    }
  `}
                >
                  {files.length > 0 ? '🔍' : '➤'}
                </button>

              </div>
            </div>
          </div>
        </footer>

        {/* Preview Modal */}
        {preview && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full h-[90vh] bg-zinc-950 rounded-xl p-4">
              <button
                onClick={() => setPreview(null)}
                className="absolute rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
                style={{
                  top: '-20px',
                  right: '10px',
                  width: '30px',
                  height: '30px',
                  color: "red",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}
              >
                ✕
              </button>

              {preview.type === "image" ? (
                <img
                  src={preview.url}
                  alt=""
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={preview.url}
                  className="w-full h-full rounded"
                  title="PDF Preview"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}