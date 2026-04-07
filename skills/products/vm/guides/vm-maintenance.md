# VM Vm Maintenance — 排查速查

**来源数**: 2 | **21V**: 未标注
**条目数**: 6 | **关键词**: maintenance
**最后更新**: 2026-04-07

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Accelerated Networking fails to enable or does not work on Linux DCsv3/DCdsv3 VMs; live migration fa... | DCsv3/DCdsv3 series does not support Accelerated Networking on Linux or Live Mig... | Do not enable Accelerated Networking on Linux DCsv3/DCdsv3 VMs; plan for VM down... | 🟢 8.0 | ADO Wiki |
| 2 | ACSS registration fails with SAPDBHOSTNotFound error. Failed to discover the database VM; SAPDBHOST ... | The SAP system is using the Java stack, which is not supported by Azure Center f... | Inform the customer that Java stack is not supported by ACSS. Refer to ACSS Supp... | 🟢 8.0 | ADO Wiki |
| 3 | Linux mount error(2): mount(2) error system call failed: No route to host when mounting Azure Files ... | cifs-utils package (and its dependency keyutils) not installed on Linux. These p... | Install cifs-utils using the distro package manager: Ubuntu: sudo apt install ci... | 🟢 8.0 | ADO Wiki |
| 4 | Azure Files mount error(2) "No route to host" on Linux when mounting SMB share with -t cifs | cifs-utils package (and its dependency keyutils) not installed on the Linux VM. ... | Install cifs-utils using the distro package manager: Ubuntu: sudo apt install ci... | 🟢 8.0 | ADO Wiki |
| 5 | Azure File Sync cloud tiering date policy not tiering files as expected because background processes... | Heat tracking counts file access from all processes including background service... | Set registry to exclude process names from heat tracking. Agent v11-v12: HeatTra... | 🟢 8.0 | ADO Wiki |
| 6 | Add virtual machine host job fails with: Add virtual machine host job will fail with: Error (20594)T... | NetworkVirtualization is required by SCVMM and is not a Feature that ships with ... |  | 🔵 7.5 | KB |

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-maintenance.md)
