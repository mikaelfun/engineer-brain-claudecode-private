# AVD AVD 许可证 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Drafts fused**: 2 | **Kusto queries fused**: 0
**Source drafts**: ado-wiki-a-billing-solution.md, onenote-avd-licensing-reference.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: MS Learn, OneNote, KB, ADO Wiki

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| After Azure Site Recovery (ASR) replication/failover, AVD VM... | ASR replication does not preserve the 'licenseType: Windows_... | After ASR failover, manually set licenseType on the replicat... |
| User not showing under Reserve policy detail page (Device/Us... | User has another active UPA under a different policy (only o... | Check user's UPA states - ensure no other Active UPA exists.... |
| Tenant has no subscriptions even though Reserve licenses wer... | Subscription in Blocked state (7-day hold after purchase) or... | Check CloudPCEvent Kusto logs for tenant update notification... |
| Cannot create Reserve policy or cannot select 'Reserve' lice... | Tenant not onboarded - Reserve service plan (7d9859c6-ac79-4... | Query CloudPCEvent where EventUniqueName='RetrievePurchasedS... |
| RTT and bandwidth information missing from CloudPC Performan... | SSL inspection (by firewall/proxy) is intercepting traffic t... | Run elevated PowerShell in Cloud PC: Invoke-WebRequest -Uri ... |
| Cannot create new Microsoft Entra ID (Azure AD) tenant after... | Microsoft restricted Entra ID tenant creation to only paid s... | 1) Request a new Free Trial subscription at https://azure.mi... |
| When logged in to WVD VMs, the user gets licensing warning a... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal ... | Set the LicensingMode registry value to 6. |
| Azure portal shows Create a free account when accessing AVD | No active subscriptions or account lacks view permissions | Sign in with Contributor-level access account |

### Phase 2: Detailed Investigation

#### CSS only does break-fix and advisory - NOT billing questions.
> Source: [ado-wiki-a-billing-solution.md](guides/drafts/ado-wiki-a-billing-solution.md)

#### Ask the customer to open a new ticket with Billing Support or transfer the case to `Azure\Billing\Assistance with bill or usage\Help me understand my bill (invoice) and usage`

#### AVD Licensing & KMS Activation Reference (Mooncake)
> Source: [onenote-avd-licensing-reference.md](guides/drafts/onenote-avd-licensing-reference.md)

> Source: OneNote - Mooncake POD Support Notebook / AVD / Common Issues / Licensing

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 | After Azure Site Recovery (ASR) replication/failover, AVD VM is billed at higher... | ASR replication does not preserve the 'licenseType: Windows_Client' parameter on... | After ASR failover, manually set licenseType on the replicated VM: Set-AzVM -Res... | 🟢 8.0 | OneNote |
| 2 | User not showing under Reserve policy detail page (Device/Users tabs) after bein... | User has another active UPA under a different policy (only one Active UPA per us... | Check user's UPA states - ensure no other Active UPA exists. If license unavaila... | 🔵 7.5 | ADO Wiki |
| 3 | Tenant has no subscriptions even though Reserve licenses were purchased; or subs... | Subscription in Blocked state (7-day hold after purchase) or service plan update... | Check CloudPCEvent Kusto logs for tenant update notifications. Verify subscripti... | 🔵 7.5 | ADO Wiki |
| 4 | Cannot create Reserve policy or cannot select 'Reserve' license type during poli... | Tenant not onboarded - Reserve service plan (7d9859c6-ac79-411d-9188-72151d391e9... | Query CloudPCEvent where EventUniqueName='RetrievePurchasedServicePlansAsync' fo... | 🔵 7.5 | ADO Wiki |
| 5 | RTT and bandwidth information missing from CloudPC Performance / Connection Qual... | SSL inspection (by firewall/proxy) is intercepting traffic to Geneva monitoring ... | Run elevated PowerShell in Cloud PC: Invoke-WebRequest -Uri 'https://gcs.prod.mo... | 🔵 7.5 | ADO Wiki |
| 6 | Cannot create new Microsoft Entra ID (Azure AD) tenant after receiving UEX Azure... | Microsoft restricted Entra ID tenant creation to only paid subscriptions. If ten... | 1) Request a new Free Trial subscription at https://azure.microsoft.com/free/ us... | 🔵 7.0 | ADO Wiki |
| 7 | When logged in to WVD VMs, the user gets licensing warning about Remote Desktop ... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\Licensing... | Set the LicensingMode registry value to 6. | 🔵 6.5 | KB |
| 8 | Azure portal shows Create a free account when accessing AVD | No active subscriptions or account lacks view permissions | Sign in with Contributor-level access account | 🔵 6.0 | MS Learn |
