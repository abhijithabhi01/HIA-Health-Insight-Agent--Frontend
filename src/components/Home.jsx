import { useState, useRef, useEffect } from 'react';
import UserMenu from "./UserMenu";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { chatAPI } from "../api/chat.api";
import { analysisAPI } from "../api/analysis.api";
import toast from 'react-hot-toast';
import { confirmToast } from './ConfirmToast';
import { LoadingFullScreen } from "./Loading";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import jsPDF from 'jspdf';

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
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('USER');
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 1024;
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch user profile to get role and name
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUserRole(data.role || 'USER');
        setUserName(data.name || 'Patient');

      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);


  // Function to trigger sidebar refresh
  const refreshSidebarChats = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Load specific chat by ID
  const loadChat = async (chatId) => {
    setIsLoading(true);
    try {
      const res = await chatAPI.getChatById(chatId);
      setCurrentChatId(res.data._id);

      const mappedMessages = (res.data.messages || []).map(msg => ({
        role: msg.role,
        text: msg.content,
        files: msg.files || [],
        // Preserve userRole and uploadedFileName from the saved message
        userRole: msg.userRole || userRole,
        uploadedFileName: msg.uploadedFileName || msg.files?.[0]?.name || null
      }));

      setMessages(mappedMessages);
    } catch (err) {
      console.error('Failed to load chat:', err);
      toast.error('Failed to load chat');
    }
    setIsLoading(false);
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

  // Analyze uploaded file and save to chat
  const analyzeFile = async (fileObj) => {
    try {
      setIsAnalyzing(true);

      const fileDataUrl = fileObj.url;

      const userMessage = {
        role: "user",
        text: "📄 Uploaded medical report for analysis",
        files: [{
          id: fileObj.id,
          name: fileObj.name,
          type: fileObj.type,
          url: fileDataUrl
        }]
      };

      setMessages((prev) => [...prev, userMessage]);

      toast.loading('Analyzing your report...', { id: 'analyzing' });

      const res = await analysisAPI.uploadAndAnalyze(fileObj.file, currentChatId);

      toast.success('Analysis complete!', { id: 'analyzing' });

      if (res.data.userRole) {
        setUserRole(res.data.userRole);
        console.log('👤 User role from analysis:', res.data.userRole);
      }

      if (res.data.chatId && !currentChatId) {
        setCurrentChatId(res.data.chatId);
      }

      setMessages((prev) => {
        const updated = [...prev];
        const lastUserMessageIndex = updated.length - 1;

        if (updated[lastUserMessageIndex].role === 'user' && res.data.fileUrl) {
          updated[lastUserMessageIndex] = {
            ...updated[lastUserMessageIndex],
            files: [{
              id: fileObj.id,
              name: res.data.fileName,
              type: res.data.fileType,
              url: res.data.fileUrl
            }]
          };
        }

        updated.push({
          role: "assistant",
          text: res.data.insight,
          files: [],
          userRole: res.data.userRole || userRole,
          uploadedFileName: res.data.fileName
        });

        return updated;
      });

      if (fileObj.url && fileObj.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileObj.url);
      }

      refreshSidebarChats();

    } catch (err) {
      console.error('Analysis error:', err);
      toast.error(err.response?.data?.error || 'Failed to analyze report', { id: 'analyzing' });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Send message (regular chat or with analysis)
  const sendMessage = async () => {
    if (files.length > 0) {
      const fileToAnalyze = files[0];
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await analyzeFile(fileToAnalyze);
      return;
    }

    if (!input.trim()) return;

    const trimmedInput = input.trim();
    const isReportLike = /\b(mg\/dL|mmol\/L|g\/dL|%|cells\/µL|units|range|reference|test|result|report|blood|sugar|glucose|cholesterol|hemoglobin|platelet|wbc|rbc)\b/i.test(trimmedInput);

    if (isReportLike) {
      setIsAnalyzing(true);

      const userMessage = {
        role: "user",
        text: trimmedInput,
        files: []
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      try {
        toast.loading('Analyzing your report...', { id: 'analyzing-text' });

        const res = await analysisAPI.analyzeReport(trimmedInput);

        toast.success('Analysis complete!', { id: 'analyzing-text' });

        // Get the chatId if response includes it
        const chatIdToUse = res.data.chatId || currentChatId;
        if (chatIdToUse && !currentChatId) {
          setCurrentChatId(chatIdToUse);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.data.insight,
            files: [],
            // Store userRole with the message for persistence
            userRole: res.data.userRole || userRole,
            uploadedFileName: 'text-input' // Marker for text-based analysis
          }
        ]);

        refreshSidebarChats();

      } catch (err) {
        console.error('Text analysis error:', err);
        toast.error(err.response?.data?.error || 'Failed to analyze report', { id: 'analyzing-text' });
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setIsTyping(true);

      const userMessage = {
        role: "user",
        text: trimmedInput,
        files: []
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');

      try {
        let chatIdToUse = currentChatId;

        if (!chatIdToUse) {
          const newChatRes = await chatAPI.createChat('New Health Chat');
          chatIdToUse = newChatRes.data._id;
          setCurrentChatId(chatIdToUse);
          refreshSidebarChats();
        }

        const res = await chatAPI.sendMessage(chatIdToUse, trimmedInput);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.data.reply,
            files: []
          }
        ]);
      } catch (err) {
        console.error('Chat message error:', err);
        toast.error(err.response?.data?.error || 'Failed to send message');
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Delete chat handler
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
          refreshSidebarChats(); // Trigger sidebar to reload chats
        } catch {
          toast.error("Failed to delete chat");
        }
      }
    );
  }

  // Rename chat handler
  const handleRenameChat = async (chatId, newTitle) => {
    try {
      await chatAPI.renameChat(chatId, newTitle);
      toast.success('Chat renamed');
      refreshSidebarChats();

      if (currentChatId === chatId) {
        // No need to reload messages, just refresh sidebar
      }
    } catch (err) {
      console.error('Failed to rename chat:', err);
      toast.error(err.response?.data?.error || 'Failed to rename chat');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Poll for role updates every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:5000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        // Update role if changed
        if (data.role !== userRole) {
          setUserRole(data.role);
          console.log('👤 Role updated:', data.role);
          toast.success(`Your role has been updated to ${data.role}!`);
        }
      } catch (error) {
        console.error('Failed to poll user profile:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(pollInterval);
  }, [userRole]);
  // Generate PDF Report for HC users
  const generatePDFReport = (messageIndex) => {
    setIsGeneratingPDF(true);

    try {
      const message = messages[messageIndex];
      const reportText = message.text;
      const fileName = message.uploadedFileName || 'medical-report';

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Blue
      doc.text('Health Insight Agent', 105, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Clinical Analysis Report', 105, 30, { align: 'center' });

      // Patient Info
      doc.setFontSize(10);
      doc.text(`Patient Name: ${userName}`, 20, 45);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 52);
      doc.text(`Source File: ${fileName}`, 20, 59);

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 65, 190, 65);

      // Analysis Content
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const splitText = doc.splitTextToSize(reportText, 170);
      doc.text(splitText, 20, 75);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | Generated by Health Insight Agent`,
          105,
          285,
          { align: 'center' }
        );
      }

      // Save PDF
      const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      doc.save(`HIA-Report-${sanitizedFileName}-${Date.now()}.pdf`);

      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  // Parse and highlight abnormal values in lab reports
  const highlightAbnormalValues = (text, role) => {
    if (role !== 'HC' && role !== 'ADMIN') return text;

    // Regex patterns for lab values with reference ranges
    const patterns = [
      /(\*\*[^*]+\*\*:\s*)(\d+\.?\d*)\s*([a-zA-Z/µ]+)\s*-\s*(NORMAL|LOW|HIGH)/gi,
      /(\*\*[^*]+\*\*:\s*)(\d+\.?\d*)\s*([a-zA-Z/µ]+)/gi
    ];

    let result = text;

    // Add color coding for abnormal markers
    result = result.replace(/- (LOW|HIGH)\b/gi, (match, status) => {
      if (status.toUpperCase() === 'HIGH') {
        return `<span class="text-red-400 font-semibold">- ${status}</span>`;
      } else if (status.toUpperCase() === 'LOW') {
        return `<span class="text-yellow-400 font-semibold">- ${status}</span>`;
      }
      return match;
    });

    // Highlight the value itself if abnormal
    result = result.replace(
      /(\*\*[^*]+\*\*:\s*)(\d+\.?\d*\s*[a-zA-Z/µ]+)\s*-\s*(LOW|HIGH)/gi,
      (match, label, value, status) => {
        const color = status.toUpperCase() === 'HIGH' ? 'text-red-400' : 'text-yellow-400';
        return `${label}<span class="${color} font-bold">${value}</span> - <span class="${color} font-semibold">${status}</span>`;
      }
    );

    return result;
  };
  return (
    <div className="h-screen flex overflow-hidden bg-black text-white">
      {isLoading && <LoadingFullScreen />}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        refreshTrigger={refreshTrigger}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-16 border-b border-zinc-800 px-4 flex items-center justify-between sticky top-0 bg-black z-40">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-zinc-800 transition"
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
              v2.0
            </span>
            {/* Show HC badge if user is healthcare professional */}
            {(userRole === 'HC' || userRole === 'ADMIN') && (
              <span className="bg-blue-600 px-2 py-0.5 rounded text-xs font-semibold">
                HC Mode
              </span>
            )}
          </div>

          <UserMenu
            onDeleteChat={handleDeleteChat}

          />
        </header>

        {/* Chat Section */}
        <section className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-900/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center text-2xl font-bold mb-6 shadow-2xl shadow-blue-500/30 animate-pulse">
                HIA
              </div>
              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Health Insight Agent</h2>
              <p className="text-gray-400 max-w-md mb-12 text-lg">
                Upload your medical reports or ask health questions to get instant insights
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 hover:scale-105 group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
                  <h3 className="font-bold mb-2 text-lg text-gray-100">Analyze Reports</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Upload blood tests, prescriptions, or medical documents for instant analysis</p>
                </div>

                <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 hover:scale-105 group">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💬</div>
                  <h3 className="font-bold mb-2 text-lg text-gray-100">Ask Questions</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">Get expert answers about health parameters and medical terminology</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="w-full px-4 sm:px-6 lg:px-24 space-y-6">
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";

                  // Check if this is an HC message (has userRole HC/ADMIN and uploadedFileName)
                  const isHCMessage = !isUser &&
                    (msg.userRole === 'HC' || msg.userRole === 'ADMIN') &&
                    msg.uploadedFileName;

                  // Extract clinical patterns section for HC users
                  let mainContent = msg.text;
                  let summary = null;

                  if (isHCMessage) {
                    const summaryMatch = msg.text.match(/⚠️\s*\*\*Clinical Patterns Identified:\*\*([\s\S]*?)(?=\n\n|$)/);
                    if (summaryMatch) {
                      summary = summaryMatch[1].trim();
                      mainContent = msg.text.replace(summaryMatch[0], '').trim();
                    }
                  }

                  // Helper function to highlight abnormal values (HC mode only)
                  const highlightAbnormalValues = (text) => {
                    if (userRole !== 'HC' && userRole !== 'ADMIN') return text;

                    let result = text;

                    // Pattern 1: Highlight HIGH values in red (with bullet points and various spacing)
                    result = result.replace(
                      /(\*\*[^*]+\*\*:\s*)([0-9,.]+\s*[a-zA-Z/µ%°]+(?:\/[a-zA-Z/µ]+)?)\s*-\s*HIGH/gi,
                      (match, label, value) => {
                        return `${label}<span style="color: #ef4444; font-weight: 700;">${value}</span> - <span style="color: #ef4444; font-weight: 700; text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);">HIGH</span>`;
                      }
                    );

                    // Pattern 2: Highlight LOW values in yellow (with bullet points and various spacing)
                    result = result.replace(
                      /(\*\*[^*]+\*\*:\s*)([0-9,.]+\s*[a-zA-Z/µ%°]+(?:\/[a-zA-Z/µ]+)?)\s*-\s*LOW/gi,
                      (match, label, value) => {
                        return `${label}<span style="color: #f59e0b; font-weight: 700;">${value}</span> - <span style="color: #f59e0b; font-weight: 700; text-shadow: 0 0 10px rgba(245, 158, 11, 0.3);">LOW</span>`;
                      }
                    );

                    return result;
                  };

                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
                      {!isUser && (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold mr-3 shrink-0 shadow-lg shadow-blue-500/30">
                          HIA
                        </div>
                      )}

                      <div className="max-w-[85%] flex flex-col gap-3">
                        <div className={`${isUser ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/30' : 'bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50'} px-5 py-4 rounded-2xl ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'} transition-all duration-200 hover:shadow-xl`}>
                          {isHCMessage && (userRole === 'HC' || userRole === 'ADMIN') ? (
                            <div
                              className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white font-medium' : 'text-gray-200'}`}
                              dangerouslySetInnerHTML={{ __html: highlightAbnormalValues(mainContent) }}
                            />
                          ) : (
                            <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white font-medium' : 'text-gray-200'}`}>
                              <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                {mainContent}
                              </ReactMarkdown>
                            </div>
                          )}

                          {msg.files && msg.files.length > 0 && (
                            <div className="flex gap-2 mt-4 flex-wrap">
                              {msg.files.map((f, idx) => (
                                <div
                                  key={f.id || idx}
                                  onClick={() => setPreview(f)}
                                  className="cursor-pointer group/file"
                                >
                                  {f.type === "image" || f.type?.startsWith('image') ? (
                                    <img
                                      src={f.url}
                                      alt={f.name}
                                      className="w-28 h-28 object-cover rounded-xl border-2 border-zinc-700/50 hover:border-blue-500 transition-all duration-200 hover:scale-105 shadow-md"
                                    />
                                  ) : (
                                    <div className="w-28 h-28 rounded-xl border-2 border-zinc-700/50 flex items-center justify-center text-xs bg-zinc-800/50 hover:border-blue-500 transition-all duration-200 hover:scale-105 backdrop-blur-sm shadow-md">
                                      <div className="text-center">
                                        <div className="text-3xl mb-1">📄</div>
                                        <div className="text-gray-400">PDF</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {isHCMessage && (userRole === 'HC' || userRole === 'ADMIN') && (
                            <div className="mt-4 pt-4 border-t border-blue-500/20">
                              <button
                                onClick={() => generatePDFReport(i)}
                                disabled={isGeneratingPDF}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-800 disabled:to-blue-900 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Report'}
                              </button>
                            </div>
                          )}
                        </div>

                        {summary && isHCMessage && (userRole === 'HC' || userRole === 'ADMIN') && (
                          <div className="px-5 py-4 bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/40 rounded-2xl backdrop-blur-sm shadow-lg">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <span className="text-amber-300 font-bold text-sm tracking-wide">CLINICAL SUMMARY</span>
                            </div>
                            <div className="text-amber-100/90 text-sm leading-relaxed whitespace-pre-wrap">
                              {summary.replace(/\*\*/g, '')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(isTyping || isAnalyzing) && (
                  <div className="flex justify-start items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold shrink-0 shadow-lg shadow-blue-500/30 animate-pulse">
                      HIA
                    </div>
                    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 px-5 py-3 rounded-2xl rounded-tl-md text-sm italic text-gray-400 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>{isAnalyzing ? '🔍 Analyzing your medical report...' : 'Thinking...'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="shrink-0 border-t border-zinc-800/50 px-4 py-4 backdrop-blur-md bg-zinc-950/80">
          <div className="w-full px-4 sm:px-6 lg:px-24">
            <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-900/50 backdrop-blur-sm rounded-2xl px-4 py-3 flex flex-col gap-3 border border-zinc-800/50 shadow-2xl">
              {files.length > 0 && (
                <div className="flex gap-3 flex-wrap pb-2 border-b border-zinc-800/30">
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
                          className="w-20 h-20 object-cover rounded-xl border-2 border-zinc-700/50 group-hover:border-blue-500 transition-all duration-200 shadow-md group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl border-2 border-zinc-700/50 flex flex-col items-center justify-center text-xs bg-zinc-800/50 group-hover:border-blue-500 transition-all duration-200 shadow-md group-hover:scale-105">
                          <div className="text-2xl mb-1">📄</div>
                          <div className="text-gray-400">PDF</div>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full text-xs flex items-center justify-center hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:scale-110 active:scale-95 border border-red-500/50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={isAnalyzing}
                  className={`
                    w-11 h-11
                    flex items-center justify-center
                    rounded-xl
                    transition-all duration-200
                    font-bold text-xl
                    shadow-md
                    ${isAnalyzing
                      ? "bg-zinc-800 text-gray-600 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-br from-zinc-800 to-zinc-700 text-gray-300 hover:from-blue-600 hover:to-blue-700 hover:text-white hover:scale-105 active:scale-95 border border-zinc-700/50 hover:border-blue-500/50"
                    }
                  `}
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
                  disabled={isAnalyzing}
                />

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isAnalyzing && sendMessage()}
                  placeholder={isAnalyzing ? "Analyzing..." : (files.length > 0 ? "Press Enter to analyze..." : "Ask anything or upload a report")}
                  disabled={isAnalyzing}
                  className={`flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500 font-medium ${isAnalyzing ? 'cursor-not-allowed opacity-50' : ''}`}
                />
                <button
                  onClick={sendMessage}
                  disabled={(!input.trim() && files.length === 0) || isAnalyzing}
                  className={`
                    w-11 h-11
                    flex items-center justify-center
                    rounded-xl
                    transition-all duration-200
                    text-lg
                    shadow-md
                    ${(input.trim() || files.length > 0) && !isAnalyzing
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 shadow-blue-500/30 border border-blue-500/50"
                      : "bg-zinc-800 text-gray-600 cursor-not-allowed opacity-50 border border-zinc-700/50"
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

              {preview.type === "image" || preview.type?.startsWith('image') ? (
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