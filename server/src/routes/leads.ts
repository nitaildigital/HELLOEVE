import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { createLeadSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

// Public: submit lead from site visitor
router.post('/public/:siteId', async (req: Request, res: Response) => {
  try {
    const data = validate(createLeadSchema, req.body);
    const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
    if (!site || !site.isLaunched) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const lead = await prisma.lead.create({
      data: { siteId: req.params.siteId, ...data },
    });

    // Trigger webhooks for this event
    const webhooks = await prisma.webhookConfig.findMany({
      where: { siteId: req.params.siteId, isActive: true, events: { has: 'lead.created' } },
    });
    for (const wh of webhooks) {
      triggerWebhook(wh, 'lead.created', lead).catch(console.error);
    }

    res.status(201).json({ message: 'Thank you for contacting us' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Owner: list leads
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const { source, isRead, limit = '50', offset = '0' } = req.query;
    const where: any = { siteId: req.params.siteId };
    if (source) where.source = source;
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({ leads, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.put('/:leadId/read', authenticate, async (req: Request, res: Response) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: req.params.leadId },
      data: { isRead: true },
    });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark lead as read' });
  }
});

router.get('/export', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const leads = await prisma.lead.findMany({
      where: { siteId: req.params.siteId },
      orderBy: { createdAt: 'desc' },
    });

    const csv = [
      'Name,Email,Phone,Message,Source,Date',
      ...leads.map(l => `"${l.name}","${l.email}","${l.phone}","${l.message}","${l.source}","${l.createdAt.toISOString()}"`),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${req.params.siteId}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export leads' });
  }
});

async function triggerWebhook(webhook: any, event: string, payload: any) {
  try {
    const response = await fetch(webhook.url, {
      method: webhook.method || 'POST',
      headers: { 'Content-Type': 'application/json', ...(webhook.headers || {}) },
      body: JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() }),
    });

    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        statusCode: response.status,
        success: response.ok,
      },
    });
  } catch (error: any) {
    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event,
        payload,
        response: error.message,
        success: false,
      },
    });
  }
}

export default router;
