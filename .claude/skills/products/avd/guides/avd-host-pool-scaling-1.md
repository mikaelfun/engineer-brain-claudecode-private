# AVD AVD Host Pool 与缩放 (Part 1) - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: 0x8024401c, 400-error, add-vm, alert, api, by-design, cbs-corruption, classic-to-arm
**Last updated**: 2026-04-07

> Note: avd-contentidea-kb-010 and avd-mslearn-039 have context-dependent differences (rootcause_conflict)
> Note: avd-contentidea-kb-011 and avd-mslearn-039 have context-dependent differences (rootcause_conflict)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | WVD host pool deployment fails with ResourceDeploymentFailure WinRM related. | GPO Allow remote server management through WinRM had restrictive filters. | Change IPv4/IPv6 filter to * in GPO. | 🔵 7.5 | KB |
| 2 📋 | WVD host pool deployment fails: User not authorized and Host pool does not exist... | Incorrect tenant name in host pool wizard. | Deploy with correct tenant name. | 🔵 7.5 | KB |
| 3 📋 | User-assigned managed identity assigned to host pool does not appear in managed ... | Bug in host pool API - accepts identity ID even if missing leading '/' in the re... | Double-check the user-assigned managed identity ID format, ensure it starts with... | 🔵 7.0 | MS Learn |
| 4 📋 | Host pool deployment fails with Exceeding quota limit | VM core quota exceeded for SKU in subscription/region | Create host pool with fewer VMs or submit quota increase request | 🔵 7.0 | MS Learn |
| 5 📋 | Scenario:User adds the Azure AD Domain Services for use with Windows Virtual Des... | The password hash between the AAD and the AADDS accounts has not been synced bec... | Users will need to reset their password to sync the password hash between AAD an... | 🔵 6.5 | KB |
| 6 📋 | Start VM on Connect enabled but VM does not start. Error: There was a problem co... | AVD service principal lacks required RBAC permissions to start VMs. | Create custom RBAC role with start/read/instanceView permissions and assign to W... | 🔵 6.5 | KB |
| 7 📋 | Start VM on Connect enabled but VM does not start. Error: no available resources... | VM was shutdown while active session present. Known bug. | Update RBAC role permissions for Start VM on Connect. | 🔵 6.5 | KB |
| 8 📋 | Naming convention with capital letters showing lowercase in host pool and Resour... | Customer has deployed resource groups and host pool using a naming convention wi... | Business impact:&nbsp;They are in the process of importing all resources into Te... | 🔵 6.5 | KB |
| 9 📋 | Customer has 2 application groups in the same host pool. The user opens remoteap... | Issue is caused by RemoteApp application groups that are in different resource g... | Remove the old appgroup and create a new one within correct resource group, then... | 🔵 6.5 | KB |
| 10 📋 | The customer is encountering issues with Azure Virtual Desktop (AVD) virtual mac... | Incorrect      Alert Trigger Configuration:&nbsp;The alerts are being created ba... | Combine      Alert Triggers:      Modify       the alert configuration to combin... | 🔵 6.5 | KB |
| 11 📋 | Depth First Load Balancing keeps reverting to Breadth First every 5 minutes due ... | The WVD scaling tool script enforces breadth-first load balancing by default, ov... | Add SkipUpdateLoadBalancerType: true to the HTTP request body in the Logic App s... | 🔵 6.5 | KB |
| 12 📋 | Unable to delete AVD resources from both Azure portal and PowerShell. Migration ... | Host Pool Migration was still in Migration state. | Complete or revert the migration. PowerShell: Revert-RdsHostPoolMigration or Com... | 🔵 6.5 | KB |
| 13 📋 | Unable to configure custom alert when scaling plan is enabled/disabled for AVD h... | Data/logs not available by design. Scaling plan assignment activities are not lo... | PG confirmed log location not available. Feature change request filed. Logs will... | 🔵 6.5 | KB |
| 14 📋 | Adding VM to existing host pool fails. Windows update error 0x8024401c. | Corrupted OS update KB5017315 found in CBS logs. | Run DISM /Online /Cleanup-image /Restorehealth and sfc /scannow. Download and in... | 🔵 6.5 | KB |
| 15 📋 | AVD management portal shows 'Failed to create registration key' error | Registration token creation failed, possibly due to too long expiry time | Retry creating registration key with shorter expiry time (between 1 hour and 1 m... | 🔵 6.0 | MS Learn |

## Quick Triage Path

1. Check: GPO Allow remote server management through WinRM h `[Source: KB]`
2. Check: Incorrect tenant name in host pool wizard. `[Source: KB]`
3. Check: Bug in host pool API - accepts identity ID even if `[Source: MS Learn]`
4. Check: VM core quota exceeded for SKU in subscription/reg `[Source: MS Learn]`
5. Check: The password hash between the AAD and the AADDS ac `[Source: KB]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-host-pool-scaling-1.md#troubleshooting-flow)
