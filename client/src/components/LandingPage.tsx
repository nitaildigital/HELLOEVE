import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onStart: () => void;
}

type VibeType = 'default' | 'earthy' | 'luxury' | 'young';
type TemplateCategory = 'הכל' | 'עסקים' | 'מסעדות' | 'חנויות' | 'קריאייטיב';

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [currentVibe, setCurrentVibe] = useState<VibeType>('default');
  const [typedText, setTypedText] = useState('');
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('הכל');
  const [isProcessing, setIsProcessing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const vibes = {
    earthy: {
      prompt: "“עיצוב חם ונעים עם צבעים ארציים”",
      bg: "bg-[#fdf8f4]",
      accent: "text-[#8c5e3c]",
      border: "border-[#e6b17a]/30",
      secondary: "bg-[#e6b17a]/40",
      icon: "🌿",
      label: "חם ואורגני"
    },
    luxury: {
      prompt: "“מראה יוקרתי עם זהב ושחור”",
      bg: "bg-[#1a1a1a]",
      accent: "text-[#d4af37]",
      border: "border-[#d4af37]/20",
      secondary: "bg-[#d4af37]/20",
      icon: "💎",
      label: "יוקרתי ומוקפד"
    },
    young: {
      prompt: "“סגנון צעיר עם צבעים בוהקים”",
      bg: "bg-[#ffffff]",
      accent: "text-[#e33670]",
      border: "border-[#e33670]/20",
      secondary: "bg-[#e33670]/10",
      icon: "⚡",
      label: "דינמי ונועז"
    },
    default: {
      prompt: "תאר את האווירה שאתה רוצה...",
      bg: "bg-slate-50",
      accent: "text-slate-400",
      border: "border-slate-200",
      secondary: "bg-slate-200",
      icon: "🏢",
      label: "מראה בסיסי"
    }
  };

  const templates = [
    { name: 'Prestige', category: 'עסקים', color: 'bg-slate-900', secondary: 'bg-slate-800' },
    { name: 'Bold', category: 'עסקים', color: 'bg-blue-600', secondary: 'bg-blue-500' },
    { name: 'Market', category: 'חנויות', color: 'bg-emerald-500', secondary: 'bg-emerald-400' },
    { name: 'Bloom', category: 'קריאייטיב', color: 'bg-rose-400', secondary: 'bg-rose-300' },
    { name: 'Craft', category: 'קריאייטיב', color: 'bg-amber-500', secondary: 'bg-amber-400' },
    { name: 'Bite', category: 'מסעדות', color: 'bg-orange-600', secondary: 'bg-orange-500' },
    { name: 'Scholar', category: 'עסקים', color: 'bg-indigo-700', secondary: 'bg-indigo-600' },
    { name: 'Lens', category: 'קריאייטיב', color: 'bg-purple-500', secondary: 'bg-purple-400' },
  ];

  const faqs = [
    {
      q: "האם אני צריך ידע טכני?",
      a: "ממש לא. helloeve נבנתה במיוחד עבור בעלי עסקים שרוצים תוצאה מקצועית בלי לכתוב שורת קוד אחת. ה-AI שלנו מטפל בהכל: מעיצוב ופונטים ועד הגדרות שרת ודומיין. כל מה שצריך זה לספר לנו על העסק שלך."
    },
    {
      q: "מה קורה אם אני רוצה לעזוב?",
      a: "אנחנו מאמינים בחופש מלא. לכן יצרנו את ה-Exit Package: בכל שלב תוכל לייצא את כל הקוד והתוכן של האתר שלך ולהעביר אותו לכל שרת אחר. האתר הוא שלך ב-100%, בלי אותיות קטנות."
    },
    {
      q: "האם האתר מותאם לנייד?",
      a: "בוודאי. כל האתרים שנוצרים ב-helloeve הם Mobile-First כברירת מחדל. ה-AI מבצע אופטימיזציה מלאה לכל סוגי המסכים, כך שהלקוחות שלך ייהנו מחוויית גלישה מושלמת גם מהסמארטפון."
    }
  ];

  const filteredTemplates = activeCategory === 'הכל' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const handleVibeChange = (vibe: VibeType) => {
    if (vibe === currentVibe) return;
    setIsProcessing(true);
    setCurrentVibe(vibe);
    setTypedText(''); 
    setTimeout(() => setIsProcessing(false), 800);
  };

  useEffect(() => {
    const targetText = vibes[currentVibe].prompt;
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(targetText.slice(0, i));
      i++;
      if (i > targetText.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [currentVibe]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Background Mesh Layer */}
      <div className="hero-bg-container h-[9500px]">
        <div className="bg-noise"></div>
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
        <div className="mesh-blob blob-3"></div>
        <div className="mesh-blob blob-4"></div>
      </div>
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl border border-white/60 px-5 py-2 rounded-full text-[11px] font-bold text-slate-600 uppercase tracking-[0.2em] shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#e33670] rounded-full animate-ping"></span>
            Limited Early Access: Join 500+ Businesses
          </div>

          <div className="space-y-8">
            <h1 className="text-6xl md:text-[100px] font-light tracking-[-0.05em] leading-[1] premium-gradient-text">
              האתר הבא שלך <br />
              נבנה בשיחה אחת.
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed tracking-tight">
              הפלטפורמה הראשונה בעולם שמשלבת בינה מלאכותית עמוקה עם חדות עיצובית של סטודיו פרימיום. השקה מלאה בתוך דקות.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
            <button onClick={onStart} className="w-full sm:w-auto px-14 py-6 btn-premium text-lg shadow-2xl group relative overflow-hidden">
              <span className="relative z-10">התחל פרויקט חדש</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button className="w-full sm:w-auto px-14 py-6 btn-secondary text-lg border-slate-200/60 bg-white/20 backdrop-blur-md">
              צפה בדוגמאות
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: How it Works */}
      <section id="product" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900">איך זה עובד?</h2>
            <p className="text-slate-400 text-xl font-light max-w-xl mx-auto">תהליך פשוט, חכם ומהיר שחוסך לך שבועות של עבודה מול מעצבים.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { num: '01', title: 'ספר לנו על החזון', desc: 'שיחה קצרה עם Eve, העוזרת החכמה שלנו. תאר את העסק והמטרות שלך בשפה חופשית.', icon: 'M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4551 20 9.00693 19.6493 7.74794 19.0333L3 21L4.5 16.5C3.56152 15.1979 3 13.6663 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z' },
              { num: '02', title: 'מנוע Vibe Design', desc: 'ה-AI שלנו מעצב את האתר בזמן אמת. הוא בוחר פונטים, צבעים ומייצר תמונות פרימיום.', icon: 'M15.5 15.5L19 19M5 5L8.5 8.5M2 12H4M12 2V4M12 20V22M20 12H22M5.5 18.5L8 16M18.5 5.5L16 8M12 7V17M7 12H17' },
              { num: '03', title: 'השקה מיידית', desc: 'האתר באוויר בתוך דקות. מקבלים דומיין מותאם, תשתית מהירה בטירוף ומערכת ניהול פשוטה.', icon: 'M12 19L19 12L12 5M5 12H19' }
            ].map((step, i) => (
              <div key={i} className="relative p-12 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/40 shadow-sm transition-all duration-700 hover:-translate-y-3 group">
                <div className="absolute top-8 left-8 text-[80px] font-bold text-slate-900/5 select-none leading-none group-hover:text-[#e33670]/10 transition-colors duration-700">{step.num}</div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-700">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-900 group-hover:text-[#e33670] transition-colors duration-700">
                    <path d={step.icon} strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="space-y-6 text-right relative z-10">
                  <h3 className="text-2xl font-normal tracking-tight text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 font-light text-lg leading-relaxed opacity-80">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Vibe Design™ */}
      <section id="vibe" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Interactive Prompts */}
            <div className="space-y-10 text-right order-2 lg:order-1">
              <div className="inline-flex px-4 py-1 bg-[#e33670]/10 text-[#e33670] rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
                Vibe Design™ Technology
              </div>
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-slate-900 leading-[1.1]">
                תאר במילים העיצוב משתנה
              </h2>
              <p className="text-slate-500 text-xl font-light leading-relaxed max-w-xl">
                בחר את האווירה שלך וראה איך ה-AI מעבד אותה למציאות ויזואלית בתוך שניות.
              </p>
              
              <div className="space-y-4 pt-6">
                {[
                  { key: 'earthy' as VibeType, text: "“עיצוב חם ונעים עם צבעים ארציים”" },
                  { key: 'luxury' as VibeType, text: "“מראה יוקרתי עם זהב ושחור”" },
                  { key: 'young' as VibeType, text: "“סגנון צעיר עם צבעים בוהקים”" }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleVibeChange(item.key)}
                    className={`flex items-center gap-4 group text-right w-full transition-all duration-500 ${currentVibe === item.key ? 'text-slate-900 translate-x-4' : 'text-slate-400'}`}
                  >
                    <span className={`h-[1px] transition-all duration-500 ${currentVibe === item.key ? 'w-16 bg-[#e33670]' : 'w-6 bg-slate-200 group-hover:bg-[#e33670] group-hover:w-10'}`}></span>
                    <span className={`font-light italic transition-colors ${currentVibe === item.key ? 'font-medium not-italic' : 'group-hover:text-slate-600'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>

              {/* Real-time Activity Feed for Urgency */}
              <div className="pt-10 border-t border-slate-100 mt-10">
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Live Activity
                </div>
                <p className="text-xs text-slate-400 mt-2 italic">
                  יניב מתל אביב בנה עכשיו אתר מסעדה בסגנון "חם ואורגני"
                </p>
              </div>
            </div>

            {/* Right Column: Visual Demo with Loader */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#e33670]/10 to-transparent blur-[120px] -z-10"></div>
              
              <div className="relative bg-white/30 backdrop-blur-3xl border border-white/60 rounded-[3.5rem] p-8 shadow-2xl overflow-hidden min-h-[580px] flex flex-col gap-8 transition-all duration-1000">
                {/* Mock Prompt Input */}
                <div className="bg-white/95 rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-lg">🪄</div>
                  <div className="font-light text-slate-900 flex-1 flex items-center gap-1 text-lg">
                    <span>{typedText}</span>
                    <span className="w-0.5 h-6 bg-[#e33670] animate-blink"></span>
                  </div>
                  {/* Processing Progress Bar */}
                  {isProcessing && (
                    <div className="absolute bottom-0 left-0 h-1 bg-[#e33670] animate-progress-fast"></div>
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 h-full relative">
                  {/* Static "Before" */}
                  <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-200 p-8 flex flex-col items-center justify-center gap-6 opacity-30 grayscale blur-[1px]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Default Draft</span>
                    <div className="w-full space-y-3">
                      <div className="w-full h-3 bg-slate-200 rounded-full"></div>
                      <div className="w-2/3 h-3 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-4xl">🏢</div>
                  </div>

                  {/* Dynamic "After" */}
                  <div className={`relative ${vibes[currentVibe].bg} rounded-[3rem] border-2 ${vibes[currentVibe].border} p-8 flex flex-col items-center justify-center gap-6 shadow-2xl transition-all duration-1000 transform ${isProcessing ? 'scale-95 opacity-50 blur-sm' : 'scale-[1.05] opacity-100'} z-10 overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                    
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${vibes[currentVibe].accent} mb-2`}>Vibe Engine Output</span>
                    
                    <div className="w-full space-y-3 relative z-10">
                      <div className={`w-full h-3 ${vibes[currentVibe].secondary} rounded-full transition-all duration-1000`}></div>
                      <div className={`w-3/4 h-3 ${vibes[currentVibe].secondary} rounded-full transition-all duration-1000`}></div>
                    </div>

                    <div className={`w-32 h-32 ${vibes[currentVibe].bg} rounded-full shadow-lg border-4 border-white flex items-center justify-center text-6xl relative z-10 animate-bounce-slow`}>
                      {vibes[currentVibe].icon}
                    </div>

                    <p className={`text-lg font-bold ${vibes[currentVibe].accent} mt-4 relative z-10 text-center`}>
                      {vibes[currentVibe].label}
                    </p>
                    
                    <div className="absolute bottom-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Pixel Perfect</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Start with Professional Templates */}
      <section id="templates" className="py-32 px-6 relative z-10 bg-slate-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-7xl font-light tracking-tight text-slate-900 leading-tight">
              התחל מתבנית מקצועית
            </h2>
            <p className="text-slate-400 text-xl font-light max-w-2xl mx-auto">
              בחר, התאם אישית, ופרסם — תוך דקות. כל תבנית עוצבה על ידי המומחים שלנו למקסום המרות.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {['הכל', 'עסקים', 'מסעדות', 'חנויות', 'קריאייטיב'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat as TemplateCategory)}
                className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-500 border ${activeCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTemplates.map((template, idx) => (
              <div 
                key={template.name}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 animate-in fade-in slide-in-from-bottom-10"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Real Site Mockup Style */}
                <div className="aspect-[4/5] relative overflow-hidden bg-slate-50">
                  <div className={`absolute inset-0 ${template.color} opacity-5 group-hover:opacity-10 transition-opacity duration-700`}></div>
                  
                  {/* Browser Header */}
                  <div className="absolute top-0 left-0 right-0 h-6 bg-white border-b border-slate-100 flex items-center gap-1.5 px-3 z-20">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>

                  {/* Site Content Simulation */}
                  <div className="absolute inset-0 pt-6 flex flex-col group-hover:translate-y-[-10px] transition-transform duration-700 ease-out">
                    {/* Fake Website Structure */}
                    <div className="flex-1 bg-white rounded-t-3xl shadow-inner overflow-hidden flex flex-col">
                      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-50">
                        <div className={`w-10 h-3 ${template.color} rounded opacity-30`}></div>
                        <div className="flex gap-2">
                           <div className="w-4 h-1 bg-slate-100 rounded-full"></div>
                           <div className="w-4 h-1 bg-slate-100 rounded-full"></div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className={`w-full h-32 ${template.color} rounded-2xl opacity-10 flex items-center justify-center`}>
                           <div className="w-12 h-12 border-2 border-white/50 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className={`w-3/4 h-2 ${template.color} rounded-full opacity-20`}></div>
                          <div className="w-1/2 h-2 bg-slate-50 rounded-full"></div>
                        </div>
                      </div>
                      <div className="px-6 grid grid-cols-2 gap-3 pb-10">
                         <div className="h-16 bg-slate-50 rounded-xl"></div>
                         <div className="h-16 bg-slate-50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-center z-30">
                    <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-110 transition-transform">
                      צפה בדמו →
                    </button>
                  </div>
                </div>

                <div className="p-8 text-right bg-white relative z-10 border-t border-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-[#e33670] uppercase tracking-widest px-3 py-1 bg-[#e33670]/5 rounded-full">
                      {template.category}
                    </span>
                    <h3 className="text-xl font-normal text-slate-900">{template.name}</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-light">עיצוב נקי ומוקפד המותאם אישית למותג שלך.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button onClick={onStart} className="btn-premium px-16 py-6 text-lg group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]">
              בנה את האתר שלי על בסיס תבנית
              <span className="mr-4 inline-block group-hover:translate-x-1 transition-transform" style={{ color: '#e33670' }}>✨</span>
            </button>
          </div>
        </div>
      </section>

      {/* Section 6: Pricing */}
      <section id="pricing" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-7xl font-light tracking-tight text-slate-900 leading-tight">
              תוכניות שקופות, בלי הפתעות
            </h2>
            <p className="text-slate-400 text-xl font-light max-w-2xl mx-auto">
              חודשי, ללא התחייבות. בטל בכל עת.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white/40 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/60 shadow-sm flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="mb-8">
                <h3 className="text-2xl font-normal mb-2 text-right">Starter</h3>
                <p className="text-slate-400 text-sm text-right">לעסקים שרק מתחילים</p>
              </div>
              <div className="mb-10 text-right">
                <span className="text-5xl font-light">₪79</span>
                <span className="text-slate-400">/חודש</span>
              </div>
              <ul className="space-y-4 mb-12 text-right">
                {['דומיין חינם לשנה', 'SSL + Hosting', 'CMS בסיסי', 'תמיכה במייל', '3 עמודים'].map((item, i) => (
                  <li key={i} className="flex items-center justify-end gap-3 text-slate-500 font-light">
                    {item}
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-auto w-full py-5 btn-secondary group-hover:bg-slate-900 group-hover:text-white transition-all">
                התחל עכשיו
              </button>
            </div>

            {/* Pro Plan */}
            <div className="relative p-12 rounded-[3.5rem] bg-slate-900 text-white shadow-[0_40px_100px_-20px_rgba(227,54,112,0.2)] flex flex-col scale-105 z-20 border-2 border-[#e33670]/30 overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-[#e33670]"></div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#e33670]/10 rounded-full blur-3xl"></div>
              
              <div className="mb-8 relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#e33670] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    הכי פופולרי
                  </span>
                  <h3 className="text-2xl font-normal">Pro</h3>
                </div>
                <p className="text-slate-400 text-sm text-right">הפופולרי ביותר</p>
              </div>
              <div className="mb-10 text-right relative z-10">
                <span className="text-5xl font-light">₪149</span>
                <span className="text-slate-400">/חודש</span>
              </div>
              <ul className="space-y-4 mb-12 text-right relative z-10">
                {['הכל מ-Starter', 'עמודים ללא הגבלה', 'Pixels & Analytics', 'SEO Schema מתקדם', 'תמיכת צ׳אט 24/7', 'Vibe Design'].map((item, i) => (
                  <li key={i} className="flex items-center justify-end gap-3 text-slate-300 font-light">
                    {item}
                    <span className="w-1.5 h-1.5 bg-[#e33670] rounded-full"></span>
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-auto w-full py-5 bg-[#e33670] text-white rounded-2xl font-bold hover:bg-[#c92d61] shadow-xl shadow-pink-900/20 transition-all transform active:scale-95">
                התחל עכשיו
              </button>
            </div>

            {/* Pro+ Plan */}
            <div className="bg-white/40 backdrop-blur-2xl p-12 rounded-[3.5rem] border border-white/60 shadow-sm flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group">
              <div className="mb-8">
                <h3 className="text-2xl font-normal mb-2 text-right">Pro+</h3>
                <p className="text-slate-400 text-sm text-right">לעסקים שרוצים הכל</p>
              </div>
              <div className="mb-10 text-right">
                <span className="text-5xl font-light">₪249</span>
                <span className="text-slate-400">/חודש</span>
              </div>
              <ul className="space-y-4 mb-12 text-right">
                {['הכל מ-Pro', 'חנות אונליין', 'אוטומציות', 'API גישה', 'מנהל חשבון ייעודי', 'Exit Package מלא'].map((item, i) => (
                  <li key={i} className="flex items-center justify-end gap-3 text-slate-500 font-light">
                    {item}
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-auto w-full py-5 btn-secondary group-hover:bg-slate-900 group-hover:text-white transition-all">
                התחל עכשיו
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: FAQ */}
      <section id="faq" className="py-32 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900">שאלות נפוצות</h2>
            <p className="text-slate-400 text-lg font-light">כל מה שרצית לדעת על הפלטפורמה.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className={`group bg-white/40 backdrop-blur-xl border rounded-[2rem] overflow-hidden transition-all duration-500 ${openFaq === idx ? 'border-[#e33670]/40 shadow-xl' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-8 flex items-center justify-between text-right outline-none"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${openFaq === idx ? 'bg-[#e33670] text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {openFaq === idx ? '−' : '+'}
                  </span>
                  <h3 className={`text-xl font-normal transition-colors duration-500 ${openFaq === idx ? 'text-slate-900' : 'text-slate-600'}`}>
                    {faq.q}
                  </h3>
                </button>
                <div 
                  className={`px-8 overflow-hidden transition-all duration-700 ease-in-out ${openFaq === idx ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-slate-500 font-light leading-relaxed text-lg text-right border-t border-slate-50 pt-6">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: All Included */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-6xl font-light tracking-tight text-slate-900">הכל כלול.</h2>
          <p className="text-slate-400 text-xl font-light max-w-xl mx-auto">כל מה שהעסק שלך צריך כדי להצליח בדיגיטל, במקום אחד.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: 'M11 4H4V20H20V13M18.5 2.5L21.5 5.5L12 15H9V12L18.5 2.5Z', title: 'CMS מובנה', desc: 'ערוך טקסטים, תמונות ותוכן ישירות מהממשק — פשוט ונוח.' },
            { icon: 'M18 20V10M12 20V4M6 20V14', title: 'Pixels & Analytics', desc: 'Facebook Pixel, Google Analytics, GTM — חיבור בקליק אחד.' },
            { icon: 'M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3Z', title: 'SEO מתקדם', desc: 'Open Graph, JSON-LD, Sitemap — הכל נוצר אוטומטית.' },
            { icon: 'M4 6H20M4 12H20M4 18H12', title: 'RTL מושלם', desc: 'תמיכה מלאה בעברית וערבית. לא פאץ׳ — מהיסוד.' },
            { icon: 'M12 10V17M12 17L9 21M12 17L15 21', title: 'נגישות AA', desc: 'עומד בתקן הנגישות הישראלי והבינלאומי באופן מלא.' },
            { icon: 'M10 14L20 4M20 4H15M20 4V9', title: 'Exit Package', desc: 'רוצה לעזוב? מקבל את כל הקוד והתוכן שלך.' }
          ].map((feat, i) => (
            <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-2xl border border-white/20 shadow-sm transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 group text-right space-y-4">
              <div className="w-12 h-12 mb-4 text-slate-900 group-hover:text-[#e33670] transition-colors">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d={feat.icon} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-normal">{feat.title}</h3>
              <p className="text-slate-500 font-light leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 9: Final CTA */}
      <section className="py-32 px-6 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 md:p-24 rounded-[4.5rem] bg-slate-900 text-center space-y-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-2 border-white/5 overflow-hidden group">
             {/* Decorative Background Blob */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e33670]/10 rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-125"></div>
             
             <div className="relative z-10 space-y-6">
                <h2 className="text-4xl md:text-7xl font-light tracking-tight text-white leading-[1.1]">
                  העסק שלך ראוי לנוכחות <br />
                  דיגיטלית שמרגישה פרימיום
                </h2>
                <p className="text-slate-400 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
                  הצטרף למאות בעלי עסקים שכבר בנו אתר מקצועי — תוך דקות, בלי סיבוכים.
                </p>
             </div>

             <div className="relative z-10">
                <button 
                  onClick={onStart} 
                  className="px-16 py-8 bg-[#e33670] text-white rounded-[2.5rem] text-2xl font-bold shadow-2xl hover:bg-[#c92d61] hover:-translate-y-1 transition-all active:scale-95 group/btn"
                >
                  בנה את האתר שלך עכשיו
                  <span className="mr-4 inline-block group-hover/btn:translate-x-2 transition-transform">✨</span>
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Trust & Social */}
      <div className="max-w-7xl mx-auto px-6 pb-32 text-center relative z-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400 mb-12 opacity-60">נבנה עבור היזמים המובילים בישראל</p>
        <div className="flex flex-wrap justify-center gap-16 opacity-20 grayscale items-center">
          <span className="text-2xl font-light italic tracking-tighter">SPEED</span>
          <span className="text-2xl font-light italic tracking-tighter">DESIGN</span>
          <span className="text-2xl font-light italic tracking-tighter">QUALITY</span>
          <span className="text-2xl font-light italic tracking-tighter">SCALE</span>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes progress-fast {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 0.8s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;