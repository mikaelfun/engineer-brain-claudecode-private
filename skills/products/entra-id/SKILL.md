# Entra ID 产品排查 Skill

> 覆盖 Microsoft Entra ID（原 Azure AD）：登录、条件访问、MFA、AAD Connect、应用注册。

## 1. 诊断层级

```
Layer 1: ESTS (Enterprise STS)
  ├─ 关键表: PerRequestTableIfx, DiagnosticTracesIfx
  └─ 用途: 登录请求追踪、token 颁发

Layer 2: MSODS (目录服务)
  ├─ 关键表: IfxAuditLoggingCommon, IfxBECAuthorizationManager, IfxUlsEvents
  └─ 用途: 审计日志、授权决策

Layer 3: AAD Gateway
  ├─ 关键表: RequestSummaryEventCore
  └─ 用途: 网关层请求汇总、限流检测

Layer 4: SAS (Security & Authentication)
  ├─ 关键表: SASRequestEvent, SASCommonEvent, CappWebSvcRequest
  └─ 用途: MFA、SSPR、FIDO2
```

## 2. 决策树

### 登录失败
```
用户无法登录
  ├─→ ESTS 查 PerRequestTableIfx by correlationId → 请求追踪
  │     ├─ AADSTS50076 → MFA 要求 → 检查条件访问策略
  │     ├─ AADSTS50105 → 用户未分配到应用
  │     ├─ AADSTS700016 → 应用不存在/不在租户中
  │     ├─ AADSTS53003 → 条件访问阻止
  │     └─ 其他 AADSTS → 解码错误码
  ├─→ 需要条件访问详情 → 查 DiagnosticTracesIfx
  └─→ msft-learn: "AADSTS {errorCode}"
```

### MFA 问题
```
MFA 异常
  ├─→ SAS 查 SASRequestEvent → MFA 请求详情
  ├─→ 分析 MFA 方式（Push/SMS/TOTP/FIDO2）
  └─→ 如果是 NPS Extension → 检查 NPS 配置
```

## 3. 可用工具链

- **Kusto**: `skills/kusto/entra-id/` (4 DB: ESTS, MSODS, AADGatewayProd, idmfacne)
- **ADO Wiki**: "AADSTS", "Conditional Access", "MFA"
- **msft-learn**: Entra ID 错误码文档

## 4. 已知问题库

| 错误码 | 含义 | 解决方案 |
|--------|------|---------|
| AADSTS50076 | 需要 MFA | 完成 MFA 挑战 |
| AADSTS50105 | 用户未分配 | 在企业应用中分配用户 |
| AADSTS53003 | 条件访问阻止 | 检查 CA 策略 |
| AADSTS700016 | 应用 ID 不存在 | 确认 client_id 和 tenant_id |
| AADSTS90072 | 租户不存在 | 确认 tenant_id |
