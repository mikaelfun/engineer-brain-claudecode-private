# AKS Azure Arc -- Comprehensive Troubleshooting Guide

**Entries**: 2 | **Draft sources**: 0 | **Kusto queries**: 1
**Kusto references**: extension-manager.md
**Generated**: 2026-04-07

---

## Phase 1: The issue is with spec.

### aks-1310: Unable to download helm charts in Azure Arc.

**Root Cause**: The issue is with spec.

**Solution**:
Check the YAML file where you have mentioned to download the helm charts from helm repository the spec should be repository in the file.

`[Score: [B] 6.5 | Source: [ContentIdea#150494](https://support.microsoft.com/kb/4619254)]`

## Phase 2: storage.googleapis.com
is used to download kubectl

### aks-1324: Onboarding of Rancher Kubernetes Engine cluster to Azure Arc is failing with bel...

**Root Cause**: storage.googleapis.com
is used to download kubectl release in case the kubectl is not present in the
customer environment. It
is observed that the endpoint storage.googleapis.com is being blocked
resulting the onboarding operation is getting failed.  It
is needed for a successful onboarding of Rancher Kubernetes Engine cluster
to Azure Arc but the endpoint didn't listed in below article. https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/network-requirements?tabs=azure-cloud#details

**Solution**:
From
Azure CLI version 2.68.0 onwards, CLI is downloading the binary
from dl.k8s.io/release for
all cloud envs except mooncake, where the binary is downloaded from mirror.azure.cn. Hence,
we no need to allow endpoint storage.googleapis.com for
onboarding Rancher Kubernetes Engine cluster to Azure Arc.

`[Score: [B] 6.5 | Source: [ContentIdea#201260](https://support.microsoft.com/kb/5058634)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Unable to download helm charts in Azure Arc. | The issue is with spec. | Check the YAML file where you have mentioned to download the... | [B] 6.5 | [ContentIdea#150494](https://support.microsoft.com/kb/4619254) |
| 2 | Onboarding of Rancher Kubernetes Engine cluster to Azure Arc is failing with bel... | storage.googleapis.com is used to download kubectl release i... | From Azure CLI version 2.68.0 onwards, CLI is downloading th... | [B] 6.5 | [ContentIdea#201260](https://support.microsoft.com/kb/5058634) |
