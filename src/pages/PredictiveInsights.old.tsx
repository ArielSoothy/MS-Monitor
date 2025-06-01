import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  Clock, 
  Info, 
  RefreshCw,
  Target,
  BarChart3,
  HelpCircle,
  User,
  Eye,
  Zap,
  Lock,
  UserX,
  Database,
  Map,
  Key
} from 'lucide-react';
import { ThreatPrediction, DecisionTreeModel, ThreatType, ThreatSeverity, SecurityFeatures } from '../types';
import HowItWorksModal from '../components/HowItWorksModal';
import InfoTooltip from '../components/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import styles from './PredictiveInsights.module.css';

// Seeded random function for consistent demo data
const seededRandom = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) / 2147483647;
};

const PredictiveInsights: React.FC = () => {
  const [predictions, setPredictions] = useState<ThreatPrediction[]>([]);
  const [selectedPrediction, setSelectedPrediction] = useState<ThreatPrediction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showModelDetails, setShowModelDetails] = useState(false);
  const [showModelExplanation, setShowModelExplanation] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [selectedThreatType, setSelectedThreatType] = useState<ThreatType | 'all'>('all');

  // Generate realistic user data for threat analysis
  const generateUserProfiles = (): ThreatPrediction[] => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'IT', 'Legal', 'Operations'];
    const roles = ['Engineer', 'Manager', 'Director', 'Analyst', 'Coordinator', 'Specialist', 'Admin', 'Executive'];
    const names = [
      'Sarah Chen', 'Michael Rodriguez', 'Emma Thompson', 'David Kim', 'Lisa Wang',
      'James Wilson', 'Maria Garcia', 'Alex Johnson', 'Rachel Brown', 'Chris Lee',
      'Jennifer Davis', 'Mark Taylor', 'Anna Petrov', 'Robert Miller', 'Grace Liu',
      'John Anderson', 'Sophie Martin', 'Daniel Cohen', 'Elena Rossi', 'Thomas Singh',
      'Kate Murphy', 'Ryan O\'Connor', 'Maya Patel', 'Lucas Weber', 'Zoe Adams'
    ];

    return names.map((name, index) => {
      const userId = `user${index + 1000}`;
      const department = departments[Math.floor(seededRandom(`${userId}-dept`) * departments.length)];
      const role = roles[Math.floor(seededRandom(`${userId}-role`) * roles.length)];
      
      // Generate baseline features (normal behavior)
      const baselineFeatures: SecurityFeatures = {
        loginFrequency: Math.floor(seededRandom(`${userId}-login-base`) * 5) + 3, // 3-8 logins per day
        offHoursActivity: Math.floor(seededRandom(`${userId}-hours-base`) * 20) + 5, // 5-25%
        dataAccessVolume: Math.floor(seededRandom(`${userId}-data-base`) * 10) + 2, // 2-12 GB
        uniqueResourcesAccessed: Math.floor(seededRandom(`${userId}-resources-base`) * 20) + 10, // 10-30 resources
        geographicAnomaly: 0, // baseline is 0 km from usual location
        privilegeLevel: role.includes('Director') || role.includes('Executive') ? 8 : 
                       role.includes('Manager') ? 6 : 
                       role.includes('Admin') ? 7 : 4,
        accountAge: Math.floor(seededRandom(`${userId}-age`) * 1000) + 100, // 100-1100 days
        failedLoginAttempts: Math.floor(seededRandom(`${userId}-failed-base`) * 2), // 0-2
        vpnUsage: Math.floor(seededRandom(`${userId}-vpn-base`) * 30) + 10, // 10-40%
        deviceCount: Math.floor(seededRandom(`${userId}-devices-base`) * 3) + 1 // 1-4 devices
      };

      // Generate current features with potential anomalies
      const anomalyFactor = seededRandom(`${userId}-anomaly`);
      const hasAnomaly = anomalyFactor > 0.8; // 20% chance of anomaly
      
      const currentFeatures: SecurityFeatures = {
        loginFrequency: hasAnomaly && anomalyFactor > 0.9 ? 
          baselineFeatures.loginFrequency * (2 + seededRandom(`${userId}-login-mult`)) : 
          baselineFeatures.loginFrequency + Math.floor((seededRandom(`${userId}-login-var`) - 0.5) * 2),
        
        offHoursActivity: hasAnomaly && seededRandom(`${userId}-hours-type`) > 0.5 ? 
          Math.min(95, baselineFeatures.offHoursActivity * (2 + seededRandom(`${userId}-hours-mult`))) : 
          Math.max(0, baselineFeatures.offHoursActivity + Math.floor((seededRandom(`${userId}-hours-var`) - 0.5) * 10)),
        
        dataAccessVolume: hasAnomaly && seededRandom(`${userId}-data-type`) > 0.7 ? 
          baselineFeatures.dataAccessVolume * (3 + seededRandom(`${userId}-data-mult`) * 5) : 
          Math.max(0, baselineFeatures.dataAccessVolume + Math.floor((seededRandom(`${userId}-data-var`) - 0.5) * 5)),
        
        uniqueResourcesAccessed: hasAnomaly && seededRandom(`${userId}-res-type`) > 0.6 ? 
          baselineFeatures.uniqueResourcesAccessed * (1.5 + seededRandom(`${userId}-res-mult`)) : 
          Math.max(5, baselineFeatures.uniqueResourcesAccessed + Math.floor((seededRandom(`${userId}-res-var`) - 0.5) * 10)),
        
        geographicAnomaly: hasAnomaly && seededRandom(`${userId}-geo-type`) > 0.8 ? 
          Math.floor(seededRandom(`${userId}-geo-dist`) * 5000) + 100 : 
          Math.floor(seededRandom(`${userId}-geo-local`) * 50),
        
        privilegeLevel: baselineFeatures.privilegeLevel,
        accountAge: baselineFeatures.accountAge,
        
        failedLoginAttempts: hasAnomaly && seededRandom(`${userId}-fail-type`) > 0.7 ? 
          Math.floor(seededRandom(`${userId}-fail-count`) * 15) + 5 : 
          Math.floor(seededRandom(`${userId}-fail-normal`) * 3),
        
        vpnUsage: hasAnomaly && seededRandom(`${userId}-vpn-type`) > 0.8 ? 
          Math.min(100, baselineFeatures.vpnUsage + Math.floor(seededRandom(`${userId}-vpn-spike`) * 60)) : 
          Math.max(0, baselineFeatures.vpnUsage + Math.floor((seededRandom(`${userId}-vpn-var`) - 0.5) * 20)),
        
        deviceCount: hasAnomaly && seededRandom(`${userId}-dev-type`) > 0.9 ? 
          baselineFeatures.deviceCount + Math.floor(seededRandom(`${userId}-dev-new`) * 3) + 2 : 
          Math.max(1, baselineFeatures.deviceCount + Math.floor((seededRandom(`${userId}-dev-var`) - 0.5) * 2))
      };

      // Calculate anomaly score and threat type
      const anomalyScore = calculateAnomalyScore(baselineFeatures, currentFeatures);
      const threatType = determineThreatType(currentFeatures, baselineFeatures, anomalyScore);
      const severity = determineSeverity(anomalyScore, threatType);
      const riskScore = Math.min(100, Math.max(0, anomalyScore + (severity === 'critical' ? 20 : severity === 'high' ? 10 : 0)));
      const confidence = Math.min(0.95, Math.max(0.1, (anomalyScore / 100) * 0.8 + 0.2));

      return {
        userId,
        userDisplayName: name,
        department,
        role,
        threatType,
        severity,
        confidence,
        riskScore: Math.round(riskScore),
        reasoning: generateReasoning(currentFeatures, baselineFeatures, threatType),
        features: currentFeatures,
        lastUpdated: new Date(Date.now() - seededRandom(`${userId}-update`) * 3600000), // Within last hour
        recommendedActions: getRecommendedActions(threatType, severity),
        investigationPriority: Math.ceil((riskScore / 100) * 10)
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  };

  const calculateAnomalyScore = (baseline: SecurityFeatures, current: SecurityFeatures): number => {
    let score = 0;
    
    // Login frequency anomaly
    const loginRatio = current.loginFrequency / Math.max(1, baseline.loginFrequency);
    if (loginRatio > 2) score += 20;
    else if (loginRatio > 1.5) score += 10;
    
    // Off-hours activity
    const hoursIncrease = current.offHoursActivity - baseline.offHoursActivity;
    if (hoursIncrease > 40) score += 25;
    else if (hoursIncrease > 20) score += 15;
    
    // Data access volume
    const dataRatio = current.dataAccessVolume / Math.max(1, baseline.dataAccessVolume);
    if (dataRatio > 5) score += 30;
    else if (dataRatio > 3) score += 20;
    else if (dataRatio > 2) score += 10;
    
    // Geographic anomaly
    if (current.geographicAnomaly > 1000) score += 25; // 1000+ km
    else if (current.geographicAnomaly > 500) score += 15;
    else if (current.geographicAnomaly > 100) score += 5;
    
    // Failed login attempts
    if (current.failedLoginAttempts > 10) score += 20;
    else if (current.failedLoginAttempts > 5) score += 10;
    
    // New devices
    const deviceIncrease = current.deviceCount - baseline.deviceCount;
    if (deviceIncrease > 2) score += 15;
    else if (deviceIncrease > 1) score += 5;
    
    // Resource access anomaly
    const resourceRatio = current.uniqueResourcesAccessed / Math.max(1, baseline.uniqueResourcesAccessed);
    if (resourceRatio > 2) score += 15;
    else if (resourceRatio > 1.5) score += 8;
    
    return Math.min(100, score);
  };

  const determineThreatType = (current: SecurityFeatures, baseline: SecurityFeatures, anomalyScore: number): ThreatType => {
    const dataRatio = current.dataAccessVolume / Math.max(1, baseline.dataAccessVolume);
    const resourceRatio = current.uniqueResourcesAccessed / Math.max(1, baseline.uniqueResourcesAccessed);
    
    if (dataRatio > 3 && current.offHoursActivity > baseline.offHoursActivity + 30) {
      return 'data_exfiltration';
    } else if (current.failedLoginAttempts > 8 && current.geographicAnomaly > 500) {
      return 'credential_abuse';
    } else if (resourceRatio > 1.8 && current.privilegeLevel >= 6) {
      return 'lateral_movement';
    } else if (current.offHoursActivity > baseline.offHoursActivity + 40) {
      return 'insider_threat';
    } else if (current.geographicAnomaly > 1000) {
      return 'suspicious_login';
    } else if (dataRatio > 2) {
      return 'data_hoarding';
    } else if (anomalyScore > 30) {
      return 'anomalous_access';
    } else {
      return 'privilege_escalation';
    }
  };

  const determineSeverity = (anomalyScore: number, threatType: ThreatType): ThreatSeverity => {
    if (anomalyScore > 70 || threatType === 'data_exfiltration' || threatType === 'credential_abuse') {
      return 'critical';
    } else if (anomalyScore > 50 || threatType === 'insider_threat' || threatType === 'lateral_movement') {
      return 'high';
    } else if (anomalyScore > 30) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const generateReasoning = (current: SecurityFeatures, baseline: SecurityFeatures, threatType: ThreatType): string[] => {
    const reasons = [];
    
    const loginRatio = current.loginFrequency / Math.max(1, baseline.loginFrequency);
    if (loginRatio > 2) {
      reasons.push(`Login frequency ${loginRatio.toFixed(1)}x higher than baseline (${current.loginFrequency} vs ${baseline.loginFrequency} per day)`);
    }
    
    const hoursIncrease = current.offHoursActivity - baseline.offHoursActivity;
    if (hoursIncrease > 20) {
      reasons.push(`Off-hours activity increased by ${hoursIncrease.toFixed(1)}% (now ${current.offHoursActivity}%)`);
    }
    
    const dataRatio = current.dataAccessVolume / Math.max(1, baseline.dataAccessVolume);
    if (dataRatio > 2) {
      reasons.push(`Data access volume ${dataRatio.toFixed(1)}x higher than normal (${current.dataAccessVolume}GB vs ${baseline.dataAccessVolume}GB)`);
    }
    
    if (current.geographicAnomaly > 100) {
      reasons.push(`Login from ${current.geographicAnomaly}km away from usual location`);
    }
    
    if (current.failedLoginAttempts > 5) {
      reasons.push(`${current.failedLoginAttempts} failed login attempts in last 24h`);
    }
    
    const deviceIncrease = current.deviceCount - baseline.deviceCount;
    if (deviceIncrease > 1) {
      reasons.push(`${deviceIncrease} new device(s) detected (total: ${current.deviceCount})`);
    }
    
    const resourceRatio = current.uniqueResourcesAccessed / Math.max(1, baseline.uniqueResourcesAccessed);
    if (resourceRatio > 1.5) {
      reasons.push(`Accessing ${resourceRatio.toFixed(1)}x more resources than usual (${current.uniqueResourcesAccessed} vs ${baseline.uniqueResourcesAccessed})`);
    }
    
    if (reasons.length === 0) {
      reasons.push('Subtle behavioral pattern changes detected by ML model');
    }
    
    return reasons;
  };

  const getRecommendedActions = (threatType: ThreatType, severity: ThreatSeverity): string[] => {
    const baseActions = [
      'Review user activity logs',
      'Verify recent access patterns',
      'Contact user to confirm legitimate activity'
    ];
    
    const typeSpecificActions: Record<ThreatType, string[]> = {
      'data_exfiltration': [
        'Block large data downloads immediately',
        'Review file access logs for sensitive data',
        'Implement DLP policies',
        'Check for external sharing activities'
      ],
      'insider_threat': [
        'Increase monitoring frequency',
        'Review manager/peer feedback',
        'Check for recent policy violations',
        'Monitor privileged access usage'
      ],
      'lateral_movement': [
        'Audit all resource access attempts',
        'Check for privilege escalation attempts',
        'Review network connection logs',
        'Verify legitimate business need for access'
      ],
      'credential_abuse': [
        'Force password reset immediately',
        'Enable MFA if not active',
        'Review all active sessions',
        'Check for concurrent logins from multiple locations'
      ],
      'suspicious_login': [
        'Verify login location with user',
        'Check for VPN/proxy usage',
        'Review device fingerprinting',
        'Implement conditional access policies'
      ],
      'anomalous_access': [
        'Review access justification',
        'Check approval workflows',
        'Verify with resource owners',
        'Update access control policies'
      ],
      'privilege_escalation': [
        'Audit recent permission changes',
        'Review approval history',
        'Check for unauthorized admin access',
        'Validate current role assignments'
      ],
      'data_hoarding': [
        'Review data retention policies',
        'Check for unauthorized data copying',
        'Implement automated cleanup rules',
        'Monitor large file movements'
      ]
    };
    
    const severityActions: Record<ThreatSeverity, string[]> = {
      'critical': ['IMMEDIATE ACTION REQUIRED', 'Escalate to security team', 'Consider account suspension'],
      'high': ['Priority investigation', 'Notify security team within 2 hours'],
      'medium': ['Schedule investigation within 24 hours', 'Document findings'],
      'low': ['Monitor for pattern changes', 'Include in weekly review']
    };
    
    return [
      ...severityActions[severity],
      ...baseActions,
      ...typeSpecificActions[threatType]
    ];
  };

  // Initialize predictions
  useEffect(() => {
    setIsAnalyzing(true);
    
    // Simulate analysis time for realism
    setTimeout(() => {
      const initialPredictions = generateUserProfiles();
      setPredictions(initialPredictions);
      setIsAnalyzing(false);
    }, 2000);
  }, []);

  // Update predictions every 5 minutes (more realistic for security monitoring)
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedPredictions = generateUserProfiles();
      setPredictions(updatedPredictions);
      setLastUpdate(new Date());
    }, 300000); // Update every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const filteredPredictions = selectedThreatType === 'all' 
    ? predictions 
    : predictions.filter(p => p.threatType === selectedThreatType);

  const criticalThreats = predictions.filter(p => p.severity === 'critical');
  const highThreats = predictions.filter(p => p.severity === 'high');
  const avgRiskScore = predictions.length > 0 
    ? predictions.reduce((sum, p) => sum + p.riskScore, 0) / predictions.length 
    : 0;

  const getStatusColor = (severity: ThreatSeverity) => {
    switch (severity) {
      case 'critical': return styles.critical;
      case 'high': return styles.warning;
      case 'medium': return styles.medium;
      case 'low': return styles.healthy;
      default: return styles.healthy;
    }
  };

  const getThreatIcon = (threatType: ThreatType) => {
    switch (threatType) {
      case 'data_exfiltration': return <Database size={16} />;
      case 'insider_threat': return <UserX size={16} />;
      case 'lateral_movement': return <Map size={16} />;
      case 'credential_abuse': return <Key size={16} />;
      case 'suspicious_login': return <User size={16} />;
      case 'anomalous_access': return <Eye size={16} />;
      case 'privilege_escalation': return <Zap size={16} />;
      case 'data_hoarding': return <Lock size={16} />;
      default: return <Shield size={16} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isAnalyzing) {
    return (
      <div className={styles.container}>
        <div className={styles.trainingOverlay}>
          <div className={styles.trainingContent}>
            <RefreshCw className={styles.spinningIcon} size={48} />
            <h2>Analyzing User Behavior</h2>
            <p>Processing security events and building threat profiles...</p>
            <div className={styles.trainingProgress}>
              <div className={styles.progressBar}></div>
            </div>
          </div>
        </div>
      </div>
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Shield className={styles.headerIcon} />
            <div>
              <h1>
                Security Threat Prediction
                <button 
                  className={styles.infoButton}
                  onClick={() => setShowModelExplanation(true)}
                  title="How does this model work?"
                >
                  <HelpCircle size={18} />
                </button>
              </h1>
              <p>AI-powered behavioral analysis for insider threat detection and security anomalies</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.howItWorksButton}
              onClick={() => setShowHowItWorks(true)}
              title="Learn how this system works"
            >
              <HelpCircle size={16} />
              How does it work?
            </button>
            <div className={styles.lastUpdate}>
              <Clock size={16} />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
            <button 
              className={styles.modelButton}
              onClick={() => setShowModelDetails(!showModelDetails)}
            >
              <Target size={16} />
              Model Details
            </button>
          </div>
        </div>
      </header>

      <div className={styles.disclaimer}>
        <Info size={16} />
        <span>Threat predictions based on behavioral analysis - proof of concept for MSTIC demonstration</span>
      </div>

      {/* Threat Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle className={styles.iconRisk} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{criticalThreats.length}</div>
            <div className={styles.statLabel}>
              Critical Threats
              {getTooltipContent('criticalThreats') && (
                <InfoTooltip 
                  {...getTooltipContent('criticalThreats')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserX className={styles.iconWarning} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{highThreats.length}</div>
            <div className={styles.statLabel}>
              High-Risk Users
              {getTooltipContent('highRiskUsers') && (
                <InfoTooltip 
                  {...getTooltipContent('highRiskUsers')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp className={styles.iconConfidence} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{avgRiskScore.toFixed(0)}</div>
            <div className={styles.statLabel}>
              Avg Risk Score
              {getTooltipContent('avgRiskScore') && (
                <InfoTooltip 
                  {...getTooltipContent('avgRiskScore')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye className={styles.iconSamples} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{predictions.length}</div>
            <div className={styles.statLabel}>
              Users Monitored
              {getTooltipContent('usersMonitored') && (
                <InfoTooltip 
                  {...getTooltipContent('usersMonitored')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Threat Type Filter */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>
              <Shield size={20} />
              Threat Predictions
            </h2>
            <div className={styles.filterControls}>
              <select 
                value={selectedThreatType}
                onChange={(e) => setSelectedThreatType(e.target.value as ThreatType | 'all')}
                className={styles.threatFilter}
              >
                <option value="all">All Threat Types</option>
                <option value="insider_threat">Insider Threat</option>
                <option value="data_exfiltration">Data Exfiltration</option>
                <option value="lateral_movement">Lateral Movement</option>
                <option value="credential_abuse">Credential Abuse</option>
                <option value="anomalous_access">Anomalous Access</option>
                <option value="privilege_escalation">Privilege Escalation</option>
                <option value="suspicious_login">Suspicious Login</option>
                <option value="data_hoarding">Data Hoarding</option>
              </select>
            </div>
          </div>

          {/* User Threat Predictions */}
          {filteredPredictions.length === 0 ? (
            <div className={styles.noRisk}>
              <Shield size={48} />
              <h3>No Threats Detected</h3>
              <p>All users are showing normal behavioral patterns.</p>
            </div>
          ) : (
            <div className={styles.riskGrid}>
              {filteredPredictions.map(prediction => (
                <div 
                  key={prediction.userId} 
                  className={`${styles.riskCard} ${getStatusColor(prediction.severity)}`}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitle}>{prediction.userDisplayName}</div>
                    <div className={styles.riskScore}>
                      {prediction.riskScore}
                      {getTooltipContent('riskScore') && (
                        <InfoTooltip
                          {...getTooltipContent('riskScore')!}
                          position="bottom"
                          size="medium"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.riskContent}>
                    <div className={styles.threatType}>
                      {getThreatIcon(prediction.threatType)}
                      <span>{prediction.threatType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.riskDetails}>
                      <div className={styles.department}>{prediction.department} • {prediction.role}</div>
                      <div className={styles.severity}>
                        Severity: <span className={getStatusColor(prediction.severity)}>{prediction.severity.toUpperCase()}</span>
                      </div>
                      <div className={styles.confidence}>
                        Confidence: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className={styles.reasoning}>
                      <strong>Key Indicators:</strong>
                      <ul>
                        {prediction.reasoning.slice(0, 2).map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Threat Details Modal */}
      {selectedPrediction && (
        <div className={styles.modal} onClick={() => setSelectedPrediction(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedPrediction.userDisplayName}</h2>
              <button 
                onClick={() => setSelectedPrediction(null)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.threatSummary}>
                <div className={`${styles.predictionResult} ${getStatusColor(selectedPrediction.severity)}`}>
                  <div className={styles.threatInfo}>
                    <div className={styles.threatTypeDisplay}>
                      {getThreatIcon(selectedPrediction.threatType)}
                      <span>{selectedPrediction.threatType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    <div className={styles.severityDisplay}>
                      Severity: {selectedPrediction.severity.toUpperCase()}
                    </div>
                    <div className={styles.riskScoreDisplay}>
                      Risk Score: {selectedPrediction.riskScore}/100
                    </div>
                    <div className={styles.confidenceDisplay}>
                      Confidence: {(selectedPrediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.behavioralAnalysis}>
                <h3>Behavioral Indicators</h3>
                <div className={styles.featureGrid}>
                  {Object.entries(selectedPrediction.features).map(([feature, value]) => (
                    <div key={feature} className={styles.featureCard}>
                      <div className={styles.featureName}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className={styles.featureValue}>
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.reasoning}>
                <h3>Why this prediction?</h3>
                <ul>
                  {selectedPrediction.reasoning.map((reason: string, idx: number) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.recommendedActions}>
                <h3>Recommended Actions</h3>
                <ul>
                  {selectedPrediction.recommendedActions.map((action: string, idx: number) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Explanation Modal */}
      {showModelExplanation && (
        <div className={styles.modal} onClick={() => setShowModelExplanation(false)}>
          <div className={styles.modelExplanationModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>How Security Threat Prediction Works</h2>
              <button 
                onClick={() => setShowModelExplanation(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.explanationSection}>
                <h3>🧠 Behavioral Analysis Model</h3>
                <p>Our system uses advanced machine learning to analyze user behavior patterns and detect potential security threats. The model examines multiple behavioral indicators to identify anomalies that could indicate malicious activity.</p>
              </div>

              <div className={styles.explanationSection}>
                <h3>📊 Key Behavioral Features</h3>
                <div className={styles.featureExplanations}>
                  <div className={styles.featureExplanation}>
                    <h4>🕐 Login Patterns</h4>
                    <p>Analyzes login frequency, timing, and off-hours activity to detect unusual access patterns.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📁 Data Access Volume</h4>
                    <p>Monitors data access patterns and volume changes that could indicate data exfiltration attempts.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>🌍 Geographic Anomalies</h4>
                    <p>Detects unusual login locations and potential account compromise indicators.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>🔑 Privilege Usage</h4>
                    <p>Monitors privilege escalation attempts and unauthorized access to sensitive resources.</p>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>🎯 Threat Classification</h3>
                <p>The model classifies threats into specific categories like insider threats, data exfiltration, lateral movement, and credential abuse, enabling targeted response strategies.</p>
              </div>

              <div className={styles.explanationSection}>
                <h3>⚠️ For MSTIC Interview Demonstration</h3>
                <ul className={styles.limitations}>
                  <li><strong>Proof of Concept:</strong> This demonstrates behavioral analysis capabilities</li>
                  <li><strong>Realistic Patterns:</strong> Uses simulated but realistic security data</li>
                  <li><strong>Production Ready:</strong> Architecture supports real-time threat detection</li>
                  <li><strong>MITRE ATT&CK:</strong> Aligned with security frameworks and best practices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="predictiveInsights"
      />
    </div>
  );
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <Shield className={styles.headerIcon} />
            <div>
              <h1>
                Security Threat Prediction
                <button 
                  className={styles.infoButton}
                  onClick={() => setShowModelExplanation(true)}
                  title="How does this model work?"
                >
                  <HelpCircle size={18} />
                </button>
              </h1>
              <p>AI-powered behavioral analysis for insider threat detection and security anomalies</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button 
              className={styles.howItWorksButton}
              onClick={() => setShowHowItWorks(true)}
              title="Learn how this system works"
            >
              <HelpCircle size={16} />
              How does it work?
            </button>
            <div className={styles.lastUpdate}>
              <Clock size={16} />
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
            <button 
              className={styles.modelButton}
              onClick={() => setShowModelDetails(!showModelDetails)}
            >
              <Target size={16} />
              Model Details
            </button>
          </div>
        </div>
      </header>

      <div className={styles.disclaimer}>
        <Info size={16} />
        <span>Threat predictions based on behavioral analysis - proof of concept for MSTIC demonstration</span>
      </div>

      {/* Threat Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <AlertTriangle className={styles.iconRisk} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{criticalThreats.length}</div>
            <div className={styles.statLabel}>
              Critical Threats
              {getTooltipContent('criticalThreats') && (
                <InfoTooltip 
                  {...getTooltipContent('criticalThreats')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <UserX className={styles.iconWarning} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{highThreats.length}</div>
            <div className={styles.statLabel}>
              High-Risk Users
              {getTooltipContent('highRiskUsers') && (
                <InfoTooltip 
                  {...getTooltipContent('highRiskUsers')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp className={styles.iconConfidence} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{avgRiskScore.toFixed(0)}</div>
            <div className={styles.statLabel}>
              Avg Risk Score
              {getTooltipContent('avgRiskScore') && (
                <InfoTooltip 
                  {...getTooltipContent('avgRiskScore')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Eye className={styles.iconSamples} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{predictions.length}</div>
            <div className={styles.statLabel}>
              Users Monitored
              {getTooltipContent('usersMonitored') && (
                <InfoTooltip 
                  {...getTooltipContent('usersMonitored')!} 
                  position="bottom"
                  size="medium"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Threat Type Filter */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>
              <Shield size={20} />
              Threat Predictions
            </h2>
            <div className={styles.filterControls}>
              <select 
                value={selectedThreatType}
                onChange={(e) => setSelectedThreatType(e.target.value as ThreatType | 'all')}
                className={styles.threatFilter}
              >
                <option value="all">All Threat Types</option>
                <option value="insider_threat">Insider Threat</option>
                <option value="data_exfiltration">Data Exfiltration</option>
                <option value="lateral_movement">Lateral Movement</option>
                <option value="credential_abuse">Credential Abuse</option>
                <option value="anomalous_access">Anomalous Access</option>
                <option value="privilege_escalation">Privilege Escalation</option>
                <option value="suspicious_login">Suspicious Login</option>
                <option value="data_hoarding">Data Hoarding</option>
              </select>
            </div>
          </div>

        {/* User Threat Predictions */}
          <h2 className={styles.sectionTitle}>
            <AlertTriangle size={20} />
            Pipelines at Risk (Next 2 Hours)
          </h2>
          
          {filteredPredictions.length === 0 ? (
            <div className={styles.noRisk}>
              <Shield size={48} />
              <h3>No Threats Detected</h3>
              <p>All users are showing normal behavioral patterns.</p>
            </div>
          ) : (
            <div className={styles.riskGrid}>
              {filteredPredictions.map(prediction => (
                <div 
                  key={prediction.userId} 
                  className={`${styles.riskCard} ${getStatusColor(prediction.severity)}`}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className={styles.riskHeader}>
                    <div className={styles.riskTitle}>{prediction.userDisplayName}</div>
                    <div className={styles.riskScore}>
                      {prediction.riskScore}
                      {getTooltipContent('riskScore') && (
                        <InfoTooltip
                          {...getTooltipContent('riskScore')!}
                          position="bottom"
                          size="medium"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.riskContent}>
                    <div className={styles.threatType}>
                      {getThreatIcon(prediction.threatType)}
                      <span>{prediction.threatType.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.riskDetails}>
                      <div className={styles.department}>{prediction.department} • {prediction.role}</div>
                      <div className={styles.severity}>
                        Severity: <span className={getStatusColor(prediction.severity)}>{prediction.severity.toUpperCase()}</span>
                      </div>
                      <div className={styles.confidence}>
                        Confidence: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className={styles.reasoning}>
                      <strong>Key Indicators:</strong>
                      <ul>
                        {prediction.reasoning.slice(0, 2).map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div> 
                          {...getTooltipContent('riskScore')!} 
                          position="left"
                          size="medium"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.riskDetails}>
                    <div className={styles.confidence}>
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                      {getTooltipContent('predictionConfidence') && (
                        <InfoTooltip 
                          {...getTooltipContent('predictionConfidence')!} 
                          position="bottom"
                          size="medium"
                        />
                      )}
                    </div>
                    
                    <div className={styles.reasoning}>
                      <ul>
                        {prediction.reasoning.slice(0, 2).map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                        {prediction.reasoning.length > 2 && (
                          <li>+{prediction.reasoning.length - 2} more factors</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Details */}
        {showModelDetails && model && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Brain size={20} />
              Decision Tree Model
              {getTooltipContent('decisionTreeModel') && (
                <InfoTooltip 
                  {...getTooltipContent('decisionTreeModel')!} 
                  position="bottom"
                  size="large"
                />
              )}
            </h2>
            
            <div className={styles.modelDetails}>
              <div className={styles.modelInfo}>
                <h3>Model Information</h3>
                <div className={styles.modelStats}>
                  <div>Training Date: {model.trainingDate.toLocaleDateString()}</div>
                  <div>Max Depth: 4 levels</div>
                  <div>Min Samples per Leaf: 10</div>
                  <div>Training Accuracy: {(model.accuracy * 100).toFixed(1)}%</div>
                </div>
              </div>
              
              <div className={styles.featureImportance}>
                <h3>
                  Feature Importance
                  {getTooltipContent('featureImportance') && (
                    <InfoTooltip 
                      {...getTooltipContent('featureImportance')!} 
                      position="bottom"
                      size="large"
                    />
                  )}
                </h3>
                <div className={styles.importanceChart}>
                  {Object.entries(model.featureImportance).map(([feature, importance]) => (
                    <div key={feature} className={styles.importanceRow}>
                      <div className={styles.featureName}>
                        {FEATURE_EXPLANATIONS[feature as keyof typeof FEATURE_EXPLANATIONS]?.name || feature}
                      </div>
                      <div className={styles.importanceBar}>
                        <div 
                          className={styles.importanceFill}
                          style={{ width: `${importance * 100}%` }}
                        />
                      </div>
                      <div className={styles.importanceValue}>
                        {(importance * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prediction Details Modal */}
      {selectedPrediction && (
        <div className={styles.modal} onClick={() => setSelectedPrediction(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedPrediction.pipelineName}</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedPrediction(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.predictionSummary}>
                <div className={`${styles.predictionResult} ${selectedPrediction.willFail ? styles.willFail : styles.willNotFail}`}>
                  <div className={styles.predictionText}>
                    {selectedPrediction.willFail ? 'WILL LIKELY FAIL' : 'SHOULD RUN NORMALLY'}
                  </div>
                  <div className={styles.predictionConfidence}>
                    {(selectedPrediction.confidence * 100).toFixed(1)}% confidence
                  </div>
                  <div className={styles.riskScoreDisplay}>
                    Risk Score: {selectedPrediction.riskScore}%
                  </div>
                </div>
              </div>
              
              <div className={styles.analysisSection}>
                <h3>Why this prediction?</h3>
                <ul className={styles.reasoningList}>
                  {selectedPrediction.reasoning.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.featuresSection}>
                <h3>Current Features</h3>
                <div className={styles.featureGrid}>
                  {Object.entries(selectedPrediction.features).map(([feature, value]) => {
                    const explanation = FEATURE_EXPLANATIONS[feature as keyof typeof FEATURE_EXPLANATIONS];
                    return (
                      <div key={feature} className={styles.featureCard}>
                        <div className={styles.featureValue}>
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </div>
                        <div className={styles.featureName}>{explanation?.name || feature}</div>
                        <div className={styles.featureDescription}>{explanation?.description}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Explanation Modal */}
      {showModelExplanation && (
        <div className={styles.modal} onClick={() => setShowModelExplanation(false)}>
          <div className={styles.modelExplanationModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>How the Prediction Model Works</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowModelExplanation(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.explanationSection}>
                <h3>🧠 The Algorithm: Decision Tree</h3>
                <p>
                  Our model uses a <strong>Decision Tree</strong> - think of it like a flowchart that asks yes/no questions 
                  about your pipeline to predict if it will fail in the next 2 hours.
                </p>
                
                <div className={styles.algorithmSteps}>
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                      <h4>Data Collection</h4>
                      <p>We analyze 1,000 historical pipeline runs with their success/failure outcomes</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                      <h4>Feature Analysis</h4>
                      <p>For each pipeline, we look at 5 key factors: hours since last run, failure rate, data volume variance, day of week, and time of day</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                      <h4>Tree Building</h4>
                      <p>The algorithm finds the best questions to ask (like "Has it been more than 4 hours since last run?") to separate healthy from failing pipelines</p>
                    </div>
                  </div>
                  
                  <div className={styles.step}>
                    <div className={styles.stepNumber}>4</div>
                    <div className={styles.stepContent}>
                      <h4>Prediction</h4>
                      <p>For a new pipeline, we follow the decision path and get a prediction with confidence score</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>📊 What We Look At (Features)</h3>
                <div className={styles.featureExplanations}>
                  <div className={styles.featureExplanation}>
                    <h4>⏰ Hours Since Last Run</h4>
                    <p>Pipelines that haven't run recently often have accumulated issues. If it's been more than 4-6 hours, failure risk increases significantly.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📈 Average Failure Rate</h4>
                    <p>Historical reliability matters. Pipelines with 15%+ failure rates are inherently riskier than those with 2% failure rates.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📊 Data Volume Variance</h4>
                    <p>Unusual data volumes can overwhelm processing capacity. High variance (60%+) often signals incoming problems.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>📅 Day of Week</h4>
                    <p>Monday mornings show higher failure rates (post-weekend maintenance effects). Weekends have less monitoring coverage.</p>
                  </div>
                  
                  <div className={styles.featureExplanation}>
                    <h4>🕐 Hour of Day</h4>
                    <p>Off-hours (nights/weekends) have higher failure rates due to reduced monitoring and support availability.</p>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>🎯 Example Decision Path</h3>
                <div className={styles.decisionExample}>
                  <div className={styles.decisionPath}>
                    <div className={styles.decisionNode}>
                      <strong>Question 1:</strong> Has it been more than 4 hours since last run?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → Higher Risk</span>
                        <span className={styles.noPath}>NO → Continue...</span>
                      </div>
                    </div>
                    
                    <div className={styles.decisionNode}>
                      <strong>Question 2:</strong> Is the failure rate above 15%?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → High Risk</span>
                        <span className={styles.noPath}>NO → Continue...</span>
                      </div>
                    </div>
                    
                    <div className={styles.decisionNode}>
                      <strong>Question 3:</strong> Is it Monday morning (7-10 AM)?
                      <div className={styles.decisionBranch}>
                        <span className={styles.yesPath}>YES → 85% Failure Risk</span>
                        <span className={styles.noPath}>NO → 15% Failure Risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>✅ Why This Approach Works</h3>
                <div className={styles.whyItWorks}>
                  <div className={styles.benefit}>
                    <h4>Interpretable</h4>
                    <p>Every prediction comes with clear reasoning you can explain to stakeholders</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Fast</h4>
                    <p>Decision trees make predictions in milliseconds, perfect for real-time monitoring</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Realistic</h4>
                    <p>80% accuracy reflects real-world performance - not suspiciously perfect</p>
                  </div>
                  
                  <div className={styles.benefit}>
                    <h4>Actionable</h4>
                    <p>Identifies specific risk factors teams can address proactively</p>
                  </div>
                </div>
              </div>

              <div className={styles.explanationSection}>
                <h3>⚠️ Limitations & Considerations</h3>
                <ul className={styles.limitations}>
                  <li><strong>Proof of Concept:</strong> This is a demonstration model, not production-ready</li>
                  <li><strong>Training Data:</strong> Uses simulated historical data with realistic patterns</li>
                  <li><strong>Simple Features:</strong> Real systems would include more sophisticated metrics</li>
                  <li><strong>Static Model:</strong> Production systems would retrain regularly with new data</li>
                  <li><strong>Human Oversight:</strong> Predictions should always be validated by domain experts</li>
                </ul>
              </div>

              <div className={styles.explanationFooter}>
                <p><strong>Perfect for interviews:</strong> Shows you understand ML fundamentals, can explain complex concepts simply, and think about practical production considerations!</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="predictiveInsights"
      />
    </div>
  );
};

export default PredictiveInsights;
