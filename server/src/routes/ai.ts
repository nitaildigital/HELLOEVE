import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { chatMessageSchema, validate } from '../utils/validation.js';
import { askEveAssistant, generateSeoContent } from '../services/gemini.js';

const router = Router();

router.post('/assistant', authenticate, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { message, siteId } = validate(chatMessageSchema, req.body);

    let siteContext: Record<string, unknown> = {};
    if (siteId) {
      const site = await prisma.site.findFirst({
        where: { id: siteId, userId: req.user!.userId },
        include: { contact: true, services: true },
      });
      if (site) {
        siteContext = {
          businessName: site.businessName,
          type: site.type,
          domain: site.domain,
          isLaunched: site.isLaunched,
        };
      }
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { userId: req.user!.userId, siteId, role: 'user', content: message },
    });

    const response = await askEveAssistant(message, siteContext);

    // Save assistant response
    await prisma.chatMessage.create({
      data: { userId: req.user!.userId, siteId, role: 'assistant', content: response },
    });

    res.json({ response });
  } catch (error) {
    console.error('AI Assistant error:', error);
    res.status(500).json({ error: 'AI Assistant failed' });
  }
});

router.get('/chat-history', authenticate, async (req: Request, res: Response) => {
  try {
    const { siteId, limit = '50', offset = '0' } = req.query;
    const where: any = { userId: req.user!.userId };
    if (siteId) where.siteId = siteId;

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

router.post('/seo-generate', authenticate, aiLimiter, async (req: Request, res: Response) => {
  try {
    const { pageContent, siteId } = req.body;
    if (!pageContent || !siteId) {
      res.status(400).json({ error: 'pageContent and siteId required' });
      return;
    }

    const site = await prisma.site.findFirst({
      where: { id: siteId, userId: req.user!.userId },
    });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    // Check for SEO AI addon
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { addons: { where: { type: 'SEO_AI', active: true } } },
    });
    if (!user?.addons.length) {
      res.status(403).json({ error: 'SEO AI addon required' });
      return;
    }

    const seoData = await generateSeoContent(pageContent, {
      name: site.businessName,
      field: site.type,
      location: '',
    });

    res.json(seoData);
  } catch (error) {
    console.error('SEO AI error:', error);
    res.status(500).json({ error: 'SEO generation failed' });
  }
});

export default router;
