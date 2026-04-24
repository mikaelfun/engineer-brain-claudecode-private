# Synthesize Log — acr — 2026-04-07

## 模式
全量

## 保留条目
| ID | 原因 |
|----|------|
| acr-ado-wiki-001 ~ acr-ado-wiki-085 | ADO Wiki 一线 TSG，高置信度 |
| acr-ado-wiki-0145 ~ acr-ado-wiki-0150 | ADO Wiki 补充条目 |
| acr-ado-wiki-a-r1-001 | ADO Wiki 附录条目 |
| acr-mslearn-001 ~ acr-mslearn-021 | MS Learn 官方文档，通用适用 |
| acr-onenote-001 ~ acr-onenote-014 | OneNote 团队知识库，Mooncake 专属经验 |

## 丢弃条目
| ID | 原因 |
|----|------|
| acr-contentidea-kb-001 | 半成品（无 rootCause 且无 solution） |

## 矛盾检测
| # | Topic | 类型 | 来源A | 来源B | 判断 |
|---|-------|------|-------|-------|------|
| 1 | content-trust-notation | version_superseded | ado-wiki-009 | onenote-009 | context_dependent |
| 2 | firewall-network-rules | context_dependent | onenote-003 | ado-wiki-a-r1-001 | context_dependent |
| 3 | firewall-network-rules | version_superseded | onenote-002 | ado-wiki-041 | context_dependent |

## 融合统计
| topic | 类型 | 三元组 | draft | Kusto | sub-agents |
|-------|------|--------|-------|-------|------------|
| connected-registry | 📊 速查 | 3 | 0 | 0 | 0 |
| api-deprecation | 📋 融合 | 2 | 0 | 1 | 0 |
| authentication-login | 📋 融合 | 9 | 1 | 1 | 0 |
| firewall-network-rules | 📋 融合 | 8 | 0 | 1 | 0 |
| private-endpoint-dns | 📋 融合 | 10 | 3 | 1 | 0 |
| pull-timeout-connectivity | 📋 融合 | 8 | 0 | 1 | 0 |
| content-trust-notation | 📋 融合 | 7 | 1 | 0 | 0 |
| acr-tasks-build | 📋 融合 | 8 | 1 | 1 | 0 |
| image-deletion-forensics | 📋 融合 | 4 | 5 | 2 | 0 |
| image-lock-repository | 📊 速查 | 5 | 0 | 0 | 0 |
| throttling-intermittent | 📋 融合 | 4 | 1 | 2 | 0 |
| rbac-authorization | 📋 融合 | 6 | 2 | 0 | 0 |
| aks-image-pull | 📊 速查 | 4 | 0 | 0 | 0 |
| push-storage-limit | 📋 融合 | 6 | 0 | 2 | 0 |
| soft-delete | 📊 速查 | 4 | 0 | 0 | 0 |
| recovery-restore | 📋 融合 | 5 | 2 | 1 | 0 |
| retention-cleanup-defender | 📋 融合 | 4 | 1 | 1 | 0 |
| caching-cache-rules | 📋 融合 | 4 | 1 | 0 | 0 |
| dns-registry-creation | 📋 融合 | 2 | 1 | 0 | 0 |
| platform-integration | 📋 融合 | 5 | 6 | 1 | 0 |

# Synthesize Log — acr — 2026-04-24

## Mode
Incremental (index-only: Phase 2.5 + Section 5)

## Changes
- Generated missing guides/_index.search.jsonl (20 records)
- Updated guides/_index.md with Keywords, Sources, Score, Files columns
- All 109 entries scored using 4-dimension formula (Source Quality + Recency + Validation Strength + 21V Applicability)

## Topic Regeneration
No topic content regeneration needed (topicsToRegen = 0).
Phase 2.5 and Section 5 executed unconditionally per spec.

## Score Distribution
- All 20 topics scored in Blue range (5.0-7.9)
- Highest avg: image-deletion-forensics (7.6), throttling-intermittent (7.5), dns-registry-creation (7.5)
- Lowest avg: platform-integration (6.4)
- Top individual scores: 8.0 (firewall-network-rules, content-trust-notation, acr-tasks-build, image-deletion-forensics, rbac-authorization, recovery-restore, platform-integration)

## Fusion Statistics
| topic | type | entries | draft | kusto | sub-agents |
|-------|------|---------|-------|-------|------------|
| connected-registry | speed-only | 3 | 0 | 0 | 0 |
| api-deprecation | fusion | 2 | 0 | 1 | 0 |
| authentication-login | fusion | 9 | 1 | 1 | 0 |
| firewall-network-rules | fusion | 8 | 0 | 1 | 0 |
| private-endpoint-dns | fusion | 10 | 3 | 1 | 0 |
| pull-timeout-connectivity | fusion | 8 | 0 | 1 | 0 |
| content-trust-notation | fusion | 7 | 1 | 0 | 0 |
| acr-tasks-build | fusion | 8 | 1 | 1 | 0 |
| image-deletion-forensics | fusion | 4 | 5 | 2 | 0 |
| image-lock-repository | speed-only | 5 | 0 | 0 | 0 |
| throttling-intermittent | fusion | 4 | 1 | 2 | 0 |
| rbac-authorization | fusion | 6 | 2 | 0 | 0 |
| aks-image-pull | speed-only | 4 | 0 | 0 | 0 |
| push-storage-limit | fusion | 6 | 0 | 2 | 0 |
| soft-delete | speed-only | 4 | 0 | 0 | 0 |
| recovery-restore | fusion | 5 | 2 | 1 | 0 |
| retention-cleanup-defender | fusion | 4 | 1 | 1 | 0 |
| caching-cache-rules | fusion | 4 | 1 | 0 | 0 |
| dns-registry-creation | fusion | 2 | 1 | 0 | 0 |
| platform-integration | fusion | 5 | 6 | 1 | 0 |
