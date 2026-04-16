# ARM Azure 资源标签管理 — 排查工作流

**来源草稿**: ado-wiki-tags-architecture-troubleshooting.md, ado-wiki-a-working-with-tags-in-powershell.md, ado-wiki-b-configure-nsg-tags.md
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Tags 不同步（ARM 与 RP 不一致）
> 来源: ado-wiki-tags-architecture-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **理解 Tags 存储架构**:
   - Tags 由各 RP 存储（RP 是 source of truth）
   - ARM 层有 Tags 缓存
2. **两种创建方式**:
   - 作为资源的 top level property（PUT/PATCH 直接到 RP）
   - 作为 extension resource Microsoft.Resources/tags（ARM 处理后 PATCH 到 RP）
3. **同步问题排查**:
   - Orphan tags: 资源删除后 tags 仍在 ARM 缓存中
   - Tags out of sync: ARM 和 RP 中的 tag name/value 不一致
4. **清理 orphan tags**:
   - `Remove-AzTag -Name ` (PowerShell)
   - `az tag delete --name ` (CLI)

---

## Scenario 2: Tags 汇总列表为空
> 来源: ado-wiki-tags-architecture-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Tags summarization 限制**: 唯一 tag name/value 组合超过 **80,000** 时汇总失败
2. **现象**: Portal Tags blade 显示空列表
3. **排查**: 检查订阅中的 unique tag combinations 是否过多
4. **解决**: 清理 orphan tags 以减少 combination 数量

---

## Scenario 3: Tag 大小写问题
> 来源: ado-wiki-tags-architecture-troubleshooting.md | 适用: Mooncake ✅ / Global ✅

### 排查步骤
1. **Tag names**: 操作时大小写不敏感，但 RP 可能保留原始大小写
2. **Tag values**: 大小写敏感
3. **若大小写未按预期存储** → RP 问题，需联系对应 RP 团队
4. **成本报告中的 tag name 大小写**: 可能与创建时不同（by design）

### PowerShell 常用命令

```powershell
# 列出未关联资源的 tags
Get-AzTag | where Count -EQ 0

# 删除所有未关联资源的 tags
Get-AzTag | where Count -EQ 0 | forEach { Remove-AzTag -Name $_.name }

# 列出所有有 tag 的资源组和资源（注意：此命令开销大，可能触发限流）
Get-AzTag | where Count -GT 0 | forEach {
    $tagname = $_.name
    Get-AzResourceGroup | where { $_.tags.keys -eq $tagname} | select ResourceGroupName,ResourceId,Tags
    Get-AzResource | where { $_.tags.keys -eq $tagname} | select Name,ResourceId,Tags
}
```
