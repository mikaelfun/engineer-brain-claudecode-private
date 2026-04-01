---
name: icm-fill
displayName: ICM 填写
category: inline
stability: dev
description: "ICM 模板填写：从 case 数据自动生成 ICM 内容，支持浏览器自动填写。触发词：ICM、icm-fill、填写 ICM、CRI。"
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_run_code
  - mcp__playwright__browser_click
  - mcp__playwright__browser_type
  - mcp__playwright__browser_handle_dialog
  - mcp__playwright__browser_wait_for
---

# /icm-fill — ICM 模板填写

从 case 数据自动生成 ICM 内容，可选打开浏览器自动填写到 ICM 门户。

## 参数

- `$ARGUMENTS` — Case 编号 + 可选产品名 + 可选标志
  - 示例: `2603250010001221` — 自动检测产品，生成 + 浏览器填写
  - 示例: `2603250010001221 aks` — 指定产品
  - 示例: `2603250010001221 --draft-only` — 只生成 draft，不打开浏览器

## 执行步骤

### 1. 读取配置 + Case 数据

读取 `config.json` 获取 `casesRoot`。
设置 `caseDir = {casesRoot}/active/{caseNumber}/`。

确保以下数据存在（如不存在先 data-refresh）：
- `{caseDir}/case-info.md` — 基本信息
- `{caseDir}/analysis/` — 排查报告（至少一份）

### 2. 检测产品 + 加载模板

**从实际问题分析推断产品**（不是从 SAP 路径）：
- 读 `{caseDir}/analysis/` 最新报告 + `case-info.md` 的问题描述
- 从排查内容中的关键词推断产品：
  - AKS: `AKS RP`, `agentpool`, `Node Image`, `kubectl`, `managed cluster`
  - VM: `VMSS`, `VM Agent`, `RDP`, `boot diagnostics`
  - App Service: `webapp`, `App Service Plan`, `deployment slot`
  - ...更多产品在使用中积累

检查 `playbooks/icm-templates/{product}-sev3.json` 是否存在：
- **存在** → 加载配置，跳到 Step 4
- **不存在** → 进入 Step 3（首次配置）

### 3. 首次配置（模板不存在时）

#### 3a. 搜索 OneNote 知识库
用 `/onenote-search` 搜索 ICM 模板信息：
- 搜索关键词：`ICM template {product}`、`CRI {product}`、`ICM {product} POD`
- 从搜索结果提取：模板链接 URL、Title 格式、EEE 流程说明

#### 3b. 确认模板选择
如果搜索返回多个结果或不确定：
- 用 `AskUserQuestion` 向用户展示候选列表，确认选哪个模板
- 如果搜索无结果，询问用户提供模板链接

#### 3c. 打开模板链接，自动读取结构
用 Playwright 打开模板 URL，用 `browser_evaluate` 提取：

```javascript
// 1. 读取 iframe 内的 Description 表格字段名
const iframeEl = document.querySelector('iframe.k-content');
const doc = iframeEl.contentDocument;
const rows = doc.querySelectorAll('table tr');
// 返回每行第一个 td 的文本（字段名列表）

// 2. 读取页面上的 input/radio/select 字段
const inputs = document.querySelectorAll('input, textarea, select');
// 返回 aria-label 列表和预填值
```

#### 3d. 字段来源判断
对每个字段，LLM 判断数据来源：
- `case-info` — 可从 case-info.md 自动提取（subscriptionId, customer name）
- `analysis` — 可从分析报告提取（region, clusterId, timestamp）
- `llm-generate` — 需要 LLM 基于上下文生成（business impact, ask, repro steps）
- `manual` — 需要用户手动填写或留空
- `default` — 有固定默认值

不确定的字段向用户确认。

#### 3e. 保存模板配置
写入 `playbooks/icm-templates/{product}-sev3.json`，格式参考 `aks-sev3.json`。
后续同产品的 ICM 填写直接复用此配置。

### 4. 生成 ICM Draft

读取 `playbooks/guides/icm-fill.md` 获取填写规范。

遍历模板配置的 `descriptionTable` 字段：
- `default` 值 → 直接使用
- `source: case-info` → 从 case-info.md 正则提取
- `source: analysis` → 从最新 analysis 报告提取
- `source: llm-generate` → LLM 基于 case 上下文生成，遵循以下规范：
  - **Business Impact**: 不臆造用户数，只描述实际影响
  - **Ask**: 分点回行，写具体问题给 PG，包含证据引用
  - **Case owner's description**: 工程师视角 2-3 句 + 1 句推测
  - **Customer verbatim**: 客户视角描述现象
  - **Repro Steps**: 每步回行
  - **Troubleshooting**: 分层结构 + Kusto 语法高亮（见下方）
- `source: manual` + `optional: true` → 留空

#### Troubleshooting 字段特殊处理

读取 analysis 中的 Kusto 查询链，生成 HTML 富文本：
- 按层分组（Layer 1: RP, Layer 2: ARM, Layer 3: Infra...），层标题 `<b>` 加粗
- 每步编号 + 描述（不加粗）
- KQL 语句：Kusto Explorer 风格语法高亮（参见 `icm-fill.md` 的 Kusto Syntax Highlighting 部分）
  - `cluster('url').database('db').Table` **必须在同一行**
  - 每个 `| where` clause 独占一行
  - 颜色：keyword 蓝、function 紫、string 暗红、operator 灰
- 查询结果：HTML 表格，包含关键列（timestamp, operationName, operationID, correlationID, result）
- 结尾：Conclusion 加粗，总结发现和推断

输出到 `{caseDir}/icm-draft.md`。

### 5. 浏览器填写（除非 --draft-only）

读取 `playbooks/guides/icm-fill.md` 获取浏览器自动化模式。

#### Phase 1: 打开模板页面
```
browser_navigate → templateUrl
browser_wait_for → "Title" (确认页面加载)
```

#### Phase 2: 填写 input 字段
用 `browser_evaluate` 批量设置：Title, Support Ticket Id, Subscription Id, Customer Name 等。
使用 `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set` + `dispatchEvent`。

#### Phase 3: 选择 radio/select
- Severity: `click` 对应 radio button
- SLA Impact: `click` 对应 radio button
- Impacted Regions: select2 交互（click container → type → select result）

#### Phase 4: 填写 Description 表格（iframe 内）
```javascript
const iframeEl = await page.$('iframe.k-content');
const cf = await iframeEl.contentFrame();
```

对每个表格行：
- **普通格**：`cf.$('table tr:nth-child(N) td:nth-child(2)')` → click → selectAll → keyboard.type
  - 这触发 Angular 数据绑定，内容点击后不会丢失
- **Troubleshooting 格（richText: true）**：直接设 innerHTML
  - HTML 富文本（表格、代码块、语法高亮）只能通过 innerHTML 注入

#### Phase 5: 验证
用 `browser_evaluate` 抽查几个关键字段确认值已填入。

### 6. 保存 + 提示

- 更新 `{caseDir}/icm-draft.md` 为最终版本
- 提醒用户：
  - ⚠️ 需 TA 审批后才能提交 ICM
  - ⚠️ 检查 Description 表格内容（点击各格确认不丢失）
  - ⚠️ EEE 流程要求：数据不可直接分享给客户

## 产品模板配置格式

模板存储在 `playbooks/icm-templates/{product}-sev3.json`，参考 `aks-sev3.json`：
- `templateUrl` — ICM 模板链接
- `titleFormat` — Title 格式（`<description>` 和 `<case number>` 为占位符）
- `fixedFields` — 每次固定不变的字段值
- `descriptionTable` — Description 表格字段配置数组
- `inputFields` / `radioFields` / `selectFields` — 页面表单字段映射
- `kustoHighlight` — Kusto 语法高亮颜色配置
- `browserNotes` — 浏览器自动化注意事项
