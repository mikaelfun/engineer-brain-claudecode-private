---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Troubleshooting Guide] - Azure Container Registry (ACR) vulnerability assessment (VA)/[Technical Knowledge] - Containers VA powered by MDVM/[Technical Knowledge] - Containers Vulnerability-assessment powered by Microsoft-Defender-Vulnerability-Management - One Queue"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2F%5BTroubleshooting%20Guide%5D%20-%20Azure%20Container%20Registry%20(ACR)%20vulnerability%20assessment%20(VA)%2F%5BTechnical%20Knowledge%5D%20-%20Containers%20VA%20powered%20by%20MDVM%2F%5BTechnical%20Knowledge%5D%20-%20Containers%20Vulnerability-assessment%20powered%20by%20Microsoft-Defender-Vulnerability-Management%20-%20One%20Queue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Containers VA powered by MDVM - One Queue

## Overview
One Queue feature offers granular risk assessment for both container images and running containers, shifting focus from evaluating container registries and Kubernetes clusters to individual resources.

New recommendations replace existing ones. Old recommendations are deprecated approximately one month after public preview.

## Key Points
- No changes in Phoenix Assessments Life Cycle Events table; investigation process unchanged.
- Advanced ARG queries largely unaffected; transition from old to new assessment keys needed.
- Assessment scope is now the granular resource (container image or running container), not the registry or cluster.
- Sub-assessment additional data schema stays consistent across all new recommendations.

## Assessment Keys

| Existing recommendation | Old key | New recommendation | New key |
|---|---|---|---|
| Azure registry container images should have vulnerabilities resolved | c0b7cfc6-3172-465a-b378-53c7ff2cc0d5 | [Preview] Container images in Azure registry should have vulnerability findings resolved | 33422d8f-ab1e-42be-bc9a-38685bb567b9 |
| Azure running container images should have vulnerabilities resolved | c609cf0f-71ab-41e9-a3c6-9a1f7fe1b8d5 | [Preview] Containers running in Azure should have vulnerability findings resolved | e9acaf48-d2cf-45a3-a6e7-3caa2ef769e0 |
| AWS registry container images | c27441ae-775c-45be-8ffa-655de37362ce | [Preview] Container images in AWS registry | 2a139383-ec7e-462a-90ac-b1b60e87d576 |
| AWS running container images | 682b2595-d045-4cff-b5aa-46624eb2dd8f | [Preview] Containers running in AWS | d5d1e526-363a-4223-b860-f4b6e710859f |
| GCP registry container images | 5cc3a2c1-8397-456f-8792-fe9d0d4c9145 | [Preview] Container images in GCP registry | 24e37609-dcf5-4a3b-b2b0-b7d76f2e4e04 |
| GCP running container images | e538731a-80c8-4317-a119-13075e002516 | [Preview] Containers running in GCP | c7c1d31d-a604-4b86-96df-63448618e165 |

## Contract Changes - Registry Sub-assessments

**Key change**: Removal of sub resource ID. The `resourceDetails.id` now contains the full resource ID of the container image (not the sub resource ID of the container registry).

New fields added:
- `ResourceType`: "containerImage"
- `ResourceName`: name of the container image
- `ResourceProvider`: e.g., "Azure Container Registry", "Elastic Container Registry", "Google Artifact Registry"

## Contract Changes - Runtime Sub-assessments

**Key changes**:
1. Removal of sub resource ID (now full resource ID of running container)
2. Removal of aggregated `kubernetesContext` field, replaced with flat `kubernetesDetails`:
   - `namespace`, `clusterResourceId`, `clusterName`, `controllerKind`, `controllerName`
   - `containerName`, `clusterKind`, `containerId`, `podName`, `cloud`

## ARG Query Examples

### Fetch Azure ACR VA sub-assessment (new key)
```kusto
securityresources
| where type =~ "microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "33422d8f-ab1e-42be-bc9a-38685bb567b9"
```

### Fetch Kubernetes context for running container sub-assessment
```kusto
securityresources
| where type =~ "microsoft.security/assessments/subassessments"
| extend assessmentKey=extract(@"(?i)providers/Microsoft.Security/assessments/([^/]*)", 1, id)
| where assessmentKey == "e9acaf48-d2cf-45a3-a6e7-3caa2ef769e0" and id == "{id}"
| project todynamic(properties.additionalData.kubernetesDetails)
```
