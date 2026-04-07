---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Troubleshooting Guide] - Azure Container Registry (ACR) vulnerability assessment (VA)/[Technical Knowledge] - Useful Azure Container Registry ARG queries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTroubleshooting%20Guide%5D%20-%20Azure%20Container%20Registry%20(ACR)%20vulnerability%20assessment%20(VA)%2F%5BTechnical%20Knowledge%5D%20-%20Useful%20Azure%20Container%20Registry%20ARG%20queries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Useful Azure Container Registry ARG Queries

Assessment key for ACR VA: `dbd0cb49-b563-45e7-9724-889e799fa648`

## Fetch ACR VA Sub-assessment Results
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648"
```

## Fetch Specific Sub-assessment Details
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id),
         id=tostring(properties.id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648" and id == "{id}"
| extend displayName=tostring(properties.displayName),
         severity=tostring(properties.status.severity),
         status=tostring(properties.status.code),
         vulnerabilityType=tostring(properties.additionalData.type),
         patchable=properties.additionalData.patchable,
         publishedTime=properties.additionalData.publishedTime,
         timeGenerated=todatetime(properties.timeGenerated)
| project id, displayName, severity, vulnerabilityType, patchable, publishedTime, timeGenerated
| top 1 by timeGenerated desc
```

## Image Health - All Images
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648"
| extend registryAzureId = extract(@"(?i)(.*/Microsoft.ContainerRegistry/registries/[^/]*)", 1, id)
| extend imageDigest = properties.additionalData.imageDigest,
         repositoryName = properties.additionalData.repositoryName
| where registryAzureId =~ "{registryId}" and repositoryName =~ "{repositoryName}"
| extend high = iff(tostring(properties.status.severity) == "High", 1, 0),
         medium = iff(tostring(properties.status.severity) == "Medium", 1, 0),
         low = iff(tostring(properties.status.severity) == "Low", 1, 0),
         healthy = iff(tostring(properties.status.code) == "Healthy", 1, 0)
| summarize high=sum(high), medium=sum(medium), low=sum(low), healthy=sum(healthy)
  by tolower(tostring(registryAzureId)), tolower(tostring(properties.resourceDetails.id)),
     tolower(tostring(repositoryName)), tostring(imageDigest)
```

## Image Health - Unhealthy Only
Same as above, add filter: `| where high != 0 or low != 0 or medium != 0`

## Image Health - Healthy Only
Same as above, add filter: `| where high == 0 and low == 0 and medium == 0 and healthy > 0`

## Repository Health - All Repositories
Aggregates per-image health to repository level (image_high/image_medium/image_low/image_healthy counts).
Filter by `registryAzureId`.

## Registry Health - All Registries
Further aggregates repository-level health to registry level.
No registry filter needed for cross-registry overview.

> **Note**: All queries use assessment key `dbd0cb49-b563-45e7-9724-889e799fa648` (Qualys-based).
> For MDVM One Queue, use new keys (see One Queue guide).
