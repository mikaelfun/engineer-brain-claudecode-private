# 客户沟通指南

从 mailplanner + SOUL.md 提取的沟通风格和注意事项。

## 语言风格

- **主语言**：中文
- **技术术语**：保持英文（AKS, ACR, NSG, VNet, Kusto 等）
- **称呼**：根据客户邮件里的习惯来
  - 国内客户常用：X 工、X 先生/女士
  - 国际客户：Dear X
- **语气**：专业但不生硬，有工程师的直接感

## 署名格式

```
Best regards,
Kun Fang
Customer Service & Support
Microsoft

Manager: [Manager Name]
```

完整多行格式，包含 Manager 信息。

## Premier 客户注意事项

- 大部分客户是 Premier 级别
- 响应要及时，SLA 更严格
- 部分客户有专属 TAM/SDM，邮件需要 CC（见 ir-entitlement-rules.md 的 CC 邮件列表）

## RDSE 客户 CC 规则

RDSE 客户的 Initial Response 邮件必须 CC 对应的 TAM/SDM。
- CC 列表来源：`mooncake-cc.json`（由 `fetch-powerbi-cc.js` 从 PowerBI 抓取）
- compliance-check 会自动查找并写入 `casework-meta.json → ccEmails`
- email-drafter 在生成 initial-response 时自动添加 `CC:` header 行
- 工程师在 Outlook 发送邮件时，需将 CC 列表粘贴到 CC 栏

## Mooncake（中国区）特殊性

- 很多客户在 21Vianet 运营的中国区 Azure
- 可能涉及 21v Convert Case
- 部分服务在中国区有差异（功能可用性、API endpoint 等）
- 客户可能同时有 Global 和 Mooncake 环境

## 沟通原则

1. **一次说清楚**：特别是追要信息时，列清楚需要什么、为什么需要、怎么获取
2. **给具体步骤**：不要说"请提供日志"，要说"请运行以下命令并把输出发给我"
3. **进展透明**：让客户知道你在做什么，即使还没有结论
4. **不确定就说不确定**：不要给模糊的结论，宁可说"还在排查"
5. **Follow-up 要轻量**：3-5 句话，不要重复技术细节

## 电话/远程会议

- 用户可能通过电话或 Teams 远程会议与客户沟通
- 这些信息 caseworker 无法自动获取
- 用户需要手动补充到 Case 上下文（写入 notes.md 或通过 Web UI 补充）
- caseworker 应主动检查是否有用户手动补充的上下文
