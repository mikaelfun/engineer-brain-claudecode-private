# ARM 产品排查 Skill

> 覆盖 Azure Resource Manager 层问题：请求追踪、部署、限流、活动日志。

## 1. 诊断层级

```
单层架构 — ARM 是所有 Azure 操作的入口
  集群: armmcadx.chinaeast2 / armmc
  关键表: HttpIncomingRequests, EventServiceEntries, ClientRequests
           Deployments, DeploymentOperations, JobOperations
```

## 2. 决策树

### 429 Throttling
```
客户遇到 429
  ├─→ HttpIncomingRequests by subscription → 确认请求量
  ├─→ ClientRequests → 客户端请求详情
  ├─→ 分析 throttle 类型（subscription-level / tenant-level / RP-level）
  └─→ 建议: 降低请求频率 / 分批 / 使用 async 模式
```

### 部署失败
```
ARM 部署失败
  ├─→ Deployments → 部署概览
  ├─→ DeploymentOperations → 逐操作详情
  ├─→ JobOperations / JobErrors → 异步 job 状态
  └─→ 如果是 RP 返回错误 → 转对应产品 skill
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/arm/` (1 DB: armmc, 14 表)
- **ADO Wiki**: org=msazure, "ARM throttling", "deployment failure"
- **msft-learn**: ARM 部署文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 429 TooManyRequests | 超过 ARM rate limit | 降低请求频率，使用 retry-after |
| DeploymentFailed | 模板错误或 RP 错误 | 查 DeploymentOperations 定位具体资源 |
| SubscriptionNotRegistered | 未注册 RP | `az provider register --namespace xxx` |
