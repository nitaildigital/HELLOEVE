import React, { useState } from 'react';
import { BRAND_DARK, BRAND_ACCENT } from '@/constants';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => void;
  onSwitchToRegister: () => void;
  error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoogleLogin, onSwitchToRegister, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-10">
        <div className="text-center space-y-4">
          <div className="text-[32px] font-light tracking-[-0.04em] select-none">
            <span style={{ color: BRAND_DARK }}>hello</span>
            <span style={{ color: BRAND_ACCENT }}>eve</span>
          </div>
          <h1 className="text-3xl font-light text-slate-900 tracking-tight">כניסה לחשבון</h1>
          <p className="text-slate-400 font-light">ברוכים השבים! היכנסו כדי להמשיך לבנות.</p>
        </div>

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem] p-10 shadow-sm space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-sm text-right">
              {error}
            </div>
          )}

          <button
            onClick={onGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-5 bg-white border-2 border-slate-100 rounded-2xl font-medium text-slate-700 hover:border-slate-200 hover:bg-slate-50 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            התחבר עם Google
          </button>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">או</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[12px] font-medium text-slate-400 uppercase tracking-widest px-4">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#e33670] outline-none transition-all font-light text-lg text-right"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[12px] font-medium text-slate-400 uppercase tracking-widest px-4">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#e33670] outline-none transition-all font-light text-lg text-right"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-medium text-lg hover:bg-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 font-light">
          אין לך חשבון?{' '}
          <button onClick={onSwitchToRegister} className="text-[#e33670] font-medium hover:underline">
            הרשמה
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
