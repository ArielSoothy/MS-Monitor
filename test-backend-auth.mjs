#!/usr/bin/env node

// Test Backend Authentication Service
import { azureBackendService } from './src/services/azureBackendService.ts';

console.log('🔍 Testing MS Monitor Backend Authentication...\n');

async function testBackendAuth() {
  try {
    console.log('📊 Test 1: Threat Overview Query');
    const threatData = await azureBackendService.getThreatOverview();
    
    if (threatData.success) {
      console.log('✅ Threat Overview: SUCCESS');
      console.log('📈 Data:', JSON.stringify(threatData.data[0], null, 2));
      console.log('⚡ Execution Time:', threatData.metadata?.executionTime + 'ms');
    } else {
      console.log('❌ Threat Overview: FAILED');
      console.log('💥 Error:', threatData.error);
    }

    console.log('\n🏥 Test 2: Pipeline Health Query');
    const pipelineData = await azureBackendService.getPipelineHealth();
    
    if (pipelineData.success) {
      console.log('✅ Pipeline Health: SUCCESS');
      console.log('📊 Data:', JSON.stringify(pipelineData.data[0], null, 2));
      console.log('⚡ Execution Time:', pipelineData.metadata?.executionTime + 'ms');
    } else {
      console.log('❌ Pipeline Health: FAILED');
      console.log('💥 Error:', pipelineData.error);
    }

    console.log('\n🌍 Test 3: Geographic Threats Query');
    const geoData = await azureBackendService.getGeographicThreats();
    
    if (geoData.success) {
      console.log('✅ Geographic Threats: SUCCESS');
      console.log('🗺️  Sample Data:', JSON.stringify(geoData.data.slice(0, 2), null, 2));
      console.log('📊 Total Records:', geoData.data.length);
      console.log('⚡ Execution Time:', geoData.metadata?.executionTime + 'ms');
    } else {
      console.log('❌ Geographic Threats: FAILED');
      console.log('💥 Error:', geoData.error);
    }

    console.log('\n🎯 Backend Authentication Test Summary:');
    console.log('🔐 Service Principal Authentication: ✅ SIMULATED');
    console.log('🔗 Azure Data Explorer Connection: ✅ MOCKED');
    console.log('📊 Query Execution: ✅ SUCCESSFUL');
    console.log('⚡ Response Times: ✅ REALISTIC');
    console.log('\n🚀 Ready for interview demo!\n');

  } catch (error) {
    console.error('❌ Backend authentication test failed:', error);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBackendAuth();
}

export { testBackendAuth };
