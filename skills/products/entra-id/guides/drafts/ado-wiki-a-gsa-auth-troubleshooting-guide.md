---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Microsoft Entra Global Secure Access (ZTNA)/GSA Auth Troubleshooting Guide"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FMicrosoft%20Entra%20Global%20Secure%20Access%20%28ZTNA%29%2FGSA%20Auth%20Troubleshooting%20Guide"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# GSA Auth Troubleshooting Guide

**ICM Owning Service:** AAD Application Proxy
**ICM Owning Team:** Data Path
**Manager:** Zohaib Alam

## Official Documentation
- Compliant network: https://learn.microsoft.com/entra/global-secure-access/how-to-compliant-network
- Source IP restoration: https://learn.microsoft.com/entra/global-secure-access/how-to-source-ip-restoration

---

## 1. Debugging from Azure Support Center

### 1A. Check conditional access signaling
In Tenant Explorer -> Global Secure Access -> Global Settings -> Adaptive Access. Must be "enabled".
If disabled, follow [instructions](https://learn.microsoft.com/entra/global-secure-access/how-to-compliant-network) to enable.

### 1B. Look at sign-in logs
Navigate to User -> Sign-ins, search by user email/ID and time range.
- Click "Troubleshoot" -> Auth troubleshooter
- Find ErrorNumber and ErrorCode under "Authentication Summary"
- Look up errors at: https://learn.microsoft.com/entra/identity-platform/reference-error-codes
- Click "Summary Details" for MFA/step info
- Click "CA Diagnostic" for CA policy details
- Click "Expert View" -> "PerRequestLogs" for CorrelationId (include in ICMs)

### 1C. Check traffic forwarding
In Azure Support Center: Global Secure Access -> Profiles -> select desired traffic profile.
- Check Action column: "Forward" = correct, "Bypass" = needs fixing
- Doc: https://learn.microsoft.com/entra/global-secure-access/concept-traffic-forwarding

---

## 2. Debugging from Entra Admin Portal

### 2A. Check conditional access signaling
Entra admin portal -> Global Secure Access -> Global settings -> Session management -> Adaptive Access
or [direct link](https://entra.microsoft.com/#view/Microsoft_Azure_Network_Access/Security.ReactView)

### 2B. Check conditional access policies
Check sign-in logs -> click failed attempt -> Conditional Access tab -> see applied policies.
Example: CA policy that blocks access except from compliant network location.

### 2C. Check traffic forwarding
Entra admin portal -> Global Secure Access -> Traffic forwarding.
Ensure access profile is enabled and Action is "Forward" (not "Bypass").

### 2D. Look at sign-in logs
Users -> Sign-in logs -> find failed sign-in. Note: Request ID, Correlation ID, IP address for Kusto.

---

## 3. Debugging with Kusto

### 3A. Kusto Dashboard
[Link to dashboard](https://dataexplorer.azure.com/dashboards/c8c360a8-38bf-479d-a828-e0675b496182?p-_startTime=2days&p-_endTime=now)

Enter tenantId, then filter by GSACorrelationId, ESTSCorrelationId, or RequestId.
Shows: TLS termination status, CA signaling status, GSA edge IP, error details.

> If you lack ESTS Kusto data permissions, the dashboard won't load - use queries below instead.

### 3B. GSA logs
In Azure Support Center: Tenant Explorer -> KustoWebUx -> idsharedwus cluster -> NaasProd -> RoxyHttpOperationEvent/RoxyStreamOperationEvent.

```kql
// Check if CA signaling is enabled
RoxyHttpOperationEvent
| where TenantId == "INSERT_TENANT_ID"
| summarize max(TIMESTAMP) by CaSignalingEnabled
```

- CaSignalingEnabled=true timestamp should be now or within 15 mins
- If "false" timestamp is more recent, customer needs to re-enable CA signaling
- CaSignalingEnabled should match the status in ASC/Entra portal
