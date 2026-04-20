# VM Vm Provisioning I — 排查速查

**来源数**: 1 | **21V**: 未标注
**条目数**: 8 | **关键词**: provisioning, i
**最后更新**: 2026-04-18

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Terraform VM deployment from 3rd-party marketplace image in Mooncake fails with 500 InternalServerEr... | Terraform plan block triggers ARM to call storeapi.azure.com (public Azure servi... | Remove the plan block from terraform azurerm_virtual_machine resource arguments.... | 🔵 7.5 | OneNote |
| 2 | Linux VM cannot boot: Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0). Serial log ... | Missing initramfs file for the current boot kernel version. The initramfs (initi... | 1) Create snapshot of OS disk, attach to rescue Linux VM; 2) Use chroot to acces... | 🔵 6.0 | OneNote |
| 3 | Azure Windows VM BSOD caused by CrowdStrike Falcon Sensor update (csagent.sys) on 2024-07-19, VM boo... | CrowdStrike channel file C-00000291*.sys with timestamp 2024-07-19 0409 UTC was ... | Auto: BSOD-Autofix.ps1 with az vm repair (handles encrypted/unmanaged). Manual: ... | 🔵 7.5 | OneNote |
| 4 | VMSS has failed instances that cannot be deleted or modified via portal/CLI. az vmss delete-instance... | Specific VM instances stuck in inconsistent state: some return InstanceIdsListIn... | 1) Query CRP ApiQosEvent to identify which instances return BadRequest/errors. 2... | 🔵 5.5 | OneNote |
| 5 | VMSS nodes enter failed state after Scale-in operation due to Fabric Failover | Fabric Failover triggered during or after VMSS scale-in operation causes remaini... | Investigate Fabric Failover root cause via Kusto/ICM. Ref ICM: 120205931. | 🔵 7.5 | OneNote |
| 6 | Customer deleted managed disk and needs recovery; disk was hard deleted (not in soft-delete state) | Managed disk was hard deleted — either soft-delete conditions not met (disk crea... | Open Sev.2 or Sev.3 ICM to XStore/Table Server team. ICM template: O01O2z. If no... | 🔵 7.5 | OneNote |
| 7 | AWS image imported to Azure: Gen1 VM created from the image works fine, but Gen2 VM created from the... | The image captured from AWS was a Gen1 image. Using it directly for Gen2 VM depl... | Capture a proper Gen2 image from AWS (ensure UEFI boot support) before importing... | 🔵 6.0 | OneNote |
| 8 | Issue description: ================================================= Sysprep error with long running... | due to the DSC module is out-of-date... | Resolution: ================================================== To resolve this i... | 🟡 5.0 | KB |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-provisioning-i.md)
