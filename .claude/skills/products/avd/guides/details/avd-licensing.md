# AVD AVD 许可证 - Comprehensive Troubleshooting Guide

**Entries**: 10 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Enter... | Scenario 1: Customer has their own KMS server. VM gets activated by cu... | 1) Identify and remove custom KMS server activation. 2) Redeploy the V... |
| After Azure Site Recovery (ASR) replication/failover, AVD VM is billed... | ASR replication does not preserve the 'licenseType: Windows_Client' pa... | After ASR failover, manually set licenseType on the replicated VM: Set... |
| Windows 10 Enterprise multi-session: signing in with an administrative... |  |  |
| User not showing under Reserve policy detail page (Device/Users tabs) ... | User has another active UPA under a different policy (only one Active ... | Check user's UPA states - ensure no other Active UPA exists. If licens... |
| Tenant has no subscriptions even though Reserve licenses were purchase... | Subscription in Blocked state (7-day hold after purchase) or service p... | Check CloudPCEvent Kusto logs for tenant update notifications. Verify ... |
| Cannot create Reserve policy or cannot select 'Reserve' license type d... | Tenant not onboarded - Reserve service plan (7d9859c6-ac79-411d-9188-7... | Query CloudPCEvent where EventUniqueName='RetrievePurchasedServicePlan... |
| Cannot create new Microsoft Entra ID (Azure AD) tenant after receiving... | Microsoft restricted Entra ID tenant creation to only paid subscriptio... | 1) Request a new Free Trial subscription at https://azure.microsoft.co... |
| When logged in to WVD VMs, the user gets licensing warning about Remot... | Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM... | Set the LicensingMode registry value to 6. |
| Customer enrolled in AVD per-user access pricing but sees no charges o... | (1) Connections before April 1, 2022: expected — promotional period wi... | (1) Confirm connections occurred after April 1, 2022. (2) Verify subsc... |
| Azure portal shows Create a free account when accessing AVD | No active subscriptions or account lacks view permissions | Sign in with Contributor-level access account |

### Phase 2: Detailed Investigation

#### Entry 1: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-006 | Score: 9.0

**Symptom**: Windows 10/11 Enterprise multi-session AVD VM gets downgraded to Enterprise single session (or other edition). VM loses multi-session capability.

**Root Cause**: Scenario 1: Customer has their own KMS server. VM gets activated by custom KMS server using single-session activation key, overriding multi-session activation.

**Solution**: 1) Identify and remove custom KMS server activation. 2) Redeploy the VM and let it activate via Azure KMS. Activation keys cannot restore multi-session. Windows Enterprise multi-session must be activated by Azure KMS only.

> 21V Mooncake: Applicable

#### Entry 2: After Azure Site Recovery (ASR) replication/failover, AVD VM...
> Source: OneNote | ID: avd-onenote-002 | Score: 8.5

**Symptom**: After Azure Site Recovery (ASR) replication/failover, AVD VM is billed at higher rate showing 'Dsv5 Series Windows' instead of 'Dsv5 Series' in cost report

**Root Cause**: ASR replication does not preserve the 'licenseType: Windows_Client' parameter on the VM object. Without this parameter, Azure charges the Windows license fee on top of compute cost

**Solution**: After ASR failover, manually set licenseType on the replicated VM: Set-AzVM -ResourceGroupName <rg> -Name <vm> -LicenseType Windows_Client. For AVD VMs, the deployment template normally includes this parameter automatically

> 21V Mooncake: Applicable

#### Entry 3: Windows 10 Enterprise multi-session: signing in with an admi...
> Source: ContentIdea | ID: avd-contentidea-kb-003 | Score: 8.5

**Symptom**: Windows 10 Enterprise multi-session: signing in with an administrative account shows notification "Remote Desktop licensing mode is not configured, Remote Desktop Services will stop working in X days."

**Root Cause**: 

**Solution**: 

> 21V Mooncake: Applicable

#### Entry 4: User not showing under Reserve policy detail page (Device/Us...
> Source: ADO Wiki | ID: avd-ado-wiki-205 | Score: 8.0

**Symptom**: User not showing under Reserve policy detail page (Device/Users tabs) after being assigned to group with Reserve policy

**Root Cause**: User has another active UPA under a different policy (only one Active UPA per user); or no license available for the user

**Solution**: Check user's UPA states - ensure no other Active UPA exists. If license unavailable, purchase more or reclaim unused licenses.

> 21V Mooncake: Applicable

#### Entry 5: Tenant has no subscriptions even though Reserve licenses wer...
> Source: ADO Wiki | ID: avd-ado-wiki-206 | Score: 8.0

**Symptom**: Tenant has no subscriptions even though Reserve licenses were purchased; or subscription/ULA metadata is wrong

**Root Cause**: Subscription in Blocked state (7-day hold after purchase) or service plan update event not processed correctly

**Solution**: Check CloudPCEvent Kusto logs for tenant update notifications. Verify subscription state transitions. If subscription stuck, check for errors in service logs.

> 21V Mooncake: Applicable

#### Entry 6: Cannot create Reserve policy or cannot select 'Reserve' lice...
> Source: ADO Wiki | ID: avd-ado-wiki-208 | Score: 8.0

**Symptom**: Cannot create Reserve policy or cannot select 'Reserve' license type during policy creation

**Root Cause**: Tenant not onboarded - Reserve service plan (7d9859c6-ac79-411d-9188-72151d391e9c) not retrieved by TenantService

**Solution**: Query CloudPCEvent where EventUniqueName='RetrievePurchasedServicePlansAsync' for the TenantId. If service plan ID found in Col1, refresh page and retry. If not found, follow Reserve Tenant Onboard TSG for mitigation.

> 21V Mooncake: Applicable

#### Entry 7: Cannot create new Microsoft Entra ID (Azure AD) tenant after...
> Source: ADO Wiki | ID: avd-ado-wiki-167 | Score: 7.0

**Symptom**: Cannot create new Microsoft Entra ID (Azure AD) tenant after receiving UEX Azure subscription - tenant creation is blocked due to trial subscription restrictions

**Root Cause**: Microsoft restricted Entra ID tenant creation to only paid subscriptions. If tenant was not created before receiving the UEX subscription, creation is blocked afterwards.

**Solution**: 1) Request a new Free Trial subscription at https://azure.microsoft.com/free/ using the same external email, then create tenant and migrate UEX subscription. 2) Or have management remove subscription and membership from winuexltwindows.onmicrosoft.com, create tenant, then reassign subscription. See: General Availability - Restrict Microsoft Entra ID Tenant Creation To Only Paid Subscription

> 21V Mooncake: Applicable

#### Entry 8: When logged in to WVD VMs, the user gets licensing warning a...
> Source: ContentIdea | ID: avd-contentidea-kb-023 | Score: 6.5

**Symptom**: When logged in to WVD VMs, the user gets licensing warning about Remote Desktop licensing mode not configured. Sudden disconnections also occur across all WVD machines.

**Root Cause**: Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\Licensing Core\LicensingMode was set to 5.

**Solution**: Set the LicensingMode registry value to 6.

> 21V Mooncake: Applicable

#### Entry 9: Customer enrolled in AVD per-user access pricing but sees no...
> Source: ADO Wiki | ID: avd-ado-wiki-0863 | Score: 6.5

**Symptom**: Customer enrolled in AVD per-user access pricing but sees no charges on their Azure subscription

**Root Cause**: (1) Connections before April 1, 2022: expected — promotional period with $0 charges. (2) Connections after April 1, 2022: subscription may not be fully enrolled, or the AVD host pool object is in a different subscription than the enrolled one

**Solution**: (1) Confirm connections occurred after April 1, 2022. (2) Verify subscription enrollment status is 'Registered' via Get-AzProviderFeature. (3) Confirm the AVD host pool resource is inside the enrolled subscription, not a different subscription

> 21V Mooncake: Not verified

#### Entry 10: Azure portal shows Create a free account when accessing AVD
> Source: MS Learn | ID: avd-mslearn-038 | Score: 6.0

**Symptom**: Azure portal shows Create a free account when accessing AVD

**Root Cause**: No active subscriptions or account lacks view permissions

**Solution**: Sign in with Contributor-level access account

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
