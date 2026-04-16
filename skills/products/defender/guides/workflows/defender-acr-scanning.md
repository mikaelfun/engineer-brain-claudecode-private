# Defender ACR 容器镜像扫描 — 排查工作流

**来源草稿**: ado-wiki-c-acr-arg-queries.md, ado-wiki-c-tsg-acr-image-vuln-security-explorer.md, ado-wiki-d-docker-hub-container-image-va-tsg.md, ado-wiki-d-jfrog-container-image-va-tsg.md, onenote-acr-vulnerability-scanning.md, onenote-acr-vulnerability-simulation-lab.md
**场景数**: 6
**生成日期**: 2026-04-07

---

## Scenario 1: Useful Azure Container Registry ARG Queries
> 来源: ado-wiki-c-acr-arg-queries.md | 适用: Mooncake ⚠️ 未明确

### Kusto 诊断查询
**查询 1:**
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648"
```

**查询 2:**
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

**查询 3:**
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

---

## Scenario 2: Image located on ACR registry (Azure) — ACR Image Vulnerabilities Not in Security Explorer
> 来源: ado-wiki-c-tsg-acr-image-vuln-security-explorer.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **ACR** — customer registry
2. **MDVM Image Scan Manager** — triggers scans, publishes sub-assessments
3. **Modeller** — sends sub-assessments to ARG and Cloud Map
4. **Cloud Map** — Kusto tables storing map components
5. Vulnerable image pushed to ACR
6. Image Scan triggered, vulnerabilities found
7. Sub-assessment generated and sent to Modeller
8. Modeller sends sub-assessments to CloudMap.SubAssessments
9. Update Policy generates Vulnerabilities in CloudMap.Vulnerabilities

### Kusto 诊断查询
**查询 1:**
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

**查询 2:**
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

**查询 3:**
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

**查询 4:**
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

**查询 5:**
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

---

## Scenario 3: Troubleshooting Guide (TSG) for Docker Hub Container Image Vulnerability Assessment
> 来源: ado-wiki-d-docker-hub-container-image-va-tsg.md | 适用: Mooncake ⚠️ 未明确

### 排查步骤
1. **Run the following query:**
2. **Run the following query:**
3. **Run the following query:**
4. **Run the following query:**

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 4: JFrog Container Image VA Troubleshooting Guide
> 来源: ado-wiki-d-jfrog-container-image-va-tsg.md | 适用: Mooncake ⚠️ 未明确

### 决策树
> ⚠️ 本场景包含条件分支判断，请参考来源草稿获取完整决策逻辑。

---

## Scenario 5: ACR Vulnerability Scanning Architecture & Troubleshooting
> 来源: onenote-acr-vulnerability-scanning.md | 适用: Mooncake ✅

### 排查步骤
1. Stale results after image/repo deletion (old pipeline)
2. Pre-existing images not scanned (re-push to trigger)
3. Per-image billing, no rescan fee

### Kusto 诊断查询
**查询 1:**
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey = extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648"
```

**查询 2:**
```kusto
Securityresources
| where type =~ "microsoft.security/assessments/subassessments"
  and properties.additionalData.assessedResourceType =~ "ContainerRegistryVulnerability"
| extend assessmentKey = extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "dbd0cb49-b563-45e7-9724-889e799fa648"
| extend registryAzureId = extract(@"(?i)(.*/Microsoft.ContainerRegistry/registries/[^/]*)", 1, id)
| extend registryHost = properties.additionalData.registryHost
| extend imageId = properties.resourceDetails.id
| extend high = iff(tostring(properties.status.severity) == "High", 1, 0)
| extend medium = iff(tostring(properties.status.severity) == "Medium", 1, 0)
| extend low = iff(tostring(properties.status.severity) == "Low", 1, 0)
| extend healthy = iff(tostring(properties.status.code) == "Healthy", 1, 0)
| summarize high=sum(high), medium=sum(medium), low=sum(low), healthy=sum(healthy),
  timeGenerated=max(tostring(properties.timeGenerated))
  by tolower(tostring(registryAzureId)), tostring(imageId)
```

### 脚本命令
```powershell
az acr import --name <acr> \
  --source mcr.microsoft.com/oss/kubernetes/ingress/nginx-ingress-controller:v1.8.0-linux-arm64-17 \
  --image test-vuln:latest
```

---

## Scenario 6: ACR Vulnerability Simulation Lab Guide
> 来源: onenote-acr-vulnerability-simulation-lab.md | 适用: Mooncake ✅

### 排查步骤
1. **Create Azure ACR** via portal
2. **Prepare Docker client** (Ubuntu Linux VM recommended)
3. **Find CVE-laden image** - use older versions (e.g., nginx ingress 1.8.0)
4. **Import CVE image into ACR**
5. **Check MDC recommendations** for detected CVEs in Azure Portal

### 脚本命令
```powershell
apt install docker.io
```

```powershell
az login -u <user>
   az acr login --name <acrname>
   az acr import --name <acrname> --source mcr.microsoft.com/oss/kubernetes/ingress/nginx-ingress-controller:v1.8.0-linux-arm64-17 --image <tag>:latest
```

---
