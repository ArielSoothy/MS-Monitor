import React, { useState } from 'react';
import {
  AlertTriangle,
  Database,
  Shield,
  Zap,
  Users,
  Code,
  Lock,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import styles from './TechnicalChallenges.module.css';

const TechnicalChallenges: React.FC = () => {
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);

  const challenges = [
    {
      id: "data-volume-velocity",
      category: "Data Engineering",
      title: "Massive Data Volume & Velocity",
      severity: "Critical",
      icon: <Database size={24} />,
      description: "Processing 100TB+ daily with sub-second latency requirements",
      complexityScore: 9,
      challenges: [
        "Ingesting 1M+ events per second from multiple threat intelligence sources",
        "Maintaining <30 second end-to-end latency for real-time threat detection",
        "Handling data spikes during security incidents (10x normal volume)",
        "Processing heterogeneous data formats (JSON, CSV, Parquet, XML)"
      ],
      technicalDetails: {
        problem: "Traditional relational databases cannot handle the velocity and variety of threat intelligence data. Simple scaling approaches lead to exponential cost increases.",
        solution: "Implemented streaming architecture with Azure Event Hubs, partitioned Azure Data Explorer clusters, and intelligent data routing based on urgency and data type.",
        implementation: [
          "Event-driven microservices architecture for horizontal scaling",
          "Data partitioning strategy based on threat source and time windows",
          "Parallel processing pipelines with automatic load balancing",
          "Intelligent data compression and encoding for network efficiency"
        ]
      },
      designConsiderations: {
        architecture: "Streaming data processing with event-driven microservices",
        scalability: "Horizontal partitioning and parallel pipeline processing", 
        performance: "Intelligent data routing and compression strategies"
      },
      interviewQuestions: [
        "How would you design a system to handle 10x data growth overnight?",
        "What's your approach to backpressure handling in streaming systems?",
        "How do you ensure data consistency in a distributed streaming architecture?"
      ]
    },
    {
      id: "real-time-correlation",
      category: "Security Engineering", 
      title: "Real-time Threat Correlation at Scale",
      severity: "Critical",
      icon: <Shield size={24} />,
      description: "Correlating threats across millions of entities with complex relationships",
      complexityScore: 10,
      challenges: [
        "Correlating failed logins across 500K+ users in near real-time",
        "Detecting impossible travel patterns across global IP ranges", 
        "Building adaptive thresholds that learn from historical patterns",
        "Balancing detection sensitivity with false positive rates"
      ],
      technicalDetails: {
        problem: "Traditional rule-based systems generate too many false positives. Machine learning models are too slow for real-time detection. Graph-based approaches don't scale to millions of entities.",
        solution: "Hybrid approach combining streaming graph analytics, adaptive ML models, and intelligent caching with event-driven correlation engine.",
        implementation: [
          "Graph database for entity relationships with cached hot paths",
          "Streaming ML inference using pre-trained models for pattern recognition", 
          "Multi-dimensional sliding window analysis for temporal patterns",
          "Probabilistic data structures (Bloom filters, HyperLogLog) for memory efficiency"
        ]
      },
      designConsiderations: {
        realtime: "Sub-minute detection with streaming correlation engines",
        accuracy: "Multi-layered validation to minimize false positives",
        scalability: "Graph-based entity relationship modeling at scale"
      },
      interviewQuestions: [
        "How would you detect brute force attacks across distributed systems?",
        "What's your approach to reducing false positives in anomaly detection?",
        "How do you handle the cold start problem in ML-based threat detection?"
      ]
    },
    {
      id: "schema-evolution",
      category: "Data Architecture", 
      title: "Schema Evolution & Backwards Compatibility",
      severity: "High",
      icon: <Code size={24} />,
      description: "Managing schema changes across 50+ data sources without breaking existing pipelines",
      complexityScore: 8,
      challenges: [
        "Supporting multiple API versions from external threat intelligence feeds",
        "Handling breaking changes from Microsoft Graph API and other sources",
        "Maintaining data lineage through schema transformations",
        "Zero-downtime deployments with schema migrations"
      ],
      technicalDetails: {
        problem: "External APIs change without notice. Internal consumers expect stable interfaces. Manual schema management doesn't scale with 100+ daily pipeline runs.",
        solution: "Schema registry with automated compatibility checking, versioned data contracts, and intelligent transformation layer.",
        implementation: [
          "Apache Avro schema registry for centralized schema management",
          "Automated schema evolution detection with compatibility matrix",
          "Transformation layer with fallback strategies for missing fields",
          "Blue-green deployment strategy for zero-downtime schema updates"
        ]
      },
      designConsiderations: {
        compatibility: "Automated schema compatibility checking with fallback strategies",
        versioning: "Blue-green deployment strategy for zero-downtime updates",
        governance: "Centralized schema registry with transformation layer"
      },
      interviewQuestions: [
        "How do you handle breaking API changes from external vendors?",
        "What's your strategy for maintaining backwards compatibility?",
        "How would you design a schema evolution system for microservices?"
      ]
    },
    {
      id: "cost-optimization",
      category: "Infrastructure",
      title: "Cost Optimization at Scale",
      severity: "High", 
      icon: <TrendingUp size={24} />,
      description: "Optimizing cloud costs while maintaining performance and reliability",
      complexityScore: 7,
      challenges: [
        "Azure Data Explorer costs growing 300% annually with data volume",
        "Balancing hot, warm, and cold storage for optimal cost/performance",
        "Optimizing compute auto-scaling to handle traffic spikes efficiently",
        "Managing cross-region data transfer costs for global threat intelligence"
      ],
      technicalDetails: {
        problem: "Linear scaling of managed services leads to exponential cost growth. Over-provisioning for peak loads wastes money. Under-provisioning causes performance issues during incidents.",
        solution: "Intelligent tiered storage, predictive auto-scaling, and cost-aware query optimization with continuous monitoring.",
        implementation: [
          "Machine learning-based capacity planning and predictive scaling",
          "Automated data lifecycle management with intelligent archiving",
          "Query optimization with cost-based execution plans",
          "Regional data caching to minimize cross-region transfer costs"
        ]
      },
      designConsiderations: {
        costOptimization: "Intelligent tiered storage with automated lifecycle management",
        efficiency: "Machine learning-based capacity planning and predictive scaling",
        monitoring: "Cost-aware query optimization with continuous resource monitoring"
      },
      interviewQuestions: [
        "How would you optimize cloud costs for a data-intensive application?",
        "What metrics would you use to identify cost optimization opportunities?",
        "How do you balance cost optimization with performance requirements?"
      ]
    },
    {
      id: "multi-tenant-security",
      category: "Security",
      title: "Multi-tenant Security Isolation", 
      severity: "Critical",
      icon: <Lock size={24} />,
      description: "Ensuring complete data isolation between different security teams and regions",
      complexityScore: 9,
      challenges: [
        "Row-level security for different geographical regions and security clearances",
        "Preventing data leakage between tenant pipelines and analytics",
        "Implementing fine-grained access controls without performance impact", 
        "Audit trails that don't compromise tenant data privacy"
      ],
      technicalDetails: {
        problem: "Shared infrastructure must provide complete logical isolation. Performance degrades with fine-grained security checks. Compliance requirements vary by region and data classification.",
        solution: "Multi-layered security architecture with tenant-aware data partitioning, cached access control, and encrypted audit logs.",
        implementation: [
          "Tenant-aware data partitioning at the storage layer",
          "JWT-based access tokens with cached permission evaluation",
          "Encrypted column-level security for sensitive threat intelligence", 
          "Zero-knowledge audit logging with differential privacy techniques"
        ]
      },
      designConsiderations: {
        isolation: "Complete logical separation with tenant-aware partitioning",
        performance: "Cached access control evaluation with minimal latency impact",
        compliance: "Encrypted audit trails meeting regional privacy requirements"
      },
      interviewQuestions: [
        "How do you implement row-level security in a distributed system?",
        "What's your approach to audit logging without compromising performance?",
        "How would you handle data residency requirements in a global system?"
      ]
    },
    {
      id: "operational-complexity",
      category: "DevOps",
      title: "Operational Complexity & Reliability",
      severity: "High",
      icon: <Settings size={24} />,
      description: "Managing 100+ microservices with 99.9% uptime requirements",
      complexityScore: 8,
      challenges: [
        "Coordinating deployments across 15+ interconnected services",
        "Implementing circuit breakers and graceful degradation",
        "Managing configuration drift across multiple environments",
        "Ensuring zero-data-loss during service failures and maintenance"
      ],
      technicalDetails: {
        problem: "Complex microservices dependencies create cascading failure risks. Manual operations don't scale with growth. Traditional monitoring generates too much noise.",
        solution: "Service mesh architecture with intelligent routing, automated operations, and ML-powered anomaly detection.",
        implementation: [
          "Istio service mesh for traffic management and security",
          "GitOps-based infrastructure as code with automated compliance checks",
          "Chaos engineering with automated failure injection and recovery testing", 
          "AI-powered alert correlation and noise reduction"
        ]
      },
      designConsiderations: {
        reliability: "Service mesh architecture with intelligent routing and circuit breakers",
        automation: "GitOps-based infrastructure as code with automated compliance",
        monitoring: "AI-powered alert correlation and chaos engineering practices"
      },
      interviewQuestions: [
        "How do you ensure high availability in a microservices architecture?",
        "What's your approach to managing configuration drift?",
        "How would you implement zero-downtime deployments?"
      ]
    }
  ];

  const toggleChallenge = (challengeId: string) => {
    setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#f5222d';
      case 'High': return '#faad14';
      case 'Medium': return '#1890ff';
      default: return '#52c41a';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Data Engineering': return <Database size={16} />;
      case 'Security Engineering': return <Shield size={16} />;
      case 'Data Architecture': return <Code size={16} />;
      case 'Infrastructure': return <TrendingUp size={16} />;
      case 'Security': return <Lock size={16} />;
      case 'DevOps': return <Settings size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const overallStats = {
    totalChallenges: challenges.length,
    criticalChallenges: challenges.filter(c => c.severity === 'Critical').length,
    avgComplexity: Math.round(challenges.reduce((sum, c) => sum + c.complexityScore, 0) / challenges.length),
    categoriesCount: [...new Set(challenges.map(c => c.category))].length
  };

  return (
    <div className={styles.technicalChallenges}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <AlertTriangle className={styles.titleIcon} />
          <div>
            <h1>Technical Challenges & Solutions</h1>
            <p>Real-world engineering challenges in building enterprise-scale threat intelligence monitoring</p>
          </div>
        </div>
        <div className={styles.challengeStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overallStats.totalChallenges}</span>
            <span className={styles.statLabel}>Challenges</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overallStats.criticalChallenges}</span>
            <span className={styles.statLabel}>Critical</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overallStats.avgComplexity}/10</span>
            <span className={styles.statLabel}>Avg Complexity</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{overallStats.categoriesCount}</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className={styles.executiveSummary}>
        <h2 className={styles.sectionTitle}>
          <Lightbulb className={styles.sectionIcon} />
          Executive Summary
        </h2>
        <div className={styles.summaryContent}>
          <p>
            Building a production-ready threat intelligence monitoring system presents unique engineering challenges 
            that go far beyond simple data collection and visualization. This system processes over <strong>100TB of 
            security data daily</strong> from diverse sources while maintaining <strong>sub-second response times</strong> 
            for critical threat detection.
          </p>
          <p>
            The challenges range from technical scalability issues to complex business requirements around security, 
            compliance, and cost optimization. Each challenge required innovative solutions combining multiple 
            technologies and careful trade-off analysis.
          </p>
          <div className={styles.keyInsights}>
            <div className={styles.insight}>
              <CheckCircle2 size={20} />
              <span>Resilient architecture design with comprehensive monitoring and failover</span>
            </div>
            <div className={styles.insight}>
              <CheckCircle2 size={20} />
              <span>Intelligent cost optimization through automated resource management</span>
            </div>
            <div className={styles.insight}>
              <CheckCircle2 size={20} />
              <span>Advanced threat correlation using streaming analytics and ML inference</span>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className={styles.challengesList}>
        <h2 className={styles.sectionTitle}>
          <AlertCircle className={styles.sectionIcon} />
          Detailed Technical Challenges
        </h2>
        
        {challenges.map((challenge) => (
          <div key={challenge.id} className={styles.challengeCard}>
            <div 
              className={styles.challengeHeader}
              onClick={() => toggleChallenge(challenge.id)}
            >
              <div className={styles.challengeInfo}>
                <div className={styles.challengeTitle}>
                  {challenge.icon}
                  <h3>{challenge.title}</h3>
                  <span 
                    className={styles.severityBadge}
                    style={{ backgroundColor: getSeverityColor(challenge.severity) }}
                  >
                    {challenge.severity}
                  </span>
                </div>
                <div className={styles.challengeMeta}>
                  <span className={styles.category}>
                    {getCategoryIcon(challenge.category)}
                    {challenge.category}
                  </span>
                  <span className={styles.complexity}>
                    Complexity: {challenge.complexityScore}/10
                  </span>
                </div>
              </div>
              <div className={styles.expandIcon}>
                {expandedChallenge === challenge.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              </div>
            </div>
            
            <p className={styles.challengeDescription}>{challenge.description}</p>
            
            {expandedChallenge === challenge.id && (
              <div className={styles.challengeDetails}>
                {/* Core Challenges */}
                <div className={styles.detailSection}>
                  <h4>Core Technical Challenges</h4>
                  <ul className={styles.challengeList}>
                    {challenge.challenges.map((item, index) => (
                      <li key={index}>
                        <XCircle size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Solution */}
                <div className={styles.detailSection}>
                  <h4>Technical Solution Approach</h4>
                  <div className={styles.solutionApproach}>
                    <div className={styles.problemStatement}>
                      <strong>Problem:</strong> {challenge.technicalDetails.problem}
                    </div>
                    <div className={styles.solutionStatement}>
                      <strong>Solution:</strong> {challenge.technicalDetails.solution}
                    </div>
                  </div>
                  
                  <h5>Implementation Details</h5>
                  <ul className={styles.implementationList}>
                    {challenge.technicalDetails.implementation.map((item, index) => (
                      <li key={index}>
                        <CheckCircle2 size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Design Considerations */}
                <div className={styles.detailSection}>
                  <h4>Key Design Considerations</h4>
                  <div className={styles.designConsiderations}>
                    {Object.entries(challenge.designConsiderations).map(([key, value]) => (
                      <div key={key} className={styles.designConsideration}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Questions */}
                <div className={styles.detailSection}>
                  <h4>Related Interview Questions</h4>
                  <div className={styles.interviewQuestions}>
                    {challenge.interviewQuestions.map((question, index) => (
                      <div key={index} className={styles.question}>
                        <strong>Q{index + 1}:</strong> {question}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lessons Learned */}
      <div className={styles.lessonsSection}>
        <h2 className={styles.sectionTitle}>
          <Zap className={styles.sectionIcon} />
          Key Lessons Learned
        </h2>
        
        <div className={styles.lessonsGrid}>
          <div className={styles.lessonCard}>
            <h3>Start with Observability</h3>
            <p>
              Comprehensive monitoring and alerting must be built from day one. You can't optimize 
              what you can't measure, and you can't debug what you can't observe.
            </p>
          </div>
          
          <div className={styles.lessonCard}>
            <h3>Design for Failure</h3>
            <p>
              Every component will fail. Design with circuit breakers, graceful degradation, 
              and automatic recovery. Chaos engineering helps identify weaknesses early.
            </p>
          </div>
          
          <div className={styles.lessonCard}>
            <h3>Security is Not Optional</h3>
            <p>
              Security must be embedded in every layer from the start. Retrofitting security 
              is exponentially more expensive and often incomplete.
            </p>
          </div>
          
          <div className={styles.lessonCard}>
            <h3>Optimize for Total Cost</h3>
            <p>
              Consider not just infrastructure costs, but operational overhead, developer 
              productivity, and business value when making technical decisions.
            </p>
          </div>
          
          <div className={styles.lessonCard}>
            <h3>Automate Everything</h3>
            <p>
              Manual processes don't scale and are error-prone. Invest in automation early, 
              especially for testing, deployment, and incident response.
            </p>
          </div>
          
          <div className={styles.lessonCard}>
            <h3>Data Quality is King</h3>
            <p>
              All the advanced analytics in the world won't help if your data is inconsistent, 
              incomplete, or unreliable. Invest heavily in data validation and quality monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Skills Demonstrated */}
      <div className={styles.skillsSection}>
        <h2 className={styles.sectionTitle}>
          <Users className={styles.sectionIcon} />
          Technical Skills Demonstrated
        </h2>
        
        <div className={styles.skillsGrid}>
          <div className={styles.skillCategory}>
            <h3>Data Engineering</h3>
            <ul>
              <li>Real-time stream processing at scale</li>
              <li>Data pipeline orchestration and monitoring</li>
              <li>Schema evolution and backwards compatibility</li>
              <li>Data quality validation and monitoring</li>
            </ul>
          </div>
          
          <div className={styles.skillCategory}>
            <h3>DevOps & SRE</h3>
            <ul>
              <li>Infrastructure as Code (Terraform, ARM)</li>
              <li>Container orchestration (Kubernetes)</li>
              <li>CI/CD pipeline design and optimization</li>
              <li>Observability and incident management</li>
            </ul>
          </div>
          
          <div className={styles.skillCategory}>
            <h3>Security Engineering</h3>
            <ul>
              <li>Threat detection algorithm development</li>
              <li>Multi-tenant security architecture</li>
              <li>Compliance automation (SOX, GDPR)</li>
              <li>Zero-trust security implementation</li>
            </ul>
          </div>
          
          <div className={styles.skillCategory}>
            <h3>System Architecture</h3>
            <ul>
              <li>Microservices architecture design</li>
              <li>Event-driven systems and message queues</li>
              <li>Database design and optimization</li>
              <li>Cost optimization and capacity planning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalChallenges;
