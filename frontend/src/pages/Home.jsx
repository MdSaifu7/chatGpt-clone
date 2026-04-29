import { useState, useRef, useEffect } from "react";
import { socket } from "../socket";
import ReactMarkdown from "react-markdown";
import {
  createChat,
  getMessage,
  getChat,
  deleteChat,
  createTitle,
} from "../actions/userActions";

// import { deleteChat } from "../actions/userActions";
const PlusIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ChatBubbleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DotsIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="19" r="1" fill="currentColor" />
  </svg>
);

const BotAvatar = () => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
    style={{
      background: "linear-gradient(135deg,#10a37f,#0c7a5e)",
      boxShadow: "0 2px 10px rgba(16,163,127,0.3)",
    }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
  </div>
);

const UserAvatar = () => (
  <div
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
    style={{
      background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
      boxShadow: "0 2px 10px rgba(79,70,229,0.3)",
    }}
  >
    U
  </div>
);

const SUGGESTIONS = [
  { icon: "💡", label: "Explain a concept simply" },
  { icon: "✍️", label: "Help me write something" },
  { icon: "🐛", label: "Debug my code" },
  { icon: "🗺️", label: "Plan a trip for me" },
];

export default function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [title, setTitle] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  async function fetchChats() {
    const allChats = await getChat();
    console.log("All chats: ", allChats);
    setConversations(allChats.map((c) => ({ id: c._id, title: c.title })));
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    socket.connect();
    function onConnect() {
      setIsConnected(true);
      console.log("A user connected");
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log("A user disconnected!!");
    }

    fetchChats();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("ai-response", ({ ai }) => {
      setIsTyping(false);

      setMessages((prev) => [...prev, { role: "assistant", content: ai }]);
    });
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ai-response");
      // await deleteChat(activeId);
    };
  }, []);
  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    autoResize();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    let chatId = activeId;
    if (!chatId) {
      // const userTitle = prompt("Enter chat title");
      // if (!userTitle) return;
      const generatedTitle = await createTitle(input);
      console.log(generatedTitle);

      setTitle(generatedTitle);
      const dbChat = await createChat(generatedTitle);
      setConversations((prev) => [
        { id: dbChat._id, title: generatedTitle },
        ...prev,
      ]);
      setActiveId(dbChat._id);
      chatId = dbChat._id;
    }

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    socket.emit("user-message", {
      content: input,
      chat: chatId,
    });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsTyping(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = async () => {
    setTitle("");
    setActiveId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleChatClick = async (id) => {
    setActiveId(id);
    const chats = await getMessage(id);
    setTitle(conversations.find((c) => c.id === id)?.title || "New chat");
    setMessages([...chats]);
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (e, id) => {
    console.log(conversations);
    e.stopPropagation();

    setConversations((prev) => prev.filter((c) => c.id !== id));
    await deleteChat(id);

    if (activeId === id) setActiveId(null);
  };

  const activeTitle = title ? title : "New chat";
  // conversations.find((c) => c.id === activeId)?.title ?? "New Chat";

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#0f0f0f] text-[#e8e8e8]"
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════ SIDEBAR ════════ */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col
          bg-[#171717] border-r border-[#252525]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-[17px] border-b border-[#252525]">
          <div
            className="w-[26px] h-[26px] rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#10a37f,#0c7a5e)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[#f0f0f0] tracking-tight">
            ArcChat
          </span>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium text-white transition-all active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg,#10a37f,#0d8a6a)",
              boxShadow: "0 2px 14px rgba(16,163,127,0.18)",
            }}
          >
            <PlusIcon /> New chat
          </button>
        </div>

        {/* Section label */}
        <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#444]">
          Recent
        </p>

        {/* Chat list */}
        <nav
          className="flex-1 overflow-y-auto px-2 pb-2 space-y-px"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#2a2a2a transparent",
          }}
        >
          {conversations.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                handleChatClick(chat.id);
              }}
              onMouseEnter={() => setHoveredId(chat.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer
                transition-colors duration-100 select-none
                ${
                  chat.id === activeId
                    ? "bg-[#222] text-[#f0f0f0]"
                    : "text-[#888] hover:bg-[#1e1e1e] hover:text-[#ddd]"
                }
              `}
            >
              <span className="flex-shrink-0 text-[#505050]">
                <ChatBubbleIcon />
              </span>
              <span className="flex-1 truncate text-[13px] leading-none">
                {chat.title}
              </span>
              {hoveredId === chat.id && (
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded text-[#555] hover:text-red-400 transition-colors"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Footer — user pill */}
        <div className="p-3 border-t border-[#252525]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer hover:bg-[#1e1e1e] transition-colors group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
            >
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#e0e0e0] truncate leading-none mb-0.5">
                User
              </p>
              <p className="text-[11px] text-[#4a4a4a]">Free plan</p>
            </div>
            <span className="text-[#404040] group-hover:text-[#777] transition-colors flex-shrink-0">
              <DotsIcon />
            </span>
          </div>
        </div>
      </aside>

      {/* ════════ MAIN ════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-[#1e1e1e] bg-[#0f0f0f] flex-shrink-0">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-[#ccc] hover:bg-[#1e1e1e] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          <p className="text-[13.5px] font-medium text-[#aaa] truncate max-w-[180px] sm:max-w-xs">
            {activeTitle}
          </p>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2a2a2a] text-[#666] text-[12px] cursor-pointer hover:border-[#10a37f55] hover:text-[#10a37f] transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f]" />
            GPT-4o
          </div>
        </header>

        {/* Messages */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#222 transparent" }}
        >
          <div className="max-w-3xl mx-auto px-4 pt-10 pb-6 space-y-6">
            {/* Welcome / empty state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center pt-10 pb-6 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: "linear-gradient(135deg,#10a37f,#0c7a5e)",
                    boxShadow: "0 6px 24px rgba(16,163,127,0.22)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>

                <h1 className="text-[26px] font-semibold text-[#f0f0f0] tracking-tight mb-2">
                  What can I help with?
                </h1>
                <p className="text-[13.5px] text-[#4a4a4a] mb-10">
                  Ask anything. Get answers instantly.
                </p>

                <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s.label);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl text-left text-[13px] text-[#888] bg-[#171717] border border-[#242424] hover:border-[#10a37f33] hover:bg-[#1c1c1c] hover:text-[#ddd] transition-all"
                    >
                      <span className="text-base flex-shrink-0 leading-none mt-0.5">
                        {s.icon}
                      </span>
                      <span className="leading-snug">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message rows */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "flex-row-reverse" : ""
                }`}
                style={{ animation: "fadeUp 0.22s ease both" }}
              >
                {msg.role === "assistant" ? <BotAvatar /> : <UserAvatar />}
                <div
                  className={`text-[14px] leading-relaxed ${
                    msg.role === "user"
                      ? "max-w-[78%] bg-[#1e1e1e] border border-[#2c2c2c] px-4 py-3 rounded-2xl rounded-tr-md text-[#e8e8e8]"
                      : "max-w-[85%] text-[#cccccc] pt-1"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div
                className="flex items-start gap-3"
                style={{ animation: "fadeUp 0.22s ease both" }}
              >
                <BotAvatar />
                <div className="flex items-center gap-1.5 px-4 py-3.5 bg-[#171717] border border-[#252525] rounded-2xl rounded-tl-md">
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      className="w-1.5 h-1.5 rounded-full bg-[#444]"
                      style={{
                        animation: `typingBounce 1.3s ease-in-out ${
                          j * 0.18
                        }s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input area */}
        <footer className="flex-shrink-0 px-4 pt-3 pb-5 border-t border-[#1a1a1a] bg-[#0f0f0f]">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-[#171717] border border-[#2a2a2a] rounded-2xl px-4 py-3 focus-within:border-[#10a37f44] transition-colors duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message ArcChat…"
                className="flex-1 bg-transparent resize-none outline-none text-[14px] text-[#e8e8e8] placeholder-[#3a3a3a] leading-relaxed overflow-y-auto"
                style={{
                  maxHeight: 160,
                  fontFamily: "inherit",
                  scrollbarWidth: "thin",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className={`
                  flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl
                  transition-all active:scale-90
                  ${
                    input.trim()
                      ? "text-white hover:opacity-90 cursor-pointer"
                      : "bg-[#1e1e1e] text-[#333] cursor-not-allowed"
                  }
                `}
                style={
                  input.trim()
                    ? { background: "linear-gradient(135deg,#10a37f,#0d8a6a)" }
                    : {}
                }
              >
                <SendIcon />
              </button>
            </div>

            <p className="text-center text-[11px] text-[#2e2e2e] mt-2.5 select-none">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-[#444] text-[10px] font-mono">
                  Enter
                </kbd>
                to send
              </span>
              <span className="mx-2 text-[#272727]">·</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-[#444] text-[10px] font-mono">
                  Shift+Enter
                </kbd>
                new line
              </span>
            </p>
          </div>
        </footer>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0);  background: #444; }
          30%            { transform: translateY(-6px); background: #10a37f; }
        }
      `}</style>
    </div>
  );
}
