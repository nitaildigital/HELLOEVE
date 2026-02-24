import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { redirectSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

// Page SEO settings
router.put('/pages/:pageId', authenticate, async (req: Request, res: Response) => {
  try {
    const { seoTitle, seoDescription, seoCanonical, ogTitle, ogDescription, ogImage, noIndex, noFollow, focusKeyword } = req.body;
    const page = await prisma.page.update({
      where: { id: req.params.pageId },
      data: { seoTitle, seoDescription, seoCanonical, ogTitle, ogDescription, ogImage, noIndex, noFollow, focusKeyword },
    });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Redirects
router.get('/redirects', authenticate, async (req: Request, res: Response) => {
  try {
    const redirects = await prisma.redirect.findMany({
      where: { siteId: req.params.siteId },
      orderBy: { fromPath: 'asc' },
    });
    res.json(redirects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch redirects' });
  }
});

router.post('/redirects', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(redirectSchema, req.body);
    const redirect = await prisma.redirect.create({
      data: { siteId: req.params.siteId, ...data },
    });
    res.status(201).json(redirect);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Redirect for this path already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create redirect' });
  }
});

router.delete('/redirects/:redirectId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.redirect.delete({ where: { id: req.params.redirectId } });
    res.json({ message: 'Redirect deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete redirect' });
  }
});

// Auto-generated sitemap.xml
router.get('/sitemap/:siteId', async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findUnique({
      where: { id: req.params.siteId },
      include: { pages: { where: { isPublished: true, noIndex: false }, orderBy: { order: 'asc' } } },
    });
    if (!site?.isLaunched || !site.domain) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const baseUrl = `https://${site.domain}`;
    const urls = site.pages.map(p => `
  <url>
    <loc>${baseUrl}/${p.slug}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <priority>${p.slug === '' || p.slug === 'home' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

    res.setHeader('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// Robots.txt
router.get('/robots/:siteId', async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
    if (!site?.domain) { res.status(404).send(''); return; }

    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://${site.domain}/sitemap.xml`);
  } catch (error) {
    res.status(500).send('');
  }
});

export default router;
