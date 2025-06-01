#!/usr/bin/env node

console.log('🚀 Azure Data Explorer Setup Guide');
console.log('=====================================\n');

console.log('✅ Step 1: Azure Data Explorer Cluster');
console.log('Your cluster is ready:');
console.log('   URI: https://msmonitoradx.israelcentral.kusto.windows.net');
console.log('   Location: Israel Central');
console.log('   Status: Running\n');

console.log('📊 Step 2: Create Database');
console.log('1. Go to: https://portal.azure.com');
console.log('2. Navigate to your "msmonitoradx" cluster');
console.log('3. Click "Databases" → "+ Add database"');
console.log('4. Name: "monitoringdb"');
console.log('5. Click "Create"\n');

console.log('🔐 Step 3: Azure AD App Registration');
console.log('1. Go to: https://portal.azure.com');
console.log('2. Search "Azure Active Directory"');
console.log('3. Click "App registrations" → "New registration"');
console.log('4. Name: "MS-Monitor-Dashboard"');
console.log('5. Account types: "Single tenant"');
console.log('6. Redirect URI: "SPA" → "http://localhost:5173"');
console.log('7. Click "Register"\n');

console.log('📝 Step 4: Copy These Values to .env');
console.log('From your app registration page:');
console.log('   • Application (client) ID → VITE_AZURE_CLIENT_ID');
console.log('   • Directory (tenant) ID → VITE_AZURE_TENANT_ID\n');

console.log('🔑 Step 5: Add API Permissions');
console.log('1. Go to "API permissions" in your app');
console.log('2. Click "Add a permission"');
console.log('3. Click "APIs my organization uses"');
console.log('4. Search "Azure Data Explorer"');
console.log('5. Select "user_impersonation"');
console.log('6. Click "Add permissions"');
console.log('7. Click "Grant admin consent"\n');

console.log('🎯 Step 6: Give Your App Access to Database');
console.log('1. Go to your Azure Data Explorer cluster');
console.log('2. Click "Permissions"');
console.log('3. Click "Add" → "Database user"');
console.log('4. Database: "monitoringdb"');
console.log('5. Add your email as database user\n');

console.log('🧪 Step 7: Test Connection');
console.log('Run: npm run test-azure\n');

console.log('🎉 Ready for Interview Demo!');
console.log('Your cluster info:');
console.log('   Subscription: Azure subscription 1');
console.log('   Resource Group: MSMonitorDemo');
console.log('   Cluster: msmonitoradx.israelcentral.kusto.windows.net');
