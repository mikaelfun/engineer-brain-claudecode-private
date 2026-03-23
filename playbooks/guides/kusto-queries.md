# Kusto 查询指南

从 kustomaster agent 提取的 Kusto 查询策略。caseworker 需要查平台日志时读取本文件。

## 查询策略

### 先窄后宽
1. 先用精确条件查（资源 ID + 时间范围 + 错误类型）
2. 没结果再逐步放宽（去掉错误类型 → 扩大时间范围 → 换表）
3. 避免一上来就查大范围

### 多次查询迭代
- 第一轮：定位是否有相关记录
- 第二轮：缩小到具体事件
- 第三轮：提取详细信息

## 产品 Skill

每个产品有独立的 Kusto Skill，包含该产品常用的：
- 集群 URI
- 数据库名
- 常用表
- 典型 KQL 模板

### Skill 目录
`skills/kusto/{product}/SKILL.md`

### 产品列表
ACR / AKS / ARM / AVD / Disk / Entra-ID / Intune / Monitor / Networking / Purview / VM / EOP

## 执行方式

通过 mcporter → fabric-rti-mcp 执行 KQL 查询。

### 调用示例
```
mcporter call fabric-rti-mcp execute_query --args '{"query": "...", "cluster": "...", "database": "..."}'
```

## 关键约束

- **权限错误** → 提示用户 `az login` 用 CME 账号
- **结果忠实**：不编造查询结果，查不到就说查不到
- **Mooncake 集群**：中国区使用特定集群 URI（常用 URI 参考 AGENTS.md 或各产品 Skill）
- **超时处理**：大范围查询可能超时，先缩小范围再查

## 查询结果输出

保存到 `${CASES_ROOT}/active/{case-id}/kusto/`，文件名包含：
- 产品名
- 查询时间
- 简要描述
