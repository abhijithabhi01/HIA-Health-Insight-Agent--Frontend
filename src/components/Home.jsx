import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Home({ toggleSidebar, isSidebarOpen }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

const [files, setFiles] = useState([]);
const [preview, setPreview] = useState(null);
const fileInputRef = useRef(null);


    const bottomRef = useRef(null);
    const navigate = useNavigate();

    // Function to File select handler
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

// Remove file handler function 
const removeFile = (id) => {
  setFiles((prev) => prev.filter((f) => f.id !== id));
};


// Function to send message
const sendMessage = () => {
  if (!input.trim() && files.length === 0) return;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      text: input,
      files,
    },
  ]);

  setInput("");
  setFiles([]);
};


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            {/* Header */}
            <header className=" h-14 border-b border-zinc-800 px-4 flex items-center justify-between">
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


                <div className="w-8">
                    <button
                        onClick={() => navigate("/auth")}
                        className="p-2 rounded-full border border-zinc-700 hover:bg-zinc-800 transition"
                        title="Account"
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
                                d="M12 12a5 5 0 100-10 5 5 0 000 10z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 21a8 8 0 10-16 0"
                            />
                        </svg>
                    </button>

                </div>

            </header>

            {/* Chat Area */}
            <section className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                        <h1 className="text-3xl font-light text-gray-300">
                           Simplifying your health data into meaningful insights.
                        </h1>
                    </div>
                )}

                <div className="w-full px-4 sm:px-6 lg:px-24 space-y-4">
                    {messages.map((msg, i) => (
  <div
    key={i}
    className={`flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >
    <div className="bg-zinc-900 px-4 py-3 rounded-xl max-w-[75%] text-sm">
      
      {/* MESSAGE TEXT */}
      {msg.text}

      {/*  FILES INSIDE CHAT */}
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
                  PDF
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
))}

                    
                    <div ref={bottomRef} />
                </div>
            </section>

            


<footer className="shrink-0 border-t border-zinc-800 px-4 py-4">
  <div className="w-full px-4 sm:px-6 lg:px-24">
    <div className="bg-zinc-900 rounded-2xl px-3 py-2 flex flex-col gap-2">

      {/* FILE PREVIEWS (INLINE) */}
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
                  PDF
                </div>
              )}

              {/* CLOSE BUTTON */}
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
        {/* + BUTTON */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 rounded-full hover:bg-zinc-800 text-gray-300"
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
          placeholder="Ask anything"
          className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() && files.length === 0}
          className={`
             rounded-full transition
            ${
              input.trim() || files.length
                ? "bg-white text-black hover:bg-gray-200"
                : "text-gray-500"
            }
          `}

        >
          ➤
        </button>
      </div>
    </div>
  </div>
</footer>


            {/* Modal  */}
            {preview && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <div className="relative max-w-4xl w-full h-[90vh] bg-zinc-950 rounded-xl p-4">
      
      {/* CLOSE BUTTON */}
      <button
        onClick={() => setPreview(null)}
        className="absolute rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center"
        style={{ top: '-20px', right: '10px', width: '30px', height: '30px',color:"red",fontSize:"20px", fontWeight:"bold" }}
      >
        ✕
      </button>

      {/* CONTENT */}
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


        </>
    );
}
