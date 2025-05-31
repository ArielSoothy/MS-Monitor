# 🎯 Microsoft Interview Demo Checklist

## **Pre-Demo Setup (5 minutes before interview)**
- [ ] Close unnecessary applications
- [ ] Start development server: `npm run dev`
- [ ] Open browser to: http://localhost:3002/MS-Monitor/
- [ ] Test navigation between pages
- [ ] Ensure screen sharing works smoothly

## **Demo Script (8-10 minutes)**

### **1. Overview Page - Security Monitoring (3 minutes)**
**Opening**: *"Let me show you a real-time security monitoring dashboard I built for threat detection."*

- [ ] Navigate to Overview page
- [ ] Point out **Security Monitoring** section
- [ ] Explain failed login detection: *"This monitors for 3+ failed attempts from different IPs within 10 minutes"*
- [ ] Show live chart: *"Real-time failed login trends over 4-hour window"*
- [ ] Highlight metrics: *"Currently tracking X suspicious users with Y failed attempts"*
- [ ] Mention additional patterns: *"Also detecting off-hours logins, geo-anomalies, and privileged account activity"*

**Key Point**: *"This addresses the security scenario you mentioned in the first interview."*

### **2. Data Lineage - Parquet Pipeline (4 minutes)**
**Transition**: *"Now let me show you the data pipeline architecture, specifically the Parquet processing solution."*

- [ ] Navigate to Data Lineage page
- [ ] Scroll to bottom pipeline: **Parquet Field Extraction Staging**
- [ ] Explain the flow: *"Azure Data Lake → Staging Pipeline → Kusto Analytics Engine"*
- [ ] Detail the challenge: *"Processing ~3,000 Parquet files per hour with selective JSON field extraction"*
- [ ] Explain solution: *"Staging table with conditional ingestion trigger"*
- [ ] Show technical specs:
  - Field filter: `user_activity.threat_indicators`
  - Trigger condition: `IF field_exists AND field_not_null`
  - 7-day staging retention
  - Partitioned by (date_hour, source_system)

**Key Point**: *"This solves the high-volume Parquet processing scenario we discussed."*

### **3. Technical Deep Dive (2-3 minutes)**
**If asked for more details**:

- [ ] Click on any pipeline node to show detailed popup
- [ ] Highlight Microsoft technology stack integration
- [ ] Show performance metrics and SLA details
- [ ] Discuss monitoring and troubleshooting capabilities
- [ ] Explain escalation paths and operational procedures

## **Expected Questions & Answers**

### **Q: How would you scale this for 10x volume?**
**A**: *"For 30,000 files/hour, I'd implement:*
- *Horizontal scaling with multiple ADF integration runtimes*
- *Increased Kusto cluster compute units*
- *Partitioning optimization (hourly → 15-minute partitions)*
- *Pre-filtering at ADLS level using Azure Functions*
- *Delta Lake optimization for faster JSON parsing"*

### **Q: How do you handle false positives in login detection?**
**A**: *"Multi-layered approach:*
- *Whitelist known corporate IP ranges*
- *Machine learning baseline for user behavior*
- *Configurable thresholds per user role*
- *Context-aware rules (VPN usage, travel patterns)*
- *Human-in-the-loop review for critical accounts"*

### **Q: What happens if Kusto ingestion fails?**
**A**: *"Fault tolerance built-in:*
- *Dead letter queue for failed records*
- *Automatic retry with exponential backoff*
- *Staging table acts as buffer for replay*
- *Alert triggers for SLA breach*
- *Runbook automation for common failures"*

## **Demo Success Criteria**
- [ ] Navigate smoothly without technical issues
- [ ] Clearly explain both interview scenarios
- [ ] Show technical depth when asked
- [ ] Demonstrate Microsoft technology expertise
- [ ] Stay within 10-minute time limit
- [ ] Handle follow-up questions confidently

## **Backup Plans**
- [ ] Screenshots ready if live demo fails
- [ ] Technical documentation open in another tab
- [ ] Alternative browser tested and ready
- [ ] Offline version prepared (if needed)

---

**🚀 Ready to showcase technical excellence!**
