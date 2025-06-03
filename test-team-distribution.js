// Quick test to verify team distribution logic
console.log('=== TESTING TEAM DISTRIBUTION ===');

// Simulate the improved team assignment logic
const mockConfigs = [
  { source: 'LinkedIn', teams: ['Team A', 'Team B', 'Team C'] },
  { source: 'Twitter', teams: ['Team D', 'Team E'] }
];

const mockDataTypes = ['Type1', 'Type2'];
const mockProcesses = ['Process1', 'Process2'];
const mockRegions = ['US', 'EU'];

const teamAssignmentCounters = {};

mockConfigs.forEach((config, configIndex) => {
  mockDataTypes.forEach((dataType, dataTypeIndex) => {
    mockProcesses.forEach((process, processIndex) => {
      mockRegions.forEach((region, regionIndex) => {
        // Use the same logic as our fix
        const teamIndex = (configIndex + dataTypeIndex + processIndex + regionIndex) % config.teams.length;
        const team = config.teams[teamIndex];
        
        if (!teamAssignmentCounters[team]) {
          teamAssignmentCounters[team] = 0;
        }
        teamAssignmentCounters[team]++;
        
        console.log(`Pipeline ${config.source}_${dataType}_${process}_${region} assigned to ${team}`);
      });
    });
  });
});

console.log('\n📊 Final Team Distribution:', teamAssignmentCounters);
console.log(`👥 Teams with 2+ pipelines: ${Object.entries(teamAssignmentCounters).filter(([_, count]) => count >= 2).length}`);

console.log('=== TEST COMPLETE ===');
