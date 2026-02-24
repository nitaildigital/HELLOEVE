
export enum SiteType {
  Image = 'IMAGE',
  Landing = 'LANDING',
  Shop = 'SHOP',
  Booking = 'BOOKING',
  Restaurant = 'RESTAURANT',
  Course = 'COURSE',
  Contractor = 'CONTRACTOR',
  Portfolio = 'PORTFOLIO'
}

export interface SiteData {
  businessName: string;
  businessNameEn: string;
  type: SiteType;
  domain: string;
  logoUrl?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  font: string;
  about: string;
  services: Service[];
  contact: {
    phone: string;
    email: string;
    address: string;
    whatsapp: string;
  };
  isLaunched: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
}

export enum PricingPlan {
  Starter = 'STARTER',
  Pro = 'PRO',
  ProPlus = 'PRO_PLUS'
}

export interface DesignTokens {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  borderRadius: string;
  shadow: string;
  spacing: string;
}
