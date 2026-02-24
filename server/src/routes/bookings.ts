import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { createBookingSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

// Owner: get bookings
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { date, status, limit = '50', offset = '0' } = req.query;
    const where: any = { siteId: req.params.siteId };
    if (status) where.status = status;
    if (date) {
      const d = new Date(date as string);
      where.date = { gte: d, lt: new Date(d.getTime() + 86400000) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { date: 'asc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ bookings, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.put('/:bookingId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const booking = await prisma.booking.update({
      where: { id: req.params.bookingId },
      data: { status },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Schedule management
router.get('/schedule', authenticate, async (req: Request, res: Response) => {
  try {
    const schedule = await prisma.bookingSchedule.findUnique({ where: { siteId: req.params.siteId } });
    res.json(schedule?.schedule || {
      sunday: { open: '09:00', close: '18:00', enabled: true },
      monday: { open: '09:00', close: '18:00', enabled: true },
      tuesday: { open: '09:00', close: '18:00', enabled: true },
      wednesday: { open: '09:00', close: '18:00', enabled: true },
      thursday: { open: '09:00', close: '18:00', enabled: true },
      friday: { open: '09:00', close: '14:00', enabled: true },
      saturday: { open: '00:00', close: '00:00', enabled: false },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

router.put('/schedule', authenticate, async (req: Request, res: Response) => {
  try {
    const schedule = await prisma.bookingSchedule.upsert({
      where: { siteId: req.params.siteId },
      update: { schedule: req.body },
      create: { siteId: req.params.siteId, schedule: req.body },
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Public: create booking (from site visitor)
router.post('/public/:siteId', async (req: Request, res: Response) => {
  try {
    const data = validate(createBookingSchema, req.body);
    const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
    if (!site?.isLaunched) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    const booking = await prisma.booking.create({
      data: {
        siteId: req.params.siteId,
        ...data,
        date: new Date(data.date),
      },
    });

    res.status(201).json({ message: 'Booking created successfully', bookingId: booking.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Public: get available slots
router.get('/available/:siteId', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) { res.status(400).json({ error: 'date parameter required' }); return; }

    const d = new Date(date as string);
    const existing = await prisma.booking.findMany({
      where: {
        siteId: req.params.siteId,
        date: { gte: d, lt: new Date(d.getTime() + 86400000) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { time: true, duration: true },
    });

    const schedule = await prisma.bookingSchedule.findUnique({ where: { siteId: req.params.siteId } });
    res.json({ bookedSlots: existing, schedule: schedule?.schedule });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

export default router;
