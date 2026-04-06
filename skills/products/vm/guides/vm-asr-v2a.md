# VM ASR VMware to Azure (V2A) 复制与故障转移 — 排查速查

**来源数**: 10 | **21V**: 部分
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | V2A replication stuck at 0% after CS power off | CS MySQL svsdb1 中 hosts 表出现重复/陈旧条目 | MySQL 清理重复 hosts → Unregister-ASRComponent.pl → 卸载 Mobility → 重新启用 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.1](MCVKB/VM+SCIM/=======12. ASR=======/12.1 [ASR-V2A}Duplicated register entries in CS my.md) |
| 2 | V2A cloned Linux VM replication stuck at 0%, 两台 VM 互相冲突 | 克隆 VM 继承相同 AgentGeneratedId，CS 文件锁冲突 | 两台均禁用复制 → MySQL 清理 → 卸载 Mobility → 重新启用 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.11](MCVKB/VM+SCIM/=======12. ASR=======/12.11 [ASR] VMware cloned VM may fail to enable re.md) |
| 3 | CS 部署(OVF) MySQL 安装失败: HTTP 400 Bad Request | .NET 默认 TLS 1.0 但 MySQL 下载要求 TLS 1.2 | SchUseStrongCrypto 注册表 / 手动下载 MySQL 5.7 静默安装 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.12](MCVKB/VM+SCIM/=======12. ASR=======/12.12 [ASR] Unable to intall Mysql Error in config.md) |
| 4 | UEFI VM failover 后 re-protect/failback 失败 | By design: ASR 不支持 UEFI VM failback 到 on-prem VMware | 预期行为，需使用 BIOS-boot VM | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.13](MCVKB/VM+SCIM/=======12. ASR=======/12.13 [ASR] VM with UEFI boot type cannot be faile.md) |
| 5 | V2A with proxy: initial replication 0%, error 90078/90079, cbengine 无法连 Storage | cbengine.exe 以 SYSTEM 账号运行，SYSTEM IE 代理/信任站点未配置 | PsExec 打开 SYSTEM IE → 配置代理 + 信任站点 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.14](MCVKB/VM+SCIM/=======12. ASR=======/12.14 ASR _ V2A with proxy _ Initial replication s.md) |
| 6 | V2A UEFI VM failover: 9.30 以下用 hydration VM 转换，9.30+ 要求 Gen2 VM size | ASR v9.30 支持直接 Gen2 failover，但需选 Gen2-capable VM size | 升级到 9.30+ → 选 Gen2 VM size → 使用新恢复点 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.15](MCVKB/VM+SCIM/=======12. ASR=======/12.15 [V2A] ASR version above 9.30 supports failov.md) |
| 7 | Enable replication 失败 error 78006/31337, Linux VM 有 Docker devicemapper | Docker devicemapper 路径含冒号，ASR 后端无法处理 | 切换 Docker storage driver 到 overlay2 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.16](MCVKB/VM+SCIM/=======12. ASR=======/12.16 [ASR][V2A]Enable Replication for VMware VM f.md) |
| 8 | CS portal 显示 disconnected, AADSTS700027 证书过期 | CS 用于 AAD 认证的证书已过期 | Portal Renew Certificate → 下载 key → cspsconfigtool.exe 重新注册 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.18](MCVKB/VM+SCIM/=======12. ASR=======/12.18 [V2A] Multiple Issues.md) |
| 9 | 需要直连 CS MySQL 数据库排查 stale entries | — | amethyst.conf 找密码 → mysql -uroot -p svsdb1 → 查 hosts 表 | 🟢 8.5 — OneNote+21V 明确 | [MCVKB/12.20](MCVKB/VM+SCIM/=======12. ASR=======/12.20 [ASR] How to connect mysql in CS DB.md) |
| 10 | Process Server failover 失败 Error 559/31255: invalid vault registration key | DRA 版本过旧(5.1.3300.0)，有 CikTokenValidationFailed bug | 升级 CS + PS 到最新版 | 🟢 8 — OneNote 单源+实证 | [MCVKB/12.9](MCVKB/VM+SCIM/=======12. ASR=======/12.9 [ASR]Error 559 when doing Process Server Fail.md) |

## 快速排查路径
1. **Replication 0%** → 检查 CS MySQL hosts 表是否有重复条目 → Unregister stale entries `[来源: OneNote]`
2. **Proxy 环境** → PsExec 打开 SYSTEM 账号 IE → 配置代理和信任站点 `[来源: OneNote]`
3. **CS disconnected** → 检查证书过期 → Portal Renew + cspsconfigtool 重注册 `[来源: OneNote]`
4. **UEFI/Gen2** → 确认 ASR 版本 ≥9.30 + Gen2-capable VM size；failback 不支持 UEFI `[来源: OneNote]`
5. **Enable 失败** → 检查 Docker devicemapper / DRA 版本 `[来源: OneNote]`
