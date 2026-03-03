import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { chatApi } from "../api/chatApi";
import {
  FaPaperPlane,
  FaSearch,
  FaComments,
  FaTimes,
  FaUserCircle,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ChatPage = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchChatId, setSearchChatId] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Socket connection ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => console.log("Chat socket connected"));
    s.on("disconnect", () => console.log("Chat socket disconnected"));

    s.on("new_message", (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    s.on(
      "conversation_updated",
      ({ conversationId, lastMessage, lastMessageAt }) => {
        setConversations((prev) =>
          prev
            .map((c) =>
              c._id === conversationId
                ? { ...c, lastMessage, lastMessageAt }
                : c,
            )
            .sort(
              (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
            ),
        );
      },
    );

    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ── Load conversations on mount ───────────────────
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await chatApi.getConversations();
      setConversations(data);
    } catch (e) {
      console.error("Error loading conversations:", e);
    }
  };

  // ── Open a conversation ───────────────────────────
  const openConversation = useCallback(
    async (conversation) => {
      setActiveConversation(conversation);
      setMessages([]);
      setLoadingMessages(true);
      try {
        const msgs = await chatApi.getMessages(conversation._id);
        setMessages(msgs);
        if (socket) socket.emit("join_conversation", conversation._id);
      } catch (e) {
        console.error("Error loading messages:", e);
      } finally {
        setLoadingMessages(false);
      }
    },
    [socket],
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Search for a user by chatId ───────────────────
  const handleSearch = async () => {
    if (!searchChatId.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const result = await chatApi.findUserByChatId(searchChatId.trim());
      setSearchResult(result);
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearching(false);
    }
  };

  // ── Start conversation with found user ─────────────
  const startConversation = async (otherUser) => {
    try {
      const conversation = await chatApi.getOrCreateConversation(otherUser._id);
      // normalise participants shape if needed
      setConversations((prev) => {
        const exists = prev.some((c) => c._id === conversation._id);
        if (!exists) return [conversation, ...prev];
        return prev;
      });
      setSearchResult(null);
      setSearchChatId("");
      openConversation(conversation);
    } catch (e) {
      alert(e.message);
    }
  };

  // ── Send a message ────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket || sending) return;
    setSending(true);
    socket.emit("send_message", {
      conversationId: activeConversation._id,
      content: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  // ── Get the other participant name ────────────────
  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return { name: "Unknown", chatId: "" };
    return (
      conversation.participants.find((p) => p._id !== user?._id) ||
      conversation.participants[0]
    );
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(dateStr);
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div
      className="h-[calc(100vh-4rem)] flex"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ── Left Panel: Conversations ─────────────────── */}
      <div
        className="w-80 flex flex-col border-r"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2
            className="text-xl font-bold mb-3 flex items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <FaComments className="text-blue-500" />
            Messages
          </h2>

          {/* Search by Chat ID */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchChatId}
                onChange={(e) => setSearchChatId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Enter Chat ID (e.g. A1B2C3D4)"
                maxLength={8}
                className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:border-blue-500"
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FaSearch className="w-4 h-4" />
              </button>
            </div>

            {searchError && (
              <p className="text-red-500 text-xs">{searchError}</p>
            )}

            {searchResult && (
              <div
                className="p-3 rounded-lg border flex items-center justify-between"
                style={{
                  backgroundColor: "var(--bg-base)",
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <p
                    className="font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {searchResult.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    #{searchResult.chatId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startConversation(searchResult)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setSearchResult(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div
              className="p-6 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No conversations yet.
              <br />
              Search a Chat ID above to start.
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              return (
                <button
                  key={conv._id}
                  onClick={() => openConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors border-b hover:bg-opacity-80 ${
                    isActive ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: isActive
                      ? "var(--accent-subtle, rgba(59,130,246,0.1))"
                      : "transparent",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {other?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {other?.name || "Unknown"}
                      </p>
                      <span
                        className="text-xs flex-shrink-0 ml-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat ─────────────────────────── */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
              {getOtherParticipant(activeConversation)
                ?.name?.charAt(0)
                ?.toUpperCase()}
            </div>
            <div>
              <p
                className="font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {getOtherParticipant(activeConversation)?.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                #{getOtherParticipant(activeConversation)?.chatId}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ backgroundColor: "var(--bg-base)" }}
          >
            {loadingMessages ? (
              <div className="flex justify-center pt-10">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div
                className="text-center text-sm pt-10"
                style={{ color: "var(--text-muted)" }}
              >
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg) => {
                const isMe =
                  msg.sender?._id === user?._id || msg.sender === user?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl text-sm shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "rounded-bl-sm"
                      }`}
                      style={
                        !isMe
                          ? {
                              backgroundColor: "var(--card-bg)",
                              color: "var(--text-primary)",
                              border: "1px solid var(--border)",
                            }
                          : {}
                      }
                    >
                      <p className="break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? "text-blue-100" : ""
                        }`}
                        style={!isMe ? { color: "var(--text-muted)" } : {}}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t flex gap-3"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border)",
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border focus:outline-none focus:border-blue-500 text-sm"
              style={{
                backgroundColor: "var(--bg-base)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FaPaperPlane className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-4"
          style={{ backgroundColor: "var(--bg-base)" }}
        >
          <FaComments className="text-6xl text-blue-200" />
          <p
            className="text-xl font-semibold"
            style={{ color: "var(--text-muted)" }}
          >
            Select a conversation
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Or search for a user by their Chat ID to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
