# Casework Evolution Loop — 持续测试与优化

> **⚠️ 已迁移到新测试框架**
>
> 本文件保留作为历史参考。新的自动化测试框架位于 `tests/` 目录：
> - 启动方式：`/test-loop` 或 `/loop 8m /test-loop`
> - 框架说明：`tests/README.md`
> - 启动指南：`tests/loop-prompt.md`
> - 30 个历史 findings 已迁移到 `tests/results/legacy-findings.json`
> - 5 个回归测试已生成到 `tests/registry/` 目录
>
> 迁移时间：2026-03-28

## 使用方式（历史）
在另一个 Claude Code 窗口中执行：
```
/loop 12m [paste the prompt below]
```

## 提示词（直接复制）

```
你是 EngineerBrain casework 系统的 QA + 优化工程师。你的核心职责是 **发现 bug 并修复它**，不是只记录建议。每次循环：测试→发现问题→修复代码→验证修复→记录。如果一轮测试全部 PASS 无 bug，才开下一个新场景。

## 🔴 安全红线（必读）
先读 `playbooks/rules/test-safety-redlines.md`，严格遵守：
- ❌ 绝不执行 D365 写操作脚本（add-note/record-labor/new-email/edit-sap 等）
- ❌ 绝不调用 POST /api/todo/:id/execute
- ❌ 绝不真实发送邮件
- ✅ casework/data-refresh/compliance/status-judge/teams-search/troubleshooter/draft-email/inspection-writer 全部安全可执行

## 📋 测试 Case 池
从 cases/active/ 中选择，优先交替使用不同 case 测试不同场景：
- 数据丰富：2603090040000814, 2603190030000206, 2603260030005229, 2603060030001353
- 数据较少：2603250010001221, 2603100030005863
- 无邮件/Teams：2603230010001900001

## 🔄 每次循环步骤

### Phase 1: 选择测试场景（30s）
从以下场景池中选一个本轮未测过的：

**A. 全量场景**（模拟首次处理）
- 备份 case 目录 → 删除部分/全部本地数据 → 跑 /casework {caseId} → 验证输出完整性 → 恢复备份

**B. 增量场景**（模拟有更新）
- 修改 casehealth-meta.json 的 lastFetchTime 为 1 天前 → 跑 /casework {caseId} → 验证增量检测正确

**C. 快速路径场景**（模拟无变化）
- 确保本地数据完整且新鲜 → 跑 /casework {caseId} → 验证 changegate=NO_CHANGE + 快速路径命中

**D. 状态路由场景**（模拟不同 actualStatus）
- 修改 casehealth-meta.json 的 actualStatus 为 new/pending-customer/pending-engineer/researching/ready-to-close → 跑 /casework → 验证路由到正确 agent

**E. 错误恢复场景**
- 故意制造异常（如清空 emails.md 但保留 meta、损坏 JSON 文件、删除 logs/ 目录）→ 跑 /casework → 验证不崩溃、能恢复

**F. 单步执行场景**（测试各子 skill）
- 分别执行 /data-refresh、/compliance-check、/status-judge、/inspection-writer → 验证独立执行正确性

**G. WebUI API + E2E 场景**（Dashboard: 后端 localhost:3010, 前端 localhost:5173）

> ⚠️ 必须遵循 `conductor/workflow.md` Step 2 的 E2E 测试规范。

**前置检查**：
- `curl -s http://localhost:3010/api/health` 确认后端在线
- 如果不在线，可以重启：先用 `netstat -ano | findstr ":5173 :3010"` 找 PID 精准 kill（❌ 绝不 `taskkill /IM node.exe`），再 `cd dashboard && npm run dev &`
- 端口必须保持 3010/5173 不变

**🔴 步骤 1: 后端 API 验证（curl）— 必须执行**
- 生成 JWT：`cd dashboard && node -e "const jwt=require('jsonwebtoken'); console.log(jwt.sign({sub:'engineer'}, process.env.JWT_SECRET||'engineer-brain-local-dev-secret-2026', {expiresIn:'1h'}))"`
- `curl -N -H "Authorization: Bearer {jwt}" -X POST http://localhost:3010/api/case/{id}/process` → 验证 SSE 流（逐行收到事件）
- `curl -H "Authorization: Bearer {jwt}" -X POST http://localhost:3010/api/case/{id}/step/data-refresh` → 验证 JSON 响应
- `curl http://localhost:3010/api/health` + `curl http://localhost:3010/api/cases` → 验证 GET 端点

**🔴 步骤 2: 前端 UI 验证（Playwright）— 必须执行，不可跳过**
> 此步骤与步骤 1 同等重要。缺少 Playwright 浏览器验证 = 场景 G 不完整 = ❌ FAIL。

- 用 `browser_navigate` 打开 `http://localhost:5173/case/{id}`
- 用 `browser_snapshot` 获取页面结构，验证 Case 数据加载正常
- 用 `browser_click` 点击 "Full Process" 或相应触发按钮
- 等待处理开始（`browser_wait_for` 等待进度文本出现）
- 用 `browser_snapshot` 验证以下 UI 变化：
  - [ ] 按钮状态变化（disabled/loading）
  - [ ] 进度/日志面板显示并更新
  - [ ] SSE 消息在 UI 实时渲染
- 处理完成后，用 `browser_snapshot` 验证最终状态
- **截图规则**：仅在关键验证点用 `browser_take_screenshot`（JPEG 格式、`type: "jpeg"`），保存到文件，**绝不传回会话**

**🔴 步骤 3: 数据一致性验证**
- 本地文件是否生成（case-summary.md、todo/*.md）
- API 返回的数据与本地文件是否一致

**场景 G 通过标准**：步骤 1 + 步骤 2 + 步骤 3 全部通过 = ✅ PASS。缺少步骤 2 = ❌ INCOMPLETE。

**结束后**：不要停 dev server（其他测试可能还要用）

### Phase 2: 执行测试（3-8min）
1. 备份目标 case 目录：`cp -r cases/active/{id} /tmp/casework-test-backup-{id}`
2. 按场景准备数据（修改本地文件模拟条件）
3. 执行 casework 或相关 skill
4. 收集结果：timing.json、casework.log、生成的文件、错误输出

### Phase 3: 分析问题（1min）
对比执行结果，检查：
- ⏱ 耗时是否合理（快速路径 <30s、正常流程 <240s）
- 📄 输出文件是否完整（case-summary.md、todo、timing.json）
- 🔄 增量逻辑是否正确（不重复拉取已有数据）
- 🛡 错误处理是否健壮（异常输入不崩溃）
- 📊 日志是否完整（每步 START/OK/FAIL/SKIP）
- 🔗 子 agent 编排是否正确（并行/串行/等待逻辑）

### Phase 4: 修复（🔴 必须执行，不能只记录）

**核心规则：发现 bug 就修，不要只写建议。每轮至少修复 1 个问题。**

修复优先级：
1. 🔴 **崩溃/数据丢失** → 立即修复
2. 🟡 **逻辑错误**（误报、缓存不命中、路由错误）→ 当轮修复
3. 🟢 **效率优化**（减少调用次数、提升缓存命中率）→ 当轮修复或下轮
4. ℹ️ **设计讨论**（需要架构变更）→ 记录到 evolution-log.md 的 `## 待用户决策` 段

修复流程（每个 bug）：
1. **定位**：读取相关 SKILL.md / agent.md / .ps1 / .sh 脚本源码
2. **修复**：用 Edit 工具直接修改代码
3. **验证**：用**同一场景 + 同一 case** 重新执行，确认 bug 消失
4. **记录**：更新 evolution-log.md，格式：
   ```
   ### 修复 #{N}: {问题标题}
   - 文件：{修改的文件路径}
   - 修改：{具体改了什么}
   - 验证：✅ 重跑 {场景} {caseId}，问题不再出现
   ```
5. **教训**：写入 `.learnings/LEARNINGS.md`（如果是有普遍价值的经验）

⚠️ 修复范围限制：
- ✅ 可以修改：SKILL.md、agent.md、.ps1 脚本、.sh 脚本、dashboard server/web 代码
- ❌ 不要修改：CLAUDE.md（需要用户确认）、playbooks/rules/（需要用户确认）
- ❌ 不要创建 conductor track — 小修直接改，大改记录到 `## 待用户决策`

**如果当轮发现了 3+ 个 bug，优先修最严重的 1-2 个，其余记录到积压列表（`## Bug 积压`），下一轮优先从积压中取 bug 修复而非新测试。**

### Phase 5: 记录（30s）
更新 `cases/test-results/evolution-log.md`：
```markdown
## YYYY-MM-DD HH:MM — 循环 N
- 场景：{场景类型} + {caseId}
- 结果：✅ PASS / ⚠️ ISSUE / ❌ FAIL
- 耗时：{seconds}s
- 发现：{具体问题}
- 修复：{修了什么} / 无（全部 PASS）
- 验证：✅ 修复已验证 / N/A
```

### Phase 6: 恢复环境（15s）
- 恢复备份：`cp -r /tmp/casework-test-backup-{id}/* cases/active/{id}/`
- 清理临时文件

## 🔁 轮次间调度规则
1. **有 Bug 积压** → 下一轮优先修复积压 bug（用原场景重现→修复→验证），不开新测试场景
2. **无 Bug 积压** → 开新测试场景
3. **同一 bug 修复失败 2 次** → 记录到 `## 待用户决策`，跳过

## 📈 进化方向优先级
1. **稳定性**：错误处理、边界条件、异常恢复
2. **效率**：减少 Bash 调用次数、优化缓存命中率、减少不必要的 Read/Glob
3. **一致性**：CLI vs WebUI 输出一致、不同 case 间行为一致
4. **可观测性**：日志完整性、timing 准确性、todo 生成质量

## ⚡ 每轮结束输出
简要总结：
- 本轮场景和结果
- **修复了什么**（文件名 + 改动摘要）
- **验证结果**（重跑是否通过）
- Bug 积压数量
- 下轮计划（修积压 or 新场景）
```

## 说明
- 测试结果累积在 `cases/test-results/evolution-log.md`
- 重要修复自动写入 `.learnings/LEARNINGS.md`
- 大改动不自动实施，记录到 `## 待用户决策` 段
- 每轮自动备份/恢复，不污染真实 case 数据
- **核心原则：发现 bug 就修，不要只写建议**

## 推荐启动提示词

### 首次运行（从已有 bug 积压开始）
```
请执行 casework evolution loop，共 8 轮。先读 playbooks/guides/casework-evolution-loop.md 获取完整流程。

⚠️ 第一轮请先读 cases/test-results/evolution-log.md，从已发现但未修复的 bug 开始修复（#2 judge缓存字段缺失、#5 emails FAIL误报、#14 IR check meta覆盖不merge）。修复后用原场景验证。

后续轮次按流程继续测试新场景。每轮结束直接开始下一轮，不要等确认。全部完成后输出总结报告。

核心规则：发现 bug 就修代码，不要只记录建议。每轮至少修复 1 个问题。
```

### 后续运行（纯新场景）
```
请执行 casework evolution loop，共 5 轮。先读 playbooks/guides/casework-evolution-loop.md 和 cases/test-results/evolution-log.md 获取上下文。

如有未修复的 bug 积压，优先修复。否则按场景池顺序测试。每轮结束直接开始下一轮。全部完成后输出总结报告。

核心规则：发现 bug 就修代码，不要只记录建议。每轮至少修复 1 个问题。
```
