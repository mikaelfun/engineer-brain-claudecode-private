# ARM Azure Migrate 迁移与发现 — 综合排查指南

**条目数**: 9 | **草稿融合数**: 3 | **Kusto 查询融合**: 0
**来源草稿**: onenote-azure-migrate-discovery-apps-dep.md, onenote-azure-migrate-discovery-vm.md, onenote-azure-migrate-network-requirements-21v.md
**Kusto 引用**: —
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: VMware agentless migration initial replication stuck at 'queued' status with 0%…
> 来源: onenote

**根因分析**: Snapshot replication cycle initiated but data transfer not progressing. Common causes: Gateway worker scheduling delays (RequestTime/ScheduledTime gaps), vCenter connectivity issues, or Storage Account access problems for the cache/log storage in Mooncake.

1. 1) Query SRSOperationEvent in ASR Kusto (asradxclusmc.
2. chinanorth2.
3. chinacloudapi.
4. cn/ASRKustoDB) filtering by SubscriptionId to check operation states.
5. 2) Query SRSDataEvent with ClientRequestId filtering Message for 'InitialReplication' to track IR progress.
6. 3) Query GatewayOperationEvent for SnapshotReplication events to check upload statistics.
7. 4) Query GatewayDiagnosticEvent for worker scheduling (RequestTime vs ScheduledTime) to identify scheduling delays.
8. 5) Run appliance diagnostics at https://localhost:44368.

`[结论: 🟢 8.5/10 — [MCVKB/[migrate] VMware Agentless _ initial replication q.md]]`

### Phase 2: Multiple VMware/Physical VMs with same BIOS UUID/GUID cause Azure Migrate disco…
> 来源: onenote

**根因分析**: When VMs are cloned without regenerating BIOS UUID, multiple machines report identical BIOSGuid to Azure Migrate, causing deduplication issues in the discovery service

1. Use Kusto query against AMPKustoDB.
2. Messages to identify machines sharing same BIOSGuid.
3. Fix by regenerating BIOS UUID on cloned VMs (vm.
4. changeableByDesign.
5. uuid in VMware settings) or using Physical server discovery method which validates by IP+BIOS combination.

`[结论: 🟢 8.5/10 — [MCVKB/Discovery (VM).md]]`

### Phase 3: Azure Migrate SQL discovery fails with 'Failed to fetch details for sql server'…
> 来源: onenote

**根因分析**: SQL discovery agent cannot access SQL Server metadata due to credential issues, network problems, or SQL Server configuration. The AgentException in Kusto logs provides specific failure reason

1. 1) Identify failing SQL servers via Kusto query filtering AMPKustoDB.
2. Messages for 'Failed to fetch details for sql server' with the SQL agent ID.
3. 2) Check RunAsAccount credentials match in appliance config.
4. 3) Verify SQL Server allows remote connections.
5. 4) Use ServiceActivityId for detailed error trace.

`[结论: 🟢 8.5/10 — [MCVKB/Discovery (SQL).md]]`

### Phase 4: Azure Migrate dependency map guest data collection fails with errors like Guest…
> 来源: onenote

**根因分析**: Customer-side errors (CxErrors): invalid guest credentials, VM powered off, VMware Tools not installed/running, insufficient privileges. Non-customer errors (NonCxErrors): VimException, script execution timeout, temporary user profile, null result

1. Use Kusto query against AMPKustoDB.
2. Messages filtering 'Dependency Map guest data collection completed' with agent ID to classify errors.
3. For CxErrors: fix credentials, install VMware Tools, grant privileges.
4. For NonCxErrors: check appliance connectivity, retry, or escalate to PG with ICM.

`[结论: 🟢 8.5/10 — [MCVKB/Discovery (Apps and Dependency).md]]`

### Phase 5: Azure Migrate fails to collect SQL Server performance data with 'Failed to get …
> 来源: onenote

**根因分析**: SQL agent cannot collect performance counters from SQL Server instance. Common causes: insufficient permissions on sys.dm_os_performance_counters, SQL Server service not running, network timeout between appliance and SQL Server

1. 1) Query AMPKustoDB.
2. Messages with SQL agent ID filtering 'Failed to get performance data for Sql server' to identify failing instances.
3. 2) Verify RunAsAccount has VIEW SERVER STATE permission.
4. 3) Check SQL Server is accessible from appliance.
5. 4) Use ServiceActivityId to drill into detailed error logs.

`[结论: 🟢 8.5/10 — [MCVKB/Discovery (SQL).md]]`

### Phase 6: Need to escalate Azure Migrate issue to product group (PG) via ICM
> 来源: onenote

**根因分析**: Complex Azure Migrate issues that require PG investigation cannot be resolved at CSS level

1. 1) Create ICM using template: https://portal.
2. microsofticm.
3. com/imp/v3/incidents/create?tmpl=r2V1r1.
4. 2) Post message on Azure Migrate Teams Channel (PG HELP).
5. 3) Include appliance machine ID, subscription ID, agent IDs, and relevant Kusto query results in the ICM.

`[结论: 🟢 8.5/10 — [MCVKB/ICM.md]]`

### Phase 7: Azure Blueprints customers experiencing service limitations or looking for migr…
> 来源: ado-wiki

**根因分析**: Azure Blueprints is on a deprecation path and no longer receiving new feature investment

1. Migrate from Azure Blueprints to Template Specs and Deployment Stacks.
2. For active Blueprint issues, file ICM to Azure Deployments/Azure Deployments team (https://aka.
3. ms/Blueprint-ICM).
4. Blueprint assignments, definitions, artifacts, and deny assignments are still supported by the ARM/Microsoft.
5. Blueprint RP team during transition.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

### Phase 8: Customer reports issues with Azure Blueprints (assignment failures, definition …
> 来源: ado-wiki

**根因分析**: Azure Blueprints is on a deprecation path and will be phased out; customers should plan migration

1. Recommend migration to Template Specs and Deployment Stacks.
2. For active Blueprints bugs or PG escalations, file IcM via https://aka.
3. ms/Blueprint-ICM to Azure Deployments team.
4. Blueprints supports Microsoft.
5. Blueprint resource provider including assignments, definitions, artifacts, and deny assignments.

`[结论: 🔵 6.0/10 — [ADO Wiki]]`

### Phase 9: Network Fabric password rotation API not available or fails on older fabric dep…
> 来源: ado-wiki

**根因分析**: Fabrics deployed before release 9.2 require one-time migration to the new password rotation scheme (API version 2025-07-15). Legacy secrets need renaming and API field updates.

1. Run password rotation once to trigger migration.
2. Migration renames secrets and updates API fields automatically.
3. Post-migration, only new API/CLI actions (az networkfabric fabric rotate-password) are supported for password management.

`[结论: 🔵 7.5/10 — [ADO Wiki]]`

## 判断逻辑

| 条件 | 含义 | 后续动作 |
|------|------|---------|
| VMware agentless migration initial replication stuck at 'qu… | Snapshot replication cycle initiated but data transfer not … | 1) Query SRSOperationEvent in ASR Kusto (asradxclusmc.china… |
| Multiple VMware/Physical VMs with same BIOS UUID/GUID cause… | When VMs are cloned without regenerating BIOS UUID, multipl… | Use Kusto query against AMPKustoDB.Messages to identify mac… |
| Azure Migrate SQL discovery fails with 'Failed to fetch det… | SQL discovery agent cannot access SQL Server metadata due t… | 1) Identify failing SQL servers via Kusto query filtering A… |
| Azure Migrate dependency map guest data collection fails wi… | Customer-side errors (CxErrors): invalid guest credentials,… | Use Kusto query against AMPKustoDB.Messages filtering 'Depe… |
| Azure Migrate fails to collect SQL Server performance data … | SQL agent cannot collect performance counters from SQL Serv… | 1) Query AMPKustoDB.Messages with SQL agent ID filtering 'F… |
| Need to escalate Azure Migrate issue to product group (PG) … | Complex Azure Migrate issues that require PG investigation … | 1) Create ICM using template: https://portal.microsofticm.c… |
| Azure Blueprints customers experiencing service limitations… | Azure Blueprints is on a deprecation path and no longer rec… | Migrate from Azure Blueprints to Template Specs and Deploym… |
| Customer reports issues with Azure Blueprints (assignment f… | Azure Blueprints is on a deprecation path and will be phase… | Recommend migration to Template Specs and Deployment Stacks… |
| Network Fabric password rotation API not available or fails… | Fabrics deployed before release 9.2 require one-time migrat… | Run password rotation once to trigger migration. Migration … |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | VMware agentless migration initial replication stuck at 'queued' status with 0% progress. ProgressP… | Snapshot replication cycle initiated but data transfer not progressing. Common causes: Gateway work… | 1) Query SRSOperationEvent in ASR Kusto (asradxclusmc.chinanorth2.kusto.chinacloudapi.cn/ASRKustoDB… | 🟢 8.5 — onenote+21V适用 | [MCVKB/[migrate] VMware Agentless _ initial replication q.md] |
| 2 | Multiple VMware/Physical VMs with same BIOS UUID/GUID cause Azure Migrate discovery to show duplica… | When VMs are cloned without regenerating BIOS UUID, multiple machines report identical BIOSGuid to … | Use Kusto query against AMPKustoDB.Messages to identify machines sharing same BIOSGuid. Fix by rege… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (VM).md] |
| 3 | Azure Migrate SQL discovery fails with 'Failed to fetch details for sql server' error for one or mo… | SQL discovery agent cannot access SQL Server metadata due to credential issues, network problems, o… | 1) Identify failing SQL servers via Kusto query filtering AMPKustoDB.Messages for 'Failed to fetch … | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (SQL).md] |
| 4 | Azure Migrate dependency map guest data collection fails with errors like GuestCredentialNotValid, … | Customer-side errors (CxErrors): invalid guest credentials, VM powered off, VMware Tools not instal… | Use Kusto query against AMPKustoDB.Messages filtering 'Dependency Map guest data collection complet… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (Apps and Dependency).md] |
| 5 | Azure Migrate fails to collect SQL Server performance data with 'Failed to get performance data for… | SQL agent cannot collect performance counters from SQL Server instance. Common causes: insufficient… | 1) Query AMPKustoDB.Messages with SQL agent ID filtering 'Failed to get performance data for Sql se… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Discovery (SQL).md] |
| 6 | Need to escalate Azure Migrate issue to product group (PG) via ICM | Complex Azure Migrate issues that require PG investigation cannot be resolved at CSS level | 1) Create ICM using template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=r2V1r1. … | 🟢 8.5 — onenote+21V适用 | [MCVKB/ICM.md] |
| 7 | Azure Blueprints customers experiencing service limitations or looking for migration path; Blueprin… | Azure Blueprints is on a deprecation path and no longer receiving new feature investment | Migrate from Azure Blueprints to Template Specs and Deployment Stacks. For active Blueprint issues,… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 8 | Network Fabric password rotation API not available or fails on older fabric deployment. Fabric depl… | Fabrics deployed before release 9.2 require one-time migration to the new password rotation scheme … | Run password rotation once to trigger migration. Migration renames secrets and updates API fields a… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |
| 9 | Customer reports issues with Azure Blueprints (assignment failures, definition errors) or asks abou… | Azure Blueprints is on a deprecation path and will be phased out; customers should plan migration | Recommend migration to Template Specs and Deployment Stacks. For active Blueprints bugs or PG escal… | 🔵 6.0 — ado-wiki+21V适用 | [ADO Wiki] |
