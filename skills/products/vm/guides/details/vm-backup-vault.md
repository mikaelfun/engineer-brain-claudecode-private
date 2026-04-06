# VM Azure Backup 与 Recovery Services Vault — 综合排查指南

**条目数**: 11 | **草稿融合数**: 2 | **Kusto 查询融合**: 0
**来源草稿**: [onenote-azure-backup-encryption-dek-kek.md], [onenote-backup-dos-limits-investigation.md]
**Kusto 引用**: 无
**生成日期**: 2026-04-05

---

## 排查流程

### Phase 1: 确定备份失败类型
> 来源: OneNote (vm-002, vm-004, vm-006, vm-033)

收到备份失败报告后，首先根据错误信息分类：

**判断逻辑**：
| 条件 | 含义 | 后续动作 |
|------|------|---------|
| ExtensionFailedTimeoutVMNetworkUnresponsive / 503 / TLS 握手失败 | TLS 版本不兼容 | → Phase 2a |
| COM+ 错误 / ProviderNotInCommonFolder / VCRedist | 扩展依赖缺失 | → Phase 2b |
| DoS limit / 操作被阻止 / 24小时限制 | 触发 DoS 保护 | → Phase 2c |
| UserErrorGuestAgentStatusUnavailable / VMAgent 通信错误 | Guest Agent 异常 | → Phase 2d |
| Recovery Point 未清理 / 快照意外删除 | 保留策略/栈版本问题 | → Phase 2e |
| MARS 备份 warning / 文件锁定 | 文件被占用 | → Phase 2f |
| 无法注销 MARS/DPM 服务器 | 原机不存在 | → Phase 2g |
| 加密/Passphrase 问题 | 加密机制相关 | → Phase 2h |
| MARS system state 0x80070057 / SAN policy | SAN 策略错误 | → Phase 2i |

### Phase 2a: TLS 版本不兼容导致备份失败
> 来源: [MCVKB/VM+SCIM/13.1](onenote) `[vm-002]`

**症状**: Windows VM 备份在 snapshot 阶段失败，错误 `ExtensionFailedTimeoutVMNetworkUnresponsive`，extension log 中显示 `The underlying connection was closed` 和 503 HTTP errors。

**根因**: Azure Storage 要求 TLS 1.1+，但 Windows .NET 应用在 `DisableStrongCrypto` 设置下默认使用 TLS 1.0/SSL 3.0。

**修复步骤**：
1. 添加 `SchUseStrongCrypto` DWORD 值=1 到以下注册表路径：
   ```
   HKLM\SOFTWARE\Microsoft\.NETFramework\v2.0.50727
   HKLM\SOFTWARE\Microsoft\.NETFramework\v4.0.30319
   HKLM\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v2.0.50727
   HKLM\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v4.0.30319
   ```
2. 重启 VM 使注册表生效
3. 重新触发备份

`[结论: 🟢 8.5/10 — OneNote 一线经验，高置信度，明确根因和方案]`

### Phase 2b: 备份扩展依赖缺失（COM+ / VCRedist）
> 来源: [MCVKB/VM+SCIM/13.5](onenote) `[vm-004]`

**症状**: 备份失败，错误 `Extension installation failed due to a COM+ error` 或 `ProviderNotInCommonFolder StatusCode.FailedVCRedistNotInstalled`。

**排查步骤**：
1. 检查 IaaS VM provider service 是否存在
   - 不存在 → 添加所需注册表键（参考 CSS support wiki），下次备份触发时自动安装
2. 下载安装所需 VCRedist 包（https://my.visualstudio.com/Downloads?pid=1452）
3. VCRedist 安装本身失败 → 升级到 `APAC Developer DSC` 队列，提供：
   - 需要哪个 VCRedist 版本
   - 安装错误信息

`[结论: 🟢 8/10 — OneNote 实证，明确分步方案]`

### Phase 2c: DoS Limit 触发
> 来源: [MCVKB/VM+SCIM/13.7](onenote) + [onenote-backup-dos-limits-investigation.md](guides/drafts/onenote-backup-dos-limits-investigation.md) `[vm-006]`

**症状**: 操作被拦截，Portal 显示 `Operation is blocked as you have reached the limit on number of operations permitted in 24 hours`。

**DoS Limit 分类**：
| 类型 | 描述 | 处理 |
|------|------|------|
| **Soft Limit** | 操作频率限制 | 24h 自动重置 |
| **Hard Limit** | 资源数量上限（如每订阅每区域最大 RSV 数） | 等待无效，需调整架构 |

**排查步骤**：

1. **获取 ARM Correlation ID**：从 Portal 操作日志/错误详情获取 Request ID

2. **Kusto 查询 TraceLogMessage**（Mooncake MABKustoProd）：
   ```kusto
   // Cluster: mabprodmc.kusto.chinacloudapi.cn / MABKustoProd
   TraceLogMessage
   | where TIMESTAMP > datetime(YYYY/MM/DD HH:MM) and TIMESTAMP < datetime(YYYY/MM/DD HH:MM)
   | where RequestId == "<correlation_id_from_portal>"
   | project TIMESTAMP, Message, TaskId, SubscriptionId, RequestId
   ```

   仅有 SubscriptionId 时：
   ```kusto
   TraceLogMessage
   | where TIMESTAMP > ago(24h)
   | where SubscriptionId == "<subscription_id>"
   | where Message contains "DoS" or Message contains "limit"
   | project TIMESTAMP, Message, TaskId, SubscriptionId, RequestId
   ```

3. **备选：Jarvis**（Namespace: `MABRrpMds`，按 Request ID 过滤）

4. **对照 DoS Limits 文档**确认操作类型：
   - `RegionalResourceProviderCreateResource` → 硬限制（RSV 数量上限）
   - 其他频率类 → 软限制

`[结论: 🟢 8.5/10 — OneNote 经验 + 草稿融合，含完整 KQL 模板]`

### Phase 2d: Linux VM Guest Agent 异常导致备份失败
> 来源: [MCVKB/VM+SCIM/13.11](onenote) `[vm-033]`

**症状**: Linux VM 备份失败 `UserErrorGuestAgentStatusUnavailable` / `VMAgentStatusCommunicationError`，waagent 日志停止，VMSnapshotLinux extension 状态 unknown。

**根因**: waagent shebang `#!/usr/bin/env python` 在 Python 3 系统上运行出错（Python 2 API 不兼容）。

**修复步骤**：
1. 检查 waagent 脚本 shebang：
   ```bash
   cat /usr/sbin/waagent | head -1
   ```
2. 修复 shebang：
   ```bash
   cat /usr/sbin/waagent | sed 's_#!/usr/bin/env python_#!/usr/bin/env python2_' > /tmp/waagent_fixed
   cp /tmp/waagent_fixed /usr/sbin/waagent
   ```
3. 或重新安装适配当前 Python 版本的 waagent
4. Kusto 验证：
   ```kusto
   // Cluster: mabprodmcadx.chinaeast2.kusto.chinacloudapi.cn / MABKustoProd
   TraceLogMessage
   | where TIMESTAMP > ago(7d)
   | where TaskId == "<task_id>"
   | where Level <= 2  // 2=error, 1=fatal
   | project TIMESTAMP, Message, Level
   ```

`[结论: 🔵 7/10 — OneNote 单源经验，适用于旧 Linux 发行版]`

### Phase 2e: Recovery Point 保留策略 / 快照栈版本问题
> 来源: [MCVKB/VM+SCIM/13.6 + 13.4](onenote) `[vm-005, vm-007]`

**场景 1: Recovery Point 过期不清理** `[vm-005]`

当备份使用 **Retain Backup** 选项停止保护（`IsUnprotectWithRetainData=1`），GC 会**跳过所有过期 RP 的清理** — 这是设计行为。

验证 Kusto：
```kusto
// Cluster: mabprodmc.kusto.chinacloudapi.cn / MABKustoProd
BCMBackupStats
| where PreciseTimeStamp > ago(7d)
| where SubscriptionId == "<subID>"
| project PreciseTimeStamp, RecoveryPointId, IsExpired

BMSProtectionStats
| where PreciseTimeStamp > ago(7d)
| where SubscriptionId == "<subID>"
| project IsUnprotectWithRetainData
```

需手动通过 Portal 或 PowerShell 删除 RP。

**场景 2: 快照意外删除** `[vm-007]`

V1→V2 栈升级后，本地快照保留 7 天后**自动过期删除** — V1 无此行为。

验证：
```kusto
BCMBackupStats
| where PreciseTimeStamp > ago(7d)
| where SubscriptionId == "<subID>"
| project PreciseTimeStamp, StartTime, VMName, TaskId, IsInstantRPEnabled
// IsInstantRPEnabled=1 → V2 栈
```

`[结论: 🟢 8/10 — OneNote 实证，含 KQL 验证]`

### Phase 2f: MARS 备份 Warning（文件锁定）
> 来源: [MCVKB/VM+SCIM/13.2](onenote) `[vm-003]`

**症状**: MARS 备份完成但有 warning，`LastBackupFailedFiles` 包含 `C:\WindowsAzure\Logs\Plugins\Microsoft.Azure.Diagnostics.IaaSDiagnostics` 路径。

**处理**: 该文件被 VM Diagnostics 扩展持续写入导致锁定，**安全忽略**或从备份范围排除该文件夹。

`[结论: 🟢 8/10 — OneNote 实证，简单明确]`

### Phase 2g: 无法注销 MARS/DPM/MABS 服务器（原机不存在）
> 来源: [MCVKB/VM+SCIM/13.8](onenote) `[vm-034]`

**背景**: 2019-06-21 行为变更后，Portal 要求通过本地控制台删除备份项才能注销。原机已下线时无法操作。

**5 步流程**：
1. 向客户发送**同意模板邮件**（明确告知永久删除风险，需书面确认）
2. 收到确认后提 **Sev3 ICM**（模板 C19112，每个 Resource ID 单独提）
3. 等待 Backup PG **24 个工作小时**完成后端变更（ICM 含 Exception Expiry Time UTC）
4. 通知客户 **3 天操作窗口**在 Portal 注销服务器
5. 确认删除后关单

> ⚠️ 21V 适用（Mooncake 同样适用此流程）

`[结论: 🟢 8.5/10 — OneNote 流程经验，含明确时间线和 ICM 模板]`

### Phase 2h: 加密机制（DEK / KEK / Passphrase）
> 来源: [onenote-azure-backup-encryption-dek-kek.md](guides/drafts/onenote-azure-backup-encryption-dek-kek.md) `[vm-009]`

**三层密钥体系**: Passphrase → KEK → DEK → 数据

- **DEK**: Azure 为每台受保护机器自动生成唯一密钥（基于机器 GUID），加密压缩后的备份数据
- **KEK**: 用 Passphrase 加密 DEK
- **Passphrase**: 用户设定（≥16 字符），用于加密 DEK 而非直接加密数据

**常见问题**：

| 问题 | 答案 |
|------|------|
| 修改 Passphrase 后旧备份能恢复吗？ | ✅ 可以。只重新加密 DEK，不重传数据 |
| Passphrase 丢失 + 原机崩溃？ | ❌ 数据无法恢复。务必安全保存 Passphrase |

`[结论: 🟢 8/10 — OneNote 参考指南，机制说明清晰]`

### Phase 2i: MARS System State 备份失败（SAN Policy）
> 来源: [MCVKB/VM+SCIM/13.9](onenote) `[vm-035]`

**症状**: MARS system state 备份失败，warning `0x80070057 BlbutilGetPartitionInformation:: volume is not GPT for SSBStaging.vhd`。

**根因**: SAN policy 设为 `offlineall`，MARS 无法 bring online 动态创建的 VHD（SSBStaging.vhd）。

**修复**：
```cmd
diskpart
SAN                         # 查看当前策略
SAN POLICY=offlineShared    # 集群服务器
# 或
SAN POLICY=onlineAll        # 独立服务器
```

> 背景: MARS 每次 system state 备份会在 Scratch 文件夹创建 SSBS（VHD）和 SSBV（挂载点）。

`[结论: 🟢 8.5/10 — OneNote 实证，明确根因和修复]`

### Phase 3: 批量清理 — 停止备份 + 删除 Vault
> 来源: [MCVKB/VM+SCIM/13.10](onenote) `[vm-032]`

**场景**: 需要用 PowerShell 批量停止 VM 备份并删除 RSV（含 Soft Delete）。

**PowerShell 脚本**（仅限 VM 备份、无 SQL 等其他资源的 Vault）：
```powershell
# 1. 连接 Mooncake
Connect-AzAccount -Environment AzureChinaCloud

# 2. 获取 Vault
$vault = Get-AzRecoveryServicesVault -Name '<vault>'
Set-AzRecoveryServicesVaultContext -Vault $vault

# 3. 禁用 Soft Delete
Set-AzRecoveryServicesVaultProperty -VaultId $vault.Id -SoftDeleteFeatureState Disable

# 4. 停止保护并删除 RP
$Containers = Get-AzRecoveryServicesBackupContainer -ContainerType AzureVM -Status Registered
foreach ($Container in $Containers) {
    $Items = Get-AzRecoveryServicesBackupItem -Container $Container -WorkloadType AzureVM
    Disable-AzRecoveryServicesBackupProtection -Item $Items -RemoveRecoveryPoints -Force
}

# 5. 删除 Vault
Remove-AzRecoveryServicesVault -Vault $vault -Confirm
```

> ⚠️ 21V 适用（使用 `AzureChinaCloud` 环境）

`[结论: 🟢 8.5/10 — OneNote 脚本，实用且 21V 验证]`

---

## 已知问题速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ExtensionFailedTimeoutVMNetworkUnresponsive / TLS 握手失败 | TLS 1.0 默认，Storage 要求 1.1+ | 添加 SchUseStrongCrypto 注册表 | 🟢 8.5 | [MCVKB/13.1](onenote) |
| 2 | MARS 备份 warning: 文件锁定（Diagnostics 目录） | VM Diagnostics 扩展持续写入 | 安全忽略或排除该目录 | 🟢 8 | [MCVKB/13.2](onenote) |
| 3 | COM+ 错误 / VCRedist 缺失 | IaaS VM provider 或 VCRedist 缺失 | 安装 VCRedist + 添加注册表 | 🟢 8 | [MCVKB/13.5](onenote) |
| 4 | Recovery Point 过期不清理 | Retain Backup 保护阻止 GC | 手动删除 RP（设计行为） | 🟢 8 | [MCVKB/13.6](onenote) |
| 5 | DoS limit 操作被阻止 | Soft/Hard limit 触发 | Kusto 查 TraceLogMessage 确定类型 | 🟢 8.5 | [MCVKB/13.7](onenote) + 📋 |
| 6 | 快照意外删除 | V1→V2 栈升级，7 天自动过期 | 设计行为，确认 IsInstantRPEnabled | 🟢 8 | [MCVKB/13.4](onenote) |
| 7 📋 | 加密 Passphrase 问题 | DEK/KEK/Passphrase 三层体系 | 修改 Passphrase 仅重加密 DEK | 🟢 8 | [MCVKB/13.3](onenote) + 📋 |
| 8 | 批量停止备份删除 Vault | 需 PowerShell 清理含 Soft Delete | 脚本：禁用 SD → 停保护 → 删 Vault | 🟢 8.5 | [MCVKB/13.10](onenote) |
| 9 | Linux VM 备份失败: waagent Python 不兼容 | Python 2→3 shebang 问题 | 修复 shebang 为 python2 | 🔵 7 | [MCVKB/13.11](onenote) |
| 10 | 无法注销 MARS/DPM 服务器（原机不存在） | 2019 行为变更 | 5 步 ICM 流程（C19112 模板） | 🟢 8.5 | [MCVKB/13.8](onenote) |
| 11 | MARS system state 0x80070057 SAN policy | SAN offlineall 阻止 VHD 挂载 | diskpart 修改 SAN policy | 🟢 8.5 | [MCVKB/13.9](onenote) |
