# ARM Azure Local 通用 (SFF / Container) — 排查工作流

**来源草稿**: ado-wiki-b-sff-haas-deployment.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Local Small Form Factor 部署
> 来源: ado-wiki-b-sff-haas-deployment.md | 适用: Mooncake ❌ / Global ✅ (Private Preview)

### 排查步骤
1. **预约硬件**: HaaS → Reserve → Team: SOL-CSS, Product: ALSFF
2. **触发 CI Pipeline**: Azure DevOps SFF Solution pipeline
3. **验证部署**: 等待 2.5-3 小时完成
4. **注意**: 部分 pipeline stages 失败是正常的，关键是 Setup Pipeline 和 ASZ Pre-Deploy 完成
