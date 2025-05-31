// Mock Training Data Generator for Pipeline Health Prediction
import { HistoricalRecord, Pipeline } from '../types';

export class MockDataGenerator {
  // Generate realistic historical training data
  static generateHistoricalData(pipelines: Pipeline[], recordCount = 1000): HistoricalRecord[] {
    const records: HistoricalRecord[] = [];
    
    for (let i = 0; i < recordCount; i++) {
      const pipeline = pipelines[Math.floor(Math.random() * pipelines.length)];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      const dayOfWeek = timestamp.getDay();
      const hourOfDay = timestamp.getHours();
      
      // Base features with realistic patterns
      const hoursSinceLastRun = Math.random() * 12; // 0-12 hours
      const avgFailureRate = pipeline.failureRate + (Math.random() - 0.5) * 10; // Vary around current rate
      const dataVolumeVariance = Math.random() * 100; // 0-100% variance
      
      // Realistic failure patterns
      let failureProbability = 0.1; // Base 10% failure rate
      
      // Monday morning failures (common in real systems after weekend maintenance)
      if (dayOfWeek === 1 && hourOfDay >= 7 && hourOfDay <= 10) {
        failureProbability += 0.3;
      }
      
      // End-of-day volume spikes
      if (hourOfDay >= 17 && hourOfDay <= 19) {
        failureProbability += dataVolumeVariance * 0.002; // Higher variance = higher failure chance
      }
      
      // Higher failure rate if not run recently
      if (hoursSinceLastRun > 6) {
        failureProbability += 0.2;
      }
      
      // Higher failure rate based on historical failure rate
      failureProbability += avgFailureRate * 0.01;
      
      // Weekend patterns (less monitoring, more failures)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        failureProbability += 0.15;
      }
      
      // Night time issues (less monitoring)
      if (hourOfDay >= 23 || hourOfDay <= 5) {
        failureProbability += 0.1;
      }
      
      // Add some noise to make it realistic (not 100% predictable)
      failureProbability += (Math.random() - 0.5) * 0.2;
      
      // Clamp between 0 and 1
      failureProbability = Math.max(0, Math.min(1, failureProbability));
      
      const willFailInNext2Hours = Math.random() < failureProbability;
      
      records.push({
        pipelineId: pipeline.id,
        timestamp,
        hoursSinceLastRun: Math.max(0, hoursSinceLastRun),
        avgFailureRate: Math.max(0, Math.min(100, avgFailureRate)),
        dataVolumeVariance: Math.max(0, Math.min(100, dataVolumeVariance)),
        dayOfWeek,
        hourOfDay,
        willFailInNext2Hours
      });
    }
    
    return records;
  }

  // Generate current features for a pipeline
  static extractCurrentFeatures(pipeline: Pipeline): {
    hoursSinceLastRun: number;
    avgFailureRate: number;
    dataVolumeVariance: number;
    dayOfWeek: number;
    hourOfDay: number;
  } {
    const now = new Date();
    const hoursSinceLastRun = (now.getTime() - pipeline.lastRun.getTime()) / (1000 * 60 * 60);
    
    // Simulate data volume variance based on recent history
    const baseVariance = Math.random() * 50;
    const timeMultiplier = Math.sin((now.getHours() / 24) * Math.PI * 2) * 25 + 25; // Daily pattern
    const dataVolumeVariance = Math.max(0, Math.min(100, baseVariance + timeMultiplier));
    
    return {
      hoursSinceLastRun: Math.max(0, hoursSinceLastRun),
      avgFailureRate: pipeline.failureRate,
      dataVolumeVariance,
      dayOfWeek: now.getDay(),
      hourOfDay: now.getHours()
    };
  }

  // Add realistic patterns to make the model more interesting
  static addSeasonalPatterns(records: HistoricalRecord[]): HistoricalRecord[] {
    return records.map(record => {
      const { dayOfWeek, hourOfDay } = record;
      
      // Add seasonal adjustments
      let adjustedFailureRate = record.avgFailureRate;
      
      // Business hours have lower failure rates (more monitoring)
      if (hourOfDay >= 9 && hourOfDay <= 17 && dayOfWeek >= 1 && dayOfWeek <= 5) {
        adjustedFailureRate *= 0.8;
      }
      
      // Lunch time dip in activity
      if (hourOfDay >= 12 && hourOfDay <= 13) {
        adjustedFailureRate *= 0.9;
      }
      
      return {
        ...record,
        avgFailureRate: Math.max(0, Math.min(100, adjustedFailureRate))
      };
    });
  }
}

// Feature explanation helpers
export const FEATURE_EXPLANATIONS = {
  hoursSinceLastRun: {
    name: "Hours Since Last Run",
    description: "Time elapsed since the pipeline last executed successfully",
    higherRisk: "Pipelines that haven't run recently may have accumulated issues"
  },
  avgFailureRate: {
    name: "Average Failure Rate",
    description: "Historical percentage of failed runs for this pipeline",
    higherRisk: "Pipelines with higher historical failure rates are more likely to fail again"
  },
  dataVolumeVariance: {
    name: "Data Volume Variance",
    description: "Fluctuation in data volume compared to normal patterns",
    higherRisk: "Unusual data volumes can overwhelm processing capacity"
  },
  dayOfWeek: {
    name: "Day of Week",
    description: "Current day (0=Sunday, 6=Saturday)",
    higherRisk: "Weekends and Mondays often show higher failure rates"
  },
  hourOfDay: {
    name: "Hour of Day",
    description: "Current hour in 24-hour format",
    higherRisk: "Off-hours have less monitoring and higher failure rates"
  }
};
