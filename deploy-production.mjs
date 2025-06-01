#!/usr/bin/env node

/**
 * Production Deployment Script for MS Monitor Dashboard
 * This script helps prepare and deploy the application to GitHub Pages
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 MS Monitor Dashboard - Production Deployment');
console.log('================================================\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: Must be run from the project root directory');
  process.exit(1);
}

// Check if required files exist
const requiredFiles = [
  '.env.production',
  'vite.config.ts',
  'src/config/azure.ts'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    process.exit(1);
  }
}

console.log('\n🔧 Checking environment configuration...');
try {
  const envProduction = fs.readFileSync('.env.production', 'utf8');
  const hasAzureConfig = envProduction.includes('VITE_AZURE_TENANT_ID') && 
                        envProduction.includes('VITE_AZURE_CLIENT_ID');
  
  if (hasAzureConfig) {
    console.log('✅ Azure configuration found in .env.production');
  } else {
    console.log('⚠️  Warning: Azure configuration incomplete in .env.production');
  }
} catch (error) {
  console.log('❌ Error reading .env.production');
  process.exit(1);
}

console.log('\n🏗️  Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.log('❌ Build failed');
  process.exit(1);
}

console.log('\n📦 Checking build output...');
if (fs.existsSync('dist/index.html')) {
  console.log('✅ Build artifacts created');
  
  // Check file sizes
  const stats = fs.statSync('dist/index.html');
  console.log(`📊 index.html: ${(stats.size / 1024).toFixed(1)} KB`);
  
  // List asset files
  const assetsDir = 'dist/assets';
  if (fs.existsSync(assetsDir)) {
    const assets = fs.readdirSync(assetsDir);
    console.log(`📦 Generated ${assets.length} asset files`);
  }
} else {
  console.log('❌ Build output not found');
  process.exit(1);
}

console.log('\n🔑 Deployment Checklist:');
console.log('========================');
console.log('1. ✅ Build completed successfully');
console.log('2. 📋 Azure AD App Registration:');
console.log('   - Add redirect URI: https://arielsoothy.github.io/MS-Monitor/');
console.log('   - Platform: Single-page application (SPA)');
console.log('   - Enable Access tokens and ID tokens');
console.log('   - Grant admin consent for API permissions');
console.log('');
console.log('3. 🔧 GitHub Secrets (add these to your repository):');
console.log('   - VITE_AZURE_TENANT_ID');
console.log('   - VITE_AZURE_CLIENT_ID');
console.log('   - VITE_AZURE_CLUSTER');
console.log('   - VITE_AZURE_DATABASE');
console.log('');
console.log('4. 🚀 Deploy to GitHub Pages:');
console.log('   - Push to main branch to trigger deployment');
console.log('   - Or run: git add . && git commit -m "Deploy to production" && git push');
console.log('');
console.log('5. 🧪 Test Production:');
console.log('   - Visit: https://arielsoothy.github.io/MS-Monitor/');
console.log('   - Test Azure authentication flow');
console.log('   - Verify live data loading');
console.log('');

console.log('📖 For detailed setup instructions, see:');
console.log('   - AZURE_PRODUCTION_SETUP.md');
console.log('   - PRODUCTION_DEPLOYMENT_GUIDE.md');
console.log('');

console.log('✨ Ready for production deployment!');
console.log('   Production URL: https://arielsoothy.github.io/MS-Monitor/');
console.log('');
