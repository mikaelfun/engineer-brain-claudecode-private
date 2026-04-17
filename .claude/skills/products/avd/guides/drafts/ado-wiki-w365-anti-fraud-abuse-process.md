---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/Processes and Collaboration/Windows 365 Anti Fraud and Abuse Process"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FProcesses%20and%20Collaboration%2FWindows%20365%20Anti%20Fraud%20and%20Abuse%20Process"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Windows 365 Anti Fraud and Abuse Process

## Tenant Score and Provision Lanes

To protect Cloud PC service and customers from fraudsters, Cloud PC engineering team launched the Tenant Score feature in backend to assess how trustworthy each tenant is.

- Tenant score is between 0 and 1
- **Slow lane**: [min, 0.03) — tenant can only provision **2 Cloud PCs per week**
- **Ordinary lane**: [0.03, 0.9) — tenant can provision 8 Cloud PCs per 5 min
- **Fast lane**: [0.9, max] — tenant can provision 50 Cloud PCs per 5 min

## Suspicion and Fraud Tenant

Tenant in slow lane may be marked as highly suspicious tenant and after confirmed by HIT (Human Investigation Team) they will be marked as fraud tenant.

- **Highly suspicious tenant**: all Cloud PCs under the tenant will be **deallocated (stopped, customer cannot start these deallocated devices)**. If confirmed as fraud by HIT, all Cloud PCs will be **deprovisioned**.
- **Confirmed fraud tenant**: all Cloud PCs will be **deprovisioned**.

## Diagnostic Queries

### Check Tenant Trust Level (CloudPC Event Kusto)
```kql
cluster("https://cloudpc.eastus2.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| union cluster("https://cloudpcneu.northeurope.kusto.windows.net").database('CloudPCProd').CloudPCEvent
| where OtherIdentifiers == "<TenantID>"
| where Col1 startswith "Evaluation: Called usage service, tenantEvaluationResults"
| project env_time, env_cloud_name, env_cloud_environment, Col1, TenantId = OtherIdentifiers
```

### Check Tenant Score History (Reporting Kusto)
```kql
cluster('cpcdeedprptprodgbl.eastus2.kusto.windows.net').database('Reporting').DailyTenantEvaluation_Snapshot
| where TenantId == "<TenantID>"
| project TenantId, EvaluatedAt, TrustLevel, PreviousTrustLevel, HITStatus, SentToHITAt, HITDecisionTime
```

## Process for Slow Lane Tenant Tickets

1. Customer reports provisioning is limited/slow
2. Check tenant trust level via Kusto or CPCD
3. If tenant is in slow lane, follow escalation process

## Process for Fraud Tenant Tickets

1. Customer reports Cloud PCs deprovisioned
2. Check fraud status via CPCD/Kusto
3. If fraud upheld → inform customer subscription remains disabled
4. If fraud lifted → re-enable subscription and apologize

## Customer Email Templates

### Fraud Upheld
> Thank you for reaching out. Unfortunately, our earlier decision stands and your subscription(s) will remain disabled. Please understand that we keep security checks like these in place in order to help protect the quality and integrity of the Windows 365 service.

### Fraud Lifted
> Good news, the issue has been resolved! We're sorry about the temporary service interruption. To help protect the security and privacy of your account, we perform routine audits of all Windows 365 subscriptions. We've re-enabled your subscription and apologize for any inconvenience this caused. We are taking active steps to learn from this error.

## Tools

- [CPCD Dashboard](https://aka.ms/cpcd) — Check tenant score and trust level history
- [CMAT](https://cmat.azure.com/)
- [CST Portal](https://cst.azure.com/)
