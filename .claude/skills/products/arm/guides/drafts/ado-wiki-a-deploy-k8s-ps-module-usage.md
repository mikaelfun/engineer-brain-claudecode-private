---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/How to use the "DeployK8sNestedVirtualizedInfrastructure" PS module"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/How%20to%20use%20the%20%22Deploy%E2%80%91K8sNestedVirtualizedInfrastructure%22%20PS%20module"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

The **Deploy-K8sNestedVirtualizedInfrastructure** PowerShell module automates end-to-end deployment of Kubernetes clusters on nested virtualized infrastructure using Hyper-V. It handles host preparation, VM provisioning from cloud images (Ubuntu or Azure Linux), and full Kubernetes cluster setup with Kube-OVN SDN, Multus CNI, optional KubeVirt, and optional Azure Arc integration — all from a single PowerShell module.

---

## Table of Contents

1. <a href="#overview">Overview</a>
2. <a href="#prerequisites">Prerequisites</a>
3. <a href="#installation">Installation</a>
4. <a href="#deployment-sizes">Deployment Sizes</a>
5. <a href="#deployment-stacks">Deployment Stacks</a>
6. <a href="#deployment-phases">Deployment Phases</a>
7. <a href="#module-functions">Module Functions</a>
   - <a href="#fn-deploy-infrastructure">K8sNVI-DeployInfrastructure</a>
   - <a href="#fn-prepare-host">K8sNVI-PrepareHostHyperVServer</a>
   - <a href="#fn-deploy-vm">K8sNVI-DeployInfrastructureVM</a>
   - <a href="#fn-deploy-k8s">K8sNVI-DeployK8sCluster</a>
   - <a href="#fn-redeploy-vms">K8sNVI-RedeployInfrastructureVMs</a>
   - <a href="#fn-cleanup-arc">K8sNVI-CleanupAzureArc</a>
   - <a href="#fn-help">K8sNVI-GetDeploymentHelp</a>
8. <a href="#usage-examples">Usage Examples</a>
9. <a href="#azure-arc-integration">Azure Arc Integration</a>
10. <a href="#phase4-checkpoint-resume">Phase 4 Checkpoint and Resume</a>
11. <a href="#network-architecture">Network Architecture</a>
12. <a href="#memory-preflight">Memory Pre-Flight and Worker Reduction</a>
13. <a href="#logging-and-diagnostics">Logging and Diagnostics</a>
14. <a href="#manual-cleanup">Manual Cleanup</a>
15. <a href="#additional-resources">Additional Resources</a>

---

<a id="overview"></a>
## Overview

This module provides a fully automated pipeline to deploy Kubernetes clusters on Hyper-V nested virtualization. It is designed for lab, dev/test, and proof-of-concept environments running on Windows Server with Hyper-V.

**Key capabilities:**

- 4-phase deployment: Host preparation → Tool installation → VM provisioning → Kubernetes cluster setup
- 3 deployment sizes (Small, Medium, Large) with automatic hardware validation
- Large size deploys a **3-master HA control plane** with kube-vip floating VIP failover
- Selectable deployment stacks for component versioning (`-DeploymentStack Stable|Latest|ALRS`)
- Fully automated orchestration or manual phase-by-phase control
- VM redeployment and recovery (tear down and rebuild without re-preparing the host)
- **Azure Arc integration** — enroll clusters into Azure Arc with optional extensions (Monitor, Policy, Defender)
- **Phase 4 checkpoint/resume** — resume failed deployments from the last successful phase
- **Memory pre-flight checks** with automatic worker memory reduction when host RAM is tight
- **Partial-success tracking** — per-VM deployment status with actionable failure reports
- **Parallel SSH execution** — system init, containerd, and K8s install run on all nodes simultaneously
- Built-in topic-based help system (`K8sNVI-GetDeploymentHelp`)

> **ALRS Deployment Stack:** For full documentation on the ALRS deployment stack (Azure Linux 3.0 + Cilium primary CNI + Kube-OVN secondary CNI + ecosystem parity components), see the dedicated article: [Deploy-K8sNestedVirtualizedInfrastructure - ALRS Deployment Stack Guide - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2553541/Deploy-K8sNestedVirtualizedInfrastructure-ALRS-Deployment-Stack-Guide).

---

<a id="prerequisites"></a>
## Prerequisites

### Hardware Requirements

- The current design of this sandbox environment assumes that the Hyper-V host runs on a **Windows Server 2022 Virtual Machine** deployed in **Azure Stack Hub** or **Azure** using one of the **DSv3** sizes where **nested virtualization is enabled** — **D8s_v3**, **D16s_v3** or **D32s_v3**.
- **1 TB Data disk** is required to be attached to this VM.
- VM has a **Public IP** attached to its vNIC, ensuring Internet access and Inbound RDP connectivity.
- vNIC is internally named to "**Ethernet**".

Deployment guide can be found at [Steps to deploy the K8s+Kube-OVN sandbox lab environment in Azure Stack Hub - Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2433768/Steps-to-deploy-the-K8s-Kube-OVN-sandbox-lab-environment-in-Azure-Stack-Hub).

| Deployment Size | Azure VM Size | Min CPU | Min RAM | Notes |
|--|--|--|--|--|
| **Small** | D8s_v3 | 8 | 31 GB | 1 master + 2 workers |
| **Medium** | D16s_v3 | 16 | 63 GB | 1 master + 2 workers |
| **Large** | D32s_v3 | 32 | 127 GB | 3 masters + 3 workers (HA) |

---

<a id="installation"></a>
## Installation

1. Download the latest version of the PS module from "[Deploy-K8sNestedVirtualizedInfrastructure_2.10.30.zip](https://microsofteur-my.sharepoint.com/:u:/g/personal/mariusb_microsoft_com/IQDgIIQytpA0RpOe52m938MzAY20JkDYGppifKF2SWyH-bc?e=wWh6yf)".
2. Once your Hyper-V Host is ready, copy the zip file to the "**C:\Temp**" location on it, and run the following code to install the PS module:

```powershell
$SourceFolder = "C:\Temp"
$DestinationFolder = "$HOME\Documents\WindowsPowerShell\Modules\"
Expand-Archive -Path "$SourceFolder\Deploy-K8sNestedVirtualizedInfrastructure_2.10.30.zip" -DestinationPath $DestinationFolder -Force
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
Get-Command -Module Deploy-K8sNestedVirtualizedInfrastructure
```

**Quick start — one-command for a full deployment of a Small size**

This validates hardware, performs Phases 1–2 (with a scheduled Phase-2 run after reboot), then auto-provisions the Infrastructure VMs and completes the K8s cluster install (Phases 3–4).

```powershell
# Elevated PowerShell on the Hyper-V host
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Small -IncludeKubeVirt
```

# List available commands

```powershell
Get-Command -Module Deploy-K8sNestedVirtualizedInfrastructure
```

# View built-in help

```powershell
K8sNVI-GetDeploymentHelp
```

> **Note:** The module uses non-standard PowerShell verb prefixes (e.g., `K8sNVI-`) by design. You can safely ignore the "unapproved verb" warnings on import by using `Import-Module ... -DisableNameChecking`.

---

<a id="deployment-sizes"></a>
## Deployment Sizes

The module supports three deployment sizes, each defining a specific VM topology and resource allocation:

### Small (D8s_v3 — 8 CPU / 31 GB RAM)

| VM Name | Role | CPU | RAM | Disk | IP |
|--|--|--|--|--|--|
| kubeovn-master | Master | 6 | 6 GB | 100 GB | 172.100.0.6 |
| kubeovn-worker1 | Worker | 8 | 10 GB | 350 GB | 172.100.0.7 |
| kubeovn-worker2 | Worker | 8 | 10 GB | 350 GB | 172.100.0.8 |

### Medium (D16s_v3 — 16 CPU / 63 GB RAM)

| VM Name | Role | CPU | RAM | Disk | IP |
|--|--|--|--|--|--|
| kubeovn-master | Master | 8 | 8 GB | 100 GB | 172.100.0.6 |
| kubeovn-worker1 | Worker | 14 | 24 GB | 350 GB | 172.100.0.7 |
| kubeovn-worker2 | Worker | 14 | 24 GB | 350 GB | 172.100.0.8 |

### Large (D32s_v3 — 32 CPU / 127 GB RAM) — HA Control Plane

| VM Name | Role | CPU | RAM | Disk | IP |
|---------|------|-----|-----|------|----|
| kubeovn-master1 | Master | 8 | 10 GB | 100 GB | 172.100.0.6 |
| kubeovn-worker1 | Worker | 30 | 26 GB | 200 GB | 172.100.0.7 |
| kubeovn-worker2 | Worker | 30 | 26 GB | 200 GB | 172.100.0.8 |
| kubeovn-master2 | Master | 8 | 10 GB | 100 GB | 172.100.0.9 |
| kubeovn-master3 | Master | 8 | 10 GB | 100 GB | 172.100.0.10 |
| kubeovn-worker3 | Worker | 30 | 26 GB | 200 GB | 172.100.0.11 |

**Large HA details:**

- **kube-vip** static pod on all 3 masters for ARP-based leader election
- Floating **VIP: 172.100.0.100** — Kubernetes API endpoint
- `kubeadm init` uses `--control-plane-endpoint=172.100.0.100:6443` with `--upload-certs`
- Additional masters join with `--control-plane` and `--certificate-key`
- Failover occurs in <2 seconds via gratuitous ARP

---

<a id="deployment-stacks"></a>
## Deployment Stacks

All functions accept `-DeploymentStack [Stable|Latest|ALRS]` (default: `Stable`).

| Component | Stable (default) | Latest | ALRS |
|-----------|-------------------|--------|------|
| **Guest OS** | Ubuntu 22.04 LTS (Jammy) | Ubuntu 24.04 LTS (Noble) | Azure Linux 3.0 |
| **Kubernetes** | 1.33 | 1.34 | 1.33.7 (pinned) |
| **containerd** | Latest | Latest | 2.0.0 (pinned) |
| **Primary CNI** | Kube-OVN 1.14.11 | Kube-OVN 1.15.0 | Cilium 1.17.3 |
| **Secondary CNI** | — | — | Kube-OVN 1.14.11 (via Multus) |
| **Multus** | Yes | Yes | Yes |

The stack controls: guest OS image source, Kubernetes repo version, CRI tools version, Kube-OVN branch/version, and CNI topology. All functions within a deployment should use the same stack.

> **ALRS stack** deploys a dual-CNI architecture with Cilium as primary and Kube-OVN as secondary, plus 13 additional open-source ecosystem components for Nexus Cloud reference architecture parity. See [KB-ALRS-DeploymentStack.md](KB-ALRS-DeploymentStack.md) for full details.

---

<a id="deployment-phases"></a>
## Deployment Phases

### Phase 1 — Host Preparation

- Installs Windows Server roles: **Hyper-V**, **RRAS** (routing), **DHCP Server**
- Disables Server Manager auto-open at logon
- Reboots the host to activate Hyper-V

### Phase 2 — Roles Configuration and Tools Installation

- Runs as a scheduled task after reboot (configurable: Logon or Startup trigger in Phase 1)
- Initializes data disk (Disk 2 → F:\)
- Creates Hyper-V virtual switches (External "Internet" + Internal "Kube-OVN")
- Configures NAT routing via RRAS (with NetNat fallback)
- Sets up DHCP scope 172.100.0.0/24
- Installs tools via **WinGet** (with direct-download fallback): **PuTTY**, **Wireshark**
- Installs **sshpass** for non-interactive SSH authentication
- Uses resilient multi-method downloads (HttpClient → BITS → Invoke-WebRequest)

### Phase 3 — VM Deployment

- Downloads Ubuntu cloud image (version determined by deployment stack), or builds Azure Linux 3.0 VHD from ISO (ALRS stack)
- Converts QCOW2 → VHD using qemu-img (Ubuntu) or runs unattended Hyper-V installer (Azure Linux)
- Generates cloud-init configuration (user-data, meta-data, network-config)
- Creates seed ISO for cloud-init injection (oscdimg from ADK, with VHD fallback)
- Creates Hyper-V Gen-1 VMs with dynamic IPs and configured with unattended data using cloud-init in a NoCloud setting
- **Memory pre-flight check** — verifies host has enough available RAM for all VMs; automatically reduces worker memory if needed
- **Partial-success tracking** — records per-VM deployment status (Deployed/Failed/Skipped) and stops on first failure
- Creates pre-boot DHCP reservations (MAC-based) before VM startup
- Verifies SSH connectivity to each VM

### Phase 4 — Kubernetes Cluster Deployment

Phases 4.1–4.3 run in **parallel** across all nodes for faster deployment:

- **4.1** Initializes systems (firewall, swap, kernel modules, NTP)
- **4.2** Installs containerd runtime
- **4.3** Installs Kubernetes tools (kubeadm, kubectl, kubelet)
- **4.4** Initializes control plane (`kubeadm init`)
  - HA mode: uses `--control-plane-endpoint` and `--upload-certs`
  - ALRS mode: uses `--skip-phases=addon/kube-proxy`
- **4.4b** *(HA only)* Installs kube-vip static pod on primary master
- **4.5** Extracts join command from logs (with SSH fallback)
- **4.5a–4.5b** *(HA only)* Installs kube-vip and joins additional master nodes
- **4.6** Joins worker nodes (parallel for multiple workers)
- **4.7** Deploys Kube-OVN SDN (or Cilium + Kube-OVN in ALRS mode — see <a href="#deployment-stacks">Deployment Stacks</a>)
- **4.8** Installs Multus CNI
- **4.9** *(optional)* Installs libvirt-clients + QEMU on all nodes (parallel)
- **4.10** *(optional)* Installs KubeVirt operator, CR, Krew, virtctl, CDI
- **4.10b** *(ALRS + KubeVirt)* Configures dedicated live-migration network
- **4.11–4.23** *(ALRS only)* Deploys ecosystem parity components — see [ALRS article](KB-ALRS-DeploymentStack.md)
- **4.24** *(Azure Arc)* Installs Azure CLI on master
- **4.25** *(Azure Arc)* Enrolls cluster into Azure Arc
- **4.26** *(Azure Arc, optional)* Azure Monitor Container Insights
- **4.27** *(Azure Arc, optional)* Azure Policy for Kubernetes
- **4.28** *(Azure Arc, optional)* Microsoft Defender for Containers

Each phase saves a **checkpoint** on completion. Failed deployments can be resumed with `-Resume`. See <a href="#phase4-checkpoint-resume">Phase 4 Checkpoint and Resume</a>.

---

<a id="module-functions"></a>
## Module Functions

<a id="fn-deploy-infrastructure"></a>
### `K8sNVI-DeployInfrastructure` — Full Orchestrated Deployment (Phases 1–4)

The simplest way to deploy. Validates hardware, then orchestrates all 4 phases automatically (including reboot).

```powershell
K8sNVI-DeployInfrastructure `
    -AdminUser "kubeadmin" `
    -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium `
    -DeploymentStack Stable
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-AdminUser` | Yes | — | VM admin username |
| `-AdminPassword` | Yes | — | VM admin password / SSH password |
| `-DeploymentSize` | No | Small | Small, Medium, or Large |
| `-IncludeKubeVirt` | No | $false | Install KubeVirt virtualization stack |
| `-DeploymentStack` | No | Stable | Stable, Latest, or ALRS |
| `-IncludeAzureArc` | No | $false | Enroll cluster into Azure Arc after deployment |
| `-AzureSubscription` | If Arc | — | Azure subscription ID or name |
| `-AzureResourceGroup` | If Arc | — | Azure resource group name |
| `-AzureLocation` | If Arc | — | Azure region (e.g., `eastus2`) |
| `-ArcClusterName` | No | kubeovn-cluster | Arc-connected cluster resource name |
| `-ArcServicePrincipalId` | No | — | SP app ID for unattended Arc auth |
| `-ArcServicePrincipalSecret` | No | — | SP secret for unattended Arc auth |
| `-ArcTenantId` | No | — | Azure AD tenant ID for SP auth |
| `-IncludeAzureMonitor` | No | $false | Deploy Azure Monitor extension |
| `-IncludeAzurePolicy` | No | $false | Deploy Azure Policy extension |
| `-IncludeDefenderForContainers` | No | $false | Deploy Defender for Containers extension |

---

<a id="fn-prepare-host"></a>
### `K8sNVI-PrepareHostHyperVServer` — Host Preparation (Phases 1–2)

Configures the Hyper-V host. Can optionally auto-trigger VM + K8s deployment after Phase 2.

```powershell
# Host prep only (manual VM deployment afterward)
K8sNVI-PrepareHostHyperVServer -RebootAfter -Phase2Trigger Logon -Phase2DelaySeconds 10

# Host prep with auto-deployment after Phase 2
K8sNVI-PrepareHostHyperVServer -RebootAfter -Phase2Trigger Logon `
    -AutoDeployAfterPhase2 `
    -AutoAdminUser "kubeadmin" -AutoAdminPassword "SecurePass123!" `
    -AutoDeploymentSize Medium
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-RebootAfter` | No | $false | Reboot host after Phase 1 |
| `-Phase2Trigger` | No | Logon | When to run Phase 2: `Logon` or `Startup` |
| `-Phase2DelaySeconds` | No | 0 | Delay before Phase 2 execution |
| `-NoRegisterPhase2Task` | No | $false | Skip scheduled task registration |
| `-AutoDeployAfterPhase2` | No | $false | Auto-deploy VMs + K8s after Phase 2 |
| `-AutoAdminUser` | No | — | VM admin user (required with `-AutoDeployAfterPhase2`) |
| `-AutoAdminPassword` | No | — | VM admin password (required with `-AutoDeployAfterPhase2`) |
| `-AutoDeploymentSize` | No | Small | Small, Medium, or Large |
| `-AutoIncludeKubeVirt` | No | $false | Include KubeVirt in auto-deployment |
| `-DeploymentStack` | No | Stable | Stable, Latest, or ALRS |
| `-AutoIncludeAzureArc` | No | $false | Include Azure Arc in auto-deployment |
| `-AutoAzureSubscription` | No | — | Azure subscription for Arc (auto-deploy) |
| `-AutoAzureResourceGroup` | No | — | Azure resource group for Arc (auto-deploy) |
| `-AutoAzureLocation` | No | — | Azure region for Arc (auto-deploy) |
| `-AutoArcClusterName` | No | kubeovn-cluster | Arc cluster name (auto-deploy) |

> All Azure Arc auto-deploy parameters (`-AutoArcServicePrincipalId`, `-AutoArcServicePrincipalSecret`, `-AutoArcTenantId`, `-AutoIncludeAzureMonitor`, `-AutoIncludeAzurePolicy`, `-AutoIncludeDefenderForContainers`) are also supported and forwarded to Phase 4.

---

<a id="fn-deploy-vm"></a>
### `K8sNVI-DeployInfrastructureVM` — Individual VM Deployment (Phase 3)

Deploys a single VM on Hyper-V. Uses Ubuntu cloud images by default; when `-DeploymentStack ALRS` is specified, builds an Azure Linux 3.0 VHD from the official ISO via an unattended Hyper-V installer pipeline.

```powershell
K8sNVI-DeployInfrastructureVM -VMName "kubeovn-master" `
    -CpuCount 8 -MemoryStartupGB 8 -DiskSizeGB 100 `
    -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -SwitchName "Kube-OVN" -IPv4Address "172.100.0.6" `
    -CreateOrConvertReservation -ResizeVhd -TestSshConnectivity `
    -IsoRequired
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-VMName` | Yes | — | Hyper-V VM name |
| `-SwitchName` | Yes | — | Hyper-V virtual switch name |
| `-CpuCount` | No | 4 | Number of vCPUs |
| `-MemoryStartupGB` | No | 4 | RAM in GB |
| `-DiskSizeGB` | No | 40 | OS disk size in GB |
| `-Hostname` | No | VMName | Guest OS hostname |
| `-TimeZone` | No | UTC | Guest OS timezone |
| `-AdminUser` | Yes | — | VM admin username |
| `-AdminPassword` | Yes | — | VM admin password |
| `-IPv4Address` | No | — | Static IP address (DHCP if omitted) |
| `-RepoPath` | No | F:\K8sNVI_DataRepository | Shared image cache directory |
| `-IsoRequired` | No | $false | Create cloud-init seed ISO (recommended) |
| `-CreateOrConvertReservation` | No | $false | Create pre-boot DHCP reservation |
| `-ResizeVhd` | No | $false | Resize VHD to `-DiskSizeGB` |
| `-TestSshConnectivity` | No | $false | Verify SSH after deployment |
| `-NoRestartAfterConnectivity` | No | $false | Skip VM restart after connectivity check |
| `-DeploymentStack` | No | Stable | Stable, Latest, or ALRS |

> **Note:** When using orchestrated deployment (`K8sNVI-DeployInfrastructure`), the `-CpuCount`, `-MemoryStartupGB`, and `-DiskSizeGB` defaults are overridden by the deployment size configuration.

> **DHCP Reservation:** The module creates a **pre-boot MAC-based DHCP reservation** before starting the VM, so the VM receives its designated IP on first DHCP request. The deterministic MAC address is derived from the VM name using MD5, ensuring the same VM name always gets the same MAC.

---

<a id="fn-deploy-k8s"></a>
### `K8sNVI-DeployK8sCluster` — Kubernetes Cluster Deployment (Phase 4)

Deploys Kubernetes to existing VMs. Can be run independently after VMs are provisioned.

```powershell
# Full K8s deployment (Small/Medium)
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!"

# Full K8s deployment (Large HA)
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -IncludeKubeVirt

# KubeVirt-only (existing K8s cluster)
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -InstallKubeVirtOnly

# Resume from last checkpoint after a failure
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Small -IncludeKubeVirt -Resume
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-AdminUser` | No | kubeadmin | SSH username |
| `-AdminPassword` | No | — | SSH password |
| `-SSHCredential` | No | — | Alternative PSCredential object |
| `-DeploymentSize` | No | Small | VM topology: Small, Medium, or Large |
| `-IncludeKubeVirt` | No | $false | Install KubeVirt with full deployment |
| `-InstallKubeVirtOnly` | No | $false | Install KubeVirt only (skip K8s setup) |
| `-DeploymentStack` | No | Stable | Stable, Latest, or ALRS |
| `-Resume` | No | $false | Resume from last successful checkpoint |
| `-IncludeAzureArc` | No | $false | Enroll cluster into Azure Arc |
| `-InstallAzureArcOnly` | No | $false | Skip K8s phases, Arc enrollment only |
| `-AzureSubscription` | If Arc | — | Azure subscription ID or name |
| `-AzureResourceGroup` | If Arc | — | Azure resource group name |
| `-AzureLocation` | If Arc | — | Azure region (e.g., `eastus2`) |
| `-ArcClusterName` | No | kubeovn-cluster | Arc-connected cluster resource name |
| `-ArcServicePrincipalId` | No | — | SP app ID for unattended Arc auth |
| `-ArcServicePrincipalSecret` | No | — | SP secret for unattended Arc auth |
| `-ArcTenantId` | No | — | Azure AD tenant ID for SP auth |
| `-IncludeAzureMonitor` | No | $false | Deploy Azure Monitor extension |
| `-IncludeAzurePolicy` | No | $false | Deploy Azure Policy extension |
| `-IncludeDefenderForContainers` | No | $false | Deploy Defender for Containers extension |

---

<a id="fn-redeploy-vms"></a>
### `K8sNVI-RedeployInfrastructureVMs` — VM Redeployment & Recovery

Tears down all existing `kubeovn-*` VMs, cleans up DHCP and storage, and redeploys fresh VMs. Supports switching between deployment sizes (e.g., Small → Large).

```powershell
# Redeploy VMs only (no K8s)
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium

# Full reset: redeploy VMs + K8s + KubeVirt
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -DeployKubernetes -IncludeKubeVirt
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-AdminUser` | Yes | — | VM admin username |
| `-AdminPassword` | Yes | — | VM admin password |
| `-DeploymentSize` | No | Small | Target size for redeployed VMs |
| `-DeployKubernetes` | No | $false | Deploy K8s after VMs are ready |
| `-IncludeKubeVirt` | No | $false | Include KubeVirt with K8s deployment |
| `-SwitchName` | No | Kube-OVN | Hyper-V virtual switch |
| `-DhcpServer` | No | localhost | DHCP server hostname or IP |
| `-DhcpScopeId` | No | auto-detected | DHCP scope ID |
| `-WorkDirBase` | No | F:\K8sNVI_InfraVirtualMachines | VM storage path |
| `-DeploymentStack` | No | Stable | Stable, Latest, or ALRS |
| `-IncludeAzureArc` | No | $false | Enroll cluster into Azure Arc |
| `-AzureSubscription` | If Arc | — | Azure subscription ID or name |
| `-AzureResourceGroup` | If Arc | — | Azure resource group |
| `-AzureLocation` | If Arc | — | Azure region |
| `-ArcClusterName` | No | kubeovn-cluster | Arc cluster resource name |
| `-ArcServicePrincipalId` | No | — | SP for unattended Arc auth |
| `-ArcServicePrincipalSecret` | No | — | SP secret |
| `-ArcTenantId` | No | — | Tenant ID |
| `-IncludeAzureMonitor` | No | $false | Deploy Monitor extension |
| `-IncludeAzurePolicy` | No | $false | Deploy Policy extension |
| `-IncludeDefenderForContainers` | No | $false | Deploy Defender extension |

**Redeployment steps performed:**

1. Stop all `kubeovn-*` VMs
2. Remove VMs from Hyper-V
3. Delete VM storage directory
4. Remove all DHCP reservations and leases from scope 172.100.0.0
5. Redeploy VMs with the selected deployment size configuration (with memory pre-flight check)

---

<a id="fn-cleanup-arc"></a>
### `K8sNVI-CleanupAzureArc` — Azure Arc Removal

Performs a complete Azure Arc cleanup in reverse order of enrollment. Supports both interactive (device-code) and unattended (service-principal) authentication.

```powershell
# Interactive cleanup
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc"

# Cleanup + remove resource group + uninstall Azure CLI
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc" `
    -RemoveResourceGroup -RemoveAzureCli

# Unattended cleanup with service principal
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc" `
    -ArcServicePrincipalId "app-id" -ArcServicePrincipalSecret "secret" `
    -ArcTenantId "tenant-id" -RemoveResourceGroup
```

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `-AdminUser` | No | kubeadmin | SSH username |
| `-AdminPassword` | No | — | SSH password |
| `-SSHCredential` | No | — | Alternative PSCredential object |
| `-DeploymentSize` | No | Small | Used to resolve master VM IP |
| `-DeploymentStack` | No | Stable | Used for OS detection |
| `-AzureSubscription` | Yes | — | Azure subscription containing Arc cluster |
| `-AzureResourceGroup` | Yes | — | Resource group containing Arc cluster |
| `-ArcClusterName` | No | kubeovn-cluster | Arc-connected cluster name |
| `-ArcServicePrincipalId` | No | — | SP app ID for unattended auth |
| `-ArcServicePrincipalSecret` | No | — | SP secret |
| `-ArcTenantId` | No | — | Tenant ID |
| `-RemoveResourceGroup` | No | $false | Delete Azure RG if empty after cleanup |
| `-RemoveAzureCli` | No | $false | Uninstall Azure CLI from master VM |

**Cleanup steps performed:**

1. Delete all Arc extensions (Monitor, Policy, Defender)
2. Disconnect the cluster from Azure Arc
3. Remove `azure-arc` and `mdc` Kubernetes namespaces
4. Clear cached Azure CLI credentials on the master VM
5. *(optional)* Delete the Azure resource group
6. *(optional)* Uninstall Azure CLI from the master VM

---

<a id="fn-help"></a>
### `K8sNVI-GetDeploymentHelp` — Built-in Help System

```powershell
K8sNVI-GetDeploymentHelp                          # Full help
K8sNVI-GetDeploymentHelp -Topic Overview           # Module overview
K8sNVI-GetDeploymentHelp -Topic Phases             # Deployment phases detail
K8sNVI-GetDeploymentHelp -Topic Functions          # All functions and parameters
K8sNVI-GetDeploymentHelp -Topic Examples           # Usage examples
K8sNVI-GetDeploymentHelp -Topic Prerequisites      # System requirements
K8sNVI-GetDeploymentHelp -Topic TroubleShooting    # Common issues and fixes
```

---

<a id="usage-examples"></a>
## Usage Examples

### Quickstart: Fully Automated Deployment

The simplest way to go from bare Windows Server to a running Kubernetes cluster:

```powershell
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!"
```

This will:

1. Install Hyper-V, RRAS, and DHCP (Phase 1)
2. Reboot the host
3. Install tools via WinGet after logon (Phase 2)
4. Deploy 3 Ubuntu VMs — 1 master, 2 workers (Phase 3)
5. Set up Kubernetes with Kube-OVN and Multus (Phase 4)

### Medium Deployment with KubeVirt

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium -IncludeKubeVirt
```

### Large HA Deployment (3 Masters + 3 Workers)

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -IncludeKubeVirt
```

### Using the Latest Stack (Ubuntu 24.04 + K8s 1.34)

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack Latest
```

### Manual Phase-by-Phase Deployment

```powershell
# 1. Prepare the host (reboots automatically)
K8sNVI-PrepareHostHyperVServer -RebootAfter -Phase2Trigger Logon -Phase2DelaySeconds 10

# 2. After reboot and Phase 2 completes, deploy VMs individually
K8sNVI-DeployInfrastructureVM -VMName "kubeovn-master" `
    -CpuCount 8 -MemoryStartupGB 8 -DiskSizeGB 100 `
    -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -SwitchName "Kube-OVN" -IPv4Address "172.100.0.6" `
    -IsoRequired -CreateOrConvertReservation -ResizeVhd -TestSshConnectivity

K8sNVI-DeployInfrastructureVM -VMName "kubeovn-worker1" `
    -CpuCount 14 -MemoryStartupGB 24 -DiskSizeGB 350 `
    -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -SwitchName "Kube-OVN" -IPv4Address "172.100.0.7" `
    -IsoRequired -CreateOrConvertReservation -ResizeVhd -TestSshConnectivity

K8sNVI-DeployInfrastructureVM -VMName "kubeovn-worker2" `
    -CpuCount 14 -MemoryStartupGB 24 -DiskSizeGB 350 `
    -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -SwitchName "Kube-OVN" -IPv4Address "172.100.0.8" `
    -IsoRequired -CreateOrConvertReservation -ResizeVhd -TestSshConnectivity

# 3. Deploy Kubernetes cluster
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium -IncludeKubeVirt
```

### Tear Down and Rebuild (VM Recovery)

```powershell
# Reset VMs only (host stays configured)
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!"

# Full reset with K8s redeployment
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeployKubernetes -IncludeKubeVirt

# Switch from Small to Large HA
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -DeployKubernetes
```

### Add KubeVirt to an Existing Cluster

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -InstallKubeVirtOnly
```

### Deploy with Azure Arc (Interactive Device-Code)

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Small -IncludeKubeVirt `
    -IncludeAzureArc -AzureSubscription "my-sub" `
    -AzureResourceGroup "K8sNVI-Arc" -AzureLocation "eastus2"
```

### Deploy with Azure Arc (Service Principal, Unattended) + All Extensions

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium -IncludeKubeVirt `
    -IncludeAzureArc -AzureSubscription "my-sub" `
    -AzureResourceGroup "K8sNVI-Arc" -AzureLocation "eastus2" `
    -ArcServicePrincipalId "app-id" -ArcServicePrincipalSecret "secret" `
    -ArcTenantId "tenant-id" `
    -IncludeAzureMonitor -IncludeAzurePolicy -IncludeDefenderForContainers
```

### Arc-Only Enrollment on an Existing Cluster

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Small -InstallAzureArcOnly `
    -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" `
    -AzureLocation "eastus2"
```

### Resume a Failed Phase 4 Deployment

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Small -IncludeKubeVirt -Resume
```

### Remove Azure Arc Registration

```powershell
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc" `
    -RemoveResourceGroup
```

---

<a id="azure-arc-integration"></a>
## Azure Arc Integration

The module supports enrolling deployed Kubernetes clusters into **Azure Arc-enabled Kubernetes**, with optional Arc extensions for monitoring, policy, and security.

### Authentication Modes

| Mode | When Used | Description |
|------|-----------|-------------|
| **Device-code** (default) | Interactive sessions | Prompts for browser-based authentication; the device code is displayed in the SSH console output |
| **Service-principal** | Unattended / automated | Uses `-ArcServicePrincipalId`, `-ArcServicePrincipalSecret`, and `-ArcTenantId` |

### Available Arc Extensions

| Extension | Parameter | Description |
|-----------|-----------|-------------|
| Azure Monitor Container Insights | `-IncludeAzureMonitor` | Collects container logs and metrics |
| Azure Policy for Kubernetes | `-IncludeAzurePolicy` | Enforces organizational policies on cluster resources |
| Microsoft Defender for Containers | `-IncludeDefenderForContainers` | Runtime threat detection and vulnerability scanning |

### Azure Arc Phases

| Phase | Function | Description |
|-------|----------|-------------|
| 4.24 | `Install-AzureCli` | Installs Azure CLI on the master node (OS-specific: apt or tdnf) |
| 4.25 | `Install-AzureArc` | Enrolls the cluster via `az connectedk8s connect` |
| 4.26 | `Install-AzureMonitor` | Deploys Container Insights via `az k8s-extension create` |
| 4.27 | `Install-AzurePolicy` | Deploys Azure Policy via `az k8s-extension create` |
| 4.28 | `Install-AzureDefender` | Deploys Defender via `az k8s-extension create` |

### Requirements for Azure Arc

- The master VM must have **outbound internet access** to reach Azure endpoints
- Azure subscription with **Contributor** permissions (or a service principal with equivalent rights)
- `-AzureSubscription`, `-AzureResourceGroup`, and `-AzureLocation` are required when `-IncludeAzureArc` is set
- The resource group is created automatically if it does not exist

---

<a id="phase4-checkpoint-resume"></a>
## Phase 4 Checkpoint and Resume

Phase 4 deployment saves a **checkpoint file** after each successfully completed sub-phase. If a deployment fails, you can resume from the last successful phase instead of starting over.

### How It Works

- **Checkpoint file:** `C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json`
- After each phase completes, the file is updated with the phase label and timestamp
- On a fresh deployment (without `-Resume`), any existing checkpoint is cleared
- On successful completion of all phases, the checkpoint file is deleted

### Resuming a Failed Deployment

```powershell
# Original deployment failed at Phase 4.15
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Small -IncludeKubeVirt -IncludeAzureArc `
    -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" `
    -AzureLocation "eastus2" -Resume
```

Output when resuming:

```
[RESUME] Checkpoint found: Phase 4.14 completed at 2026-03-28T14:30:00.0000000+00:00
[RESUME] Skipping phases up to and including 4.14. Resuming from next phase.
```

### Phase Skip Logic

- Phases 4.1–4.6 (cluster bootstrap) are treated as a **unit** — they are always skipped together on resume
- Individual phases after 4.6 are skipped independently based on their ordinal position
- The ordered phase sequence is: `4.1, 4.2, 4.3, 4.4, 4.4b, 4.5, 4.5a, 4.5b, 4.6, 4.7, 4.7b, 4.8, 4.7c-pre, 4.7c, 4.9, 4.10, 4.10b, 4.11, 4.13, 4.14, 4.15, 4.16, 4.17, 4.18, 4.19, 4.20, 4.21, 4.22, 4.23, 4.24, 4.25, 4.26, 4.27, 4.28`

---

<a id="network-architecture"></a>
## Network Architecture

### Hyper-V Host Networking

- **Virtual Switches (Hyper-V)**:
  - **Internet** — External vSwitch bound to host NIC "Ethernet"
  - **Kube-OVN** — Internal vSwitch
- **Host interface config**: Sets vEthernet (Kube-OVN) to **172.100.0.1/16**, enables IPv4 forwarding, and configures NAT via **RRAS** (`netsh routing ip nat`) with automatic **NetNat** fallback (`KubeOVN-NAT 172.100.0.0/16`) if RRAS fails.
- **DHCP**: Creates scope **172.100.0.0/24** with exclusions **.1–.5** and **.50–.254**; default router **172.100.0.1** and DNS **168.63.129.16** (Azure DNS); scope is set **Active**.

### Node IPs

| Node | IP | Deployment Sizes |
|------|-----|-----------------|
| kubeovn-master (or master1) | 172.100.0.6 | All |
| kubeovn-worker1 | 172.100.0.7 | All |
| kubeovn-worker2 | 172.100.0.8 | All |
| kubeovn-master2 | 172.100.0.9 | Large only |
| kubeovn-master3 | 172.100.0.10 | Large only |
| kubeovn-worker3 | 172.100.0.11 | Large only |

### Kubernetes Networking (Stable / Latest Stacks)

| Network | CIDR | Purpose |
|---------|------|---------|
| **Pod Network** | 10.16.0.0/16 | Pod IP allocation (Kube-OVN managed, gateway 10.16.0.1) |
| **Service Network** | 10.96.0.0/12 | Kubernetes ClusterIP services |
| **Join Network** | 100.64.0.0/16 | Kube-OVN node ↔ pod transit (inter-node communication) |

- **CNI:** Kube-OVN (geneve tunneling, UDP 6081, full mesh) + Multus (multi-NIC meta-plugin)
- **API endpoint (Small/Medium):** `https://172.100.0.6:6443`
- **API endpoint (Large HA):** `https://172.100.0.100:6443` (kube-vip floating VIP)

> For ALRS networking (Cilium primary + Kube-OVN secondary + OAM/Storage overlays), see the [ALRS article](KB-ALRS-DeploymentStack.md).

Architecture example for a Small/Medium deployment, including a Kube-OVN tenant network (VPC, Subnet, NAT GW, EIP, DNAT, SNAT):

![10-sandbox-network-infrastructure.png](/.attachments/10-sandbox-network-infrastructure-c97a7524-3ebe-49a1-95c2-49028a5b26f0.png)

Architecture of such deployment running on an Azure Stack Hub DELL stamp:

![==image_0==.png](https://supportability.visualstudio.com/b0c51f50-d3cb-4b7b-8fb4-690009d3ee65/_apis/git/repositories/2ff07f84-0a5c-49c1-989c-f0d09292efa9/Items?path=/.attachments/%3D%3Dimage_0%3D%3D-3f3f0e7f-4d49-42d3-b34e-23e27dc6f241.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1&sanitize=true&versionDescriptor.version=wikiMaster)

---

<a id="memory-preflight"></a>
## Memory Pre-Flight and Worker Reduction

Before deploying VMs (Phase 3), the module performs a **memory pre-flight check** to verify the host has enough available RAM for all requested VMs.

### How It Works

1. **Available memory** is calculated as: `Total RAM - Running VM memory - Host reserve (4 GB)`
2. If available memory ≥ required memory → deploy proceeds with original allocations
3. If insufficient → the module applies a **worker memory reduction** (masters are never reduced):

| Deployment Size | Worker RAM Reduction |
|-----------------|---------------------|
| Small | -1 GB per worker |
| Medium | -2 GB per worker |
| Large | -2 GB per worker |

4. If reduced allocations still don't fit → deployment aborts with no VMs created (clean failure)

This logic runs in both `K8sNVI-DeployInfrastructure` (auto-deploy path) and `K8sNVI-RedeployInfrastructureVMs`.

---

<a id="logging-and-diagnostics"></a>
## Logging and Diagnostics

All deployment operations are logged with full transcripts:

| Item | Location |
|------|----------|
| Deployment logs | `C:\K8sNVI_DeploymentLogs\` |
| Phase 4 checkpoint | `C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json` |
| SSH execution logs | `C:\K8sNVI_DeploymentLogs\<NodeName>_<Phase>_<timestamp>.log` |
| VM storage | `F:\K8sNVI_InfraVirtualMachines\` |
| Image repository | `F:\K8sNVI_DataRepository\` |
| Kubernetes kubeconfig | `~/.kube/config` (on master VM) |

Log files are named by function and timestamp:

```
K8sNVI-PrepareHostHyperVServer_20260220_143000.log
K8sNVI-DeployInfrastructureVM_kubeovn-master_20260220_144500.log
K8sNVI-DeployK8sCluster_20260220_150000.log
K8sNVI-RedeployInfrastructureVMs_20260220_160000.log
kubeovn-master_01-SystemInit_20260220_150100.log
kubeovn-worker1_02-Containerd_20260220_150200.log
```

---

<a id="manual-cleanup"></a>
## Manual Cleanup

If redeployment fails, you can manually clean up:

```powershell
# Force remove all kubeovn VMs
Get-VM | Where-Object { $_.Name -match "kubeovn" } | Stop-VM -Force -TurnOff
Get-VM | Where-Object { $_.Name -match "kubeovn" } | Remove-VM -Force

# Delete VM storage
Remove-Item -Path "F:\K8sNVI_InfraVirtualMachines" -Recurse -Force -ErrorAction SilentlyContinue

# Clean up all DHCP reservations
$ips = @("172.100.0.6","172.100.0.7","172.100.0.8","172.100.0.9","172.100.0.10","172.100.0.11")
foreach ($ip in $ips) {
    Remove-DhcpServerv4Reservation -ComputerName "localhost" -IPAddress $ip `
        -Confirm:$false -ErrorAction SilentlyContinue
}

# Remove Phase 4 checkpoint (if resuming is not desired)
Remove-Item -Path "C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json" -Force -ErrorAction SilentlyContinue
```

### Remove Azure Arc Registration

```powershell
# Use the built-in cleanup function
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc" `
    -RemoveResourceGroup -RemoveAzureCli
```

---

<a id="additional-resources"></a>
## Additional Resources

```powershell
# Function-specific help
Get-Help K8sNVI-DeployInfrastructure -Full
Get-Help K8sNVI-PrepareHostHyperVServer -Full
Get-Help K8sNVI-DeployInfrastructureVM -Full
Get-Help K8sNVI-DeployK8sCluster -Full
Get-Help K8sNVI-RedeployInfrastructureVMs -Full
Get-Help K8sNVI-CleanupAzureArc -Full

# Topic-based help
K8sNVI-GetDeploymentHelp -Topic Phases
K8sNVI-GetDeploymentHelp -Topic Examples
K8sNVI-GetDeploymentHelp -Topic TroubleShooting
```

---

*Module Version: 2.10.30 | Last Updated: March 2026*
