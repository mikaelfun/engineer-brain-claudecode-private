---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Additional Reference Material/General References/Clarify Missing Telemetry Scenarios"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FAdditional%20Reference%20Material%2FGeneral%20References%2FClarify%20Missing%20Telemetry%20Scenarios"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Clarify Missing Telemetry Scenarios

## Overview
Support cases involving missing telemetry in Application Insights often begin with vague or incomplete descriptions. This guide helps accurately scope the issue before diving into technical troubleshooting.

## Key Challenge
Telemetry issues have dual nature:
- **Telemetry-level issues**: Data is missing from expected tables
- **UX-level issues**: Portal blades don't display expected data (may be based on metric data / MDM, not telemetry)

## Step-by-Step Instructions

### 1. Interpret Customer Statements Critically
- Customer reporting missing metrics in Overview charts → could be SDK telemetry issue, not just metrics
- Customer reporting missing data in Live Metrics → depends on SDK configuration and network connectivity
- **Key takeaway**: Validate claims with data. Align expectations and accurately scope the issue.

### 2. Identify and Corroborate Affected Resources and Timeframes

**Start with customer's input then refine it**. Typical statements:
- "Telemetry stopped on May 1st."
- "We're not seeing any data."
- "Live Metrics shows nothing."
- "We are not getting all the traces we expect."

**Validation approach**:
1. **Validate timeframe**: Use KQL queries to check telemetry around reported date. Look back 90 days. Ask: Did telemetry truly stop on that date, or was there a gradual drop-off?
2. **Check for partial ingestion**: Is ALL telemetry missing, or just a subset? One app or multiple?
3. **Correlate with ingestion diagnostics**: Use ASC Ingestion tab — check for drops in Success or spikes in Dropped counts
4. **Refine scope of affected resources**: Identify which apps are still sending telemetry, isolate ones that stopped

### Why This Matters
- Avoid chasing false leads
- Focus on the actual point of failure
- Build a timeline correlating with deployments, config changes, or outages
- Consider: every application generates different telemetry; apps change in implementation, usage patterns, and load

### 3. Return to the Applicable TSG
Use the TSG that sent you here for the next appropriate actions and tools.

## Internal References
- Define Problem Statements
- Use Ingestion tab
- Read Aggregate by Dropped
- Read Aggregate by Dropped By Reason or Dropped
- Use Query Customer Data tab
