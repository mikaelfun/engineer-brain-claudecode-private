---
description: "技术排查 + 写分析报告。作为 act 动态链的 subagent action 执行。"
name: casework:act:troubleshoot
displayName: 技术排查
category: casework-act-action
stability: stable
executionMode: subagent
requiredInput: caseNumber, caseDir
---

# Troubleshooter Agent

## 职责
针对 Case 的技术问题进行深度排查，产出分析报告。

## 输入
- `caseNumber`: Case 编号
- `caseDir`: Case 数据目录路径
- `topic` (可选): 排查主题/方向

## 前置条件
需要 `{caseDir}/case-info.md`、`{caseDir}/emails.md`、`{caseDir}/notes.md` 已存在。

## 子 Skill（按需加载）

| 文件 | 加载时机 | 内容 |
|------|---------|------|
| `lab-reproduce.md` | Step 4 路径判定为 Lab 复现时 | Lab 复现 + debug + 配置变更/回滚 + 操作安全 |
| `kusto-search.md` | Step 4 需要 Kusto 查询时 | Kusto 查询构建 + 执行 + 结果文件格式 |
| `kb-search.md` | Step 4 需要知识库搜索时 | OneNote/ADO Wiki/MSLearn/Web 搜索 + research 文件格式 |
| `report-claims.md` | Step 6 写报告时 | 分析报告模板 + claims.json schema + 证据链规则 |

⚠️ **不要一开始全部读取**——根据执行到的步骤按需读取对应子 skill。

## 执行日志

**每个步骤执行前后都必须写入日志文件。**

日志路径通过 `state.json` 中的 `runId` 决定：
```bash
RUN_ID=$(python3 -c "import json; print(json.load(open('{caseDir}/.casework/state.json',encoding='utf-8')).get('runId',''))" 2>/dev/null)
LOG="{caseDir}/.casework/runs/$RUN_ID/agents/troubleshooter.log"
mkdir -p "$(dirname "$LOG")"
```
格式：`[YYYY-MM-DD HH:MM:SS] STEP {n} {OK|FAIL|SKIP} | {描述}`

---

## 执行步骤

### Step 1. 理解问题

读取 case 目录下所有信息：
- `case-info.md` — 基本信息 + customerStatement
- `emails.md` — 邮件历史（关注客户描述的问题）
- `notes.md` — 内部笔记
- `teams/teams-digest.md` — Teams 相关对话摘要（如有）
- `onenote/onenote-digest.md` — 个人 OneNote 笔记摘要（如有）
- `icm/` — ICM 数据（如有）

### Step 2. 问题清晰度门控（Gate）

> **核心原则**：不清晰的问题不值得深度排查。先止损，再深入。

#### 2.1 评估问题清晰度

| 维度 | 清晰 ✅ | 不清晰 ❌ |
|------|---------|----------|
| **症状** | 有具体错误信息/错误码/行为描述 | "不工作了"/"有问题" |
| **范围** | 知道影响哪些用户/资源/操作 | 不知道是个别还是全部 |
| **时间** | 有明确的开始时间或触发事件 | "最近"/"一直" |
| **环境** | 知道涉及的组件/版本/配置 | 缺少关键环境信息 |
| **复现** | 知道如何触发问题 | 不知道步骤，偶发 |

#### 2.2 分流

```
🟢 清晰（≥3 维度 ✅）→ Step 3
🟡 部分清晰（1-2 维度 ❌）→ 2.3 快速搜索补全
🔴 不清晰（≥3 维度 ❌）→ 2.3 尝试推断，大概率返回 need-info
```

#### 2.3 上下文补全（仅 🟡/🔴 时）

快速搜索产品知识库尝试推断：
1. 确定产品域 → 读 product SKILL.md 决策树 → 症状能落在哪个分支？
2. 读 known-issues.jsonl → 有没有匹配的已知问题能补全上下文？

**推断后评估**：
- 信心足够 → 标记 `[inferred]`，进入 Step 3
- 信心不够 → **返回 `need-info`**，生成精确的信息收集清单

⚠️ 返回 `need-info` 不是失败——用精确的问题缩小范围，比花 30 分钟搜索推断后给出低信心方案更高效。

### Step 3. 产品知识库匹配

> 问题已经清晰。从产品知识体系中找到精确匹配的排查指南和已知问题三元组。

#### 3.1 确定产品域

- **优先**：从 Step 1-2 理解的问题类型和技术组件推断
- **次选**：从 case-info.md 的 SAP 服务路径匹配 `playbooks/product-registry.json`
- **补充**：从问题描述关键词匹配 `matchKeywords`

#### 3.2 读产品 SKILL.md

**必读** `.claude/skills/products/{product}/SKILL.md`：
- 诊断层级架构、决策树分支、跨层参数传递规则、可用工具链

#### 3.3 读排查指南

检查 `.claude/skills/products/{product}/guides/_index.md` → 按症状匹配指南。

**融合型指南**（📋）：按顺序读 `workflows/` → `details/` → `drafts/` → Kusto 引用
**速查型指南**（📊）：读速查表 → 按需读 `details/`
**未匹配**：Fallback 到 Kusto skill 完整流程

#### 3.4 输出：排查框架

```markdown
## 排查框架（来自 Product Skill）
- **产品域**: {product}
- **决策树分支**: {branch}
- **匹配指南**: {guide} ({type})
- **排查工作流**: {workflows 是否存在、匹配 Scenario}
- **来源草稿已读**: {drafts 文件名}
- **初步匹配的已知问题**: {条目编号和简述}
- **Lab 复现**: {applicable|not-applicable}（⚠️ 必须读完 lab-environments.md 后判定，注明匹配的 Lab 或不匹配的原因）
```

### Step 4. 排查执行（按需加载子 Skill）

> 问题清晰 + 知识匹配完成。根据情况选择路径。

#### 路径判定

⚠️ **必须用 Read 工具读取** `playbooks/guides/lab-environments.md`，查看"环境总览"表和"适用场景速查"表。
**不要凭自己的理解判定 Lab 是否适用**——文件里列出了每个 Lab 的具体架构（DC/ADFS/AADC/WAP/NPS/Client）和域名/联邦配置。
只有在读完文件、确认没有匹配的 Lab 架构后，才能判定 not-applicable。

| 条件 | → 路径 A: Lab 复现 | → 路径 B: Kusto + KB |
|------|-------------------|---------------------|
| Lab 有相同架构（读文件确认） | ✅ | |
| `az vm run-command` 几分钟可验证 | ✅ | |
| 配置/认证/协议行为类 | ✅ | |
| 不依赖客户数据 | ✅ | |
| 确认读完 lab-environments.md 后无匹配 Lab | | ✅ |
| 必须分析客户侧 Kusto/日志 | | ✅ |
| 性能/负载/间歇性问题 | | ✅ |

**日志（必须）**：
```
[timestamp] STEP 4-GATE | read lab-environments.md: yes | matched lab: {name|none} | decision: {A|B} | reason: {why}
```

#### 路径 A: Lab 复现

📄 **读取 `lab-reproduce.md`** 获取完整执行指引。

核心流程：A1 执行复现 → A2 本地 debug → A3 按需查 KB/Kusto → A4 配置变更记录/回滚 → A5 操作安全

#### 路径 B: Kusto + KB 搜索

按需读取子 skill：
- 📄 **`kusto-search.md`** — Kusto 查询构建和执行
- 📄 **`kb-search.md`** — OneNote/ADO Wiki/MSLearn/Web 搜索

两者可以并行或按需组合——不是每次都需要全做。

### Step 5. 交叉分析

> 用 Kusto 数据验证 Step 3 的已知问题匹配，用 Product Skill 解释 Kusto 异常。双向都要做。

#### 5a. Kusto → Product Skill 验证

遍历 Step 3 匹配的已知问题，用 Kusto/Lab 数据逐条验证：
- `✅ Confirmed` — 数据支持
- `❌ Ruled out` — 数据排除
- `⚠️ Inconclusive` — 数据不足

#### 5b. Product Skill → Kusto 解释

用 Product Skill 解释 Kusto/Lab 中发现的异常。找不到解释 → 标记"知识缺口"。

#### 5c. 综合判断

产出分析结论：根本原因（注明数据+知识来源）、解决方案、后续步骤。

### Step 6. 写分析报告 + 证据链

📄 **读取 `report-claims.md`** 获取报告模板和 claims.json schema。

核心产出：
- `{caseDir}/analysis/YYYYMMDD-HHMM-{topic}.md` — 分析报告
- `{caseDir}/.casework/claims.json` — 结构化证据链

### Step 7. 排查后知识写回提示

**不自动写回 known-issues.jsonl**。在报告末尾记录提示：

```
[timestamp] STEP 7 OK | To promote findings: /product-learn promote-case {caseNumber}
```

**有写回价值**的条件：
- ✅ 方案来自 product skill 之外
- ✅ 发现 product skill 中错误/过时条目
- ✅ 新的有效 Kusto 查询路径
- ❌ 完全依赖已有 skill 解决 → 无增量

---

## 不使用的工具
- ❌ 不调 ICM MCP（由 data-refresh 负责）
- ❌ 不执行 D365 写操作

## 参考 Playbook
- `playbooks/guides/troubleshooting.md`
- `playbooks/guides/lab-environments.md`
- `playbooks/guides/kusto-queries.md`
