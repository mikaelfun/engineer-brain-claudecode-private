# VM Vm Allocation F — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 8 | **关键词**: allocation, f
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | SAP customer cannot create VM with specified subscription and region in Azure China | Insufficient VM quota in the target subscription/region | Advise customer to submit a commerce/quota increase case for the specific VM SKU... | 🔵 7.5 | OneNote |
| 2 | Multiple VMs experience network jitter/connectivity loss simultaneously; two VMs become completely u... | Host node became unhealthy - Azure Fabric was unable to reach the node, causing ... | Use Kusto LogContainerSnapshot to find containerId+nodeId by subscriptionId+role... | 🔵 5.5 | OneNote |
| 3 | Ubuntu Linux VM cannot be accessed: SSH fails, VMAccess agent does not work, VM cannot obtain IP; se... | Ubuntu does not support password reset via serial console natively; when both VM... | Use az vm repair to create a recovery VM with OS disk attached as data disk. Mou... | 🔵 7.5 | OneNote |
| 4 | Linux VM provisioning times out when created via SDK/ARM template with Chinese characters in resourc... | IMDS returns JSON response containing Chinese characters from tags. On CentOS 7.... | Remove Chinese characters from VM tags (use ASCII-only tag values). Alternativel... | 🔵 7.5 | OneNote |
| 5 | Questions about Windows 10 client image support lifecycle and availability on Azure Mooncake/Fairfax... | Windows client images are not published to Mooncake or Fairfax because those sys... | 1) Advise upgrade to latest supported Windows version; 2) Win10 client images on... | 🔵 7.5 | OneNote |
| 6 | When performing Swap OS disk on Azure VM, newly created Managed Disk is not visible in selection lis... | Mismatch in Availability Zone configuration between original OS disk and new Man... | Match the Availability Zone setting of original OS disk exactly when creating re... | 🔵 7.5 | OneNote |
| 7 | VMSS management operations (update/scale) on MR-enabled tenant hosting Service Fabric cluster stuck ... | Three possible causes on MR-enabled SF cluster: (a) incorrect Service Fabric con... | Investigate by checking: 1) SF cluster durability tier (Gold/Silver = MR enabled... | 🔵 7.5 | OneNote |
| 8 | Msv2/Mdsv2 series VM quota approved but portal still cannot create the VM (e.g. Standard_M208s_v2). ... | PG backend configuration was not updated after quota approval. The quota was gra... | Engage PG via ICM to perform backend configuration update. After PG updates the ... | 🔵 6.0 | OneNote |
