import React from 'react';
import { BRAND_DARK, BRAND_ACCENT } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
  userEmail?: string;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userEmail, onLogin, onLogout }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#14181f]">
      <header className="fixed top-0 left-0 right-0 z-[100] glass-nav h-20">
        <div className="max-w-7xl mx-auto px-6 h-full grid grid-cols-3 items-center">
          <div className="flex items-center justify-start">
            <div className="text-[26px] font-light tracking-[-0.04em] cursor-pointer select-none">
              <span style={{ color: BRAND_DARK }}>hello</span>
              <span style={{ color: BRAND_ACCENT }}>eve</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center justify-center gap-10 text-[14px] font-medium text-slate-500">
            <a href="#product" className="hover:text-black transition-colors">מוצר</a>
            <a href="#vibe" className="hover:text-black transition-colors">Vibe Design™</a>
            <a href="#pricing" className="hover:text-black transition-colors">תמחור</a>
          </nav>

          <div className="flex items-center justify-end gap-6">
            {userEmail ? (
              <>
                <span className="text-[13px] text-slate-400 font-light hidden md:block">{userEmail}</span>
                <button
                  onClick={onLogout}
                  className="text-[14px] font-medium text-slate-600 hover:text-black transition-colors"
                >
                  יציאה
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="text-[14px] font-medium text-slate-600 hover:text-black transition-colors"
                >
                  כניסה
                </button>
                <button
                  onClick={onLogin}
                  className="px-7 py-3 btn-premium text-[14px]"
                >
                  התחל עכשיו
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 pt-24 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
            <div className="lg:col-span-2 space-y-8 text-right">
              <div className="text-[32px] font-light tracking-[-0.04em] select-none">
                <span style={{ color: BRAND_DARK }}>hello</span>
                <span style={{ color: BRAND_ACCENT }}>eve</span>
              </div>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-sm">
                הפלטפורמה הראשונה בעולם שמשלבת בינה מלאכותית עמוקה עם חדות עיצובית של סטודיו פרימיום. בונים את העתיד של העסקים הקטנים.
              </p>
              <div className="flex justify-end gap-4">
                {['Twitter', 'Instagram', 'LinkedIn', 'Facebook'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:border-[#e33670] hover:text-[#e33670] transition-all duration-300">
                    <span className="sr-only">{social}</span>
                    <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                  </a>
                ))}
              </div>
            </div>
            <div className="text-right space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">מוצר</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#product" className="hover:text-[#e33670] transition-colors">איך זה עובד</a></li>
                <li><a href="#vibe" className="hover:text-[#e33670] transition-colors">Vibe Design™</a></li>
                <li><a href="#templates" className="hover:text-[#e33670] transition-colors">תבניות פרימיום</a></li>
                <li><a href="#pricing" className="hover:text-[#e33670] transition-colors">חבילות מחיר</a></li>
              </ul>
            </div>
            <div className="text-right space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">חברה</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#" className="hover:text-[#e33670] transition-colors">עלינו</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">קריירה</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">בלוג</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">צור קשר</a></li>
              </ul>
            </div>
            <div className="text-right space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">משפטי</h4>
              <ul className="space-y-4 text-slate-400 font-light">
                <li><a href="#" className="hover:text-[#e33670] transition-colors">תנאי שימוש</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">מדיניות פרטיות</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">הצהרת נגישות</a></li>
                <li><a href="#" className="hover:text-[#e33670] transition-colors">עוגיות</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 order-2 md:order-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">All Systems Operational</span>
              </div>
              <span className="text-slate-200">|</span>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">
                &copy; {currentYear} HelloEve Ltd. All Rights Reserved.
              </p>
            </div>
            <div className="flex items-center gap-2 order-1 md:order-2">
               <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Made with love for SMBs</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
