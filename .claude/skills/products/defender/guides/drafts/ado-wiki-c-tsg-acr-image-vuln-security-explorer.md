---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/DCSPM for K8s agentless/Customer expects to see Image vulnerabilities on the security explorer but doesn't see it/[TSG] - Image located on ACR registry (Azure)"
sourceUrl: "https://dev.azure.com/ASIM-Security/08a9716f-c06d-418d-9916-e38023d36752/_wiki/wikis/805e0e78-f6b1-4ad5-ad26-6cb3aad9f60e?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDCSPM%20for%20K8s%20agentless%2FCustomer%20expects%20to%20see%20Image%20vulnerabilities%20on%20the%20security%20explorer%20but%20doesn%27t%20see%20it%2F%5BTSG%5D%20-%20Image%20located%20on%20ACR%20registry%20%28Azure%29"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# [TSG] Image located on ACR registry (Azure) — ACR Image Vulnerabilities Not in Security Explorer

## Overview

This TSG helps CSS engineers investigate cases where a customer expects to see ACR image vulnerabilities on the Security Explorer, but they don't appear.

> **Note:** Requires SAW machine access. CSG/DP: coordinate with FTE.

## Step 0 — Pricing Validation (CSPM + VA Extension)

Verify the subscription has CSPM enabled with `ContainerRegistriesVulnerabilityAssessments` extension:

```kusto
let SubscriptionId = "<SubscriptionId>";
union
(
    cluster('mdcentitystoreprodus.centralus.kusto.windows.net').database('MDCGlobalData').Environments
    | where TimeStamp > ago(2h)
    | where EnvironmentName == "Azure"
    | where array_length(Plans) > 0
    | where HierarchyId == SubscriptionId
    | where Level == "Subscription"
    | top 1 by TimeStamp
    | mv-expand Plans
    | extend Bundle = tostring(Plans["Bundle"])
    | where Plans["Bundle"] == "CloudPosture"
    | where Plans contains "Extensions"
    | extend ContainerRegistriesVulnerabilityAssessments = Plans["Extensions"]["ContainerRegistriesVulnerabilityAssessments"]["IsEnabled"]
    | project ContainerRegistriesVulnerabilityAssessments, Region = "US"
),
(
    cluster('mdcentitystoreprodeu.westeurope.kusto.windows.net').database('MDCGlobalData').Environments
    | where TimeStamp > ago(2h)
    | where EnvironmentName == "Azure"
    | where array_length(Plans) > 0
    | where HierarchyId == SubscriptionId
    | where Level == "Subscription"
    | top 1 by TimeStamp
    | mv-expand Plans
    | extend Bundle = tostring(Plans["Bundle"])
    | where Plans["Bundle"] == "CloudPosture"
    | where Plans contains "Extensions"
    | extend ContainerRegistriesVulnerabilityAssessments = Plans["Extensions"]["ContainerRegistriesVulnerabilityAssessments"]["IsEnabled"]
    | project ContainerRegistriesVulnerabilityAssessments, Region = "EU"
)
```

**If disabled → advise customer to enable CSPM with ContainerRegistryVulnerabilityAssessment extension.**

## Pipeline Overview

4 components involved:
1. **ACR** — customer registry
2. **MDVM Image Scan Manager** — triggers scans, publishes sub-assessments
3. **Modeller** — sends sub-assessments to ARG and Cloud Map
4. **Cloud Map** — Kusto tables storing map components

Required pipeline steps:
1. Vulnerable image pushed to ACR
2. Image Scan triggered, vulnerabilities found
3. Sub-assessment generated and sent to Modeller
4. Modeller sends sub-assessments to CloudMap.SubAssessments
5. Update Policy generates Vulnerabilities in CloudMap.Vulnerabilities

## Step 1 — Verify Vulnerabilities in Cloud Map (Step 5 outcome)

```kusto
let registry = "<registry url>";
let repository = "<repository>";
let digest = "<image digest>";
let input_imageId = tolower(strcat(registry,'/',repository,'@',digest));
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').Vulnerabilities
    | where EntityType == "container-image"
    | extend imageId = tolower(tostring(EntityIdentifiers['imageId']))
    | where imageId  == input_imageId
    | take 1
),
(
    cluster('https://Weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').Vulnerabilities
    | where EntityType == "container-image"
    | extend imageId = tolower(tostring(EntityIdentifiers['imageId']))
    | where imageId  == input_imageId
    | take 1
)
| count
| project ["Image has vulnerabilities on the Map"] = Count > 0;
```

## Step 2 — Verify Sub-Assessments in Cloud Map (Step 4 outcome)

```kusto
let cloudAssessmentKeyMapping = todynamic('{"Azure": "c0b7cfc6-3172-465a-b378-53c7ff2cc0d5", "AWS": "c27441ae-775c-45be-8ffa-655de37362ce", "GCP": "5cc3a2c1-8397-456f-8792-fe9d0d4c9145"}');
let registry = "<registry url>";
let repository = "<repository>";
let digest = "<image digest>";
let cloudName = "Azure";
let input_imageId = tolower(strcat(registry,'/',repository,'@',digest));
union
(
    cluster('https://cusorncmapkustoprod.centralus.kusto.windows.net').database('CloudMap').SubAssessments
    | extend assessmentId=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, ArtifactId)
    | where assessmentId == tostring(cloudAssessmentKeyMapping[cloudName])
    | extend imageId = tolower(tostring(todynamic(EntityIdentifiers)['imageId']))
    | where imageId  == input_imageId
    | take 1
),
(
    cluster('https://Weuorncmapkustoprod.westeurope.kusto.windows.net').database('CloudMap').SubAssessments
    | extend assessmentId=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, ArtifactId)
    | where assessmentId == tostring(cloudAssessmentKeyMapping[cloudName])
    | extend imageId = tolower(tostring(todynamic(EntityIdentifiers)['imageId']))
    | where imageId  == input_imageId
    | take 1
)
| count
| project ["the image has sub-assessment on the Map"] = Count > 0
```

## Step 3 — Verify Sub-Assessments on Modeller (Step 3 outcome)

```kusto
let cloudAssessmentKeyMapping = todynamic('{"Azure": "c0b7cfc6-3172-465a-b378-53c7ff2cc0d5", "AWS": "c27441ae-775c-45be-8ffa-655de37362ce", "GCP": "5cc3a2c1-8397-456f-8792-fe9d0d4c9145"}');
let registry = "<registry url>";
let repository = "<repository>";
let digest = "<image digest>";
let cloudName = "Azure";
let input_subResourceId = iff(cloudName  == "Azure",tolower(strcat('/repositories/',repository,'/images/',digest)),tolower(strcat(registry,'/',repository,'@',digest)));
cluster('https://romecore.kusto.windows.net').database('Prod').SubAssessmentLifeCycle
| where Scope == "SubResource"
| extend assessmentId= tostring(AssessmentKeysList[0])
| where assessmentId == tostring(cloudAssessmentKeyMapping[cloudName])
| where tolower(SubResourceId)  == input_subResourceId
| extend ResourceIdCondition = iff(cloudName  == "Azure", ResourceId endswith extract(@"(?i)Microsoft.ContainerRegistry/registries/([^/]*)", 1, ResourceId), ResourceId contains replace_string(repository, '/','- '))
| where ResourceIdCondition
| count
| project ["the sub-assessment found on the modeller"] = Count > 0
```

## Step 4 — Verify Sub-Assessments from Image Scan Service (Step 2 outcome)

```kusto
let registry = "<registry url>";
let repository = "<repository>";
let digest = "<image digest>";
union
(
    cluster('https://romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
    | where GeneratedTimestamp > ago(2d)
    | where Component == "Publisher"
    | where LifeCycleEvent == "SubAssessmentPublishedSuccessfully"
    | extend RegistryHost = tostring(ArtifactContext.RegistryHost)
    | extend Repository = tostring(ArtifactContext.Repository)
    | extend Digest = tostring(ArtifactContext.Digest)
    | where RegistryHost  == registry
    | where Repository  == repository
    | where Digest  == digest
    | take 1
),
(
    cluster('https://romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Phoenix_Assessments_LifeCycleEvents
    | where GeneratedTimestamp > ago(2d)
    | where Component == "Publisher"
    | where LifeCycleEvent == "SubAssessmentPublishedSuccessfully"
    | extend RegistryHost = tostring(ArtifactContext.RegistryHost)
    | extend Repository = tostring(ArtifactContext.Repository)
    | extend Digest = tostring(ArtifactContext.Digest)
    | where RegistryHost  == registry
    | where Repository  == repository
    | where Digest  == digest
    | take 1
)
| count
| project ["sub-assessment was generated on the image scan service"] = Count > 0
```

## Step 5 — Verify Image Discovered by Registry Discovery Service (Step 1 outcome)

```kusto
let registry = "<registry url>";
let repository = "<repository>";
let digest = "<image digest>";
union
    (
    cluster('romeeus.eastus.kusto.windows.net').database('ProdRawEvents').Discovery_Acr
    | where ingestion_time() > ago(3d)
    | extend
        RegistryHost = tostring(ResourceMetadata.RegistryHost),
        RepositoryName = tostring(ResourceMetadata.RepositoryName),
        Digest= tostring(ResourceMetadata.Digest)
    | where tolower(registry) == tolower(RegistryHost)
    | where tolower(repository) == tolower(RepositoryName)
    | where tolower(digest) == tolower(Digest)
    | take 1),
    (
    cluster('romeuksouth.uksouth.kusto.windows.net').database('ProdRawEvents').Discovery_Acr
    | where ingestion_time() > ago(3d)
    | extend
        RegistryHost = tostring(ResourceMetadata.RegistryHost),
        RepositoryName = tostring(ResourceMetadata.RepositoryName),
        Digest= tostring(ResourceMetadata.Digest)
    | where tolower(registry) == tolower(RegistryHost)
    | where tolower(repository) == tolower(RepositoryName)
    | where tolower(digest) == tolower(Digest)
    | take 1
    )
| count
| project ["Image was discovered by the azure registry discovery service"] = Count > 0
```
