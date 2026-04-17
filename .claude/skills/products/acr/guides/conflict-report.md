# ACR — 知识矛盾检测报告

**生成日期**: 2026-04-07
**总矛盾数**: 3
**阻断性矛盾**: 0

| # | Topic | 类型 | 来源A | 来源B | 判断 | 建议 |
|---|-------|------|-------|-------|------|------|
| 1 | content-trust-notation | version_superseded | onenote-009 (DCT 弃用) | ado-wiki-009 (DCT 签名) | context_dependent | 两者都保留：DCT 弃用为新方向，DCT 排查为遗留用户 |
| 2 | firewall-network-rules | context_dependent | onenote-003 (service tag) | ado-wiki-a-r1-001 (PE+公网禁用) | context_dependent | 不同网络场景，各自保留 |
| 3 | firewall-network-rules | version_superseded | onenote-002 (Tasks 网络限制) | ado-wiki-041 (2025-06 安全变更) | context_dependent | ado-wiki-041 优先（含最新安全变更），onenote-002 为通用方案 |

> 所有矛盾均为 context_dependent，无需人工阻断裁定，Phase 2 可正常执行。
