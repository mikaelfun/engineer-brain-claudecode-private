# VM Vm Maintenance — 综合排查指南

**条目数**: 6 | **草稿融合数**: 4 | **Kusto 查询融合**: 1
**来源草稿**: [onenote-fabric-maintenance-migration-check.md](../../guides/drafts/onenote-fabric-maintenance-migration-check.md), [onenote-maintenance-notification-node-list.md](../../guides/drafts/onenote-maintenance-notification-node-list.md), [onenote-scheduled-maintenance-troubleshooting.md](../../guides/drafts/onenote-scheduled-maintenance-troubleshooting.md), [onenote-tor-maintenance-investigation.md](../../guides/drafts/onenote-tor-maintenance-investigation.md)
**Kusto 引用**: [vm-maintenance.md](../../../kusto/vm/references/queries/vm-maintenance.md)
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: 数据收集
> 来源: Kusto skill

1. 执行 Kusto 查询 `[工具: Kusto skill — vm-maintenance.md]`

### Phase 2: 排查与诊断
> 来源: ADO Wiki, KB

1. 参照 [onenote-fabric-maintenance-migration-check.md](../../guides/drafts/onenote-fabric-maintenance-migration-check.md) 排查流程
2. 参照 [onenote-maintenance-notification-node-list.md](../../guides/drafts/onenote-maintenance-notification-node-list.md) 排查流程
3. 参照 [onenote-scheduled-maintenance-troubleshooting.md](../../guides/drafts/onenote-scheduled-maintenance-troubleshooting.md) 排查流程
4. 参照 [onenote-tor-maintenance-investigation.md](../../guides/drafts/onenote-tor-maintenance-investigation.md) 排查流程

### Phase 3: 根因判断与解决

**判断逻辑**：

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| DCsv3/DCdsv3 series does not support Accelerated N | 1 条相关 | Do not enable Accelerated Networking on Linux DCsv3/DCdsv3 V... |
| The SAP system is using the Java stack, which is n | 1 条相关 | Inform the customer that Java stack is not supported by ACSS... |
| cifs-utils package (and its dependency keyutils) n | 2 条相关 | Install cifs-utils using the distro package manager: Ubuntu:... |
| Heat tracking counts file access from all processe | 1 条相关 | Set registry to exclude process names from heat tracking. Ag... |
| NetworkVirtualization is required by SCVMM and is  | 1 条相关 | TBD |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Accelerated Networking fails to enable or does not work on Linux DCsv3/DCdsv3 VMs; live migration fa... | DCsv3/DCdsv3 series does not support Accelerated Networking on Linux or Live Mig... | Do not enable Accelerated Networking on Linux DCsv3/DCdsv3 VMs; plan for VM down... | 🟢 8.0 | ADO Wiki |
| 2 | ACSS registration fails with SAPDBHOSTNotFound error. Failed to discover the database VM; SAPDBHOST ... | The SAP system is using the Java stack, which is not supported by Azure Center f... | Inform the customer that Java stack is not supported by ACSS. Refer to ACSS Supp... | 🟢 8.0 | ADO Wiki |
| 3 | Linux mount error(2): mount(2) error system call failed: No route to host when mounting Azure Files ... | cifs-utils package (and its dependency keyutils) not installed on Linux. These p... | Install cifs-utils using the distro package manager: Ubuntu: sudo apt install ci... | 🟢 8.0 | ADO Wiki |
| 4 | Azure Files mount error(2) "No route to host" on Linux when mounting SMB share with -t cifs | cifs-utils package (and its dependency keyutils) not installed on the Linux VM. ... | Install cifs-utils using the distro package manager: Ubuntu: sudo apt install ci... | 🟢 8.0 | ADO Wiki |
| 5 | Azure File Sync cloud tiering date policy not tiering files as expected because background processes... | Heat tracking counts file access from all processes including background service... | Set registry to exclude process names from heat tracking. Agent v11-v12: HeatTra... | 🟢 8.0 | ADO Wiki |
| 6 | Add virtual machine host job fails with: Add virtual machine host job will fail with: Error (20594)T... | NetworkVirtualization is required by SCVMM and is not a Feature that ships with ... |  | 🔵 7.5 | KB |

