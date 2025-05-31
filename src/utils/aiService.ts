import type { Pipeline, Alert, Investigation, InvestigationFinding, InvestigationStep } from '../types';

// Mock AI Service that simulates Claude API for autonomous investigation
export class AutonomousInvestigationService {
  private static instance: AutonomousInvestigationService;
  private investigationHistory: Investigation[] = [];

  static getInstance(): AutonomousInvestigationService {
    if (!AutonomousInvestigationService.instance) {
      AutonomousInvestigationService.instance = new AutonomousInvestigationService();
    }
    return AutonomousInvestigationService.instance;
  }

  // System prompt for the AI agent
  private readonly SYSTEM_PROMPT = `You are MSTIC Intelligence Agent, an autonomous investigation system for Microsoft's Threat Intelligence Pipeline Monitoring.

Your capabilities:
- Analyze pipeline failures and performance patterns
- Correlate incidents across multiple data sources
- Identify root causes and provide actionable recommendations
- Reference historical incidents and solutions
- Provide natural language investigation summaries

When investigating anomalies:
1. Analyze the failure patterns and timing
2. Look for correlations across pipelines and data sources
3. Reference historical patterns and known issues
4. Provide specific, actionable recommendations
5. Estimate impact and resolution time

Be specific about pipeline names, error types, and timestamps. Reference actual Microsoft services and realistic scenarios.`;

  // Simulate AI analysis based on pipeline data and alerts
  async investigateAnomalies(
    pipelines: Pipeline[], 
    alerts: Alert[], 
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
    const warningPipelines = pipelines.filter(p => p.status === 'warning');
    
    // Analyze patterns
    const sourceGroups = this.groupPipelinesBySource(failedPipelines);
    const timePatterns = this.analyzeTimePatterns(failedPipelines);
    const errorPatterns = this.analyzeErrorPatterns(failedPipelines, alerts);

    const findings: InvestigationFinding[] = [];
    let summary = '';
    let recommendations: string[] = [];

    // Pattern-based investigation logic
    if (triggerType === 'cascade_failures') {
      const cascadeAnalysis = this.analyzeCascadeFailures(sourceGroups, timePatterns);
      findings.push(...cascadeAnalysis.findings);
      summary = cascadeAnalysis.summary;
      recommendations = cascadeAnalysis.recommendations;
    } else if (triggerType === 'unusual_patterns') {
      const patternAnalysis = this.analyzeUnusualPatterns(sourceGroups, errorPatterns);
      findings.push(...patternAnalysis.findings);
      summary = patternAnalysis.summary;
      recommendations = patternAnalysis.recommendations;
    } else if (triggerType === 'multiple_failures') {
      const multiFailureAnalysis = this.analyzeMultipleFailures(sourceGroups, timePatterns);
      findings.push(...multiFailureAnalysis.findings);
      summary = multiFailureAnalysis.summary;
      recommendations = multiFailureAnalysis.recommendations;
    }

    const steps = this.generateInvestigationSteps(triggerType, failedPipelines.length);

    return { findings, summary, recommendations, steps };
  }

  private groupPipelinesBySource(pipelines: Pipeline[]) {
    return pipelines.reduce((groups, pipeline) => {
      const source = pipeline.source;
      if (!groups[source]) groups[source] = [];
      groups[source].push(pipeline);
      return groups;
    }, {} as Record<string, Pipeline[]>);
  }

  private analyzeTimePatterns(pipelines: Pipeline[]) {
    const failures = pipelines.map(p => ({
      time: p.lastRun,
      pipeline: p.name
    })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return {
      timeSpread: failures.length > 1 ? 
        new Date(failures[failures.length - 1].time).getTime() - new Date(failures[0].time).getTime() : 0,
      clusteredFailures: failures.filter((f, i) => 
        i > 0 && new Date(f.time).getTime() - new Date(failures[i-1].time).getTime() < 5 * 60 * 1000
      ).length
    };
  }

  private analyzeErrorPatterns(pipelines: Pipeline[], alerts: Alert[]) {
    const errorTypes = new Set();
    const authErrors = pipelines.filter(p => 
      p.name.toLowerCase().includes('auth') || 
      Math.random() < 0.3 // Simulate auth-related failures
    );
    
    return {
      hasAuthPattern: authErrors.length > 2,
      hasRateLimitPattern: Math.random() < 0.4,
      hasNetworkPattern: Math.random() < 0.2,
      affectedSources: [...new Set(pipelines.map(p => p.source))]
    };
  }

  private analyzeCascadeFailures(sourceGroups: Record<string, Pipeline[]>, timePatterns: any) {
    const affectedSources = Object.keys(sourceGroups);
    const majorSource = Object.entries(sourceGroups).reduce((a, b) => a[1].length > b[1].length ? a : b);

    const findings: InvestigationFinding[] = [
      {
        id: `cascade-${Date.now()}`,
        timestamp: new Date(),
        type: 'pattern',
        title: `${majorSource[0]} Authentication Service Cascade Failure`,
        description: `Detected systematic authentication failures across ${majorSource[1].length} ${majorSource[0]} pipelines. Pattern indicates OAuth token expiration cascade.`,
        confidence: 94,
        severity: 'high',
        affectedPipelines: majorSource[1].map(p => p.id),
        evidence: [
          `All ${majorSource[0]} pipelines showing 401 Unauthorized errors`,
          `Failure pattern consistent with 72-hour OAuth token lifecycle`,
          `Regional disparity: EU pipelines affected 3x more than US pipelines`,
          `Similar incident pattern recorded on previous token rotation cycles`
        ],
        suggestedActions: [
          `Verify ${majorSource[0]} OAuth token refresh service status`,
          `Check token rotation schedule and regional deployment`,
          `Implement emergency token refresh for affected regions`,
          `Review authentication service logs for error correlation`
        ]
      }
    ];

    if (affectedSources.length > 1) {
      findings.push({
        id: `correlation-${Date.now()}`,
        timestamp: new Date(),
        type: 'correlation',
        title: 'Cross-Platform Authentication Infrastructure Impact',
        description: `Authentication failures spanning ${affectedSources.length} data sources suggest shared infrastructure issue.`,
        confidence: 87,
        severity: 'critical',
        affectedPipelines: [],
        evidence: [
          `Multiple data sources affected: ${affectedSources.join(', ')}`,
          `Shared Azure AD authentication service dependency`,
          `Timing correlation suggests common root cause`,
          `Historical precedent: similar multi-source failures during infrastructure updates`
        ],
        suggestedActions: [
          'Check Azure AD service health dashboard',
          'Verify shared authentication infrastructure status',
          'Implement temporary authentication bypass for critical pipelines',
          'Coordinate with Azure Identity team for rapid resolution'
        ]
      });
    }

    const summary = `Investigation Summary: ${majorSource[0]} authentication cascade failure detected at ${new Date().toISOString().slice(11, 19)} UTC.

Root Cause Analysis:
- OAuth token expiration affecting ${majorSource[1].length} ${majorSource[0]} pipelines
- Regional deployment gap in token refresh service (EU lag behind US deployment)
- Shared authentication infrastructure impact across ${affectedSources.length} data sources

Historical Context:
- Similar pattern occurred during previous token rotations (2024-11-15, 2024-10-22)
- Mean resolution time for auth cascades: 18.5 minutes
- Regional failover typically resolves 89% of authentication issues

Recommended Resolution:
1. Deploy token refresh service to EU region (ETA: 8 minutes)
2. Implement emergency authentication bypass for critical threat intel pipelines
3. Coordinate with Azure Identity team for infrastructure assessment

Expected Resolution Time: 15-20 minutes with immediate regional deployment.`;

    const recommendations = [
      'Deploy authentication service updates to EU region immediately',
      'Implement regional authentication redundancy to prevent future cascades',
      'Add proactive monitoring for OAuth token expiration (24h advance warning)',
      'Create runbook for rapid authentication service failover',
      'Establish direct escalation path to Azure Identity engineering team'
    ];

    return { findings, summary, recommendations };
  }

  private analyzeUnusualPatterns(sourceGroups: Record<string, Pipeline[]>, errorPatterns: any) {
    const findings: InvestigationFinding[] = [];
    
    if (errorPatterns.hasRateLimitPattern) {
      findings.push({
        id: `rate-limit-${Date.now()}`,
        timestamp: new Date(),
        type: 'anomaly',
        title: 'Twitter API Rate Limit Anomaly - Quota Reduction Detected',
        description: 'Twitter pipelines hitting rate limits 67% faster than historical baseline, indicating API tier changes.',
        confidence: 92,
        severity: 'high',
        affectedPipelines: sourceGroups['Twitter']?.map(p => p.id) || [],
        evidence: [
          'Rate limit reached after 1,200 API calls vs. normal 3,600 baseline',
          'Twitter API documentation updated 48 hours ago',
          'Consistent pattern across all Twitter threat intelligence pipelines',
          'API response headers showing reduced quota allocation',
          'Similar quota reductions reported in Twitter developer forums'
        ],
        suggestedActions: [
          'Review current Twitter API subscription tier and quotas',
          'Implement dynamic rate limiting based on real-time quota feedback',
          'Contact Twitter API support for quota clarification',
          'Implement pipeline throttling to stay within new limits',
          'Consider upgrading to enterprise API tier for critical threat intel'
        ]
      });
    }

    const summary = `Unusual Pattern Investigation: Twitter API rate limiting anomaly detected.

Analysis Results:
- API quota reduced by approximately 67% from previous allocation
- All Twitter threat intelligence pipelines affected
- Pattern consistent with API tier policy changes announced this week

Impact Assessment:
- Critical threat intelligence data collection degraded
- Real-time social media monitoring capabilities reduced
- Estimated data loss: 15-20% of Twitter threat indicators

Immediate Actions Required:
- Implement emergency rate limiting to preserve quota for critical collection
- Review Twitter API subscription and consider tier upgrade
- Activate backup social media monitoring sources`;

    const recommendations = [
      'Implement intelligent quota management with priority-based allocation',
      'Upgrade to Twitter Enterprise API tier for guaranteed quotas',
      'Develop alternative social media intelligence sources (LinkedIn, Discord)',
      'Create automated API quota monitoring with predictive alerting',
      'Establish SLA with Twitter for enterprise threat intelligence use cases'
    ];

    return { findings, summary, recommendations };
  }

  private analyzeMultipleFailures(sourceGroups: Record<string, Pipeline[]>, timePatterns: any) {
    const totalFailures = Object.values(sourceGroups).reduce((sum, pipes) => sum + pipes.length, 0);
    const affectedSources = Object.keys(sourceGroups);

    const findings: InvestigationFinding[] = [
      {
        id: `multi-failure-${Date.now()}`,
        timestamp: new Date(),
        type: 'pattern',
        title: 'Coordinated Pipeline Failure Pattern',
        description: `${totalFailures} pipelines failed across ${affectedSources.length} data sources within ${Math.round(timePatterns.timeSpread / 60000)} minutes.`,
        confidence: 88,
        severity: 'high',
        affectedPipelines: Object.values(sourceGroups).flat().map(p => p.id),
        evidence: [
          `Rapid failure cascade: ${totalFailures} pipelines in ${Math.round(timePatterns.timeSpread / 60000)} minutes`,
          `Multi-source impact: ${affectedSources.join(', ')}`,
          `Timing suggests shared infrastructure dependency`,
          `Network telemetry shows increased latency to external APIs`,
          `Azure Monitor alerts indicate regional connectivity issues`
        ],
        suggestedActions: [
          'Check Azure networking infrastructure status',
          'Verify DNS resolution for external API endpoints',
          'Review firewall and network security group configurations',
          'Implement circuit breaker pattern for external API calls',
          'Activate backup data collection mechanisms'
        ]
      }
    ];

    const summary = `Multiple Failure Investigation: Coordinated failure pattern detected across ${affectedSources.length} threat intelligence sources.

Pattern Analysis:
- ${totalFailures} pipeline failures in ${Math.round(timePatterns.timeSpread / 60000)}-minute window
- Cross-platform impact suggests infrastructure-level issue
- Network connectivity degradation to external threat intelligence APIs

Root Cause Hypothesis:
- Azure regional networking issue affecting external API connectivity
- Possible DNS resolution problems for threat intelligence endpoints
- Network security policy changes impacting outbound connections

Resolution Strategy:
- Immediate: Activate backup collection mechanisms
- Short-term: Implement circuit breaker patterns for resilience
- Long-term: Multi-region deployment for redundancy`;

    const recommendations = [
      'Implement multi-region deployment for critical threat intelligence pipelines',
      'Add circuit breaker patterns to prevent cascade failures',
      'Create backup data collection mechanisms for each intelligence source',
      'Establish real-time network monitoring for external API dependencies',
      'Develop automated failover procedures for infrastructure issues'
    ];

    return { findings, summary, recommendations };
  }

  private generateInvestigationSteps(triggerType: string, failureCount: number): InvestigationStep[] {
    const baseTime = new Date();
    
    return [
      {
        id: 'trigger',
        timestamp: new Date(baseTime.getTime() - 5 * 60 * 1000),
        action: `Autonomous trigger activated: ${triggerType}`,
        details: `Detected ${failureCount} pipeline failures matching trigger criteria`,
        status: 'completed'
      },
      {
        id: 'data-collection',
        timestamp: new Date(baseTime.getTime() - 4 * 60 * 1000),
        action: 'Collecting pipeline telemetry and error logs',
        details: 'Gathering failure patterns, error codes, and timing data from affected pipelines',
        status: 'completed'
      },
      {
        id: 'pattern-analysis',
        timestamp: new Date(baseTime.getTime() - 3 * 60 * 1000),
        action: 'Analyzing failure patterns and correlations',
        details: 'Running ML pattern detection on error signatures and temporal relationships',
        status: 'completed'
      },
      {
        id: 'historical-correlation',
        timestamp: new Date(baseTime.getTime() - 2 * 60 * 1000),
        action: 'Correlating with historical incident database',
        details: 'Matching current patterns against 18 months of incident history',
        status: 'completed'
      },
      {
        id: 'root-cause-analysis',
        timestamp: new Date(baseTime.getTime() - 1 * 60 * 1000),
        action: 'Performing root cause analysis',
        details: 'Synthesizing evidence and generating hypothesis with confidence scoring',
        status: 'completed'
      },
      {
        id: 'recommendation-generation',
        timestamp: baseTime,
        action: 'Generating actionable recommendations',
        details: 'Creating prioritized action plan with estimated resolution timeline',
        status: 'in_progress'
      }
    ];
  }

  // Simulate real-time investigation updates
  async getInvestigationUpdate(investigationId: string): Promise<Partial<Investigation>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate progress updates
    return {
      status: Math.random() > 0.3 ? 'active' : 'completed',
      // Add random findings or steps
    };
  }

  // Get historical investigation patterns for learning
  getHistoricalPatterns(sourceType?: string): Array<{
    pattern: string;
    frequency: number;
    avgResolutionTime: number;
    commonCauses: string[];
  }> {
    return [
      {
        pattern: 'OAuth Token Expiration',
        frequency: 0.15,
        avgResolutionTime: 18.5,
        commonCauses: ['Token rotation service lag', 'Regional deployment gaps', 'Certificate expiration']
      },
      {
        pattern: 'API Rate Limiting',
        frequency: 0.23,
        avgResolutionTime: 45.2,
        commonCauses: ['Quota changes', 'Burst traffic', 'API tier modifications']
      },
      {
        pattern: 'Network Connectivity',
        frequency: 0.08,
        avgResolutionTime: 32.1,
        commonCauses: ['Azure networking issues', 'DNS resolution', 'Firewall changes']
      }
    ];
  }
}

export const aiService = AutonomousInvestigationService.getInstance();
