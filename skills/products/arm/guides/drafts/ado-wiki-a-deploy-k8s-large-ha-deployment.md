---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Deploy-K8sNestedVirtualizedInfrastructure  Large HA Deployment Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Deploy-K8sNestedVirtualizedInfrastructure%20%E2%80%94%20Large%20HA%20Deployment%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

The **Deploy-K8sNestedVirtualizedInfrastructure** PowerShell module automates end-to-end deployment of Kubernetes clusters on nested Hyper-V infrastructure. The **Large** deployment size provisions a highly available (HA) control plane with 3 master nodes and 3 worker nodes, using **kube-vip** for floating VIP failover.

> **Note:** The module also supports **Small** and **Medium** deployment sizes (single control-plane node, no HA). This article covers the **Large** HA topology exclusively. Run `K8sNVI-GetDeploymentHelp -Topic Prerequisites` for Small/Medium specifications.

---  

## Table of Contents

- [Architecture](#architecture)
  - [HA Details](#ha-details)
- [Prerequisites](#prerequisites)
  - [Hardware Requirements](#hardware-requirements)
  - [VM Resource Allocation](#vm-resource-allocation)
  - [Applicable Deployment Stacks](#applicable-deployment-stacks)
- [Module Functions](#module-functions)
  - [Key Parameters (Common Across Functions)](#key-parameters-common-across-functions)
- [Deployment Steps](#deployment-steps)
  - [Option A: Fully Automated Deployment (Recommended)](#option-a-fully-automated-deployment-recommended)
  - [Option B: Phase-by-Phase Deployment](#option-b-phase-by-phase-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
  - [From the Windows Host](#from-the-windows-host)
  - [From the Primary Master (SSH)](#from-the-primary-master-ssh)
- [Redeployment / Recovery](#redeployment--recovery)
- [Azure Arc Integration](#azure-arc-integration)
- [Checkpoint / Resume](#checkpoint--resume)
- [Memory Pre-Flight Checks](#memory-pre-flight-checks)
- [Data Paths](#data-paths)
- [Built-In Help](#built-in-help)

--- 

## Architecture

![11-large-deployment-architecture.png](/.attachments/11-large-deployment-architecture-1f4621a6-b3a9-48b1-8697-f978547706aa.png)

### HA Details 

- **kube-vip** runs as a static pod on all 3 masters, using ARP-based leader election. The version is fetched dynamically from the GitHub API at deploy time (fallback: `v0.8.9`).
- The current leader holds VIP `172.100.0.100`; failover occurs in &lt;2 seconds via gratuitous ARP.
- **etcd** uses stacked topology — each master runs its own etcd member (3-member quorum tolerates 1 node failure).
- All `kubectl` and kubelet traffic routes through `172.100.0.100:6443`.

---

## Prerequisites

### Hardware Requirements

> See also: [Steps to deploy the K8s+Kube-OVN sandbox lab environment in Azure Stack Hub — Overview](https://supportability.visualstudio.com/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki/2433768/Steps-to-deploy-the-K8s-Kube-OVN-sandbox-lab-environment-in-Azure-Stack-Hub)

| Resource | Minimum |
| --- | --- |
| CPU | 32 logical processors / vCPUs |
| RAM | 127 GB |
| Storage | 1 TB Data Disk |
| Azure VM Size | Standard D32s_v3 |
| Network | Public IP with Internet connectivity |  

### VM Resource Allocation

| VM | Role | CPU | RAM | Disk | IP Address |
| --- | --- | --- | --- | --- | --- |
| kubeovn-master1 | Control Plane (primary) | 8 | 10 GB | 100 GB | 172.100.0.6 |
| kubeovn-worker1 | Worker | 30 | 26 GB | 200 GB | 172.100.0.7 |
| kubeovn-worker2 | Worker | 30 | 26 GB | 200 GB | 172.100.0.8 |
| kubeovn-master2 | Control Plane | 8 | 10 GB | 100 GB | 172.100.0.9 |
| kubeovn-master3 | Control Plane | 8 | 10 GB | 100 GB | 172.100.0.10 |
| kubeovn-worker3 | Worker | 30 | 26 GB | 200 GB | 172.100.0.11 |
| — | kube-vip VIP | — | — | — | 172.100.0.100 |

### Applicable Deployment Stacks

| Stack | Guest OS | Kubernetes | Primary CNI | Secondary CNI | Kube-OVN |
| --- | --- | --- | --- | --- | --- |
| **Stable** (default) | Ubuntu 22.04 LTS (Jammy Jellyfish) | 1.33 | Kube-OVN 1.14.11 | — | 1.14.11 |
| **Latest** | Ubuntu 24.04 LTS (Noble Numbat) | 1.34 | Kube-OVN 1.15.0 | — | 1.15.0 |
| **ALRS** | Azure Linux 3.0 | 1.33.7 (pinned) | Cilium 1.17.3 | Kube-OVN 1.14.11 (via Multus) | 1.14.11 |

The stack is selected via the `-DeploymentStack` parameter (default: `Stable`). All component versions (guest OS image, Kubernetes repo, critools, CNI versions) resolve automatically from the chosen stack.

> **ALRS stack notes:** Uses Azure Linux 3.0 guest OS (ISO-to-VHD build pipeline with tdnf/NetworkManager), Cilium as primary CNI with kube-proxy replacement and Hubble observability, and Kube-OVN as secondary CNI via Multus providing OAM (172.42.0.0/24), Storage (172.43.0.0/24), and Live-Migration (172.44.0.0/24) overlay networks.

---

## Module Functions

The module exports 7 functions:

| Function | Description |
| --- | --- |
| `K8sNVI-DeployInfrastructure` | **Phases 1–4**: Full end-to-end orchestrated deployment (host prep → tools → VMs → K8s cluster) |
| `K8sNVI-PrepareHostHyperVServer` | **Phases 1–2**: Installs Hyper-V, networking, and tools. Optionally triggers VM + K8s deployment after reboot |
| `K8sNVI-DeployInfrastructureVM` | **Phase 3**: Deploys a single VM on Hyper-V with cloud-init, static IP, and DHCP reservation (Ubuntu by default; Azure Linux 3.0 when `-DeploymentStack ALRS`) |
| `K8sNVI-DeployK8sCluster` | **Phase 4**: Deploys the Kubernetes cluster (containerd, kubeadm, kube-vip, CNI, Multus, optional KubeVirt + ALRS parity components + Azure Arc). Can be run independently. Supports `-Resume` for checkpoint-based recovery |
| `K8sNVI-RedeployInfrastructureVMs` | **Recovery**: Tears down existing VMs, redeploys them, and optionally re-joins to a new K8s cluster |
| `K8sNVI-CleanupAzureArc` | **Arc Removal**: Removes Azure Arc registration, extensions, namespaces, and cached credentials |
| `K8sNVI-GetDeploymentHelp` | **Help**: Topic-based help system. Topics: `Overview`, `Phases`, `Functions`, `Examples`, `Prerequisites`, `TroubleShooting` |

### Key Parameters (Common Across Functions)  

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `-DeploymentSize` | String | `Small` | `Small`, `Medium`, or `Large` - use **`Large`** for HA |
| `-DeploymentStack` | String | `Stable` | `Stable`, `Latest`, or `ALRS` |
| `-IncludeKubeVirt` | Switch | `$false` | Installs KubeVirt virtualization stack + CDI + virtctl |
| `-AdminUser` | String | - | SSH username for all VMs |
| `-AdminPassword` | String | - | SSH password for all VMs |
| `-IncludeAzureArc` | Switch | `$false` | Enrolls the cluster into Azure Arc (Phases 4.24–4.28) |
| `-Resume` | Switch | `$false` | Resume from last checkpoint (`K8sNVI-DeployK8sCluster` only) |

> **Important:** All commands in this article use `-DeploymentSize Large`. This parameter is required for the HA topology - omitting it defaults to `Small` (single master, no kube-vip).  

`K8sNVI-DeployK8sCluster` also supports `-InstallKubeVirtOnly` to add KubeVirt to an existing cluster without redeploying K8s, and `-InstallAzureArcOnly` to enroll an existing cluster into Azure Arc.

---

## Deployment Steps

### Option A: Fully Automated Deployment (Recommended)

A single command handles all 4 phases end-to-end.

#### Step 1: Open an Elevated PowerShell Session

Right-click PowerShell and select **Run as Administrator**.  

#### Step 2: Import the Module

```powershell
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
```

#### Step 3: Run the Full Deployment

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Large -IncludeKubeVirt
```

To use the **Latest** deployment stack (Ubuntu 24.04 + K8s 1.34 + Kube-OVN 1.15):

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Large -DeploymentStack Latest -IncludeKubeVirt
```

To use the **ALRS** deployment stack (Azure Linux 3.0 + Cilium + Kube-OVN dual-CNI):

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Large -DeploymentStack ALRS -IncludeKubeVirt
```

#### What Happens Automatically

| Phase | Description | Duration (approx.) |
| --- | --- | --- |
| **Phase 1** | Installs Hyper-V role, creates Kube-OVN virtual switch, configures RRAS routing, DHCP server, and NAT. System reboots. | 5-10 min |
| **Phase 2** | Installs WinGet, OpenSSH-Client, qemu-img, sshpass (runs automatically after reboot via scheduled task) | 5-10 min |
| **Phase 3** | Downloads guest OS image (Ubuntu cloud image or Azure Linux ISO), creates 6 VMs with cloud-init, configures static IPs, verifies SSH. Memory pre-flight checks run before VM creation (see [Memory Pre-Flight Checks](#memory-pre-flight-checks)). | 15-25 min (Stable/Latest) 25-40 min (ALRS, includes ISO-to-VHD build) |
| **Phase 4** | Configures all nodes, deploys HA control plane with kube-vip, initializes cluster, joins masters and workers, deploys CNI + Multus (see [Phase 4 Sub-Phases](#phase-4-sub-phases) for detail). Checkpoints saved after each sub-phase. | 20-30 min (Stable/Latest) 30-50 min (ALRS, includes parity components) |

**Logs:** All phases log to `C:\K8sNVI_DeploymentLogs\`

##### Phase 2 Trigger Modes

The `-Phase2Trigger` parameter on `K8sNVI-PrepareHostHyperVServer` controls how Phase 2 executes after the Phase 1 reboot:

| Mode | Trigger | Context | Use Case |
| --- | --- | --- | --- |
| `Logon` (default) | `AtLogOn` scheduled task | Interactive user session, visible window | Interactive deployments where you log in after reboot |
| `Startup` | `AtStartup` scheduled task | SYSTEM / Session 0, hidden window | Headless / unattended deployments |

##### Phase 4 Sub-Phases

###### Core Cluster Bootstrap (Phases 4.1–4.10)

| Sub-Phase | Description | Stack |
| --- | --- | --- |
| **4.1** | System initialization - firewall, swap off, kernel modules, sysctl (`Initialize-UbuntuSystem`) | All |
| **4.2** | Containerd runtime installation (`Install-Containerd`) | All |
| **4.3** | Kubernetes installation - kubeadm, kubelet, kubectl (`Install-Kubernetes`) | All |
| **4.4** | Cluster initialization - `kubeadm init` with `--control-plane-endpoint=172.100.0.100:6443` and `--upload-certs` (HA). ALRS: also `--skip-phases=addon/kube-proxy` | All |
| **4.4b** | Install kube-vip on **primary master** only - API server is running, leader election succeeds and kube-vip takes over VIP via ARP *(HA only)* | All |
| **4.5** | Extract `kubeadm join` command (log parse → SSH fallback) | All |
| **4.5a** | Install kube-vip on **additional masters** (master2, master3) — manifests ready for kubelet when they join *(HA only)* | All |
| **4.5b** | Join additional control-plane nodes with `--control-plane` and `--certificate-key` *(HA only)* | All |
| **4.6** | Join worker nodes | All |
| **4.7** | Kube-OVN SDN installation (primary CNI) | Stable, Latest |
| **4.7b** | Cilium installation (primary CNI, kube-proxy replacement, Hubble, VXLAN) | ALRS |
| **4.8** | Multus CNI installation | All |
| **4.7c-pre** | Remove Azure Linux OS-package CNI symlinks on all nodes | ALRS |
| **4.7c** | Kube-OVN as secondary CNI via Multus (overlay/provider networks, pod CIDR 10.17.0.0/16) | ALRS |
| **4.9** | Libvirt clients installation on all nodes *(only if `-IncludeKubeVirt`)* | All |
| **4.10** | KubeVirt operator + CR, CDI operator + CR, Krew + virtctl *(only if `-IncludeKubeVirt`)* | All |
| **4.10b** | KubeVirt live-migration dedicated network (Kube-OVN overlay NAD) *(only if `-IncludeKubeVirt` + ALRS)* | ALRS |

###### ALRS Parity Components (Phases 4.11–4.23, ALRS stack only)

These open-source Kubernetes ecosystem components are deployed only when `-DeploymentStack ALRS` to increase parity with the Nexus Cloud reference architecture. Some components are skipped on Small deployments to avoid resource contention.

| Sub-Phase | Component | Skipped on Small? |
| --- | --- | --- |
| **4.11** | cert-manager (TLS certificate lifecycle) | No |
| **4.13** | snapshot-controller (CSI volume snapshots) | No |
| **4.14** | local-path-provisioner (dynamic hostPath PVs) | No |
| **4.15** | CSI NFS driver (NFS-backed PVs) | No |
| **4.16** | kube-state-metrics + prometheus-node-exporter | No |
| **4.17** | node-problem-detector (node health monitoring) | No |
| **4.18** | Reloader (auto-restart on ConfigMap/Secret changes) | Yes |
| **4.19** | scheduler-plugins (extended scheduling) | Yes (requires HA) |
| **4.20** | kubefledged (container image pre-caching) | Yes |
| **4.21** | process-exporter (per-process Prometheus metrics) | Yes |
| **4.22** | etcd-snapshotter (automated etcd backups) | No |
| **4.23** | resource-topology-exporter / NFD (NUMA/CPU topology) | Yes (requires HA) |

###### Azure Arc Integration (Phases 4.24–4.28, any stack)

See [Azure Arc Integration](#azure-arc-integration) section below.

> **Phase ordering note (v2.10.x):** kube-vip is installed *after* `kubeadm init` on the primary master (Phase 4.4b), then on additional masters *before* they join (Phase 4.5a). This avoids a deadlock where kube-vip needs the API server for leader election, but kubeadm needs the VIP to complete init.

---

### Option B: Phase-by-Phase Deployment

#### Step 1: Prepare the Host (Phases 1–2)

```powershell
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
K8sNVI-PrepareHostHyperVServer -RebootAfter -Phase2Trigger Logon -Phase2DelaySeconds 10
```

The system reboots. Phase 2 runs automatically 10 seconds after logon.

#### Step 2: Deploy the Kubernetes Cluster (Phases 3–4)

After Phase 2 completes:

```powershell
Import-Module Deploy-K8sNestedVirtualizedInfrastructure -Force
```

**Phase 3 — Deploy 6 VMs:**

```powershell
$vmConfigs = @(
    @{Name="kubeovn-master1"; CPU=8;  RAM=10; Disk=100; IP="172.100.0.6"},
    @{Name="kubeovn-master2"; CPU=8;  RAM=10; Disk=100; IP="172.100.0.9"},
    @{Name="kubeovn-master3"; CPU=8;  RAM=10; Disk=100; IP="172.100.0.10"},
    @{Name="kubeovn-worker1"; CPU=30; RAM=26; Disk=200; IP="172.100.0.7"},
    @{Name="kubeovn-worker2"; CPU=30; RAM=26; Disk=200; IP="172.100.0.8"},
    @{Name="kubeovn-worker3"; CPU=30; RAM=26; Disk=200; IP="172.100.0.11"}
)

foreach ($vm in $vmConfigs) {
    K8sNVI-DeployInfrastructureVM -VMName $vm.Name -CpuCount $vm.CPU `
        -MemoryStartupGB $vm.RAM -DiskSizeGB $vm.Disk `
        -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
        -SwitchName "Kube-OVN" -IPv4Address $vm.IP `
        -CreateOrConvertReservation -ResizeVhd -TestSshConnectivity
```

**Phase 4 — Deploy HA Kubernetes cluster:**

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Large -IncludeKubeVirt
```

---

## Post-Deployment Verification

### From the Windows Host  

```powershell
# Verify all 6 VMs are running
Get-VM | Where-Object { $_.Name -match 'kubeovn' } | Format-Table Name, State

# Test SSH to primary master
Test-NetConnection -ComputerName 172.100.0.6 -Port 22

# Test VIP reachability
Test-NetConnection -ComputerName 172.100.0.100 -Port 6443
```

### From the Primary Master (SSH)

**Verify all nodes are Ready:**

```bash
kubectl get nodes -o wide
```

Expected output (Kubernetes version depends on `-DeploymentStack`: Stable = 1.33, Latest = 1.34, ALRS = 1.33.7):

| NAME | STATUS | ROLES | AGE | VERSION | INTERNAL-IP |
| --- | --- | --- | --- | --- | --- |
| kubeovn-master1 | Ready | control-plane | 10m | v1.33.x / v1.34.x | 172.100.0.6 |
| kubeovn-master2 | Ready | control-plane | 8m | v1.33.x / v1.34.x | 172.100.0.9 |
| kubeovn-master3 | Ready | control-plane | 7m | v1.33.x / v1.34.x | 172.100.0.10 |
| kubeovn-worker1 | Ready | \<none\> | 5m | v1.33.x / v1.34.x | 172.100.0.7 |
| kubeovn-worker2 | Ready | \<none\> | 5m | v1.33.x / v1.34.x | 172.100.0.8 |
| kubeovn-worker3 | Ready | \<none\> | 4m | v1.33.x / v1.34.x | 172.100.0.11 |

**Verify kube-vip is running on all masters:**

```bash
kubectl get pods -n kube-system | grep kube-vip
```

**Verify API server responds through VIP:**

```bash
curl -k https://172.100.0.100:6443/healthz
```

Expected: `ok`

**Verify CNI (varies by stack):**

```bash
# Stable/Latest: Kube-OVN as primary CNI
kubectl get pods -n kube-system | grep kube-ovn

# ALRS: Cilium as primary CNI
kubectl get pods -n kube-system | grep cilium
# ALRS: Kube-OVN as secondary CNI
kubectl get pods -n kube-system | grep kube-ovn
```

**Verify etcd cluster health (3-member quorum):**

```bash
kubectl -n kube-system exec -it etcd-kubeovn-master1 -- \
    etcdctl --endpoints=https://127.0.0.1:2379 \
    --cacert=/etc/kubernetes/pki/etcd/ca.crt \
    --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt \
    --key=/etc/kubernetes/pki/etcd/healthcheck-client.key \
    member list -w table
```

---

## Redeployment / Recovery

To tear down the entire cluster and rebuild from scratch:

```powershell
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" -DeploymentSize Large -DeployKubernetes -IncludeKubeVirt
```

The `-DeployKubernetes` switch triggers `K8sNVI-DeployK8sCluster` automatically after VMs are redeployed. `-IncludeKubeVirt` is passed through to install the KubeVirt stack.

With ALRS stack and Azure Arc:

```powershell
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -DeploymentStack ALRS -DeployKubernetes -IncludeKubeVirt `
    -IncludeAzureArc -AzureSubscription "sub-id" -AzureResourceGroup "K8sNVI-Arc" `
    -AzureLocation "eastus2" -IncludeAzureMonitor -IncludeAzurePolicy
```

> **Size transitions supported:** You can redeploy with a different `-DeploymentSize` (e.g., `Small` → `Large`). The function dynamically discovers existing `kubeovn-*` VMs via `Get-VM` and removes them before creating the new topology.

---

## Azure Arc Integration

Azure Arc enrollment is available on **all deployment stacks** (Stable, Latest, ALRS) via Phases 4.24–4.28. It connects the cluster to Azure Arc and optionally deploys Arc extensions.

### Arc Parameters

| Parameter | Description |
| --- | --- |
| `-IncludeAzureArc` | Enable Arc enrollment (requires `-AzureSubscription`, `-AzureResourceGroup`, `-AzureLocation`) |
| `-AzureSubscription` | Azure subscription ID or name |
| `-AzureResourceGroup` | Resource group name (auto-created if missing) |
| `-AzureLocation` | Azure region (e.g., `eastus2`, `westeurope`) |
| `-ArcClusterName` | Arc cluster resource name (default: `kubeovn-cluster`) |
| `-ArcServicePrincipalId` | Service principal app ID for unattended auth (requires `-ArcServicePrincipalSecret` + `-ArcTenantId`) |
| `-IncludeAzureMonitor` | Deploy Container Insights extension |
| `-IncludeAzurePolicy` | Deploy Azure Policy for Kubernetes extension |
| `-IncludeDefenderForContainers` | Deploy Microsoft Defender for Containers extension |
| `-InstallAzureArcOnly` | Skip phases 4.1–4.23, enroll existing cluster only (`K8sNVI-DeployK8sCluster`) |

### Arc Sub-Phases

| Sub-Phase | Description |
| --- | --- |
| **4.24** | Install Azure CLI on master node |
| **4.25** | Azure Arc enrollment (device-code or service-principal auth) |
| **4.26** | Azure Monitor Container Insights *(optional)* |
| **4.27** | Azure Policy for Kubernetes *(optional)* |
| **4.28** | Microsoft Defender for Containers *(optional)* |

### Examples

```powershell
# Interactive device-code auth
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -IncludeKubeVirt `
    -IncludeAzureArc -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" `
    -AzureLocation "eastus2"

# Unattended service principal + all extensions
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -IncludeKubeVirt -IncludeAzureArc `
    -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" -AzureLocation "eastus2" `
    -ArcServicePrincipalId "app-id" -ArcServicePrincipalSecret "secret" -ArcTenantId "tenant-id" `
    -IncludeAzureMonitor -IncludeAzurePolicy -IncludeDefenderForContainers

# Arc-only enrollment on existing cluster
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -InstallAzureArcOnly `
    -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" -AzureLocation "eastus2"
```

### Arc Cleanup

Use `K8sNVI-CleanupAzureArc` to remove Arc registration:

```powershell
K8sNVI-CleanupAzureArc -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -AzureSubscription "sub-uuid" -AzureResourceGroup "K8sNVI-Arc" `
    -RemoveResourceGroup -RemoveAzureCli
```

---

## Checkpoint / Resume

`K8sNVI-DeployK8sCluster` saves a checkpoint after each successful Phase 4 sub-phase to `C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json`. If a deployment fails mid-way, you can resume from the last successful phase instead of starting from scratch:

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -DeploymentStack ALRS -IncludeKubeVirt -Resume
```

- Phases 4.1–4.6 (cluster bootstrap) are treated as a **unit** and always skipped together on resume.
- Phases 4.7+ are individually checkpointed and skippable.
- The checkpoint file is **deleted** after a fully successful deployment.
- On failure, the console displays the last successful checkpoint and the `-Resume` hint.

---

## Memory Pre-Flight Checks

Before creating any VM, the module runs a memory pre-flight check (`Resolve-VMConfigsWithMemoryCheck`) to verify that the host has enough available RAM for all VMs:

1. **Original allocations** are checked against available host memory (total RAM minus already-assigned VMs minus a 4 GB host reserve).
2. If insufficient, **worker memory reduction** is applied automatically (Large: −2 GB per worker). Master memory is **never** reduced (etcd and control plane are memory-sensitive).
3. If the reduced allocations still don't fit, deployment **aborts cleanly** with zero VMs created (no orphaned artifacts).

This check runs before VM creation in both `K8sNVI-PrepareHostHyperVServer` (auto-deploy path) and `K8sNVI-RedeployInfrastructureVMs`.

---

## Data Paths

| Path | Purpose |
| --- | --- |
| `C:\K8sNVI_DeploymentLogs\` | Deployment logs (one transcript per function invocation) |
| `C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json` | Checkpoint file for `-Resume` (auto-deleted on success) |
| `F:\K8sNVI_DataRepository\` | Cached guest OS images (Ubuntu cloud images, Azure Linux VHDs/ISOs) |
| `F:\K8sNVI_InfraVirtualMachines\<VMName>\` | Per-VM working directory (VHD, cloud-init ISO) |

---

## Built-In Help

The module includes a topic-based help system:

```powershell
# Show all help
K8sNVI-GetDeploymentHelp 

# Show a specific topic
K8sNVI-GetDeploymentHelp -Topic Overview
K8sNVI-GetDeploymentHelp -Topic Phases
K8sNVI-GetDeploymentHelp -Topic Functions
K8sNVI-GetDeploymentHelp -Topic Examples
K8sNVI-GetDeploymentHelp -Topic Prerequisites
K8sNVI-GetDeploymentHelp -Topic TroubleShooting
```
