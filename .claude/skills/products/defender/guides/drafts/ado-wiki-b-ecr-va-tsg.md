---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Training] - Amazon Elastic Container Registry (ECR) VA/[TSG] - ECR VA"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTraining%5D%20-%20Amazon%20Elastic%20Container%20Registry%20(ECR)%20VA%2F%5BTSG%5D%20-%20ECR%20VA"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# ECR VA Troubleshooting Guide

Documentation: https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-vulnerability-assessment-elastic

## Troubleshooting Steps

**Step 1:** Identify if the image is being scanned

```kql
union
cluster('ascproduspartners.eastus.kusto.windows.net').database('ProdRawEvents').MultiCloud_ContainerVA_LifeCycle,
cluster('ascprodeupartners.uksouth.kusto.windows.net').database('ProdRawEvents').MultiCloud_ContainerVA_LifeCycle
| where SubscriptionId == "<subscription-id>"
```

**Step 2:** Check if any of the Life cycle events is missing. Below there are the complete life cycle events:

| Result |
|--------|
| ScrapeRequested |
| ScrapeTaskTriggered |
| ScrapeCompleted |
| ScrapeCopiedSuccessfully |
| SendScrapToAssesorQueue |
| VaScanResultRequested |
| VaScanCompleted |
| VaScanCompletedPublished |
| SubAssessmentPublishedSuccessfully |

**If any of the above is missing then the results will not be seen in ARG**

**Step 3:** Check the findings

```kql
union
cluster('ascproduspartners.eastus.kusto.windows.net').database('ProdRawEvents').MultiCloud_ContainerVA_ScanFindings,
cluster('ascprodeupartners.uksouth.kusto.windows.net').database('ProdRawEvents').MultiCloud_ContainerVA_ScanFindings
```
