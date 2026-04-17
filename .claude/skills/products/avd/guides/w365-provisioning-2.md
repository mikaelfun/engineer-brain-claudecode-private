# AVD W365 Provisioning 配置 (Part 2) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: admin-username, anti-fraud, bitlocker, black-screen, bootloader, bprt, bulk-token, business
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Windows 365 Cloud PC provisioning takes much longer than usual without failures;... | Tenant TrustLevel set to Suspicious or HighlySuspicious, moving provisioning to ... | Verify TrustLevel in CPCD. If Suspicious: provisioning throttled but no dealloca... | 🔵 7.5 | ADO Wiki |
| 2 📋 | Windows 365 Reserve self-provisioning option (Set up my Cloud PC) not visible in... | User not included in scoped Entra ID group for self-provisioning setting; confli... | 1) Try web client and app versions to isolate. 2) Wait a few minutes and refresh... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Windows 365 Reserve Cloud PC entry unexpectedly removed from Windows App - user ... | Self-provisioning setting was disabled or Entra group scope changed; usage perio... | 1) Check if user received a notification in Windows App. 2) Verify self-provisio... | 🔵 7.5 | ADO Wiki |
| 4 📋 | Windows 365 Business Cloud PC does not resume after hibernation - session lost o... | Cloud PC fails to transition out of hibernation state, session state not preserv... | 1) Confirm Cloud PC is Business SKU. 2) Reproduce by allowing >1 hour inactivity... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Cloud PC deprovisioned after license expired; re-assigning license creates new C... | License expiration triggers automatic deprovisioning; re-assignment provisions n... | Use Legacy Recovery OCE API: 1) Confirm license re-enabled (UserLicenseEntity_MV... | 🔵 7.5 | ADO Wiki |
| 6 📋 | All Cloud PCs under a W365 tenant are deallocated/stopped and customer cannot st... | Tenant marked as 'highly suspicious' by anti-fraud system; Cloud PCs are automat... | Check tenant HITStatus via Reporting Kusto query or CPCD. Follow suspicious tena... | 🔵 7.5 | ADO Wiki |
| 7 📋 | All Cloud PCs under tenant are deallocated/stopped and customer cannot start the... | Tenant marked as highly suspicious by anti-fraud system (HIT investigation pendi... | Check tenant fraud status via CPCD dashboard and Kusto DailyTenantEvaluation_Sna... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Windows 365 Cloud PC provisioning limited to 2 per week; tenant placed in slow p... | Tenant score below 0.03 (range 0-1) triggers slow lane classification, limiting ... | Check tenant score via CPCD (aka.ms/cpcd) or Kusto DailyTenantEvaluation_Snapsho... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Cloud PC shows black or white screen when connecting. Restart/reprovision does n... | GPO or Intune CSP policy blocking driver installations prevents the Indirect Dis... | Check for policies blocking driver installations via GPO or Intune CSP (DeviceIn... | 🔵 7.5 | ADO Wiki |
| 10 📋 | CPC no available resources; BitLocker via MBAM/Intune; VM stopped | Windows update triggered BitLocker Recovery; W365 unsupported | Disable BitLocker config; unencrypt; restore or reprovision | 🔵 7.5 | ADO Wiki |
| 11 📋 | AVD deployment fails with 'The Admin Username specified is not allowed' error | - | See Microsoft documentation: https://docs.microsoft.com/en-us/azure/virtual-desk... | 🔵 7.0 | ADO Wiki |
| 12 📋 | W365 Business customer deleted CloudPCBPRT (Windows 365 BPRT Permanent User) acc... | The BPRT account is required for W365 Business provisioning. When deleted, the b... | 1) Request CMDCPCSupport eligibility in OSP portal (24hr activation). 2) Find sc... | 🔵 6.0 | ADO Wiki |
| 13 📋 | ConnectionFailedUserHasValidSessionButRDSHIsUnHealthy error when connecting to C... | RDAgentBootLoader service is not running on the session host | Collect Application Event Logs via Azure Support Center (ASC) to determine why R... | 🔵 6.0 | ADO Wiki |
| 14 📋 | Users get disconnected instead of seeing OS lock screen when Device Lock or scre... | Lock screen does not support new Azure AD authentication used by SSO. It also do... | This is by design when SSO is enabled. Disconnection ensures CA/MFA policies are... | 🔵 6.0 | ADO Wiki |
| 15 📋 | Cloud PC provisioning fails with 'Not Enough IP Addresses' error when using Micr... | - | Reach out to SaaF Engineer and raise ICM with complete details: Tenant ID, provi... | 🔵 5.5 | ADO Wiki |

## Quick Triage Path

1. Check: Tenant TrustLevel set to Suspicious or HighlySuspi `[Source: ADO Wiki]`
2. Check: User not included in scoped Entra ID group for sel `[Source: ADO Wiki]`
3. Check: Self-provisioning setting was disabled or Entra gr `[Source: ADO Wiki]`
4. Check: Cloud PC fails to transition out of hibernation st `[Source: ADO Wiki]`
5. Check: License expiration triggers automatic deprovisioni `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-provisioning-2.md#troubleshooting-flow)
