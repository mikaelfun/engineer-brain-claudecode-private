---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Auditing"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/[TSG]%20-%20Sentinel%20data%20lake%20-%20Auditing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Sentinel Data Lake Auditing TSG

## Overview

Audit logs record end user activity in the product and cover details like who performed the action, when, and what the action was.

### Primary users & use-cases:
- Security administrators tracking unauthorized changes to system configurations
- Incident Response teams analyzing potential data breaches
- Compliance Officers, IT Auditors generating audit reports and investigating suspicious activity

### Activities audited for Sentinel data lake:
- Accessing data in lake via KQL queries
- Running notebooks on data lake
- Create/edit/run/delete jobs

## Record Types & Events

| Record Type | Event Name | Friendly Name | Definition |
|--|--|--|--|
| SentinelNotebookOnLake | SessionStarted | Started session | User starts a notebook session |
| SentinelNotebookOnLake | SessionStopped | Stopped session | User stops a notebook session |
| SentinelNotebookOnLake | TableRead | Read from table | User reads a table as part of notebook execution |
| SentinelNotebookOnLake | CustomTableWrite | Wrote to a custom table | User writes to a table as part of notebook execution |
| SentinelNotebookOnLake | CustomTableDelete | Deleted a custom table | User deletes a table as part of notebook execution |
| SentinelJob | JobCreated | Created job | User creates a job (Notebook, PySpark, KQL) through USX/VSCE |
| SentinelJob | JobUpdated | Updated job | User updates job definition/compute config/schedule |
| SentinelJob | JobDisabled | Disabled job | User disables the job |
| SentinelJob | JobEnabled | Enabled job | User reenables a disabled job |
| SentinelJob | JobDeleted | Deleted job | User deletes the job permanently |
| SentinelJob | JobRunAdhoc | Ran a job adhoc | Job triggered manually |
| SentinelJob | JobRunScheduled | Ran a job on schedule | Job run triggered by schedule |
| SentinelJob | TableRead | Read from table | Table read during job run |
| SentinelJob | CustomTableWrite | Wrote to a custom table | Data written to custom table during job run |
| SentinelJob | CustomTableDelete | Deleted a custom table | Custom table deleted during job run |
| SentinelJob | JobRunStopped | Stopped a job run | User manually cancels an ongoing job run |
| SentinelKQLOnLake | KQLQueryCompleted | Completed KQL query | User runs interactive queries via KQL on data in MSG lake |
| SentinelLakeOnboarding | SentinelLakeSetup | Setup Sentinel lake | Sentinel data lake is provisioned |
| SentinelLakeOnboarding | SentinelLakeSubscriptionChanged | Changed subscription | Billing details changed for sentinel data lake |
| SentinelLakeDataOnboarding | SentinelLakeDefaultDataOnboarded | Onboarded data | Data onboarded (covers ARG, M365, Entra assets) |

## Where to Access Audit Logs

Audit logs are available in Microsoft Purview Audit (Standard). Sentinel data lake uses unified audit logging (UAL).

**Retrieval methods:**
- Office 365 Management Activity API (Unified Auditing API)
- Audit log search tool in Microsoft Purview portal
- Search-UnifiedAuditLog cmdlet in Exchange Online PowerShell

## Prerequisites & Setup

### 1. Verify subscription & billing:
- Audit (Standard) is on by default for E3/E5 licenses
- See Subscription Requirements for Audit Standard/Premium
- Turn on auditing in Microsoft Purview portal if needed

### 2. Assign permissions:
- Need View-Only Audit Logs or Audit Logs role
- In Microsoft Purview portal AND Exchange admin center
- Default role groups: Audit Reader, Audit Manager
- Custom role groups possible via Permissions page

### 3. Additional setup for Exchange Online & SharePoint:
- Set up Audit Premium, retention policies per Get started with auditing solutions

## Searching Audit Logs in Purview Portal

1. Navigate to purview.microsoft.com > Audit
2. On New Search page, filter activities, dates, users
3. Select Search
4. Export results to Excel for analysis

## TSG - Common Issues

### Audit logs not appearing
- **Latency**: No guaranteed maximum latency (uses O365 Management Activity API). Typically within 1 hour.
- **Retention**: Default retention for Audit Standard is 180 days. Check retention policies.
- **Licensing**: Available under Audit Standard (E3/E5).

### Search returning no results
- Use precise time ranges and specific activities
- Filter by user, file, or IP address
- Avoid overly broad queries that may time out
- Ensure query aligns with audit log schema

### Cannot search audit logs
- Verify user has View-Only Audit Logs or Audit Logs role
- Check roles in both Purview portal and Exchange admin center

## Escalation

### Details to gather:
| Customer Ask | Details to Capture |
|--|--|
| Can't see audit log for activity | Record type, event name, activity time, object details |
| Questions on audit log entry | ID, record type, event name, audit field, expected vs actual value |

### Escalation by Record Type:
All record types (SentinelNotebookOnLake, SentinelJob, SentinelKQLOnLake, SentinelLakeOnboarding, SentinelLakeDataOnboarding) may require assistance from individual sub-teams for issues in their specific events.

### Reference docs:
- Audit log activities: https://learn.microsoft.com/en-us/purview/audit-log-activities
- O365 Management Activity API schema: https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema
- Troubleshooting O365 Management Activity API: https://learn.microsoft.com/en-us/office/office-365-management-api/troubleshooting-the-office-365-management-activity-api
