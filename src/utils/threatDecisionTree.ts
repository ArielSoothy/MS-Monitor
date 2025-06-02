// Decision Tree Implementation for Security Threat Prediction
// Designed for Microsoft MSTIC - Threat Intelligence & Security Operations

import { SecurityFeatures, ThreatType, ThreatSeverity } from '../types';

export interface ThreatDecisionNode {
  feature?: keyof SecurityFeatures;
  threshold?: number;
  left?: ThreatDecisionNode;
  right?: ThreatDecisionNode;
  // Leaf node properties
  threatType?: ThreatType;
  severity?: ThreatSeverity;
  confidence?: number;
  sampleCount?: number;
  reasoning?: string;
}

export interface ThreatPredictionResult {
  threatType: ThreatType;
  severity: ThreatSeverity;
  confidence: number;
  decisionPath: string[];
  reasoning: string[];
  featureImportance: Record<keyof SecurityFeatures, number>;
}

export class ThreatDecisionTree {
  private tree: ThreatDecisionNode;

  constructor() {
    // Build a pre-trained decision tree based on cybersecurity domain knowledge
    // This simulates a tree trained on historical threat data
    this.tree = this.buildExpertTree();
  }

  // Build decision tree based on cybersecurity expertise and MITRE ATT&CK patterns
  private buildExpertTree(): ThreatDecisionNode {
    return {
      feature: 'dataAccessVolume',
      threshold: 50,
      left: {
        feature: 'offHoursActivity',
        threshold: 70,
        left: {
          feature: 'geographicAnomaly',
          threshold: 1000,
          left: {
            feature: 'failedLoginAttempts',
            threshold: 10,
            left: {
              threatType: 'anomalous_access',
              severity: 'medium',
              confidence: 0.72,
              sampleCount: 234,
              reasoning: 'Normal access patterns with minor geographic variance'
            },
            right: {
              threatType: 'credential_abuse',
              severity: 'high',
              confidence: 0.89,
              sampleCount: 67,
              reasoning: 'High failed login attempts suggest credential compromise'
            }
          },
          right: {
            feature: 'privilegeLevel',
            threshold: 7,
            left: {
              threatType: 'suspicious_login',
              severity: 'high',
              confidence: 0.84,
              sampleCount: 89,
              reasoning: 'Geographic anomaly indicates potential account takeover'
            },
            right: {
              threatType: 'privilege_escalation',
              severity: 'critical',
              confidence: 0.91,
              sampleCount: 45,
              reasoning: 'High privilege user with geographic anomaly - critical risk'
            }
          }
        },
        right: {
          feature: 'uniqueResourcesAccessed',
          threshold: 100,
          left: {
            feature: 'vpnUsage',
            threshold: 80,
            left: {
              threatType: 'insider_threat',
              severity: 'high',
              confidence: 0.78,
              sampleCount: 156,
              reasoning: 'High off-hours activity with minimal VPN usage'
            },
            right: {
              threatType: 'anomalous_access',
              severity: 'medium',
              confidence: 0.65,
              sampleCount: 298,
              reasoning: 'Off-hours activity but legitimate VPN usage pattern'
            }
          },
          right: {
            threatType: 'lateral_movement',
            severity: 'critical',
            confidence: 0.88,
            sampleCount: 78,
            reasoning: 'Extensive resource access during off-hours indicates lateral movement'
          }
        }
      },
      right: {
        feature: 'privilegeLevel',
        threshold: 8,
        left: {
          feature: 'offHoursActivity',
          threshold: 60,
          left: {
            feature: 'geographicAnomaly',
            threshold: 500,
            left: {
              threatType: 'data_hoarding',
              severity: 'medium',
              confidence: 0.73,
              sampleCount: 187,
              reasoning: 'High data access volume during business hours'
            },
            right: {
              threatType: 'data_exfiltration',
              severity: 'high',
              confidence: 0.82,
              sampleCount: 112,
              reasoning: 'High data volume with geographic anomaly suggests exfiltration'
            }
          },
          right: {
            feature: 'deviceCount',
            threshold: 4,
            left: {
              threatType: 'data_exfiltration',
              severity: 'critical',
              confidence: 0.94,
              sampleCount: 56,
              reasoning: 'Large data access off-hours from limited devices - strong exfiltration indicator'
            },
            right: {
              threatType: 'insider_threat',
              severity: 'critical',
              confidence: 0.87,
              sampleCount: 89,
              reasoning: 'High data volume across multiple devices during off-hours'
            }
          }
        },
        right: {
          feature: 'uniqueResourcesAccessed',
          threshold: 150,
          left: {
            threatType: 'privilege_escalation',
            severity: 'critical',
            confidence: 0.92,
            sampleCount: 43,
            reasoning: 'High privilege user accessing large data volumes - privilege abuse'
          },
          right: {
            threatType: 'lateral_movement',
            severity: 'critical',
            confidence: 0.96,
            sampleCount: 34,
            reasoning: 'Admin-level user with extensive resource access and high data volume'
          }
        }
      }
    };
  }

  // Make prediction with full decision path tracking
  predict(features: SecurityFeatures): ThreatPredictionResult {
    const decisionPath: string[] = [];
    const reasoning: string[] = [];
    let currentNode = this.tree;

    // Traverse the tree while tracking decisions
    while (currentNode.feature && currentNode.threshold !== undefined) {
      const featureValue = features[currentNode.feature];
      const featureName = this.getFeatureFriendlyName(currentNode.feature);
      
      if (featureValue <= currentNode.threshold) {
        const condition = `${featureName} (${featureValue}) ≤ ${currentNode.threshold}`;
        decisionPath.push(`✓ ${condition}`);
        reasoning.push(`${featureName} is ${featureValue}, which is ≤ ${currentNode.threshold}`);
        currentNode = currentNode.left!;
      } else {
        const condition = `${featureName} (${featureValue}) > ${currentNode.threshold}`;
        decisionPath.push(`✓ ${condition}`);
        reasoning.push(`${featureName} is ${featureValue}, which is > ${currentNode.threshold}`);
        currentNode = currentNode.right!;
      }
    }

    // Add final reasoning from leaf node
    if (currentNode.reasoning) {
      reasoning.push(currentNode.reasoning);
    }

    return {
      threatType: currentNode.threatType!,
      severity: currentNode.severity!,
      confidence: currentNode.confidence!,
      decisionPath,
      reasoning,
      featureImportance: this.calculateFeatureImportance()
    };
  }

  // Convert technical feature names to human-readable names
  private getFeatureFriendlyName(feature: keyof SecurityFeatures): string {
    const nameMap: Record<keyof SecurityFeatures, string> = {
      loginFrequency: 'Login Frequency',
      offHoursActivity: 'Off-Hours Activity %',
      dataAccessVolume: 'Data Access Volume',
      uniqueResourcesAccessed: 'Unique Resources Accessed',
      geographicAnomaly: 'Geographic Distance (km)',
      privilegeLevel: 'Privilege Level',
      accountAge: 'Account Age (days)',
      failedLoginAttempts: 'Failed Login Attempts',
      vpnUsage: 'VPN Usage %',
      deviceCount: 'Device Count'
    };
    return nameMap[feature] || feature;
  }

  // Calculate feature importance based on tree structure
  calculateFeatureImportance(): Record<keyof SecurityFeatures, number> {
    const importance: Record<keyof SecurityFeatures, number> = {
      loginFrequency: 0,
      offHoursActivity: 0,
      dataAccessVolume: 0,
      uniqueResourcesAccessed: 0,
      geographicAnomaly: 0,
      privilegeLevel: 0,
      accountAge: 0,
      failedLoginAttempts: 0,
      vpnUsage: 0,
      deviceCount: 0
    };

    const traverse = (node: ThreatDecisionNode, depth: number, samples: number) => {
      if (node.feature) {
        // Higher importance for features closer to root and with more samples
        const weight = (samples || 1000) / (depth + 1);
        importance[node.feature] += weight;
      }
      if (node.left) traverse(node.left, depth + 1, node.left.sampleCount || 500);
      if (node.right) traverse(node.right, depth + 1, node.right.sampleCount || 500);
    };

    traverse(this.tree, 0, 2000);

    // Normalize to percentages
    const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(importance).forEach(key => {
        importance[key as keyof SecurityFeatures] = (importance[key as keyof SecurityFeatures] / total) * 100;
      });
    }

    return importance;
  }

  // Extract all decision rules for documentation/auditing
  extractAllRules(): string[] {
    const rules: string[] = [];

    const traverse = (node: ThreatDecisionNode, path: string[] = []) => {
      if (!node.feature || node.threshold === undefined) {
        // Leaf node - create rule
        const condition = path.length > 0 ? path.join(' AND ') : 'Default case';
        const rule = `IF ${condition} THEN ${node.threatType?.toUpperCase()} (${node.severity?.toUpperCase()}) - Confidence: ${((node.confidence || 0) * 100).toFixed(1)}%`;
        rules.push(rule);
        return;
      }

      const featureName = this.getFeatureFriendlyName(node.feature);
      const leftPath = [...path, `${featureName} ≤ ${node.threshold}`];
      const rightPath = [...path, `${featureName} > ${node.threshold}`];

      traverse(node.left!, leftPath);
      traverse(node.right!, rightPath);
    };

    traverse(this.tree);
    return rules;
  }

  // Get tree visualization data for UI
  getTreeVisualization(): any {
    const convertNodeForViz = (node: ThreatDecisionNode, id = '0'): any => {
      if (!node.feature || node.threshold === undefined) {
        return {
          id,
          name: `${node.threatType?.replace('_', ' ').toUpperCase()}`,
          severity: node.severity,
          confidence: node.confidence,
          samples: node.sampleCount,
          isLeaf: true
        };
      }

      return {
        id,
        name: `${this.getFeatureFriendlyName(node.feature)}`,
        threshold: node.threshold,
        isLeaf: false,
        children: [
          convertNodeForViz(node.left!, `${id}L`),
          convertNodeForViz(node.right!, `${id}R`)
        ]
      };
    };

    return convertNodeForViz(this.tree);
  }
}
