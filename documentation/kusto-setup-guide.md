# Azure Data Explorer Setup for MSTIC Interview

## 🎯 **Quick Start Guide**

### **Step 1: Access Your Cluster**
- **Web UI**: https://dataexplorer.azure.com/
- **Cluster**: `msmonitoradx.israelcentral.kusto.windows.net`
- **Database**: `monitoringdb`

### **Step 2: Create Tables (Copy & Paste These KQL Commands)**

#### **1. Create Pipelines Table**
```kql
.create table Pipelines (
    PipelineId: string,
    PipelineName: string,
    Source: string,
    Status: string,
    LastRun: datetime,
    AvgProcessingTime: int,
    RecordsProcessed: long,
    FailureRate: real,
    OwnerTeam: string,
    Region: string,
    DataType: string,
    Process: string,
    CreatedAt: datetime,
    UpdatedAt: datetime
)
```

#### **2. Create Pipeline Metrics Table**
```kql
.create table PipelineMetrics (
    PipelineId: string,
    Timestamp: datetime,
    RecordsPerSecond: real,
    ErrorRate: real,
    CpuUsage: real,
    MemoryUsage: real,
    DataQuality: real
)
```

#### **3. Create Alerts Table**
```kql
.create table Alerts (
    AlertId: string,
    PipelineId: string,
    AlertType: string,
    Severity: string,
    Message: string,
    CreatedAt: datetime,
    AcknowledgedAt: datetime,
    AcknowledgedBy: string,
    Status: string
)
```

### **Step 3: Insert Sample Data**

#### **Sample Pipeline Data**
```kql
.ingest inline into table Pipelines <|
PipelineId,PipelineName,Source,Status,LastRun,AvgProcessingTime,RecordsProcessed,FailureRate,OwnerTeam,Region,DataType,Process,CreatedAt,UpdatedAt
pipeline-001,LinkedIn_ProfileData_Ingestion_US,LinkedIn,healthy,2024-12-19T10:30:00Z,25,45000,1.2,Threat Intelligence,US,ProfileData,Ingestion,2024-12-19T08:00:00Z,2024-12-19T10:30:00Z
pipeline-002,Twitter_ThreatFeeds_RealTimeAnalysis_Global,Twitter,warning,2024-12-19T10:25:00Z,15,78000,5.8,Social Media Analytics,Global,ThreatFeeds,RealTimeAnalysis,2024-12-19T08:00:00Z,2024-12-19T10:25:00Z
pipeline-003,Office365_EmailIntel_Analysis_US,Office365,failed,2024-12-19T09:45:00Z,45,32000,15.6,Enterprise Security,US,EmailIntel,Analysis,2024-12-19T08:00:00Z,2024-12-19T09:45:00Z
pipeline-004,AzureAD_IdentityData_RiskAnalysis_Global,AzureAD,healthy,2024-12-19T10:35:00Z,35,67000,2.1,Identity Security,Global,IdentityData,RiskAnalysis,2024-12-19T08:00:00Z,2024-12-19T10:35:00Z
pipeline-005,ThreatIntel_IOCs_Processing_Global,ThreatIntel,healthy,2024-12-19T10:40:00Z,20,95000,0.8,Threat Intelligence,Global,IOCs,Processing,2024-12-19T08:00:00Z,2024-12-19T10:40:00Z
```

#### **Sample Metrics Data**
```kql
.ingest inline into table PipelineMetrics <|
PipelineId,Timestamp,RecordsPerSecond,ErrorRate,CpuUsage,MemoryUsage,DataQuality
pipeline-001,2024-12-19T10:00:00Z,1250.5,1.2,45.3,67.8,98.5
pipeline-001,2024-12-19T10:15:00Z,1180.2,0.9,42.1,65.2,98.8
pipeline-002,2024-12-19T10:00:00Z,2340.8,5.8,78.9,82.4,94.2
pipeline-002,2024-12-19T10:15:00Z,2156.3,6.2,81.2,85.1,93.8
pipeline-003,2024-12-19T09:45:00Z,890.4,15.6,92.5,95.8,87.3
pipeline-004,2024-12-19T10:30:00Z,1890.7,2.1,55.4,71.2,97.9
pipeline-005,2024-12-19T10:35:00Z,3200.1,0.8,38.7,59.3,99.1
```

#### **Sample Alerts Data**
```kql
.ingest inline into table Alerts <|
AlertId,PipelineId,AlertType,Severity,Message,CreatedAt,AcknowledgedAt,AcknowledgedBy,Status
alert-001,pipeline-002,High Failure Rate,warning,Pipeline failure rate exceeded 5% threshold,2024-12-19T10:20:00Z,,,"active"
alert-002,pipeline-003,Pipeline Failed,critical,Office365 email intelligence analysis pipeline has failed,2024-12-19T09:50:00Z,,,"active"
alert-003,pipeline-001,Processing Delay,medium,LinkedIn pipeline processing time increased by 20%,2024-12-19T10:25:00Z,2024-12-19T10:28:00Z,admin@microsoft.com,"acknowledged"
```

### **Step 4: Test Queries (Perfect for Demo!)**

#### **1. Pipeline Health Overview**
```kql
Pipelines 
| summarize HealthyCount = countif(Status == "healthy"),
           WarningCount = countif(Status == "warning"), 
           FailedCount = countif(Status == "failed"),
           TotalPipelines = count()
| extend HealthPercentage = round(HealthyCount * 100.0 / TotalPipelines, 1)
```

#### **2. High-Risk Pipelines (MSTIC-Style)**
```kql
Pipelines 
| where FailureRate > 5.0 or Status == "failed"
| project PipelineName, Source, FailureRate, LastRun, OwnerTeam
| order by FailureRate desc
```

#### **3. Time-Series Performance Analysis**
```kql
PipelineMetrics
| where Timestamp > ago(24h)
| summarize avg(RecordsPerSecond), avg(ErrorRate), avg(DataQuality) 
  by bin(Timestamp, 15m), PipelineId
| render timechart
```

#### **4. Threat Intelligence Source Analysis**
```kql
Pipelines
| where Source in ("LinkedIn", "Twitter", "ThreatIntel", "AzureAD")
| summarize ThreatIntelPipelines = count(), 
           AvgProcessingTime = avg(AvgProcessingTime),
           TotalThreatRecords = sum(RecordsProcessed),
           AvgFailureRate = avg(FailureRate)
  by Source
| order by TotalThreatRecords desc
```

#### **5. Active Alerts Dashboard**
```kql
Alerts
| where Status == "active"
| join kind=inner (Pipelines | project PipelineId, PipelineName, Source, OwnerTeam) on PipelineId
| project AlertType, Severity, PipelineName, Source, OwnerTeam, CreatedAt
| order by CreatedAt desc
```

### **Step 5: Connection String for React App**
Your connection details:
- **Cluster**: `https://msmonitoradx.israelcentral.kusto.windows.net`
- **Database**: `monitoringdb`
- **Resource Group**: `MSMonitorDemo`

## 🎯 **Demo Script for Interview**

1. **Open Azure Data Explorer Web UI**
2. **Show the tables**: `show tables`
3. **Run health overview query** (shows immediate business value)
4. **Show time-series chart** (demonstrates advanced analytics)
5. **Explain MSTIC connection**: "This is the same technology Microsoft MSTIC uses"

## 🚀 **Next Steps**
1. Run these commands in your Azure Data Explorer
2. Test the queries
3. I'll help you build the React integration
4. Create the demo flow

**This setup will absolutely impress your MSTIC interviewers!** 🎯
