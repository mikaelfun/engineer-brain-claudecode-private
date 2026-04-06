# ACR 审计与调查 — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | 需要查找 ACR push/pull/delete 操作的客户端/操作者 IP | ACR 在 Kusto RegistryActivity 中记录操作 IP（可能 PII 脱敏），Jarvis 保留完整 IP | Kusto 查询 RegistryActivity 获取 correlationid → Jarvis 查询完整 IP（Kusto 90 天，Jarvis 30 天） | 🟢 10 — OneNote+Wiki 交叉验证 | [MCVKB/POD/.../ACR/operator-ip](skills/products/acr/guides/drafts/) |
| 2 📋 | 需要审计谁 pull/push/delete 了 ACR 中的镜像 | — | 见融合指南完整审计流程 | 🔵 7 — ADO Wiki 草稿 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Audit%20Logs) |
| 3 📋 | 需要了解 ACR 配置变更历史（admin 启停、SKU 变更、retention 策略切换等） | — | 见融合指南变更分析流程 | 🔵 7 — ADO Wiki 草稿 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Change%20Analysis) |
| 4 📋 | 镜像被误删/untag，需要定位操作者和来源 IP | — | 见融合指南 manifest 事件追踪流程 | 🟢 9 — ADO Wiki+OneNote 交叉 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20How%20to%20find%20user%20of%20manifest%20event) |
| 5 | 调查 ACR 删除事件时 auth_user_name 显示未知 app ID（不在客户 tenant 中），remoteaddr 是微软 IP | 操作由 ACR Task 或 `az acr run` 执行，使用共享 ACR agent 的特殊 SP（非客户身份） | ARM Kusto 查询 HttpIncomingRequests → 检查 targetUri 字段识别操作类型（acr run / acr purge / ACR task） | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/ACR%20How%20to%20find%20user%20of%20manifest%20event) |
| 6 📋 | 客户报告 ACR 中大量镜像/tag 被意外批量删除，需调查来源、时间线和触发器 | — | 见融合指南批量删除调查流程 | 🟢 8 — ADO Wiki 草稿+关联实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/How%20Tos/ACR%20Investigate%20Bulk%20Image%20Tag%20Deletions) |
| 7 | 镜像 tag 消失，怀疑 retention policy，但 Kusto Delete 事件显示 Tag populated（WithTag > 0） | 外部 CI/CD 自动化删除了带 tag 的镜像；retention policy 只删无 tag manifest | Kusto 查询 RegistryManifestEvent：对比 Delete vs PurgeManifest、WithTag vs WithoutTag；检查 burst 模式识别定时任务；检查 tag 名称的 CI/CD 模式 | 🟢 8 — ADO Wiki+实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20image%20deletion%20investigation) |

## 快速排查路径

1. **确认调查类型** → 操作者 IP 追踪 / 配置变更审计 / 删除事件调查？`[来源: ADO Wiki]`
2. **操作者追踪** → Kusto RegistryActivity 查 correlationid → Jarvis 查完整 IP `[来源: OneNote]`
3. **如果 auth_user_name 不认识** → 可能是 ACR Task/acr run → ARM Kusto HttpIncomingRequests 交叉验证 `[来源: ADO Wiki]`
4. **删除调查** → RegistryManifestEvent 区分 Delete（手动/自动化）vs PurgeManifest（retention）`[来源: ADO Wiki]`
5. **WithTag > 0 的 Delete** → 外部自动化（CI/CD pipeline），非 retention policy `[来源: ADO Wiki]`
6. **配置变更** → Activity Log + Kusto 变更分析 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-audit-investigation.md#排查流程)
