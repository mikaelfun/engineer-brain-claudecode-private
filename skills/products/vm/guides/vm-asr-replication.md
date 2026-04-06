# VM ASR 复制、Mobility Service 与诊断 — 排查速查

**来源数**: 13 | **21V**: 部分
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Mobility service 升级后 Portal 仍显示旧版本 | 升级 exit code 209 (EP0903)：成功但需重启 | 重启源 VM，Portal 自动刷新版本 | 🔵 6.5 — OneNote 单源 | [MCVKB/1.8](MCVKB/VM+SCIM/=====1. Process=======/1.8 [Process]PG engage process for ABRS.md) |
| 2 📋 | 需要 ASR Kusto 查 replication item 全量诊断信息 | — | SRSShoeboxEvent arg_max 查最新状态，asrclusmc 集群 | 🔵 7 — OneNote+含融合指南 | [MCVKB/12.10](MCVKB/VM+SCIM/=======12. ASR=======/12.10 [ASR]SRSShoeBoxEvent.md) |
| 3 📋 | 需要本地检查 CS MySQL 数据库（SDP 日志导入） | — | 从 SDP 提取 cs_db_backup → 本地 MySQL 导入 svsdb1 → 标准查询 | 🟢 8 — OneNote+含融合指南 | [MCVKB/12.17](MCVKB/VM+SCIM/=======12. ASR=======/12.17 How to inspect customer CS database locally.md) |
| 4 📋 | Mobility Service push installation 失败 | — | Windows: WMI/文件共享防火墙+Admin+禁用 Remote UAC；Linux: root+SSH+SFTP | 🟢 8 — OneNote+含融合指南 | [MCVKB/12.19](MCVKB/VM+SCIM/=======12. ASR=======/12.19 [ASR] TSG for push installation of mobility.md) |
| 5 📋 | V2A 多个并发问题：0% replication + CS 断连 + 证书过期 + RPO 不准 | — | 各问题独立排查：throttling/cbengine 日志/证书更新/vacp 命令 | 🔵 7 — OneNote+含融合指南 | [MCVKB/12.18](MCVKB/VM+SCIM/=======12. ASR=======/12.18 [V2A] Multiple Issues.md) |
| 6 | SLES 11 SP4 enable A2A replication 失败: curl error 60 证书验证失败 | /etc/ssl/certs 缺少 VeriSign/Baltimore/DigiCert 根 CA 证书 | 下载缺失 CA → c_rehash → 手动创建 hash 链接 → 重新启用 | 🟢 8.5 — OneNote 单源+实证+21V | [MCVKB/12.2](MCVKB/VM+SCIM/=======12. ASR=======/12.2 SLES 11 SP4 VM cannot enable ASR A2A replicat.md) |
| 7 | ASR Kusto Mooncake 连接端点查询 | — | asrclusmc / mabprodmc / asradxclusmc (2022 新增)，权限项目 13982 | 🟢 8.5 — OneNote+21V 明确 | [MCVKB/12.3](MCVKB/VM+SCIM/=======12. ASR=======/12.3 [Kusto] asr kusto connect string.md) |
| 8 | ASR Kusto 查询模式：操作历史/Job 详情/VMM/VM 保护遥测 | — | SRSOperationEvent / SRSDataEvent / TelemetryPerVMMInfo / TelemetryPEToProvider | 🟢 8.5 — OneNote+21V 明确 | [MCVKB/12.4](MCVKB/VM+SCIM/=======12. ASR=======/12.4 [Kusto] asr kusto connect string.md) |
| 9 | ASR Kusto 权限申请从 RAMWeb 迁移到 MyAccess | — | MyAccess 搜索项目 13982，提交申请 | 🔵 6 — OneNote 单源+21V | [MCVKB/12.5](MCVKB/VM+SCIM/=======12. ASR=======/12.5 [Kusto]ASR endpoint permission.md) |
| 10 | Mooncake portal 缺少 managed disks failover 选项 | Mooncake bug ICM 69531690，PG 已修复 | 已修复。仅限 on-prem→Azure + Protected 状态，A2A 不适用 | 🔵 6.5 — OneNote 单源+21V | [MCVKB/12.6](MCVKB/VM+SCIM/=======12. ASR=======/12.6) |
| 11 | ASR replication 性能问题：disk churn / RPO lag | 写入 churn 超出带宽或 IOPS | mabprodmc Kusto 3 步查询：DataSourceId → HvrApplySyncSessionStats → 时间图 | 🟢 8.5 — OneNote+Kusto 验证+21V | [MCVKB/12.7](MCVKB/VM+SCIM/=======12. ASR=======/12.7 kusto query for disk churn size in mooncake A.md) |
| 12 | Mooncake portal managed disk 选项修复确认 | PG via ICM 69531690 已修复 | 同 #10 | 🔵 6 — OneNote 单源+21V | [MCVKB/12.6](MCVKB/VM+SCIM/=======12. ASR=======/12.6) |
| 13 | Hyper-V→Azure replication 失败 error 18090/80790033: 分区数超限 | Gen2 VM (UEFI/GPT) OS 磁盘数据卷 >2 超出 ASR 限制 | 合并/重格式化卷，减少到 ≤2 个数据卷 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.8](MCVKB/VM+SCIM/=======12. ASR=======/12.8 V2A ASR failed with error as number of partit.md) |

## 快速排查路径
1. **Mobility Service 安装失败** → Windows: WMI + 文件共享 + Remote UAC；Linux: root + SSH + SFTP `[来源: OneNote]`
2. **复制性能/RPO** → mabprodmc Kusto 查 HvrApplySyncSessionStats 分析 churn rate `[来源: OneNote]`
3. **Kusto 诊断** → asrclusmc: SRSShoeboxEvent/SRSOperationEvent；mabprodmc: churn/性能 `[来源: OneNote]`
4. **Linux CA 证书** → /etc/ssl/certs 检查+补充根 CA，c_rehash `[来源: OneNote]`
5. **版本显示不对** → 重启源 VM（EP0903 = 成功但需重启）`[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/vm-asr-replication.md#排查流程)
