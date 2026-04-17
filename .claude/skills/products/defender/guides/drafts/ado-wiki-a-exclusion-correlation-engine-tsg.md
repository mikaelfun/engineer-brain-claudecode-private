---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/[TSG] - Exclusion from the correlation engine"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/[TSG]%20-%20Exclusion%20from%20the%20correlation%20engine"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Exclusion from the correlation engine

## Background

To minimize migration issues during USX onboarding, the default for **Incident Correlation** in analytics rules changed from **Included** to **Excluded**. This prevents unexpected alert regrouping that can disrupt SOAR flows, SOC workflows, and reporting.

## Architecture & Components

| Component | Repository | Role |
|---|---|---|
| **Tenant Setting** | `Mgmt.SettingsService` | Stores `ExcludeSentinelAlertsFromXDRCorrelation` via `MtpAdvancedFeatures` API |
| **Rule Engine** | `Hunting.AnalyticsRules` | Reads `#INC_CORR#` / `#DONT_CORR#` from rule descriptions, strips before alert creation |
| **Correlation Engine (InR)** | `InR.SentinelGatewayJob` | Core correlation decision logic |
| **Frontend (MSecSCC)** | `FE.MSecSCC` | Settings page toggle, per-rule controls |

## Per-Rule Correlation Property

| Value | Tag in Description | Behavior |
|---|---|---|
| **Enabled** | `#INC_CORR#` | Alerts included in correlation. **Overrides tenant default.** |
| **Disabled** | `#DONT_CORR#` | Alerts remain standalone. **Overrides tenant default.** |
| **Tenant Default** | _(no tag)_ | Follows `ExcludeSentinelAlertsFromXDRCorrelation` setting |

**Resolution order:** 1) `#DONT_CORR#` -> exclude, 2) `#INC_CORR#` -> include, 3) tenant store property

## Prerequisites

- Microsoft Sentinel active on tenant
- Sentinel Contributor + Defender XDR Detection Tuning (Manage) roles
- For tenant-level setting: `SecurityConfig_Manage` on ALL active MTP workloads

## Key Troubleshooting Queries

### Check tenant default
```kql
cluster('wcdprod').database('TenantsStoreReplica').TenantsLatestSnapshotMV
| extend TenantId = tostring(AadTenantId)
| where TenantId == "<tenant_id>"
| extend FlagText = tolower(trim(" ", tostring(ExcludeSentinelAlertsFromXDRCorrelation)))
| extend TenantDefault = case(
  isempty(ExcludeSentinelAlertsFromXDRCorrelation), false,
  FlagText in ("true", "1"), true,
  false
 )
| project TenantId, ExcludeSentinelAlertsFromXDRCorrelation, TenantDefault
```

### Check per-rule tag state
```kql
database('SecurityInsightsProd').table('Span')
| where TIMESTAMP between (ago(1d) .. now())
| where name == "Microsoft.Azure.Security.Insights.AlertRules.AlertRulesSync.AlertRulesDbWorkersSync.SyncAlertRule"
| extend TenantId = tostring(env_properties["WorkspaceTenantId"])
| extend RuleId = tostring(env_properties["RuleId"])
| where TenantId == "<tenant_id>"
| extend IsCorrelationExcluded = tobool(tostring(env_properties["IsCorrelationExcluded"]))
| extend IsCorrelationIncluded = tobool(tostring(env_properties["IsCorrelationIncluded"]))
| extend RuleState = case(
  IsCorrelationExcluded == true, "Excluded (#DONT_CORR#)",
  IsCorrelationIncluded == true, "Included (#INC_CORR#)",
  "Untagged (follows tenant default)"
 )
| summarize count() by RuleState
```

### Verify InR correlation engine decision
```kql
InETraces
| where service_name == "inr-sentinelgatewayjob"
| where message has "<system_alert_id>"
| where message startswith "Grouping configuration details for systemAlertId"
| parse message with *'systemAlertId "'alertId'"'*'ShouldExcludeFromCorrelations 'shouldExclude:bool
| project env_time, DC, alertId, shouldExclude, ContextId
```

### Check 403 errors on settings API
```kql
cluster('https://wcdprod.kusto.windows.net').database('Geneva').table('InEHttpRequestLog')
| where env_time between (ago(7d) .. now())
| where service_name == "mgmt-settingsservice"
| where RequestPath contains "mtpAdvancedFeaturesSetting"
| where ResponseStatusCode == 403
| where TenantId == "<tenant_id>"
| project env_time, TenantId, RequestPath, ResponseStatusCode, DC
```

## Escalation Triage

| Step 1 (InE tag/config) | Step 2 (InR decision) | Conclusion | Escalate to |
|---|---|---|---|
| Tag correctly set | `shouldExclude` matches but behavior wrong | InR bug | **InEPortalDevIncident** |
| Tag correctly set | `shouldExclude` does NOT match | InR reads incorrectly | **InEPortalDevIncident** |
| Tag missing/wrong | N/A | InE didn't apply tag | **DevHuntingDetections** |
| No results | No results | Check timestamps & health | N/A |

## Known Issues

1. Per-rule tag overrides tenant default without clear UI distinction
2. Coach bubble persistence uses localStorage - clearing browser data causes reappearance
3. Changes are forward-looking only - existing incidents unaffected

## Public Documentation

- [Exclude analytics rules from correlation in Microsoft Defender XDR](https://learn.microsoft.com/en-us/defender-xdr/exclude-analytics-rules-correlation)
