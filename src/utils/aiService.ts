import type { Pipeline, Alert, Investigation, InvestigationFinding, InvestigationStep } from '../types';

// Mock AI Service that simulates Claude API for autonomous investigation
export class AutonomousInvestigationService {
  private static instance: AutonomousInvestigationService;

  static getInstance(): AutonomousInvestigationService {
    if (!AutonomousInvestigationService.instance) {
      AutonomousInvestigationService.instance = new AutonomousInvestigationService();
    }
    return AutonomousInvestigationService.instance;
  }

  // Simulate AI analysis based on pipeline data and alerts
  async investigateAnomalies(
    pipelines: Pipeline[], 
    _alerts: Alert[], 
    triggerType: string
  ): Promise<{
    findings: InvestigationFinding[];
    summary: string;
    recommendations: string[];
    steps: InvestigationStep[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const failedPipelines = pipelines.filter(p => p.status === 'failed');
    
    // Analyze patterns
    const sourceGroups = this.groupPipelinesBySource(failedPipelines);
    const timePatterns = this.analyzeTimePatterns(failedPipelines);
    
    // Generate AI findings based on pattern analysis
    const findings = this.generateFindings(sourceGroups, timePatterns, triggerType);
    
    return {
      findings,
      summary: `Investigation completed: ${failedPipelines.length} failed pipelines analyzed. Pattern analysis suggests ${this.getPrimaryRootCause(sourceGroups)}.`,
      recommendations: this.generateRecommendations(sourceGroups, triggerType),
      steps: this.generateInvestigationSteps(triggerType, failedPipelines.length)
    };
  }

  private groupPipelinesBySource(pipelines: Pipeline[]): Record<string, Pipeline[]> {
    return pipelines.reduce((groups, pipeline) => {
      const source = pipeline.source;
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(pipeline);
      return groups;
    }, {} as Record<string, Pipeline[]>);
  }

  private analyzeTimePatterns(pipelines: Pipeline[]): any {
    const times = pipelines.map(p => new Date(p.lastRun).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      timeSpread: maxTime - minTime,
      clustered: (maxTime - minTime) < 300000, // 5 minutes
      averageTime: times.reduce((a, b) => a + b, 0) / times.length
    };
  }

  private generateFindings(sourceGroups: Record<string, Pipeline[]>, _timePatterns: any, _triggerType: string): InvestigationFinding[] {
    const findings: InvestigationFinding[] = [];
    
    // Add authentication cascade finding if multiple sources affected
    if (Object.keys(sourceGroups).length > 1) {
      findings.push({
        id: `cascade-${Date.now()}`,
        timestamp: new Date(),
        type: 'correlation',
        title: 'Authentication Service Cascade Failure',
        description: `Detected systematic authentication failures across ${Object.keys(sourceGroups).length} data sources.`,
        confidence: 94,
        severity: 'high',
        affectedPipelines: Object.values(sourceGroups).flat().map(p => p.id),
        evidence: [
          'Regional disparity in pipeline failures detected',
          'Similar incident pattern recorded in historical data'
        ],
        suggestedActions: [
          'Verify OAuth token refresh service status',
          'Check token rotation schedule and regional deployment'
        ]
      });
    }

    return findings;
  }

  private getPrimaryRootCause(sourceGroups: Record<string, Pipeline[]>): string {
    if (Object.keys(sourceGroups).length > 2) {
      return 'shared infrastructure dependency failure';
    } else if (Object.keys(sourceGroups).length === 1) {
      return 'source-specific service disruption';
    } else {
      return 'authentication cascade failure';
    }
  }

  private generateRecommendations(sourceGroups: Record<string, Pipeline[]>, _triggerType: string): string[] {
    const recommendations: string[] = [];
    
    if (Object.keys(sourceGroups).length > 1) {
      recommendations.push('Deploy token refresh service to affected regions (ETA: 8 minutes)');
      recommendations.push('Implement emergency authentication bypass for critical pipelines');
      recommendations.push('Review authentication service logs for error correlation');
    } else {
      recommendations.push('Review source-specific API quotas and rate limits');
      recommendations.push('Implement fallback data collection mechanisms');
      recommendations.push('Contact vendor support for service status updates');
    }
    
    return recommendations;
  }

  private generateInvestigationSteps(triggerType: string, failureCount: number): InvestigationStep[] {
    return [
      {
        id: `step-${Date.now()}`,
        timestamp: new Date(),
        action: `Autonomous trigger: ${triggerType}`,
        details: `Detected ${failureCount} pipeline failures matching trigger criteria`,
        status: 'completed',
        data: { result: 'Pattern analysis initiated automatically' }
      }
    ];
  }

  // Historical patterns for the UI
  getHistoricalPatterns(): Array<{
    date: string;
    pattern: string;
    resolution: string;
    duration: string;
  }> {
    return [
      {
        date: '2024-11-15',
        pattern: 'Authentication cascade failure (LinkedIn, Twitter)',
        resolution: 'Regional token service deployment',
        duration: '12 minutes'
      },
      {
        date: '2024-10-22',
        pattern: 'Multi-source API rate limiting',
        resolution: 'Emergency quota increase',
        duration: '8 minutes'
      }
    ];
  }

  async getInvestigationUpdate(): Promise<Partial<Investigation>> {
    // Simulate update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'active',
      // progress: Math.floor(Math.random() * 40) + 60,
      // currentStep: 'Analyzing authentication service dependencies'
    };
  }
}

export const aiService = AutonomousInvestigationService.getInstance();
