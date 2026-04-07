# ARM ARM 部署错误排查 — 排查速查

**来源数**: 1 | **21V**: 全部
**最后更新**: 2026-04-07

## 症状速查
| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 📋 | Bicep deployment fails or targets wrong cloud environment (deploying to AzureCloud instead of Azure… | Bicep defaults to AzureCloud profile. Without explicit bicepconfig.json setting currentProfile to A… | Create bicepconfig.json in the Bicep files directory with: {"cloud": {"currentProfile": "AzureChina… | 🟢 8.5 — onenote+21V适用 | [MCVKB/Config Env to Mooncake.md] |

## 快速排查路径
1. Create bicepconfig.json in the Bicep files directory with: {"cloud": {"currentP… `[来源: onenote]`

> 本 topic 有融合排查指南，含完整排查流程和 Kusto 查询模板
> → [完整排查流程](details/arm-deployment-errors.md#排查流程)
