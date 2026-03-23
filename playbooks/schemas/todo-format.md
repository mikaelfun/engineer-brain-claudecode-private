# Todo 文件格式

## 文件位置
```
{casesRoot}/active/{case-id}/todo/YYMMDD-HHMM.md
```

## 文件格式
```markdown
# Todo — {case-id} — {YYYY-MM-DD HH:MM}

## 🔴 需人工决策
- [ ] {描述}

## 🟡 待确认执行
- [ ] 添加 Note: {内容摘要}          ← WebUI 可点击执行
- [ ] 记录 Labor: {时长} {描述}       ← WebUI 可点击执行
- [ ] 修改 SAP: {字段} → {值}        ← WebUI 可点击执行（SAP = Support Area Path，仅限产品分类路径变更；Status/Severity/Priority 等字段不属于 SAP）

## ✅ 仅通知
- [x] {已完成的事项}
```

## 分级规则

| 类别 | 含义 | WebUI 行为 |
|------|------|-----------|
| 🔴 需人工决策 | 需用户判断才能继续的事项 | 用户手动处理 |
| 🟡 待确认执行 | D365 写操作（Note/Labor/SAP） | 点击执行 → spawn agent 调 D365 脚本 |
| ✅ 仅通知 | 已完成的步骤 | 仅展示 |

## WebUI 交互
- Todo 页面从各 case 的 `todo/` 目录汇总最新 Todo
- 🟡 项目可以：✅ 点击执行 → 后端 spawn subagent 调 D365 脚本 / ❌ 标记跳过
- 执行后更新 Todo 文件中对应项为 `[x]`

## Inspection 中的 Todo section

inspection-YYYYMMDD.md 也包含 Todo section（同格式），但独立 todo 文件是持久化的事实源。
