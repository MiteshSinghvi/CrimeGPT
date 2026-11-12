import React, { useState, useEffect, useRef, useContext } from "react";
import { Bot, X, Minus, Send, MessageSquareCode, FileText } from "lucide-react";
import { LanguageContext } from "../app/App";
import { supabase } from "@/lib/supabaseClient";

type CaseData = {
  id: string;
  created_at?: string;
  case_number?: string;
  title: string;
  location: string;
  status: string;
  priority: string;
  assignee: string;
  progress: number;
  user_id?: string;
  date: string;
  description?: string;
};

interface FloatingChatbotProps {
  cases?: CaseData[];
}

const initialGreetings: Record<string, string> = {
  en: "Hello Officer! How can I assist with your case queries or platform navigation today?",
  hi: "नमस्कार अधिकारी! आज मैं आपके मामले के प्रश्नों या प्लेटफ़ॉर्म नेविगेशन में कैसे सहायता कर सकता हूँ?",
  gu: "નમસ્તે અધિકારી! આજે હું તમારા કેસના પ્રશ્નો અથવા પ્લેટફોર્મ નેવિગેશનમાં કેવી રીતે મદદ કરી શકું?",
};

export default function FloatingChatbot({ cases = [] }: FloatingChatbotProps) {
  const { language, t } = useContext(LanguageContext);

  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Chat state
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: initialGreetings[language] || initialGreetings.en,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatCache = useRef<Record<string, { role: "user" | "assistant"; text: string }[]>>({});

  // Case context state
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || null;

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, []);

  useEffect(() => {
    async function fetchChatHistory() {
      if (!currentUser) return;
      
      const cacheKey = selectedCaseId || "general";
      if (chatCache.current[cacheKey]) {
        setMessages(chatCache.current[cacheKey]);
        return;
      }
      
      setIsFetchingHistory(true);
      setMessages([]);
      
      const query = supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: true });

      if (selectedCaseId) {
        query.eq("case_id", selectedCaseId);
      } else {
        query.is("case_id", null);
      }

      const { data, error } = await query;
      
      if (!error && data && data.length > 0) {
        const fetchedMessages = data.map((row) => ({ role: row.role as any, text: row.content }));
        setMessages(fetchedMessages);
        chatCache.current[cacheKey] = fetchedMessages;
      } else {
        const defaultMessages = [
          {
            role: "assistant" as const,
            text: initialGreetings[language] || initialGreetings.en,
          },
        ];
        setMessages(defaultMessages);
        chatCache.current[cacheKey] = defaultMessages;
      }
      setIsFetchingHistory(false);
    }
    fetchChatHistory();
  }, [selectedCaseId, currentUser, language]);

  useEffect(() => {
    // Reset greeting when language changes if no other messages
    if (messages.length === 1 && messages[0].role === "assistant") {
      setMessages([
        {
          role: "assistant",
          text: initialGreetings[language] || initialGreetings.en,
        },
      ]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleResize = () => {
      // Keep button in bounds on resize
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { ...position };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Only drag on left click/touch hold
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      setPosition({
        x: Math.max(
          0,
          Math.min(initialPos.current.x + dx, window.innerWidth - 60),
        ),
        y: Math.max(
          0,
          Math.min(initialPos.current.y + dy, window.innerHeight - 60),
        ),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!isDragging.current) {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
    isDragging.current = false;
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const userMessage = inputValue.trim();
    const newMessages = [
      ...messages,
      { role: "user" as const, text: userMessage },
    ];
    setMessages(newMessages);
    
    const cacheKey = selectedCaseId || "general";
    chatCache.current[cacheKey] = newMessages;
    
    setInputValue("");
    setIsTyping(true);

    if (currentUser) {
      await supabase.from("chat_history").insert({
        user_id: currentUser.id,
        case_id: selectedCase?.id || null,
        role: "user",
        content: userMessage,
      });
    }

    try {
      // Build payload with optional case context and conversation history
      const payload: any = {
        text: userMessage,
        mode: "chat",
        // Send previous conversation messages (exclude the initial greeting)
        chat_history: messages
          .filter((_, i) => i > 0) // skip initial greeting
          .map((m) => ({ role: m.role, text: m.text })),
      };
      if (selectedCase) {
        payload.case_context = {
          id: selectedCase.id,
          case_number: selectedCase.case_number || "N/A",
          title: selectedCase.title,
          status: selectedCase.status,
          priority: selectedCase.priority,
          assignee: selectedCase.assignee,
          location: selectedCase.location,
          date: selectedCase.date,
          description: (selectedCase as any).description || undefined,
        };
      }

      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiBase}/api/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      setIsTyping(false); // Stop typing indicator as stream starts

      // Append empty assistant message to be filled progressively
      setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder("utf-8");
      
      let fullAssistantResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                fullAssistantResponse += data.text;
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg.role === "assistant") {
                    lastMsg.text += data.text;
                  }
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error("Error parsing SSE data line", e);
            }
          }
        }
      }

      if (currentUser && fullAssistantResponse) {
        await supabase.from("chat_history").insert({
          user_id: currentUser.id,
          case_id: selectedCase?.id || null,
          role: "assistant",
          content: fullAssistantResponse,
        });
        
        chatCache.current[cacheKey] = [
          ...newMessages,
          { role: "assistant" as const, text: fullAssistantResponse }
        ];
      }

    } catch (err: any) {
      console.error(err);
      // Explicit error handling shown in UI
      const apiBase =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ **Connection Error:** Unable to reach the AI model (${err.message}). Please ensure the backend is running on ${apiBase}.`,
        },
      ]);
    } finally {
      setIsTyping(false); // Failsafe ensure typing is turned off
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
      }}
    >
      {/* Floating Action Button */}
      {!isOpen && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-2xl transition-transform hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #1D4ED8, #1e40af)",
            color: "white",
            boxShadow: "0 4px 20px rgba(29,78,216,0.5)",
            touchAction: "none",
          }}
        >
          <Bot size={28} />
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all bg-white dark:bg-[#1C2541] border border-slate-200 dark:border-slate-800"
          style={{
            height: isMinimized ? "auto" : "520px",
            maxHeight: "calc(100vh - 4rem)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B132B]">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(29,78,216,0.1)", color: "#1D4ED8" }}
              >
                <MessageSquareCode size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                  {t("assistant_title")}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                    style={{ boxShadow: "0 0 6px rgba(16,185,129,0.8)" }}
                  />
                  <span className="text-[10px] font-mono text-emerald-500 font-medium">
                    {t("assistant_online")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              {/* ── Case Context Selector ── */}
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B132B]/50">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-amber-500 flex-shrink-0" />
                  <select
                    value={selectedCaseId}
                    onChange={(e) => setSelectedCaseId(e.target.value)}
                    className="w-full text-[11px] font-mono bg-white dark:bg-[#1C2541] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:border-blue-500 transition-colors truncate"
                  >
                    <option value="">— No Case Selected —</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.case_number || "???"} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedCase && (
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-white font-semibold uppercase ${
                        selectedCase.status === "active"
                          ? "bg-emerald-600"
                          : selectedCase.status === "critical"
                            ? "bg-red-600"
                            : selectedCase.status === "pending"
                              ? "bg-amber-600"
                              : "bg-slate-600"
                      }`}
                    >
                      {selectedCase.status}
                    </span>
                    <span className="truncate">
                      {selectedCase.assignee || "Unassigned"}
                    </span>
                  </div>
                )}
              </div>

              {/* ── No Case Tip Banner ── */}
              {!selectedCase && messages.length > 1 && (
                <div className="mx-3 mt-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 font-['DM_Sans']">
                  💡 <strong>Tip:</strong> Select a case above for context-aware answers.
                </div>
              )}

              <div
                className="flex-1 overflow-y-auto p-4 space-y-4 font-['DM_Sans'] text-sm relative"
                style={{ scrollbarWidth: "thin" }}
              >
                {isFetchingHistory && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-[#1C2541]/50 backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Loading history...</span>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="font-semibold">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={i}>{part}</span>
                        ),
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C2541]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("assistant_placeholder")}
                    className="w-full bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-white text-sm rounded-full pl-4 pr-12 py-3 outline-none border border-slate-200 dark:border-slate-800 focus:border-blue-500 transition-colors font-['DM_Sans']"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white disabled:opacity-50 transition-colors hover:bg-blue-700"
                  >
                    <Send size={14} style={{ marginLeft: "-1px" }} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
