# ARM Azure Stack Hub 诊断与日志 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Azure Stack Hub infrastructure hosts experience system bottleneck or performance degradation after … | Azure Stack Hub 2108 introduced capture of a large number of network and Hyper-V performance counte… | Run Remove-AzsSupportNetworkPerformanceCounters to: (1) remove aggressive network perf counter conf… | 🔵 7.5 — ado-wiki+21V适用 | [ADO Wiki] |

## 快速排查路径
1. Run Remove-AzsSupportNetworkPerformanceCounters to: (1) remove aggressive netwo… `[来源: ado-wiki]`
