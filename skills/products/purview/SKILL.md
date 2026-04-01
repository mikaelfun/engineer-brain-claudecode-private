# Purview 产品排查 Skill

> 覆盖 Microsoft Purview：Azure RMS 加密/解密、敏感度标签 (MIP)、DLP。

## 1. 诊断层级

```
Layer 1: Azure RMS
  ├─ 关键表: IFxRequestLogEvent, IFxScenarioLogEvent, IFxTrace (azrms)
  └─ 用途: RMS 加密/解密/授权请求追踪

Layer 2: ESTS (认证)
  ├─ 关键表: PerRequestTableIfx, DiagnosticTracesIfx (ESTS)
  └─ 用途: RMS 认证链路
```

## 2. 决策树

### 文档加密/解密失败
```
RMS 操作失败
  ├─→ azrms 查 IFxRequestLogEvent → 请求追踪
  ├─→ azrms 查 IFxScenarioLogEvent → 场景级日志
  ├─→ 如果是认证问题 → ESTS 查 PerRequestTableIfx
  └─→ ADO Wiki: "RMS {errorCode}"
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/purview/` (2 DB: azrms, ESTS)
- **msft-learn**: Purview/RMS 文档

## 4. 已知问题库

| 症状 | Root Cause | 解决方案 |
|------|------------|---------|
| 无法打开加密文件 | License 获取失败 | 检查 RMS service URL 和认证 |
| 标签无法同步 | Policy sync 超时 | 检查 MIP SDK 版本 |
