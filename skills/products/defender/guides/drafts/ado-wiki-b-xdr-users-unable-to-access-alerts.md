---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - XDR users unable to access alerts"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20XDR%20users%20unable%20to%20access%20alerts"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# XDR Users Unable to Access Specific Alerts Originating From Microsoft Sentinel

## Summary
Multiple cases have been reported where **XDR users cannot open specific alerts** in the M365 Defender/XDR portal.
Investigation has repeatedly shown that the affected alerts have a **product type of Microsoft Sentinel**, and the impacted user **does not have access to the underlying Sentinel Log Analytics workspace** where the alert was generated.

Because Sentinel enforces workspace-level RBAC independently from Defender/XDR RBAC, users must have workspace-level access to view these alert details.

## Customer Impact
- Alerts visible in the XDR queue but **inaccessible** when clicked
- Access denied or silent failures when loading an alert page
- Blocked investigation flows due to missing alert context
- Inconsistent experience when some alerts open and others fail

This issue affects only alerts where at least one associated product is **Sentinel**.

## Root Cause
When Microsoft Sentinel generates an alert and XDR ingests it, the alert remains bound by **Sentinel workspace permissions**. If a user lacks at least Reader-level access on that workspace, Defender/XDR cannot retrieve the alert content.

Additionally, if an alert is associated with **multiple alert products**, the user must have access to **ALL** associated products.

## Troubleshooting Workflow

### 1. Collect Required Identifiers
- **Alert ID**
- **Org ID**
- **Tenant ID**
- **User UPN** or Object ID

### 2. Collect a HAR Trace (Critical Step)
Instruct the customer to reproduce the issue while capturing a HAR file.
1. Open browser DevTools > Network tab
2. Enable **Preserve log**
3. **Enable Disable cache** (if not enabled, TenantContext frame may not appear)
4. Start recording
5. Have the customer attempt to open the problematic alert
6. Save the HAR and share it

### 3. Verify HAR Contains the TenantContext Frame
The TenantContext frame includes:
- The effective permissions the user has for each workload
- The Org ID the portal resolved
- Permission scope evaluations

If TenantContext is missing: ensure Disable cache is checked and recapture.

### 4. Determine Alert Product Dependencies

```kusto
cluster('wcdscrubbeduks.uksouth').database('scrubbeddata').MtpAlerts
| where EventTime >= ago(1d)
| where AlertId == '<ALERT_ID>'
| project OrgId, AlertId, AlertTitle, AlertProduct, Products, Sentinel_Workspace
```

The user must have access to **ALL** products.

### 5. Validate the User's Permission Scopes

```kusto
cluster('wcdprod.kusto.windows.net').database('Geneva').InETraceEvent
| where env_time > ago(7d)
| where service_name == "ine-alertsapiservice"
| where Message startswith "LogUserScopesData_SecurityData.Read"
| where AadUserId == '<USER_OBJECT_ID>'
| project Message
| take 20
```

### 6. Sentinel-Specific Validation

```kusto
cluster('wcdscrubbeduks.uksouth').database('scrubbeddata').MtpAlerts
| where EventTime >= ago(1d)
| where AlertId == '<ALERT_ID>'
  and OrgId == '<ORG_ID>'
| project Sentinel_Workspace
```

### 7. Required Sentinel Workspace Permissions
- **Microsoft Sentinel Reader**

### 8. Confirm Resolution
1. Sign out and back in
2. Optionally capture another HAR
3. Verify the alert opens

## Mitigation
- Grant workspace-level Reader/Sentinel Reader access
- Validate access across **all** alert products
- Retry after reauthentication

## Additional Notes
- Sentinel workspace RBAC overrides Defender/XDR RBAC
- HAR + TenantContext is the most reliable diagnostic method
- Missing workspace access is the most common cause
