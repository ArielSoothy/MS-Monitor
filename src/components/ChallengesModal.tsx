import React from 'react';
import { X, Shield, Database, Activity, AlertTriangle, TrendingUp, GitBranch, Server, Key, Lock, Users } from 'lucide-react';
import styles from './HowItWorksModal.module.css'; // Reusing the same CSS

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'overview' | 'pipelines' | 'alerts' | 'dataLineage' | 'predictiveInsights' | 'autonomousAgent' | 'dataEngineering' | 'infrastructure' | 'performance';
}

const ChallengesModal: React.FC<ChallengesModalProps> = ({ isOpen, onClose, section }) => {
  if (!isOpen) return null;

  const sectionContent = {
    performance: {
      icon: <TrendingUp size={24} />,
      title: "Implementation Challenges - Performance Monitoring",
      challenges: [
        {
          title: "Query Telemetry Collection",
          icon: <Database size={16} />,
          content: "Implementing low-overhead query telemetry collection across globally distributed clusters without impacting production workloads or creating monitoring blind spots"
        },
        {
          title: "Adaptive Thresholds",
          icon: <Activity size={16} />,
          content: "Creating dynamic performance thresholds that adapt to workload patterns, data volumes, and query complexity while avoiding false positive alerts"
        },
        {
          title: "Historical Performance Analysis",
          icon: <TrendingUp size={16} />,
          content: "Building efficient storage and retrieval systems for petabytes of historical query performance data while maintaining sub-second query performance"
        },
        {
          title: "Cross-Layer Correlation",
          icon: <Server size={16} />,
          content: "Correlating performance metrics across infrastructure, database, application, and network layers to accurately pinpoint root causes of performance issues"
        },
        {
          title: "Optimization Recommendation Engine",
          icon: <Key size={16} />,
          content: "Developing an AI-based recommendation engine that can accurately suggest query optimizations across heterogeneous data sources with different query languages and execution engines"
        }
      ]
    },
    overview: {
      icon: <Activity size={24} />,
      title: "Implementation Challenges - Overview Dashboard",
      challenges: [
        {
          title: "Data Access and Authorization",
          icon: <Key size={16} />,
          content: "Setting up proper access controls for sensitive threat intelligence data across multiple Azure subscriptions; implementing least-privilege access for visualization components"
        },
        {
          title: "Real-time Data Aggregation",
          icon: <Activity size={16} />,
          content: "Building high-performance data aggregation pipelines that can process metrics from 160+ threat intelligence sources with sub-second latency while minimizing API throttling"
        },
        {
          title: "Cross-Service Integration",
          icon: <Server size={16} />,
          content: "Integrating with diverse Microsoft service telemetry APIs that have different authentication methods, rate limits, and data formats"
        },
        {
          title: "Performance at Scale",
          icon: <Database size={16} />,
          content: "Optimizing dashboard performance when visualizing thousands of metrics while ensuring minimal browser resource consumption and responsive UI updates"
        },
        {
          title: "Security Compliance",
          icon: <Shield size={16} />,
          content: "Meeting Microsoft security requirements including data residency, encryption at rest/transit, access logging, and audit trails for all dashboard operations"
        }
      ]
    },
    pipelines: {
      icon: <Database size={24} />,
      title: "Implementation Challenges - Pipeline Management",
      challenges: [
        {
          title: "Service Authentication Management",
          icon: <Key size={16} />,
          content: "Managing hundreds of service principals and API keys needed for data connector authentications with secure rotation and revocation procedures"
        },
        {
          title: "Fine-Grained Access Control",
          icon: <Lock size={16} />,
          content: "Implementing role-based access control that limits which teams can see specific pipeline details or execute actions based on data classification and security requirements"
        },
        {
          title: "Pipeline Execution History",
          icon: <Database size={16} />,
          content: "Efficiently storing and retrieving historical pipeline execution data across geographical regions while meeting data retention policies and regulatory requirements"
        },
        {
          title: "Cross-Environment Orchestration",
          icon: <Server size={16} />,
          content: "Coordinating pipeline actions across multiple Microsoft environments (Production, Pre-Prod, Canary) with proper change management and approval workflows"
        },
        {
          title: "Real-time Control Plane",
          icon: <Activity size={16} />,
          content: "Building a secure, audited control plane for pipeline operations with proper circuit breakers and failsafes to prevent cascading failures when starting/stopping pipelines"
        },
        {
          title: "User Activity Auditing",
          icon: <Users size={16} />,
          content: "Implementing comprehensive auditing for all user actions including pipeline restarts, configuration changes, and threshold adjustments with tamper-evident logging"
        }
      ]
    },
    alerts: {
      icon: <AlertTriangle size={24} />,
      title: "Implementation Challenges - Alerts Management",
      challenges: [
        {
          title: "Alert Correlation",
          icon: <Activity size={16} />,
          content: "Building intelligent correlation systems to reduce alert noise by grouping related failures across pipeline dependencies and infrastructure components"
        },
        {
          title: "On-Call Rotation Integration",
          icon: <Users size={16} />,
          content: "Integrating with Microsoft's global on-call system with proper escalation paths, team handoffs, and follow-the-sun coverage for 24/7 operations"
        },
        {
          title: "Alert Thresholding",
          icon: <TrendingUp size={16} />,
          content: "Developing dynamic thresholds that adapt to normal pipeline behavior patterns and avoid false positives during expected data volume fluctuations"
        },
        {
          title: "Notification Security",
          icon: <Shield size={16} />,
          content: "Ensuring alert notifications don't leak sensitive information while still providing enough context for responders to assess severity and take appropriate action"
        },
        {
          title: "Incident Response Automation",
          icon: <Server size={16} />,
          content: "Implementing secure automation for routine incident response tasks that can safely execute remediation without compromising pipeline integrity"
        }
      ]
    },
    dataLineage: {
      icon: <GitBranch size={24} />,
      title: "Implementation Challenges - Data Lineage",
      challenges: [
        {
          title: "Lineage Capture Mechanisms",
          icon: <Database size={16} />,
          content: "Implementing instrumentation across heterogeneous Microsoft services to capture accurate lineage metadata without impacting pipeline performance"
        },
        {
          title: "Secure Cross-Service Tracing",
          icon: <Activity size={16} />,
          content: "Securely correlating data flow across service boundaries while preserving security contexts and access controls for different data classification levels"
        },
        {
          title: "Visualization Performance",
          icon: <TrendingUp size={16} />,
          content: "Rendering complex lineage graphs with thousands of nodes and edges while maintaining interactive performance and usability"
        },
        {
          title: "Compliance Annotations",
          icon: <Shield size={16} />,
          content: "Automatically annotating lineage diagrams with compliance metadata for data sovereignty, retention policies, and regulatory requirements"
        },
        {
          title: "Historical Lineage",
          icon: <Activity size={16} />,
          content: "Efficiently storing and retrieving historical lineage snapshots for auditing and incident investigation without excessive storage requirements"
        }
      ]
    },
    predictiveInsights: {
      icon: <TrendingUp size={24} />,
      title: "Implementation Challenges - Predictive Insights",
      challenges: [
        {
          title: "Feature Engineering Complexity",
          icon: <Database size={16} />,
          content: "Developing predictive features across heterogeneous data sources with varying schemas, freshness guarantees, and availability characteristics"
        },
        {
          title: "Model Security",
          icon: <Shield size={16} />,
          content: "Securing ML model training and serving infrastructure while preventing data leakage or poisoning attacks that could compromise prediction quality"
        },
        {
          title: "Prediction Explanation",
          icon: <Activity size={16} />,
          content: "Creating explainable AI systems that can provide MSTIC analysts with transparent reasoning for failure predictions to build trust and guide investigation"
        },
        {
          title: "Model Performance Drift",
          icon: <TrendingUp size={16} />,
          content: "Detecting and mitigating model drift as pipeline behavior patterns evolve, requiring continuous retraining and validation pipelines"
        },
        {
          title: "Heterogeneous Pipeline Coverage",
          icon: <Server size={16} />,
          content: "Building prediction models that work effectively across diverse pipeline types with different error patterns, data volumes, and operational characteristics"
        }
      ]
    },
    autonomousAgent: {
      icon: <Shield size={24} />,
      title: "Implementation Challenges - Autonomous Agent",
      challenges: [
        {
          title: "Safe Automation Boundaries",
          icon: <Shield size={16} />,
          content: "Establishing clear boundaries for autonomous investigation actions with proper safeguards against unintended consequences or security impacts"
        },
        {
          title: "Knowledge Management",
          icon: <Database size={16} />,
          content: "Building and maintaining an up-to-date knowledge base of pipeline behaviors, error patterns, and remediation steps across the full Microsoft threat intelligence ecosystem"
        },
        {
          title: "Decision Transparency",
          icon: <Activity size={16} />,
          content: "Creating transparent decision logs for all autonomous agent actions to enable audit trails and human oversight of investigation steps"
        },
        {
          title: "Human-AI Collaboration",
          icon: <Users size={16} />,
          content: "Designing effective handoff mechanisms between autonomous systems and human analysts with clear escalation paths for complex scenarios"
        },
        {
          title: "Security Context Preservation",
          icon: <Lock size={16} />,
          content: "Maintaining proper security context during automated investigations to ensure sensitive data access follows least-privilege principles even during automated remediation"
        }
      ]
    },
    dataEngineering: {
      icon: <Database size={24} />,
      title: "Implementation Challenges - Data Engineering",
      challenges: [
        {
          title: "Schema Evolution",
          icon: <Activity size={16} />,
          content: "Managing schema evolution across hundreds of threat intelligence sources with proper versioning, backward compatibility, and migration strategies"
        },
        {
          title: "Data Quality Automation",
          icon: <Shield size={16} />,
          content: "Implementing automated data quality checks with appropriate remediation actions for different data quality issues across various data types"
        },
        {
          title: "ETL Performance Optimization",
          icon: <TrendingUp size={16} />,
          content: "Optimizing ETL processes for terabytes of security telemetry data with cost-effective resource utilization and minimal processing latency"
        },
        {
          title: "Compliance Automation",
          icon: <Lock size={16} />,
          content: "Automating data handling compliance including PII detection, sensitive data masking, and enforcement of data residency requirements across global regions"
        },
        {
          title: "Metadata Management",
          icon: <Database size={16} />,
          content: "Building comprehensive metadata management for all data assets with proper documentation, ownership, and data classification integrated with Microsoft's enterprise systems"
        }
      ]
    },
    infrastructure: {
      icon: <Server size={24} />,
      title: "Implementation Challenges - Infrastructure",
      challenges: [
        {
          title: "Multi-Region Deployment",
          icon: <Server size={16} />,
          content: "Managing infrastructure across Microsoft's global security operations centers with proper data sovereignty, latency optimization, and disaster recovery capabilities"
        },
        {
          title: "Infrastructure as Code",
          icon: <Activity size={16} />,
          content: "Implementing GitOps-based infrastructure provisioning with proper approval workflows, security scanning, and compliance validation before deployment"
        },
        {
          title: "Cost Optimization",
          icon: <TrendingUp size={16} />,
          content: "Optimizing resource utilization across hundreds of Azure services with appropriate autoscaling, retention policies, and workload scheduling"
        },
        {
          title: "Security Posture Management",
          icon: <Shield size={16} />,
          content: "Maintaining secure infrastructure configuration with automated vulnerability scanning, patch management, and security baseline compliance"
        },
        {
          title: "Observability Stack",
          icon: <Activity size={16} />,
          content: "Building comprehensive observability with distributed tracing, log aggregation, and metric collection across all infrastructure components"
        }
      ]
    }
  };

  const content = sectionContent[section];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleSection}>
            {content.icon}
            <h2>{content.title}</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.explanationSection}>
            <h3>🛠️ Implementation Challenges & Considerations</h3>
            <div className={styles.challengesContainer}>
              {content.challenges.map((challenge, index) => (
                <div key={index} className={styles.challengeCard}>
                  <div className={styles.challengeHeader}>
                    <div className={styles.challengeIcon}>{challenge.icon}</div>
                    <h4>{challenge.title}</h4>
                  </div>
                  <p>{challenge.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.msticNote}>
            <div className={styles.noteHeader}>
              <Shield size={16} />
              <span>Enterprise Considerations</span>
            </div>
            <p>
              Building a production-ready system for Microsoft's security operations would involve addressing 
              the above challenges while meeting enterprise requirements for security, compliance, scalability, 
              and global distribution. These challenges represent significant engineering complexity beyond 
              typical data visualization dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesModal;
