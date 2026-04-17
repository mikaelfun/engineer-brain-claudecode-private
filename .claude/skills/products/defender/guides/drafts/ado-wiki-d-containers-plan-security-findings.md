---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/[Product Knowledge] - Containers Plan Security findings (Preview)"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/%5BProduct%20Knowledge%5D%20-%20Containers%20Plan%20Security%20findings%20(Preview)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Containers Plan - Security findings (Preview)

## Feature Description

"The vulnerability findings artifact is signed with a Microsoft certificate for integrity and authenticity and is associated with the container image in the registry for validation needs."

## Example Usage

The customer can configure their CI/CD pipeline to deploy only signed images that have already been scanned and verified.

## How it Works

Once the image is pushed or pulled, the MDC will scan the image for vulnerabilities. If the plan feature is enabled, then MDC will append a manifest to the ACR image.

## Feature Settings from Containers Plan

Azure > Microsoft Defender for Cloud > Environment Settings > Subscription > Containers Plan(Settings) > Security findings (Preview).

## Feature Settings from ACR Registry

Azure > ACR > Repositories > Image > Manifests.

## Manifest Details

| Field | Description |
|---|---|
| in-toto.io/predicate-type | Points to the vulnerability attestation schema (https://in-toto.io/attestation/vulns/v0.2) |
| org.opencontainers.image.created | Timestamp when the image (or artifact) was created |
| report-type | For Defender, this is typically SoftwareInventoryAssessment (indicating a vulnerability/software inventory report) |
| scanner | MDVM (Microsoft Defender Vulnerability Management engine) |

## Public Docs

- https://learn.microsoft.com/en-us/azure/defender-for-cloud/secure-container-image
- https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction
