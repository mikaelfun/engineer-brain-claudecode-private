# AVD AVD 许可证 - Quick Reference

**Entries**: 10 | **21V**: mixed
**Keywords**: activation, asr, azure-ad, billing, blocked-state, contentidea-kb, cost, downgrade, entra-id, host-pool, internal-process, kms, kusto, license, licensetype
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Enterprise sing... | Scenario 1: Customer has their own KMS server. VM gets activated by custom KMS s... | 1) Identify and remove custom KMS server activation. 2) Redeploy the VM and let ... | 🟢 9.0 | ADO Wiki |
| 2 📋 | After Azure Site Recovery (ASR) replication/failover, AVD VM is billed at higher... | ASR replication does not preserve the 'licenseType: Windows_Client' parameter on... | After ASR failover, manually set licenseType on the replicated VM: Set-AzVM -Res... | 🟢 8.5 | OneNote |
| 3 📋 | Windows 10 Enterprise multi-session: signing in with an administrative account s... |  |  | 🟢 8.5 | ContentIdea |
| 4 📋 | User not showing under Reserve policy detail page (Device/Users tabs) after bein... | User has another active UPA under a different policy (only one Active UPA per us... | Check user's UPA states - ensure no other Active UPA exists. If license unavaila... | 🟢 8.0 | ADO Wiki |
| 5 📋 | Tenant has no subscriptions even though Reserve licenses were purchased; or subs... | Subscription in Blocked state (7-day hold after purchase) or service plan update... | Check CloudPCEvent Kusto logs for tenant update notifications. Verify subscripti... | 🟢 8.0 | ADO Wiki |
| 6 📋 | Cannot create Reserve policy or cannot select 'Reserve' license type during poli... | Tenant not onboarded - Reserve service plan (7d9859c6-ac79-411d-9188-72151d391e9... | Query CloudPCEvent where EventUniqueName='RetrievePurchasedServicePlansAsync' fo... | 🟢 8.0 | ADO Wiki |
| 7 📋 | Cannot create new Microsoft Entra ID (Azure AD) tenant after receiving UEX Azure... | Microsoft restricted Entra ID tenant creation to only paid subscriptions. If ten... | 1) Request a new Free Trial subscription at https://azure.microsoft.com/free/ us... | 🔵 7.0 | ADO Wiki |
| 8 📋 | When logged in to WVD VMs, the user gets licensing warning about Remote Desktop ... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\Licensing... | Set the LicensingMode registry value to 6. | 🔵 6.5 | ContentIdea |
| 9 📋 | Customer enrolled in AVD per-user access pricing but sees no charges on their Az... | (1) Connections before April 1, 2022: expected — promotional period with $0 char... | (1) Confirm connections occurred after April 1, 2022. (2) Verify subscription en... | 🔵 6.5 | ADO Wiki |
| 10 📋 | Azure portal shows Create a free account when accessing AVD | No active subscriptions or account lacks view permissions | Sign in with Contributor-level access account | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: Scenario 1: Customer has their own KMS server. VM gets activ... `[Source: ADO Wiki]`
2. Check: ASR replication does not preserve the 'licenseType: Windows_... `[Source: OneNote]`
3. Check:  `[Source: ContentIdea]`
4. Check: User has another active UPA under a different policy (only o... `[Source: ADO Wiki]`
5. Check: Subscription in Blocked state (7-day hold after purchase) or... `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-licensing.md#troubleshooting-flow)