# Microsoft MSTIC Interview Scenarios - Implementation Guide

## Overview
This document details the implementation of two technical scenarios from your first Microsoft interview, now integrated into the Threat Intelligence Pipeline Monitoring Dashboard.

## Scenario 1: Parquet Field Extraction Pipeline (Data Lineage Page)

### Problem Statement (From Interview)
**Question**: "How would you manage to move specific values in a JSON field on a Parquet file, and only when it arrives, and there are thousands of new files per hour?"

### Your Solution (Implemented)
Create a staging table that:
- Takes only the specific field needed
- Has a conditional check that triggers ingestion only when the data arrives
- Handles high-volume processing (3,000+ files/hour)

### Implementation Details

#### Pipeline Architecture
```
Azure Data Lake (Parquet) → Staging Pipeline → Kusto Analytics Engine
```

#### Key Components
1. **Source**: Azure Data Lake Storage Gen2 with Parquet files
2. **Staging Pipeline**: `Parquet Field Extraction Staging`
3. **Target**: Kusto Analytics Engine (Azure Data Explorer)

#### Technical Specifications
- **Volume**: ~3,000 files per hour
- **Field Filter**: `user_activity.threat_indicators`
- **Trigger Condition**: `IF field_exists AND field_not_null`
- **Staging Table**: `threat_indicators_staging`
- **Partition Strategy**: `BY (date_hour, source_system)`
- **Retention**: 7 days (staging only)
- **Compression**: 85% ratio
- **Index Strategy**: Clustered on timestamp, source_ip

#### Microsoft Technology Stack
- **Azure Data Factory**: Orchestration and data movement
- **Delta Lake**: Staging layer with ACID transactions
- **Azure Data Explorer (Kusto)**: Target analytics engine
- **Managed Identity**: Authentication
- **Private Endpoints**: Secure connectivity

### Business Value
- **Efficiency**: Only processes relevant data, reducing compute costs
- **Scalability**: Handles high-volume ingestion scenarios
- **Reliability**: Staging approach prevents data loss
- **Performance**: Selective field extraction minimizes processing time

---

## Scenario 2: Failed Login Detection (Overview Page)

### Problem Statement (From Interview)
**Question**: "The famous LeetCode SQL question - detect more than 3 login failed attempts in 10 minutes per user from different IPs"

### Your Solution (Implemented)
Real-time monitoring dashboard that:
- Tracks failed login attempts per user per 10-minute window
- Identifies users with 3+ failures from different IP addresses
- Provides visual analytics and alerts

### Implementation Details

#### Detection Logic
```sql
-- Conceptual SQL for the detection
SELECT user_id, COUNT(*) as failed_attempts, COUNT(DISTINCT ip_address) as unique_ips
FROM login_attempts 
WHERE status = 'FAILED' 
  AND timestamp >= NOW() - INTERVAL 10 MINUTE
GROUP BY user_id
HAVING failed_attempts >= 3 AND unique_ips > 1
```

#### Dashboard Features
1. **Real-time Chart**: 4-hour trend of suspicious login activity
2. **Summary Metrics**: 
   - Total suspicious users in last hour
   - Total failed attempts
   - Highest risk user identification
3. **User Details**: Specific usernames and IP addresses involved

#### Additional Security Monitoring
Beyond the core requirement, we added:
- **Off-Hours Login Detection**: 2AM-6AM activity monitoring
- **Geographical Anomalies**: Impossible travel detection
- **Privileged Account Monitoring**: Admin account activity flags
- **New Device Registration**: Unrecognized device alerts

#### Microsoft Security Context
- **Azure AD Integration**: Login data source
- **Sentinel Integration**: SIEM correlation
- **Conditional Access**: Automatic response capabilities
- **Identity Protection**: Risk scoring integration

### Technical Implementation
- **Data Source**: Mock Azure AD login logs
- **Visualization**: Recharts with real-time updates
- **Alert Thresholds**: Configurable parameters
- **Response Time**: Sub-second detection latency

---

## How This Demonstrates Your Skills

### Data Engineering Expertise
1. **Pipeline Architecture**: Understanding of staging patterns and data flow
2. **Performance Optimization**: Selective processing for high-volume scenarios
3. **Technology Integration**: Microsoft Azure stack knowledge
4. **Scalability Considerations**: Design for thousands of files per hour

### Security Engineering Knowledge
1. **Threat Detection**: Classic attack pattern recognition
2. **Behavioral Analysis**: Understanding of authentication anomalies
3. **Real-time Monitoring**: Live dashboard implementation
4. **Microsoft Security Ecosystem**: Integration with Azure security tools

### Problem-Solving Approach
1. **Interview Question Translation**: Converting technical challenges into working solutions
2. **Production Readiness**: Considerations for monitoring, alerting, and operations
3. **Business Context**: Understanding of MSTIC's threat intelligence mission
4. **Scalable Design**: Architecture that can handle enterprise-scale data

---

## Interview Talking Points

### For the Manager Interview
- **Business Impact**: How these solutions reduce security response time
- **Cost Optimization**: Staging approach reduces unnecessary processing
- **Operational Excellence**: Built-in monitoring and alerting
- **Compliance**: Audit trails and data lineage visibility

### For the SRE/DevOps Interview  
- **Reliability**: Error handling and retry mechanisms
- **Observability**: Comprehensive logging and metrics
- **Scalability**: Horizontal scaling capabilities
- **Infrastructure as Code**: Automated deployment patterns
- **Incident Response**: Runbooks and troubleshooting guides

### Technical Deep Dive Questions You Can Answer
1. "How would you handle backpressure in the Parquet processing pipeline?"
2. "What's your strategy for false positive reduction in login monitoring?"
3. "How do you ensure data quality in the staging layer?"
4. "What are the performance implications of real-time security monitoring?"
5. "How would you implement this at petabyte scale?"

---

## Demonstration Flow

1. **Open Data Lineage Page**: Show the Parquet-to-Kusto pipeline
2. **Explain the Architecture**: Walk through staging table concept
3. **Switch to Overview Page**: Highlight security monitoring section
4. **Demonstrate Detection**: Point out failed login patterns
5. **Discuss Scale**: Mention real-world implications for MSTIC

This implementation showcases both your technical depth and practical understanding of Microsoft's security infrastructure needs.
