import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const createSiteSchema = z.object({
  businessName: z.string().min(1).max(200),
  businessNameEn: z.string().min(1).max(200),
  type: z.enum(['IMAGE', 'LANDING', 'SHOP', 'BOOKING', 'RESTAURANT', 'COURSE', 'CONTRACTOR', 'PORTFOLIO']),
  domain: z.string().optional(),
  templateId: z.string().optional(),
  colorPrimary: z.string().optional(),
  colorSecondary: z.string().optional(),
  font: z.string().optional(),
  about: z.string().optional(),
});

export const updateSiteSchema = createSiteSchema.partial();

export const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  sections: z.any().optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const updatePageSchema = createPageSchema.partial();

export const contactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  hours: z.any().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.string().optional(),
});

export const designTokensSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  primaryColor: z.string().optional(),
  borderRadius: z.string().optional(),
  shadow: z.string().optional(),
  spacing: z.string().optional(),
  font: z.string().optional(),
  customCSS: z.string().optional(),
});

export const vibeDesignSchema = z.object({
  prompt: z.string().min(1).max(1000),
  siteId: z.string(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  siteId: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().int().min(0),
  comparePrice: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  isDigital: z.boolean().optional(),
  digitalUrl: z.string().optional(),
  weight: z.number().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createBookingSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(1),
  date: z.string(),
  time: z.string(),
  duration: z.number().int().min(15).optional(),
  serviceName: z.string().optional(),
  notes: z.string().optional(),
});

export const createLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  message: z.string().optional(),
  source: z.enum(['CONTACT_FORM', 'CHAT', 'PHONE', 'WHATSAPP', 'EXTERNAL']).optional(),
  page: z.string().optional(),
});

export const pixelConfigSchema = z.object({
  platform: z.enum(['META', 'GA4', 'GTM', 'GOOGLE_ADS', 'TIKTOK', 'TABOOLA', 'OUTBRAIN', 'BING', 'HOTJAR', 'CLARITY', 'INTERCOM', 'CRISP']),
  pixelId: z.string().min(1),
  isActive: z.boolean().optional(),
  config: z.any().optional(),
});

export const redirectSchema = z.object({
  fromPath: z.string().min(1),
  toPath: z.string().min(1),
  type: z.enum(['PERMANENT', 'TEMPORARY']).optional(),
});

export const webhookConfigSchema = z.object({
  name: z.string().optional(),
  url: z.string().url(),
  method: z.enum(['POST', 'GET', 'PUT']).optional(),
  headers: z.any().optional(),
  events: z.array(z.string()),
});

export const customScriptSchema = z.object({
  name: z.string().optional(),
  code: z.string().min(1),
  location: z.enum(['HEAD', 'BODY_START', 'BODY_END']).optional(),
  pages: z.array(z.string()).optional(),
});

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
