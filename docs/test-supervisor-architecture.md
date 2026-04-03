# Test Supervisor 架构深度分析报告

**生成日期**: 2026-04-01  
**项目**: EngineerBrain  
**版本**: 1.0

---

## 📋 目录

1. [核心架构概览](#核心架构概览)
2. [完整目录结构](#完整目录结构)
3. [状态机设计](#状态机设计)
4. [Recipe 系统](#recipe-系统)
5. [Executor 执行器](#executor-执行器)
6. [Agent 系统](#agent-系统)
7. [执行流程详解](#执行流程详解)
8. [现有问题与局限](#现有问题与局限)

---

## 核心架构概览

### 设计理念

Test Supervisor 是一个**文件驱动的状态机 + 主-子Agent + 监督式循环**的自动化测试框架：

- **文件驱动**: 所有状态（state.json、pipeline.json、queues.json）通过原子写入维护
- **主-子Agent**: 主 Supervisor 进程管理循环，每个阶段 spawn stage-worker 子 Agent 隔离执行
- **监督式循环**: Supervisor 在每个循环执行 5 步（观察→诊断→决策→行动→反思）

### 核心承诺

状态机流程：

SCAN → GENERATE → TEST → FIX → VERIFY → SCAN (cycle++)

每个循环周期：
- 发现待测试功能（gap）
- 为 gap 生成测试定义
- 执行测试
- 分析并修复失败
- 验证修复有效

---

## 完整目录结构

### 核心状态文件

tests/
├── pipeline.json           # 当前管道状态（phase、cycle、stages、stats）
├── queues.json             # 队列状态（testQueue、fixQueue、verifyQueue、regressionQueue、gaps）
├── supervisor.json         # Supervisor 实时状态（step、reasoning、selfHealEvent）
├── stats.json              # 累计统计数据

### 配置与规则

├── safety.yaml             # 安全规则清单（SAFE/BLOCKED/REVIEW）
├── env.yaml                # 环境配置（端口、密码、case 池）
├── scan-strategies.yaml    # Scanner 调度策略
├── recovery-tools.yaml     # 框架自愈工具
├── learnings.yaml          # 踩坑经验库（FIX 追加）
├── baselines.yaml          # 性能基线（VERIFY 阶段更新）

### 测试定义与记录

├── registry/               # 测试定义库（YAML 格式）
│   ├── backend-api/        # 后端 API 测试（~50+ 文件）
│   ├── ui-interaction/     # UI 交互测试
│   ├── ui-visual/          # UI 视觉/设计测试
│   ├── workflow-e2e/       # 工作流 E2E 测试
│   └── arch/               # 架构扫描测试

├── results/                # 测试结果存档
│   ├── {round}-{testId}.json       # 单个测试结果
│   ├── round-{N}-summary.json      # 每轮统计汇总
│   └── fixes/              # 修复报告

### 执行器与脚本

├── executors/              # Bash 执行器脚本
│   ├── common.sh           # 共享工具库
│   ├── state-writer.sh     # 原子状态写入
│   ├── api-runner.sh       # API 执行器
│   ├── e2e-runner.sh       # E2E 执行器
│   ├── fix-analyzer.sh     # 失败分析
│   └── ... 20+ 其他执行器

### Recipe 系统

├── recipes/                # 执行策略库
│   ├── scan/_index.md      # SCAN recipe 匹配规则
│   ├── scan/plateau-breaking.md    # Coverage 停滞突破
│   ├── scan/regression-focused-scan.md  # 回归聚焦
│   └── fix/_index.md       # FIX recipe 匹配规则

### Agent 定义

.claude/agents/
├── test-supervisor-runner.md  # Supervisor 推理引擎
├── stage-worker.md            # Stage Worker 执行器

.claude/skills/
├── test-supervisor/SKILL.md   # Test Supervisor 技能
├── stage-worker/SKILL.md      # Stage Worker 技能
└── stage-worker/phases/       # 5 个阶段文件

---

## 状态机设计

### 1. Pipeline 状态 (pipeline.json)

```json
{
  "currentStage": "TEST",
  "cycle": 47,
  "maxCycles": 80,
  "pipelineStatus": "running",
  "stages": {
    "SCAN": {
      "status": "done",
      "summary": "5 issue gaps",
      "duration_ms": 1775000761396
    }
    // ... 其他 5 个 stage
  }
}
```

### 2. 队列状态 (queues.json)

- **testQueue**: 待测试的项
- **fixQueue**: 待修复的失败测试
- **verifyQueue**: 待验证的修复
- **regressionQueue**: 回归测试项
- **gaps**: 未测试的功能缺口
- **skipRegistry**: 跳过的测试（reason：escalated/timeout-systemic/no-assertions）
- **inProgress**: 当前正在执行的项

### 3. Supervisor 状态 (supervisor.json)

```json
{
  "status": "idle",
  "step": "decide",
  "reasoning": {
    "observe": "...",
    "diagnose": "...",
    "decide": "...",
    "act": "...",
    "reflect": "..."
  },
  "selfHealEvent": {
    "type": "pattern-detected",
    "description": "..."
  }
}
```

### 状态转换图

SCAN → 有 gap? 
├─ YES → GENERATE → TEST
└─ NO → TEST

TEST → 有失败?
├─ YES → FIX → 修复成功?
│ ├─ YES → VERIFY
│ └─ NO → 回到 FIX
└─ NO → VERIFY

VERIFY → 通过?
├─ YES → cycle++，回到 SCAN
├─ NO（有回归）→ 回到 FIX
└─ NO（systemic）→ 自愈，下一轮 SCAN

---

## Recipe 系统

### SCAN Recipes

#### 1. Plateau-Breaking Recipe

**触发条件**: Coverage 连续 3 轮不变（80% 上下浮动）+ greenRate > 90%

**执行**:
- 强制启用 design-fidelity、architecture scanner
- 扫描 error-handling paths、edge cases、integration boundaries
- 检查历史过滤的 gap，重新注入

**预期**: 1-2 轮内 coverage 恢复增长

#### 2. Regression-Focused-Scan Recipe

**触发条件**: 某 category regressionRate > 40%

**执行**:
- 针对高回归类别强制扫描
- 该 category 下已 fix 的测试 → 检查 side-effect
- 注入 GENERATE directive：补充 regression guard

**预期**: 2-3 轮内 regressionRate 降到 < 20%

### FIX Recipes

- env-service-down.md: 服务不可达修复
- auth-token-expired.md: 认证过期修复
- playwright-environment.md: 浏览器环境修复

---

## Executor 执行器

### Test Executors

- **api-runner.sh**: 执行 API 测试
- **e2e-runner.sh**: 执行工作流 E2E 测试
- **observability-runner.sh**: 执行可观测性探针

### Scanners

- **architecture-scanner.sh**: 架构规范扫描
- **design-fidelity-scanner.sh**: 设计规范扫描
- **performance-scanner.sh**: 性能基准扫描

### Analysis

- **fix-analyzer.sh**: 失败根因分析，生成 {testId}-analysis.md
- **pattern-detector.sh**: 失败模式检测（systemic/stuck）
- **trend-analyzer.sh**: 多轮趋势分析

### Diagnostic

- **pre-flight.sh**: 启动前检查（gate 状态）
- **health-check.sh**: 框架诊断

### State Management

- **state-writer.sh**: 原子状态写入（保护 JSON 完整性）
- **learnings-writer.sh**: 踩坑经验写入

---

## Agent 系统

### 1. Supervisor Runner Agent

执行 5 步监督循环：

**Step 1: Observe**
- 运行 pre-flight.sh 检查框架
- Recovery Reasoning（gate=error 时）
- Reasoning Self-check（框架完整性）

**Step 2: Diagnose**
- 运行 trend-analyzer.sh 分析趋势
- 读取 recipe 覆写层（scan/_index.md）
- 合并 scanner 和 directive 建议（最多 3 条）

**Step 3: Decide**
- 构造 spawn prompt
- 启动 stage-worker 子 Agent

**Step 4: Act**
- health-check.sh 诊断
- Meta-analysis（检测异常）

**Step 5: Reflect**
- 生成摘要
- 标记状态 idle

### 2. Stage Worker Agent

按阶段执行工作：

1. 读 phases/common.md（通用规则）
2. 读 phases/{STAGE}.md（当前阶段）
3. 执行该阶段逻辑
4. 读 phases/state-update.md（更新 + 续跑判断）
5. 如续跑，回到步骤 2（读下一阶段）

### Stages

| Stage | 职责 |
|-------|------|
| SCAN | 发现待测试功能（gap） |
| GENERATE | 为 gap 生成测试 YAML |
| TEST | 执行测试 |
| FIX | 分析失败，尝试修复 |
| VERIFY | 验证修复，检测回归 |

---

## 执行流程详解

### 完整流程

1. Supervisor Step 1: Observe（pre-flight、self-check）
2. Supervisor Step 2: Diagnose（趋势分析、recipe 选择）
3. Supervisor Step 3: Decide（spawn stage-worker）
4. **Stage-Worker 执行阶段**（SCAN → GENERATE → TEST → FIX → VERIFY）
5. Supervisor Step 4: Act（诊断、meta-analysis）
6. Supervisor Step 5: Reflect（生成摘要）
7. 循环下一轮（cycle++）

### 关键决策点

**决策 1**: SCAN 产出 gap?
- YES → GENERATE
- NO → TEST

**决策 2**: TEST 全通过?
- YES → VERIFY
- NO（catastrophic）→ 自愈
- NO（一般）→ FIX

**决策 3**: FIX 完成?
- YES → VERIFY
- NO（retry < max）→ 回到 FIX
- NO（retry >= max）→ escalate/skip → VERIFY

**决策 4**: VERIFY 通过?
- YES → cycle++，回到 SCAN
- NO（regression）→ 回到 FIX
- NO（systemic）→ 自愈，下一轮 SCAN

---

## 现有问题与局限

### P1 - 关键问题

**长周期 Token 溢出**
- 47 cycles × 5 steps × ~1KB = 高风险
- stage-worker maxTurns=50 可能不足

**解决方向**: 增加 context 管理，定期清理 reasoning

### P2 - 高优先级

**Recipe 系统不完整**
- SCAN: 2 个 recipe
- FIX: 3 个 recipe
- 无自动演进机制

**架构合规性问题**
- SKILL.md 有 Windows 路径（应为 POSIX）
- architecture-scanner.sh 直接写 state.json（应用 state-writer.sh）

**优化方向**: 补充 FIX recipe，完善 scanner

### 设计限制

**Batch 大小限制**
- TEST 阶段一次处理整个 testQueue
- 大队列（> 50 items）导致 timeout

**无跨 cycle 学习**
- 每轮 stage-worker 独立执行
- 无识别跨 cycle 趋势的机制

**无跨 Agent 协调**
- 通过文件通信（无流式交互）
- 无动态协商机制

### 已知缺陷

**poll_for_completion 精准性** ✅ 已修复
- 原因: ActiveOperation 无 status 字段
- 修复: 改为检查 `d.operation === null`

**框架文件保护** ⚠️ 部分防护
- Immutable Core: 4 个文件不能被修改
- Step 1 有检测但无强制防护

**状态文件版本兼容性** ⚠️ 部分防护
- Schema 存在但不强制
- executor 无版本检查

---

## 快速参考

### 关键命令

```bash
/test-supervisor run              # 执行一轮
/loop 5m /test-supervisor run     # 持续循环

/test-supervisor db               # 仪表板
/test-supervisor health           # 诊断
/test-supervisor trends           # 趋势
/test-supervisor discoveries      # 项目发现
/test-supervisor evolution        # 框架进化
```

### 重要数字

| 参数 | 值 |
|------|-----|
| maxCycles | 80 |
| stage-worker maxTurns | 50 |
| max directives | 3 |
| fix retry limit | 3 |
| trend-analyzer cycles | 3 |

---

## 总结

Test Supervisor 是一个**自适应、自愈、自演进**的测试框架：

✅ **成功因素**:
- 文件驱动状态（无 session memory）
- 原子状态写入（state-writer.sh）
- 主-子 Agent 隔离（context 控制）
- Recipe 系统（可复用策略）
- 多层诊断（pre-flight、health-check、meta-analysis）

📈 **改进方向**:
- 增加 FIX recipe 数量
- 完善 scanner
- 实现 recipe 自动演进
- 增强跨 cycle 学习
- 优化性能（batch 并行化）

