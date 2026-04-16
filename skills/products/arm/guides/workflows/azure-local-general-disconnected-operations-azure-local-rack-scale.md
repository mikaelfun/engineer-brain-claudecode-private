# ARM Azure Local 通用 (Disconnected Operations / Rack Scale) — 排查工作流

**来源草稿**: ado-wiki-b-sff-haas-deployment.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Local Disconnected Operations 概览
> 来源: Azure Local 参考 | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. 确认 Azure Local 部署类型（SFF / Rack Scale）
2. 检查 connectivity 模式（connected / disconnected）
3. 验证 Azure Arc 注册状态
4. 若涉及 SFF 部署 → 通过 HaaS 环境和 CI pipeline 进行
