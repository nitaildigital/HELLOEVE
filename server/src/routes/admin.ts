import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireAdmin);

// System stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalSites, activeSites, totalLeads, totalOrders, totalTemplates] = await Promise.all([
      prisma.user.count(),
      prisma.site.count(),
      prisma.site.count({ where: { isLaunched: true } }),
      prisma.lead.count(),
      prisma.order.count(),
      prisma.template.count(),
    ]);

    const planDistribution = await prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    });

    res.json({
      totalUsers, totalSites, activeSites, totalLeads, totalOrders, totalTemplates,
      planDistribution: planDistribution.map(p => ({ plan: p.plan, count: p._count })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// User management
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { search, plan, limit = '50', offset = '0' } = req.query;
    const where: any = {};
    if (search) where.OR = [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }];
    if (plan) where.plan = plan;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, name: true, plan: true, role: true, createdAt: true, _count: { select: { sites: true } } },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ users, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:userId/plan', async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { plan },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user plan' });
  }
});

router.put('/users/:userId/role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { role },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Template approval
router.get('/templates/pending', async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.template.findMany({
      where: { isApproved: false },
      include: { designer: { select: { profileName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending templates' });
  }
});

router.put('/templates/:id/approve', async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.update({
      where: { id: req.params.id },
      data: { isApproved: true },
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve template' });
  }
});

router.put('/templates/:id/reject', async (req: Request, res: Response) => {
  try {
    await prisma.template.delete({ where: { id: req.params.id } });
    res.json({ message: 'Template rejected and removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject template' });
  }
});

// Exit package management
router.get('/exit-requests', async (_req: Request, res: Response) => {
  try {
    const requests = await prisma.exitRequest.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exit requests' });
  }
});

router.put('/exit-requests/:id/complete', async (req: Request, res: Response) => {
  try {
    const { downloadUrl } = req.body;
    const request = await prisma.exitRequest.update({
      where: { id: req.params.id },
      data: { status: 'READY', downloadUrl, expiresAt: new Date(Date.now() + 7 * 86400000) },
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete exit request' });
  }
});

// Partner management
router.get('/partners', async (_req: Request, res: Response) => {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { referrals: true } },
      },
      orderBy: { totalEarnings: 'desc' },
    });
    res.json(partners);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

router.get('/payouts/pending', async (_req: Request, res: Response) => {
  try {
    const payouts = await prisma.partnerPayout.findMany({
      where: { status: 'PENDING' },
      include: { partner: { include: { user: { select: { email: true, name: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending payouts' });
  }
});

router.put('/payouts/:id/process', async (req: Request, res: Response) => {
  try {
    const payout = await prisma.partnerPayout.update({
      where: { id: req.params.id },
      data: { status: 'PAID', paidAt: new Date() },
    });
    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process payout' });
  }
});

export default router;
