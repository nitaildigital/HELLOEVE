import React, { useState, useRef, useEffect } from 'react';
import { SiteData } from '@/types';
import { BRAND_NAME } from '@/constants';
import { ai } from '@/services/api';

interface EveAssistantProps {
  siteData: SiteData;
  siteId?: string;
}

const EveAssistant: React.FC<EveAssistantProps> = ({ siteData, siteId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "היי! אני איב, המעצבת האישית שלך. איך אוכל לעזור לך לשדרג את הנראות של האתר היום?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const EVE_AVATAR_URL = "https://img.freepik.com/free-psd/3d-illustration-person-with-glasses_23-2149436185.jpg?w=200";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isUser: true }]);
    setIsLoading(true);

    try {
      const result = await ai.chat(userMsg, siteId);
      setMessages(prev => [...prev, { text: result.response || 'אופס, משהו השתבש. נסי שוב?', isUser: false }]);
    } catch {
      setMessages(prev => [...prev, { text: 'מצטערת, חלה שגיאה. נסי שוב מאוחר יותר.', isUser: false }]);
    }
    setIsLoading(false);
  };

  const UserAvatar = ({ size = "w-14 h-14" }: { size?: string }) => (
    <div className={`${size} rounded-full overflow-hidden border-2 border-white shadow-lg relative bg-slate-100`}>
      <img 
        src={EVE_AVATAR_URL} 
        alt="Eve Assistant" 
        className="w-full h-full object-cover"
      />
    </div>
  );

  return (
    <div className="fixed bottom-10 left-10 z-[100]">
      {isOpen ? (
        <div className="bg-white/95 backdrop-blur-2xl w-[400px] h-[640px] rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-white flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
          <header className="p-8 pb-6 flex justify-between items-start relative bg-gradient-to-b from-slate-50/50 to-transparent">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar />
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-xl text-slate-900 tracking-tight">איב</p>
                <div className="flex items-center gap-1.5 justify-end">
                   <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e33670]">Personal Designer</p>
                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                   <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-green-500">Online</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 bg-white hover:bg-slate-50 rounded-full flex items-center justify-center transition-colors text-slate-400 shadow-sm border border-slate-100"
            >
              ✕
            </button>
          </header>
          
          <div ref={scrollRef} className="flex-grow p-8 overflow-y-auto space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.isUser ? 'justify-end' : 'justify-start'}`}>
                {!m.isUser && (
                  <div className="mt-1 flex-shrink-0 mr-3">
                    <UserAvatar size="w-8 h-8" />
                  </div>
                )}
                <div className={`max-w-[80%] p-5 text-sm leading-relaxed shadow-sm transition-all ${m.isUser ? 'bg-slate-900 text-white rounded-[2rem] rounded-br-none' : 'bg-white text-slate-700 border border-slate-50 rounded-[2rem] rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-5 rounded-[2rem] rounded-bl-none shadow-sm border border-slate-50 flex gap-1.5 px-6">
                  <div className="w-1.5 h-1.5 bg-[#e33670] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#e33670] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#e33670] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
          </div>

          <footer className="p-8 pt-0 bg-transparent">
            <div className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="כתבי לי כאן..."
                className="w-full p-5 pr-14 bg-white border border-slate-100 rounded-[2rem] outline-none focus:border-[#e33670]/30 focus:shadow-xl transition-all text-sm font-medium text-right shadow-sm"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
               <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">AI Creative Partner</p>
               <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            </div>
          </footer>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-4 focus:outline-none"
        >
          <div className="absolute -inset-2 bg-[#e33670]/20 rounded-[4rem] blur-xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity"></div>
          
          <div className="bg-white p-3 rounded-[3rem] shadow-2xl border border-white flex items-center gap-4 pr-7 hover:translate-x-3 transition-all duration-500 ease-out group-hover:shadow-[0_20px_50px_-10px_rgba(227,54,112,0.3)]">
             <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none mb-1">היי, אני איב</p>
                <p className="text-[10px] text-slate-400 font-medium">אפשר לעזור בעיצוב?</p>
             </div>
             <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-50">
                  <img 
                    src={EVE_AVATAR_URL} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    alt="Eve Character"
                  />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-4 border-white"></span>
             </div>
          </div>
        </button>
      )}
    </div>
  );
};

export default EveAssistant;
