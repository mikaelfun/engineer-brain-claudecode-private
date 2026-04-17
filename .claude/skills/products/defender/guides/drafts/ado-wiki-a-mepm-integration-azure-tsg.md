---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Archive/Microsoft Entra Permissions Management (MEPM) integration/Azure"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FArchive%2FMicrosoft%20Entra%20Permissions%20Management%20(MEPM)%20integration%2FAzure"
importDate: "2026-04-05"
type: troubleshooting-guide
note: "ARCHIVED — Archival confirmed on February 25, 2026 by danielmishne@microsoft.com"
---

> **ARCHIVED WIKI** — Archival confirmed on **February 25, 2026**.

[[_TOC_]]

# How to Enable MEPM (Azure)

Navigate to Defender plans blade → Defender CSPM settings → enable "Permissions Management" extension.

# Extension Enablement — Two Phases

1. **UI**: MEPM first-party is granted Reader role on the subscription.
2. **Backend**: Auto-provisioner creates required MEPM resources per subscription.

# Debugging

## Permissions Management Enablement Failed (UI)

### MEPM First-Party Reader Role Assignment Failed

**Root Cause**: Customer lacks permissions to assign roles at subscription level.
**Resolution**: Have a user with appropriate permissions perform the action.
**CRI Info**: Tenant ID, Subscription ID, Portal session ID.

## Bundle Enabled but No Recommendations (after 24h)

### Step 1 — MEPM First-Party Not Provisioned

Ask customer to search in AAD for app ID: `b46c3ac5-9da6-418f-a849-0a07a10b3c6c`
- **Not found** → Open CRI with customer tenant ID.
- **Found** → Proceed to Step 2.

### Step 2 — MEPM First-Party Not Granted Reader Role (or Deleted)

Ask customer to check if "Cloud Infrastructure Entitlement Management" has Reader role at subscription level.
- **Not assigned** → Customer grants Reader role to the app at subscription.
- **Assigned** → Proceed to Step 3.

### Step 3 — Azure CSPM Security Standard Not Assigned

MDC → Environment Settings → Edit subscription → Security Policies → Validate "Azure CSPM" is assigned. If not, assign it.

### Step 4 — Recommendations Not in ARG

```kusto
securityresources
| extend CiemAssessmentsKeys = dynamic(['d19d5a12-41e9-44e2-b7f5-ee2160f62d62', '8b0bd683-bcfe-4ab1-96b9-f15a60eaa89d'])
| where type == "microsoft.security/assessments"
| where CiemAssessmentsKeys contains name
| extend cloud = properties.resourceDetails.Source
| extend displayName = properties.displayName
| where cloud == "Azure"
| project name, id, subscriptionId, cloud, displayName, properties
| order by ['name'] asc
```

Regardless of results → open CRI with: Project ID, Subscription ID, query result, validation steps completed.
