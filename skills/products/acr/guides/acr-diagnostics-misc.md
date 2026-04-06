# ACR 诊断与杂项 — 排查速查

**来源数**: 6 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | 需要 ACR 诊断 Kusto 查询（auth 错误、push/pull 失败、build 日志、删除、webhooks） | 参考材料 — Kusto 查询模板集合 | 见融合指南中完整 KQL 模板 | 🟢 9 — OneNote 团队实践，Mooncake 专属 | [MCVKB/ACR Kusto query](../../known-issues.jsonl#acr-008) |
| 2 📋 | 需要了解 ACR Case 升级流程、ICM 创建和 PG 沟通工作流 | 参考材料 — 升级流程指南 | 见融合指南中完整升级流程 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Escalation%20Process) |
| 3 📋 | 需要了解 `az acr check-health` 命令验证内容（Docker 版本、MCR pull、CLI 版本、DNS/data endpoint、Helm 版本） | 参考材料 — 健康检查命令说明 | 见融合指南中完整说明 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20Health-Check%20Command%20Background) |
| 4 📋 | 客户想使用自定义域名（如 registry.contoso.com）替代默认 *.azurecr.io | 需 Nginx 反向代理 + DNS + SSL 配置 | 见融合指南中完整配置步骤 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20use%20a%20custom%20domain%20for%20azure%20container%20registry) |
| 5 | Container Apps 创建超时 15-20 分钟后失败 — ACR 注册表名过长（>30 字符） | Container Apps 已知 bug，无法处理超过 ~30 字符的 ACR registry 名称 | 使用较短的 ACR 名（<30 字符）；无法重命名则新建 ACR 并迁移镜像 | 🟢 8 — ADO Wiki + Case 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContainersApps+Creation+failure+due+to+ACR+name+too+long) |
| 6 | 部分用户在 Portal 中无法列出 ACR 镜像（Error retrieving Image Names）；浏览器控制台 CORS 错误；CLI 正常；仅大量 AAD 组成员用户受影响 | OAuth2 bearer token 超过 ACR 最大 HTTP header 大小（8192 bytes），因用户 AAD 组成员过多 | 1) 减少用户 AAD 组成员数 2) 改用 CLI 操作 3) 调整 conditional access 减少 token claims | 🟢 8 — ADO Wiki + 详细根因分析 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FAKS%2FTSG%2FACR+CORS+Policy+Blocked+Portal+Issue) |

## 快速排查路径
1. 任何 ACR 问题 → 先跑 `az acr check-health` 快速诊断 `[来源: ADO Wiki]`
2. 需要 Kusto 查询 → 见融合指南 KQL 模板（auth/push/pull/build/delete/webhook） `[来源: OneNote]`
3. Portal 列出镜像失败 + CORS → 确认用户 AAD 组数量，建议用 CLI `[来源: ADO Wiki]`
4. Container Apps 超时 → 检查 ACR 名称长度是否 >30 字符 `[来源: ADO Wiki]`
5. 需要升级到 PG → 见融合指南中 ICM 流程和联系方式 `[来源: ADO Wiki]`
6. 自定义域名 → 见融合指南 Nginx + DNS + SSL 配置 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-diagnostics-misc.md#排查流程)
