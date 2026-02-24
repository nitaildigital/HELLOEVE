import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// Collect event (public, cookieless)
router.post('/collect/:siteId', async (req: Request, res: Response) => {
  try {
    const { type, page, referrer, sessionId, metadata } = req.body;
    const ua = req.headers['user-agent'] || '';
    const device = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop';
    const browser = /chrome/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) ? 'Safari' : 'Other';

    await prisma.analyticsEvent.create({
      data: {
        siteId: req.params.siteId,
        type: type || 'pageview',
        page,
        referrer,
        device,
        browser,
        sessionId,
        metadata,
      },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect event' });
  }
});

// Dashboard stats
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const { period = '30d' } = req.query;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 86400000);

    const [totalViews, uniqueSessions, deviceBreakdown, topPages, sourceBreakdown] = await Promise.all([
      prisma.analyticsEvent.count({ where: { siteId: req.params.siteId, type: 'pageview', createdAt: { gte: since } } }),
      prisma.analyticsEvent.groupBy({ by: ['sessionId'], where: { siteId: req.params.siteId, type: 'pageview', createdAt: { gte: since }, sessionId: { not: null } } }).then(r => r.length),
      prisma.analyticsEvent.groupBy({ by: ['device'], where: { siteId: req.params.siteId, createdAt: { gte: since } }, _count: true }),
      prisma.analyticsEvent.groupBy({ by: ['page'], where: { siteId: req.params.siteId, type: 'pageview', createdAt: { gte: since } }, _count: true, orderBy: { _count: { page: 'desc' } }, take: 10 }),
      prisma.analyticsEvent.groupBy({ by: ['referrer'], where: { siteId: req.params.siteId, type: 'pageview', createdAt: { gte: since }, referrer: { not: null } }, _count: true, orderBy: { _count: { referrer: 'desc' } }, take: 10 }),
    ]);

    res.json({
      totalViews,
      uniqueSessions,
      devices: deviceBreakdown.map(d => ({ device: d.device, count: d._count })),
      topPages: topPages.map(p => ({ page: p.page, count: p._count })),
      sources: sourceBreakdown.map(s => ({ referrer: s.referrer, count: s._count })),
    });
  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
