# ACR Tasks — 排查速查

**来源数**: 9 | **21V**: 全部（部分功能有 Mooncake 限制）
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR Task 在网络受限（禁用公网访问）的 registry 上运行失败 | ACR Task 需要 system-assigned MI + trusted service 配置；默认认证模式不支持 private endpoints | 1) ACR 启用 "Allow trusted Microsoft services" 2) 创建 task 时带 `--assign-identity` 3) 给 system MI 分配 acrpush role 4) `az acr task credential add --use-identity [system]` | 🟢 9 — OneNote+Mooncake 实证 | [MCVKB/.../#Task.md](../../MCVKB) |
| 2 | 客户想在 Mooncake 使用 ACR Task dedicated agent pools | Feature gap — ACR Task agent pools 未部署到 Mooncake Cloud | 无当前 workaround，告知客户为已知 Mooncake 限制。跟踪 ICM-570372647 | 🟢 9 — OneNote+Mooncake 确认 | [MCVKB/.../#Task.md](../../MCVKB) |
| 3 | 需要从 Azure Blob Storage 导入容器镜像到 ACR（无法直接 docker push） | 镜像以 tar 包存储在 blob，需 ACR Task 多步流程导入 | ACR Task multi-step YAML：1) curl 下载 tar（SAS 或 MI token） 2) `docker load` 3) `docker tag` 4) push。注意 Linux 编辑 YAML 避免 Windows 换行符 | 🟢 9 — OneNote+Mooncake 实证 | [MCVKB/.../import container image](../../MCVKB) |
| 4 📋 | 需要在 ACR Tasks 中使用 Docker BuildKit 构建镜像、传递 secrets（文件/Key Vault）、或启用 git-lfs | — | 见融合排查指南 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FBuild%20an%20ACR%20image%20with%20Docker%20BuildKit%20and%20pass%20a%20secret) |
| 5 | ACR Task 未触发或运行失败，无可操作的输出信息 | 构建配置错误、触发器配置错误或平台问题 — 需从 BuildHostTrace 日志确定 | Kusto 查询 `cluster('ACR').database('acrprod').BuildHostTrace` 按 Tag 过滤 `<acr>.azurecr.io`，检查 RunnerLogs（错误信息）和 RunResult（触发类型和元数据） | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FCheck%20ACR%20tasks%20and%20outputs) |
| 6 | 2025 年 6 月后 ACR Tasks 返回 403 Forbidden，之前正常的 network bypass 被阻断 | 安全变更：`networkRuleBypassAllowedForTasks` 标志默认变为 deny（Phase 2, ICM#561798833） | 1) `az acr update --set networkRuleBypassAllowedForTasks=true` 2) 或使用 ACR Agent Pool（⚠️ 21V 不可用） 3) 或从自托管环境直接访问 ACR 构建推送 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Network%20Bypass%20Policy) |
| 7 | ACR Tasks 报错：subscription 使用 free Azure credit payment plan 不支持 | ACR 临时暂停免费试用/学生订阅的 ACR Tasks 运行 | 1) 升级为付费订阅 2) 如需保留免费额度：收集工作负载信息，创建 ICM 给 ACR PG 申请访问权限 | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Tasks%20Temporary%20Pause) |
| 8 | ACR Continuous Patching (CSSC) 在 push-image 步骤因 cache rule 错误失败 | CSSC 工作流不支持包含 PTC (pull-through cache) 规则的 repositories | 切换到 Artifact sync 类型的 cache rules，或将 CSSC 工作流移到不含 PTC 规则的 repository | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContinuous+Patching) |
| 9 | ACR Continuous Patching (CSSC) 报错 'image not found in MCR' | Copa 工具镜像未在 MCR 中发布 | 联系 azcu-publishing@microsoft.com 或在 GitHub microsoft/mcr 仓库提 PR 发布缺失的 tooling image | 🔵 7 — ADO Wiki 单源 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FContinuous+Patching) |

## 快速排查路径
1. 确认 Task 失败类型 `[来源: ADO Wiki]`
   - 403 Forbidden → 检查 `networkRuleBypassAllowedForTasks` 标志（#6）
   - 网络受限 registry → 配置 system MI + trusted service（#1）
   - 免费订阅报错 → 升级或申请 ICM 例外（#7）
2. 如果 Task 无输出/静默失败 → Kusto 查 `BuildHostTrace` 获取详细错误 `[来源: ADO Wiki]`
3. 如果是 Continuous Patching 问题 → 检查 cache rule 类型（#8）和 Copa 镜像可用性（#9） `[来源: ADO Wiki]`
4. 如果需要 blob → ACR 导入 → 使用 multi-step YAML task（#3） `[来源: OneNote]`
5. Agent Pool 需求 → Mooncake 不可用，告知客户（#2） `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-tasks.md#排查流程)
