import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requirePlan } from '../middleware/planGuard.js';
import { pixelConfigSchema, customScriptSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

// Pixel configs
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const pixels = await prisma.pixelConfig.findMany({ where: { siteId: req.params.siteId } });
    res.json(pixels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pixels' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(pixelConfigSchema, req.body);
    const pixel = await prisma.pixelConfig.upsert({
      where: { siteId_platform: { siteId: req.params.siteId, platform: data.platform as any } },
      update: { pixelId: data.pixelId, isActive: data.isActive ?? true, config: data.config },
      create: { siteId: req.params.siteId, ...data } as any,
    });
    res.json(pixel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save pixel config' });
  }
});

router.delete('/:platform', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.pixelConfig.deleteMany({
      where: { siteId: req.params.siteId, platform: req.params.platform as any },
    });
    res.json({ message: 'Pixel config deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pixel config' });
  }
});

// Custom scripts (Pro+ only)
router.get('/scripts', authenticate, async (req: Request, res: Response) => {
  try {
    const scripts = await prisma.customScript.findMany({ where: { siteId: req.params.siteId } });
    res.json(scripts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

router.post('/scripts', authenticate, requirePlan('PRO_PLUS'), async (req: Request, res: Response) => {
  try {
    const data = validate(customScriptSchema, req.body);
    const script = await prisma.customScript.create({
      data: { siteId: req.params.siteId, ...data } as any,
    });
    res.status(201).json(script);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create script' });
  }
});

router.delete('/scripts/:scriptId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.customScript.delete({ where: { id: req.params.scriptId } });
    res.json({ message: 'Script deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

export default router;
