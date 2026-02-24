import { Request, Response, NextFunction } from 'express';

type Plan = 'STARTER' | 'PRO' | 'PRO_PLUS';

const PLAN_HIERARCHY: Record<Plan, number> = {
  STARTER: 1,
  PRO: 2,
  PRO_PLUS: 3,
};

export function requirePlan(minimumPlan: Plan) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userPlan = (req.user?.plan || 'STARTER') as Plan;
    if (PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[minimumPlan]) {
      res.status(403).json({
        error: 'Plan upgrade required',
        requiredPlan: minimumPlan,
        currentPlan: userPlan,
      });
      return;
    }
    next();
  };
}

export const PLAN_LIMITS = {
  STARTER: {
    maxPages: 7,
    maxStorage: 5 * 1024 * 1024 * 1024,
    monthlyCredits: 5,
    maxLanguages: 1,
    maxDomains: 1,
    vibeDesign: false,
    customScripts: false,
    shopEnabled: false,
    apiAccess: false,
  },
  PRO: {
    maxPages: Infinity,
    maxStorage: 20 * 1024 * 1024 * 1024,
    monthlyCredits: 30,
    maxLanguages: 2,
    maxDomains: 1,
    vibeDesign: true,
    customScripts: false,
    shopEnabled: true,
    apiAccess: false,
  },
  PRO_PLUS: {
    maxPages: Infinity,
    maxStorage: 50 * 1024 * 1024 * 1024,
    monthlyCredits: 100,
    maxLanguages: Infinity,
    maxDomains: 2,
    vibeDesign: true,
    customScripts: true,
    shopEnabled: true,
    apiAccess: true,
  },
} as const;
