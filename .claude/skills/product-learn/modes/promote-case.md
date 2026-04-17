# promote-case — Case 增量知识写回

> 通用规则（ID 生成、去重、Evolution Log）见 `../SKILL.md`

```
/product-learn promote-case {caseNumber}
```

从已解决 Case 的关单邮件和分析报告中，提取**product skill 中尚未覆盖**的增量知识。

**核心原则**：只写回 delta。如果 case 分析本身就是从 product skill 读出来的知识去解决的，则无新增价值，跳过。

## 执行步骤

### 1. 定位 Case 目录
搜索 `cases/active/{caseNumber}` 或 `cases/archived/{caseNumber}`

### 2. 确定产品域
从 `case-info.md` 的 SAP 服务路径或 matchKeywords 匹配产品（同 troubleshooter Step 1.5）

### 3. 读取 Case 数据（两个来源合并）

**来源 A — 关单邮件（三元组 ground truth）**：
- 读取 `emails.md`，定位最后一封 closure/summary 类型邮件
- 识别特征：主题含 "closure" / "summary" / "resolved" / "关闭" / "解决"，或最后一封发给客户的邮件
- 从关单邮件提取：
  - `symptom`: 客户原始问题描述
  - `rootCause`: 确认的根本原因
  - `solution`: 实际解决方案（客户验证过的）

**来源 B — 分析报告（排查路径补充）**：
- 读取 `analysis/*.md` 和 `kusto/*.md`
- 提取分析中使用的有效排查步骤、Kusto 查询
- 这些**不是三元组**，而是潜在的 draft 素材

### 4. Delta 检测 — 与已有知识对比
- 读取 `.claude/skills/products/{product}/guides/_index.md`（如存在）
- 读取 `.claude/skills/products/{product}/known-issues.jsonl`
- 对比提取的三元组与已有条目：
  - `symptom` + `rootCause` 高度相似（>80% 关键词重叠）→ 已存在，标记 `[已有]`
  - 部分相似但有新角度 → 标记 `[补充]`
  - 全新 → 标记 `[新增]`

### 5. 展示 Delta 给用户确认

```
=== Case {caseNumber} 增量知识提取 ===
产品: {product}

## 三元组（来自关单邮件）

[新增] symptom: VM 备份失败，错误码 UserErrorBCMURLConfiguredIncorrectly
      rootCause: 客户的 Vault 配置了自定义 DNS 但未添加 Backup 服务的 private endpoint
      solution: 添加 privatelink.backup.windowsazure.cn 的 DNS 记录和对应的 private endpoint

[已有] symptom: Backup extension timeout
      → 与 vm-016 重复，跳过

## 排查路径（来自分析报告）

[新增] 有效 Kusto 查询: MABKustoProd 查 BCMBackupStats 按 VaultId 过滤
      → 建议保存为 draft

确认写入？([Y]es / [E]dit / [S]kip)
```

### 6. 用户确认后写入

**三元组 → known-issues.jsonl**：
```json
{
  "id": "{product}-{seq}",
  "date": "YYYY-MM-DD",
  "symptom": "...",
  "rootCause": "...",
  "solution": "...",
  "source": "case-delta",
  "sourceRef": "{caseNumber}",
  "product": "{product}",
  "confidence": "high",
  "promoted": false,
  "tags": [...]
}
```
- `source: "case-delta"` — 区别于自动扫描的 `"case"`
- `confidence: "high"` — 人工确认 + 客户验证过

**排查路径 → guides/drafts/**（如有新的排查步骤/Kusto 查询）：
```
guides/drafts/case-{caseNumber}-{topic}.md
```
frontmatter: `source: case-delta`, `sourceRef: {caseNumber}`, `type: troubleshooting-guide`
对应 JSONL 条目加 `quality: "guide-draft"`, `solution` 引用 draft 路径

### 7. 记录 evolution-log
```
| {date} | case-delta | Case {caseNumber}: {简述新发现} | {caseNumber} |
```

## 跳过条件

- Case 目录不存在或无 emails.md → 报错退出
- 关单邮件不存在（case 未关闭）→ 警告，仅从 analysis 提取
- 所有提取的三元组都与已有知识重复 → 报告「无新增知识」，不写入
