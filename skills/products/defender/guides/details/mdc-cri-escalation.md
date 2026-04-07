# DEFENDER MDC CRI 与升级流程 — Comprehensive Troubleshooting Guide

**Entries**: 6 | **Draft sources**: 14 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-container-security-escalation.md, ado-wiki-a-cri-escalation-flow.md, ado-wiki-a-cri-handling-guidelines.md, ado-wiki-a-cri-noise-low-quality.md, ado-wiki-a-cri-sla-kpis.md, ado-wiki-a-epp-appendix-script.md, ado-wiki-a-r3-mdc-sme-pg-escalation-path.md, ado-wiki-b-alerts-escalation-path.md, ado-wiki-b-icm-reactivation-policy.md, ado-wiki-b-mdc-cri-handling.md
  ... and 4 more
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Attack Paths
> Sources: ado-wiki

**1. Attack Path shows limited permissions content — some nodes lack context or details**

- **Root Cause**: (1) Insufficient plan on target or entry subscription (attack path spans subscriptions/environments lacking required plan). (2) Customer lacks permissions on target subscription or security connector. (3) Content not published successfully to ARG (data pipeline issue).
- **Solution**: (1) Check plan on all involved subscriptions/environments via EnvironmentsPricing Kusto query. (2) Verify customer has required permissions across all subscriptions. (3) If plan and permissions are correct but content still missing — open a CRI for engineering to investigate ARG publishing failure. Requires MDC-EntityStore-Prod-Viewers JIT access (SAW + AME account + CSS-IS-MDCKustoAccess group).
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 2: Plan Enablement
> Sources: ado-wiki

**1. Error 'Conflict - Another update operation is in progress' (HTTP 409 Conflict) when enabling multiple Microsoft Defender for Cloud plans simultaneously within the same subscription**

- **Root Cause**: By design: MDC restricts parallel updates to different plans within the same subscription; subscription is temporarily locked during plan updates (typically a few seconds)
- **Solution**: Introduce a delay of 10-15 seconds between consecutive plan update requests. Avoid updating multiple plans simultaneously via ARM/API/Terraform. Sequential enablement prevents the Conflict error.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 3: Watchlist
> Sources: ado-wiki

**1. Watchlist created with Failed status despite user receiving error message when submitting corrupted content via create-or-update API. Watchlist should not have been created at all.**

- **Root Cause**: Content validation mechanism did not fully prevent Watchlist creation when request content was corrupted. A Watchlist was incorrectly created with Failed status (CRI IcM 701470798).
- **Solution**: NOW FIXED: Corrupted content properly blocks Watchlist creation/update. Corrupted content includes empty SearchKey values, reserved column names, length/size violations, header/content row size mismatches. Check browser dev tools for detailed errors.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 4: Cloud Pc
> Sources: ado-wiki

**1. Unable to connect to Cloud PC after restart; DiagActivity shows OS changed from Windows 10 Enterprise to Windows 10 Pro with Failure outcomes**

- **Root Cause**: Customer's Intune remediation script activated a Windows Professional OEM product key on the Cloud PC, changing OS from Enterprise to Professional. Professional edition is not supported by the Cloud PC agent, causing sxs stack to stop listening.
- **Solution**: Exclude the Intune script from Cloud PC devices. Verify via AgentExecutor.log in Intune diagnostics for OEM key activation evidence. Cloud PC requires Enterprise edition; Gallery image type with Enterprise license must be maintained.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

### Phase 5: Ciem
> Sources: ado-wiki

**1. CIEM AWS Hydration failure that is not attributable to customer configuration or permissions**

- **Root Cause**: Platform-side failure in CIEM data pipeline
- **Solution**: Create CRI with: TenantID, AWS Account ID, S3 ARN, SQS ARN. Contact feature owner. Reference ADX dashboard for failure classification confirmation before filing CRI.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

### Phase 6: Inventory
> Sources: ado-wiki

**1. 'No subscription found' error or 'Request timed out / infinity loading' in MDC Asset Inventory**

- **Root Cause**: No subscriptions in user's selected scope, or ARG query timeout
- **Solution**: For 'No subscription found': verify subscriptions exist in current scope. For timeout/infinite loading: click 'View in Resource Graph Explorer', run the query directly in ARG, capture and share the error message.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 7.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Attack Path shows limited permissions content — some nodes lack context or details | (1) Insufficient plan on target or entry subscription (attack path spans subscriptions/environmen... | (1) Check plan on all involved subscriptions/environments via EnvironmentsPricing Kusto query. (2... | 🟢 8.5 | ADO Wiki |
| 2 | Error 'Conflict - Another update operation is in progress' (HTTP 409 Conflict) when enabling mult... | By design: MDC restricts parallel updates to different plans within the same subscription; subscr... | Introduce a delay of 10-15 seconds between consecutive plan update requests. Avoid updating multi... | 🟢 8.5 | ADO Wiki |
| 3 | Watchlist created with Failed status despite user receiving error message when submitting corrupt... | Content validation mechanism did not fully prevent Watchlist creation when request content was co... | NOW FIXED: Corrupted content properly blocks Watchlist creation/update. Corrupted content include... | 🟢 8.5 | ADO Wiki |
| 4 | Unable to connect to Cloud PC after restart; DiagActivity shows OS changed from Windows 10 Enterp... | Customer's Intune remediation script activated a Windows Professional OEM product key on the Clou... | Exclude the Intune script from Cloud PC devices. Verify via AgentExecutor.log in Intune diagnosti... | 🟢 8.5 | ADO Wiki |
| 5 | CIEM AWS Hydration failure that is not attributable to customer configuration or permissions | Platform-side failure in CIEM data pipeline | Create CRI with: TenantID, AWS Account ID, S3 ARN, SQS ARN. Contact feature owner. Reference ADX ... | 🔵 7.5 | ADO Wiki |
| 6 | 'No subscription found' error or 'Request timed out / infinity loading' in MDC Asset Inventory | No subscriptions in user's selected scope, or ARG query timeout | For 'No subscription found': verify subscriptions exist in current scope. For timeout/infinite lo... | 🔵 7.5 | ADO Wiki |
