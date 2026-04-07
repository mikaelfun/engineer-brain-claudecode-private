---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Defender for DevOps/[Guide] - DevOps Connector Takeover Workflow (Customer Enabled Disaster Recovery)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FDefender%20for%20DevOps%2F%5BGuide%5D%20-%20DevOps%20Connector%20Takeover%20Workflow%20%28Customer%20Enabled%20Disaster%20Recovery%29"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Workflow Guide for Supporting Customer Enabled Disaster Recovery (CEDR)

## Introduction

This document outlines the process for taking over and moving a customer's DevOps security Azure DevOps (ADO), GitHub, and/or GitLab connector(s) from one region to another in the event of a region outage.

Public doc: [Reliability in Microsoft Defender for Cloud for DevOps security](https://learn.microsoft.com/en-us/azure/reliability/reliability-defender-devops)

## Prerequisites

### Customer

1. **Create a New Connector** in a different region (standard public documentation for ADO/GitHub/GitLab connector).
   - If another connector already exists and is authenticated to the same resources, it can be used.

2. **Provide Security Connector Resource IDs** (both new and original):
   - Format: `/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Security/securityConnectors/{connectorName}`
   - **Notes:**
     - Connectors must be in the same Azure tenant.
     - Connectors must have privileged access to the same scopes:
       - Azure DevOps: Project Collection Admin (PCA)
       - GitHub/GitLab: Owner access
     - Connector takeovers are 1:1 (one new connector per original connector).

3. **Open a Support Ticket** with Defender for Cloud DevOps security support:
   - Specify whether to release all or specific organizations/groups.
   - Indicate the region where the new connector was created.

### Customer Service Support (CSS)

- Requires a **Secure Access Workstation (SAW)** device to access Geneva Actions production environment.

## Workflow: CSS Steps

1. **Validate Customer Request:**
   - Approved requesters: Global administrator, Subscription contributor (must have contributor role on both subscriptions if different).

2. **Confirm Prerequisites** are completed by customer.

3. **Execute Geneva Actions:**
   - Navigate to Environment = **Public**.
   - Filter on "Defender for DevOps".
   - Under "Data Operations", run **List Connectors** action and save output for comparison.
   - Select **Connector Takeover** under BCDR Operations.

4. **Get Access — Submit JIT Request:**
   - Work-item source: Other
   - Work-item item: CSS ticket number
   - Scope: SecurityDevOpsCSS

5. **Run Takeover Action:**
   - Select the endpoint matching the region for the new connector.
   - Input customer resource IDs for original and new connectors.
   - Note the successful takeover result.
   - When no scopes are provided, all scopes for the original connector will be moved.

6. **Check Operation Status** (~1 minute after initiating):
   - Use "List Connectors" action with new connector info.
   - Successful completion: first property contains resource ID of the original connector.
   - Errors visible in third highlighted property.

## Post-Takeover Customer Actions

1. **Reconfigure Features:** Reconfigure pull request annotation features if previously enabled.
   - Rediscovery of DevOps inventory may take time depending on organization size.

2. **Delete Old Connector** when the region recovers from the outage.

**Notes:**
- Duplicate data for recommendations in Security Graph and Azure Resource Graph until recommendations are cleaned up or expire.

## Contact

Feedback: d4dpm@microsoft.com
