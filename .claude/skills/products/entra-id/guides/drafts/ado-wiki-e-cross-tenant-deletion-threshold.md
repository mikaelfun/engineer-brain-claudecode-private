---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cross tenant synchronization/Troubleshooting/TSG - How to check cross tenant Deletion Threshold"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FCross%20tenant%20synchronization%2FTroubleshooting%2FTSG%20-%20How%20to%20check%20cross%20tenant%20Deletion%20Threshold"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Check Cross-Tenant Deletion Threshold

## Step 1: Get servicePrincipalIdentifier

Use the following Kusto query to find the Run Profile for the cross-tenant sync job:

```kusto
GlobalIfxRunProfileStatisticsEvent
| where env_time > ago(1d)
| where runProfileIdentifier contains "Azure2Azure"
| distinct runProfileIdentifier, servicePrincipalDisplayName, servicePrincipalIdentifier
```

Copy the `servicePrincipalIdentifier` value.

## Step 2: Query Secrets via Graph Explorer in ASC

```http
servicePrincipals/<servicePrincipalIdentifier>/synchronization/secrets
```

## Step 3: Read the Result

The response contains a `SyncNotificationSettings` key with JSON value:

```json
{
  "Enabled": true,
  "DeleteThresholdEnabled": true,
  "HumanResourcesLookaheadQueryEnabled": false,
  "Recipients": "email@domain.com",
  "DeleteThresholdValue": 14
}
```

Key fields:
- `DeleteThresholdEnabled`: Whether deletion threshold is active
- `DeleteThresholdValue`: The configured threshold number (e.g., 14)
- `Recipients`: Email address for threshold notifications
