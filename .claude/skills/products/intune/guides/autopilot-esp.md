# Intune Autopilot ESP 与预配置 — 排查速查

**来源数**: 1 | **21V**: 部分适用
**条目数**: 4 | **最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status afte... | By design: pre-provisioned devices are unjoined from Entra after enrollment. ... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-pro... | 🟢 8.5 | ADO Wiki |
| 2 | Autopilot Pre-Provisioning device shows AzureAdJoined=No and AzurePRT=No in dsregcmd /status afte... | By design: pre-provisioned devices are unjoined from Entra after enrollment. ... | This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-pro... | 🟢 8.5 | ADO Wiki |
| 3 | HAADJ Autopilot 完成后用户登录 Windows 时出现 Fix your Account 弹窗消息，使用了 SkipUSEResp 预配置模式 | 租户为 Non-Federated（Managed）模式时，HAADJ 注册不会自动完成，需要等待 AADSyncScheduler 将 Intune C... | 1. 如果是 Federated 租户则无此问题（HAADJ registration 自动完成）；2. Non-Federated 租户：等待 30-40 分钟让 AADSync 完成同步后消... | 🟢 8.5 | ADO Wiki |
| 4 | Autopilot Device Preparation (AP-DP) device stuck at 100% during OOBE, deployment does not continue | Known platform issue in AP-DP initial release | End-user needs to manually restart the device for the deployment to continue. Fix is being worked... | 🔵 7.5 | ADO Wiki |

## 快速排查路径
1. This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-prov devices before AccountSetup completes. For hybrid j `[来源: ADO Wiki]`
2. This is expected behavior for Pre-Provisioning. Do not troubleshoot Entra join issues for pre-prov devices before AccountSetup completes. For hybrid j `[来源: ADO Wiki]`
3. 1. 如果是 Federated 租户则无此问题（HAADJ registration 自动完成）；2. Non-Federated 租户：等待 30-40 分钟让 AADSync 完成同步后消息会自动消失；3. 或让用户通过 Fix your Account 弹窗重新认证；4. Pre-Provi `[来源: ADO Wiki]`
4. End-user needs to manually restart the device for the deployment to continue. Fix is being worked on by PG. `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/autopilot-esp.md#排查流程)
