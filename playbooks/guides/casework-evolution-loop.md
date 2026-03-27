# Casework Evolution Loop — 持续测试与优化

## 使用方式
在另一个 Claude Code 窗口中执行：
```
/loop 12m [paste the prompt below]
```

## 提示词（直接复制）

```
你是 EngineerBrain casework 系统的 QA + 优化工程师。每次循环执行一个测试→分析→改进→验证 迭代。

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

**G. WebUI API 场景**（如 dashboard 在运行）
- curl POST /api/case/{id}/process → 验证 SSE 流正常
- curl POST /api/case/{id}/step/data-refresh → 验证单步 API

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

### Phase 4: 记录发现（30s）
将发现写入 `cases/test-results/evolution-log.md`，格式：
```markdown
## YYYY-MM-DD HH:MM — 循环 N
- 场景：{场景类型} + {caseId}
- 结果：✅ PASS / ⚠️ ISSUE / ❌ FAIL
- 耗时：{seconds}s
- 发现：{具体问题描述}
- 改进建议：{如果有}
```

### Phase 5: 实施改进（如有问题，2-5min）
如果发现了可修复的问题：
1. 读取相关 SKILL.md / agent.md / 脚本文件
2. 实施修复（Edit 工具）
3. 用**同一场景**重新测试验证修复有效
4. 更新 evolution-log.md 记录修复结果
5. 如果是重要教训，写入 `.learnings/LEARNINGS.md`

⚠️ 修复范围限制：
- ✅ 可以修改：SKILL.md、agent.md、.ps1 脚本、.sh 脚本、dashboard server/web 代码
- ❌ 不要修改：CLAUDE.md（需要用户确认）、playbooks/rules/（需要用户确认）
- ❌ 不要创建 conductor track — 小修直接改，大改记录到 evolution-log.md 等用户决策

### Phase 6: 恢复环境（15s）
- 恢复备份：`cp -r /tmp/casework-test-backup-{id}/* cases/active/{id}/`
- 清理临时文件

## 📈 进化方向优先级
1. **稳定性**：错误处理、边界条件、异常恢复
2. **效率**：减少 Bash 调用次数、优化缓存命中率、减少不必要的 Read/Glob
3. **一致性**：CLI vs WebUI 输出一致、不同 case 间行为一致
4. **可观测性**：日志完整性、timing 准确性、todo 生成质量

## ⚡ 每轮结束输出
简要总结：
- 本轮场景和结果
- 发现的问题数（已修复 / 待修复）
- 下轮计划测试的场景
```

## 说明
- 每 12 分钟执行一轮，足够跑完一次 casework + 分析 + 小修复
- 测试结果累积在 `cases/test-results/evolution-log.md`
- 重要修复自动写入 `.learnings/LEARNINGS.md`
- 大改动不自动实施，记录后等用户决策
- 每轮自动备份/恢复，不污染真实 case 数据
