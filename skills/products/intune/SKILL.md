# Intune 产品排查 Skill

> 覆盖 Microsoft Intune：设备注册、策略部署、应用管理 (MAM/MDM)、合规检查。

## 1. 诊断层级

```
Layer 1: Intune Service
  ├─ 集群: (见 CSV) / intune
  ├─ 关键表: IntuneOperation, IntuneEvent, IntuneScenarioHealth
  │           DeviceLifecycle, DeviceManagementProvider, CMService
  └─ 用途: 设备管理操作追踪

Layer 2: Directory (MSODS)
  ├─ 关键表: IfxAuditLoggingCommon
  └─ 用途: 审计和授权日志
```

## 2. 决策树

### 设备注册失败
```
注册失败
  ├─→ IntuneOperation → 注册操作日志
  ├─→ DeviceLifecycle → 设备生命周期事件
  ├─→ IOSEnrollmentService → (iOS 特定)
  └─→ msft-learn: "Intune enrollment troubleshoot"
```

### 策略/应用部署失败
```
部署失败
  ├─→ IntuneEvent → 部署事件
  ├─→ CMService → 配置管理详情
  ├─→ DownloadService → 应用下载失败原因
  └─→ ADO Wiki: "Intune {errorCode}"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/intune/` (2 DB: intune, MSODS)
- **msft-learn**: Intune troubleshooting 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 0x80180026 | 设备已达注册上限 | 增加 enrollment limit |
| App install stuck | 下载超时 | 检查网络/CDN 可达性 |
| Policy conflict | 多策略冲突 | 检查策略优先级 |
