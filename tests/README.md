# 自动化测试框架

文件驱动的状态机测试框架，持续发现→生成→测试→修复→验证。

## 快速启动

```bash
# 手动执行一轮
/test-loop

# 持续自动运行（推荐 3 分钟间隔）
/loop 3m /test-loop
```

详细启动指南见 [loop-prompt.md](./loop-prompt.md)。

## 目录结构

```
tests/
├── state.json              # 状态机状态（phase、queues、stats）
├── safety.yaml             # 安全规则（SAFE/BLOCKED 操作清单）
├── env.yaml                # 环境配置（端口、密码、case 池）
├── learnings.yaml          # 踩坑经验固化
├── manifest.json           # 功能覆盖映射
├── stats.md                # 当前统计概览
├── loop-prompt.md          # 启动指南
├── schemas/
│   └── test-definition.yaml  # 测试定义 schema 规范
├── registry/               # 测试定义（YAML）
│   ├── backend-api/        # 后端 API 测试
│   ├── ui-interaction/     # UI 交互测试
│   ├── ui-visual/          # UI 视觉测试
│   ├── workflow-e2e/       # 工作流 E2E 测试
│   └── frontend/           # 前端逻辑测试
├── executors/              # 测试执行器（Bash 脚本）
│   ├── common.sh           # 共享工具（JWT、HTTP、断言）
│   ├── api-runner.sh       # 后端 API 执行器
│   ├── e2e-runner.sh       # 工作流 E2E 执行器
│   ├── ui-runner.sh        # UI 交互执行器
│   ├── visual-runner.sh    # UI 视觉执行器
│   ├── safety-gate.sh      # 安全检查拦截器
│   ├── fix-analyzer.sh     # FIX 阶段分析器
│   ├── fix-recorder.sh     # 修复记录器
│   ├── verify-rerun.sh     # VERIFY 阶段重跑
│   ├── learnings-writer.sh # 经验固化写入
│   ├── regression-tracker.sh # 回归跟踪
│   ├── stats-reporter.sh   # 统计报告生成
│   └── write-result.sh     # 结果写入（给 agent）
└── results/                # 测试结果
    ├── {round}-{testId}.json   # 单个测试结果
    ├── round-{N}-summary.json  # 每轮统计
    ├── fixes/                  # 修复报告
    │   ├── {testId}-analysis.md
    │   ├── {testId}-fix.md
    │   └── {testId}-verify.md
    ├── screenshots/            # UI 截图
    └── legacy-findings.json    # 迁移的历史发现
```

## 状态机

```
SCAN → GENERATE → TEST → FIX → VERIFY → SCAN (round++)
```

- **SCAN**: 扫描项目代码/文档，发现缺少测试的功能
- **GENERATE**: 为发现的 gap 生成测试定义 YAML
- **TEST**: 执行测试，结果写入 results/
- **FIX**: 分析失败原因，修复代码或配置
- **VERIFY**: 重跑修复后的测试，确认修复有效
- **COMPLETE**: 达到 maxRounds 时停止

## 添加新测试

在 `tests/registry/{category}/` 创建 YAML 文件：

```yaml
id: "my-test-id"
name: "测试名称"
category: "backend-api"  # 或 ui-interaction, ui-visual, workflow-e2e
source: "dashboard/src/routes/xxx.ts"
description: "测试什么"
safety_level: "safe"
priority: "medium"
tags: ["api", "crud"]

steps:
  - action: "http_request"
    params:
      method: "GET"
      endpoint: "{api_base}/api/xxx"

assertions:
  - type: "status_code"
    expected: 200
  - type: "json_field"
    field: "data"
    expected: "non-empty"

timeout_seconds: 30
```

## 查看结果

```bash
# 当前状态
cat tests/state.json | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log('Phase:',d.phase,'Round:',d.round)"

# 统计概览
cat tests/stats.md

# 某个测试的结果
cat tests/results/0-core-endpoints.json

# 修复报告
cat tests/results/fixes/auth-endpoints-analysis.md
```

## 设置 maxRounds

编辑 `tests/state.json` 的 `maxRounds` 字段：

```bash
node -e "const fs=require('fs');const s=JSON.parse(fs.readFileSync('tests/state.json','utf8'));s.maxRounds=10;fs.writeFileSync('tests/state.json',JSON.stringify(s,null,2)+'\n')"
```

## 安全规则

所有操作在执行前必须经过 `tests/safety.yaml` 检查：
- **SAFE**: 自动执行（读操作、分析、测试）
- **BLOCKED**: 绝不执行（D365 写操作、真实邮件发送）
- **UNKNOWN**: 跳过并标记 warning

可通过 `safety-gate.sh` 编程查询：
```bash
bash tests/executors/safety-gate.sh api "GET /api/health"    # → 0 (SAFE)
bash tests/executors/safety-gate.sh api "POST /api/todo/:id/execute"  # → 1 (BLOCKED)
```
