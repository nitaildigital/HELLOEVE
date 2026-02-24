import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

export const PRICE_IDS: Record<string, string> = {
  STARTER_MONTHLY: process.env.STRIPE_STARTER_PRICE_ID || '',
  PRO_MONTHLY: process.env.STRIPE_PRO_PRICE_ID || '',
  PRO_PLUS_MONTHLY: process.env.STRIPE_PRO_PLUS_PRICE_ID || '',
};

export const CREDIT_PACK_PRICES: Record<string, { credits: number; price: number }> = {
  PACK_10: { credits: 10, price: 3900 },
  PACK_30: { credits: 30, price: 9900 },
  PACK_100: { credits: 100, price: 29900 },
};
