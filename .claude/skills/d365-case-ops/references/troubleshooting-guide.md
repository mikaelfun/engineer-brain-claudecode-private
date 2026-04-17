# 排查引导流程

> 当 Agent 获取到 Case 数据后，按照此流程判断如何开始排查。

## 三要素提取

从 Case 数据中提取以下三要素，这是开始任何排查的前提：

| 要素 | 主要来源 | 备用来源 | 如何获取 |
|------|---------|---------|---------|
| **客户问题描述** | `msdfm_customerstatement`（Restricted Attributes） | 客户发来的 Emails、Timeline 中的 Notes | `view-details` 的 API 返回中自动包含 |
| **问题 Pattern** | Customer Statement + Email 往来上下文 | Notes 中工程师记录的排查进展 | `view-timeline` 获取通信历史 |
| **Azure 资源信息** | Customer Statement 中通常包含 Subscription ID、资源名称、资源 URL | Case 的 `msdfm_supportareapath` 指示产品类型 | `view-details` 中的 SAP 字段 |

## 排查决策树

```
获取 Case 数据（view-details + view-timeline）
│
├── 三要素齐全？
│   ├── YES → 开始排查
│   │   ├── SAP 包含具体 Azure 产品 → 调用 kusto-finding 获取遥测表 → 查 Kusto
│   │   ├── 问题已有工程师笔记 → 阅读笔记继续排查，避免重复工作
│   │   └── 问题是配置/文档类 → 查 Microsoft Docs
│   │
│   └── NO → 判断缺什么
│       ├── 缺客户问题描述 → 读最近的 Received Email 或 Note
│       ├── 缺资源信息 + 排查需要（如 Kusto 查询）→ 询问用户提供 Subscription ID / 资源名
│       └── 缺资源信息 + 排查不需要（配置类问题）→ 直接排查
│
└── Case 已有解决方案？
    ├── Notes/Emails 中有 "Resolved" / "Solution" → 总结解决方案
    └── Status 是 "Mitigated" / "Pending closure" → 确认是否已解决
```

## 输出格式建议

获取 Case 数据后，向用户输出结构化摘要：

```
📋 Case 概要
─────────────────────────
Case: {ticketnumber} | Sev {severity} | {status}
SAP: {support_area_path}
Age: {days} days | Assigned: {engineer}

🔍 客户问题
{customer_statement 前 500 字}

📬 最近通信（最新 3 条）
{timeline 摘要}

🎯 排查建议
{基于三要素分析的下一步建议}
```

## 常见排查路径

| SAP 产品 | 典型排查工具 |
|----------|-------------|
| Azure Database for MySQL/PostgreSQL | Kusto 遥测（kusto-finding 技能） |
| Azure Cosmos DB | Kusto 遥测 |
| Azure Analysis Services | Kusto 遥测 |
| Power BI | Microsoft Docs + 内部 TSG |
| 通用 Azure 问题 | Azure Resource Graph / Activity Log |
