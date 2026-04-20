# AVD 数据收集与升级流程 - Comprehensive Troubleshooting Guide

**Entries**: 8 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Cloud PC VM fails to boot or stuck on restarting | Azure Host level changes - VMs running in certain Cluster or Host vers... | Engage RDOS DRI (OCE) via IcM to capture memory dump. Get NodeId/Conta... |
| AccessDenied error when performing Inspect IaaS Disk log collection in... | VM not pinned to the DfM case in Azure Support Center | Pin the VM to the case using Resource Explorer (Step 6 in ASC workflow... |
| Windows 10/11 Enterprise multi-session OS on AVD VM gets downgraded to... | The VM gets activated/reactivated by a customer custom KMS server usin... | 1) Confirm the customer is using their own KMS server. 2) The only sup... |
| AVD agent process crashing with Event ID 1000 in Application logs. Pro... | Agent crashes can be misleading - often caused by underlying INVALID_R... | 1) Collect MSRD-Collect and check Event ID 1000s. 2) First verify NOT ... |
| Application crash or hang inside Cloud PC or AVD session host | Various application-level issues in guest OS | Ask user to collect User-Mode Dump via Windows Error Reporting (WER) o... |
| Error SubscriptionNotRegisteredForFeature when creating Public IP Addr... | Subscription not registered for Microsoft.Network/AllowBringYourOwnPub... | 1. Register subscription for AllowBringYourOwnPublicIpAddress feature ... |
| Azure AD joined Windows 11 AVD VMs: users get 'The sign-in method you'... | AVD VMs deployed via Intune never got into managed state. Intune compl... | Ensure machines are successfully provisioned and managed in Intune. On... |
| Users trying to login to Azure AD VMs get error: "The sign-in method y... | AVD VMs deployed using Intune had broken settings. Provisioned machine... | Engage internal Intune team. Ensure machines are successfully provisio... |

### Phase 2: Detailed Investigation

#### Entry 1: Cloud PC VM fails to boot or stuck on restarting
> Source: ADO Wiki | ID: avd-ado-wiki-321 | Score: 8.0

**Symptom**: Cloud PC VM fails to boot or stuck on restarting

**Root Cause**: Azure Host level changes - VMs running in certain Cluster or Host version may hit boot issue

**Solution**: Engage RDOS DRI (OCE) via IcM to capture memory dump. Get NodeId/ContainerId/VMId from CPCD Tool or AzureCM.LogContainerSnapshot. AVD can use Serial Console first. Previous FC dump method unavailable since May 2023.

> 21V Mooncake: Applicable

#### Entry 2: AccessDenied error when performing Inspect IaaS Disk log col...
> Source: ADO Wiki | ID: avd-ado-wiki-428 | Score: 8.0

**Symptom**: AccessDenied error when performing Inspect IaaS Disk log collection in ASC for Windows 365 Cloud PC

**Root Cause**: VM not pinned to the DfM case in Azure Support Center

**Solution**: Pin the VM to the case using Resource Explorer (Step 6 in ASC workflow) and refresh the entire page

> 21V Mooncake: Applicable

#### Entry 3: Windows 10/11 Enterprise multi-session OS on AVD VM gets dow...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r4-003 | Score: 8.0

**Symptom**: Windows 10/11 Enterprise multi-session OS on AVD VM gets downgraded to Enterprise single session (or other editions). Customer is using a custom KMS server.

**Root Cause**: The VM gets activated/reactivated by a customer custom KMS server using an activation key for single session OS, which overrides the multi-session edition. Windows Enterprise multi-session must be activated by Azure KMS only.

**Solution**: 1) Confirm the customer is using their own KMS server. 2) The only supported fix is to redeploy the VM and let it activate via Azure KMS (using activation keys to re-upgrade is NOT supported). 3) Collect MSRD-Collect data with Activation scenario. 4) Review MSRD-Diag to check Azure KMS reachability and custom KMS configuration. 5) Investigate and remove the root cause (custom KMS) to prevent recurrence after redeploy.

> 21V Mooncake: Applicable

#### Entry 4: AVD agent process crashing with Event ID 1000 in Application...
> Source: ADO Wiki | ID: avd-ado-wiki-b-r6-004 | Score: 8.0

**Symptom**: AVD agent process crashing with Event ID 1000 in Application logs. Processes affected: Winlogon, TermServ, RdAgentBootLoader, RdpInit, RdpShell, Explorer, Appx

**Root Cause**: Agent crashes can be misleading - often caused by underlying INVALID_REGISTRATION_TOKEN or NAME_ALREADY_REGISTERED issues which generate Event ID 1000 crash events. If neither applies, the crash requires PG investigation via process dump

**Solution**: 1) Collect MSRD-Collect and check Event ID 1000s. 2) First verify NOT hitting INVALID_REGISTRATION_TOKEN or NAME_ALREADY_REGISTERED (these generate misleading crash events). 3) Use Kusto: RDPCoreTSEventLog where ProviderName=='LSM' and Message startswith 'szOutput="ERR::RCM process exit' to find crash events. 4) If actual crash, configure procdump to capture process dump when agent crashes, then create ICM for PG review

> 21V Mooncake: Applicable

#### Entry 5: Application crash or hang inside Cloud PC or AVD session hos...
> Source: ADO Wiki | ID: avd-ado-wiki-322 | Score: 8.0

**Symptom**: Application crash or hang inside Cloud PC or AVD session host

**Root Cause**: Various application-level issues in guest OS

**Solution**: Ask user to collect User-Mode Dump via Windows Error Reporting (WER) or Task Manager. Share via DTM. AVD can also use Diagnostic Settings > Crash Dumps. Fleet Diagnostic only for 1P VMs.

> 21V Mooncake: Applicable

#### Entry 6: Error SubscriptionNotRegisteredForFeature when creating Publ...
> Source: ADO Wiki | ID: avd-ado-wiki-366 | Score: 6.5

**Symptom**: Error SubscriptionNotRegisteredForFeature when creating Public IP Address without registering AllowBringYourOwnPublicIpAddress feature for SFI compliance

**Root Cause**: Subscription not registered for Microsoft.Network/AllowBringYourOwnPublicIpAddress feature required by SFI baseline for IP tagging

**Solution**: 1. Register subscription for AllowBringYourOwnPublicIpAddress feature via SAW/AME account. 2. Verify with Get-AzProviderFeature. 3. Create IpTag with New-AzPublicIpTag -IpTagType FirstPartyUsage -Tag /Unprivileged. 4. Create IP with New-AzPublicIpAddress including -IpTag parameter

> 21V Mooncake: Not verified

#### Entry 7: Azure AD joined Windows 11 AVD VMs: users get 'The sign-in m...
> Source: ContentIdea | ID: avd-contentidea-kb-068 | Score: 6.5

**Symptom**: Azure AD joined Windows 11 AVD VMs: users get 'The sign-in method you're trying to use isn't allowed'. Most users cannot login, only few can.

**Root Cause**: AVD VMs deployed via Intune never got into managed state. Intune compliance shows 'See ConfigMgr' instead of 'Compliant' for non-working machines.

**Solution**: Ensure machines are successfully provisioned and managed in Intune. Once machines reach managed state with proper compliance status, login issue resolves.

> 21V Mooncake: Applicable

#### Entry 8: Users trying to login to Azure AD VMs get error: "The sign-i...
> Source: ContentIdea | ID: avd-contentidea-kb-073 | Score: 6.5

**Symptom**: Users trying to login to Azure AD VMs get error: "The sign-in method you're trying to use isn't allowed." Most users unable to login, few users can.

**Root Cause**: AVD VMs deployed using Intune had broken settings. Provisioned machines never got into a managed state with Intune. Compliance showed 'See ConfigMgr' for non-working machines vs 'Compliant' for working ones.

**Solution**: Engage internal Intune team. Ensure machines are successfully provisioned in Intune managed state. Once Intune provisioning completed, the issue was resolved.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
