---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Regulatory Compliance/[TSG] - Check if standard has assessed resources"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FRegulatory%20Compliance%2F%5BTSG%5D%20-%20Check%20if%20standard%20has%20assessed%20resources"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] Check if Standard Has Assessed Resources

To check if a standard has relevant assessed resources on the subscription, you can use the queries below:

## Using ARG - in customer environment

If the output of the query below is 0, there are no assessed resources for the specified subscription and standard.

```kusto
securityresources
| where type == "microsoft.security/assessments"
| where subscriptionId == '<Your subscription ID>'
| extend statusPerInitiative = properties.statusPerInitiative
| mv-expand initiativeStatus = statusPerInitiative
| where initiativeStatus.policyInitiativeName == '<Your standard name>'
| count
```

## Backend Telemetry

If a standard appears in the `standardsWithoutAssessmentsNames` list produced by the query below, there are no assessed resources for the specified subscription and standard.

```kusto
cluster("https://romelogs.kusto.windows.net").database('Prod').DynamicWithSubscriptionOE
| where env_time between (ago(3d) .. ago(0h))
| where operationName has "RunRegulatoryComplianceDiscoveryAsync"
| where SubscriptionId has '<Your subscription ID>'
| extend customData = parse_json(customData)
| extend standardWithoutAssessedResources = customData.standardsWithoutAssessmentsNames
| project env_time, env_cv, SubscriptionId, standardWithoutAssessedResources
| order by env_time desc
```

If the standard indeed does not have assessed resources - it is **not expected** to appear in regulatory compliance.
