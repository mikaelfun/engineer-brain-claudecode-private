# Synthesize Log -- purview -- 2026-04-07

## Mode
Full (first synthesis)

## Retained Entries
Total: 617

## Discarded Entries
| ID | Reason |
|----|--------|

## Fusion Statistics
| Topic | Type | Entries | Drafts | Kusto | Sub-agents |
|-------|------|---------|--------|-------|------------|
| scan-connectivity-credentials | 📋 fusion | 24 | 2 | 0 | 0 (inline) |
| scan-shir-setup | 📋 fusion | 38 | 13 | 0 | 0 (inline) |
| scan-private-endpoint-network | 📋 fusion | 32 | 6 | 0 | 0 (inline) |
| scan-third-party | 📋 fusion | 23 | 7 | 0 | 0 (inline) |
| scan-fabric-powerbi | 📋 fusion | 23 | 3 | 0 | 0 (inline) |
| scan-performance-stuck | 📋 fusion | 8 | 1 | 0 | 0 (inline) |
| scan-missing-assets | 📋 fusion | 10 | 4 | 0 | 0 (inline) |
| classification-datamap | 📋 fusion | 17 | 6 | 0 | 0 (inline) |
| schema-resource-set | 📋 fusion | 13 | 2 | 0 | 0 (inline) |
| data-map-api-operations | 📋 fusion | 22 | 5 | 0 | 0 (inline) |
| data-map-collections | 📋 fusion | 4 | 4 | 0 | 0 (inline) |
| data-quality | 📋 fusion | 9 | 3 | 0 | 0 (inline) |
| azure-data-share | 📋 fusion | 22 | 4 | 0 | 0 (inline) |
| purview-data-sharing | 📊 compact | 14 | 0 | 0 | 0 (inline) |
| lineage-adf-synapse | 📋 fusion | 6 | 4 | 0 | 0 (inline) |
| sensitivity-labels-visibility | 📋 fusion | 37 | 8 | 0 | 0 (inline) |
| sensitivity-labels-encryption | 📋 fusion | 7 | 5 | 1 | 0 (inline) |
| auto-labeling | 📋 fusion | 10 | 8 | 0 | 0 (inline) |
| mpip-client | 📋 fusion | 16 | 9 | 0 | 0 (inline) |
| mpip-scanner | 📋 fusion | 8 | 6 | 0 | 0 (inline) |
| irm-rms-pme | 📋 fusion | 34 | 7 | 2 | 0 (inline) |
| aip-service-byok | 📋 fusion | 20 | 12 | 2 | 0 (inline) |
| rms-connector-adrms | 📋 fusion | 10 | 13 | 1 | 0 (inline) |
| dke-double-key | 📊 compact | 5 | 0 | 0 | 0 (inline) |
| cross-cloud-mip | 📋 fusion | 5 | 1 | 1 | 0 (inline) |
| mip-sdk | 📋 fusion | 1 | 6 | 0 | 0 (inline) |
| ediscovery | 📋 fusion | 16 | 0 | 1 | 0 (inline) |
| activity-content-explorer | 📋 fusion | 17 | 8 | 0 | 0 (inline) |
| retention-records | 📋 fusion | 11 | 1 | 2 | 0 (inline) |
| dlp-policies | 📋 fusion | 3 | 3 | 2 | 0 (inline) |
| audit-log | 📊 compact | 5 | 0 | 0 | 0 (inline) |
| account-provisioning | 📋 fusion | 29 | 3 | 0 | 0 (inline) |
| account-region-migration | 📊 compact | 1 | 0 | 0 | 0 (inline) |
| billing-pricing | 📋 fusion | 17 | 9 | 0 | 0 (inline) |
| permissions-rbac | 📋 fusion | 22 | 3 | 1 | 0 (inline) |
| portal-access-ux | 📋 fusion | 8 | 5 | 0 | 0 (inline) |
| data-governance-catalog | 📋 fusion | 11 | 15 | 0 | 0 (inline) |
| policy-store-enforcement | 📋 fusion | 11 | 2 | 0 | 0 (inline) |
| workflow-approval | 📋 fusion | 2 | 4 | 0 | 0 (inline) |
| 21v-feature-gaps | 📋 fusion | 28 | 8 | 0 | 0 (inline) |
| sovereign-cloud-tooling | 📋 fusion | 8 | 4 | 0 | 0 (inline) |
| support-internal-tooling | 📋 fusion | 10 | 26 | 0 | 0 (inline) |
# Synthesize Log — purview — 2026-04-24

## 模式
增量（Phase 2.5 + S5 无条件执行）

## 说明
topicsToRegen 为空（guide 已全部存在），但 _index.search.jsonl 不存在 + _index.md 格式需更新。
根据 spec "无条件执行" 规则，执行 Phase 2.5 和 S5。

## 评分方法
四维公式逐条计算（Source Quality 0-3 + Recency 0-2 + Validation Strength 0-3 + 21V Applicability 0-2 = 0-10）

## 评分统计
| 等级 | Badge | Topic 数 |
|------|-------|----------|
| 可直接采信 | 🟢 8.0+ | 0 |
| 可参考 | 🔵 5.0-7.9 | 42 |
| 方向参考 | 🟡 3.0-4.9 | 0 |
| 谨慎使用 | ⚪ <3.0 | 0 |

## 融合统计
| 指标 | 数量 |
|------|------|
| 总 topic 数 | 42 |
| 融合 topic (✅) | 38 |
| 速查 topic (—) | 4 |
| 有工作流 | 38 |
| JSONL 条目总数 | 643 |

## Top/Bottom 5 Topics by avgScore

### Top 5
| Topic | Title | Entries | avgScore |
|-------|-------|---------|----------|
| account-region-migration | 账户区域变更与迁移 | 1 | 🔵 7.5 |
| sovereign-cloud-tooling | Sovereign Cloud 工具与访问 | 8 | 🔵 7.4 |
| scan-performance-stuck | 扫描性能与异常终止 | 8 | 🔵 7.0 |
| scan-missing-assets | 扫描后资产丢失 | 10 | 🔵 7.0 |
| account-provisioning | 账户创建 / 升级 / 合并 / 配额 | 29 | 🔵 7.0 |

### Bottom 5
| Topic | Title | Entries | avgScore |
|-------|-------|---------|----------|
| rms-connector-adrms | RMS Connector 与 AD RMS | 10 | 🔵 6.0 |
| dlp-policies | DLP 策略与告警 | 3 | 🔵 6.0 |
| auto-labeling | 自动标签 (客户端 / 服务端) | 10 | 🔵 5.9 |
| audit-log | 审计日志 | 5 | 🔵 5.7 |
| ediscovery | eDiscovery 搜索与保留 | 16 | 🔵 5.5 |
