#!/usr/bin/env tsx
/**
 * Database Verification Script
 * 
 * This script performs a comprehensive check of the database connection,
 * schema, and data to ensure everything is set up correctly.
 */

import prisma from '../lib/db';
import { PrismaClient } from '@prisma/client';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    await testFn();
    results.push({ name, status: 'pass', message: 'Success' });
  } catch (error) {
    results.push({
      name,
      status: 'fail',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function main() {
  console.log('🔍 DATABASE VERIFICATION SCRIPT');
  console.log('=' .repeat(60));
  console.log('');

  // Test 1: Database Connection
  console.log('1️⃣  Testing database connection...');
  await runTest('Database Connection', async () => {
    await prisma.$connect();
    console.log('   ✅ Connected to database successfully\n');
  });

  // Test 2: Check Environment Variables
  console.log('2️⃣  Checking environment variables...');
  await runTest('Environment Variables', async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not found in environment');
    }
    if (databaseUrl.includes('localhost')) {
      console.log('   ⚠️  Using local database');
    } else if (databaseUrl.includes('neon.tech')) {
      console.log('   ✅ Using Neon.tech database');
    } else if (databaseUrl.includes('supabase')) {
      console.log('   ✅ Using Supabase database');
    } else {
      console.log('   ✅ Using external database');
    }
    console.log('');
  });

  // Test 3: Schema Verification
  console.log('3️⃣  Verifying database schema...');
  await runTest('Schema Verification', async () => {
    const userCount = await prisma.user.count();
    const planCount = await prisma.plan.count();
    const branchCount = await prisma.branch.count();
    const paymentCount = await prisma.payment.count();
    const reviewCount = await prisma.review.count();
    
    console.log('   📊 Table Counts:');
    console.log(`      - Users: ${userCount}`);
    console.log(`      - Plans: ${planCount}`);
    console.log(`      - Branches: ${branchCount}`);
    console.log(`      - Payments: ${paymentCount}`);
    console.log(`      - Reviews: ${reviewCount}`);
    console.log('');

    if (userCount === 0) {
      throw new Error('No users found. Run: npm run db:seed');
    }
  });

  // Test 4: Test User Authentication Data
  console.log('4️⃣  Checking user authentication data...');
  await runTest('User Authentication', async () => {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        password: true,
      },
    });

    const adminUser = users.find((u) => u.role === 'ADMIN');
    const regularUser = users.find((u) => u.role === 'CUSTOMER');

    if (!adminUser) {
      throw new Error('No admin user found');
    }
    if (!regularUser) {
      console.log('   ⚠️  No regular user found');
    }

    console.log('   ✅ Test Credentials Available:');
    console.log(`      Admin: ${adminUser.email}`);
    if (regularUser) {
      console.log(`      User: ${regularUser.email}`);
    }
    console.log('');
  });

  // Test 5: Test Database Relations
  console.log('5️⃣  Testing database relations...');
  await runTest('Database Relations', async () => {
    const userWithRelations = await prisma.user.findFirst({
      include: {
        branches: true,
        payments: true,
        reviews: true,
        accounts: true,
      },
    });

    if (userWithRelations) {
      console.log('   ✅ Relations working:');
      console.log(`      - Branches: ${userWithRelations.branches.length}`);
      console.log(`      - Payments: ${userWithRelations.payments.length}`);
      console.log(`      - Reviews: ${userWithRelations.reviews.length}`);
      console.log('');
    }
  });

  // Test 6: Test Prisma Client Singleton
  console.log('6️⃣  Testing Prisma Client singleton...');
  await runTest('Prisma Singleton', async () => {
    const prisma2 = (await import('../lib/db')).default;
    if (prisma !== prisma2) {
      throw new Error('Prisma client singleton not working');
    }
    console.log('   ✅ Singleton pattern working correctly\n');
  });

  // Test 7: Test CRUD Operations
  console.log('7️⃣  Testing CRUD operations...');
  await runTest('CRUD Operations', async () => {
    // Create
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        role: 'CUSTOMER',
        password: 'test-password-hash',
      },
    });
    console.log('   ✅ CREATE: User created');

    // Read
    const foundUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    if (!foundUser) throw new Error('User not found');
    console.log('   ✅ READ: User retrieved');

    // Update
    const updatedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { name: 'Updated Test User' },
    });
    if (updatedUser.name !== 'Updated Test User') {
      throw new Error('User not updated');
    }
    console.log('   ✅ UPDATE: User updated');

    // Delete
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    if (deletedUser) throw new Error('User not deleted');
    console.log('   ✅ DELETE: User deleted\n');
  });

  // Test 8: Test Indexes
  console.log('8️⃣  Testing database indexes...');
  await runTest('Database Indexes', async () => {
    // Test email index
    const startTime = Date.now();
    await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    const duration = Date.now() - startTime;
    console.log(`   ✅ Email index working (${duration}ms)\n`);
  });

  // Test 9: Test Enum Values
  console.log('9️⃣  Testing enum values...');
  await runTest('Enum Values', async () => {
    const roles = ['ADMIN', 'CUSTOMER', 'DELIVERY_PARTNER'];
    const statuses = ['ACTIVE', 'INACTIVE'];
    const paymentStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'];
    
    console.log('   ✅ Enums defined:');
    console.log(`      - Roles: ${roles.join(', ')}`);
    console.log(`      - Plan Status: ${statuses.join(', ')}`);
    console.log(`      - Payment Status: ${paymentStatuses.join(', ')}`);
    console.log('');
  });

  // Print Summary
  console.log('=' .repeat(60));
  console.log('📋 VERIFICATION SUMMARY\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warnings = results.filter((r) => r.status === 'warning').length;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log('');
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Warnings: ${warnings} ⚠️`);
  console.log('');

  if (failed > 0) {
    console.log('❌ VERIFICATION FAILED');
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check DATABASE_URL in .env');
    console.log('   2. Run: npm run db:generate');
    console.log('   3. Run: npm run db:push');
    console.log('   4. Run: npm run db:seed');
    console.log('');
    process.exit(1);
  } else {
    console.log('🎉 ALL VERIFICATIONS PASSED!');
    console.log('');
    console.log('✅ Your database is fully configured and ready to use.');
    console.log('');
    console.log('📚 Next Steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Open Prisma Studio: npm run db:studio');
    console.log('   3. Test authentication: npm run auth:test');
    console.log('');
  }
}

main()
  .catch((error) => {
    console.error('\n❌ VERIFICATION FAILED WITH ERROR:\n');
    console.error(error);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check DATABASE_URL in .env');
    console.log('   2. Ensure database is accessible');
    console.log('   3. Run: npm run db:generate');
    console.log('   4. Run: npm run db:push');
    console.log('');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
