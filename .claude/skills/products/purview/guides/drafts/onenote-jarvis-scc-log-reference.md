# Jarvis SCC Log Namespaces Reference (21Vianet)

> Source: OneNote — Jarvis logs for SCC
> Status: draft

## Namespace / Events Table Reference

| Namespace | Events Table | Usage |
|---|---|---|
| AdsAdminGal/AadServiceGal | IfxTraceEvent | Audit Events processing trace |
| NrtFrontEndGal | RecAuditEvt | Audit Log frontend |
| eDiscoveryV2Prod | ComplianceV2WorkBenchEvent | eDiscovery/Content Search jobs |
| ProtectionCenter/ProtectionCenterPrd | TraceEventLog | Compliance Portal front-end trace |
| O365PassiveGal | DLPPolicyAgentLogs | DLP policy execution logs (recent 30 days) |
| O365PassiveGal | Retentionpolicyagentlog | EXO Retention Policy execution logs (recent 30 days) |
| O365PassiveGal | UnifiedPolicyMonitoringInfoLogEvent | Data LifeCycle retention policy distribution logs |

## Query Tips

- Always filter by **Tenant ID** first
- Audit Log: Use NrtFrontEndGal → RecAuditEvt
- Compliance Portal frontend: Use ProtectionCenter saved query https://portal.microsoftgeneva.com/s/5FC1E2BE
- DLP Policy Execution: Filter by tenant ID → then by correlation ID for selected DLP events
- Note: DLP logs may show "Not Work" in some scenarios — verify with correlation ID

## 21V Applicability

All namespaces above are available in 21Vianet (Mooncake) Jarvis environment.
