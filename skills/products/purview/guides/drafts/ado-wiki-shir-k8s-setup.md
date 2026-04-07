---
source: ado-wiki
sourceRef: "Supportability/Azure Purview/Microsoft Purview:/[New wiki structure]Purview Data Governance/Troubleshooting Guides (TSGs)/Scan/Self-Hosted IR in K8s/How to setup SHIR in k8s"
sourceUrl: "https://dev.azure.com/Supportability/Azure%20Purview/_wiki/wikis/Microsoft%20Purview?pagePath=%2F%5BNew%20wiki%20structure%5DPurview%20Data%20Governance%2FTroubleshooting%20Guides%20(TSGs)%2FScan%2FSelf-Hosted%20IR%20in%20K8s%2FHow%20to%20setup%20SHIR%20in%20k8s"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# How to Setup SHIR in Kubernetes

## Prerequisite

Make sure you have Purview account. Your Purview account should be either Enterprise account or a new purview account after Dec 2023.

Download IRCTL to a machine that can connect to the K8s cluster:
- IRCTL on Linux: https://aka.ms/purview-irctl/irctl-linux-latest.tar.gz
- IRCTL on Windows: https://aka.ms/purview-irctl/irctl-windows-latest.zip
- Release notes: https://aka.ms/purview-irctl/releasenotes

## On-prem Kubernetes Cluster Requirements

- **Container type**: Linux
- **Kubernetes version**: 1.24.9 or above
- **Node OS**: Ubuntu 18.04 x64 or above
- **Node spec**: minimal 8 cores CPU, 32 GB Memory, 80GB available disk
- **Node count**: >= 1 (fixed node count, NOT enable cluster auto scaler)

## AKS Requirements

- **Node Size**: higher than D8s_v3
- **OS type**: Linux
- **OS Sku**: Azure Linux
- **Scalability**: Disable Node auto-scale
- **Node count**: >= 1

## Create SHIR in Purview Studio

1. Append feature flag `feature.ext.datasource={"enableUXK8sSHIR":"true"}` at the end of Purview URL
2. Create SHIR from Data Map → Source management → Integration runtimes → + New
3. Provide a name, turn on Kubernetes service support, click Create
4. Generate key for SHIR registration

## Install SHIR in AKS

1. Connect to AKS cluster via Azure CLI
2. cd to IRCTL directory
3. Execute: `./irctl create --registration-key <key> --selector agentpool=<your-user-pool>`
4. Registration takes 5-30 minutes

## Check Status

- `./irctl describe` — monitor installation progress and current SHIR status
- If node selector is not specified, all nodes will be used
- For AKS, suggest using AKS node pool label as node selector
