import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

interface TokenUser {
  id: string;
  email: string;
  role: string;
  plan: string;
}

export function generateAccessToken(user: TokenUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, plan: user.plan },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

export async function generateRefreshToken(user: TokenUser): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return token;
}

export async function verifyRefreshToken(token: string) {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await prisma.refreshToken.delete({ where: { id: record.id } });
    }
    return null;
  }
  return record;
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function revokeAllUserTokens(userId: string) {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
