---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/CSS General/[Technical Knowledge] - Miscellaneous"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/CSS%20General/%5BTechnical%20Knowledge%5D%20-%20Miscellaneous"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Collection of various useful topics when supporting MDC in day to day CSS activities.

[[_TOC_]]

# Kusto Telemetry

Engineering collect all telemetry data and construct the data under well-structured Kusto clusters.

## Telemetry clusters

2 main types of data sources:

- MDC telemetry - RomeTelemetryData/RomeTelemetryProd
- Other data sources we use/rely on:
   - RomeLogs — monolith logs
   - ACCIA — compute
   - AzPortalPartner — client portal telemetry
   - Infinity — billing
   - ArmProd — ARM telemetry & logs
   - Wawseus — App Services data
   - Rome/ProdTableSummaries — AKS data
   - Xstore — Storage accounts data

### Mandatory MDC CSS Kusto Clusters

| Cluster | DB | Cluster URL |
| --- | --- | --- |
| RomeTelemetryData | RomeTelemetryProd | `https://RomeTelemetryData.kusto.windows.net` |
| RomeServiceLogs | RomeServiceProd | `https://Romeservicelogs.kusto.windows.net` |

### Government clusters

| Cluster | DB | Comments |
|--|--|--|
| RomeLogsFFX | Rome3Prod | Fairfax / Azure Gov |
| RomeLogsmc | Rome3Prod | Mooncake |
| RomeTelemetryDataFFX | RomeTelemetryProd | Fairfax / Azure Gov |

**Mooncake connection string:** `https://romelogsmc.kusto.chinacloudapi.cn` (dSTS auth)  
**Fairfax connection string:** `https://romelogsffx.kusto.usgovcloudapi.net` or `https://romeffx.kusto.usgovcloudapi.net` (dSTS auth)

### Multi-Cloud Environment Health Clusters

- Prod US: `https://ascentitystoreprdus.centralus.kusto.windows.net`
- Prod EU: `https://ascentitystoreprdeu.westeurope.kusto.windows.net`
- Database: **MDCGlobalData**

### Verifying Cluster Permissions

In Kusto Explorer, select your cluster and run:
```
.show principal roles
```

---

# Search IcM for MDC

```
t:MDC CRI Triage
```

Active MDC IcMs:
```
t:MDC CRI Triage st:Active CRI
```

---

# Useful ARG Queries

## All Purpose Recommendations Query

```q
securityresources
| where type == "microsoft.security/assessments"
| extend ResourceName = split(properties.resourceDetails.Id, "/")[-1]
| extend ResourceType = split(properties.resourceDetails.Id, "/")[-2]
| extend FirstEvaluationDate = properties.status.firstEvaluationDate
| extend StatusChangeDate = properties.status.statusChangeDate
| extend RecommendationDisplayName = properties.metadata.displayName
| extend HealthStatus = properties.status.code
| project FirstEvaluationDate, StatusChangeDate, RecommendationDisplayName, HealthStatus, ResourceName, ResourceType, subscriptionId, properties
```

## Results from a Specific Assessment

```q
Securityresources
| where type == "microsoft.security/assessments"
| where * contains "Title or Assessment ID"
```

## ACR Image Digest

```q
securityresources
| where type == "microsoft.security/assessments/subassessments"
| where id contains "/Microsoft.ContainerRegistry/registries"
| where properties["additionalData"]["registryHost"] has "<registryname>"
| parse properties["resourceDetails"]["id"] with * "/images/" imageDigest
| project tenantId, subscriptionId, resourceGroup, registryResourceName=properties["additionalData"]["registryHost"], repository=properties["additionalData"]["repositoryName"], imageDigest
```

## Fetch Complete Vulnerability Assessment Results (Built-in Qualys)

```q
securityresources
 | where type == "microsoft.security/assessments"
 | where * contains "Remediate vulnerabilities found on your virtual machines (powered by Qualys)"
 | summarize by assessmentKey=name
 | join kind=inner (
    securityresources
     | where type == "microsoft.security/assessments/subassessments"
     | extend assessmentKey = extract(".*assessments/(.+?)/.*",1, id)
 ) on assessmentKey
| project assessmentKey, subassessmentKey=name, id, parse_json(properties), resourceGroup, subscriptionId, tenantId
| extend description = properties.description, displayName = properties.displayName,
         resourceId = properties.resourceDetails.id, severity = properties.status.severity,
         code = properties.status.code, remediation = properties.remediation,
         vulnId = properties.id, additionalData = properties.additionalData
```

## All Compliance Standards with Passed/Failed Controls

```q
securityresources
| where type == "microsoft.security/regulatorycompliancestandards"
| extend passedControls = trim(' ',tostring(properties.passedControls)), failedControls = trim(' ',tostring(properties.failedControls))
| project name,passedControls,failedControls
| order by name asc
```

## List All Resource Exemptions

```q
SecurityResources 
| where type == 'microsoft.security/assessments' and properties.status.cause == 'Exempt'
| extend assessmentKey = name, resourceId = tolower(trim(' ',tostring(properties.resourceDetails.Id))), healthStatus = properties.status.code, cause = properties.status.cause, reason = properties.status.description, displayName = properties.displayName
| project assessmentKey, id, name, displayName, resourceId, healthStatus, cause, reason
```

## List All Defender for Cloud Plan Configurations

```q
securityresources
| where type == "microsoft.security/pricings"
| project id, subscriptionId, bundleName = name, pricingTier = properties.pricingTier, subPlan = properties.subPlan
```

---

# Collect Diagnostic Logs

## HAR File

Follow [capture a browser trace for troubleshooting](https://learn.microsoft.com/en-us/azure/azure-portal/capture-browser-trace)

## Collect Session ID

1. Reproduce the issue
2. Press and hold Ctrl + Alt + D

## Collect Session Diagnostic Logs

1. Reproduce the issue
2. Click Help icon → "Show diagnostic" → Save PortalDiagnostic.json

---

# REST API

[Azure REST API reference](https://docs.microsoft.com/en-us/rest/api/securitycenter/) lists all MDC supported APIs.

⚠️ **If it's not listed, it's not supported!**

---

# Preview Feature Support Guidelines

Preview Services are **provided as-is**, excluded from Service SLAs or Limited Warranties. Types:
- **Public Preview**: Available to all Azure subscribers via Azure Portal
- **Private Preview**: Small subset of customers only
- **Limited Preview**: Fixed number of customers, max threshold applies

---

# Terraform and MDC

Terraform AZURERM module is supported by the ARM team. Collaborate with ARM team for Terraform-related MDC cases.
- ARM team Terraform SAP: Azure / Azure Resource Manager (ARM) / Client Tools / Terraform
- [azurerm_security_center_subscription_pricing docs](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/security_center_subscription_pricing)
