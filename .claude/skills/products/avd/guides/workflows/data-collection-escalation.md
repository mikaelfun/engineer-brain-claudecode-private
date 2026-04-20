# 数据收集与升级流程 — Troubleshooting Workflow

**Scenario Count**: 8
**Generated**: 2026-04-18

---

## Scenario 1: Cloud PC VM fails to boot or stuck on restarting
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Engage RDOS DRI (OCE) via IcM to capture memory dump. Get NodeId/ContainerId/VMId from CPCD Tool or AzureCM.LogContainerSnapshot. AVD can use Serial Console first. Previous FC dump method unavailable since May 2023.

**Root Cause**: Azure Host level changes - VMs running in certain Cluster or Host version may hit boot issue

## Scenario 2: AccessDenied error when performing Inspect IaaS Disk log col...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Pin the VM to the case using Resource Explorer (Step 6 in ASC workflow) and refresh the entire page

**Root Cause**: VM not pinned to the DfM case in Azure Support Center

## Scenario 3: Windows 10/11 Enterprise multi-session OS on AVD VM gets dow...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Confirm the customer is using their own KMS server
- 2) The only supported fix is to redeploy the VM and let it activate via Azure KMS (using activation keys to re-upgrade is NOT supported)
- 3) Collect MSRD-Collect data with Activation scenario
- 4) Review MSRD-Diag to check Azure KMS reachability and custom KMS configuration
- 5) Investigate and remove the root cause (custom KMS) to prevent recurrence after redeploy.

**Root Cause**: The VM gets activated/reactivated by a customer custom KMS server using an activation key for single session OS, which overrides the multi-session edition. Windows Enterprise multi-session must be activated by Azure KMS only.

## Scenario 4: AVD agent process crashing with Event ID 1000 in Application...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Collect MSRD-Collect and check Event ID 1000s
- 2) First verify NOT hitting INVALID_REGISTRATION_TOKEN or NAME_ALREADY_REGISTERED (these generate misleading crash events)
- 3) Use Kusto: RDPCoreTSEventLog where ProviderName=='LSM' and Message startswith 'szOutput="ERR::RCM process exit' to find crash events
- 4) If actual crash, configure procdump to capture process dump when agent crashes, then create ICM for PG review

**Root Cause**: Agent crashes can be misleading - often caused by underlying INVALID_REGISTRATION_TOKEN or NAME_ALREADY_REGISTERED issues which generate Event ID 1000 crash events. If neither applies, the crash requires PG investigation via process dump

## Scenario 5: Application crash or hang inside Cloud PC or AVD session hos...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Ask user to collect User-Mode Dump via Windows Error Reporting (WER) or Task Manager. Share via DTM. AVD can also use Diagnostic Settings > Crash Dumps. Fleet Diagnostic only for 1P VMs.

**Root Cause**: Various application-level issues in guest OS

## Scenario 6: Error SubscriptionNotRegisteredForFeature when creating Publ...
> Source: ADO Wiki | Applicable: ❓

### Troubleshooting Steps
- 1
- Register subscription for AllowBringYourOwnPublicIpAddress feature via SAW/AME account
- 2
- Verify with Get-AzProviderFeature
- 3
- Create IpTag with New-AzPublicIpTag -IpTagType FirstPartyUsage -Tag /Unprivileged
- 4
- Create IP with New-AzPublicIpAddress including -IpTag parameter

**Root Cause**: Subscription not registered for Microsoft.Network/AllowBringYourOwnPublicIpAddress feature required by SFI baseline for IP tagging

## Scenario 7: Azure AD joined Windows 11 AVD VMs: users get 'The sign-in m...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Ensure machines are successfully provisioned and managed in Intune. Once machines reach managed state with proper compliance status, login issue resolves.

**Root Cause**: AVD VMs deployed via Intune never got into managed state. Intune compliance shows 'See ConfigMgr' instead of 'Compliant' for non-working machines.

## Scenario 8: Users trying to login to Azure AD VMs get error: "The sign-i...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Engage internal Intune team. Ensure machines are successfully provisioned in Intune managed state. Once Intune provisioning completed, the issue was resolved.

**Root Cause**: AVD VMs deployed using Intune had broken settings. Provisioned machines never got into a managed state with Intune. Compliance showed 'See ConfigMgr' for non-working machines vs 'Compliant' for working ones.
