import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bot, X, Minus, Send, MessageSquareCode } from 'lucide-react';
import { LanguageContext } from '../app/App';

const initialGreetings: Record<string, string> = {
  en: "Hello Officer! How can I assist with your case queries or platform navigation today?",
  hi: "नमस्कार अधिकारी! आज मैं आपके मामले के प्रश्नों या प्लेटफ़ॉर्म नेविगेशन में कैसे सहायता कर सकता हूँ?",
  gu: "નમસ્તે અધિકારી! આજે હું તમારા કેસના પ્રશ્નો અથવા પ્લેટફોર્મ નેવિગેશનમાં કેવી રીતે મદદ કરી શકું?"
};

export default function FloatingChatbot() {
  const { language } = useContext(LanguageContext);
  
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Drag state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  // Chat state
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: initialGreetings[language] || initialGreetings.en }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset greeting when language changes if no other messages
    if (messages.length === 1 && messages[0].role === 'assistant') {
      setMessages([{ role: 'assistant', text: initialGreetings[language] || initialGreetings.en }]);
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleResize = () => {
      // Keep button in bounds on resize
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
        x: Math.max(0, Math.min(initialPos.current.x + dx, window.innerWidth - 60)),
        y: Math.max(0, Math.min(initialPos.current.y + dy, window.innerHeight - 60))
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

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, text: inputValue }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages([...newMessages, { role: 'assistant', text: "I am a mock assistant. I have received your request and am processing it locally. My backend integration will be available soon." }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ position: 'fixed', left: position.x, top: position.y, zIndex: 9999 }}>
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
            touchAction: 'none'
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
            height: isMinimized ? 'auto' : '500px', 
            maxHeight: 'calc(100vh - 4rem)',
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B132B]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(29,78,216,0.1)", color: "#1D4ED8" }}>
                <MessageSquareCode size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">CrimeGPT Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.8)" }} />
                  <span className="text-[10px] font-mono text-emerald-500 font-medium">SYSTEM ONLINE</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                <Minus size={16} />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-slate-500 dark:text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 font-['DM_Sans'] text-sm" style={{ scrollbarWidth: "thin" }}>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    placeholder="Ask the assistant anything..."
                    className="w-full bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-white text-sm rounded-full pl-4 pr-12 py-3 outline-none border border-slate-200 dark:border-slate-800 focus:border-blue-500 transition-colors font-['DM_Sans']"
                  />
                  <button 
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="absolute right-1.5 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white disabled:opacity-50 transition-colors hover:bg-blue-700"
                  >
                    <Send size={14} style={{ marginLeft: '-1px' }} />
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
