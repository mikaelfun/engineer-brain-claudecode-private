# VM Vm Provisioning I — 综合排查指南

**条目数**: 7 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md)
**Kusto 引用**: [provisioning-timeout.md](../../../kusto/vm/references/queries/provisioning-timeout.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — provisioning-timeout.md]`

### Phase 2: 排查与诊断
> 来源: OneNote

1. 参照 [ado-wiki-a-Pre-Provisioning-Service.md](../../guides/drafts/ado-wiki-a-Pre-Provisioning-Service.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| Terraform plan block triggers ARM to call storeapi | 1 条相关 | Remove the plan block from terraform azurerm_virtual_machine... |
| Missing initramfs file for the current boot kernel | 1 条相关 | 1) Create snapshot of OS disk, attach to rescue Linux VM; 2)... |
| CrowdStrike channel file C-00000291*.sys with time | 1 条相关 | Auto: BSOD-Autofix.ps1 with az vm repair (handles encrypted/... |
| Specific VM instances stuck in inconsistent state: | 1 条相关 | 1) Query CRP ApiQosEvent to identify which instances return ... |
| Fabric Failover triggered during or after VMSS sca | 1 条相关 | Investigate Fabric Failover root cause via Kusto/ICM. Ref IC... |
| Managed disk was hard deleted — either soft-delete | 1 条相关 | Open Sev.2 or Sev.3 ICM to XStore/Table Server team. ICM tem... |
| The image captured from AWS was a Gen1 image. Usin | 1 条相关 | Capture a proper Gen2 image from AWS (ensure UEFI boot suppo... |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Terraform VM deployment from 3rd-party marketplace image in Mooncake fails with 500 InternalServerEr... | Terraform plan block triggers ARM to call storeapi.azure.com (public Azure servi... | Remove the plan block from terraform azurerm_virtual_machine resource arguments.... | 🔵 7.5 | OneNote |
| 2 | Linux VM cannot boot: Kernel panic - VFS: Unable to mount root fs on unknown-block(0,0). Serial log ... | Missing initramfs file for the current boot kernel version. The initramfs (initi... | 1) Create snapshot of OS disk, attach to rescue Linux VM; 2) Use chroot to acces... | 🔵 6.0 | OneNote |
| 3 | Azure Windows VM BSOD caused by CrowdStrike Falcon Sensor update (csagent.sys) on 2024-07-19, VM boo... | CrowdStrike channel file C-00000291*.sys with timestamp 2024-07-19 0409 UTC was ... | Auto: BSOD-Autofix.ps1 with az vm repair (handles encrypted/unmanaged). Manual: ... | 🔵 7.5 | OneNote |
| 4 | VMSS has failed instances that cannot be deleted or modified via portal/CLI. az vmss delete-instance... | Specific VM instances stuck in inconsistent state: some return InstanceIdsListIn... | 1) Query CRP ApiQosEvent to identify which instances return BadRequest/errors. 2... | 🔵 5.5 | OneNote |
| 5 | VMSS nodes enter failed state after Scale-in operation due to Fabric Failover | Fabric Failover triggered during or after VMSS scale-in operation causes remaini... | Investigate Fabric Failover root cause via Kusto/ICM. Ref ICM: 120205931. | 🔵 7.5 | OneNote |
| 6 | Customer deleted managed disk and needs recovery; disk was hard deleted (not in soft-delete state) | Managed disk was hard deleted — either soft-delete conditions not met (disk crea... | Open Sev.2 or Sev.3 ICM to XStore/Table Server team. ICM template: O01O2z. If no... | 🔵 7.5 | OneNote |
| 7 | AWS image imported to Azure: Gen1 VM created from the image works fine, but Gen2 VM created from the... | The image captured from AWS was a Gen1 image. Using it directly for Gen2 VM depl... | Capture a proper Gen2 image from AWS (ensure UEFI boot support) before importing... | 🔵 6.0 | OneNote |

