# ACR ACR Tasks 与构建 — 综合排查指南

**条目数**: 8 | **草稿融合数**: 1 | **Kusto 查询融合**: 1
**来源草稿**: ado-wiki-acr-buildkit-secrets.md
**Kusto 引用**: acr-task.md
**生成日期**: 2026-04-07

---

## 排查流程

### Phase 1: ACR task run failures can be caused by various issues includ
> 来源: ADO Wiki

1. Run Kusto query on cluster('ACR').database('acrprod').BuildHostTrace filtered by Tag containing '<acr>.azurecr.io'. Check RunnerLogs tag for build errors (Message column) and RunResult tag for trigger

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 2: ACR purge runs as an ACR Task by default, which requires net
> 来源: ADO Wiki

1. Download ACR CLI binary from https://github.com/azure/acr-cli and run purge commands locally on own machine. This avoids dependency on ACR Tasks and network bypass — all operations occur within the cu

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 3: ACR temporarily paused ACR Tasks runs from subscriptions usi
> 来源: ADO Wiki

1. 1) Advise customer to upgrade to a paid subscription. 2) If customer needs access with free credits: collect info (what workloads, expected usage/load), then create ICM to ACR PG requesting access gra

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 4: CSSC (Continuous Patching) workflows are not supported on re
> 来源: ADO Wiki

1. Switch to Artifact sync based cache rules, or run CSSC workflow on a different repository that does not contain PTC based rules.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 5: The Copa tooling image required for patching is not availabl
> 来源: ADO Wiki

1. Contact upstream team (azcu-publishing@microsoft.com) or raise a PR on GitHub (microsoft/mcr repo, example: PR#3914) to publish the missing tooling image to MCR.

`[结论: 🟢 8.0/10 — ADO Wiki]`

### Phase 6: ACR Task requires system-assigned managed identity and trust
> 来源: OneNote

1. 1) Enable 'Allow trusted Microsoft services to access this container registry' on the ACR. 2) Create ACR task with --assign-identity (system-assigned MI). 3) Assign acrpush role to the system MI on th

`[结论: 🟢 8.5/10 — OneNote]`

### Phase 7: Feature gap — ACR Task agent pools have not been deployed to
> 来源: OneNote

1. No workaround currently available. Inform customer this is a known Mooncake limitation. Track via ICM-570372647.

`[结论: 🟢 9.0/10 — OneNote]`

### Phase 8: Images stored as tar archives in blob storage need a multi-s
> 来源: OneNote

1. Use ACR Task with multi-step YAML: 1) curl to download tar from blob (with SAS token or MI token). 2) docker load from tar. 3) docker tag to target ACR repo. 4) push to ACR. Two variants: a) SAS-based

`[结论: 🟢 8.5/10 — OneNote]`

### Kusto 查询模板

#### acr-task.md
`[工具: Kusto skill — acr-task.md]`

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(3d)
| where Tag contains "{registry}.azurecr.cn"
| order by env_time
| project env_time, Message, Tag, DataJson, SourceNamespace
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(1d)
| where Tag contains "{registry}.azurecr.cn_{runId}"
| order by env_time
| project env_time, Level, Component, Message, Exception, DataJson
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains "{registry}.azurecr.cn"
| where isnotempty(Exception) or Level >= 3
| project env_time, Tag, Level, Component, Message, Exception
| order by env_time desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains ".azurecr.cn"
| extend Registry = extract(@"^([^_]+)", 1, Tag)
| extend RunId = extract(@"_(.+)$", 1, Tag)
| summarize 
    FirstLog = min(env_time),
    LastLog = max(env_time),
    LogCount = count(),
    HasError = countif(isnotempty(Exception)) > 0
  by Registry, RunId
| extend Duration = LastLog - FirstLog
| order by FirstLog desc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(1d)
| where Tag == "{registry}.azurecr.cn_{runId}"
| extend DataParsed = parse_json(DataJson)
| project env_time, Level, Component, Message, 
         Step = tostring(DataParsed.step),
         Status = tostring(DataParsed.status),
         Duration = tostring(DataParsed.duration)
| order by env_time asc
```

```kusto
cluster('https://acrmc2.chinaeast2.kusto.chinacloudapi.cn').database('acrprodmc').BuildHostTrace
| where env_time > ago(7d)
| where Tag contains "{registry}.azurecr.cn"
| where isnotempty(Exception)
| extend RunId = extract(@"_(.+)$", 1, Tag)
| summarize 
    ErrorTime = max(env_time),
    ErrorMessage = take_any(Message),
    ExceptionSummary = take_any(substring(Exception, 0, 200))
  by RunId
| order by ErrorTime desc
| take 20
```


---

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ACR tasks not being triggered or failing to complete with no | ACR task run failures can | → Phase 1 |
| Customer needs to purge/clean up ACR images but cannot use A | ACR purge runs as an | → Phase 2 |
| ACR Tasks fail with error: 'ACR Tasks requests for the regis | ACR temporarily paused ACR Tasks | → Phase 3 |
| ACR Continuous Patching cssc-patch-image task fails at push- | CSSC (Continuous Patching) workflows are | → Phase 4 |
| ACR Continuous Patching cssc-patch-image task fails with 'im | The Copa tooling image required | → Phase 5 |
| ACR Task fails to run when the registry has public access di | ACR Task requires system-assigned manage | → Phase 6 |
| Customer wants to use ACR Task dedicated agent pools in Moon | Feature gap — ACR Task | → Phase 7 |
| Need to import container images from Azure Blob Storage into | Images stored as tar archives | → Phase 8 |

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR tasks not being triggered or failing to complete with no actionable output | ACR task run failures can be caused by various issues including build configurat | Run Kusto query on cluster('ACR').database('acrprod').BuildHostTrace filtered by | 🟢 8.0 | ADO Wiki |
| 2 | Customer needs to purge/clean up ACR images but cannot use ACR Tasks due to netw | ACR purge runs as an ACR Task by default, which requires network bypass if the r | Download ACR CLI binary from https://github.com/azure/acr-cli and run purge comm | 🟢 8.0 | ADO Wiki |
| 3 | ACR Tasks fail with error: 'ACR Tasks requests for the registry {registryName} a | ACR temporarily paused ACR Tasks runs from subscriptions using Azure trial/free  | 1) Advise customer to upgrade to a paid subscription. 2) If customer needs acces | 🟢 8.0 | ADO Wiki |
| 4 | ACR Continuous Patching cssc-patch-image task fails at push-image step with cach | CSSC (Continuous Patching) workflows are not supported on repositories that cont | Switch to Artifact sync based cache rules, or run CSSC workflow on a different r | 🟢 8.0 | ADO Wiki |
| 5 | ACR Continuous Patching cssc-patch-image task fails with 'image not found in MCR | The Copa tooling image required for patching is not available in Microsoft Conta | Contact upstream team (azcu-publishing@microsoft.com) or raise a PR on GitHub (m | 🟢 8.0 | ADO Wiki |
| 6 | ACR Task fails to run when the registry has public access disabled (network-rest | ACR Task requires system-assigned managed identity and trusted service configura | 1) Enable 'Allow trusted Microsoft services to access this container registry' o | 🟢 8.5 | OneNote |
| 7 | Customer wants to use ACR Task dedicated agent pools in Mooncake (Azure China) | Feature gap — ACR Task agent pools have not been deployed to Mooncake Cloud | No workaround currently available. Inform customer this is a known Mooncake limi | 🟢 9.0 | OneNote |
| 8 | Need to import container images from Azure Blob Storage into ACR (no direct dock | Images stored as tar archives in blob storage need a multi-step import process v | Use ACR Task with multi-step YAML: 1) curl to download tar from blob (with SAS t | 🟢 8.5 | OneNote |
