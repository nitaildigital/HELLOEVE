import { SiteType, SiteData, PricingPlan, DesignTokens } from '@/types';

export const BRAND_NAME = 'helloeve';
export const BRAND_ACCENT = '#e33670';
export const BRAND_DARK = '#14181f';

export const INITIAL_SITE_DATA: SiteData = {
  businessName: '',
  businessNameEn: '',
  type: SiteType.Image,
  domain: '',
  colors: {
    primary: BRAND_ACCENT,
    secondary: '#FFFFFF'
  },
  font: 'Assistant',
  about: '',
  services: [],
  contact: {
    phone: '',
    email: '',
    address: '',
    whatsapp: ''
  },
  isLaunched: false
};

export const DEFAULT_DESIGN_TOKENS: DesignTokens = {
  backgroundColor: '#FFFFFF',
  textColor: BRAND_DARK,
  primaryColor: BRAND_ACCENT,
  borderRadius: '1rem',
  shadow: 'shadow-2xl shadow-slate-200/50',
  spacing: '4rem'
};

export const PLANS = []; 
export const SITE_TYPE_LABELS: Record<SiteType, { label: string; icon: string }> = {
  [SiteType.Image]: { label: 'אתר תדמית', icon: '🏠' },
  [SiteType.Landing]: { label: 'דף נחיתה', icon: '📄' },
  [SiteType.Shop]: { label: 'חנות אונליין', icon: '🛒' },
  [SiteType.Booking]: { label: 'הזמנת תורים', icon: '📅' },
  [SiteType.Restaurant]: { label: 'מסעדה / קפה', icon: '🍽️' },
  [SiteType.Course]: { label: 'קורסים / חוגים', icon: '🎓' },
  [SiteType.Contractor]: { label: 'קבלן / שיפוצים', icon: '🏗️' },
  [SiteType.Portfolio]: { label: 'פורטפוליו', icon: '📸' }
};