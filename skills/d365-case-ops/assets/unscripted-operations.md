# 待实现操作与已知线索

> 最后更新：2026-03-04（基于 Case 页面全面探索）

以下操作已在探索阶段确认按钮/菜单存在，但尚未编写脚本。按优先级排列。

## P2 - 中频操作

### Resolve Case（解决/关闭 Case）
- **探索状态**：已确认 Resolve case 按钮和 Resolve 标签页
- **预计复杂度**：中 — 需要填写 Resolution 表单
- **已知选择器**：`getByRole('menuitem', { name: 'Resolve case' })`, `getByRole('tab', { name: 'Resolve' })`

### Transfer Case（转移 Case）
- **探索状态**：已确认 Command Bar 中有 Transfer Case
- **预计复杂度**：中 — 需要选择目标队列/团队
- **已知选择器**：`getByRole('menuitem', { name: 'Transfer Case' })`

### Assign Case（重新分配 Case）
- **探索状态**：已确认 Command Bar 中有 Assign
- **预计复杂度**：中 — 需要搜索目标工程师
- **已知选择器**：`getByRole('menuitem', { name: 'Assign' })`

### Follow Case（关注 Case 更新）
- **探索状态**：已确认 Command Bar 中有 Follow
- **预计复杂度**：极低 — 单次点击
- **已知选择器**：`getByRole('menuitem', { name: 'Follow' })`

## P3 - 低频操作

### Create IcM（关联 IcM 工单）
- **探索状态**：已确认 Related Tab 中有 IcMs
- **预计复杂度**：高 — 可能涉及外部系统
- **已知选择器**：Related → `menuitem "IcMs"`

### Swarm（群组协作）
- **探索状态**：已确认 Related Tab 中有 Swarms
- **预计复杂度**：高
- **已知选择器**：Related → `menuitem "Swarms"`

### Check SLA（查看 SLA 状态）
- **探索状态**：Dashboard 上有 "SLA not Met" 表格
- **预计复杂度**：低 — 仅读取

### View Audit History（查看审计历史）
- **探索状态**：已确认 Audit Tab 直接可用
- **预计复杂度**：低
- **已知选择器**：`getByRole('tab', { name: 'Audit' })`

---

> 💡 固化新操作的步骤：
> 1. 在浏览器中手动执行一次，用 snapshot 记录每步的 DOM 结构
> 2. 提取稳定选择器，添加到 `references/selectors.md`
> 3. 编写 PowerShell 脚本到 `scripts/<operation>.ps1`
> 4. 在 SKILL.md 中添加脚本用法
> 5. 从本文件中移除对应条目

---

> 📌 完整技术参考在 `references/technical-notes.md`，维护指南在 `SKILL.md` 末尾
