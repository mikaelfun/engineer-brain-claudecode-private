# ARM Azure Local 部署 — 排查工作流

**来源草稿**: ado-wiki-b-bicep.md, ado-wiki-b-sff-haas-deployment.md, mslearn-arm-bicep-what-if-guide.md
**场景数**: 1
**生成日期**: 2026-04-07

---

## Scenario 1: Azure Local 部署排查
> 来源: Azure Local deployment 参考 | 适用: Mooncake ⚠️ / Global ✅

### 排查步骤
1. **确认部署方式**: ARM template / Bicep / Portal
2. **DNS 配置检查**: 验证 DNS 解析和网络连通性
3. **Disconnected Operations 准备**: 确认所有前提条件满足
4. **若使用 Bicep 部署**:
   - 确认 bicepconfig.json 中的 currentProfile 设置正确
   - 对于 Mooncake: 需设置 AzureChinaCloud
5. **使用 what-if 预览**: `az deployment group what-if` 验证模板变更
