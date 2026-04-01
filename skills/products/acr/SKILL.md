# ACR 产品排查 Skill

> 覆盖 Azure Container Registry：镜像推拉、认证、限流、ACR Tasks。

## 1. 诊断层级

```
单集群架构
  集群: (见 CSV) / acrprodmc
  关键表: RegistryActivity, RPActivity, BuildHostTrace
           RegistryMasterData, StorageAccountLogs, WorkerServiceActivity
```

## 2. 决策树

### 镜像推拉失败
```
docker push/pull 失败
  ├─→ RegistryActivity → 操作日志
  │     ├─ 401 Unauthorized → 认证问题
  │     │     └─ 检查 ACR admin/token/SP 权限
  │     ├─ 403 Forbidden → IP 限制 / 防火墙
  │     ├─ 429 Too Many Requests → SKU 限流
  │     │     └─ 建议: 升级 SKU (Basic→Standard→Premium)
  │     └─ 5xx → 服务端问题
  ├─→ RPActivity → RP 操作详情
  └─→ msft-learn: "ACR troubleshoot login"
```

### ACR Tasks 构建失败
```
Task 构建失败
  ├─→ BuildHostTrace → 构建日志
  ├─→ WorkerServiceActivity → Worker 状态
  └─→ 检查 Dockerfile 和网络
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/acr/` (1 DB: acrprodmc, 6 表)
- **msft-learn**: ACR troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 401 unauthorized | Token 过期/SP 无权限 | 重新 az acr login / 检查 RBAC |
| 429 rate limit | 超过 SKU 限制 | 升级 SKU / 降低频率 |
| push timeout | 镜像过大 / 网络慢 | 分层构建 / 检查带宽 |
