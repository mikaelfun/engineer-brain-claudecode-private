# DEFENDER MDC CRI 与升级流程 — Troubleshooting Quick Reference

**Entries**: 6 | **21V**: all applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/mdc-cri-escalation.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Attack Path shows limited permissions content — some nodes lack context or details | (1) Insufficient plan on target or entry subscription (attack path spans subscriptions/environmen... | (1) Check plan on all involved subscriptions/environments via EnvironmentsPricing Kusto query. (2... | 🟢 8.5 | ADO Wiki |
| 2 | Error 'Conflict - Another update operation is in progress' (HTTP 409 Conflict) when enabling mult... | By design: MDC restricts parallel updates to different plans within the same subscription; subscr... | Introduce a delay of 10-15 seconds between consecutive plan update requests. Avoid updating multi... | 🟢 8.5 | ADO Wiki |
| 3 | Watchlist created with Failed status despite user receiving error message when submitting corrupt... | Content validation mechanism did not fully prevent Watchlist creation when request content was co... | NOW FIXED: Corrupted content properly blocks Watchlist creation/update. Corrupted content include... | 🟢 8.5 | ADO Wiki |
| 4 | Unable to connect to Cloud PC after restart; DiagActivity shows OS changed from Windows 10 Enterp... | Customer's Intune remediation script activated a Windows Professional OEM product key on the Clou... | Exclude the Intune script from Cloud PC devices. Verify via AgentExecutor.log in Intune diagnosti... | 🟢 8.5 | ADO Wiki |
| 5 | CIEM AWS Hydration failure that is not attributable to customer configuration or permissions | Platform-side failure in CIEM data pipeline | Create CRI with: TenantID, AWS Account ID, S3 ARN, SQS ARN. Contact feature owner. Reference ADX ... | 🔵 7.5 | ADO Wiki |
| 6 | 'No subscription found' error or 'Request timed out / infinity loading' in MDC Asset Inventory | No subscriptions in user's selected scope, or ARG query timeout | For 'No subscription found': verify subscriptions exist in current scope. For timeout/infinite lo... | 🔵 7.5 | ADO Wiki |

## Quick Troubleshooting Path

1. (1) Check plan on all involved subscriptions/environments via EnvironmentsPricing Kusto query. (2) Verify customer has required permissions across all subscriptions. (3) If plan and permissions are... `[Source: ADO Wiki]`
2. Introduce a delay of 10-15 seconds between consecutive plan update requests. Avoid updating multiple plans simultaneously via ARM/API/Terraform. Sequential enablement prevents the Conflict error. `[Source: ADO Wiki]`
3. NOW FIXED: Corrupted content properly blocks Watchlist creation/update. Corrupted content includes empty SearchKey values, reserved column names, length/size violations, header/content row size mis... `[Source: ADO Wiki]`
4. Exclude the Intune script from Cloud PC devices. Verify via AgentExecutor.log in Intune diagnostics for OEM key activation evidence. Cloud PC requires Enterprise edition; Gallery image type with En... `[Source: ADO Wiki]`
5. Create CRI with: TenantID, AWS Account ID, S3 ARN, SQS ARN. Contact feature owner. Reference ADX dashboard for failure classification confirmation before filing CRI. `[Source: ADO Wiki]`
