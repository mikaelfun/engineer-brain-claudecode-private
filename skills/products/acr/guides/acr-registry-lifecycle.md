# ACR Registry 生命周期 — 排查速查

**来源数**: 8 | **21V**: 全部
**最后更新**: 2026-04-05

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | CE1/CN1 区域 ACR 资源需迁移（区域退役） | CE1/CN1 Azure 区域退役，所有资源必须迁至支持区域 | 按 MS Learn 迁移指南操作；AKS 不受影响（CE1/CN1 从未支持 AKS），但 ACR 需迁移 | 🟢 9 — OneNote 团队实践 | [MCVKB/ACR CE1 CN1 retirement](../../known-issues.jsonl#acr-004) |
| 2 | 客户收到 ACR API 废弃邮件（2018-02-01-preview）但声称未使用该 API | ARM PolicyScan 服务（clientAppId: 1d78a85d-...）在调用废弃 API，非客户本人；部分订阅被误通知 | Kusto 查 armprodgbl 验证 userAgent：若仅 PolicyScan → 无需客户操作 | 🟢 8 — ADO Wiki + Kusto 验证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20API%20Deprecation%20Handling%20for%20CSS) |
| 3 | ACR API 调用在废弃日期后失败（preview API 版本） | 客户使用已废弃 ACR API 版本 | 1) 迁移到新版 API 2) 更新 SDK 3) 更新 az CLI 4) Kusto 查 armprodgbl 定位调用方 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FHow%20Tos%2FACR%20API%20Deprecation%20Handling%20for%20CSS) |
| 4 | Registry 创建 400 错误 — DNS 名称冲突（CNAME 已存在） | RP 在 vNET 握手失败时泄漏 CNAME 记录，DNS 名被占用但 registry 未创建成功 | 1) Kusto 查 RPActivity 验证 2) Geneva action 清理孤立 CNAME 3) 重试创建 | 🟢 8 — ADO Wiki + Kusto/Geneva 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation) |
| 5 | Registry 删除后重建失败 — CheckNameAvailability 返回 NameNotAvailable_NotAllowedByPolicy | NRS（Name Reservation Service）保留已删名称：Internal=永久，Enterprise/CSP=180天，其他=30天 | 1) Kusto 查 RPActivity NRS 记录 2) ACIS action Force Delete 3) 等待≤1h 4) 失败→ ICM 到 DNS NRS 团队 | 🟢 8 — ADO Wiki + ACIS 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20DNS%20And%20Name%20Reservation) |
| 6 | ACR Replication 卡在 creating/deleting 状态 | 后端权限问题：ACR 第一方应用的角色分配缺失 | 1) armprodgbl 查 correlationId 2) ACR RP 日志交叉验证 3) ICM 到 ACR PG（serviceId 22003）补角色 | 🟢 8 — ADO Wiki + Kusto 交叉验证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACR%2FTSG%2FACR%20Replication%20CRUD%20TSG) |
| 7 | ACR Webhook 推送到 App Service 失败 500 — 跨订阅或 ILB ASE | Webhook 不支持跨订阅 spoke 模型；ACR 无法通过 VNET 访问 ILB ASE 的 Kudu 端点 | 改用 Azure DevOps Pipeline 替代 ACR Webhook；确保 webhook 目标与 ACR 同订阅 | 🔵 7 — ADO Wiki 文档 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20Webhook%20fails%20to%20push%20to%20App%20Service) |
| 8 | ACR 显示为 disabled — 无法登录、拉取镜像 | ARM 维护期间更新请求导致 ARM 与 ACR RP 状态不一致，RP 将 registry 设为 disabled | ICM 到 ACR PG Triage 团队检查 Master Entity；Kusto 查 armprodgbl 确认是否有 404 | 🟢 8 — ADO Wiki + Kusto 实证 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/ACR/TSG/ACR%20disabled%20issue) |

## 快速排查路径
1. 创建/删除相关问题 → 先查 Kusto RPActivity 确认操作状态 `[来源: ADO Wiki]`
2. DNS/名称冲突 → Geneva action 清理 CNAME 或 ACIS Force Delete NRS `[来源: ADO Wiki]`
3. Replication 卡住 → armprodgbl 查 correlationId + ACR RP 日志交叉 → ICM escalation `[来源: ADO Wiki]`
4. Registry disabled → ICM 到 PG 检查 Master Entity `[来源: ADO Wiki]`
5. API 废弃通知 → Kusto 查 armprodgbl 确认是否 PolicyScan 误触发 `[来源: ADO Wiki]`
6. CE1/CN1 迁移 → 按 MS Learn 指南操作，AKS 不受影响 `[来源: OneNote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/acr-registry-lifecycle.md#排查流程)
