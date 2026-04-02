# OWA Email Extraction — 探索发现总结

## 已验证可行的部分

1. **Playwright + persistent profile + SSO**：启动 12s，后续 0s
2. **搜索**：`[role=search] [role=combobox]` + type + Enter
3. **点击搜索结果**：`[role=option]` 按 aria-label 匹配 caseNumber
4. **展开 conversation**：click "Expand conversation" 按钮
5. **触发懒加载**：`scrollIntoView` + `click` 每个 `[role=listitem]`
6. **提取 body**：`[aria-label="Message body"]` 的 `innerText`（纯文本，无需 HTML 清洗）
7. **过滤引用**：跳过 "发件人:" / "From:" 开头的嵌套引用块
8. **Session 隔离**：`-s=owa` 和 D365 的 default session 互不干扰

## 待解决问题

### P0: 多 Conversation 合并
- 一个 Case 的邮件可能分散在多个 conversation 中（subject 不同）
- 搜索返回多个 option（如 Case 0747 有 3 个）
- 当前脚本只取第一个 option → 遗漏其他 conversation 的邮件
- **修复方案**：在 JS 循环中，提取完一个 conversation 的数据存入变量后，再 click 下一个 option

### P1: Body 与 Listitem 配对
- listitem 在 reading pane 内部，body 也在 reading pane
- 但两者不是父子关系（reading pane 上下排列 listitem + 选中邮件的 body）
- scrollIntoView + click 可以触发所有 body 渲染（已验证 24/24）
- 但 body 和 listitem 的顺序配对是 best-effort，不保证 1:1 对应

### P2: playwright-cli 单实例限制
- 同一 profile 不能同时有两个 session
- OWA 和 D365 用不同 profile 解决
- 但 `-s=owa` 参数需要在脚本中传递

### P3: 固定 sleep vs 动态等待
- 当前脚本用 poll `[role=option]` 替代了搜索等待的固定 sleep
- 但 conversation expand 和 body 加载仍用固定 sleep
- 可以改为 poll body 数量变化来确认加载完成

## 性能数据

| 模式 | 单 Case 耗时 | 适用场景 |
|------|-------------|---------|
| Preview（label only） | ~20s | Case Review 快速浏览 |
| Full body（单 conversation） | ~45s | 深度分析 |
| Full body（多 conversation） | ~45s × N | 待实现 |

## 对比

| | Graph API (Mail MCP) | OWA (Playwright) |
|--|---------------------|-----------------|
| 速度 | ~10s 正常，限流后分钟级 | ~45s 稳定 |
| 限流 | ❌ 3 并发触发 | ✅ 无 |
| 内容 | HTML (需清洗) | 纯文本 innerText |
| 多 conversation | ✅ $search 全搜到 | ⚠️ 需要逐个 click option |
| Context 开销 | 100KB+ per email | 4.8-12KB total |
| 脚本化 | ✅ 全脚本 | ✅ 大部分脚本，异常需模型 |
