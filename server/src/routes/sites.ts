import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createSiteSchema, updateSiteSchema, contactSchema, serviceSchema, validate } from '../utils/validation.js';
import { sendSiteLaunchedEmail } from '../services/email.js';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(createSiteSchema, req.body);
    const site = await prisma.site.create({
      data: {
        userId: req.user!.userId,
        businessName: data.businessName,
        businessNameEn: data.businessNameEn,
        type: data.type as any,
        domain: data.domain,
        templateId: data.templateId,
        colorPrimary: data.colorPrimary || '#e33670',
        colorSecondary: data.colorSecondary || '#FFFFFF',
        font: data.font || 'Assistant',
        about: data.about || '',
        designTokens: { create: {} },
        contact: { create: {} },
      },
      include: { contact: true, designTokens: true, services: true },
    });
    res.status(201).json(site);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create site error:', error);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      where: { userId: req.user!.userId },
      include: { contact: true, designTokens: true, _count: { select: { pages: true, leads: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: {
        contact: true, services: { orderBy: { order: 'asc' } },
        designTokens: true, pages: { orderBy: { order: 'asc' } },
        template: { select: { id: true, name: true, tier: true } },
        _count: { select: { leads: true, products: true, orders: true, bookings: true } },
      },
    });
    if (!site) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(updateSiteSchema, req.body);
    const existing = await prisma.site.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const site = await prisma.site.update({
      where: { id: req.params.id },
      data: {
        ...(data.businessName !== undefined && { businessName: data.businessName }),
        ...(data.businessNameEn !== undefined && { businessNameEn: data.businessNameEn }),
        ...(data.type !== undefined && { type: data.type as any }),
        ...(data.domain !== undefined && { domain: data.domain }),
        ...(data.colorPrimary !== undefined && { colorPrimary: data.colorPrimary }),
        ...(data.colorSecondary !== undefined && { colorSecondary: data.colorSecondary }),
        ...(data.font !== undefined && { font: data.font }),
        ...(data.about !== undefined && { about: data.about }),
      },
      include: { contact: true, designTokens: true, services: true },
    });
    res.json(site);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Failed to update site' });
  }
});

router.post('/:id/launch', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.site.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const site = await prisma.site.update({
      where: { id: req.params.id },
      data: { isLaunched: true },
    });

    if (existing.domain) {
      const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
      if (user) {
        sendSiteLaunchedEmail(user.email, site.businessName, existing.domain).catch(console.error);
      }
    }

    res.json(site);
  } catch (error) {
    res.status(500).json({ error: 'Failed to launch site' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.site.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!existing) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }
    await prisma.site.delete({ where: { id: req.params.id } });
    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

// Contact
router.put('/:id/contact', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(contactSchema, req.body);
    const site = await prisma.site.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const contact = await prisma.contact.upsert({
      where: { siteId: req.params.id },
      update: data,
      create: { siteId: req.params.id, ...data },
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Services
router.post('/:id/services', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(serviceSchema, req.body);
    const site = await prisma.site.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
    if (!site) { res.status(404).json({ error: 'Site not found' }); return; }

    const count = await prisma.service.count({ where: { siteId: req.params.id } });
    const service = await prisma.service.create({
      data: { siteId: req.params.id, ...data, order: count },
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id/services/:serviceId', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(serviceSchema.partial(), req.body);
    const service = await prisma.service.update({
      where: { id: req.params.serviceId },
      data,
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id/services/:serviceId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({ where: { id: req.params.serviceId } });
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
