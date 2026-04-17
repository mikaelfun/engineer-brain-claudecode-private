---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/DCSPM for K8s agentless/[Product Knowledge] Agentless Container Posture"
sourceUrl: "https://dev.azure.com/ASIM-Security/08a9716f-c06d-418d-9916-e38023d36752/_wiki/wikis/805e0e78-f6b1-4ad5-ad26-6cb3aad9f60e?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20Containers%2FDCSPM%20for%20K8s%20agentless%2F%5BProduct%20Knowledge%5D%20Agentless%20Container%20Posture"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Product Knowledge: Agentless Container Posture (DCSPM)

## Overview

Latest enhancements to Defender for Cloud agentless container posture experience.

## Updated Container Recommendations (Preview)

Preview recommendations for "Containers running in AWS/Azure/GCP should have vulnerabilities findings resolved" now **groups all containers of the same workload into a single recommendation** (reduces duplications and fluctuations).

**Assessment IDs changed:**

| Recommendation | Old Assessment Key | New Assessment Key |
|---|---|---|
| Containers running in AWS | d5d1e526-363a-4223-b860-f4b6e710859f | 8749bb43-cd24-4cf9-848c-2a50f632043c |
| Containers running in Azure | e9acaf48-d2cf-45a3-a6e7-3caa2ef769e0 | c5045ea3-afc6-4006-ab8f-86c8574dbf3d |
| Containers running in GCP | c7c1d31d-a604-4b86-96df-63448618e165 | 1b3abfa4-9e53-46f1-9627-51f2957f8bba |

## Kubernetes Identity and Access in Security Graph (Preview)

Kubernetes RBAC entities (service accounts, roles, rolebindings, etc.) and their relationship edges are now in the security graph. Customers can query for RBAC relationships: can authenticate as, can impersonate as, grants role, access defined by, etc.

## K8s Identity-Based Attack Paths (Preview)

Using K8s RBAC data, new attack paths detected:
- Cloud → Kubernetes
- Kubernetes → Cloud
- Inner Kubernetes lateral movement

## Improved Attack Path Analysis (GA)

New attack path analysis engine (released Nov) supports container use cases, dynamically detecting new types of attack paths.

## Full Discovery of Container Images (GA)

All container images in supported registries are now discovered and visible in the security graph, including images without posture recommendations.

## Dangling ACR Hardening Recommendation (Preview)

Detects container workloads pulling images from **deleted ACRs** and recommends stopping use of those images.

| Title | Assessment Key | PG Team |
|---|---|---|
| Container images from deleted Azure Container Registries should not be used in your container workloads | b91e1fa6-9c08-4935-ae98-10dc5e7eab74 | Microsoft Defender for Cloud/Protectors |

**Risk:** Malicious actor could recreate the deleted ACR and replace images with malicious ones.

## Containers Software Inventory

Customers can now get a list of software in their containers/container images via the Security Explorer. Useful for finding all containers running software affected by a 0-day vulnerability (even before CVE published).
