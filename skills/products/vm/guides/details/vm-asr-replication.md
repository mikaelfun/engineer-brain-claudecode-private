# VM ASR 复制、Mobility Service 与诊断 — 综合排查指南

**条目数**: 13 | **草稿融合数**: 4 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-asr-cs-database-local-inspection.md], [onenote-asr-mobility-push-install-tsg.md], [onenote-asr-srsshoeboxevent-kusto-reference.md], [onenote-asr-v2a-multiple-issues-guide.md]
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 问题分类与快速定位
> 来源: [onenote-asr-v2a-multiple-issues-guide.md] + [vm-027]

收到 ASR 问题后，按以下分类进入对应排查路径：

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| 初始复制卡 0% / 复制进度停滞 | 复制传输问题 | → Phase 2a |
| Configuration Server 显示未连接 | CS 通信中断 | → Phase 2b |
| AADSTS700027 / 证书签名错误 | CS 证书过期 | → Phase 2c |
| Mobility Service push install 失败 | 推送安装前置条件不满足 | → Phase 2d |
| RPO 显示异常 / RP 时间不一致 | RPO 计算或上报异常 | → Phase 2e |
| 复制性能差 / churn rate 过高 | 磁盘写入速率超标 | → Phase 2f |
| Version mismatch / 升级后 Portal 版本不更新 | Mobility Service 版本问题 | → Phase 2g |
| Mooncake 特有问题（Kusto 端点/权限/managed disk） | 21V 环境特异 | → Phase 2h |
| 需要深度排查 CS 数据库 | V2A 数据差异分析 | → Phase 3 |
| SLES 11 SP4 CA 证书缺失 | 老旧 Linux 发行版 | → Phase 2i |
| 分区数超限 (error 18090) | Gen2 VM 分区限制 | → Phase 2j |

### Phase 2a: 初始复制卡 0% — 排查传输与限流
> 来源: [onenote-asr-v2a-multiple-issues-guide.md] `[vm-027]`

**快速确认限流**：
- Portal → Infrastructure View → 检查每个磁盘的 Data Sync
- Process Server 列显示 "8GB" → 发生了 **Throttling**

**日志收集**：
| 位置 | 日志路径 |
|------|---------|
| 源机 (agent) | `C:\Program Files (x86)\Microsoft Azure Site Recovery\agent\S2_curr_xx` |
| 源机 (resync) | `...\agent\vxlogs\resync\{xxx}\1\C\xxx\xxx\dataprotection` |
| CS/PS (cbengine) | `C:\Program Files\Microsoft Azure Recovery Services Agent\Temp\CBEngine_curr` |
| CS/PS (volsync) | `...\home\svsystems\var\volsync` |
| CS (api report) | `...\home\svsystems\var\Asrapi_reporting.log` |
| PS (cxps) | `...\home\svsystems\transport\log\cxps_xxx` |

**参考**: https://docs.microsoft.com/en-us/azure/site-recovery/vmware-physical-azure-troubleshoot-process-server

**Kusto 辅助验证**（取最新复制状态）：
```kusto
// Cluster: asrclusmc.kusto.chinacloudapi.cn / ASRKustoDB
let subscriptionId = "<YOUR_SUBSCRIPTION_ID>";
SRSShoeboxEvent
| where PreciseTimeStamp between (ago(5d) .. now())
| where category == "AzureSiteRecoveryReplicatedItems" and resourceId has subscriptionId
| extend parsedProperties = parsejson(properties)
| summarize arg_max(PreciseTimeStamp, *) by tostring(parsedProperties.correlationId)
| project
    PreciseTimeStamp,
    VMName                              = toupper(tostring(parsedProperties.name)),
    ProtectionState                     = tostring(parsedProperties.protectionState),
    ReplicationHealth                   = tostring(parsedProperties.replicationHealth),
    ReplicationhealthErrors             = tostring(parsedProperties.replicationHealthErrors),
    InitialReplicationProgressPercentage = tostring(parsedProperties.initialReplicationProgressPercentage),
    RPO                                 = tostring(parsedProperties.rpoInSeconds),
    ProcessServer                       = tostring(parsedProperties.processServerName),
    AgentLastHeartbeat                  = tostring(parsedProperties.lastHeartbeat)
| sort by PreciseTimeStamp desc
```
`[工具: Kusto skill — onenote-asr-srsshoeboxevent-kusto-reference.md]`

> 关键列说明：`InitialReplicationProgressPercentage` 卡 0% 时重点看；`RPO` 单位秒（目标 ≤900 秒）；`ReplicationhealthErrors` 健康错误详情。

`[结论: 🔵 7.5/10 — OneNote 多源融合，含日志路径和 KQL]`

### Phase 2b: Configuration Server 显示未连接
> 来源: [onenote-asr-v2a-multiple-issues-guide.md] `[vm-027]`

**排查顺序**：
1. Portal 刷新 CS Server
2. 检查关键服务是否运行
3. 检查证书是否过期（→ Phase 2c）
4. 网络检查：
   - CS 需 TCP 443；PS 需 TCP 9443
   ```powershell
   Test-NetConnection asrlandray.blob.core.chinacloudapi.cn -Port 443
   ```
   - 检查代理设置（系统账户 IE / Backup proxy）
   - 抓包分析：重启服务后重试

`[结论: 🔵 7/10 — OneNote 排查清单，覆盖主要检查点]`

### Phase 2c: CS 证书过期（AADSTS700027）
> 来源: [onenote-asr-v2a-multiple-issues-guide.md] `[vm-027]`

**错误日志特征**：
```
AADSTS700027: Client assertion contains an invalid signature.
[Reason - The key used is expired., Thumbprint of key used by client: 'D9A7EBC6...',
Found key 'Start=01/22/2018 09:13:33, End=01/23/2021 09:13:33']
```

**修复步骤**：
1. Azure Portal 中为 CS **续签证书**
2. 下载注册密钥
3. 在 CS 上运行重新注册：
   ```cmd
   %ProgramData%\ASR\home\svsystems\bin\cspsconfigtool.exe
   ```
4. 删除旧证书
5. 若有 Scale-out PS → 在 PS 上运行：
   ```cmd
   cdpcli.exe --registermt
   ```

`[结论: 🟢 8/10 — OneNote 实证，含完整命令路径]`

### Phase 2d: Mobility Service Push Install 失败
> 来源: [onenote-asr-mobility-push-install-tsg.md] `[vm-026]`

#### Windows 前置条件

| # | 检查项 | 要求 |
|---|--------|------|
| 1 | PS 互联网访问 | 签名验证需要 |
| 2 | 源机开机 + PS 可凭据访问 | 网络可达 |
| 3 | 防火墙例外 | WMI + File and Printer Sharing |
| 4 | 推送账户权限 | 本地 Administrators 组成员 |
| 5 | Remote UAC | 本地账户推送时必须**禁用** |

**禁用 Remote UAC（注册表）**：
```
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System
DWORD: LocalAccountTokenFilterPolicy = 1
```

**推送账户兼容性矩阵**：
| 机器类型 | 推送账户 | 额外要求 |
|---------|---------|---------|
| 域加入 | 默认域 Administrator | 防火墙 GPO |
| 域加入 | 域用户（本地 Admin 组） | 防火墙 GPO |
| 域加入 | 默认本地 Administrator | 防火墙 GPO |
| 域加入 | 本地用户（本地 Admin 组） | 防火墙 GPO + 禁用 Remote UAC |
| 工作组 | 默认本地 Administrator | 防火墙设置 |
| 工作组 | 本地用户（本地 Admin 组） | 防火墙设置 + 禁用 Remote UAC |

#### Linux 前置条件

| # | 检查项 | 要求 |
|---|--------|------|
| 1 | root 凭据 | 必须 |
| 2 | openssh/openssl 包 | 最新版本 |
| 3 | SSH 端口 22 | 必须开放 |
| 4 | sshd_config | `PasswordAuthentication yes` + 取消 sftp 注释 |
| 5 | sshd 服务 | 重启生效 |

#### 故障验证步骤

**Windows — WMI 连接测试**：
1. PS 上运行 `wbemtest.exe`
2. Namespace: `\\<source-ip>\root\cimv2`
3. Authentication level: **Packet privacy**
4. 失败 → WMI/Remote Administration 防火墙未允许

**Windows — 文件共享测试**：
```
\\<source-machine-ip>\C$
```
无法访问 → 检查 File and Printer Sharing 防火墙例外

> ⚠️ **关键**: PS 必须能访问源机器 C 盘 (`\\<source>\C$`) 来复制推送安装文件（此要求未更新到外部文档）

**Linux — SSH 测试**：PuTTY 测试连接 port 22

`[结论: 🟢 8.5/10 — OneNote TSG 经验，含完整矩阵和验证步骤]`

### Phase 2e: RPO 显示异常
> 来源: [onenote-asr-v2a-multiple-issues-guide.md] `[vm-027]`

**情况 1: "Latest Recovery Point" 比 "Current RPO" 新很多**
→ 收集以下日志给 PG：
- CS: `Asrapi_reporting.log`
- 源机: `cdpcli.exe –showreplicationpairs > pairs.txt`
- Portal Network Trace: F12 → Network → 重进 Overview → .har

**情况 2: "Latest Recovery Point" 比 "Current RPO" 旧很多**
→ 手动触发 crash consistent recovery point：
```cmd
"C:\Program Files (x86)\Microsoft Azure Site Recovery\agent\vacp" -systemlevel -cc
```
提供命令输出截图 + `svagents*.log`

`[结论: 🔵 7/10 — OneNote 经验，需升级 PG 协助]`

### Phase 2f: 复制性能 — 磁盘 Churn Rate 分析
> 来源: [MCVKB/12.7](onenote) `[vm-063]`

> ⚠️ Mooncake ASR Kusto 无 `GetDsHealth()` 函数，需手动查询。

**3 步 Kusto 分析**（Cluster: mabprodmc.kusto.chinacloudapi.cn / MABKustoProd）：

**Step 1: 获取 DataSourceId**
```kusto
TelemetryPEToProvider
| where PreciseTimeStamp > ago(7d)
| where SubscriptionId == "<sub>"
| project DataSourceId, VmName, OsType, ProtectedDiskCount
```

**Step 2: 每磁盘 Churn Rate**
```kusto
HvrApplySyncSessionStats
| where PreciseTimeStamp > ago(7d)
| where DataSourceId == "<datasource_id>"
| summarize
    LastRPO = max(RPOInSeconds),
    SourceChurnRateMBps = sum(DiffBlobSizeKB/1024) / max(UploadDurationInSeconds),
    AvgSourceIOPS = avg(SourceIOPS),
    CompressionRatio = avg(CompressionRatio),
    TotalDataSizeUploadedMB = sum(DataSizeUploadedInKB/1024)
  by VhdStorageAccountType, DiskId
```

**Step 3: 每小时时间线**
→ `join IncomingDataMB + ProcessedDataMB by bin(PreciseTimeStamp, 1h) | render timechart`

**判断**：如果 Standard storage churn 持续超标 → 建议客户升级到 Premium storage。

`[结论: 🟢 8/10 — OneNote 实证，含完整 KQL 多步查询]`

### Phase 2g: Mobility Service 版本不更新
> 来源: [MCVKB/1.8](onenote) `[vm-011]`

**症状**: Portal 显示旧版本（如 9.15.2），但源 VM 上已升级成功（如 9.18.2）。

**根因**: 升级退出码 209 (EP0903) = 升级成功但**需要重启**。

**解决**: 重启源 VM 即可。退出码 209 / EP0903 是正常的 pending-restart 标识。

`[结论: 🔵 6.5/10 — OneNote 单源，简单场景]`

### Phase 2h: Mooncake 特有问题
> 来源: [MCVKB/12.3, 12.5, 12.6](onenote) `[vm-059, vm-061, vm-062, vm-064]`

**ASR Kusto 端点 (Mooncake)**：
| 端点 | 用途 |
|------|------|
| `asrclusmc.kusto.chinacloudapi.cn:443` | SRS 数据 (旧) |
| `mabprodmc.kusto.chinacloudapi.cn:443` | MAB 数据 |
| `asradxclusmc.chinanorth2.kusto.chinacloudapi.cn` | SRS 数据 (新, 2022-08+) |

**权限申请**: MyAccess → 搜索 Project 13982 (DRS_MDS_ROAccess) → Add

**Managed Disk 选项** `[vm-062, vm-064]`：
- Mooncake ASR Portal 曾缺失 managed disk 选项（ICM 69531690）→ PG 已修复
- 仅适用于 on-prem → Azure 场景（physical/Hyper-V/VMware），且 replication item 在 Protected 状态
- A2A 场景不适用（managed 保持 managed，unmanaged 保持 unmanaged）

`[结论: 🔵 7/10 — OneNote 多条目，Mooncake 专属信息]`

### Phase 2i: SLES 11 SP4 CA 证书缺失
> 来源: [MCVKB/12.2](onenote) `[vm-057]`

**症状**: SLES 11 SP4 启用 ASR A2A 复制失败，curl error 60，AzureRcmCli.log 报 RegisterMachine error 20498。

**修复**：
1. 检查 `/etc/ssl/certs` 中缺失的 CA 证书
2. 下载缺失证书：
   - `VeriSign_Class_3_Public_Primary_Certification_Authority_G5.pem`
   - `Baltimore_CyberTrust_Root.pem`
   - `DigiCert_Global_Root_CA.pem`
3. 运行 `c_rehash` 重建 hash symlinks
4. 手动创建 hash copies：VeriSign→b204d74a.0, Baltimore→653b494a.0, DigiCert→3513523f.0
5. 禁用并移除复制项 → 重新启用

> ⚠️ 21V 适用，仅 SLES 11 SP4 需要此 workaround

`[结论: 🟢 8/10 — OneNote 实证，含 MS Learn 参考文档交叉验证]`

### Phase 2j: Gen2 VM 分区数超限
> 来源: [MCVKB/12.8](onenote) `[vm-065]`

**症状**: Hyper-V → Azure 复制失败，error 18090 / 80790033: 分区数超限。

**根因**: Gen2 VM (UEFI/GPT) ASR 仅支持 OS 磁盘上 1-2 个数据卷。

**解决**: 合并或重新格式化卷至 ≤2 个数据卷。参考 [Hyper-V to Azure support matrix](https://docs.azure.cn/zh-cn/site-recovery/hyper-v-azure-support-matrix#azure-vm-requirements)。

`[结论: 🟢 8/10 — OneNote 实证，明确限制]`

### Phase 3: 深度排查 — CS MySQL 数据库本地检查
> 来源: [onenote-asr-cs-database-local-inspection.md] `[vm-025]`

**适用场景**: 需要比较 CS 本地数据库与云端 SRS 数据库数据差异（如重复注册条目、进程服务器映射错误）。

#### Step 1: 获取 CS 数据库备份
从客户 SDP 日志 zip 中提取：
```
ASR-Home-Svsystems-Files.zip\cs_db_backup\<latest>.sql
```

#### Step 2: 本地 MySQL 导入
```sql
CREATE DATABASE svsdb1;
USE svsdb1;
SOURCE <path-to-sql-file>;   -- 约需 1 小时
SHOW TABLES;
```

#### Step 3: 常用查询
```sql
-- 列出所有进程服务器
SELECT h.id, h.name, h.ipaddress
FROM hosts h, processserver ps
WHERE ps.processserverid = h.id;

-- 查找受保护 VM
SELECT id, name, ipaddress FROM hosts WHERE name LIKE '%<VM_NAME>%';

-- 查找 VM 对应的进程服务器
SELECT sourcehostid, processserverid
FROM srclogicalvolumedestlogicalvolume
WHERE sourcehostid = '<HOST_ID>';
```

#### Step 4: 对应云端 Kusto 查询
```kusto
// Cluster: asradxclusmc.chinanorth2.kusto.chinacloudapi.cn / ASRKustoDB
-- 获取 Vault Resource ID
TelemetryPerVaultInfo
| where PreciseTimeStamp > ago(1d)
| where SubscriptionId == "<sub>" and VaultArmId contains "<vault-name>"
| distinct ResourceId, VaultArmId

-- 从 ResourceId 获取受保护 VM 列表
TelemetryPEToProvider
| where PreciseTimeStamp > ago(1d)
| where SubscriptionId == "<sub>" and ResourceId == "<resource-id>"
| distinct VmId, VmName, HostId

-- 全部受保护 VM
SRSShoeboxEvent
| where PreciseTimeStamp > ago(6h)
| where category == "AzureSiteRecoveryReplicatedItems"
| where resourceId contains "<sub>" and resourceId contains "<VAULT-NAME>"
| extend Json = parse_json(properties)
| extend hostid = tostring(Json.id), VMname = tostring(Json.name), processServerName = tostring(Json.processServerName)
| distinct VMname, processServerName, hostid
| sort by hostid asc
```

> ⚠️ CS 本地数据库使用 `hostID`，SRS 云数据库使用 `infrastructureVMID`，两者 1:1 映射。

#### Step 5: 清理
```sql
DROP DATABASE svsdb1;
```
然后卸载 MySQL，删除 `C:\ProgramData\MySQL\MySQL Server 8.0\Data`。

`[结论: 🟢 8.5/10 — OneNote 深度排查经验，CS↔SRS 数据对比方法论完整]`

### Phase 4: Kusto 标准诊断查询参考
> 来源: [onenote-asr-srsshoeboxevent-kusto-reference.md] `[vm-024, vm-060]`

**SRSShoeboxEvent 标准查询**（Cluster: `asrclusmc.kusto.chinacloudapi.cn` / `ASRKustoDB`）：

完整查询模板见 Phase 2a。

**其他常用查询模式** `[vm-060]`：

**1. 最近操作历史**：
```kusto
SRSOperationEvent
| where SubscriptionId == "<sub>"
| top 20 by TIMESTAMP desc
| project TIMESTAMP, ClientRequestId, ActivityId, ScenarioName, Message, State, StampName
```

**2. Job 详情（按 Job ID）**：
```kusto
SRSDataEvent
| where ClientRequestId == "<jobId>"
| top 1000 by TIMESTAMP desc
| project TIMESTAMP, Message
// 过滤 Level<4 (3=warn, 2=error, 1=fatal)
// 或用 SRSErrorEvent
```

**3. VMM 注册信息**：
```kusto
TelemetryPerVMMInfo
| where SubscriptionId == "<sub>"
| distinct VMMId, VMMName
```

**4. VM 保护遥测**：
```kusto
TelemetryPEToProvider
| where SubscriptionId == "<sub>"
| extend VmInfo = parse_json(JsonSerializedAvmdInfo)
| project VmName = tostring(VmInfo.VmName), IsManagedDiskVm = tostring(VmInfo.IsManagedDiskVm)
```

`[结论: 🟢 8/10 — OneNote 参考查询集，覆盖主要诊断场景]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Mobility Service 升级后 Portal 版本不更新 | 退出码 209 需重启 | 重启源 VM | 🔵 6.5 | [MCVKB/1.8](onenote) |
| 2 📋 | SRSShoeboxEvent 诊断查询需求 | — | 标准 KQL 模板 | 🟢 8 | [MCVKB/12.10](onenote) + 📋 |
| 3 📋 | CS 数据库本地检查需求 | — | MySQL 导入 + SQL 查询 | 🟢 8.5 | [MCVKB/12.17](onenote) + 📋 |
| 4 📋 | Push install 失败排查 | 前置条件不满足 | WMI/SSH 验证矩阵 | 🟢 8.5 | [MCVKB/12.19](onenote) + 📋 |
| 5 📋 | V2A 多重问题（0%/CS 断连/证书/RPO） | 多因复合 | 分场景排查流程 | 🔵 7.5 | [MCVKB/12.18](onenote) + 📋 |
| 6 | SLES 11 SP4 A2A 复制失败 curl error 60 | CA 证书缺失 | 下载证书 + c_rehash | 🟢 8 | [MCVKB/12.2](onenote) |
| 7 | ASR Kusto 端点信息 | — | 3 个 Mooncake 端点 | 🟢 8 | [MCVKB/12.3](onenote) |
| 8 | Kusto 标准查询（操作/Job/VMM/PE） | — | 4 种查询模式 | 🟢 8 | [MCVKB/12.4](onenote) |
| 9 | Kusto 权限申请 | MyAccess 13982 | 搜索 → Add | 🔵 6.5 | [MCVKB/12.5](onenote) |
| 10 | Mooncake managed disk 选项缺失 | ICM 69531690 已修复 | PG 已修复 | 🔵 6.5 | [MCVKB/12.6](onenote) |
| 11 | 磁盘 churn rate 分析 | 写入速率超标 | 3 步 KQL 分析 | 🟢 8 | [MCVKB/12.7](onenote) |
| 12 | Mooncake managed disk（重复确认） | 同 #10 | PG 已修复 | 🔵 6 | [MCVKB/12.6](onenote) |
| 13 | Hyper-V Gen2 分区数超限 error 18090 | Gen2 仅支持 1-2 数据卷 | 合并卷 | 🟢 8 | [MCVKB/12.8](onenote) |
