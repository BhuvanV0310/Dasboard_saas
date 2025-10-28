/**
 * Environment variable validation and loading
 * Run at app startup to ensure all required secrets are present
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
] as const;

// Additional variables that are required only in production
const requiredInProduction = [
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SENTRY_DSN',
] as const;

const optionalEnvVars = [
  'OPENAI_API_KEY',
  'HF_ACCESS_TOKEN',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
] as const;

export function validateEnv() {
  const missing: string[] = [];
  const warnings: string[] = [];
  const prodMissing: string[] = [];

  // Check required vars
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Extra required vars in production
  if (process.env.NODE_ENV === 'production') {
    for (const envVar of requiredInProduction) {
      if (!process.env[envVar]) {
        prodMissing.push(envVar);
      }
    }
  }

  // Check optional vars (warn only)
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\nPlease check your .env file.`
    );
  }

  if (prodMissing.length > 0) {
    throw new Error(
      `Missing required production environment variables:\n${prodMissing.join('\n')}\n\nSet these in your hosting provider (e.g., Vercel) before deploying.`
    );
  }

  if (warnings.length > 0) {
    const msg = `⚠️  Missing optional environment variables (some features may be limited):\n${warnings.join('\n')}`;
    if (process.env.NODE_ENV === 'production') {
      console.warn(msg);
    } else {
      // In development, provide a friendlier hint
      console.info(msg);
    }
  }

  // Validate URL formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  if (process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
    if (!process.env.NEXTAUTH_URL.startsWith('https://')) {
      throw new Error('NEXTAUTH_URL must use HTTPS in production');
    }
  }

  console.log('✓ Environment variables validated');
}

// Auto-validate in non-test environments
if (process.env.NODE_ENV !== 'test') {
  validateEnv();
}
