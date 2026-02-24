import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { createProductSchema, updateProductSchema, validate } from '../utils/validation.js';

const router = Router({ mergeParams: true });

// Products
router.get('/products', authenticate, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { siteId: req.params.siteId },
      orderBy: { order: 'asc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(createProductSchema, req.body);
    const count = await prisma.product.count({ where: { siteId: req.params.siteId } });
    const product = await prisma.product.create({
      data: { siteId: req.params.siteId, ...data, order: count },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    const data = validate(updateProductSchema, req.body);
    const product = await prisma.product.update({
      where: { id: req.params.productId },
      data,
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:productId', authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.productId } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Public: product catalog
router.get('/catalog/:siteId', async (req: Request, res: Response) => {
  try {
    const site = await prisma.site.findUnique({ where: { id: req.params.siteId } });
    if (!site?.isLaunched) { res.status(404).json({ error: 'Site not found' }); return; }

    const { category } = req.query;
    const where: any = { siteId: req.params.siteId, isActive: true };
    if (category) where.category = category;

    const products = await prisma.product.findMany({ where, orderBy: { order: 'asc' } });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Orders
router.get('/orders', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    const where: any = { siteId: req.params.siteId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ orders, total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/orders/:orderId/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.orderId },
      data: { status },
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Public: create order (from site visitor)
router.post('/checkout/:siteId', async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, customerPhone, items, shippingAddress } = req.body;
    if (!items?.length) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, siteId: req.params.siteId, isActive: true },
    });

    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
      };
    });

    const subtotal = orderItems.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

    const order = await prisma.order.create({
      data: {
        siteId: req.params.siteId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        shippingAddress,
        subtotal,
        total: subtotal,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

export default router;
