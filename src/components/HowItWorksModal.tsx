import React from 'react';
import { X, Brain, Database, Activity, AlertTriangle, TrendingUp, GitBranch, HelpCircle, Server } from 'lucide-react';
import styles from './HowItWorksModal.module.css';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: 'overview' | 'pipelines' | 'alerts' | 'dataLineage' | 'predictiveInsights' | 'autonomousAgent' | 'dataEngineering' | 'infrastructure' | 'performance';
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose, section }) => {
  if (!isOpen) return null;

  const sectionContent = {
    dataEngineering: {
      icon: <Database size={24} />,
      title: "Data Engineering - Pipeline Optimization",
      conceptual: {
        title: "What it does",
        content: [
          "Monitors data quality metrics across all threat intelligence pipelines",
          "Tracks schema evolution and management for security data sources",
          "Identifies optimization opportunities for ETL performance",
          "Enforces data compliance for sensitive security telemetry"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Data Quality Metrics**: Automated validation of data quality attributes including completeness, consistency, and accuracy",
          "**Schema Registry**: Centralized schema management with version control and compatibility enforcement",
          "**ETL Performance Analysis**: Profiling of extract, transform, and load jobs with bottleneck identification",
          "**Query Optimization**: Automated query plan analysis with tuning recommendations",
          "**Compliance Automation**: Automated scanning for PII and sensitive data with masking enforcement"
        ]
      },
      implementation: [
        "SQL query optimization with execution plan analysis",
        "Apache Spark performance tuning for data processing jobs",
        "Apache Iceberg for schema evolution management",
        "Azure Data Factory monitoring and optimization"
      ]
    },
    infrastructure: {
      icon: <Server size={24} />,
      title: "Infrastructure - System Monitoring",
      conceptual: {
        title: "What it does",
        content: [
          "Monitors compute, storage, and networking resources for threat intelligence infrastructure",
          "Tracks resource utilization and cost optimization opportunities",
          "Visualizes regional deployment health across global security operations centers",
          "Manages infrastructure security posture and compliance"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Monitor**: Collects and analyzes telemetry data from Azure services",
          "**Azure Resource Graph**: Querying resource configurations across subscriptions",
          "**Cost Management API**: Retrieving and analyzing resource costs and usage",
          "**Azure Security Center**: Security posture management and compliance monitoring",
          "**Capacity Planning**: Predictive scaling based on historical usage patterns"
        ]
      },
      implementation: [
        "Infrastructure as Code (Terraform, ARM templates)",
        "Real-time resource utilization monitoring",
        "Cost optimization recommendations",
        "Auto-scaling configurations based on workload patterns"
      ]
    },
    performance: {
      icon: <TrendingUp size={24} />,
      title: "Performance - Query and System Optimization",
      conceptual: {
        title: "What it does",
        content: [
          "Monitors query performance across security data stores",
          "Analyzes system bottlenecks and resource constraints",
          "Provides optimization recommendations for improved throughput",
          "Tracks SLAs and performance trends over time"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Query Telemetry**: Capturing execution plans and runtime metrics for all security queries",
          "**Resource Monitoring**: Tracking CPU, memory, I/O, and network utilization",
          "**Index Optimization**: Analyzing index usage patterns and recommending improvements",
          "**Caching Strategies**: Implementing and monitoring query result caching",
          "**Anomaly Detection**: Identifying unusual performance degradation patterns"
        ]
      },
      implementation: [
        "Query performance data collection and analysis",
        "Azure Data Explorer cluster optimization",
        "Kusto Query Language (KQL) query tuning",
        "Resource usage trend analysis and forecasting"
      ]
    },
    overview: {
      icon: <Activity size={24} />,
      title: "System Overview - Real-time Monitoring",
      conceptual: {
        title: "What it does",
        content: [
          "Provides a real-time health dashboard of all threat intelligence data pipelines",
          "Aggregates metrics from 160+ pipelines processing LinkedIn, Twitter, GitHub, Office365, and AzureAD data",
          "Shows system-wide health, ingestion rates, and processing performance",
          "Displays trend analysis and capacity utilization across the entire MSTIC infrastructure"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Monitor Integration**: Collects telemetry from Application Insights, Log Analytics, and custom metrics",
          "**Event Hub Streaming**: Real-time data ingestion rates from Azure Event Hubs processing threat intelligence feeds",
          "**Kusto Queries**: KQL queries aggregate pipeline health from Azure Data Explorer clusters storing security telemetry",
          "**Service Fabric Monitoring**: Tracks health of microservices running on Service Fabric clusters",
          "**Auto-scaling Metrics**: Monitors Azure Functions consumption and scale-out patterns",
          "**Cross-region Replication**: Tracks data synchronization between Microsoft's global security centers"
        ]
      },
      implementation: [
        "Uses Azure Monitor REST APIs for real-time metrics collection",
        "WebSocket connections for live dashboard updates (SignalR in production)",
        "Caches frequently accessed metrics in Redis for sub-second response times",
        "Implements circuit breakers for external API dependencies"
      ]
    },
    pipelines: {
      icon: <Database size={24} />,
      title: "Pipeline Management - Individual Pipeline Monitoring",
      conceptual: {
        title: "What it does",
        content: [
          "Monitors each individual threat intelligence pipeline's health and performance",
          "Tracks processing times, failure rates, and data throughput for each source",
          "Provides detailed execution logs and error diagnostics",
          "Enables manual pipeline controls (start, stop, restart) with proper authorization"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Data Factory**: Each pipeline is an ADF pipeline with monitoring hooks and custom activities",
          "**Azure Functions**: Serverless processing components with Application Insights telemetry",
          "**Service Bus Queues**: Message-driven pipeline orchestration with dead letter handling",
          "**Azure DevOps**: CI/CD integration for pipeline deployment and configuration management",
          "**Key Vault Integration**: Secure storage and rotation of API keys for external threat intel sources",
          "**Azure SQL**: Pipeline metadata, execution history, and configuration stored in managed databases",
          "**Logic Apps**: Workflow orchestration for complex multi-step threat intelligence processing"
        ]
      },
      implementation: [
        "REST APIs to Azure Data Factory for pipeline status and control",
        "Application Insights SDK for custom telemetry and dependency tracking",
        "Azure Resource Manager templates for infrastructure as code",
        "Managed Identity for secure service-to-service authentication"
      ]
    },
    alerts: {
      icon: <AlertTriangle size={24} />,
      title: "Alert Management - Intelligent Monitoring & Notification",
      conceptual: {
        title: "What it does",
        content: [
          "Monitors pipeline health and automatically generates alerts based on configurable rules",
          "Correlates related failures to reduce alert noise and identify root causes",
          "Integrates with Microsoft Teams and ServiceNow for incident management",
          "Provides alert escalation and on-call rotation management"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Monitor Alerts**: Native alerting on metrics, logs, and activity logs with action groups",
          "**Kusto Alert Rules**: KQL-based alerting on security telemetry patterns in Azure Data Explorer",
          "**Logic Apps**: Complex alert correlation and workflow automation",
          "**ServiceNow Integration**: Automatic incident creation with MSTIC-specific priority rules",
          "**Microsoft Teams**: Bot integration for real-time notifications and alert acknowledgment",
          "**PagerDuty**: Enterprise-grade on-call management with escalation policies",
          "**Azure Security Center**: Integration with security recommendations and compliance alerts"
        ]
      },
      implementation: [
        "Azure Monitor Action Groups for multi-channel notification delivery",
        "Graph API for Teams integration and user presence detection",
        "ServiceNow REST API for ticket creation and status updates",
        "Custom webhook handlers for alert correlation and deduplication"
      ]
    },
    dataLineage: {
      icon: <GitBranch size={24} />,
      title: "Data Lineage - End-to-End Microsoft Technology Stack Visualization",
      conceptual: {
        title: "What it does",
        content: [
          "Visualizes exact Microsoft technology stack used in MSTIC threat intelligence pipelines",
          "Shows granular data flow with specific Azure services, protocols, and infrastructure details",
          "Provides detailed troubleshooting information including resource groups, monitoring endpoints, and dependencies",
          "Enables precise issue identification with service-specific technical specifications and error tracing"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Data Factory**: Orchestrates data ingestion pipelines with Integration Runtime monitoring and lineage tracking",
          "**Azure Synapse Analytics**: Provides Spark-based data transformation with automatic lineage capture from SQL queries",
          "**Azure Event Hubs**: Handles high-throughput streaming with partition-level monitoring and Kafka protocol support",
          "**Azure Data Lake Storage Gen2**: Stores raw and processed threat intelligence with hierarchical namespace and ACL-based security",
          "**Microsoft Graph API**: Securely ingests Office365, Teams, SharePoint, and AzureAD data with managed identity authentication",
          "**Azure Databricks**: Performs advanced analytics and ML feature engineering with MLflow lineage integration",
          "**Azure Monitor + Application Insights**: Tracks end-to-end data flow performance with custom telemetry and dependency mapping",
          "**Azure Key Vault**: Manages API keys, connection strings, and certificates with automatic rotation",
          "**Azure Purview**: Provides enterprise data governance and automated lineage discovery across all Microsoft services"
        ]
      },
      implementation: [
        "Resource Manager APIs for real-time Azure service health and configuration details",
        "Application Insights telemetry correlation for cross-service dependency tracking",
        "Azure Monitor Kusto queries for performance metrics and failure analysis",
        "Microsoft Graph API integration for service principal and managed identity status",
        "Azure DevOps REST APIs for pipeline deployment and configuration management",
        "Custom lineage collectors for Service Bus, Logic Apps, and Azure Functions execution traces"
      ]
    },
    predictiveInsights: {
      icon: <TrendingUp size={24} />,
      title: "Predictive Insights - ML-Powered Failure Prediction",
      conceptual: {
        title: "What it does",
        content: [
          "Uses machine learning to predict pipeline failures before they occur",
          "Analyzes historical patterns, resource utilization, and external dependencies",
          "Provides proactive recommendations for capacity planning and maintenance",
          "Identifies seasonal patterns and anomalies in threat intelligence data processing"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure Machine Learning**: End-to-end ML pipeline for model training, deployment, and monitoring",
          "**Azure Databricks**: Distributed computing for large-scale feature engineering and model training",
          "**MLflow**: Model lifecycle management and experiment tracking",
          "**Azure Cognitive Services**: Anomaly detection APIs for real-time pattern recognition",
          "**Time Series Insights**: Specialized analytics for temporal patterns in pipeline metrics",
          "**AutoML**: Automated model selection and hyperparameter tuning",
          "**ONNX**: Cross-platform model deployment for real-time inference"
        ]
      },
      implementation: [
        "Scikit-learn and XGBoost for ensemble models on pipeline health features",
        "Azure ML endpoints for real-time prediction serving",
        "Feature store for consistent feature engineering across training and inference",
        "A/B testing framework for model performance validation"
      ]
    },
    autonomousAgent: {
      icon: <Brain size={24} />,
      title: "Autonomous Investigation Agent - AI-Powered Incident Response",
      conceptual: {
        title: "What it does",
        content: [
          "Automatically detects and investigates complex pipeline failures",
          "Correlates failures across multiple systems and identifies root causes",
          "Generates detailed investigation reports with actionable recommendations",
          "Learns from historical incidents to improve future investigations"
        ]
      },
      technical: {
        title: "How it works in production at Microsoft",
        content: [
          "**Azure OpenAI Service**: GPT-4 integration for natural language investigation reports",
          "**Azure Cognitive Search**: Vector search for similar incident pattern matching",
          "**Logic Apps**: Orchestration of investigation workflows and evidence collection",
          "**Graph API**: Automated data collection from Teams, SharePoint, and ServiceNow",
          "**Azure Functions**: Event-driven investigation triggers and evidence processing",
          "**Cosmos DB**: Storage of investigation state, findings, and knowledge base",
          "**Azure Event Grid**: Event-driven architecture for real-time investigation triggers"
        ]
      },
      implementation: [
        "LangChain for prompt engineering and LLM orchestration",
        "Custom embedding models for security domain-specific similarity search",
        "State machine implementation for complex investigation workflows",
        "Integration with Microsoft Security Graph for threat intelligence context"
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
            <h3>🎯 What it does</h3>
            <div className={styles.conceptualGrid}>
              {content.conceptual.content.map((item, index) => (
                <div key={index} className={styles.conceptualCard}>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.explanationSection}>
            <h3>🔧 How it works in production at Microsoft</h3>
            <div className={styles.technicalSteps}>
              {content.technical.content.map((item, index) => (
                <div key={index} className={styles.technicalStep}>
                  <div className={styles.stepNumber}>{index + 1}</div>
                  <div className={styles.stepContent}>
                    {item.includes('**') ? (
                      <div dangerouslySetInnerHTML={{
                        __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="service-name">$1</strong>')
                      }} />
                    ) : (
                      <div>{item}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.explanationSection}>
            <h3>⚙️ Technical Implementation Details</h3>
            <div className={styles.implementationGrid}>
              {content.implementation.map((item, index) => (
                <div key={index} className={styles.implementationCard}>
                  <div className={styles.implementationIcon}>💻</div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.msticNote}>
            <div className={styles.noteHeader}>
              <HelpCircle size={16} />
              <span>MSTIC Context</span>
            </div>
            <p>
              This system is designed specifically for Microsoft Security Threat Intelligence Center (MSTIC) 
              operations, handling sensitive threat intelligence data with enterprise-grade security, 
              compliance, and scalability requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;
