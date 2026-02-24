import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import cron from 'node-cron';
import { prisma } from './lib/prisma.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { PLAN_LIMITS } from './middleware/planGuard.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import siteRoutes from './routes/sites.js';
import pageRoutes from './routes/pages.js';
import templateRoutes from './routes/templates.js';
import designRoutes from './routes/design.js';
import aiRoutes from './routes/ai.js';
import creditRoutes from './routes/credits.js';
import billingRoutes from './routes/billing.js';
import leadRoutes from './routes/leads.js';
import shopRoutes from './routes/shop.js';
import bookingRoutes from './routes/bookings.js';
import seoRoutes from './routes/seo.js';
import analyticsRoutes from './routes/analytics.js';
import pixelRoutes from './routes/pixels.js';
import partnerRoutes from './routes/partners.js';
import domainRoutes from './routes/domains.js';
import mediaRoutes from './routes/media.js';
import exportRoutes from './routes/export.js';
import webhookRoutes from './routes/webhooksOut.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = parseInt(process.env.PORT || '4000');

// Stripe webhook needs raw body
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Global middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve('uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/sites/:siteId/pages', pageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/design', designRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sites/:siteId/leads', leadRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/sites/:siteId/shop', shopRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/sites/:siteId/bookings', bookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sites/:siteId/seo', seoRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/sites/:siteId/analytics', analyticsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sites/:siteId/pixels', pixelRoutes);
app.use('/api/sites/:siteId/webhooks', webhookRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Monthly credit reset cron (1st of each month at midnight)
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly credit reset...');
  try {
    const users = await prisma.user.findMany({ select: { id: true, plan: true } });
    for (const user of users) {
      const planKey = user.plan as keyof typeof PLAN_LIMITS;
      const monthlyCredits = PLAN_LIMITS[planKey]?.monthlyCredits || 5;
      await prisma.creditBalance.upsert({
        where: { userId: user.id },
        update: { monthly: monthlyCredits, lastReset: new Date() },
        create: { userId: user.id, monthly: monthlyCredits, purchased: 0 },
      });
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'MONTHLY_RESET',
          amount: monthlyCredits,
          balance: monthlyCredits,
          note: `Monthly reset: ${user.plan}`,
        },
      });
    }
    console.log(`Credit reset complete for ${users.length} users`);
  } catch (error) {
    console.error('Credit reset error:', error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`HelloEve API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
