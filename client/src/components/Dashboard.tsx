
import React, { useState } from 'react';
import { SiteData, DesignTokens, SiteType } from '@/types';
import { DEFAULT_DESIGN_TOKENS, BRAND_DARK, BRAND_ACCENT } from '@/constants';
import { design as designApi } from '@/services/api';

interface DashboardProps {
  siteData: SiteData;
}

type TabType = 'dashboard' | 'content' | 'vibe' | 'marketing' | 'seo' | 'domain' | 'deployment';

const Dashboard: React.FC<DashboardProps> = ({ siteData }) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [tokens, setTokens] = useState<DesignTokens>(DEFAULT_DESIGN_TOKENS);
  const [vibePrompt, setVibePrompt] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  
  // Deployment States
  const [isDriveConnected, setIsDriveConnected] = useState(true);
  const [isGitConnected, setIsGitConnected] = useState(false);

  const handleVibeDesign = async () => {
    if (!vibePrompt) return;
    setIsDesigning(true);
    try {
      // Try backend API first, fallback to direct if no siteId
      const result = await designApi.vibeDesign('current', vibePrompt);
      if (result.tokens) {
        setTokens(result.tokens);
      }
    } catch {
      // Fallback: keep current tokens
    }
    setVibePrompt('');
    setIsDesigning(false);
  };

  const menuItems: { id: TabType; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'content', icon: '📝', label: 'Content' },
    { id: 'vibe', icon: '✨', label: 'Vibe Design' },
    { id: 'deployment', icon: '🚀', label: 'Deployment & Git' },
    { id: 'marketing', icon: '📢', label: 'Marketing' },
    { id: 'seo', icon: '🔍', label: 'SEO Engine' },
    { id: 'domain', icon: '🌐', label: 'Domain' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'Views', val: '24.8k', change: '+12%', color: 'text-[#e33670]' },
                { label: 'Conversations', val: '842', change: '+4.2%', color: 'text-slate-900' },
                { label: 'AI Responses', val: '1.2k', change: 'Stable', color: 'text-slate-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm group hover:shadow-xl transition-all">
                  <span className="text-[11px] font-medium text-slate-300 uppercase tracking-[0.4em] block mb-8">{stat.label}</span>
                  <div className="flex items-baseline gap-4 justify-end">
                    <span className={`text-xs font-medium ${stat.color} group-hover:translate-x-1 transition-transform tracking-widest uppercase`}>{stat.change}</span>
                    <span className="text-5xl font-light text-slate-900 tracking-tighter">{stat.val}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <section className="bg-slate-900 p-16 rounded-[4.5rem] text-white relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#e33670]/10 to-transparent"></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-right space-y-4">
                     <h3 className="text-4xl font-light italic">Vibe Design™ Lab</h3>
                     <p className="text-slate-400 font-light text-lg">שנה את כל נראות האתר באמצעות פקודה קולית או טקסטואלית אחת.</p>
                  </div>
                  <button onClick={() => setActiveTab('vibe')} className="px-12 py-6 bg-white text-slate-900 rounded-[2.5rem] font-bold shadow-2xl hover:scale-105 transition-transform">פתח מעבדת עיצוב 🪄</button>
               </div>
            </section>
          </div>
        );

      case 'deployment':
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
            <header className="space-y-2 mb-8 border-b border-slate-100 pb-8">
               <h3 className="text-4xl font-light italic text-slate-900 tracking-tight">הגירה ל-Git וניתוק ענן</h3>
               <p className="text-slate-400 font-light text-lg italic">איך להפסיק להשתמש בדרייב ולעבור לניהול קוד מקצועי.</p>
            </header>

            {/* Step-by-Step Migration Guide */}
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-50 shadow-sm space-y-12">
               <h4 className="text-2xl font-bold text-slate-900 flex items-center justify-end gap-3">
                  מדריך הגירה מהיר
                  <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">🛠️</span>
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { step: '01', title: 'הורדת הפרויקט', desc: 'חפש את כפתור ה-Download בתפריט העליון של סביבת הפיתוח והורד ZIP של הקוד.' },
                    { step: '02', title: 'פתיחה מקומית', desc: 'חלץ את הקבצים בתיקייה חדשה במחשב ופתח אותה ב-VS Code או כל עורך קוד.' },
                    { step: '03', title: 'חיבור ל-GitHub', desc: 'השתמש בפקודות ה-CLI למטה כדי ליצור Repository חדש ולהעלות את הקבצים.' }
                  ].map((s, i) => (
                    <div key={i} className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group">
                       <span className="text-4xl font-black text-slate-200 group-hover:text-[#e33670]/20 transition-colors absolute top-4 left-6">{s.step}</span>
                       <h5 className="text-lg font-bold text-slate-900 pt-6">{s.title}</h5>
                       <p className="text-slate-500 text-sm font-light leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
               </div>

               {/* CLI Commands Card */}
               <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                     <div className="flex gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                     </div>
                     <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Terminal / CLI Commands</span>
                  </div>
                  <div className="bg-black/40 p-6 rounded-2xl font-mono text-sm text-left overflow-x-auto relative group">
                    <pre className="text-pink-400/90 leading-relaxed">
                      <code className="block mb-2"># Initialize Git Repo</code>
                      <code className="text-white">git init</code>
                      <code className="block my-2"># Commit current code</code>
                      <code className="text-white">git add .</code>
                      <code className="text-white block">git commit -m "init: moving project to git"</code>
                      <code className="block my-2"># Push to your GitHub</code>
                      <code className="text-white">git remote add origin https://github.com/USER/REPO.git</code>
                      <code className="text-white block">git push -u origin main</code>
                    </pre>
                  </div>
                  <div className="flex justify-center pt-4 opacity-50">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Disconnected from drive automatically after export</p>
                  </div>
               </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between p-10 bg-slate-50 rounded-[3rem] border border-slate-100 gap-8">
               <div className="text-right">
                  <p className="font-bold text-slate-900">נתקלת בקושי טכני בניתוק הדרייב?</p>
                  <p className="text-slate-400 font-light text-sm">פנה לתמיכה הטכנית שלנו או היעזר באיב המעצבת.</p>
               </div>
               <button onClick={() => setActiveTab('dashboard')} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium hover:bg-slate-100 transition-colors shadow-sm">
                  חזרה לדשבורד
               </button>
            </div>
          </div>
        );

      case 'vibe':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
            <section className="bg-white p-16 rounded-[4.5rem] border border-slate-50 shadow-sm space-y-12 relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <h3 className="text-4xl font-light text-slate-900 italic">Vibe Design™ Lab</h3>
                <p className="text-slate-400 font-light text-lg">שנה את פלטת הצבעים, הפונטים והאווירה הכללית של האתר ברגע.</p>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative flex-grow group">
                    <input 
                      type="text" 
                      value={vibePrompt}
                      onChange={(e) => setVibePrompt(e.target.value)}
                      placeholder="למשל: 'הפוך את העיצוב לכהה ויוקרתי'"
                      className="w-full p-8 pr-16 bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-[#e33670] outline-none transition-all font-light text-xl placeholder:text-slate-300 shadow-sm text-right"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl">🪄</span>
                  </div>
                  <button 
                    onClick={handleVibeDesign}
                    disabled={isDesigning || !vibePrompt}
                    className={`px-16 rounded-[2.5rem] font-medium text-xl text-white shadow-2xl transition-all h-[92px] ${isDesigning ? 'bg-pink-300' : 'bg-slate-900 hover:bg-black'}`}
                  >
                    {isDesigning ? 'מעבד...' : 'Run Engine'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return (
          <div className="p-20 text-center text-slate-300 italic font-light">
             עמוד זה בבנייה... בקרוב יגיעו עדכונים נוספים מאיב.
          </div>
        );
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 font-['Assistant'] font-light">
      {/* Sidebar */}
      <aside className="lg:col-span-3 space-y-8">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-50 sticky top-32">
          <h3 className="text-[11px] font-medium text-slate-300 uppercase tracking-[0.4em] mb-10 text-right">System Menu</h3>
          <nav className="space-y-4">
            {menuItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-right px-6 py-4 rounded-2xl text-[15px] font-medium transition-all flex items-center justify-between group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className={`text-lg group-hover:scale-125 transition-transform ${activeTab === item.id ? 'opacity-100' : 'opacity-40'}`}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Status Card */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-orange-100 shadow-sm relative overflow-hidden group">
          <p className="text-orange-500 text-[9px] font-bold tracking-[0.4em] uppercase mb-4 text-right">Sync Awareness</p>
          <h4 className="text-xl font-bold mb-4 text-right text-slate-900 leading-tight">מעבר ל-Git?</h4>
          <p className="text-slate-400 text-xs font-light text-right mb-6 leading-relaxed">ניתן לנתק את הדרייב ולהוריד את הקבצים ידנית מראש המסך.</p>
          <button onClick={() => setActiveTab('deployment')} className="w-full py-3 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition-colors">
            מדריך הגירה
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-9 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-3">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 text-[11px] font-medium rounded-full tracking-widest uppercase border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                System Live
              </div>
            </div>
            <h2 className="text-6xl font-light text-slate-900 tracking-[-0.05em] leading-none text-right">
              שלום, <br /><span className="text-slate-400 italic">{siteData.businessName || 'המנהל'}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <button className="px-10 py-5 bg-white border-2 border-slate-50 rounded-[2rem] font-medium text-slate-900 hover:border-slate-100 transition-all">Preview</button>
            <button className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-medium hover:bg-black shadow-2xl transition-all active:scale-95">Edit Project</button>
          </div>
        </header>

        {/* Tab View */}
        <div className="min-h-[600px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
