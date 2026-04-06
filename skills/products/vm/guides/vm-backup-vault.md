# VM Azure Backup 与 Recovery Services Vault — 排查速查

**来源数**: 11 | **21V**: 部分
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Windows VM backup fails: ExtensionFailedTimeoutVMNetworkUnresponsive, 503 HTTP to Storage | TLS 版本不匹配：Storage 要求 TLS 1.1+，但 .NET 默认 TLS 1.0 | 添加 SchUseStrongCrypto DWORD=1 到 .NET Framework 注册表路径 | 🟢 8 — OneNote 单源+实证 | [MCVKB/13.1](MCVKB/VM+SCIM/======= 13. Backup=======/13.1 [Backup][WinVM][Error Code -ExtensionFailedTi.md) |
| 2 | MARS backup job 完成但带 warning: 诊断扩展日志文件被锁 | WindowsAzure Diagnostics 扩展持续写入日志，文件被锁 | 安全忽略该 warning 或排除该文件夹 | 🟢 8 — OneNote 单源+实证 | [MCVKB/13.2](MCVKB/VM+SCIM/======= 13. Backup=======/13.2 [Backup]Files and Folders backup job successf.md) |
| 3 | VM backup fails: COM+ error 或 FailedVCRedistNotInstalled | IaaS VM Provider 缺失 / VCRedist 未安装 | 添加 IaaS VM Provider 注册表 + 安装 VCRedist | 🟢 8 — OneNote 单源+实证 | [MCVKB/13.5](MCVKB/VM+SCIM/======= 13. Backup=======/13.5 [backup] Azure VM backup issue with COM+ erro.md) |
| 4 | Recovery points 过期后不删除，持续残留 | 停止备份时选了"保留数据"(IsUnprotectWithRetainData=1)，GC 跳过清理 | By design。Kusto 查 BCMBackupStats / BMSProtectionStats 确认，需手动删除 | 🟢 8 — OneNote+Kusto 验证 | [MCVKB/13.6](MCVKB/VM+SCIM/======= 13. Backup=======/13.6 [backup] recovery points won't be cleaned if.md) |
| 5 📋 | Backup/Site Recovery 操作被 DoS 限制阻断 | 触发 DoS 软限制(24h 重置)或硬限制(Vault 数上限) | Kusto MABKustoProd 查 TraceLogMessage，按 ARM correlation ID 排查 | 🔵 7 — OneNote+含融合指南 | [MCVKB/13.7](MCVKB/VM+SCIM/======= 13. Backup=======/13.7 Understanding DoS limits in Backup and Site R.md) |
| 6 | VM backup snapshot 被意外删除，客户未操作 | 订阅从 V1 升级到 V2，V2 本地快照 7 天后自动过期 | Kusto 查 BCMBackupStats.IsInstantRPEnabled 确认 V2，属预期行为 | 🟢 8 — OneNote+Kusto 验证 | [MCVKB/13.4](MCVKB/VM+SCIM/======= 13. Backup=======/13.4 [backup]how to check if the azure VM backup i.md) |
| 7 📋 | Backup 加密机制疑问：DEK/KEK/密码短语关系 | — | DEK 加密数据，KEK(密码短语)加密 DEK；改密码不重加密全部数据 | 🟢 8 — OneNote+含融合指南 | [MCVKB/13.3](MCVKB/VM+SCIM/======= 13. Backup=======/13.3 [Backup]How Azure Backup Encryption works.md) |
| 8 | PowerShell 批量停止 VM 备份并删除 Vault（含 Soft Delete） | — | Connect-AzAccount → 禁用 SoftDelete → foreach 容器 Disable-Protection → Remove-Vault | 🟢 8.5 — OneNote+21V 明确 | [MCVKB/13.10](MCVKB/VM+SCIM/======= 13. Backup=======/13.10 Stop VM Backup & Delete Vault with Powershel.md) |
| 9 | Linux VM backup 失败: UserErrorGuestAgentStatusUnavailable, waagent 日志停止 | waagent shebang 为 python 但系统已升级 Python 3，导致不兼容 | 修改 shebang 为 python2 或重装 waagent | 🔵 7 — OneNote 单源+21V 明确 | [MCVKB/13.11](MCVKB/VM+SCIM/======= 13. Backup=======/13.11[VM]Python2和Python3.md) |
| 10 📋 | 无法注销 MARS/DPM/MABS 服务器（原始服务器已不存在） | 2019-06-21 行为变更：Portal 要求本地删除备份项后才能注销 | 5 步流程：同意邮件→ICM→PG 变更→客户操作→确认 | 🟢 8.5 — OneNote+含融合指南+21V | [MCVKB/13.8](MCVKB/VM+SCIM/======= 13. Backup=======/13.8 [VM] Behavior change of _Delete a protected-s.md) |
| 11 | MARS system state backup 失败: Hr 0x80070057, SSBStaging.vhd GPT 错误 | SAN policy 设为 offlineall，MARS 无法挂载动态 VHD | diskpart 修改 SAN POLICY 为 offlineShared 或 onlineAll | 🟢 8.5 — OneNote 单源+实证+21V | [MCVKB/13.9](MCVKB/VM+SCIM/======= 13. Backup=======/13.9 [MCVKB][VM] Check SAN policy when using MARS.md) |

## 快速排查路径
1. **确认错误类型** → Extension 失败 / MARS 失败 / 操作限流 / 快照问题 `[来源: OneNote]`
2. **Extension 类** → 检查 TLS (SchUseStrongCrypto)、COM+/VCRedist、waagent 版本 `[来源: OneNote]`
3. **Vault/RP 类** → Kusto BCMBackupStats 查 IsInstantRPEnabled、IsUnprotectWithRetainData `[来源: OneNote]`
4. **限流类** → Kusto MABKustoProd TraceLogMessage 按 ARM Correlation ID 查操作类型 `[来源: OneNote]`
5. **MARS 类** → 检查 SAN policy、Python 版本、服务器注销流程 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-backup-vault.md#排查流程)
