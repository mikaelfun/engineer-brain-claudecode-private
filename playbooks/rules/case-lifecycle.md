# Case 生命周期

## Case 状态与行动

| Case 状态 | 含义 | 该做什么 |
|-----------|------|----------|
| **Pending Engineer** | 轮到工程师行动 | **继续处理，不是只提建议**：能直接答复就写邮件草稿；需要技术验证就继续排查；缺关键信息就写 `request-info` 草稿 |
| **Pending Customer** | 等客户回复 | 判断是否需要 follow-up；如需要则直接生成 follow-up 草稿 |
| **Pending PG ICM** | 等产品组处理 | 跟踪 ICM 进展；优先获取 ICM summary / details / impact，必要时查 team/on-call；如已足够对客同步，则直接生成更新草稿 |
| **Resolved** | 已解决 | 先发关单确认邮件（closure-confirm），等客户明确同意后再执行关单（closure） |
| **Closed** | 已关单 | 归档到 `${CASES_ROOT}/archived/` |

## actualStatus 判定指导（供 Main Agent 使用）

actualStatus 的判断不是简单的 if-else，需要 AI 综合理解 case 上下文。

### 关键原则

1. **不要依赖 D365 Status 字段**
   D365 Status（如 Troubleshooting）是工程师应该去更新的字段，
   不是判断实际状态的输入。actualStatus 是根据实际沟通情况判断的。

2. **ICM 状态需要动态查询**
   case-info.md 中有 ICM Number 不代表一定是 pending-pg。
   必须通过 ICM MCP 查询 ICM 当前状态：
   - PG 仍在处理 → pending-pg
   - PG 已完成/已反馈 → 可能是 pending-engineer（工程师需要传递信息给客户）

3. **最后邮件方向不等于状态**
   - 客户发来邮件 ≠ 一定是 pending-engineer
     可能客户发来的是模糊回复、缺少关键信息，此时应先索取更多信息
   - 工程师发出邮件 ≠ 一定是 pending-customer
     可能是内部通知或自闭环邮件

4. **结合邮件内容理解意图**
   - 工程师邮件建议"观察几天后反馈" → pending-customer
   - 客户邮件说"我试了还是不行" → pending-engineer
   - 客户邮件说"问题好像自己好了" → ready-to-close
   - 客户明确回复 "you can close" / "已解决" / "no more questions" → 可直接发 closure（不需要再发 closure-confirm）

### actualStatus 枚举值

| 值 | 含义 | casework 路由 |
|---|---|---|
| `new` | 新 Case，尚无沟通记录 | troubleshooter → email-drafter |
| `pending-engineer` | 轮到工程师行动 | troubleshooter → email-drafter |
| `pending-customer` | 等客户回复 | email-drafter（仅 daysSinceLastContact ≥ 3 时 follow-up） |
| `pending-pg` | 等产品组（ICM） | 不启动额外 agent，仅记录 |
| `researching` | 工程师正在排查中 | troubleshooter |
| `ready-to-close` | 客户问题已解决，可进入关单流程 | email-drafter (closure-confirm) |

### ready-to-close 判定标准

客户的回复**暗示问题已解决但未明确说可以关单**时判定为 `ready-to-close`：

| 客户回复示例 | 判定 |
|---|---|
| "Thank you, received with appreciation!" | `ready-to-close` — 感谢但未明确说关单 |
| "问题好像自己好了" / "It seems to be working now" | `ready-to-close` — 含不确定语气 |
| "我先试试你的方案" | `pending-customer` — 还在尝试中 |
| "you can close" / "已解决，可以关单" / "no more questions" | 可直接发 closure（跳过 closure-confirm） |
| "我试了还是不行" | `pending-engineer` |

### ready-to-close 两步关单流程

```
ready-to-close
  │
  ├─ 客户未明确说"可以关" ──→ 发 closure-confirm 邮件
  │                              │
  │                              ├─ 客户回复确认 ──→ 发 closure 邮件 + 关单
  │                              └─ 客户回复还有问题 ──→ 重新进入 pending-engineer
  │
  └─ 客户已明确说"可以关" ──→ 直接发 closure 邮件 + 关单
```

**为什么不直接关单**：客户可能只是礼貌性感谢，实际还有后续问题。closure-confirm 给客户一个明确的机会说"还有问题"，避免过早关单导致客户不满或重新开单。

**closure-confirm 邮件要点**：
- 引用之前给出的具体方案，让客户能快速对应上下文
- 礼貌询问方案是否生效 / 问题是否解决
- 提议关单，但留余地让客户反馈还有问题
- 不执行任何关单操作（不改 D365 Status）

### daysSinceLastContact 计算

- 从最后一封**工程师发出的邮件**到现在的自然日天数
- 用于判断是否需要 follow-up（≥ 3 天 且 actualStatus = pending-customer）

## Note 自动生成规则

- **触发条件**：距上次工程师 Note ≥ 3 天 且期间有新进展（新邮件、新查询结果等）
- **内容**：简要记录期间做了什么
- **目的**：保持 Case 有活动记录，避免 SLA 问题
- **执行方式**：先拟定内容，获取用户确认后再写入 D365

## Labor 自动记录规则

- **触发条件**：当天最后一次巡检且当天无 Labor 记录且当天有活动
- **内容**：当天在该 Case 上的工作时间
- **目的**：确保 Labor 不遗漏
- **执行方式**：先建议时长/内容，获取用户确认后再写入 D365

## Case 数据结构

> 完整目录结构和 schema 见 `playbooks/schemas/case-directory.md`。

## 已关单 Case 归档

- 巡检发现 Case 已关单 → 自动移到 `${CASES_ROOT}/archived/`
- 归档后不再巡检

## AR (Assistance Request) Case

AR 是其他 case owner 发来的协助请求，和普通 Case **统一放在 `active/`**，通过 `casework-meta.json` 的 `isAR: true` + `mainCaseId` 区分。

### 状态判断

| 状态 | 含义 | 行动 |
|------|------|------|
| Pending Case Owner | 等对方回复 | 无需操作，✅ 仅通知 |
| Pending AR Owner（你） | 需要你排查 | 进入排查流程 |

### 排查流程

1. 读自己的 `case-info.md` / `emails.md` / `notes.md`
2. 如果 main case 也在 `active/` → 直接读其邮件 / notes 了解上下文
3. 如果 main case 不在本地 → 用 d365-case-ops 拉 main case 的邮件 / notes（只读，不写入 main case 目录）
4. 排查方式和普通 Case 一致（`playbooks/guides/troubleshooting.md`）

### 关单

和普通 Case 一致 → 移到 `archived/`
