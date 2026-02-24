import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { getStripe, PRICE_IDS, CREDIT_PACK_PRICES } from '../services/stripe.js';
import { PLAN_LIMITS } from '../middleware/planGuard.js';

const router = Router();

router.post('/create-checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;
    const priceId = PRICE_IDS[`${plan}_MONTHLY`];
    if (!priceId) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: req.user!.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || 'https://helloeve.io/dashboard?payment=success',
      cancel_url: cancelUrl || 'https://helloeve.io/pricing?payment=canceled',
      metadata: { userId: req.user!.userId, plan },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/create-credit-checkout', authenticate, async (req: Request, res: Response) => {
  try {
    const { pack, successUrl, cancelUrl } = req.body;
    const packInfo = CREDIT_PACK_PRICES[pack];
    if (!packInfo) {
      res.status(400).json({ error: 'Invalid pack' });
      return;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user!.email,
      line_items: [{
        price_data: {
          currency: 'ils',
          product_data: { name: `${packInfo.credits} HelloEve Credits` },
          unit_amount: packInfo.price,
        },
        quantity: 1,
      }],
      success_url: successUrl || 'https://helloeve.io/dashboard?credits=success',
      cancel_url: cancelUrl || 'https://helloeve.io/dashboard?credits=canceled',
      metadata: { userId: req.user!.userId, pack, credits: String(packInfo.credits) },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create credit checkout' });
  }
});

router.get('/subscriptions', authenticate, async (req: Request, res: Response) => {
  try {
    const subs = await prisma.subscription.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

router.get('/invoices', authenticate, async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/cancel-subscription', authenticate, async (req: Request, res: Response) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user!.userId, status: 'ACTIVE' },
    });
    if (!sub?.stripeSubId) {
      res.status(404).json({ error: 'No active subscription found' });
      return;
    }

    const stripe = getStripe();
    await stripe.subscriptions.update(sub.stripeSubId, { cancel_at_period_end: true });
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAt: sub.currentPeriodEnd },
    });

    res.json({ message: 'Subscription will be canceled at period end' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Stripe webhook handler
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const sig = req.headers['stripe-signature'] as string;
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { userId, plan, pack, credits } = session.metadata;

        if (plan) {
          await prisma.subscription.create({
            data: {
              userId,
              stripeSubId: session.subscription,
              stripeCustomerId: session.customer,
              plan: plan as any,
              status: 'ACTIVE',
            },
          });
          const planKey = plan as keyof typeof PLAN_LIMITS;
          await prisma.user.update({ where: { id: userId }, data: { plan: plan as any } });
          await prisma.creditBalance.upsert({
            where: { userId },
            update: { monthly: PLAN_LIMITS[planKey].monthlyCredits },
            create: { userId, monthly: PLAN_LIMITS[planKey].monthlyCredits, purchased: 0 },
          });
        }

        if (credits) {
          const creditAmount = parseInt(credits);
          await prisma.creditBalance.upsert({
            where: { userId },
            update: { purchased: { increment: creditAmount } },
            create: { userId, monthly: 5, purchased: creditAmount },
          });
          await prisma.creditTransaction.create({
            data: { userId, type: 'PURCHASE', amount: creditAmount, balance: 0, note: `Purchased ${pack}` },
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any;
        if (invoice.metadata?.userId) {
          await prisma.invoice.create({
            data: {
              userId: invoice.metadata.userId,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              status: 'PAID',
              pdfUrl: invoice.invoice_pdf,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        await prisma.subscription.updateMany({
          where: { stripeSubId: sub.id },
          data: { status: 'CANCELED' },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Addons
router.get('/addons', authenticate, async (req: Request, res: Response) => {
  try {
    const addons = await prisma.addon.findMany({ where: { userId: req.user!.userId } });
    res.json(addons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addons' });
  }
});

router.post('/addons', authenticate, async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const addon = await prisma.addon.upsert({
      where: { userId_type: { userId: req.user!.userId, type } },
      update: { active: true },
      create: { userId: req.user!.userId, type, active: true },
    });
    res.json(addon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to activate addon' });
  }
});

router.delete('/addons/:type', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.addon.updateMany({
      where: { userId: req.user!.userId, type: req.params.type as any },
      data: { active: false },
    });
    res.json({ message: 'Addon deactivated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate addon' });
  }
});

export default router;
