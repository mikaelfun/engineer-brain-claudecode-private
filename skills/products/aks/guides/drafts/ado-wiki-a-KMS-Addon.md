---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Addons and Extensions/KMS Addon"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FAddons%20and%20Extensions%2FKMS%20Addon"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Key Management Service (KMS) Addon

[[_TOC_]]

> **NOTE: We are still in the early stages of getting all of the information/troubleshooting info for this new release. It will be updated as available. Until then, the PG is willing to take ICM escalations on anything we do not have training for.**

## Overview

Enables encryption at rest of your Kubernetes data in etcd using Azure Key Vault.

## TSGs

[Engineering Troubleshooting Guide](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/control-plane-bburns/azure-kubernetes-service/azure-kubernetes-service/doc/overlay/security/kms) - Not much info yet  
[PG Wiki for Feature](https://msazure.visualstudio.com/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/189389/Integrate-Azure-Key-Vault-KMS-plugin-with-AKS) - Mostly planning information, limited usefulness

## Docs

Public docs are not yet published. The pre-published docs can be found here: <https://review.docs.microsoft.com/en-us/azure/aks/use-kms-etcd-encryption?branch=pr-en-us-192286>

We will update with the official docs once they are published

## Escalation

We will use our normal ICM escalation path for this feature. The PG is already expecting most issues to be escalated via ICM until they get us more info on the feature.

## Other Links

- [Github Project](https://github.com/Azure/kubernetes-kms)

## Owner and Contributors

**Owner:** Jordan Harder <joharder@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Jordan Harder <joharder@microsoft.com>
- Karina Jacamo <Karina.Jacamo@microsoft.com>
- Jeff Martin <jemartin@microsoft.com>
