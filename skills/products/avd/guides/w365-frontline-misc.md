# AVD W365 Frontline 一线员工 - 杂项 - Quick Reference

**Entries**: 10 | **21V**: partial
**Keywords**: allocationfailed, anc, autopilot, autopilot-v2, capacity, cogs, concurrency-report, customer-request
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Win32 and Store Winget apps show as Skipped in DPP (Device Preparation Policy) R... | When Managed Installer is enabled, Intune delivers Win32/Winget apps after DPP p... | Known behavior - apps will still get installed despite showing as Skipped in the... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Windows 365 COGS Optimization device actions (hibernate/resume/stop/start) fail,... | Internal service errors during COGS optimization device actions (hibernate, resu... | 1) Ask customer to Restart the machine. 2) If Restart fails, request lockbox and... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Windows 365 Frontline Cloud PCs are unexpectedly logged off during active sessio... | Cylance PROTECT Script Control blocking PowerShell scripts used by Cloud PC prov... | 1) Check event logs for Event ID 40 reason code 2 and RdpCoreCDV channel close e... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Frontline Cloud PC concurrency status report not visible or showing empty in Int... | Admin missing required permissions: SharedUseLicenseUsageReport and SharedUseSer... | 1) Assign SharedUseLicenseUsageReport and SharedUseServicePlans permissions via ... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Reprovision button in Windows 365 Frontline Shared provisioning policy does not ... | Known product limitation - Reprovision button requires the policy to be edited f... | Edit the provisioning policy first, then click the Reprovision button | 🔵 7.5 | ADO Wiki |
| 6 📋 | Windows 365 Frontline Shared CPC provisioned with warnings; error DppNotEnabled ... | Device Preparation Profile (DPP) not assigned to the device group, or Intune Pro... | 1) Verify DPP profile is created as Automatic (Preview) and assigned to a clean ... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Windows 365 provisioning, COGS resume, Flex Start, or ANC checks fail with error... | Azure capacity outage in the region where Cloud PCs are located. Impacts: COGS (... | For CSS: Check internally for capacity issues in affected region, inform SaaF Te... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Customer requests Microsoft Support to access their Virtual Hard Disks (VHDs) fo... | - | Decline the request. Support Engineers do not have access to customer VHDs and a... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Frontline Cloud PC browser connection fails: You are using an invalid link to co... | ZScaler or proxy not configured to bypass WVD/AVD traffic and WireServer IPs 169... | Configure proxy to bypass: (1) WVD gateway URLs (2) WireServer IPs: 169.254.169.... | 🔵 7.5 | ADO Wiki |
| 10 📋 | Windows 365 Frontline Shared Cloud PC provisioned with warnings, DPP (Device Pre... | Device Preparation Profile (DPP) not properly configured: not created as Automat... | 1) Verify DPP profile created as Automatic (Preview) and assigned to device grou... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: When Managed Installer is enabled, Intune delivers `[Source: ADO Wiki]`
2. Check: Internal service errors during COGS optimization d `[Source: ADO Wiki]`
3. Check: Cylance PROTECT Script Control blocking PowerShell `[Source: ADO Wiki]`
4. Check: Admin missing required permissions: SharedUseLicen `[Source: ADO Wiki]`
5. Check: Known product limitation - Reprovision button requ `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-frontline-misc.md#troubleshooting-flow)
