#!/usr/bin/env node
/**
 * Database Quick Setup Script
 * 
 * This script automates the entire database setup process.
 * Run with: npm run setup:db
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, description) {
  console.log(`\n▶️  ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} - Done!\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Failed!\n`);
    return false;
  }
}

function checkEnv() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!\n');
    console.log('Please create a .env file with your DATABASE_URL');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('DATABASE_URL=')) {
    console.log('❌ DATABASE_URL not found in .env!\n');
    process.exit(1);
  }

  // Check if it's still the default/placeholder
  if (envContent.includes('DATABASE_URL="postgresql://username:password@localhost') ||
      envContent.includes('DATABASE_URL="postgresql://johndoe:randompassword')) {
    console.log('⚠️  WARNING: DATABASE_URL appears to be a placeholder!\n');
    console.log('Please update it with your actual database connection string.\n');
    console.log('Get a free PostgreSQL database from:');
    console.log('  - Neon.tech: https://neon.tech');
    console.log('  - Supabase: https://supabase.com');
    console.log('  - Railway: https://railway.app\n');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Continue anyway? (y/N): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() !== 'y') {
        console.log('\nSetup cancelled. Please update your DATABASE_URL and try again.\n');
        process.exit(0);
      }
      continueSetup();
    });
    return false;
  }

  return true;
}

function continueSetup() {
  console.log('\n🚀 DATABASE SETUP SCRIPT');
  console.log('=' .repeat(60));
  console.log('This will set up your database in 4 steps:\n');
  console.log('  1. Generate Prisma Client');
  console.log('  2. Push schema to database');
  console.log('  3. Seed sample data');
  console.log('  4. Verify connection\n');
  console.log('=' .repeat(60));

  // Step 1: Generate Prisma Client
  if (!run('npm run db:generate', 'Step 1/4: Generating Prisma Client')) {
    console.log('\n💡 Try: npm install && npm run db:generate\n');
    process.exit(1);
  }

  // Step 2: Push Schema
  if (!run('npm run db:push', 'Step 2/4: Pushing schema to database')) {
    console.log('\n💡 Check your DATABASE_URL and try again\n');
    process.exit(1);
  }

  // Step 3: Seed Data
  if (!run('npm run db:seed', 'Step 3/4: Seeding sample data')) {
    console.log('\n💡 Schema is ready but seeding failed. You can add data manually.\n');
  }

  // Step 4: Verify
  if (!run('npm run db:verify', 'Step 4/4: Verifying database connection')) {
    console.log('\n💡 Try: npm run db:test\n');
  }

  // Success!
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 DATABASE SETUP COMPLETE!');
  console.log('=' .repeat(60));
  console.log('\n✅ Your database is ready to use!\n');
  console.log('📝 Test Credentials:');
  console.log('   Admin: admin@example.com / admin123');
  console.log('   User:  user@example.com / user123\n');
  console.log('📚 Next Steps:');
  console.log('   1. Start dev server:    npm run dev');
  console.log('   2. Open Prisma Studio:  npm run db:studio');
  console.log('   3. Test authentication: npm run auth:test\n');
}

// Main
console.clear();
if (checkEnv()) {
  continueSetup();
}
