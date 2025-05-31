// Quick debug script to check pipeline data
console.log('=== PIPELINE DEBUG ===');

// Since we can't easily import TS, let's just create a simple test
const mockStatuses = ['healthy', 'warning', 'failed'];
const failedPipelines = mockStatuses.filter(s => s === 'failed' || s === 'warning');

console.log('Mock statuses:', mockStatuses);
console.log('Error statuses:', failedPipelines);
console.log('Should have error nodes:', failedPipelines.length > 0);

// Test random generation similar to the app
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
}

const sources = ['LinkedIn', 'Twitter', 'Office365', 'AzureAD', 'GitHub'];
console.log('Testing status generation for sources:');

sources.forEach(source => {
  const statusSeed = seededRandom(`${source}-status`);
  const statusOptions = ['healthy', 'warning', 'failed'];
  const status = statusOptions[Math.floor(statusSeed * statusOptions.length)];
  console.log(`${source}: ${status} (seed: ${statusSeed})`);
});

console.log('=== DEBUG COMPLETE ===');
