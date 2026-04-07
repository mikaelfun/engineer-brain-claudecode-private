# ARM Azure Migrate 迁移与发现 — 排查速查

**来源数**: 9 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | VMware agentless migration initial replication stuck at 'queued' status with 0% progress. ProgressP… | Snapshot replication cycle initiated but data transfer not progressing. Common causes: Gateway work… | 1) Query SRSOperationEvent in ASR Kusto (asradxclusmc.chinanorth2.kusto.chinacloudapi.cn/ASRKustoDB… | 🟢 8.5 — onenote+21V适用 | [MCVKB/[migrate] VMware Agentless _ initial replication q.md] |
| 2 📋 | Multiple VMware/Physical VMs with same BIOS UUID/GUID cause Azure Migrate discovery to show duplica… | When VMs are cloned without regenerating BIOS UUID, multiple machines report identical BIOSGuid to … | Use Kusto query against AMPKustoDB.Messages to identify machines sharing same BIOSGuid. Fix by rege… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (VM).md] |
| 3 📋 | Azure Migrate SQL discovery fails with 'Failed to fetch details for sql server' error for one or mo… | SQL discovery agent cannot access SQL Server metadata due to credential issues, network problems, o… | 1) Identify failing SQL servers via Kusto query filtering AMPKustoDB.Messages for 'Failed to fetch … | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (SQL).md] |
| 4 📋 | Azure Migrate dependency map guest data collection fails with errors like GuestCredentialNotValid, … | Customer-side errors (CxErrors): invalid guest credentials, VM powered off, VMware Tools not instal… | Use Kusto query against AMPKustoDB.Messages filtering 'Dependency Map guest data collection complet… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (Apps and Dependency).md] |
| 5 📋 | Azure Migrate fails to collect SQL Server performance data with 'Failed to get performance data for… | SQL agent cannot collect performance counters from SQL Server instance. Common causes: insufficient… | 1) Query AMPKustoDB.Messages with SQL agent ID filtering 'Failed to get performance data for Sql se… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (SQL).md] |
| 6 📋 | Need to escalate Azure Migrate issue to product group (PG) via ICM | Complex Azure Migrate issues that require PG investigation cannot be resolved at CSS level | 1) Create ICM using template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r2V1r1. … | 🟢 8.5 — onenote+21V适用 | [MCVKB/ICM.md] |
| 7 📋 | Azure Blueprints customers experiencing service limitations or looking for migration path; Blueprin… | Azure Blueprints is on a deprecation path and no longer receiving new feature investment | Migrate from Azure Blueprints to Template Specs and Deployment Stacks. For active Blueprint issues,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 📋 | Network Fabric password rotation API not available or fails on older fabric deployment. Fabric depl… | Fabrics deployed before release 9.2 require one-time migration to the new password rotation scheme … | Run password rotation once to trigger migration. Migration renames secrets and updates API fields a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 📋 | Customer reports issues with Azure Blueprints (assignment failures, definition errors) or asks abou… | Azure Blueprints is on a deprecation path and will be phased out; customers should plan migration | Recommend migration to Template Specs and Deployment Stacks. For active Blueprints bugs or PG escal… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. 1) Query SRSOperationEvent in ASR Kusto (asradxclusmc.chinanorth2.kusto.chinacl… `[来源: onenote]`
2. Use Kusto query against AMPKustoDB.Messages to identify machines sharing same B… `[来源: onenote]`
3. 1) Identify failing SQL servers via Kusto query filtering AMPKustoDB.Messages f… `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/azure-migrate.md#排查流程)
