#!/usr/bin/env node

/**
 * Test Azure Data Explorer Connection
 * Run this script to verify your ADX cluster is accessible
 */

import axios from 'axios';

const config = {
  cluster: 'msmonitoradx.israelcentral.kusto.windows.net',
  database: 'monitoringdb',
  endpoint: 'https://msmonitoradx.israelcentral.kusto.windows.net/v1/rest/query'
};

async function testConnection() {
  console.log('🔍 Testing Azure Data Explorer connection...');
  console.log(`📍 Cluster: ${config.cluster}`);
  console.log(`📊 Database: ${config.database}`);
  console.log('');

  try {
    // Test 1: Simple connection test
    console.log('📡 Test 1: Basic connectivity...');
    const testQuery = 'print "Connection Test Successful"';
    
    const response = await axios.post(config.endpoint, {
      db: config.database,
      csl: testQuery
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (response.data?.Tables?.[0]?.Rows?.[0]?.[0] === 'Connection Test Successful') {
      console.log('✅ Basic connection: SUCCESS');
    } else {
      console.log('⚠️  Basic connection: UNEXPECTED RESPONSE');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.log('❌ Basic connection: FAILED');
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        console.log('🔧 DNS Resolution failed - cluster name may be incorrect');
      } else if (error.response?.status === 401) {
        console.log('🔐 Authentication failed - need Azure AD setup');
      } else if (error.response?.status === 403) {
        console.log('🚫 Access denied - check permissions');
      } else if (error.response?.status === 0) {
        console.log('🌐 CORS error - browser security restriction');
      } else {
        console.log(`🔴 HTTP ${error.response?.status}: ${error.response?.statusText}`);
      }
    } else {
      console.log('🔴 Unknown error:', error.message);
    }
    
    return false;
  }

  try {
    // Test 2: Check tables exist
    console.log('');
    console.log('📊 Test 2: Checking database tables...');
    
    const tablesQuery = 'show tables';
    const tablesResponse = await axios.post(config.endpoint, {
      db: config.database,
      csl: tablesQuery
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    const tables = tablesResponse.data?.Tables?.[0]?.Rows?.map(row => row[0]) || [];
    console.log(`✅ Found ${tables.length} tables:`, tables.join(', '));

    // Test 3: Check data in key tables
    console.log('');
    console.log('📈 Test 3: Checking table data...');
    
    const requiredTables = ['SecurityEvents', 'ThreatIndicators', 'PipelineHealth'];
    
    for (const table of requiredTables) {
      if (tables.includes(table)) {
        try {
          const countQuery = `${table} | count`;
          const countResponse = await axios.post(config.endpoint, {
            db: config.database,
            csl: countQuery
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            timeout: 10000
          });
          
          const count = countResponse.data?.Tables?.[0]?.Rows?.[0]?.[0] || 0;
          console.log(`  📋 ${table}: ${count} records`);
        } catch (err) {
          console.log(`  ❌ ${table}: Query failed`);
        }
      } else {
        console.log(`  ⚠️  ${table}: Table not found`);
      }
    }

  } catch (error) {
    console.log('❌ Table check failed:', error.message);
  }

  console.log('');
  console.log('🎯 Connection test completed!');
  console.log('');
  console.log('💡 Next steps:');
  console.log('   1. If connection failed: Check cluster name and network connectivity');
  console.log('   2. If tables missing: Run phase1-create-tables.kql');
  console.log('   3. If no data: Run phase2-insert-data.kql');
  console.log('   4. For authentication: Set up Azure AD app registration');
  
  return true;
}

// Run the test
testConnection().catch(console.error);
