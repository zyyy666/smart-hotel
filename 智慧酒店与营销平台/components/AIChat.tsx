import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { chatWithHotelAssistant } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: '您好！我是您的酒店 AI 智能助手。我可以协助您进行客房预订、查询房态或解答客户疑问。', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const streamText = async (fullText: string, messageId: string) => {
    let currentText = '';
    // Approximate typing speed: 20-40ms per char
    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: currentText } : msg
      ));
      // Randomize slightly for human feel
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 20));
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for Gemini
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // API Call
      const responseText = await chatWithHotelAssistant(history, userText);

      // Create placeholder message
      const botMsgId = (Date.now() + 1).toString();
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'model',
        text: '', // Start empty for typewriter
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);

      // Trigger Typewriter Effect
      await streamText(responseText, botMsgId);

    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "抱歉，我目前无法连接到服务器，请稍后再试。", 
        timestamp: new Date() 
      }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] flex flex-col border border-slate-200 overflow-hidden h-[600px] transition-all animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm">酒店智能助手</div>
                <div className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  在线 (Online)
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 border border-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}
                `}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && messages[messages.length - 1].role === 'user' && (
              <div className="flex justify-start">
                 <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 border border-indigo-200">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1 shadow-sm h-11">
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                 </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入消息..."
                disabled={isTyping}
                className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none disabled:opacity-50"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400">Powered by Gemini AI • 智慧酒店平台</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;