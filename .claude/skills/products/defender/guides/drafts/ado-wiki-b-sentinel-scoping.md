---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - Sentinel Scoping"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20Sentinel%20Scoping"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting Guide for Microsoft Sentinel Scoping

## Overview
This new capability extends Microsoft Sentinel permissions management in the Defender portal to enable granular, row-level access without workspace separation. This allows multiple teams to operate securely within a shared Sentinel environment while using consistent and reusable scope definitions across tables and experiences.

### Feature Description
- **Create and assign scope:** Scope can now be created from the permissions page and assigned to users or user groups across workspaces.
- **Tag data:** Scope tags can be applied to rows in tables, using Table Management, allowing you to create rules that tag newly ingested data automatically with the scope.
- **Access data**: Scoped users can manage alerts, incidents, and hunt over scoped data (including the lake), allowing them to see only the data within their own scope.

## Prerequisites
- **Access to the Microsoft Defender portal**: https://security.microsoft.com
- **Sentinel workspaces onboarded to Defender portal**: Sentinel workspaces must be available in the Defender portal before roles and permissions can be assigned.
- **Sentinel in URBAC:** You must have enabled Sentinel in URBAC before using this feature.
- **Permissions** (for the person creating/assigning scope and tagging tables):
  - **Security Authorization (Manage) permission** (URBAC): Allowing you to create scope and assignments.
  - **Data Operations (Manage) permission** (URBAC): for Table Management.
  - **Subscription owner** or assigned with the `Microsoft.Insights/DataCollectionRules/Write` permission

## Costs
Scope is added to a table as a custom field and is stamped upon ingestion. This means that the customer will pay a very small amount of additional ingestion cost for each row ingested with a scope tag.

## Limitations and Workarounds
- In this first phase, we focus on the key workflow for the SOC Analyst (assign access to tables, query tables, view alerts/incidents related to those tables). Next phase, we extend scoping to resources (e.g. detection rules, automation rules, playbooks, etc.).
- XDR tables are not supported. This includes XDR tables whose retention has been extended in the lake.
- The Log Analytics tables SecurityAlerts and SecurityIncidents do not inherit the scope from the raw data/tables from which they were generated. This means that scoped users cannot access them by default. However, you can 1) use the XDR AlertsInfo and AlertsEvidence tables where scope is automatically inherited, or 2) apply scope to these LA tables manually (however that is limited to the attributes in the table and may not be equivalent to inheritance of the data tables that generated these alerts).
- Tags applied in table management will be added at ingestion time for tables that support transformations. Custom tables are not supported, nor are system tables not listed. Newly ingested data will be tagged - historic data already ingested is not covered. After tagging, it may take up to an hour for the new rule to take effect.
- Transformations can only be added in the same subscription as the user's subscription.
- You can currently create up to 100 unique Sentinel scopes.

## Known Issues
- We are aware of an issue where in some cases, scope does not correctly apply to a table. If this is the case, please create a blank/empty transformation rule on the table first (in Azure), and then continue to tag the table with scope. We are addressing this.

## Common Scenarios and Troubleshooting

### Scenario 1
- **Symptom**: user cannot assign scope in role assignments
- **Investigation Step 1**: does the user have Sentinel workspaces connected to Defender? This is a pre-requisite.
- **Investigation Step 2**: does the user have Sentinel workspaces activated in URBAC? This is also a pre-requisite.
- **Cause**: Sentinel Scoping requires both workspaces connected to Defender as well as activated in URBAC
- **Resolution**: complete the pre-requisite steps before assigning scope

### Scenario 2
- **Symptom**: scope does not apply after creating a transformation rule
- **Investigation Step 1**: check if the rule meets the transformKQL requirements, was applied to the table, and if the scope was assigned to the right user/workspace
- **Investigation Step 2**: check if a transformation was created on the table. If not, the user needs to create a blank/empty transformation rule in Azure, and then continue to tag the table with scope
- **Cause**: known issue
- **Resolution**: ask the user to go through these steps to resolve

## Escalating to Product Group (PG)
Before creating the IcM, make sure you have exhausted all the steps in this document.
- Make sure to collect:
  - Tenant ID
  - Workspace ID
- Document detailed reproduction steps of the issue.
- IcM Escalation Path: Microsoft Sentinel -> **M365D Management Service / RBAC and Infra**

## FAQs
- **Q: What happens if an alert contains data outside of the user's scope?** The scoped user can only see the data associated with their scope. If the alert contains entities/evidence that the user has no access to, they will not be able to see those.
- **Q: What happens to incidents that contain multiple alerts?** The scoped user can see an incident if they have access to at least one of the underlying alerts. A scoped user can manage the incident if they have access to all of the underlying alerts and if they have the required permission.
- **Q: Is Sentinel Scoping also applicable to the Sentinel lake?** Yes, any tables that support transformations (data collection rules).
- **Q: Can I apply scope to a full table?** You can create a KQL query that captures all fields in the table, which essentially creates table level scope. Currently, it is not possible to grant access at full-table level (meaning, scoping previously ingested data).
- **Q: Can I scope XDR tables?** Not currently.
- **Q: If I ingest Defender data into Sentinel, is their scope maintained in Sentinel tables?** No, if you ingest Defender data into Sentinel, that scoping is not propagated.
