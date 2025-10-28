import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';

/**
 * Health check endpoint
 * Tests critical system components:
 * - Database connectivity
 * - Prisma queries
 * - Upload history access
 * Returns JSON with status of each check and overall health
 */

interface HealthCheckResult {
  service: string;
  status: 'ok' | 'error';
  message?: string;
  latency?: number;
}

export async function GET() {
  const checks: HealthCheckResult[] = [];
  let overallOk = true;

  // 1. Database connection check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;
    
    checks.push({
      service: 'database',
      status: 'ok',
      message: 'Database connection successful',
      latency: dbLatency,
    });
    logInfo('Health check: database OK', { latency: dbLatency });
  } catch (error) {
    overallOk = false;
    checks.push({
      service: 'database',
      status: 'error',
      message: error instanceof Error ? error.message : 'Database connection failed',
    });
    logError(error instanceof Error ? error : String(error), { service: 'health-check', check: 'database' });
  }

  // 2. Prisma query check (uploads table)
  try {
    const uploadsStart = Date.now();
    const uploadCount = await prisma.csvUpload.count();
    const uploadsLatency = Date.now() - uploadsStart;
    
    checks.push({
      service: 'uploads',
      status: 'ok',
      message: `Uploads table accessible (${uploadCount} records)`,
      latency: uploadsLatency,
    });
    logInfo('Health check: uploads OK', { count: uploadCount, latency: uploadsLatency });
  } catch (error) {
    overallOk = false;
    checks.push({
      service: 'uploads',
      status: 'error',
      message: error instanceof Error ? error.message : 'Uploads table query failed',
    });
    logError(error instanceof Error ? error : String(error), { service: 'health-check', check: 'uploads' });
  }

  // 3. User authentication table check
  try {
    const usersStart = Date.now();
    const userCount = await prisma.user.count();
    const usersLatency = Date.now() - usersStart;
    
    checks.push({
      service: 'auth',
      status: 'ok',
      message: `User table accessible (${userCount} users)`,
      latency: usersLatency,
    });
    logInfo('Health check: auth OK', { count: userCount, latency: usersLatency });
  } catch (error) {
    overallOk = false;
    checks.push({
      service: 'auth',
      status: 'error',
      message: error instanceof Error ? error.message : 'Auth table query failed',
    });
    logError(error instanceof Error ? error : String(error), { service: 'health-check', check: 'auth' });
  }

  // 4. Payment/Stripe integration check
  try {
    const paymentsStart = Date.now();
    const paymentCount = await prisma.payment.count();
    const paymentsLatency = Date.now() - paymentsStart;
    
    checks.push({
      service: 'payments',
      status: 'ok',
      message: `Payments table accessible (${paymentCount} records)`,
      latency: paymentsLatency,
    });
    logInfo('Health check: payments OK', { count: paymentCount, latency: paymentsLatency });
  } catch (error) {
    overallOk = false;
    checks.push({
      service: 'payments',
      status: 'error',
      message: error instanceof Error ? error.message : 'Payments table query failed',
    });
    logError(error instanceof Error ? error : String(error), { service: 'health-check', check: 'payments' });
  }

  // 5. AI service availability check
  try {
    const openaiKeyPresent = !!process.env.OPENAI_API_KEY;
    
    if (openaiKeyPresent) {
      checks.push({
        service: 'ai',
        status: 'ok',
        message: 'OpenAI API key configured',
      });
    } else {
      checks.push({
        service: 'ai',
        status: 'ok',
        message: 'AI service in fallback mode (no API key)',
      });
    }
    logInfo('Health check: AI OK', { apiKeyPresent: openaiKeyPresent });
  } catch (error) {
    // AI service is optional, so don't fail overall health
    checks.push({
      service: 'ai',
      status: 'ok',
      message: 'AI service check skipped',
    });
  }

  // 6. Environment validation check
  try {
    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);
    
    if (missingVars.length === 0) {
      checks.push({
        service: 'environment',
        status: 'ok',
        message: 'All required environment variables present',
      });
    } else {
      overallOk = false;
      checks.push({
        service: 'environment',
        status: 'error',
        message: `Missing environment variables: ${missingVars.join(', ')}`,
      });
    }
  } catch (error) {
    overallOk = false;
    checks.push({
      service: 'environment',
      status: 'error',
      message: 'Environment validation failed',
    });
  }

  // Calculate total latency
  const totalLatency = checks.reduce((sum, check) => sum + (check.latency || 0), 0);

  const response = {
    ok: overallOk,
    timestamp: new Date().toISOString(),
    checks,
    summary: {
      total: checks.length,
      passed: checks.filter(c => c.status === 'ok').length,
      failed: checks.filter(c => c.status === 'error').length,
      totalLatency,
    },
  };

  logInfo('Health check completed', { 
    ok: overallOk, 
    passed: response.summary.passed, 
    failed: response.summary.failed,
    totalLatency,
  });

  return NextResponse.json(response, {
    status: overallOk ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
