import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const UPLOAD_DIR = path.resolve('uploads');

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

router.post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const url = `/uploads/${req.file.filename}`;
    const mediaFile = await prisma.mediaFile.create({
      data: {
        userId: req.user!.userId,
        siteId: req.body.siteId || null,
        filename: req.file.originalname,
        url,
        mimeType: req.file.mimetype,
        size: req.file.size,
        alt: req.body.alt || '',
      },
    });

    res.status(201).json(mediaFile);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { siteId } = req.query;
    const where: any = { userId: req.user!.userId };
    if (siteId) where.siteId = siteId;

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media files' });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const file = await prisma.mediaFile.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
    });
    if (!file) { res.status(404).json({ error: 'File not found' }); return; }

    try {
      await fs.unlink(path.join(UPLOAD_DIR, path.basename(file.url)));
    } catch {}

    await prisma.mediaFile.delete({ where: { id: file.id } });
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
