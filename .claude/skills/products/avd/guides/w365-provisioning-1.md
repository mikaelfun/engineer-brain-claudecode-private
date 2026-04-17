# AVD W365 Provisioning 配置 (Part 1) - Quick Reference

**Entries**: 15 | **21V**: all applicable
**Keywords**: 0x801c001d, active-directory, ad-unjoin, agent-conflict, applocker, azure-ad, azure-arc, bluetooth
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Custom image upload fails in Intune Admin Center after Service Release 2503 - er... | As of SR 2503 (March 31, 2025), adding a custom image fails if the source VM had... | Create a new custom image ensuring the source VM does not have any additional ma... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Cloud PCs provisioned with custom image result in warnings; error 'Cannot valida... | WMI repository corruption on the golden VM (custom image source) preventing driv... | Rebuild the WMI repository on the golden VM and recapture the custom image. If c... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Windows 365 Business grace period (7 days) blocks provisioning of new Cloud PCs ... | Extended 7-day grace period for W365 Business keeps old Cloud PC allocated, bloc... | Use PowerShell script with Microsoft.Graph module (CloudPC.ReadWrite.All scope) ... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Cloud PC Move fails with error ResetComputerPassword_deploymentTimeout - move to... | DNS configuration on the destination region Azure vNet was pointing to a decommi... | Remove the stale/decommissioned DNS server IP from the Azure vNet DNS configurat... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Azure AD Device Object not removed (stale) when Cloud PC is deprovisioned or rep... | The enterpriseregistration.windows.net endpoint is blocked by firewall or networ... | Verify and unblock outbound TCP 443 traffic to enterpriseregistration.windows.ne... | 🔵 7.5 | ADO Wiki |
| 6 📋 | Cloud PC provisioning fails with PowerShell Constrained Language Mode error duri... | WDAC policy, AppLocker, GPO, or Intune policy is enforcing PowerShell Constraine... | 1) If GPO/Intune policy is applying Constrained Language Mode, disable it and te... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Cloud PCs are provisioned twice - multiple computer objects appear in Active Dir... | User is added to multiple groups (e.g., provisioning policy group and local admi... | Add the user to the local admin group (or other supplementary groups) either 1-2... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Cloud PC deprovisioning fails to unjoin device from AD with error AzureCompute_V... | Proxy configuration (e.g., Zscaler, Forcepoint) on the Cloud PC is blocking outb... | Configure proxy bypass for Azure/Windows 365 endpoints. Implement recommended Zs... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Cloud PC provisioning fails with error CreateVM_managedServiceIdentityNotFound w... | Azure Disk Service failed to bind Managed Service Identity (MSI) with Disk Encry... | 1) Engage W365 ConfigurationNetworkStorage team (CMK owner) via ICM to remove in... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Cloud PC computer name shown on MEM/Intune Portal changes after resize, restore,... | By design. If customer renames the Cloud PC inside the VM or in AAD, the CPC ser... | This is by design behavior. The computer name in MEM Portal will be updated to m... | 🔵 7.5 | ADO Wiki |
| 11 📋 | Windows 365 Cloud PC provisioning fails with error HybridAzureADJoin_hybridAADJ_... | Service Connection Point (SCP) object is not configured or misconfigured in on-p... | 1) Verify SCP exists by running LDAP query on DC: New-Object System.DirectorySer... | 🔵 7.5 | ADO Wiki |
| 12 📋 | Windows 365 Cloud PC snapshot/restore point is marked as Unhealthy status after ... | At the time of snapshot capture, both the VMAgent (GuestAgent) was not ready AND... | The unhealthy status is suggestive only and does NOT block any actions (export, ... | 🔵 7.5 | ADO Wiki |
| 13 📋 | Windows 365 Cloud PC reports returning no data in Intune portal - no device deta... | Azure Connected Machine agent (Azure Arc) was installed on Cloud PCs, causing mi... | Uninstall the Azure Connected Machine agent from affected Cloud PCs and reboot. ... | 🔵 7.5 | ADO Wiki |
| 14 📋 | Bluetooth and hardware settings cannot be managed from Cloud PC Settings app or ... | Cloud PCs lack hardware components like Bluetooth adapters, so these settings ar... | Users must switch back to their physical device and change Bluetooth/hardware se... | 🔵 7.5 | ADO Wiki |
| 15 📋 | User does not receive a Reserve CPC even though they have an active UPA | No license available - ULA in Candidate state waiting for license to become free | Check ULA state. If Candidate, need to purchase more licenses or wait for reclai... | 🔵 7.5 | ADO Wiki |

## Quick Triage Path

1. Check: As of SR 2503 (March 31, 2025), adding a custom im `[Source: ADO Wiki]`
2. Check: WMI repository corruption on the golden VM (custom `[Source: ADO Wiki]`
3. Check: Extended 7-day grace period for W365 Business keep `[Source: ADO Wiki]`
4. Check: DNS configuration on the destination region Azure `[Source: ADO Wiki]`
5. Check: The enterpriseregistration.windows.net endpoint is `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-provisioning-1.md#troubleshooting-flow)
