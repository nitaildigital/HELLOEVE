import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/check/:domain', authenticate, async (req: Request, res: Response) => {
  try {
    const domain = req.params.domain.toLowerCase();
    const existing = await prisma.site.findFirst({
      where: { OR: [{ domain }, { customDomain: domain }] },
    });
    const domainConfig = await prisma.domainConfig.findFirst({ where: { domain } });

    res.json({
      domain,
      available: !existing && !domainConfig,
      suggestion: existing ? `${domain.split('.')[0]}-${Date.now().toString(36)}.${domain.split('.').slice(1).join('.')}` : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check domain' });
  }
});

router.post('/connect', authenticate, async (req: Request, res: Response) => {
  try {
    const { siteId, domain } = req.body;
    const site = await prisma.site.findFirst({ where: { id: siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const config = await prisma.domainConfig.upsert({
      where: { siteId },
      update: { domain, status: 'PENDING' },
      create: {
        siteId,
        domain,
        status: 'PENDING',
        dnsRecords: {
          cname: { name: 'www', value: 'sites.helloeve.io' },
          a: { name: '@', value: '76.76.21.21' },
        },
      },
    });

    await prisma.site.update({
      where: { id: siteId },
      data: { customDomain: domain },
    });

    res.json({
      config,
      instructions: {
        step1: 'Log in to your domain provider',
        step2: 'Go to DNS settings',
        step3: 'Add the following records:',
        records: [
          { type: 'CNAME', name: 'www', value: 'sites.helloeve.io' },
          { type: 'A', name: '@', value: '76.76.21.21' },
        ],
        note: 'DNS propagation may take 1-48 hours',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect domain' });
  }
});

router.get('/status/:siteId', authenticate, async (req: Request, res: Response) => {
  try {
    const config = await prisma.domainConfig.findUnique({ where: { siteId: req.params.siteId } });
    if (!config) { res.status(404).json({ error: 'No domain configured' }); return; }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch domain status' });
  }
});

export default router;
