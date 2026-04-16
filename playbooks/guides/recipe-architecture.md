# Recipe Architecture — 推理驱动 + 自我演进标准指南

> 共享三层架构模式，供 verification / todo / routing / email / patrol / troubleshooting 领域引用。
> 版本：v1.0 | 创建：2026-03-29 | 来源：ISS-148 (verify-redesign) 提取

---

## 1. 三层架构概览

```
Layer 1: Recipe Index (_index.md)
  → 匹配规则表（优先级排序）+ 演进日志 + 版本号
  → 无匹配时 fallback 到从零推理

Layer 2: LLM 推理层
  → 读 context → 查 index 匹配 → 有 recipe 按步骤执行 → 无 recipe 从零推理

Layer 3: 反思演进
  → 执行后自问触发条件 → 满足则创建/更新 recipe + 记录演进日志
```

每个领域独立维护自己的 `_index.md` 和 recipe 文件，但遵循相同的格式和流程。

---

## 2. Recipe Index 标准格式

每个领域的 `_index.md` 必须包含以下三部分：

### 2.1 匹配规则表

```markdown
## 匹配规则（按优先级）

| 优先级 | 匹配条件 | Recipe 文件 |
|-------|---------|------------|
| 1     | {条件描述} | [recipe-name.md](./recipe-name.md) |
| 2     | {条件描述} | [recipe-name.md](./recipe-name.md) |
| N     | 以上都不匹配 | LLM 从零推理 |
```

**规则：**
- 优先级数字越小越优先
- 最后一行始终是"从零推理"兜底
- 一个输入可匹配多个 recipe，按需组合

### 2.2 版本号

```markdown
> 版本：v{major}.{minor} | 最后更新：{YYYY-MM-DD}
```

- major：新增/删除 recipe 时递增
- minor：更新已有 recipe 内容时递增

### 2.3 演进日志

```markdown
## 演进日志

| 日期 | Recipe | 变更 | 原因 |
|------|--------|------|------|
| 2026-03-29 | 全部 | 初始创建 | {来源 issue} |
```

每次 recipe 变更必须追加一行记录。

---

## 3. LLM 推理层标准流程

所有领域的 SKILL.md 中，使用 recipe 的步骤遵循统一的四步流程：

```
Step A: 收集 Context
  → 读取领域特定的输入源（见第 5 节各领域适配）

Step B: 查询 Index 匹配
  → 读 _index.md 匹配规则表
  → 按优先级逐条检查，返回匹配到的 recipe 列表

Step C: 执行
  → 有匹配 recipe：读 recipe 文件 → 按步骤执行 → 参考"常见坑"避坑
  → 无匹配 recipe：LLM 基于 context 从零推理，自主决定步骤

Step D: 输出 + 记录匹配结果
  → 输出执行结果
  → 记录"使用了哪个 recipe"或"从零推理"到元数据中
```

**关键原则：**
- Recipe 是**经验参考**，不是死板模板 — LLM 应根据具体场景调整
- 即使走"从零推理"路径，也优先参考 recipe 中的**前置检查**和**常见坑**
- 匹配结果要记录，便于后续分析哪些场景缺少 recipe

---

## 4. 反思演进标准

### 4.1 触发条件表

执行完毕后，LLM 自问以下条件。**任一满足则触发反思**：

| 触发条件 | 检查方式 | 动作 |
|---------|---------|------|
| 执行某步骤时重试 >= 2 次 | 计数 retries | 提取为新 recipe |
| 遇到环境/工具/配置坑 | issues_encountered 非空 | 追加到已有 recipe 的"常见坑" |
| LLM 生成了较长的执行方案（> 10 步或 > 10 行脚本） | 检查生成内容长度 | 考虑提取为 recipe |
| 现有 recipe 的步骤过时或有误 | recipe_mismatches 非空 | 修正 recipe |
| 用户对输出做了大量编辑（diff > 30%） | 比较 draft vs final | 提取编辑模式到 recipe |

**全部不满足 → 跳过反思。** 输出："执行顺利，无需更新 recipe。"

### 4.2 操作流程

当触发反思时：

1. **自问清单：**
   - 哪些步骤花了 > 2 次尝试？
   - 遇到了哪些意外的坑（环境、工具、配置）？
   - 这些经验已在已有 recipe 中吗？
   - 已有 recipe 的步骤是否需要修正？

2. **新建 recipe：**
   - 创建 `{领域-recipes}/{new-recipe-name}.md`
   - 遵循标准 recipe 格式（见下方 4.3）
   - 更新 `_index.md` 匹配规则表 + 演进日志

3. **更新已有 recipe：**
   - 编辑对应 recipe 文件
   - 新增"常见坑"条目 / 修正步骤
   - 更新 `_index.md` 演进日志

### 4.3 标准 Recipe 文件格式

```markdown
# Recipe: {名称}

> 适用于：{一句话描述匹配条件}

## 匹配条件
- {条件 1}
- {条件 2}

## 前置检查
- [ ] {检查项 1}
- [ ] {检查项 2}

## 执行步骤
1. {步骤 1}
2. {步骤 2}

## 常见坑

| 坑 | 表现 | 解法 |
|----|------|------|
| {坑 1} | {症状} | {解法} |
```

---

## 5. 领域适配说明

各领域复用三层架构，但 context 来源、recipe 粒度、演进信号各不相同：

| 领域 | Recipe 目录 | Context 来源 | Recipe 粒度 | 演进信号 |
|------|------------|-------------|-------------|---------|
| **Verification** | `verification-recipes/` | spec.md AC + 代码变更 | 按验证类型（UI/CLI/API/File） | 重试>=2, 脚本>10行 |
| **Todo** | `todo-recipes/` | casework-meta + severity + 邮件 + ICM | 按 case 状态 × severity | 用户编辑 todo, 规则漏判 |
| **Routing** | `routing-recipes/` | actualStatus + 邮件历史 + severity + ICM | 按路由场景（首次/跟进/升级） | 路由错误需人工纠正 |
| **Email** | `email-recipes/` | actualStatus × emailHistory × severity | 按邮件类型（initial/follow-up/closure） | draft vs sent diff > 30% |
| **Patrol** | 无独立 recipe 目录 | severity + SLA + lastInspected + recentEmail | 评分公式参数 | 评分结果与人工排序不一致 |
| **Troubleshoot** | `troubleshooting-recipes/` | case-info + 邮件 + 错误码模式 | 按问题类型（error-code/perf/access/intermittent） | 排查>3轮未收敛 |

**注意：** Patrol 不使用 recipe 文件，而是在 SKILL.md 中定义评分公式参数。三层架构中只用 Layer 2（LLM 推理评分）和 Layer 3（评分公式调优反思）。

---

## 6. 何时不应使用 Recipe

以下场景应保持**硬编码规则**，不应引入 recipe 推理：

| 场景 | 原因 |
|------|------|
| **安全红线** | D365 写操作、危险按钮点击 — 安全规则不可由 LLM 推理决定 |
| **数据契约/Schema** | JSON 字段名、API response shape — 必须精确匹配 |
| **UI Token/常量** | CSS 变量、颜色值、间距 — 设计系统决定，不需推理 |
| **认证/鉴权流程** | JWT 生成、OAuth flow — 安全敏感，步骤固定 |
| **文件路径约定** | case 目录结构、config 路径 — 项目约定，不需推理 |

**判断标准：** 如果一个决策的**正确答案只有一个且不随上下文变化**，就不需要 recipe。Recipe 适用于**正确答案取决于上下文**的决策。

---

_参照实现：`playbooks/guides/verification-recipes/_index.md` + `.claude/skills/conductor/verify/SKILL.md`_
_本指南由 ISS-149 (recipe-arch_20260329) 创建，供后续领域 track 引用。_
