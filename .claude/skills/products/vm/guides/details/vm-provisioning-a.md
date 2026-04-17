# VM Vm Provisioning A — 综合排查指南

**条目数**: 30 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md)
**Kusto 引用**: [provisioning-timeout.md](../../../kusto/vm/references/queries/provisioning-timeout.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — provisioning-timeout.md]`

### Phase 2: 排查与诊断
> 来源: ADO Wiki

1. 参照 [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| CVM CMK-encrypted disks cannot be copied cross-sub | 1 条相关 | 1) Copy/snapshot CVM CMK disks within same subscription only... |
| User used a DES of type 'ConfidentialVmEncryptedWi | 1 条相关 | For CVM CMK encryption: use DES of type 'ConfidentialVmEncry... |
| DCsv3 and DCdsv3 series VMs require Gen2 images du | 1 条相关 | Use a Gen2 OS image (Ubuntu Server 18.04/20.04 LTS or Window... |
| Known platform issue with PaaS on diskless (no loc | 1 条相关 | Use disk VMs (Ddv4, Ddsv4, Edv4, Edsv4) instead for PaaS wor... |
| Bug in Windows provisioning causes pagefile.sys to | 1 条相关 | In File Explorer → View → Options → View tab: enable 'Show h... |
| Azure host software issue causes Linux kernel vers | 1 条相关 | Use RHEL 8.x, CentOS 8.x, or Oracle Linux 7.x (or newer) ima... |
| Sporadic platform issue where Accelerated Networki | 1 条相关 | Disable Accelerated Networking, or redeploy the VM (may not ... |
| Azure retired default outbound access for VMs on S | 1 条相关 | Configure explicit outbound connectivity: Azure NAT Gateway,... |
| All v6 and v7 series VMs require Generation 2 IaaS | 1 条相关 | Use a Gen2 OS image tagged with NVMe support. Check NVMe-com... |
| DCsv3 and DCdsv3 series VMs only support Generatio | 1 条相关 | Use a Gen2 OS image (Ubuntu 18.04/20.04 LTS or Windows Serve... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CVM disk/snapshot operations fail: 'Cannot create disk or snapshot by copying CVM disk from differen... | CVM CMK-encrypted disks cannot be copied cross-subscription. Snapshot/copy opera... | 1) Copy/snapshot CVM CMK disks within same subscription only. 2) Do not change s... | 🔵 7.0 | ADO Wiki |
| 2 | CVM DiskEncryptionSet type mismatch: 'The type of the Disk Encryption Set in the request is Confiden... | User used a DES of type 'ConfidentialVmEncryptedWithCustomerKey' for SSE CMK enc... | For CVM CMK encryption: use DES of type 'ConfidentialVmEncryptedWithCustomerKey'... | 🔵 7.0 | ADO Wiki |
| 3 | Deployment of DCsv3 or DCdsv3 VM fails when using Gen1 image; only Gen2 images are supported for thi... | DCsv3 and DCdsv3 series VMs require Gen2 images due to confidential computing (S... | Use a Gen2 OS image (Ubuntu Server 18.04/20.04 LTS or Windows Server 2019 Datace... | 🔵 7.0 | ADO Wiki |
| 4 | PaaS solutions fail to deploy on diskless Dv4, Dsv4, Ev4, and Esv4 VMs; IaaS workloads unaffected | Known platform issue with PaaS on diskless (no local temp disk) v4 series VMs | Use disk VMs (Ddv4, Ddsv4, Edv4, Edsv4) instead for PaaS workloads until the iss... | 🔵 7.0 | ADO Wiki |
| 5 | Windows VM on diskless Dv4/Ev4 series appears to have no pagefile; pagefile.sys not visible in File ... | Bug in Windows provisioning causes pagefile.sys to be created as a hidden + syst... | In File Explorer → View → Options → View tab: enable 'Show hidden files' and unc... | 🔵 7.0 | ADO Wiki |
| 6 | Linux VM kernel panic on boot when deploying RHEL 7.x, CentOS 7.x, or Oracle Linux 6.x on Dv4/Ev4 VM... | Azure host software issue causes Linux kernel version 4.6 or earlier to fail to ... | Use RHEL 8.x, CentOS 8.x, or Oracle Linux 7.x (or newer) images. Other Linux dis... | 🔵 7.0 | ADO Wiki |
| 7 | Accelerated Networking toggle is ON during VM provisioning but no Mellanox entry appears in Device M... | Sporadic platform issue where Accelerated Networking NIC (Mellanox ConnectX-4 Lx... | Disable Accelerated Networking, or redeploy the VM (may not always work). Perman... | 🔵 7.0 | ADO Wiki |
| 8 | Azure VM loses internet outbound connectivity; new VMs created without explicit outbound method have... | Azure retired default outbound access for VMs on Sept 30 2025. VMs in virtual ne... | Configure explicit outbound connectivity: Azure NAT Gateway, Azure Load Balancer... | 🔵 7.0 | ADO Wiki |
| 9 | Deployment of v6/v7 series VMs (Dasv6, Easv6, Fasv6, Dasv7, Easv7, Fasv7, Dpsv6, Dsv6, Dlsv6, Esv6) ... | All v6 and v7 series VMs require Generation 2 IaaS VM images with NVMe tag; Gen1... | Use a Gen2 OS image tagged with NVMe support. Check NVMe-compatible images at ht... | 🔵 7.0 | ADO Wiki |
| 10 | DCsv3 or DCdsv3 confidential VM deployment fails — only Gen2 images supported, Gen1 images rejected | DCsv3 and DCdsv3 series VMs only support Generation 2 VM images. Attempting to d... | Use a Gen2 OS image (Ubuntu 18.04/20.04 LTS or Windows Server 2019 Datacenter). ... | 🔵 7.0 | ADO Wiki |
| 11 | VMs lose outbound internet connectivity; new VMs created without explicit outbound method have no in... | Azure retired default outbound access for VMs. VMs in a virtual network without ... | Transition to an explicit outbound connectivity method: (1) Azure NAT Gateway, (... | 🔵 7.0 | ADO Wiki |
| 12 | Customer attempts to use Standard SSD or Standard HDD disk with Ebdsv5/Ebsv5 (Ebv5) series VM and en... | Ebv5 series VMs only support Premium Storage. Standard SSDs and Standard HDDs di... | Use Premium SSD (P-series), Premium SSD v2, or Ultra Disk instead of Standard SS... | 🔵 7.0 | ADO Wiki |
| 13 | Using Gen 1 VM image with NVMe-capable v6 VM series (Dasv6/Easv6/Fasv6 etc.) fails with error: The s... | NVMe is only supported on Gen 2 VMs. There are no plans to support NVMe on Gen 1... | Convert Gen 1 VM image to Gen 2 or create a new Gen 2 VM. See https://learn.micr... | 🔵 7.0 | ADO Wiki |
| 14 | AKS VMSS node fails to provision; vmssCSE (Custom Script Extension) reports failure with exit code (... | AKS uses CSE to install Kubernetes components on VMSS nodes. Exit codes indicate... | 1) ASC → VM → Extensions → expand failed CSE → Status Message for error code. 2)... | 🔵 7.0 | ADO Wiki |
| 15 | Windows VM Guest Agent not auto-upgrading on custom VM images deployed outside Azure Marketplace | Custom VMs and manually provisioned VMs do not auto-upgrade the Guest Agent from... | 1) Verify ProvisionVMAgent=True and EnableAutomaticUpdates=True via Get-AzVM OSP... | 🔵 7.0 | ADO Wiki |
| 16 | Linux agent error 'Failed to copy ovf-env' on a VM that was previously provisioned successfully | The /var/lib/waagent/provisioned marker file is missing on a previously provisio... | Run: sudo touch /var/lib/waagent/provisioned | 🔵 7.0 | ADO Wiki |
| 17 | Error 'Subscription X is not registered with the feature Microsoft.Compute/Architecture. Please regi... | Customer's subscription is not registered to the 'Architecture' AFEC flag requir... | Register the subscription to the 'Architecture' AFEC flag; use the onboarding li... | 🔵 7.0 | ADO Wiki |
| 18 | Error 'Architecture.Arm64 image requests to be deployed through only managed disk. Please set proper... | Arm64 VMs only support managed disk scenarios; unmanaged disk is not supported o... | Customer must use managed disk with Arm64 VMs; set VM disk type to Managed and r... | 🔵 7.0 | ADO Wiki |
| 19 | Error 'Cannot create a VM of size X because this VM size only supports a CPU Architecture of Arm64, ... | The selected VM size CPU architecture (Arm64 vs x64/x86) does not match the arch... | Use Arm64 images/disks with Arm64 VM sizes (sizes with 'p' suffix, e.g. Standard... | 🔵 7.0 | ADO Wiki |
| 20 | Error 'Cannot resize a VM of size X with CPU Architecture Arm64 to a VM of size Y with CPU Architect... | Azure does not support resizing between different CPU architectures; Arm64 and x... | Arm64 VMs can only be resized to other Arm64 VM sizes (suffix 'p'); to switch to... | 🔵 7.0 | ADO Wiki |
| 21 | Error: 'Architecture.Arm64 image requests to be deployed through only managed disk' when deploying o... | Customer attempted to use an unmanaged disk with an Arm64 image; Arm64 VMs only ... | Use managed disk (not unmanaged disk) when deploying Arm64 VMs. Ensure vmDiskTyp... | 🔵 7.0 | ADO Wiki |
| 22 | Error: 'Cannot resize a VM of size X with CPU Architecture Arm64 to a VM of size Y with CPU Architec... | Customer attempted to resize an Arm64 VM (sizes with 'p' suffix) to an x86/x64 V... | Arm64 VMs can only be resized to other Arm64 VM sizes (sizes with 'p' suffix). S... | 🔵 7.0 | ADO Wiki |
| 23 | Error 'Changing the logical sector size of a disk is not permitted' when creating a disk from Ultra/... | Logical sector size cannot be changed when creating a disk from a snapshot; the ... | Create the new disk with the same logical sector size as the source snapshot. Cr... | 🔵 7.0 | ADO Wiki |
| 24 | Error 'Import of disk {id} is in progress. Creation of snapshot is not allowed until completion' whe... | The target disk's import or creation operation has not yet completed (completion... | Wait until the disk completion percentage reaches 100% before creating a snapsho... | 🔵 7.0 | ADO Wiki |
| 25 | Error 'Cross subscription incremental snapshots are not supported. Copy source is in subscription {A... | Incremental snapshots of Ultra Disk and Premium SSD v2 across different subscrip... | Create the incremental snapshot in the same subscription as the source disk. Cro... | 🔵 7.0 | ADO Wiki |
| 26 | Error 'Source incremental snapshot {id} copy is still in progress. Please retry after source snapsho... | The source incremental snapshot has not finished replicating/copying; the copy o... | Wait for the source snapshot copy to complete before creating a disk from it. Mo... | 🔵 7.0 | ADO Wiki |
| 27 | Error 'Minimum api-version of {version} required to create snapshots on ultra or premiumV2 disks' wh... | The API version specified in the request is below the minimum required (2022-03-... | Upgrade to Azure compute REST API version 2022-03-22 or later when creating snap... | 🔵 7.0 | ADO Wiki |
| 28 | Error 'Minimum api-version of {version} required to create incremental restore points on ultra or pr... | API version used is below the minimum required (2022-03-22) for incremental rest... | Upgrade to Azure compute REST API version 2022-03-22 or later when creating incr... | 🔵 7.0 | ADO Wiki |
| 29 | Error 'The move resources request contains Ultra or PremiumV2 disk created from snapshot and still g... | The disk was created from a snapshot but the data hydration (copy from snapshot)... | Wait for disk hydration to complete (monitor provisioning state until disk is fu... | 🔵 7.0 | ADO Wiki |
| 30 | Error indicating too many snapshots are already pending for export when trying to create snapshots o... | Platform limit reached: too many snapshot copy/export operations are concurrentl... | Click the link in the error message to view snapshots pending export; wait for e... | 🔵 7.0 | ADO Wiki |

