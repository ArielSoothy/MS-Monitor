// Centralized tooltip content for MSTIC Monitor Dashboard
// This provides comprehensive explanations for all metrics and concepts

export interface TooltipContent {
  title: string;
  content: string;
  detailedContent?: string;
  msticContext?: string;
}

export const TOOLTIP_CONTENT: Record<string, TooltipContent> = {
  // Data Quality Metrics
  dataQuality: {
    title: "Data Quality Score",
    content: "Percentage indicating the completeness, accuracy, and consistency of data flowing through this pipeline.",
    detailedContent: "Calculated based on: schema validation (40%), completeness (30%), consistency checks (20%), and freshness (10%). Scores above 95% are considered excellent.",
    msticContext: "Critical for threat intelligence accuracy - poor data quality can lead to false positives or missed threats."
  },

  recordsPerSecond: {
    title: "Records per Second (RPS)",
    content: "The current throughput rate of data records being processed by this pipeline.",
    detailedContent: "Measured as a rolling 5-minute average. Normal rates vary by source: social media (1000-5000 RPS), email (100-500 RPS), file systems (10-100 RPS).",
    msticContext: "High throughput ensures real-time threat detection capabilities. Sudden drops may indicate infrastructure issues or attack patterns."
  },

  avgProcessingTime: {
    title: "Average Processing Time",
    content: "Mean execution duration over recent runs",
    detailedContent: "Average time (in minutes) for pipeline completion over the last 24-hour period. Calculated from start to finish of data ingestion, processing, and storage operations.",
    msticContext: "Performance baseline for capacity planning and SLA monitoring. Sudden increases may indicate data volume spikes or system performance degradation."
  },

  connections: {
    title: "Pipeline Connections",
    content: "Number of upstream and downstream systems connected to this pipeline component.",
    detailedContent: "Includes data sources, transformation steps, enrichment services, and destination systems. High connectivity indicates critical infrastructure components.",
    msticContext: "More connections mean higher impact if this component fails. Used for dependency mapping and incident impact assessment."
  },

  // Pipeline Status Indicators
  healthyStatus: {
    title: "Healthy Status",
    content: "Pipeline is operating within normal parameters with no detected issues.",
    detailedContent: "All health checks passing: connectivity ✓, performance metrics within SLA ✓, data quality above threshold ✓, no recent errors ✓.",
    msticContext: "Green status indicates full operational capability for threat detection and response activities."
  },

  warningStatus: {
    title: "Warning Status",
    content: "Pipeline has detected minor issues that don't impact core functionality but require monitoring.",
    detailedContent: "Possible causes: elevated response times, minor data quality degradation, high resource utilization (>80%), or recent recoverable errors.",
    msticContext: "Yellow status suggests potential future issues. Proactive monitoring prevents escalation to critical failures."
  },

  failedStatus: {
    title: "Failed Status",
    content: "Pipeline has critical errors preventing normal operation and requires immediate attention.",
    detailedContent: "Common causes: connectivity failures, authentication issues, resource exhaustion, data corruption, or dependency failures.",
    msticContext: "Red status means compromised threat detection capability. Immediate incident response required to restore security monitoring."
  },

  processingStatus: {
    title: "Processing Status",
    content: "Pipeline is currently handling a large batch operation or performing maintenance tasks.",
    detailedContent: "Temporary state during: bulk data ingestion, schema migrations, index rebuilding, or scheduled maintenance windows.",
    msticContext: "Blue status indicates planned operations. Real-time alerting may be temporarily reduced during processing windows."
  },

  // System Metrics
  systemHealth: {
    title: "Overall System Health",
    content: "Aggregate health score across all pipelines and infrastructure components.",
    detailedContent: "Weighted average considering: critical pipeline status (50%), resource utilization (25%), error rates (15%), and SLA compliance (10%).",
    msticContext: "Primary indicator for MSTIC operational readiness. Scores below 85% trigger escalation procedures."
  },

  ingestionRate: {
    title: "Total Ingestion Rate",
    content: "Combined data ingestion rate across all active pipelines, measured in records per second.",
    detailedContent: "Includes all data sources: LinkedIn (25%), Twitter (20%), Office365 (20%), GitHub (15%), AzureAD (10%), Other (10%).",
    msticContext: "Higher ingestion rates provide better threat landscape visibility but require more processing resources."
  },

  processedRecords: {
    title: "Records Processed",
    content: "Total number of data records successfully processed in the current time period.",
    detailedContent: "Cumulative count reset daily at 00:00 UTC. Includes successful validations, enrichments, and storage operations.",
    msticContext: "Volume indicator for threat intelligence coverage. Low counts may indicate data source issues or processing bottlenecks."
  },

  failureRate: {
    title: "Failure Rate",
    content: "Percentage of processing attempts that resulted in errors or failures.",
    detailedContent: "Calculated as (failed_records / total_attempts) × 100. Includes validation failures, processing errors, and timeout issues. Target: <2%.",
    msticContext: "High failure rates reduce threat detection accuracy and may indicate attack attempts against the monitoring infrastructure."
  },

  // Resource Utilization
  cpuUtilization: {
    title: "CPU Utilization",
    content: "Current processor usage across all pipeline compute resources.",
    detailedContent: "Measured as weighted average across: Azure Data Factory nodes, Event Hubs partitions, and Stream Analytics units. Alerts at >85%.",
    msticContext: "High CPU usage may delay real-time threat processing. Auto-scaling triggers at 80% to maintain response times."
  },

  memoryUsage: {
    title: "Memory Usage",
    content: "Current RAM utilization across processing nodes and caching systems.",
    detailedContent: "Includes: application memory, data buffers, ML model caches, and temporary storage. Memory pressure affects processing speed.",
    msticContext: "Memory constraints can cause processing delays or data loss during high-volume threat events."
  },

  storageUtilization: {
    title: "Storage Utilization",
    content: "Current usage of data storage systems including data lakes, databases, and caches.",
    detailedContent: "Covers: Azure Data Lake (hot storage), SQL databases (operational data), Redis caches (real-time data), and archive storage.",
    msticContext: "Storage capacity planning critical for retaining threat intelligence data for historical analysis and compliance."
  },

  networkThroughput: {
    title: "Network Throughput",
    content: "Current network bandwidth utilization for data transfer between pipeline components.",
    detailedContent: "Measures: inbound data ingestion, inter-service communication, and outbound alert delivery. Includes both Azure internal and external traffic.",
    msticContext: "Network bottlenecks can delay threat data propagation and alert delivery to security teams."
  },

  // Alert & Monitoring Metrics
  activeAlerts: {
    title: "Active Alerts",
    content: "Number of unresolved alerts currently requiring attention across all pipeline components.",
    detailedContent: "Categorized by severity: Critical (immediate action), Warning (monitoring required), Info (awareness only). Includes both system and security alerts.",
    msticContext: "Alert volume indicates system stability and potential security incidents. High counts may signal infrastructure attacks."
  },

  alertTrends: {
    title: "Alert Trends",
    content: "Historical pattern of alert generation showing system stability over time.",
    detailedContent: "7-day rolling average with anomaly detection. Sudden spikes may indicate: infrastructure issues, security events, or data source problems.",
    msticContext: "Trend analysis helps identify recurring issues and potential attack patterns against the monitoring infrastructure."
  },

  mttr: {
    title: "Mean Time to Resolution (MTTR)",
    content: "Average time required to resolve alerts and restore normal operations.",
    detailedContent: "Measured from alert generation to resolution confirmation. Target MTTR: Critical <15min, Warning <2hr, Info <24hr.",
    msticContext: "Fast resolution times are critical for maintaining continuous threat monitoring capabilities."
  },

  slaCompliance: {
    title: "SLA Compliance",
    content: "Percentage of operations meeting defined Service Level Agreement targets.",
    detailedContent: "Tracks: processing time SLAs (95% <1sec), availability SLAs (99.9% uptime), and data quality SLAs (98% accuracy).",
    msticContext: "SLA compliance ensures reliable threat detection capabilities for Microsoft's security posture."
  },

  // Microsoft Technology Stack
  azureDataFactory: {
    title: "Azure Data Factory",
    content: "Microsoft's cloud-based data integration service for creating data pipelines.",
    detailedContent: "Handles: data ingestion, transformation, and orchestration across hybrid environments. Supports 90+ connectors for various data sources.",
    msticContext: "Primary orchestration platform for MSTIC threat intelligence data workflows and automated response actions."
  },

  eventHubs: {
    title: "Azure Event Hubs",
    content: "Real-time data streaming platform capable of processing millions of events per second.",
    detailedContent: "Provides: event ingestion, partitioning, retention (1-7 days), and consumer group management. Supports AMQP, HTTP, and Kafka protocols.",
    msticContext: "Critical for real-time threat data ingestion from various security tools and external sources."
  },

  streamAnalytics: {
    title: "Azure Stream Analytics",
    content: "Real-time analytics service for processing streaming data with SQL-like queries.",
    detailedContent: "Features: windowing functions, temporal joins, anomaly detection, and machine learning integration. Sub-second latency for real-time alerting.",
    msticContext: "Enables real-time threat pattern recognition and automated security response triggering."
  },

  cosmosDB: {
    title: "Azure Cosmos DB",
    content: "Globally distributed, multi-model database service with guaranteed low latency.",
    detailedContent: "Supports: multiple APIs (SQL, MongoDB, Cassandra), automatic scaling, and 99.999% availability SLA.",
    msticContext: "Stores real-time threat intelligence data and supports global threat correlation across Microsoft's infrastructure."
  },

  dataLake: {
    title: "Azure Data Lake Storage",
    content: "Scalable data storage optimized for big data analytics workloads.",
    detailedContent: "Features: hierarchical namespace, fine-grained access control, and integration with analytics services. Stores petabytes of threat data.",
    msticContext: "Long-term storage for threat intelligence data enabling historical analysis and threat hunting activities."
  },

  // Security & Authentication
  managedIdentity: {
    title: "Managed Identity",
    content: "Azure's solution for securely accessing resources without storing credentials in code.",
    detailedContent: "Automatically managed by Azure AD, eliminates credential management, supports RBAC, and provides audit trails for all access.",
    msticContext: "Ensures secure access to threat intelligence data while maintaining compliance with security policies."
  },

  keyVault: {
    title: "Azure Key Vault",
    content: "Centralized service for securely storing and managing secrets, keys, and certificates.",
    detailedContent: "Hardware Security Module (HSM) backing available, supports key rotation, access policies, and compliance logging.",
    msticContext: "Protects API keys, connection strings, and certificates used for accessing external threat intelligence sources."
  },

  rbac: {
    title: "Role-Based Access Control",
    content: "Security model that restricts system access based on user roles and responsibilities.",
    detailedContent: "Principle of least privilege, fine-grained permissions, audit trails, and integration with Azure AD for identity management.",
    msticContext: "Ensures only authorized personnel can access sensitive threat intelligence data and modify security configurations."
  },

  // Monitoring & Observability
  applicationInsights: {
    title: "Application Insights",
    content: "Microsoft's application performance management service for monitoring live applications.",
    detailedContent: "Provides: performance metrics, dependency tracking, exception monitoring, and user analytics with ML-powered insights.",
    msticContext: "Monitors MSTIC application performance and helps identify issues affecting threat detection capabilities."
  },

  logAnalytics: {
    title: "Log Analytics Workspace",
    content: "Centralized logging service for collecting, analyzing, and acting on telemetry data.",
    detailedContent: "Kusto Query Language (KQL) for analysis, custom dashboards, alerting rules, and integration with Azure Sentinel.",
    msticContext: "Central repository for all system logs enabling forensic analysis and threat hunting across the entire infrastructure."
  },

  kusto: {
    title: "Azure Data Explorer (Kusto)",
    content: "Fast and highly scalable data exploration service for analyzing large volumes of structured and unstructured data.",
    detailedContent: "Optimized for log and telemetry data, supports complex queries, real-time ingestion, and machine learning integration.",
    msticContext: "Primary query engine for threat hunting and advanced analytics on historical threat intelligence data."
  },

  // Data Lineage Specific
  lineageTracking: {
    title: "Data Lineage Tracking",
    content: "Visual representation of data flow from source systems through transformations to final destinations.",
    detailedContent: "Shows: data dependencies, transformation logic, quality checkpoints, and impact analysis for changes or failures.",
    msticContext: "Critical for understanding threat data provenance and impact analysis when investigating security incidents."
  },

  upstreamDependency: {
    title: "Upstream Dependencies",
    content: "Source systems or processes that provide data input to the current pipeline component.",
    detailedContent: "Includes: external APIs, database connections, file systems, and other pipeline outputs. Failure upstream affects downstream processing.",
    msticContext: "Understanding dependencies helps prioritize incident response and assess threat detection capability impact."
  },

  downstreamImpact: {
    title: "Downstream Impact",
    content: "Systems and processes that depend on data output from the current pipeline component.",
    detailedContent: "Affects: analytical models, alerting systems, reporting dashboards, and external integrations. High impact components require priority attention.",
    msticContext: "Failure impact assessment for maintaining continuous threat monitoring and response capabilities."
  },

  // Error Codes and Diagnostics
  errorCode: {
    title: "Error Code",
    content: "Unique identifier for specific types of errors or failures within the pipeline system.",
    detailedContent: "Format: [COMPONENT]-[CATEGORY]-[NUMBER]. Categories: CONN (connectivity), AUTH (authentication), DATA (data quality), PROC (processing).",
    msticContext: "Enables rapid diagnosis and resolution of issues affecting threat detection capabilities."
  },

  stackTrace: {
    title: "Stack Trace",
    content: "Detailed execution path showing exactly where an error occurred in the application code.",
    detailedContent: "Includes: method calls, line numbers, parameter values, and execution context. Essential for debugging complex pipeline issues.",
    msticContext: "Technical details for developers to quickly identify and fix issues affecting security monitoring systems."
  },

  correlationId: {
    title: "Correlation ID",
    content: "Unique identifier that tracks a specific request or operation across multiple system components.",
    detailedContent: "Enables distributed tracing, helps correlate logs across services, and supports end-to-end transaction monitoring.",
    msticContext: "Critical for tracking threat intelligence data flow and diagnosing cross-system issues."
  },

  // Overview Page Specific Metrics
  totalPipelines: {
    title: "Total Pipelines",
    content: "Complete count of all threat intelligence pipelines across all data sources and regions.",
    detailedContent: "Includes all pipeline statuses: healthy, warning, failed, and processing. Covers 10 data sources: LinkedIn, Twitter, Office365, AzureAD, GitHub, ThreatIntel, Exchange, Teams, SharePoint, and PowerBI.",
    msticContext: "Total infrastructure capacity for threat intelligence collection. 160+ pipelines ensure comprehensive coverage of Microsoft's security threat landscape."
  },

  pipelineStatusDistribution: {
    title: "Pipeline Status Distribution",
    content: "Visual breakdown of all pipelines by their current operational status.",
    detailedContent: "Healthy (green): Operating normally, Warning (yellow): Minor issues detected, Failed (red): Critical errors requiring attention, Processing (blue): Currently handling operations.",
    msticContext: "Quick health assessment of entire threat intelligence infrastructure. High failure rates indicate potential security blind spots."
  },

  teamHealthPerformance: {
    title: "Team Health Performance",
    content: "Health score rankings for teams managing threat intelligence pipelines, showing operational effectiveness.",
    detailedContent: "Health percentage calculated as (healthy_pipelines / total_pipelines) × 100. Shows teams with minimum 3 pipelines for statistical relevance.",
    msticContext: "Identifies which teams need support and which demonstrate best practices for threat intelligence operations."
  },

  dataClassificationStatus: {
    title: "Data Classification Status",
    content: "Security classification breakdown showing pipeline health by data sensitivity level.",
    detailedContent: "Classifications: Public (external data), Internal (Microsoft internal), Confidential (restricted access), Secret (highest security). Health tracked per classification.",
    msticContext: "Ensures high-security data pipelines receive priority attention for maintaining Microsoft's security posture."
  },

  ingestionRateTrend: {
    title: "Ingestion Rate Trend (24 Hours)",
    content: "Real-time throughput showing data ingestion volume across all pipelines over the last 24 hours.",
    detailedContent: "Measured in files per hour, updated every 5 minutes. Includes all data sources with normal ranges: social media (800-1300 files/hour), enterprise (400-600 files/hour).",
    msticContext: "Monitors threat intelligence data flow consistency. Drops may indicate source issues or infrastructure problems affecting security coverage."
  },

  topFailingPipelines: {
    title: "Top Failing Pipelines",
    content: "List of pipelines with highest failure rates requiring immediate attention and remediation.",
    detailedContent: "Sorted by failure percentage with details: pipeline name, source, owning team, current status, failure rate, and SLA requirement.",
    msticContext: "Priority list for incident response teams. High-failure pipelines may represent critical gaps in threat detection capabilities."
  },

  systemHealthScore: {
    title: "System Health Score",
    content: "Aggregate health percentage representing overall operational status of the threat intelligence infrastructure.",
    detailedContent: "Weighted calculation: Healthy pipelines (100%), Warning (70%), Processing (85%), Failed (0%). Scores above 90% indicate excellent health.",
    msticContext: "Primary indicator for Microsoft security operations readiness. Low scores trigger escalation procedures to maintain threat detection capabilities."
  },

  slaBreaches: {
    title: "SLA Breaches",
    content: "Count of pipelines currently exceeding their defined Service Level Agreement processing time requirements.",
    detailedContent: "Calculated by comparing time since last run against SLA requirement (typically 60-240 minutes). Excludes currently processing pipelines.",
    msticContext: "Indicates potential degradation in threat response timing. SLA breaches may delay critical security alert generation."
  },

  // Pipeline Management Specific Tooltips
  pipelineSearch: {
    title: "Pipeline Search",
    content: "Search across pipeline names, source systems, and owner teams",
    detailedContent: "Advanced search functionality that filters pipelines by name, source system (LinkedIn, Twitter, Office365, etc.), and responsible team. Supports partial matching and real-time filtering.",
    msticContext: "Essential for quickly locating specific pipelines in large enterprise environments with hundreds of threat intelligence feeds."
  },

  pipelineStatusFilter: {
    title: "Pipeline Status Filtering",
    content: "Filter pipelines by operational status",
    detailedContent: "Multi-select status filtering allowing you to focus on specific pipeline states: Healthy (operational), Warning (performance issues), Failed (critical errors), or Processing (currently running).",
    msticContext: "Critical for incident response and operational oversight - allows rapid identification of problematic pipelines requiring immediate attention."
  },

  pipelineSorting: {
    title: "Pipeline Sorting Options",
    content: "Sort pipelines by various operational metrics",
    detailedContent: "Sort pipelines by Name (alphabetical), Last Run (temporal), Status (operational priority), Source (system grouping), or Failure Rate (reliability metrics). Supports ascending/descending order.",
    msticContext: "Enables operational prioritization - sort by failure rate to identify reliability issues, or by last run to find stale pipelines."
  },

  sourceSystemFilter: {
    title: "Source System Filter",
    content: "Filter by data source platform",
    detailedContent: "Filter pipelines by their originating data source: LinkedIn (professional networks), Twitter (social media), Office365 (enterprise communication), AzureAD (identity management), GitHub (code repositories), and others.",
    msticContext: "Crucial for source-specific incident response and understanding threat landscape coverage across different platforms."
  },

  ownerTeamFilter: {
    title: "Owner Team Filter",
    content: "Filter by responsible team",
    detailedContent: "Filter pipelines by the team responsible for maintenance and operations. Teams include Security Operations, Threat Intelligence, Data Engineering, and specialized regional teams.",
    msticContext: "Essential for organizational accountability and during incidents to quickly contact responsible teams for specific pipeline issues."
  },

  dataClassificationFilter: {
    title: "Data Classification Filter",
    content: "Filter by data sensitivity level",
    detailedContent: "Filter pipelines by data classification: Public (open source), Internal (company confidential), Confidential (restricted access), or Restricted (highest security). Each level has different security requirements.",
    msticContext: "Critical for compliance and security - ensures appropriate access controls and handling procedures based on data sensitivity."
  },

  pipelineLastRun: {
    title: "Pipeline Last Run",
    content: "Time since last successful execution",
    detailedContent: "Timestamp of the most recent pipeline execution attempt, displayed as relative time (minutes, hours, or days ago). Critical for identifying stale or stuck pipelines.",
    msticContext: "Key operational metric - pipelines not running recently may indicate configuration issues, dependency failures, or system outages affecting threat intelligence freshness."
  },

  recordsPerHour: {
    title: "Records Per Hour",
    content: "Throughput rate of data processing",
    detailedContent: "Calculated throughput showing records processed per hour based on recent processing times and volumes. Indicates pipeline efficiency and capacity utilization.",
    msticContext: "Operational metric for understanding data flow rates and identifying bottlenecks in threat intelligence ingestion. Critical for capacity planning."
  },

  pipelineFailureRate: {
    title: "Pipeline Failure Rate",
    content: "Percentage of failed executions",
    detailedContent: "Percentage of pipeline runs that failed over the last 24-hour period. Calculated as (failed runs / total runs) × 100. High rates indicate reliability issues requiring attention.",
    msticContext: "Key reliability metric for operational excellence. Rates above 5% trigger automated alerts and may require immediate engineering intervention."
  },

  pipelineActions: {
    title: "Pipeline Actions",
    content: "Control pipeline execution and configuration",
    detailedContent: "Action buttons for pipeline management: Play (start manual execution), Pause (stop current execution), and Settings (modify configuration). Actions respect role-based access controls.",
    msticContext: "Operational controls for incident response and maintenance. Emergency stop capabilities are crucial during security incidents or data quality issues."
  },

  processingTimeTrend: {
    title: "24-Hour Processing Time Trend",
    content: "Historical performance over the last day",
    detailedContent: "Line chart showing processing time variations over the past 24 hours. Helps identify performance patterns, peak load times, and potential bottlenecks or optimizations.",
    msticContext: "Performance analysis tool for understanding operational patterns and optimizing pipeline scheduling to avoid peak system load periods."
  },

  recentIssues: {
    title: "Recent Pipeline Issues",
    content: "Error log and warning history",
    detailedContent: "Chronological list of recent errors, warnings, and SLA breaches. Includes timestamps, error messages, and severity levels for troubleshooting and root cause analysis.",
    msticContext: "Critical for incident response and reliability improvement. Provides immediate context for pipeline failures and operational issues."
  },

  pipelineConfiguration: {
    title: "Pipeline Configuration Details",
    content: "Technical and operational settings",
    detailedContent: "Comprehensive configuration including owner team, data classification, deployment region, SLA requirements, data types, processing methods, and maintenance windows.",
    msticContext: "Essential metadata for operations, compliance, and troubleshooting. Includes security controls and operational parameters required for enterprise governance."
  },

  pipelineDependencies: {
    title: "Pipeline Dependencies",
    content: "Upstream data source relationships",
    detailedContent: "List of other pipelines that this pipeline depends on for data or processing. Shows dependency status to help understand failure propagation and processing order.",
    msticContext: "Critical for understanding failure impact and scheduling. Failed upstream pipelines can cascade failures throughout the threat intelligence processing chain."
  },

  pipelineRegion: {
    title: "Deployment Region",
    content: "Geographic location of pipeline infrastructure",
    detailedContent: "Azure region where the pipeline infrastructure is deployed (East US, West Europe, etc.). Affects data residency, latency, and regulatory compliance requirements.",
    msticContext: "Important for data sovereignty compliance and latency optimization. Regional deployments ensure data remains in appropriate jurisdictions."
  },

  slaRequirement: {
    title: "SLA Requirement",
    content: "Service Level Agreement processing time limit",
    detailedContent: "Maximum allowed processing time (in minutes) as defined by the Service Level Agreement. Breaches trigger automated alerts and escalation procedures.",
    msticContext: "Contractual commitment for threat intelligence freshness. Critical for maintaining operational service levels and customer satisfaction."
  },

  maintenanceWindow: {
    title: "Maintenance Window",
    content: "Scheduled downtime for updates and maintenance",
    detailedContent: "Defined time periods when pipeline maintenance, updates, or configuration changes can be performed with minimal operational impact.",
    msticContext: "Operational planning tool to minimize threat intelligence gaps during necessary system maintenance and updates."
  },

  pipelineDataType: {
    title: "Data Type",
    content: "Category of threat intelligence data processed",
    detailedContent: "Specific type of threat intelligence data: IOCs (Indicators of Compromise), TTPs (Tactics, Techniques, Procedures), Vulnerabilities, Attribution data, or Contextual intelligence.",
    msticContext: "Classification helps analysts understand the type of threat intelligence being processed and its operational value for security operations."
  },

  pipelineProcess: {
    title: "Processing Method",
    content: "Technical approach for data processing",
    detailedContent: "Processing methodology: Real-time (immediate processing), Batch (scheduled bulk processing), Stream (continuous flow processing), or Hybrid (combination of approaches).",
    msticContext: "Technical architecture detail affecting latency, throughput, and resource utilization. Critical for understanding data freshness and system capacity."
  },

  recordsProcessed: {
    title: "Records Processed",
    content: "Total data records handled by pipeline",
    detailedContent: "Cumulative count of individual data records (IOCs, events, alerts) processed by the pipeline. Indicates data volume and pipeline capacity utilization.",
    msticContext: "Volume metric for understanding pipeline load and capacity planning. High record counts may indicate increased threat activity or expanded data sources."
  },

  // Alert Management Specific Tooltips
  alertSearch: {
    title: "Alert Search",
    content: "Search alerts by message content or pipeline name",
    detailedContent: "Search functionality allows filtering alerts by alert message, pipeline name, or error details. Supports partial text matching and is case-insensitive.",
    msticContext: "Quick search capability is essential for finding specific alerts during incident response or troubleshooting sessions."
  },

  criticalAlerts: {
    title: "Critical Alerts",
    content: "High-priority alerts requiring immediate attention",
    detailedContent: "Critical alerts indicate severe issues that could compromise security monitoring capabilities or indicate active threats. These require immediate investigation and resolution to maintain security posture.",
    msticContext: "Critical alerts often indicate failed threat intelligence feeds, security tool outages, or potential attacks against the monitoring infrastructure itself."
  },

  warningAlerts: {
    title: "Warning Alerts", 
    content: "Medium-priority alerts indicating potential issues",
    detailedContent: "Warning alerts signal degraded performance or potential problems that may escalate if not addressed. These include SLA breaches, resource constraints, or data quality issues.",
    msticContext: "Warning alerts help maintain operational excellence and prevent critical failures in threat intelligence processing."
  },

  infoAlerts: {
    title: "Info Alerts",
    content: "Low-priority informational alerts for awareness",
    detailedContent: "Informational alerts provide awareness of system changes, maintenance notifications, or minor issues that don't impact core functionality but should be monitored.",
    msticContext: "Info alerts help track system changes and maintain visibility into non-critical operational events."
  },

  alertSeverityFilter: {
    title: "Alert Severity Filter",
    content: "Filter alerts by priority level",
    detailedContent: "Filter alerts by severity: Critical (immediate action required), High (urgent attention), Medium (monitor closely), Low (informational). Helps prioritize response efforts.",
    msticContext: "Severity filtering enables incident response teams to focus on the most critical threats and operational issues first."
  },

  alertSorting: {
    title: "Alert Sorting Options",
    content: "Sort alerts by various criteria for better organization",
    detailedContent: "Sort alerts by: Timestamp (chronological order), Severity (priority level), Duration (how long alert has been active). Supports ascending/descending order.",
    msticContext: "Proper sorting helps prioritize incident response and identify long-running issues that may require escalation."
  },

  alertAcknowledge: {
    title: "Acknowledge Alert",
    content: "Mark alert as acknowledged by current user",
    detailedContent: "Acknowledgment indicates that someone is aware of and working on the issue. Prevents duplicate efforts and provides accountability during incident response.",
    msticContext: "Acknowledgment is critical for coordinated incident response and ensures alerts don't fall through the cracks during security incidents."
  },

  alertResolve: {
    title: "Resolve Alert",
    content: "Mark alert as resolved and closed",
    detailedContent: "Resolution indicates the underlying issue has been fixed and the alert can be closed. Requires verification that the problem is actually resolved.",
    msticContext: "Proper resolution tracking is essential for measuring incident response effectiveness and maintaining accurate system status."
  },

  alertDismiss: {
    title: "Dismiss Alert",
    content: "Close alert without resolution (false positive or duplicate)",
    detailedContent: "Dismissal is used for false positives, duplicate alerts, or issues resolved through other means. Should include reason for dismissal for tracking purposes.",
    msticContext: "Proper dismissal helps improve alert quality and reduces noise in the operational environment."
  },

  alertRules: {
    title: "Alert Rules Configuration",
    content: "Automated rules that generate alerts based on system conditions",
    detailedContent: "Alert rules define conditions, thresholds, and actions for automated monitoring. Include severity levels, notification channels, and escalation procedures.",
    msticContext: "Well-configured alert rules are essential for proactive threat detection and maintaining system reliability without alert fatigue."
  },

  alertHistory: {
    title: "Alert History",
    content: "Historical record of all alerts including resolved ones",
    detailedContent: "Complete audit trail of all alerts including: creation time, acknowledgment, resolution, dismissal, and any escalation actions. Essential for incident analysis.",
    msticContext: "Alert history provides valuable data for improving monitoring rules, identifying trends, and conducting post-incident reviews."
  },

  // Predictive Insights Specific Tooltips
  modelAccuracy: {
    title: "Model Accuracy",
    content: "Percentage of correct predictions made by the machine learning model",
    detailedContent: "Accuracy is calculated as (True Positives + True Negatives) / Total Predictions. Our decision tree model achieves ~80% accuracy, which is realistic for production systems.",
    msticContext: "Model accuracy helps gauge reliability of predictions for proactive maintenance decisions. 80% accuracy means 4 out of 5 predictions are correct."
  },

  pipelinesAtRisk: {
    title: "Pipelines at Risk",
    content: "Number of pipelines predicted to fail in the next 2 hours",
    detailedContent: "Uses machine learning analysis of historical patterns, current metrics, and temporal factors to identify pipelines with high failure probability.",
    msticContext: "Early warning system enables proactive intervention before failures impact threat intelligence collection and analysis capabilities."
  },

  highConfidencePredictions: {
    title: "High Confidence Predictions",
    content: "Predictions with confidence score above 70%",
    detailedContent: "High confidence predictions are based on strong historical patterns and clear feature indicators. These predictions are most reliable for operational decisions.",
    msticContext: "High confidence predictions prioritize attention on the most critical and actionable pipeline risks, optimizing resource allocation."
  },

  trainingSamples: {
    title: "Training Samples",
    content: "Number of historical pipeline runs used to train the prediction model",
    detailedContent: "1,000 training samples provide sufficient data for pattern recognition while maintaining model simplicity. Includes success/failure outcomes with associated feature patterns.",
    msticContext: "Adequate training data ensures the model learns from diverse operational scenarios and edge cases encountered in production environments."
  },

  riskScore: {
    title: "Risk Score",
    content: "Numerical assessment of pipeline failure probability (0-100%)",
    detailedContent: "Risk score combines prediction confidence with failure likelihood. Scores above 70% indicate high risk, 50-70% medium risk, below 50% low risk.",
    msticContext: "Risk scores enable prioritized response to pipeline issues, ensuring critical threat intelligence feeds receive immediate attention."
  },

  predictionConfidence: {
    title: "Prediction Confidence",
    content: "Model's certainty level in the prediction accuracy",
    detailedContent: "Confidence score reflects how strongly the model believes in its prediction based on feature similarity to training data. Higher confidence indicates more reliable predictions.",
    msticContext: "Confidence levels help operators decide when to take proactive action versus continued monitoring, optimizing intervention timing."
  },

  featureImportance: {
    title: "Feature Importance",
    content: "Relative influence of each input factor on prediction outcomes",
    detailedContent: "Shows which pipeline characteristics (hours since last run, failure rate, data volume variance, timing) most strongly influence failure predictions.",
    msticContext: "Understanding feature importance helps identify root causes and focus improvement efforts on the most impactful operational factors."
  },

  decisionTreeModel: {
    title: "Decision Tree Model",
    content: "Machine learning algorithm that makes predictions through a series of yes/no questions",
    detailedContent: "Decision trees create interpretable prediction logic by splitting data based on feature thresholds. Each path through the tree leads to a prediction outcome.",
        msticContext: "Decision trees provide explainable AI for security operations, allowing analysts to understand and validate prediction reasoning."
  },

  // Security Threat Prediction Metrics
  criticalThreats: {
    title: "Critical Threats",
    content: "Number of users with critical-severity threat predictions requiring immediate attention.",
    detailedContent: "Critical threats include high-confidence predictions for data exfiltration, privilege escalation, or insider threats with risk scores above 80.",
    msticContext: "These represent the highest priority security incidents requiring immediate investigation and response from the security team."
  },

  highRiskUsers: {
    title: "High-Risk Users",
    content: "Count of users classified as high-risk based on behavioral analysis and threat indicators.",
    detailedContent: "Users with risk scores between 60-80 or exhibiting patterns consistent with insider threats, lateral movement, or credential abuse.",
    msticContext: "High-risk users should be prioritized for security reviews and enhanced monitoring to prevent potential security incidents."
  },

  avgRiskScore: {
    title: "Average Risk Score",
    content: "Mean risk score across all monitored users, calculated from behavioral anomaly analysis.",
    detailedContent: "Risk scores range from 0-100, with scores above 60 indicating potential security concerns. Calculated using machine learning analysis of login patterns, data access, and resource usage.",
    msticContext: "Organizational baseline for security posture. Rising average scores may indicate widespread security concerns or environmental changes requiring investigation."
  },

  usersMonitored: {
    title: "Users Monitored",
    content: "Total number of active users being analyzed by the behavioral security monitoring system.",
    detailedContent: "Includes all users with recent activity across monitored systems. Analysis covers login patterns, data access, geographic behavior, and resource usage patterns.",
    msticContext: "Comprehensive coverage ensures no blind spots in security monitoring. Higher coverage provides better organizational security visibility."
  },

  userRiskScore: {
    title: "User Risk Score",
    content: "Individual risk assessment score based on behavioral analysis and anomaly detection.",
    detailedContent: "Calculated using multiple factors: login frequency deviations, off-hours activity, data access volume changes, geographic anomalies, failed login attempts, and resource access patterns.",
    msticContext: "Primary indicator for threat prioritization. Scores above 70 typically require investigation, while scores above 80 demand immediate attention."
  },
};

// Helper function to get tooltip content by key
export const getTooltipContent = (key: string): TooltipContent | null => {
  return TOOLTIP_CONTENT[key] || null;
};

// Function to check if a tooltip exists for a given key
export const hasTooltip = (key: string): boolean => {
  return key in TOOLTIP_CONTENT;
};
