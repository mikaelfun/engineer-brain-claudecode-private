# AVD 产品排查 Skill

> 覆盖 Azure Virtual Desktop（原 WVD）、Session Host、FSLogix、MSIX App Attach。

## 1. 诊断层级

```
单集群架构
  集群: (见 kusto_clusters.csv) / WVD
  关键表: DiagActivity, DiagError, RDOperation, RDAgentMetadata
           RDClientTrace, HostPool, ShoeboxAgentHealth
```

## 2. 决策树

### 用户无法连接
```
连接失败
  ├─→ DiagActivity → 连接事件追踪
  ├─→ DiagError → 错误详情
  ├─→ RDClientTrace → 客户端日志（RDP 客户端版本等）
  ├─→ 如果 Session Host 不可用 → 查 ShoeboxAgentHealth
  └─→ 如果 RDAgent 异常 → 查 RDAgentMetadata 版本
```

### Session Host 不健康
```
SH 状态异常
  ├─→ ShoeboxAgentHealth → Agent 健康心跳
  ├─→ RDAgentMetadata → Agent 版本和注册状态
  ├─→ 如果 VM 层面问题 → 转 VM 产品 skill
  └─→ msft-learn: "AVD session host troubleshoot"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/avd/` (1 DB: WVD, 11 表)
- **ADO Wiki**: "AVD", "WVD", "RDAgent"
- **msft-learn**: AVD troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| Connection failed 0x3000018 | 网关超时 | 检查 SH 网络和 RDAgent 状态 |
| Agent heartbeat lost | RDAgent crash | 重启 RDAgentBootLoader 服务 |
| FSLogix profile load failure | VHD 无法挂载 | 检查存储权限和网络 |
