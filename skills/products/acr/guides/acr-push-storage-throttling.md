# ACR 推送/存储/限流 — 排查速查

**来源数**: 7 | **21V**: 全部适用
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | ACR 返回 'too many requests' 限流错误 | 并发请求超出 ACR 层级限制（如 Standard 层 10 个并发 pull） | ① Kusto 验证限流：`RegistryActivity \| where err_code == 'toomanyrequests'` ② 升级 ACR 层级（Basic→Standard→Premium）提高限额 ③ 实现指数退避重试 | 🟢 8 — ADO Wiki+KQL 实证 | [ADO Wiki/Throttling](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FHow%20to%20Handle%20Throttling%20errors) |
| 2 | 间歇性 503 'Egress is over the account limit' | ACR 内部 Azure Storage 账户带宽限流（内部订阅，客户不可见） | ① Kusto 查 blob account：`RegistryActivity \| where http_response_status == '307'` ② 间歇性：实现重试+指数退避 ③ 持续性：提 ICM 给 Azure Storage 团队 | 🟢 8 — ADO Wiki+KQL 实证 | [ADO Wiki/503 Egress](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2F503%20Egress%20is%20over%20the%20account%20limit) |
| 3 | Docker/Helm push 成功但推送内容为空，repository 无内容 | Azure quarantine 功能阻止内容推送，Defender for Cloud 启用时自动开启 quarantine | ① 获取 ACR resource ID：`az acr show --name <reg> --query id -o tsv` ② 禁用 quarantine：`az resource update --ids $id --set properties.policies.quarantinePolicy.status=disabled` ③ 重试 push | 🟢 8 — ADO Wiki 实证 | [ADO Wiki/Push No Content](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Push%20Failure%20no%20content) |
| 4 | Push/pull 报 'unknown: The operation is disallowed on this registry' — 存储达 40TiB 上限 | Container registry 达到每 registry 40 TiB 存储上限 | ① 验证用量：`az acr show-usage -r {registryName}` ② 配置 retention policy + auto-purge + 删除无用镜像 ③ 需要增大：提 ICM 给 ACR PG（上限 60TB，不可降回，无 SLA） | 🟢 8.5 — ADO Wiki+MS Learn 交叉 | [ADO Wiki/Storage Limit](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase) |
| 5 | Geo-replicated ACR 间歇性 push 失败，存储接近上限 | Geo-replication 同步延迟：一个 region 副本先满，另一个未同步完成仍可 push，最终两边都满 | ① 检查每 region 存储用量 ② purge/retention 释放到 40TiB 以下 ③ >60TB 无法创建新 geo-replication | 🔵 7.5 — ADO Wiki 单源+关联 | [ADO Wiki/Storage Limit](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Storage%20Limit%20Increase) |
| 6 | Pull/push 慢、超时、间歇性性能劣化 | 多种可能：网络连通性 / ACR 限流 / Azure Blob Storage 性能 / 客户端瓶颈(CPU/磁盘/带宽) / 路由/代理 | 需通过 Kusto 区分 ACR server latency / blob storage latency / 客户端 latency | 🔵 7 — ADO Wiki guide-draft | [ADO Wiki/Slow Performance](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure+Kubernetes+Service+Wiki%2FACR%2FTSG%2FSlow+pull+and+push+performance) |
| 7 | Push 报 'operation is disallowed' — writeEnabled false 或存储满 | Repository/image/manifest 被锁定 (writeEnabled=false)，或 40 TiB 存储达上限 | ① 检查锁定：`az acr repository show --name <reg> --repository <repo>` → writeEnabled false 则 `az acr repository update --write-enabled true` ② 检查存储用量是否达上限 | 🔵 6.5 — MS Learn+ADO Wiki 交叉 | [MS Learn/operation-disallowed](https://learn.microsoft.com/en-us/troubleshoot/azure/azure-container-registry/troubleshoot-push-error-operation-disallowed-timeout) |

## 快速排查路径
1. **确认错误类型**：throttling (429/503) → 还是 operation disallowed → 还是 push 成功但无内容 → 还是性能慢 `[来源: 综合]`
2. **如果 'too many requests' (429)** → 检查 ACR 层级并发限额，考虑升级或加重试 `[来源: ADO Wiki]`
3. **如果 503 'Egress over account limit'** → Azure Storage 内部限流，Kusto 查 blob account，间歇性加重试，持续提 ICM `[来源: ADO Wiki]`
4. **如果 'operation is disallowed'** → 先查 writeEnabled 锁定，再查 `az acr show-usage` 是否达 40TiB `[来源: ADO Wiki + MS Learn]`
5. **如果 push 成功但无内容** → 检查 quarantine policy（Defender for Cloud 会自动启用）`[来源: ADO Wiki]`
6. **如果 geo-replicated + 间歇性失败** → 检查各 region 存储用量，可能一个副本先满 `[来源: ADO Wiki]`
7. **如果性能慢** → Kusto 分层排查：ACR server / blob storage / 客户端各层延迟 `[来源: ADO Wiki]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-push-storage-throttling.md#排查流程)
