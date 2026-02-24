import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createPageSchema, updatePageSchema, validate } from '../utils/validation.js';
import { PLAN_LIMITS } from '../middleware/planGuard.js';

const router = Router({ mergeParams: true });

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const pages = await prisma.page.findMany({
      where: { siteId: req.params.siteId },
      orderBy: { order: 'asc' },
    });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({ where: { id: req.params.siteId, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const plan = (req.user!.plan || 'STARTER') as keyof typeof PLAN_LIMITS;
    const pageCount = await prisma.page.count({ where: { siteId: req.params.siteId } });
    if (pageCount >= PLAN_LIMITS[plan].maxPages) {
      res.status(403).json({ error: 'Page limit reached', limit: PLAN_LIMITS[plan].maxPages });
      return;
    }

    const data = validate(createPageSchema, req.body);
    const page = await prisma.page.create({
      data: { siteId: req.params.siteId, ...data, order: pageCount },
    });
    res.status(201).json(page);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'A page with this slug already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.get('/:pageId', authenticate, async (req: Request, res: Response) => {
  try {
    const page = await prisma.page.findFirst({
      where: { id: req.params.pageId, siteId: req.params.siteId },
    });
    if (!page) { res.status(404).json({ error: 'Page not found' }); return; }
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch page' });
  }
});

router.put('/:pageId', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(updatePageSchema, req.body);
    const page = await prisma.page.update({
      where: { id: req.params.pageId },
      data,
    });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.put('/reorder', authenticate, async (req: Request, res: Response) => {
  try {
    const { pageIds } = req.body;
    if (!Array.isArray(pageIds)) {
      res.status(400).json({ error: 'pageIds array required' });
      return;
    }

    await prisma.$transaction(
      pageIds.map((id: string, index: number) =>
        prisma.page.update({ where: { id }, data: { order: index } })
      )
    );
    res.json({ message: 'Pages reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder pages' });
  }
});

router.delete('/:pageId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.page.delete({ where: { id: req.params.pageId } });
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

export default router;
