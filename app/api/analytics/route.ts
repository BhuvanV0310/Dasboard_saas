import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  // Auth: Only allow admin
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Subscription Insights
  const plansSold = await prisma.payment.count({ where: { status: 'COMPLETED' } });
  const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } });
  const activeSubscriptions = await prisma.user.count({ where: { activePlanId: { not: null } } });

  // User Growth
  const totalUsers = await prisma.user.count();
  const signupsByWeek = await prisma.user.groupBy({
    by: ['createdAt'],
    _count: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  const roleCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  });

  // Branch / Upload Performance (use recent uploads as branches)
  const topBranches = await prisma.csvUpload.findMany({
    take: 5,
    orderBy: { uploadedAt: 'desc' },
    select: { id: true, filename: true, uploadedAt: true, status: true },
  });
  const branchSentiment = await prisma.review.groupBy({
    by: ['branchId', 'sentimentLabel'],
    _avg: { sentimentScore: true },
    _count: { id: true },
  });

  // Sentiment Overview
  const sentimentCounts = await prisma.review.groupBy({
    by: ['sentimentLabel'],
    _count: { id: true },
    _avg: { aiConfidence: true },
  });

  // Payments Overview
  const paymentStatusCounts = await prisma.payment.groupBy({
    by: ['status'],
    _count: { id: true },
  });
  const mrr = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: 'COMPLETED' },
  });

  return NextResponse.json({
    plansSold,
    totalRevenue: totalRevenue._sum.amount || 0,
    activeSubscriptions,
    totalUsers,
    signupsByWeek,
    roleCounts,
    topBranches,
    branchSentiment,
    sentimentCounts,
    paymentStatusCounts,
    mrr: mrr._sum.amount || 0,
  });
}
