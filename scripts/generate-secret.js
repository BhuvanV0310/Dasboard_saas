#!/usr/bin/env node
/**
 * Generate Secure NextAuth Secret
 * 
 * This script generates a cryptographically secure random string
 * to use as NEXTAUTH_SECRET in your .env file.
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

console.log('\n🔐 NEXTAUTH SECRET GENERATOR\n');
console.log('=' .repeat(60));
console.log('');

const secret = generateSecret(32);

console.log('Your new NEXTAUTH_SECRET:');
console.log('');
console.log(`NEXTAUTH_SECRET="${secret}"`);
console.log('');
console.log('=' .repeat(60));
console.log('');
console.log('📋 Instructions:');
console.log('');
console.log('1. Copy the line above');
console.log('2. Open your .env file');
console.log('3. Replace the existing NEXTAUTH_SECRET line');
console.log('4. Save the file');
console.log('5. Restart your development server');
console.log('');
console.log('⚠️  Important:');
console.log('   - Keep this secret secure');
console.log('   - Never commit .env to Git');
console.log('   - Use different secrets for dev/staging/production');
console.log('');
