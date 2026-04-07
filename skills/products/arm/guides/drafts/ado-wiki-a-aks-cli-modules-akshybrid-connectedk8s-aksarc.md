---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/AKS enabled by Azure Arc/Demystifying Azure CLI Modules for AKS: az akshybrid, az connectedk8s, and az aksarc"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/AKS%20enabled%20by%20Azure%20Arc/Demystifying%20Azure%20CLI%20Modules%20for%20AKS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Overview

This page documents the differences, use cases, benefits, compatibility, and official sources of the three main Azure CLI tools used to manage Kubernetes in hybrid/on-premises scenarios: `az akshybrid`, `az connectedk8s`, and `az aksarc`.

---

## Overview Table

| CLI Extension / Command | Purpose | Aldo Usage |
| --- | --- | --- |
| **`az akshybrid`** | Deploy and manage **AKS on Azure Stack HCI** (AKS hybrid clusters). | Not Used |
| **`az connectedk8s`** | Connect **existing Kubernetes clusters** (on-prem or cloud) to Azure Arc for management. | Not Used |
| **`az aksarc`** | Create and manage **AKS-style clusters** on **non-Azure infrastructure** (HCI, VMWare, bare metal) from Azure. | Used |

---

## Detailed Comparison

| Feature / Capability | `az akshybrid` | `az connectedk8s` | `az aksarc` _(Preview)_ |
| --- | --- | --- | --- |
| Installs Kubernetes | Yes (on Azure Stack HCI) | No (connects existing K8s) | Yes (on VMWare, HCI, bare metal) |
| Cluster lifecycle management (from Azure) | Partial (via Arc connection) | No | Full (create, scale, delete) |
| Azure Arc integration | Optional | Required | Built-in |
| Target platform | Azure Stack HCI, Windows Server | Any conformant K8s (on-prem, cloud) | Azure Stack HCI, VMWare, bare metal |
| Node OS supported | Windows Server, Linux | Linux (Ubuntu, RHEL, etc.), Windows | Linux (today), Windows (future) |
| Use case | On-prem AKS deployment | Centralized mgmt of any K8s cluster | AKS-style experience outside Azure |

---

## Benefits and Examples

### `az akshybrid`

**Benefits:**
- Full AKS distribution, optimized for Azure Stack HCI
- Integrated with Windows Admin Center and PowerShell
- Ideal for edge/on-prem environments with no initial internet access
- Runs both Linux and Windows containers

**Example:**
```bash
az akshybrid create --name myaks --resource-group myrg --control-plane-node-count 3
```

### `az connectedk8s`

**Benefits:**
- Lightweight option to bring **any existing Kubernetes cluster** under Azure management
- Enables GitOps, Azure Monitor, Defender for Containers, and Azure Policy
- No need to modify or recreate clusters

**Example:**
```bash
az connectedk8s connect --name VMWareCluster01 --resource-group hybridrg
```

### `az aksarc` *(Preview)*

**Benefits:**
- Provides a **true AKS control plane** for non-Azure environments
- Azure manages the full lifecycle: create, upgrade, delete, scale
- Supports disconnected provisioning via Resource Bridge
- Simplifies operations for VMWare, bare metal, or HCI environments

**Example:**
```bash
az aksarc create --name store-cluster-01 --resource-group retail-rg --location eastus --control-plane-node-count 1
```

---

## Use Case Cheat Sheet

| Scenario | Use this CLI |
| --- | --- |
| Deploy AKS on Azure Stack HCI hardware | `az akshybrid` |
| Manage existing K8s clusters from Azure | `az connectedk8s` |
| Provision AKS clusters on VMWare, HCI, or bare metal from Azure | `az aksarc` _(Preview)_ |

---

## Azure Stack HCI Version Compatibility

| CLI / Feature | 21H2 | 22H2 | 23H2 | Notes |
| --- | --- | --- | --- | --- |
| `az akshybrid` | Yes | Yes | Not officially targeted | Requires AKS-HCI support |
| `az aksarc` _(Preview)_ | No | No | Required | Needs 23H2 or newer |
| `az connectedk8s` | Yes | Yes | Yes | Infra-agnostic; supports clusters running on any HCI version |

---

## Sources / References

- [`az akshybrid` official docs](https://learn.microsoft.com/en-us/cli/azure/akshybrid?view=azure-cli-latest)
- [`az connectedk8s` official docs](https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/)
- [`az aksarc` official preview docs](https://learn.microsoft.com/en-us/azure/aks/aksarc/)
- [Azure Stack HCI release notes](https://learn.microsoft.com/en-us/azure/azure-local/?view=azloc-2505)
