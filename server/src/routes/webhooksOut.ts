import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { webhookConfigSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      where: { siteId: req.params.siteId },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });
    res.json(webhooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(webhookConfigSchema, req.body);
    const webhook = await prisma.webhookConfig.create({
      data: { siteId: req.params.siteId, ...data },
    });
    res.status(201).json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

router.put('/:webhookId', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(webhookConfigSchema.partial(), req.body);
    const webhook = await prisma.webhookConfig.update({
      where: { id: req.params.webhookId },
      data,
    });
    res.json(webhook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

router.delete('/:webhookId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.webhookConfig.delete({ where: { id: req.params.webhookId } });
    res.json({ message: 'Webhook deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Test webhook
router.post('/:webhookId/test', authenticate, async (req: Request, res: Response) => {
  try {
    const webhook = await prisma.webhookConfig.findUnique({ where: { id: req.params.webhookId } });
    if (!webhook) { res.status(404).json({ error: 'Webhook not found' }); return; }

    const testPayload = {
      event: 'test',
      data: { message: 'This is a test webhook from HelloEve', timestamp: new Date().toISOString() },
    };

    const response = await fetch(webhook.url, {
      method: webhook.method || 'POST',
      headers: { 'Content-Type': 'application/json', ...(webhook.headers as any || {}) },
      body: JSON.stringify(testPayload),
    });

    await prisma.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: 'test',
        payload: testPayload,
        statusCode: response.status,
        success: response.ok,
      },
    });

    res.json({ success: response.ok, statusCode: response.status });
  } catch (error: any) {
    res.json({ success: false, error: error.message });
  }
});

// View logs
router.get('/:webhookId/logs', authenticate, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.webhookLog.findMany({
      where: { webhookId: req.params.webhookId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
});

export default router;
