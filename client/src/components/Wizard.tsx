import React, { useState } from 'react';
import { SiteData, SiteType } from '@/types';
import { SITE_TYPE_LABELS, BRAND_NAME, BRAND_ACCENT, BRAND_DARK } from '@/constants';

interface WizardProps {
  onComplete: (data: SiteData) => void;
  initialData: SiteData;
}

const steps = [
  'סוג האתר',
  'פרטי עסק',
  'דומיין',
  'עיצוב',
  'תוכן',
  'אינטגרציות',
  'השקה'
];

const Wizard: React.FC<WizardProps> = ({ onComplete, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<SiteData>(initialData);

  const next = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleTypeSelect = (type: SiteType) => {
    setData({ ...data, type });
    next();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-light text-slate-900 tracking-tighter italic">החזון מתחיל כאן.</h2>
              <p className="text-slate-400 font-light text-lg tracking-tight">בחר את סוג הפרויקט שלך ונצא לדרך.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(Object.entries(SITE_TYPE_LABELS) as [SiteType, { label: string; icon: string }][]).map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center gap-6 group relative overflow-hidden ${data.type === type ? 'border-[#e33670] bg-[#fff5f8] shadow-2xl shadow-pink-100 scale-[1.02]' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50'}`}
                >
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500">{info.icon}</span>
                  <span className={`font-light text-xl tracking-tighter ${data.type === type ? 'text-[#e33670]' : 'text-slate-800'}`}>{info.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="max-w-xl mx-auto space-y-12 py-10">
            <h2 className="text-4xl font-light tracking-tighter text-center">איך נקרא לעסק שלך?</h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest px-4">שם העסק בעברית</label>
                <input 
                  type="text" 
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                  className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-[#e33670] outline-none transition-all font-light text-2xl shadow-sm placeholder:text-slate-300 text-right" 
                  placeholder="למשל: סטודיו 24"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[13px] font-medium text-slate-400 uppercase tracking-widest px-4">שם העסק באנגלית (כתובת URL)</label>
                <input 
                  type="text" 
                  value={data.businessNameEn}
                  onChange={(e) => setData({ ...data, businessNameEn: e.target.value })}
                  className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] focus:bg-white focus:border-[#e33670] outline-none transition-all font-mono text-2xl shadow-sm placeholder:text-slate-300 text-right" 
                  placeholder="e.g. Studio24"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="max-w-xl mx-auto space-y-10 py-10 text-center">
            <h2 className="text-4xl font-light tracking-tighter italic">הכתובת החדשה שלך.</h2>
            <p className="text-slate-400 font-light italic leading-relaxed">ה-AI שלנו סרק את המאגרים ומצא את הכתובות המדויקות עבורך:</p>
            <div className="grid grid-cols-1 gap-4 pt-4">
              {['.co.il', '.com', '.online'].map(ext => {
                const domain = `${data.businessNameEn || 'myproject'}${ext}`;
                const isSelected = data.domain === domain;
                return (
                  <button
                    key={ext}
                    onClick={() => setData({ ...data, domain })}
                    className={`w-full p-8 border-2 rounded-[2.5rem] flex justify-between items-center transition-all ${isSelected ? 'border-[#e33670] bg-[#fff5f8] shadow-xl' : 'border-slate-50 hover:border-slate-100 hover:bg-slate-50'}`}
                  >
                    <div className="text-right">
                       <span className={`font-mono text-xl font-light ${isSelected ? 'text-[#e33670]' : 'text-slate-900'}`}>{domain}</span>
                       <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Ready for launch</p>
                    </div>
                    <div className="bg-green-100 text-green-700 text-[11px] px-4 py-1.5 rounded-full font-medium uppercase tracking-widest">Available</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="text-center space-y-16 py-12">
            <div className="relative inline-block">
               <div className="w-40 h-40 bg-slate-900 text-white rounded-[3.5rem] flex items-center justify-center text-6xl mx-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-bounce relative z-10 border-8 border-white">
                🚀
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-100 rounded-full blur-[80px] animate-pulse"></div>
            </div>
            <div className="space-y-6">
              <h2 className="text-6xl font-light text-slate-900 tracking-[-0.05em] leading-none">The platform is ready.</h2>
              <p className="text-xl text-slate-400 max-w-lg mx-auto font-light leading-relaxed tracking-tight">
                בלחיצה אחת, <span className="font-medium"><span style={{ color: BRAND_DARK }}>hello</span><span style={{ color: BRAND_ACCENT }}>eve</span></span> תקים את תשתית ה-Edge עבור האתר שלך ותשיק אותו לעולם בתוך שניות.
              </p>
            </div>
            <button
              onClick={() => onComplete(data)}
              className="px-20 py-8 bg-slate-900 text-white rounded-[2.5rem] font-light text-2xl hover:bg-black shadow-2xl hover:-translate-y-2 transition-all active:scale-95"
            >
              השק את האתר שלי עכשיו
            </button>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 animate-fade-in">
             <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-4xl shadow-inner border border-slate-100">🛠️</div>
             <div className="space-y-3">
                <h3 className="text-3xl font-light text-slate-900 tracking-tighter">AI Processing...</h3>
                <p className="text-slate-400 font-light text-lg">אנחנו מעבדים את הנתונים ומתאימים את העיצוב בדיוק בשבילך.</p>
             </div>
             <button onClick={next} className="text-[#e33670] font-medium hover:underline tracking-widest text-xs uppercase">דילוג לשלב הבא ➔</button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto py-24 px-6 font-light">
      {/* Progress Stepper - Minimalist */}
      <div className="mb-24 px-10">
        <div className="flex justify-between items-center mb-10">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3 relative flex-1">
              <div className={`w-3 h-3 rounded-full transition-all duration-700 ${i <= currentStep ? 'bg-[#e33670] scale-125 ring-8 ring-pink-50' : 'bg-slate-200'}`}></div>
              <span className={`text-[10px] font-medium text-center tracking-widest uppercase mt-4 transition-colors ${i <= currentStep ? 'text-[#e33670]' : 'text-slate-300'}`}>{step}</span>
              {i < steps.length - 1 && (
                <div className={`absolute top-1.5 left-[50%] w-full h-[1px] -z-10 ${i < currentStep ? 'bg-[#e33670]' : 'bg-slate-100'}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[4rem] border border-slate-50 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] p-12 md:p-24 min-h-[600px] relative overflow-hidden">
        {/* Subtle minimalist decorative dots */}
        <div className="absolute top-12 left-12 w-2 h-2 bg-slate-100 rounded-full"></div>
        <div className="absolute top-12 right-12 w-2 h-2 bg-slate-100 rounded-full"></div>
        <div className="absolute bottom-12 left-12 w-2 h-2 bg-slate-100 rounded-full"></div>
        <div className="absolute bottom-12 right-12 w-2 h-2 bg-slate-100 rounded-full"></div>
        
        <div className="relative z-10">
          {renderStep()}
        </div>
      </div>

      <div className="mt-16 flex justify-between px-6">
        <button
          onClick={prev}
          disabled={currentStep === 0}
          className="px-10 py-4 rounded-2xl font-medium text-slate-300 hover:text-slate-900 disabled:opacity-0 transition-all uppercase tracking-widest text-xs"
        >
          חזרה
        </button>
        {currentStep < steps.length - 1 && currentStep !== 0 && (
          <button
            onClick={next}
            className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-light text-lg hover:bg-black shadow-xl shadow-slate-100 transition-all active:scale-95"
          >
            המשך
          </button>
        )}
      </div>
    </div>
  );
};

export default Wizard;