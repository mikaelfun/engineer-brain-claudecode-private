# AVD 许可证 — Troubleshooting Workflow

**Scenario Count**: 10
**Generated**: 2026-04-18

---

## Scenario 1: Windows 10/11 Enterprise multi-session AVD VM gets downgrade...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Identify and remove custom KMS server activation
- 2) Redeploy the VM and let it activate via Azure KMS
- Activation keys cannot restore multi-session
- Windows Enterprise multi-session must be activated by Azure KMS only.

**Root Cause**: Scenario 1: Customer has their own KMS server. VM gets activated by custom KMS server using single-session activation key, overriding multi-session activation.

## Scenario 2: After Azure Site Recovery (ASR) replication/failover, AVD VM...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- After ASR failover, manually set licenseType on the replicated VM: Set-AzVM -ResourceGroupName <rg> -Name <vm> -LicenseType Windows_Client. For AVD VMs, the deployment template normally includes this parameter automatically

**Root Cause**: ASR replication does not preserve the 'licenseType: Windows_Client' parameter on the VM object. Without this parameter, Azure charges the Windows license fee on top of compute cost

## Scenario 3: Windows 10 Enterprise multi-session: signing in with an admi...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps

**Root Cause**: 

## Scenario 4: User not showing under Reserve policy detail page (Device/Us...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check user's UPA states - ensure no other Active UPA exists. If license unavailable, purchase more or reclaim unused licenses.

**Root Cause**: User has another active UPA under a different policy (only one Active UPA per user); or no license available for the user

## Scenario 5: Tenant has no subscriptions even though Reserve licenses wer...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check CloudPCEvent Kusto logs for tenant update notifications. Verify subscription state transitions. If subscription stuck, check for errors in service logs.

**Root Cause**: Subscription in Blocked state (7-day hold after purchase) or service plan update event not processed correctly

## Scenario 6: Cannot create Reserve policy or cannot select 'Reserve' lice...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Query CloudPCEvent where EventUniqueName='RetrievePurchasedServicePlansAsync' for the TenantId. If service plan ID found in Col1, refresh page and retry. If not found, follow Reserve Tenant Onboard TSG for mitigation.

**Root Cause**: Tenant not onboarded - Reserve service plan (7d9859c6-ac79-411d-9188-72151d391e9c) not retrieved by TenantService

## Scenario 7: Cannot create new Microsoft Entra ID (Azure AD) tenant after...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Request a new Free Trial subscription at https://azure.microsoft.com/free/ using the same external email, then create tenant and migrate UEX subscription
- 2) Or have management remove subscription and membership from winuexltwindows.onmicrosoft.com, create tenant, then reassign subscription
- See: General Availability - Restrict Microsoft Entra ID Tenant Creation To Only Paid Subscription

**Root Cause**: Microsoft restricted Entra ID tenant creation to only paid subscriptions. If tenant was not created before receiving the UEX subscription, creation is blocked afterwards.

## Scenario 8: When logged in to WVD VMs, the user gets licensing warning a...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Set the LicensingMode registry value to 6.

**Root Cause**: Registry key HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\RCM\Licensing Core\LicensingMode was set to 5.

## Scenario 9: Customer enrolled in AVD per-user access pricing but sees no...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- (1) Confirm connections occurred after April 1, 2022. (2) Verify subscription enrollment status is 'Registered' via Get-AzProviderFeature. (3) Confirm the AVD host pool resource is inside the enrolled subscription, not a different subscription

**Root Cause**: (1) Connections before April 1, 2022: expected — promotional period with $0 charges. (2) Connections after April 1, 2022: subscription may not be fully enrolled, or the AVD host pool object is in a different subscription than the enrolled one

## Scenario 10: Azure portal shows Create a free account when accessing AVD
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Sign in with Contributor-level access account

**Root Cause**: No active subscriptions or account lacks view permissions
