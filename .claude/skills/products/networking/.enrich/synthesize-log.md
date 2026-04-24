# Synthesize Log — networking — 2026-04-07

## 模式
全量

## 保留条目
| ID | 原因 |
|----|------|
| (全部 386 条) | 全部保留，无半成品条目 |

## 丢弃条目
| ID | 原因 |
|----|------|
| (无) | 全部条目质量达标 |

## 融合统计
| topic | 类型 | 三元组 | draft | Kusto | sub-agents |
|-------|------|--------|-------|-------|------------|
| dns | 📋 融合 | 59 | 27 | 0 | 0 (直接) |
| appgw-general | 📋 融合 | 39 | 21 | 3 | 0 (直接) |
| expressroute | 📋 融合 | 39 | 27 | 3 | 0 (直接) |
| bastion | 📋 融合 | 32 | 14 | 0 | 0 (直接) |
| misc-networking | 📋 融合 | 29 | 4 | 0 | 0 (直接) |
| agc-general | 📋 融合 | 24 | 17 | 0 | 0 (直接) |
| appgw-backend-health | 📋 融合 | 24 | 3 | 1 | 0 (直接) |
| appgw-keyvault-cert | 📋 融合 | 20 | 3 | 0 | 0 (直接) |
| vpn | 📋 融合 | 18 | 7 | 1 | 0 (直接) |
| appgw-waf | 📋 融合 | 14 | 7 | 0 | 0 (直接) |
| appgw-tls-mutual-auth | 📋 融合 | 13 | 2 | 0 | 0 (直接) |
| ddos | 📋 融合 | 13 | 9 | 1 | 0 (直接) |
| vnet-connectivity | 📋 融合 | 11 | 5 | 4 | 0 (直接) |
| appgw-redirect-rewrite | 📊 速查 | 8 | 0 | 0 | 0 (直接) |
| appgw-diagnostics | 📋 融合 | 8 | 1 | 0 | 0 (直接) |
| appgw-http-errors | 📊 速查 | 7 | 0 | 0 | 0 (直接) |
| appgw-failed-state-crud | 📋 融合 | 7 | 2 | 1 | 0 (直接) |
| nsg-network-watcher | 📋 融合 | 7 | 1 | 0 | 0 (直接) |
| agc-waf | 📋 融合 | 5 | 1 | 0 | 0 (直接) |
| appgw-apim | 📊 速查 | 4 | 0 | 0 | 0 (直接) |
| appgw-5xx-timeout | 📊 速查 | 3 | 0 | 0 | 0 (直接) |
| appgw-layer4 | 📋 融合 | 2 | 5 | 0 | 0 (直接) |

# Synthesize Log — networking — 2026-04-24

## 模式
增量（Phase 2.5 + §5 索引生成，guides 已存在）

## topicsToRegen
无（增量检测无变化 topic，但 Phase 2.5 和 §5 无条件执行）

## 评分统计
| Topic | Entries | Top Score | Avg Score | Sources |
|-------|---------|-----------|-----------|---------|
| dns | 59 | 9.0 | 🔵 6.8 | onenote,mslearn,ado-wiki |
| appgw-general | 39 | 8.0 | 🔵 6.6 | onenote,ado-wiki |
| expressroute | 39 | 7.5 | 🔵 6.4 | onenote,mslearn,ado-wiki |
| bastion | 32 | 7.5 | 🔵 6.7 | ado-wiki |
| misc-networking | 29 | 8.0 | 🔵 6.4 | onenote,mslearn,contentidea-kb,ado-wiki |
| agc-general | 24 | 7.0 | 🔵 6.0 | ado-wiki |
| appgw-backend-health | 24 | 7.5 | 🔵 6.8 | onenote,ado-wiki |
| appgw-keyvault-cert | 20 | 7.5 | 🔵 6.6 | onenote,ado-wiki |
| vpn | 18 | 8.0 | 🔵 5.6 | mslearn,onenote |
| appgw-waf | 14 | 7.5 | 🔵 6.9 | onenote,ado-wiki |
| appgw-tls-mutual-auth | 13 | 8.0 | 🔵 6.8 | onenote,ado-wiki |
| ddos | 13 | 7.5 | 🔵 6.2 | onenote,ado-wiki |
| vnet-connectivity | 11 | 8.0 | 🔵 6.4 | onenote,mslearn,ado-wiki |
| appgw-redirect-rewrite | 8 | 7.5 | 🔵 6.6 | ado-wiki |
| appgw-diagnostics | 8 | 7.5 | 🔵 6.8 | ado-wiki |
| appgw-http-errors | 7 | 6.5 | 🔵 6.5 | ado-wiki |
| appgw-failed-state-crud | 7 | 7.5 | 🔵 6.6 | ado-wiki |
| nsg-network-watcher | 7 | 7.0 | 🔵 5.9 | mslearn,onenote |
| agc-waf | 5 | 6.5 | 🔵 6.5 | ado-wiki |
| appgw-apim | 4 | 7.5 | 🔵 6.8 | ado-wiki |
| appgw-5xx-timeout | 3 | 7.5 | 🔵 6.8 | ado-wiki |
| appgw-layer4 | 2 | 6.5 | 🔵 6.5 | ado-wiki |

## 生成文件
- `_index.search.jsonl`: 22 topic records
- `_index.md`: 更新为 §5 格式（含 Keywords + Sources 列）
