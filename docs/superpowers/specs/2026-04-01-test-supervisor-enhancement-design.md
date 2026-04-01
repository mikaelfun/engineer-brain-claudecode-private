# Test Supervisor 增强设计 — 优先级引擎 + 竞争修复 + 晨报系统

> 日期: 2026-04-01
> 状态: Draft
> 范围: 在现有 test supervisor 框架上增强，不重构核心循环

## 背景与动机

现有 test supervisor 架构（三层状态机 + 5 步循环 + 6 阶段 pipeline）已能自动发现 gap、生成测试、执行修复。但存在三个核心痛点：

1. **感知缺失** — 跑完一夜不知道做了什么、价值在哪
2. **优先级缺失** — 不知道测的东西是否重要，有没有遗漏更关键的问题
3. **决策质量低** — 无人值守时单 agent 随机性高，修复方案全靠运气

## 设计目标

- 睡前启动，晨起用 1-2 分钟掌握一夜成果
- 自动按用户体验影响排序测试，优先发现和修复流程断裂级问题
- 复杂修复通过多 agent 竞争产生更优方案
- Markdown 晨报 + Dashboard 可视化双通道输出

## 非目标

- 不重构核心 pipeline 循环（SCAN → GENERATE → TEST → FIX → VERIFY）
- 不实现跨 session 学习（标记为 future）
- 不实现定时触发（标记为 future，当前保持手动启动）
- 不实现 Teams 推送（标记为 future）

---

## 模块一：优先级引擎（SCAN 阶段增强）

### 影响力分级体系

| 等级 | 含义 | 示例 | 执行顺序 |
|------|------|------|---------|
| **P0 — 流程断裂** | 核心用户流程跑不通 | Case 处理流程中断、Dashboard 无法加载 | 最先 |
| **P1 — 功能故障** | 功能存在但执行异常 | 邮件草稿生成报错、Todo 执行失败、按钮点击无响应 | 次之 |
| **P2 — 体验退化** | 能用但体验差 | 单步骤耗时过长、UI 显示错乱、响应慢 | 再次 |
| **P3 — 代码质量** | 不影响用户但质量下降 | 架构不合理、代码重复、类型不安全 | 最后 |

### 分类时机

SCAN executor 发现 gap 时，同时输出 `impact` 字段。每个 scanner（architecture、design-fidelity、performance、issue）各自根据发现内容匹配分级规则。分级规则定义在 `playbooks/rules/impact-classification.md`。

### 队列排序

SCAN 完成后、TEST 开始前，新增一步 queue-sort：
- 按 P0 > P1 > P2 > P3 排序
- 同级内按发现时间排序
- 排序逻辑写入 `phases/state-update.md`

### 数据模型变更

`queues.json` 的每个 item 增加字段：

```json
{
  "id": "gap-001",
  "impact": "P1",
  "impactReason": "Todo执行按钮是用户日常操作的核心功能",
  "area": "dashboard",
  "...": "现有字段保持不变"
}
```

### 预算控制

可在 `pipeline.json` 中配置：

```json
{
  "priorityConfig": {
    "skipP3": false,
    "maxP3Items": 5,
    "p0p1Only": false
  }
}
```

`p0p1Only: true` 适用于时间紧张的短时运行。

---

## 模块二：竞争修复（FIX 阶段增强）

### 复杂度分流

FIX 阶段开始前，supervisor 在 Diagnose 步骤中对每个待修复项做复杂度判断：

| 类型 | 判断标准 | 处理方式 |
|------|---------|---------|
| **Trivial** | 单文件改动、明确的 typo/config 错误、有现成 recipe | 走现有单 agent 直修 |
| **Non-trivial** | 跨文件改动、多种可能根因、涉及架构决策、无匹配 recipe | 进入竞争修复流程 |

判断依据：错误类型、涉及文件数、是否有类似历史修复记录。

### 竞争修复流程

```
发现 non-trivial 问题
       │
       ▼
┌──────────────────────────────┐
│  Supervisor 构建问题包        │
│  (错误信息 + 上下文 + 约束)   │
└──────────┬───────────────────┘
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
  Agent A  Agent B  Agent C     ← 3 个 subagent 并行（worktree 隔离）
  保守方案  激进方案  中间路线     ← 各自带不同策略偏向
     │     │     │
     ▼     ▼     ▼
  plan_a   plan_b   plan_c      ← 各自输出：诊断 + 方案 + 预期风险
     └─────┼─────┘
           ▼
┌──────────────────────────────┐
│  Supervisor 评估打分          │
│  维度：正确性 / 风险 / 改动量  │
│       / 可测试性 / 副作用     │
│  → 选择最优 或 融合多方案      │
└──────────┬───────────────────┘
           ▼
     执行选中方案 → VERIFY
```

### 策略偏向

三个 subagent 收到相同的问题包，prompt 中注入不同决策倾向：

- **Agent A（保守）**：最小改动，优先不引入新风险，宁可 workaround
- **Agent B（激进）**：根治问题，允许较大重构，追求长期最优
- **Agent C（平衡）**：适度改动，兼顾短期可用与长期可维护

### 评分维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 正确性 | 35% | 方案是否真正解决问题 |
| 风险控制 | 25% | 改动是否可能破坏其他功能 |
| 改动范围 | 15% | 改动文件数和行数 |
| 可验证性 | 15% | VERIFY 阶段能否轻松验证 |
| 副作用 | 10% | 是否引入新的技术债 |

### 提案输出格式

每个 subagent 输出到 `tests/results/fix-proposals/`：

```json
{
  "agent": "conservative",
  "targetId": "gap-001",
  "diagnosis": "根因分析...",
  "plan": ["步骤1", "步骤2"],
  "files_affected": ["src/a.ts", "src/b.ts"],
  "risk_assessment": "...",
  "estimated_confidence": 0.85
}
```

### 安全约束

- 三个 subagent 各自在 git worktree 中工作，互不干扰
- 只有被选中的方案才 merge 回主分支
- 未选中的 worktree 自动清理
- 如果三个方案评分都低于 0.5 阈值，标记为 `needs_human`，不强行修复
- 评分决策过程写入 `supervisor.json` 的 reasoning 链中，保持可追溯

---

## 模块三：晨报系统（全程事件积累 + 结构化输出）

### 事件日志

整个运行过程中，每个有意义的动作写入 `tests/results/events.jsonl`：

```jsonl
{"ts":"2026-04-01T23:15:00","type":"feature_verified","impact":"P0","result":"pass","area":"casework","detail":"Case处理全流程正常完成"}
{"ts":"2026-04-01T23:32:00","type":"bug_discovered","impact":"P1","area":"dashboard","detail":"Todo执行按钮点击后无响应"}
{"ts":"2026-04-01T23:48:00","type":"bug_fixed","impact":"P1","area":"dashboard","detail":"修复event handler绑定丢失","method":"competitive","chosen":"conservative","confidence":0.9}
```

### 事件类型

| type | 含义 | 何时写入 |
|------|------|---------|
| `feature_verified` | 功能验收通过/失败 | TEST 阶段完成时 |
| `bug_discovered` | 发现 bug | TEST 失败分析后 |
| `bug_fixed` | bug 已修复 | FIX → VERIFY 通过后 |
| `fix_failed` | 修复失败 | VERIFY 未通过 |
| `perf_regression` | 性能退化 | performance scanner 检出 |
| `perf_improved` | 性能提升 | FIX 后性能好转 |
| `ui_issue` | UI/设计问题 | design-fidelity scanner 检出 |
| `flow_broken` | 核心流程断裂 | E2E 测试失败 |
| `needs_human` | 需人工介入 | 竞争修复评分都低 / 超出安全边界 |

写入由各 executor 和 stage-worker 负责，通过 `event-writer.sh` 统一追加，保证格式一致。

### 输出 A — Markdown 晨报

文件位置：`tests/results/morning-report-YYYY-MM-DD.md`

结构：

```
# 🌅 Test Supervisor 晨报 — {date}

## 执行概览
⏱️ 运行时长 | 🔄 Cycles 数 | 📋 测试项数
统计表格：验收通过/失败、Bug 发现/修复、需关注数、性能变化

## 🚨 需要你关注（P0-P1 未修复）
每项包含：区域、现象、尝试修复情况、建议操作

## ✅ 已自动修复
每项包含：根因、修复方式（直修/竞争修复）、改动文件

## 📊 Feature 验收详情
表格：Feature 名、结果、耗时、备注

## ⏱️ 性能观测
表格：操作、基线、本次、变化百分比

## 🎨 UI/设计发现
列表：发现的 UI 问题及影响等级

## 📝 竞争修复决策记录
每次竞争修复的方案对比表：方案、策略、评分、是否选中
```

### 输出 B — Dashboard 数据文件

文件位置：`tests/results/dashboard-data-YYYY-MM-DD.json`

```json
{
  "runDate": "2026-04-02",
  "duration": "6h23m",
  "cycles": 12,
  "summary": {
    "verified": 8,
    "failed": 2,
    "bugs": 5,
    "fixed": 3,
    "needsHuman": 2
  },
  "events": [],
  "byArea": {},
  "byImpact": {},
  "competitiveFixes": []
}
```

### Dashboard 页面

在 Dashboard 新增 **Test Results** 页面：
- 顶部：执行概览卡片（与晨报对应）
- 中间：事件列表，支持按 area / impact / type 筛选和排序
- 底部：历史趋势图（多日数据对比）
- 点击单个事件可 drill-down 查看详情

页面遵循现有 Dashboard 设计规范（暗色/浅色双主题、左侧边栏导航）。

---

## 涉及的文件变更

### 新增文件

| 文件 | 用途 |
|------|------|
| `playbooks/rules/impact-classification.md` | 影响力分级规则定义 |
| `tests/executors/event-writer.sh` | 事件日志统一写入工具 |
| `tests/executors/queue-sorter.sh` | 队列按优先级排序 |
| `tests/executors/morning-report-generator.sh` | 晨报生成脚本 |
| `tests/results/fix-proposals/` | 竞争修复提案目录 |
| Dashboard Test Results 页面相关组件 | 前端可视化 |

### 修改文件

| 文件 | 变更内容 |
|------|---------|
| `.claude/skills/stage-worker/phases/SCAN.md` | 加入 impact 分级指令 |
| `.claude/skills/stage-worker/phases/state-update.md` | 加入 SCAN 后队列排序步骤 |
| `.claude/skills/stage-worker/phases/FIX.md` | 加入复杂度分流 + 竞争修复流程 |
| `.claude/skills/stage-worker/phases/common.md` | 加入事件写入规范 |
| `.claude/agents/test-supervisor-runner.md` | Reflect 步骤加入晨报生成 |
| `.claude/agents/stage-worker.md` | 支持 worktree 隔离的竞争修复 spawn |
| `tests/queues.json` schema | 增加 impact / impactReason 字段 |
| `tests/pipeline.json` schema | 增加 priorityConfig 配置 |

---

## Future 增强（不在本次范围）

- **跨 session 学习**：supervisor 记住历史修复成功率，自动调整策略权重
- **定时触发**：配置每晚自动启动（Remote Trigger 或 cron）
- **Teams 推送**：晨报生成后通过 `SendMessageToSelf` 推送摘要
- **历史趋势分析**：Dashboard 跨日数据对比，识别长期退化趋势
