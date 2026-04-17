---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Rack Scale/Readiness/ALRS Kube-OVN/Deploy-K8sNestedVirtualizedInfrastructure - ALRS Deployment Stack Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Rack%20Scale/Readiness/ALRS%20Kube-OVN/Deploy-K8sNestedVirtualizedInfrastructure%20-%20ALRS%20Deployment%20Stack%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Summary

The **ALRS** (Azure Local Rack Scale) deployment stack extends the Deploy-K8sNestedVirtualizedInfrastructure module to deploy Kubernetes clusters using **Azure Linux 3.0** as the guest OS with a **dual-CNI architecture**: Cilium as the primary CNI (with kube-proxy replacement and Hubble observability) and Kube-OVN as the secondary CNI via Multus (providing overlay, OAM, and Storage networks). Additionally, ALRS deploys **13 open-source ecosystem components** to increase parity with the Nexus Cloud reference architecture.

---

<a id="toc"></a>
## Table of Contents

1. <a href="#what-is-alrs">What is ALRS</a>
2. <a href="#component-version-matrix">Component Version Matrix</a>
3. <a href="#azure-linux-iso-to-vhd-pipeline">Azure Linux 3.0 ISO-to-VHD Pipeline</a>
   - <a href="#pipeline-overview">Pipeline Overview</a>
   - <a href="#iso-binary-patching">ISO Binary Patching (No oscdimg Rebuild)</a>
   - <a href="#unattended-config">Unattended Configuration</a>
   - <a href="#gen2-uefi-builder-vm">Gen-2 UEFI Builder VM</a>
   - <a href="#cloud-init-helper-vm">Cloud-Init Installation via Gen-1 Helper VM</a>
   - <a href="#vhdx-to-vhd-conversion">VHDX-to-VHD Conversion</a>
4. <a href="#cni-architecture">CNI Architecture</a>
   - <a href="#cilium-primary-cni">Cilium as Primary CNI</a>
   - <a href="#kube-ovn-secondary-cni">Kube-OVN as Secondary CNI</a>
   - <a href="#multus-integration">Multus Integration</a>
   - <a href="#network-topology">Network Topology</a>
5. <a href="#oam-storage-overlay-networks">OAM and Storage Overlay Networks</a>
6. <a href="#alrs-parity-components">ALRS Parity Components (Phases 4.11–4.23)</a>
   - <a href="#component-list">Component List</a>
   - <a href="#small-deployment-skips">Small Deployment Skips</a>
   - <a href="#ha-only-components">HA-Only Components</a>
   - <a href="#stability-gate">Pre-Flight Stability Gate</a>
7. <a href="#infrastructure-differences">Infrastructure Differences vs Standard Deployment</a>
   - <a href="#guest-os-differences">Guest OS Differences</a>
   - <a href="#networking-differences">Networking Differences</a>
   - <a href="#phase-4-execution-differences">Phase 4 Execution Differences</a>
8. <a href="#kubevirt-live-migration">KubeVirt Live-Migration Network</a>
9. <a href="#usage-examples">Usage Examples</a>
10. <a href="#troubleshooting">Troubleshooting</a>

---

<a id="what-is-alrs"></a>
## 1. What is ALRS

<a href="#toc">↑ Back to Table of Contents</a>

ALRS stands for **Azure Local Rack Scale**. It is a deployment stack option (`-DeploymentStack ALRS`) that reconfigures the entire K8sNVI deployment pipeline to try mirroring to some extent the Nexus Cloud reference architecture:

| Aspect | Stable/Latest (default) | ALRS |
|--------|-------------------------|------|
| **Guest OS** | Ubuntu 22.04/24.04 LTS | Azure Linux 3.0 |
| **Image source** | QCOW2 cloud image → VHD via qemu-img | ISO → unattended Hyper-V installer → VHD |
| **Package manager** | APT | tdnf |
| **Network manager** | netplan / systemd-networkd | NetworkManager or systemd-networkd (auto-detected) |
| **Primary CNI** | Kube-OVN | Cilium (with kube-proxy replacement) |
| **Secondary CNI** | — | Kube-OVN (via Multus) |
| **Observability** | — | Hubble (Cilium UI + Relay) |
| **kube-proxy** | Installed | Skipped (`--skip-phases=addon/kube-proxy`) |
| **K8s version** | Unpinned (latest in repo) | Pinned to 1.33.7 |
| **containerd** | Unpinned | Pinned to 2.0.0 |
| **Ecosystem add-ons** | None | 13 components (Phases 4.11–4.23) |

ALRS uses the same deployment sizes (Small, Medium, Large), network topology (172.100.0.0/24 DHCP scope), and host preparation (Phases 1–2) as the standard stacks. The differences begin at Phase 3 (VM deployment) and Phase 4 (Kubernetes setup).

---

<a id="component-version-matrix"></a>
## 2. Component Version Matrix

<a href="#toc">↑ Back to Table of Contents</a>

| Component | Version | Notes |
|-----------|---------|-------|
| Azure Linux | 3.0 | ISO-based install |
| Kubernetes | 1.33.7 | Pinned patch version |
| containerd | 2.0.0 | Pinned version |
| Cilium | 1.17.3 | Primary CNI, kube-proxy replacement |
| Kube-OVN | 1.14.11 (release-1.14 branch) | Secondary CNI via Multus |
| cert-manager | v1.17.0 | TLS certificate lifecycle |
| snapshot-controller | v8.2.0 | CSI volume snapshots |
| local-path-provisioner | v0.0.30 | Dynamic hostPath PVs |
| CSI NFS driver | v4.10.0 | NFS-backed PVs |
| scheduler-plugins | v0.30.6 | Extended scheduling (HA only) |

---

<a id="azure-linux-iso-to-vhd-pipeline"></a>
## 3. Azure Linux 3.0 ISO-to-VHD Pipeline

<a href="#toc">↑ Back to Table of Contents</a>

Unlike Ubuntu stacks (which download a pre-built QCOW2 cloud image and convert it with qemu-img), the ALRS stack **builds a VHD from the Azure Linux 3.0 ISO** using a multi-step automated pipeline. The resulting VHD is cached in the shared repository (`F:\K8sNVI_DataRepository\`) so subsequent deployments skip the build entirely.

<a id="pipeline-overview"></a>
### Pipeline Overview

```
 +--------------------------------------------------------------------+
 |  STEP 1 -- DOWNLOAD                                                |
 |  Download Azure Linux 3.0 ISO                                      |
 |     Source: aka.ms/azurelinux-3.0-x86_64.iso                       |
 |     Cached in F:\K8sNVI_DataRepository\                            |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 2 -- PREPARE                                                 |
 |  Mount ISO & Copy Contents                                         |
 |     * Copy all files to temp build directory                       |
 |     * Remove read-only attributes from copied files                |
 |     * Preserve original ISO volume label for initrd mount          |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 3 -- CONFIGURE                                               |
 |  Generate unattended_config.json                                   |
 |     * GPT disk layout: bios_grub + /boot (ext4) + rootfs (ext4)    |
 |     * BootType: legacy (for production Gen-1 VMs)                  |
 |     * Packages: cloud-init, openssh, NetworkManager, sudo, curl    |
 |     * Kernel: console=ttyS0,115200n8                               |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 4 -- PATCH ISO (binary, no oscdimg rebuild)                  |
 |  Binary-Patch Original ISO In-Place                                |
 |     * Patch-IsoFileContent: overwrite config at sector offsets     |
 |     * Add-IsoFileAlias: create UNATTENDED_CONFIG.JSON alias        |
 |     * Patch GRUB.CFG: timeout=0, add console=hvc0/ttyS0            |
 |     * Patch ISOLINUX.CFG: TIMEOUT 10, PROMPT 0                     |
 |     Preserves: El Torito boot catalog, EFIBOOT.IMG, all paths      |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 5 -- CREATE DISK                                             |
 |  Create Blank 10 GB Dynamic VHDX                                   |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 6 -- BUILD VM                                                |
 |  Create Temp Gen-2 (UEFI) Hyper-V VM                               |
 |     * 4 GB RAM, 4 CPU cores, Secure Boot OFF                       |
 |     * Attach VHDX as boot disk + patched ISO as DVD                |
 |     * Connect to Kube-OVN switch (NAT for package downloads)       |
 |     * Serial console capture via COM1 named pipe                   |
 |     * Boot order: DVD first, then HDD                              |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 7 -- UNATTENDED INSTALL                                      |
 |  Start VM --> GRUB2 EFI Boots --> Liveinstaller Runs               |
 |     * Reads unattended_config.json from patched ISO                |
 |     * Partitions /dev/sda (GPT), formats ext4                      |
 |     * Installs base OS + kernel to VHDX                            |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 8 -- MONITOR                                                 |
 |  Monitor Build Progress                                            |
 |     * Poll VHDX file size every 15 seconds                         |
 |     * VHD > 500 MB  -->  install started                           |
 |     * 4 stable checks (same size)  -->  install complete           |
 |     * VM powers off  -->  success                                  |
 |     * No progress for 5 min  -->  abort with diagnostics           |
 |     * Timeout: 30 minutes                                          |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 9 -- POST-INSTALL (Gen-1 Helper VM)                          |
 |  Install cloud-init & Configure Golden Image                       |
 |     * Convert VHDX --> temp VHD, create Gen-1 VM (legacy boot)     |
 |     * Serial console login as root (DSR response to unblock)       |
 |     * Flush iptables (Azure Linux default DROP rules)              |
 |     * Configure network: ip link/addr/route + resolvectl DNS       |
 |     * tdnf install: cloud-init, NetworkManager, openssh-server     |
 |     * Configure NoCloud datasource (fs_label: CIDATA)              |
 |     * Bake ClientIdentifier=mac (3-layer DHCP config)              |
 |     * Clean cloud-init state, lock root password, poweroff         |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 10 -- CONVERT                                                |
 |  Convert VHDX --> VHD (Dynamic)                                    |
 |     * Convert-VHD -VHDType Dynamic                                 |
 |     * Gen-1 production VMs require VHD format (not VHDX)           |
 +----------------------------------+---------------------------------+
                                    |
                                    v
 +--------------------------------------------------------------------+
 |  STEP 11 -- CACHE & CLEANUP                                        |
 |  Cache VHD in Repository                                           |
 |     * Saved: F:\K8sNVI_DataRepository\azurelinux-3.0-x86_64.vhd    |
 |     * Clean up: temp VMs, modified ISO, build directory            |
 |     * Subsequent deployments skip the entire build pipeline        |
 +--------------------------------------------------------------------+
```

<a id="iso-binary-patching"></a>
### ISO Binary Patching (No oscdimg Rebuild)

A key technical challenge is that rebuilding the ISO with `oscdimg.exe` breaks GRUB's compiled-in `$prefix` device mapping and isolinux's config-relative path resolution. The module solves this by **binary-patching the original ISO in-place**:

1. **Copy** the original ISO to a working copy
2. **`Patch-IsoFileContent`** — Locates files in the ISO 9660 directory structure by LBA (Logical Block Address) and overwrites their sector data. Works within the file's allocated sectors (padded with spaces if shorter)
3. **`Add-IsoFileAlias`** — Creates a new directory entry in the ISO that points to the same data sectors as an existing file (a "hard link" alias). Used to create `UNATTENDED_CONFIG.JSON` as an alias pointing to the patched `ATTENDED_CONFIG.JSON`

Files patched:
- `CONFIG/ATTENDED_CONFIG.JSON` — Replaced with unattended install config
- `CONFIG/UNATTENDED_CONFIG.JSON` — Created as directory alias to attended config
- `BOOT/GRUB2/GRUB.CFG` — Timeout set to 0, console output added
- `ISOLINUX/ISOLINUX.CFG` — Timeout set to 1s, prompt disabled

This approach preserves the El Torito boot catalog, EFIBOOT.IMG, and all device/path mappings 100% intact.

<a id="unattended-config"></a>
### Unattended Configuration

The generated `unattended_config.json` configures:

- **Disk layout**: GPT partition table on `/dev/sda`
  - `bios_grub` partition (1–9 MB) — raw area for GRUB core.img
  - `/boot` partition (9–509 MB) — ext4, separate from root for GRUB access
  - `rootfs` partition (509 MB – end) — ext4, root filesystem
- **Boot type**: `legacy` (BIOS/MBR boot via bios_grub) — required for production Gen-1 VMs
- **Additional packages**: cloud-init, NetworkManager, openssh-server, sudo, curl, net-tools, bash-completion
- **Kernel options**: `console=ttyS0,115200n8` for serial console access
- **Root user**: Temporary password `oobsetup-temp` (locked after cloud-init configuration)

<a id="gen2-uefi-builder-vm"></a>
### Gen-2 UEFI Builder VM

The ISO is booted in a temporary **Gen-2 (UEFI)** Hyper-V VM because:
- Azure Linux 3.0 ISOs contain an EFI boot image that works reliably with UEFI firmware
- isolinux (BIOS boot) fails with oscdimg-rebuilt ISOs due to path resolution issues
- The installed OS uses `BootType=legacy` in the partition layout, making the resulting VHD bootable on production Gen-1 VMs after conversion

Builder VM specs (from `$script:Defaults`):
- Memory: 4096 MB
- CPU: 4 cores
- VHD: 10 GB dynamic VHDX
- Network: Connected to Kube-OVN switch (for package downloads)
- Secure Boot: Disabled (Azure Linux ISO is not signed for Microsoft Secure Boot)
- Timeout: 30 minutes

The module monitors the build by:
1. Tracking VHDX file size growth (>500 MB = install started)
2. Detecting stability (4 consecutive checks at same size = install complete)
3. Detecting VM power-off state (installer reboots after success)
4. Serial console capture via named pipe for diagnostics

<a id="cloud-init-helper-vm"></a>
### Cloud-Init Installation via Gen-1 Helper VM

After the base OS installation, a second temporary VM is created to install cloud-init and essential packages. This is necessary because the ISO binary-patching approach truncates the JSON config, so `AdditionalPackages` (cloud-init, NetworkManager, etc.) are not installed by the liveinstaller.

The helper VM process:

1. Convert build VHDX → temp VHD
2. Create a Gen-1 helper VM (legacy GRUB can boot from the VHD)
3. Connect to Kube-OVN switch for internet access
4. Log in via serial console (COM1 named pipe) as root
5. Send DSR response (`ESC[24;80R`) to unblock bash terminal initialization
6. **Flush iptables** — Azure Linux enables iptables.service by default with DROP rules
7. Configure network via `ip link/addr/route` commands (no shell redirects — bash bracketed paste corrupts `>` and `|` characters)
8. Configure DNS via `resolvectl` (168.63.129.16 — Azure wireserver DNS)
9. Install packages via `tdnf install -y cloud-init openssh-server sudo curl ...`
10. Install NetworkManager (if available, otherwise keep systemd-networkd)
11. Configure NoCloud datasource (`/etc/cloud/cloud.cfg.d/90_datasource.cfg`)
12. **Bake ClientIdentifier=mac** into networkd configuration — ensures DHCP requests use MAC-based client IDs to match Windows DHCP Server reservations
13. Clean cloud-init state for fresh first-boot on production VMs
14. Lock root password
15. Power off and convert back to VHDX, then to final VHD

<a id="vhdx-to-vhd-conversion"></a>
### VHDX-to-VHD Conversion

The build pipeline produces a VHDX (required by Gen-2 VMs), but production VMs are Gen-1 (which use VHD format). The final step converts:

```
Build VHDX (Gen-2 UEFI build) → VHD (dynamic, for Gen-1 production VMs)
```

Using `Convert-VHD -Path $buildVhdxPath -DestinationPath $OutVhdPath -VHDType Dynamic`.

---

<a id="cni-architecture"></a>
## 4. CNI Architecture

<a href="#toc">↑ Back to Table of Contents</a>

ALRS uses a **dual-CNI architecture** where Cilium and Kube-OVN have distinct, non-overlapping responsibilities:

![alrs-network-diagram.png](/.attachments/alrs-network-diagram-4460e3c2-eb6b-4743-aab6-c0dbb034709a.png)

<a id="cilium-primary-cni"></a>
### Cilium as Primary CNI

Cilium is deployed as the **primary CNI** and replaces kube-proxy entirely:

- **Installation**: Via Helm chart (`cilium/cilium`) on the master node
- **IPAM**: Cluster-scope, pod CIDR `10.16.0.0/16`
- **Tunneling**: VXLAN encapsulation
- **kube-proxy replacement**: `kubeProxyReplacement=true` — Cilium handles all service load-balancing via eBPF
- **kubeadm init**: Uses `--skip-phases=addon/kube-proxy` so the kube-proxy DaemonSet is never created
- **Hubble observability**: Enabled by default (UI, Relay, and metrics)
  - Hubble Relay: gRPC endpoint for flow data
  - Hubble UI: Web dashboard for network flow visualization
  - On Small deployments, Hubble is disabled to conserve resources

<a id="kube-ovn-secondary-cni"></a>
### Kube-OVN as Secondary CNI

Kube-OVN is deployed as a **secondary CNI** (Multus delegate), NOT as the default pod network:

- **Pod CIDR**: `10.17.0.0/16` (separate from Cilium's 10.16.0.0/16 to avoid IPAM conflicts)
- **No default subnet**: Kube-OVN does not create a default subnet. Pods only get Kube-OVN interfaces when explicitly requested via Multus NetworkAttachmentDefinitions
- **Tunneling**: Geneve encapsulation
- **Purpose**: Provides overlay, OAM, Storage, and live-migration networks as secondary interfaces (net1, net2, etc.)
- **CNI symlink cleanup**: Before installing Kube-OVN, the module removes OS-package CNI symlinks from `/opt/cni/bin/` on all nodes. Azure Linux 3.0 installs container-networking-plugins as symlinks pointing to `/usr/bin/containernetworking-plugins/*`, which become dangling inside the kube-ovn-cni container

<a id="multus-integration"></a>
### Multus Integration

Multus CNI is the **meta-plugin** that enables pods to have multiple network interfaces:

- Deployed **after Cilium** and **before Kube-OVN secondary** (Multus provides the NetworkAttachmentDefinition CRD that Kube-OVN's secondary mode requires)
- Default network: Cilium (pod eth0)
- Additional networks: Kube-OVN overlays via NAD annotations (net1, net2, etc.)

<a id="network-topology"></a>
### Network Topology

| Network | CIDR | CNI | Interface | Purpose |
|---------|------|-----|-----------|---------|
| **Pod Network** | 10.16.0.0/16 | Cilium | eth0 | Primary pod networking, service routing |
| **Kube-OVN Overlay** | 10.17.0.0/16 | Kube-OVN | net1/net2 | Secondary overlay networks |
| **OAM Network** | 172.42.0.0/24 | Kube-OVN | — | Operations & management overlay |
| **Storage Network** | 172.43.0.0/24 | Kube-OVN | — | Storage traffic overlay |
| **Live-Migration** | 172.44.0.0/24 | Kube-OVN | migration0 | KubeVirt VM migration traffic |
| **Service Network** | 10.96.0.0/12 | Cilium | — | Kubernetes ClusterIP services |
| **Join Network** | 100.64.0.0/16 | Kube-OVN | — | Node ↔ pod transit |

---

<a id="oam-storage-overlay-networks"></a>
## 5. OAM and Storage Overlay Networks

<a href="#toc">↑ Back to Table of Contents</a>

In the Nexus Cloud reference architecture, OAM (Operations and Management) and Storage networks are dedicated traffic domains. In the K8sNVI ALRS deployment, these are implemented as **Kube-OVN Geneve-tunneled overlay subnets** accessible via Multus NetworkAttachmentDefinitions:

| Network | Subnet | Gateway | Purpose |
|---------|--------|---------|---------|
| **OAM** | 172.42.0.0/24 | 172.42.0.1 | Management traffic between infrastructure components |
| **Storage** | 172.43.0.0/24 | 172.43.0.1 | Storage I/O traffic isolation |

These networks are:
- **Pure overlays** — no host-side VLAN configuration required
- **No trunk mode** — standard untagged networking on the Kube-OVN Hyper-V switch is preserved
- **On-demand** — pods only attach to these networks when their spec includes the appropriate Multus NAD annotation

This approach was chosen over 802.1Q VLAN trunk mode (which was attempted and reverted) because trunk mode dropped untagged frames, breaking basic VM-to-host communication.

---

<a id="alrs-parity-components"></a>
## 6. ALRS Parity Components (Phases 4.11–4.23)

<a href="#toc">↑ Back to Table of Contents</a>

When `-DeploymentStack ALRS` is specified, Phase 4 deploys additional open-source Kubernetes ecosystem components to increase parity with the Nexus Cloud reference architecture.

<a id="component-list"></a>
### Component List

| Phase | Component | Version | Description |
|-------|-----------|---------|-------------|
| 4.11 | **cert-manager** | v1.17.0 | TLS certificate lifecycle management (issuers, certificate renewal) |
| 4.13 | **snapshot-controller** | v8.2.0 | CSI volume snapshot support (VolumeSnapshot, VolumeSnapshotContent CRDs) |
| 4.14 | **local-path-provisioner** | v0.0.30 | Rancher dynamic hostPath PV provisioner for local storage |
| 4.15 | **CSI NFS driver** | v4.10.0 | NFS-backed persistent volumes via CSI |
| 4.16 | **kube-state-metrics + prometheus-node-exporter** | latest | Kubernetes object state metrics + per-node hardware/OS metrics |
| 4.17 | **node-problem-detector** | latest | Node health monitoring DaemonSet (kernel, docker, systemd issues) |
| 4.18 | **Reloader** | latest | Automatic pod restarts on ConfigMap/Secret changes |
| 4.19 | **scheduler-plugins** | v0.30.6 | Extended K8s scheduling capabilities (gang scheduling, capacity scheduling) |
| 4.20 | **kubefledged** | latest | Container image pre-caching on nodes for faster pod startup |
| 4.21 | **process-exporter** | latest | Per-process Prometheus metrics DaemonSet |
| 4.22 | **etcd-snapshotter** | custom | Automated etcd backup CronJob |
| 4.23 | **resource-topology-exporter (NFD)** | latest | NUMA/CPU/device topology reporting for topology-aware scheduling |

> **Note:** Phase 4.12 (OPA Gatekeeper) was removed as a standalone phase. Azure Policy for Arc (Phase 4.27) bundles its own managed Gatekeeper. Standalone Gatekeeper without constraint templates is inert and conflicts with Azure Policy's Helm-managed Gatekeeper in the `gatekeeper-system` namespace.

<a id="small-deployment-skips"></a>
### Small Deployment Skips

On **Small** deployments, the following components are **skipped** to avoid resource contention (the master has only 6 GB RAM):

| Phase | Component | Reason |
|-------|-----------|--------|
| 4.18 | Reloader | Non-essential, consumes memory |
| 4.19 | scheduler-plugins | Requires HA multi-master |
| 4.20 | kubefledged | Non-essential, consumes memory |
| 4.21 | process-exporter | Non-essential, consumes memory |
| 4.23 | resource-topology-exporter | Requires HA multi-master |

<a id="ha-only-components"></a>
### HA-Only Components

On **single-master** deployments (Small, Medium), these components are skipped regardless of resource availability:

| Phase | Component | Reason |
|-------|-----------|--------|
| 4.19 | scheduler-plugins | Only adds value on multi-master clusters with complex scheduling needs |
| 4.23 | resource-topology-exporter | Only adds value on clusters with real NUMA topology |

<a id="stability-gate"></a>
### Pre-Flight Stability Gate

Before deploying the ALRS component wave, the module waits for all core cluster pods (Cilium, Kube-OVN, Multus, CoreDNS) to reach `Running` or `Completed` state:

- Polls `kube-system` pods every 15 seconds
- Maximum wait: 180 seconds
- Prevents an image pull storm from overwhelming nodes when 13 components deploy in rapid succession

After each major milestone (post-CNI, post-KubeVirt, post-ALRS), the module runs a **dead pod cleanup** to remove terminated pods (Failed, Evicted) that accumulate from startup retries.

---

<a id="infrastructure-differences"></a>
## 7. Infrastructure Differences vs Standard Deployment

<a href="#toc">↑ Back to Table of Contents</a>

<a id="guest-os-differences"></a>
### Guest OS Differences

| Feature | Ubuntu (Stable/Latest) | Azure Linux 3.0 (ALRS) |
|---------|------------------------|------------------------|
| **Image format** | QCOW2 cloud image (.img) | ISO (official Azure Linux ISO) |
| **Conversion tool** | qemu-img (QCOW2 → VHD) | Hyper-V (ISO → VHDX → VHD) |
| **Package manager** | APT | tdnf |
| **Init system templates** | `*-pre-reboot.sh.template` / `*-post-reboot.sh.template` | `*-pre-reboot-azl.sh.template` / `*-post-reboot-azl.sh.template` |
| **Containerd package** | containerd.io (Docker APT repo) | moby-containerd (tdnf) |
| **K8s packages** | APT packages from pkgs.k8s.io deb repo | tdnf packages from pkgs.k8s.io rpm repo |
| **Sudo group** | `sudo` | `wheel` |
| **SSH service name** | `ssh` | `sshd` |
| **Cloud-init rendering** | netplan → systemd-networkd | Auto-detected: NetworkManager or networkd |
| **DHCP client ID** | dhcp-identifier: mac (in cloud-init) | ClientIdentifier=mac baked into VHD + cloud-init |
| **Firewall** | UFW (disabled by Phase 4.1) | iptables.service (flushed during VHD build) |
| **Package upgrade directive** | `package_upgrade: true` | omitted (tdnf update in init script) |

<a id="networking-differences"></a>
### Networking Differences

| Feature | Stable/Latest | ALRS |
|---------|---------------|------|
| **Primary CNI** | Kube-OVN (pod CIDR 10.16.0.0/16) | Cilium (pod CIDR 10.16.0.0/16) |
| **Secondary CNI** | None | Kube-OVN (pod CIDR 10.17.0.0/16) via Multus |
| **kube-proxy** | Installed | Skipped |
| **Service routing** | kube-proxy (iptables) | Cilium (eBPF) |
| **Overlay tunnel** | Geneve (Kube-OVN) | VXLAN (Cilium) + Geneve (Kube-OVN) |
| **OAM/Storage networks** | Not deployed | Kube-OVN overlay subnets (172.42.0.0/24, 172.43.0.0/24) |
| **Live-migration network** | Not deployed | Kube-OVN overlay (172.44.0.0/24) |
| **Observability** | None | Hubble (UI + Relay) |

<a id="phase-4-execution-differences"></a>
### Phase 4 Execution Differences

The Phase 4 execution order changes significantly for ALRS:

| Standard (Stable/Latest) | ALRS |
|---------------------------|------|
| 4.4: kubeadm init (with kube-proxy) | 4.4: kubeadm init (`--skip-phases=addon/kube-proxy`) |
| 4.7: Kube-OVN (primary) | 4.7b: Cilium (primary) |
| 4.8: Multus | 4.8: Multus |
| — | 4.7c-pre: CNI symlink cleanup (all nodes) |
| — | 4.7c: Kube-OVN (secondary via Multus) |
| 4.9–4.10: KubeVirt (optional) | 4.9–4.10: KubeVirt (optional) |
| — | 4.10b: KubeVirt live-migration network |
| — | 4.11–4.23: ALRS parity components |
| 4.24–4.28: Azure Arc (optional) | 4.24–4.28: Azure Arc (optional) |

---

<a id="kubevirt-live-migration"></a>
## 8. KubeVirt Live-Migration Network

<a href="#toc">↑ Back to Table of Contents</a>

When both KubeVirt and ALRS are enabled, Phase 4.10b configures a **dedicated live-migration network** for VM migration traffic:

- **Network**: Kube-OVN overlay subnet `172.44.0.0/24` via Multus NAD
- **Interface name**: `migration0` on virt-handler pods
- **Purpose**: Isolates migration bandwidth from the primary Cilium pod network
- **Configuration**: KubeVirt CR is patched to use the `live-migration` NetworkAttachmentDefinition

In the Nexus Cloud reference architecture, virt-handler pods attach to a dedicated migration network so that large VM memory transfers do not saturate the primary pod network and impact application traffic.

---

<a id="usage-examples"></a>
## 9. Usage Examples

<a href="#toc">↑ Back to Table of Contents</a>

### Full Automated ALRS Deployment (Small)

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -IncludeKubeVirt
```

### ALRS with Azure Arc + All Extensions

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Medium -DeploymentStack ALRS -IncludeKubeVirt `
    -IncludeAzureArc -AzureSubscription "my-sub" `
    -AzureResourceGroup "K8sNVI-Arc" -AzureLocation "eastus2" `
    -IncludeAzureMonitor -IncludeAzurePolicy -IncludeDefenderForContainers
```

### ALRS K8s Cluster Only (VMs Already Exist)

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -IncludeKubeVirt
```

### ALRS Large HA Deployment

```powershell
K8sNVI-DeployInfrastructure -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentSize Large -DeploymentStack ALRS -IncludeKubeVirt
```

### Redeploy with ALRS Stack

```powershell
K8sNVI-RedeployInfrastructureVMs -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -DeployKubernetes -IncludeKubeVirt
```

### Resume a Failed ALRS Deployment

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -IncludeKubeVirt -Resume
```

### Arc-Only on Existing ALRS Cluster

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -InstallAzureArcOnly `
    -AzureSubscription "my-sub" -AzureResourceGroup "K8sNVI-Arc" `
    -AzureLocation "eastus2"
```

### KubeVirt-Only on Existing ALRS Cluster

```powershell
K8sNVI-DeployK8sCluster -AdminUser "kubeadmin" -AdminPassword "SecurePass123!" `
    -DeploymentStack ALRS -InstallKubeVirtOnly
```

---

<a id="troubleshooting"></a>
## 10. Troubleshooting

<a href="#toc">↑ Back to Table of Contents</a>

### Azure Linux ISO Build Failures

**Issue:** "Azure Linux ISO-to-VHD build failed: installer did not complete within 30 minutes"

- **Check serial console log:** `C:\K8sNVI_DeploymentLogs\azl-builder-serial.log`
- **Check helper VM log:** `C:\K8sNVI_DeploymentLogs\azl-helper-cloudinit-serial.log`
- **Common causes:**
  - UEFI firmware can't find EFI boot image → verify ISO is valid
  - GRUB can't find config → check GRUB.CFG was patched correctly
  - Kernel panic in initrd → check serial log for kernel messages
- **Diagnostic:** Open Hyper-V Manager → connect to the builder VM for visual console output

### Cloud-Init Not Installed in Golden VHD

**Issue:** VMs boot but cloud-init doesn't run (no user created, no SSH keys)

- **Check helper VM serial log** for `CLOUDINIT_MISSING` or `CLOUDINIT_OK` markers
- **Verify network in helper VM:** The helper VM needs internet access via Kube-OVN switch NAT to download packages from Azure Linux repos
- **DNS issues:** Only `168.63.129.16` (Azure wireserver) works for DNS from nested VMs. External DNS (8.8.8.8) is unreachable on UDP:53 through RRAS NAT

### DHCP Client ID Mismatch

**Issue:** VMs get random DHCP pool IPs instead of their reserved addresses

- Azure Linux uses systemd-networkd with DUID-based DHCP client IDs by default
- Windows DHCP Server uses MAC-based reservations
- The module bakes `ClientIdentifier=mac` into the VHD via three layers:
  1. Global `/etc/systemd/networkd.conf.d/10-dhcp-client-id.conf`
  2. Per-network drop-in for cloud-init's generated file
  3. Cloud-init write_files directive
- If the mismatch persists, SSH into the VM and verify: `cat /etc/systemd/networkd.conf.d/10-dhcp-client-id.conf`

### Cilium Pods Not Ready

**Issue:** Cilium pods stuck in CrashLoopBackOff or Init

- Verify kube-proxy was NOT deployed: `kubectl get daemonset -n kube-system kube-proxy` should return "not found"
- Check Cilium status: `kubectl -n kube-system exec ds/cilium -- cilium status`
- Check Cilium logs: `kubectl -n kube-system logs ds/cilium`

### Kube-OVN Secondary Not Working

**Issue:** Kube-OVN pods crash or NADs don't create secondary interfaces

- Verify CNI symlinks were removed: `ls -la /opt/cni/bin/` should show real files, not symlinks
- Check Kube-OVN is running with `is-default=false`: `kubectl get subnet -o wide`
- Verify Multus is running: `kubectl get pods -n kube-system | grep multus`
- Check NAD CRD exists: `kubectl get crd network-attachment-definitions.k8s.cni.cncf.io`

### iptables Blocking Traffic on Azure Linux VMs

**Issue:** Azure Linux VMs are unreachable after boot (ping fails, SSH fails)

- Azure Linux 3.0 auto-enables `iptables.service` with default DROP rules
- The module flushes iptables and disables the service during VHD build
- If rules persist, SSH in (if possible) and run:
  ```bash
  sudo iptables -F && sudo iptables -P INPUT ACCEPT && sudo iptables -P FORWARD ACCEPT
  sudo systemctl disable iptables.service
  ```

### ALRS Component Failures on Small Deployments

**Issue:** Pods in CrashLoopBackOff or OOMKilled after ALRS components deploy

- Small deployments skip non-essential components by design (Reloader, kubefledged, process-exporter, scheduler-plugins, resource-topology-exporter)
- If core components are still OOMKilled, worker memory may have been reduced by the memory pre-flight check
- Check actual memory: `kubectl describe node | grep -A5 Allocatable`
- Consider using Medium deployment for full ALRS component set

### Resume Shows "No Checkpoint Found"

**Issue:** `-Resume` doesn't skip any phases

- Verify checkpoint file exists: `Test-Path C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json`
- View last checkpoint: `Get-Content C:\K8sNVI_DeploymentLogs\phase4_checkpoint.json`
- A fresh deployment (without `-Resume`) clears any existing checkpoint

---

*Module Version: 2.10.30 | Last Updated: March 2026*
