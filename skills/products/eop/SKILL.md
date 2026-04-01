# EOP 产品排查 Skill

> 覆盖 Exchange Online Protection：垃圾邮件、钓鱼、域模拟、邮件头分析。

## 1. 诊断方式

EOP 排查不使用 Kusto MCP，而是通过 **PowerShell 邮件头解析**：

```
工具: skills/kusto/eop/references/decodingspamagentdata.ps1
输入: 邮件头中的 X-MS-Exchange-Organization-SCL 和 X-Forefront-Antispam-Report
输出: 垃圾邮件判定原因分析
```

## 2. 决策树

### 邮件被误判为垃圾邮件
```
邮件到垃圾箱
  ├─→ 解析邮件头 → SCL 分值
  │     ├─ SCL >= 5 → Content Filter 判定
  │     ├─ DIMP → 域模拟检测
  │     ├─ SPOOF → 发件人欺骗检测
  │     └─ PHSH → 钓鱼检测
  ├─→ 检查发件人 SPF/DKIM/DMARC
  └─→ msft-learn: "EOP anti-spam headers"
```

### 邮件未收到
```
邮件丢失
  ├─→ Message Trace（通过 Exchange Admin Center）
  ├─→ 检查 Transport Rules
  └─→ 检查 Connector 配置
```

## 3. 可用工具链

- **PowerShell**: `skills/kusto/eop/references/decodingspamagentdata.ps1`
- **msft-learn**: EOP 邮件头文档
- **Exchange Admin Center**: Message Trace（需客户操作）

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| SCL=9 | Content Filter 高置信度 | 创建 Transport Rule 放行 |
| DIMP | 域模拟攻击检测 | 加 Anti-phishing policy 白名单 |
| SPOOF | 发件人欺骗 | 配置 SPF/DKIM/DMARC |
