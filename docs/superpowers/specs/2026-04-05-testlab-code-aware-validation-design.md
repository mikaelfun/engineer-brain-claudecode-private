# TestLab Code-Aware Validation + Feature Map

**Date:** 2026-04-05
**Status:** Draft
**Problem:** TestLab 是开环系统——Issue/spec 单向驱动测试生成和代码修复，但不感知代码的演进变化，可能基于过时 Issue 生成无效测试并错误修改正确的代码。

## 1. 问题定义

### 核心矛盾

项目代码持续演进（重构、改 API、删组件），但测试框架的数据源（Issue AC、spec）是静态快照。当前流程：

```
Issue AC（过去时间点）→ Scanner 找 gap → 生成测试 → 测试失败 → FIX 改代码
```

三个断裂点：

1. **Issue 时效性**：`done` 状态 Issue 的 AC 可能描述旧设计，代码已重构但 Issue 没更新
2. **测试有效性**：测试 YAML 引用的 selector/endpoint/文件路径可能已不存在
3. **修复方向性**：FIX 阶段不区分"测试过时"和"代码有 bug"，可能把正确代码改回旧设计

### 现状数据

- 324 个测试 YAML，273 个从未执行过
- 210 个 Issue（101 done + 52 tracked + 20 implemented + 36 pending + 1 in-progress）
- 0% 测试覆盖率，0 个测试结果
- Scanner 对 done Issue 盲目提取 AC，不验证代码锚点是否还存在

## 2. 设计目标

### 定位：混合模式（Hybrid）

- **回归测试（Code-first）**：从当前代码行为推导，验证不破坏
- **功能验证（Spec-first）**：从 Issue AC 推导，验证需求实现，但必须通过鲜活度检查

### 成功标准

1. 过时 Issue 不再生成测试（SCAN 阶段拦截）
2. 过时测试失败后不触发代码修改（VALIDATE 阶段拦截）
3. FIX 阶段按风险分级控制修改权限
4. Feature Map 提供 Issue × Test × Result 的可视化覆盖率
5. 存量清零后从干净状态重建

## 3. 改动范围

```
现有流程:  SCAN → GENERATE → TEST → FIX → VERIFY
改后流程:  SCAN* → GENERATE → TEST → VALIDATE(新) → FIX* → VERIFY

+ Feature Map（持续维护的关联层）
+ 存量清零（一次性）
```

| 改动点 | 类型 | 影响文件 |
|--------|------|---------|
| SCAN 加鲜活度检查 | 修改 | `issue-scanner.sh`, `spec-scanner.js` |
| 新增 VALIDATE 阶段 | 新增 | `phases/VALIDATE.md`, executor 脚本 |
| FIX 分级门禁 | 修改 | `phases/FIX.md` |
| Feature Map 生成与维护 | 新增 | `feature-map-writer.js`, `tests/feature-map.json` |
| 存量清零 | 一次性操作 | `tests/registry/` 目录 |
| Dashboard 展示 | 修改 | TestLab 页面新增 Feature Map 视图 |

## 4. SCAN 阶段鲜活度检查

### 插入位置

在 issue-scanner 和 spec-scanner 的"提取 AC → 判断覆盖"之间插入 Freshness Check：

```
提取 AC 文本
  → Freshness Check（新增）
    → fresh:   正常进入覆盖判断
    → stale:   跳过，输出 ISSUE_STALE|{issueId}|{reason}
    → unknown: 进入覆盖判断，但生成的测试标记 freshness: unknown
```

### Freshness Check 逻辑（轻量级，非 LLM）

从 AC 文本和 Issue JSON 中提取代码锚点，验证是否存在：

| 锚点类型 | 提取方式 | 验证方式 |
|----------|---------|---------|
| 文件路径 | Issue 的 `涉及文件` 字段 | `fs.existsSync()` |
| API endpoint | AC 文本正则匹配 `/api/xxx` | 在 `dashboard/src/routes/` 中 grep |
| React 组件 | AC 文本匹配 `.tsx` 文件名 | `fs.existsSync()` |
| Shell 脚本 | AC 文本匹配 `*.sh` | `fs.existsSync()` |
| CSS selector | 测试 YAML 中的 `selector` 字段 | 在源码中 grep class/id |

### 判定规则

- 所有锚点都存在 → `fresh`
- ≥50% 锚点不存在 → `stale`
- 无法提取锚点（纯文字描述 AC） → `unknown`
- Issue 的 `updatedAt` < 30 天前 且有锚点缺失 → `stale`

### 输出

```bash
ISSUE_STALE|ISS-038|2/3 anchors missing: dashboard/src/pages/OldPage.tsx, /api/old-endpoint
ISSUE_FRESH|ISS-192|3/3 anchors verified
```

Stale 的 Issue 不生成 gap，不产生测试，从源头切断。

## 5. VALIDATE 阶段（新增）

### 定位

插在 TEST 和 FIX 之间。TEST 报告"测试失败了"，VALIDATE 回答"这个失败值得修吗"。

```
TEST 产出 fixQueue: [{testId, failReason, category, ...}]
  → VALIDATE 逐项审查
    → verdict: fix      → 留在 fixQueue
    → verdict: stale    → 移到 staleQueue（归档）
    → verdict: redesign → 创建 Issue，从 fixQueue 移除
```

### 三层过滤

**Layer 1：静态锚点检查（无 LLM，秒级）**

对测试 YAML 中引用的文件/endpoint/selector 做存在性检查：

- 所有引用的锚点存在 → 通过，进入 Layer 2
- 关键锚点缺失 → 直接判定 `stale`

**Layer 2：失败模式分类（规则匹配，无 LLM）**

根据 TEST 阶段的错误信息分类：

| 失败模式 | 判定 | 说明 |
|----------|------|------|
| 404 / route not found | `stale` | endpoint 已不存在 |
| Element not found / selector timeout | `stale` | UI 组件已重构 |
| Assertion value mismatch | `needs_review` | 进入 Layer 3 |
| Connection refused / timeout | `env_issue` | 环境问题，重试 |
| Script error / syntax error | `framework` | 测试本身有 bug |

**Layer 3：LLM 推理审查（仅 needs_review 项）**

只有 Layer 2 判定 `needs_review` 的项才走 LLM：

```
输入：
  - 测试 YAML 的预期行为描述
  - 实际错误输出
  - 关联 Issue 的 AC
  - 对应源代码文件的当前内容（关键片段）

推理问题：
  "测试期望行为 X，代码实际行为 Y。
   这是代码 bug（应该修代码）还是设计变更（应该更新测试）？"

输出：fix | stale | redesign
```

### staleQueue 处理

- Stale 测试 YAML 移到 `tests/registry/_stale/` 目录（不删除，可审计）
- 关联 Issue 标记 `testLoopScan: false`（阻止下轮重新扫描）
- Feature Map 标记 `testStatus: stale`

### redesign 处理

- 自动创建新 Issue：标记设计变更需更新 AC
- 旧测试归档
- Feature Map 标记 `coverage: "outdated"`

## 6. FIX 分级门禁

经过 VALIDATE 过滤后，进入 FIX 的都是 `verdict: fix` 的项。修复权限按风险分三级：

| 级别 | 修改范围 | 修复方式 | 示例 |
|------|---------|---------|------|
| **L1 - 自动修** | `tests/` 目录下所有文件 | 自动执行，无需确认 | 测试 YAML、executor 脚本、框架逻辑 |
| **L2 - 可修** | `dashboard/web/src/` (前端 UI) | 自动执行，单文件 ≤30 行改动 | selector 更新、样式修复、组件微调 |
| **L3 - 只报告** | `dashboard/src/` (后端)、`skills/`、`.claude/` | 不修改代码，只创建 Issue + 分析报告 | 业务逻辑 bug、API 行为变更 |

### 实现

修改 `phases/FIX.md` 中 agent spawn prompt，注入修改权限约束。

`report_only` fixType 不进 verifyQueue（没改代码无需验证），直接标记 `resolution: "issue_created"`。

## 7. Feature Map

### 定位

Feature Map 是整个改进的关联层——把 Issue、测试、执行结果、代码文件四者串联，让 TestLab 能回答"哪些功能已实现并验证过"。

### 数据结构

`tests/feature-map.json`：

```jsonc
{
  "version": 1,
  "lastUpdated": "2026-04-05T10:00:00Z",
  "features": {
    "ISS-192": {
      "title": "WebUI 邮件草稿 Rich HTML 复制 + 编辑功能",
      "issueStatus": "done",
      "freshness": "fresh",
      "codeAnchors": [
        { "type": "file", "path": "dashboard/web/src/pages/CaseDetail.tsx", "exists": true },
        { "type": "route", "path": "/api/cases/:id/drafts", "exists": true }
      ],
      "criteria": [
        {
          "ac": "Copy button copies HTML rich text",
          "testId": "iss-192-copy-html-draft",
          "testStatus": "active",
          "lastResult": "untested",
          "lastRun": null,
          "fixLevel": "L2"
        }
      ],
      "coverage": "0%"
    }
  },
  "summary": {
    "totalFeatures": 20,
    "fresh": 15,
    "stale": 3,
    "unknown": 2,
    "overallCoverage": "0%"
  }
}
```

### 写入时机

| 阶段 | 更新内容 |
|------|---------|
| SCAN | 创建/更新 feature 条目，写入 `freshness` 和 `codeAnchors` |
| GENERATE | 写入新测试的 `testId` 和 `testStatus: active` |
| TEST | 更新 `lastResult` 和 `lastRun` |
| VALIDATE | 标记 stale 测试 `testStatus: stale`，更新 `freshness` |
| VERIFY | 验证通过 → `lastResult: pass`，重算 `coverage` |

### 维护脚本

`tests/executors/feature-map-writer.js`：

```bash
node tests/executors/feature-map-writer.js \
  --action update-freshness \
  --issue ISS-192 \
  --freshness fresh \
  --anchors '[{"type":"file","path":"...","exists":true}]'

node tests/executors/feature-map-writer.js \
  --action update-result \
  --test-id iss-192-copy-html-draft \
  --result pass

node tests/executors/feature-map-writer.js \
  --action recalc-coverage
```

### Dashboard 展示

TestLab 页面新增 Feature Map 视图，显示 Feature × Freshness × Tests × Coverage 矩阵，支持展开查看每个 AC 的测试详情。

## 8. 存量清零与迁移

### 一次性操作

```bash
# 1. 归档现有 registry
mv tests/registry tests/registry-archive-20260405

# 2. 重建空目录结构
mkdir -p tests/registry/{arch,backend-api,observability,ui-interaction,ui-visual,unit-test,workflow-e2e,_stale}

# 3. 清空 state 文件
echo '{}' | bash tests/executors/state-writer.sh --target pipeline --overwrite
echo '{}' | bash tests/executors/state-writer.sh --target queues --overwrite
echo '{}' | bash tests/executors/state-writer.sh --target stats --overwrite

# 4. 初始化空 feature-map
echo '{"version":1,"features":{},"summary":{}}' > tests/feature-map.json
```

### 清零后第一轮 SCAN 行为

1. issue-scanner 扫描 210 个 Issue
2. 每个 Issue 先过 Freshness Check
3. `stale` 直接跳过
4. `fresh` / `unknown` 的 AC 因 registry 为空 → 全部生成 gap
5. Feature Map 同步创建条目

效果：干净的 registry，每个测试都有鲜活度保证。

## 9. 状态机更新

```
SCAN* → GENERATE → TEST → VALIDATE(新) → FIX* → VERIFY
  │                         │                │
  │ Freshness Check         │ 三层过滤        │ 分级门禁
  │ stale → 跳过            │ stale → 归档    │ L1: 自动修
  │ fresh → 生成 gap        │ fix → 进 FIX    │ L2: 可修(≤30行)
  │                         │ redesign → Issue │ L3: 只报告
  │                         │                  │
  └── Feature Map ←─────────┴──────────────────┘
```

## 10. 不在范围内

- Code Scanner（方案 B 的从代码 AST 自动发现行为）——可作为后续增强
- 双轨分离（方案 C 的回归/功能两套流水线）——当前用 fixLevel 区分即可
- 自动清理过时 Issue 的 status——只标记 `testLoopScan: false`，不改 Issue 本身
