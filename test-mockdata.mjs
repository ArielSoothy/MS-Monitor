// Test script to verify mock data generation
import { mockPipelines, mockAlerts } from './src/data/mockData.js';

console.log('=== Enhanced Mock Data Test ===\n');

console.log(`Total pipelines generated: ${mockPipelines.length}`);
console.log(`Total alerts generated: ${mockAlerts.length}\n`);

console.log('Sample pipeline names (showing new naming convention):');
mockPipelines.slice(0, 15).forEach(p => {
  console.log(`- ${p.name}`);
  console.log(`  Status: ${p.status}, Team: ${p.ownerTeam}, SLA: ${p.slaRequirement}min`);
  console.log(`  Classification: ${p.dataClassification}, Region: ${p.region}`);
  if (p.lastFailureReason) {
    console.log(`  Last Failure: ${p.lastFailureReason}`);
  }
  console.log();
});

console.log('Status Distribution:');
const statusCounts = mockPipelines.reduce((acc, p) => { 
  acc[p.status] = (acc[p.status] || 0) + 1; 
  return acc; 
}, {});
Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`  ${status}: ${count} (${((count / mockPipelines.length) * 100).toFixed(1)}%)`);
});

console.log('\nSource Distribution:');
const sourceCounts = mockPipelines.reduce((acc, p) => { 
  acc[p.source] = (acc[p.source] || 0) + 1; 
  return acc; 
}, {});
Object.entries(sourceCounts).forEach(([source, count]) => {
  console.log(`  ${source}: ${count} pipelines`);
});

console.log('\nTeam Distribution:');
const teamCounts = mockPipelines.reduce((acc, p) => { 
  acc[p.ownerTeam] = (acc[p.ownerTeam] || 0) + 1; 
  return acc; 
}, {});
Object.entries(teamCounts).forEach(([team, count]) => {
  console.log(`  ${team}: ${count} pipelines`);
});

console.log('\nDependency Examples:');
const pipelinesWithDeps = mockPipelines.filter(p => p.dependsOn && p.dependsOn.length > 0);
console.log(`Pipelines with dependencies: ${pipelinesWithDeps.length}`);
pipelinesWithDeps.slice(0, 5).forEach(p => {
  const deps = p.dependsOn.map(id => {
    const dep = mockPipelines.find(dp => dp.id === id);
    return dep ? dep.name : id;
  });
  console.log(`  ${p.name} depends on: ${deps.join(', ')}`);
});

console.log('\nFailure Reason Examples:');
const failedPipelines = mockPipelines.filter(p => p.lastFailureReason);
failedPipelines.slice(0, 5).forEach(p => {
  console.log(`  ${p.name}: ${p.lastFailureReason}`);
});
