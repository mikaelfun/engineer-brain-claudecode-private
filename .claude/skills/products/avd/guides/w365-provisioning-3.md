# AVD W365 Provisioning 配置 (Part 3) - Quick Reference

**Entries**: 15 | **21V**: partial
**Keywords**: activation, ad-sync, app-categories, app-sharing, automount, call-drop, citrix, cloud-pc
**Last updated**: 2026-04-07


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | Need to collect CMD (Cloud Managed Desktop) Agent logs for Windows 365 provision... | - | CMD Agent logs are located at: C:\ProgramData\Microsoft\CMDExtension\Logs | 🔵 7.5 | ADO Wiki |
| 2 📋 | Windows 365 Cloud PC is provisioned with half of the disk size specified in the ... | CMD (Cloud Managed Desktop) Agent running inside the VM fails to reach Azure end... | Allow outbound access to *.infra.windows365.microsoft.com (covers *.cmdagent.inf... | 🔵 7.5 | ADO Wiki |
| 3 📋 | Group Based Licensed (GBL) Cloud PC resize fails to reach 'Resize pending licens... | A direct license assignment coexists with a group license assignment for the sam... | Remove the direct W365 license assignment from the affected user(s) before start... | 🔵 7.5 | ADO Wiki |
| 4 📋 | M365 license not returned to available pool after end user removal; Cloud PC not... | Improper user deletion flow: user was removed only from M365 Admin Center but th... | For hybrid identities: delete user from on-premises AD DC (Server Manager > AD U... | 🔵 7.5 | ADO Wiki |
| 5 📋 | Windows 365 Cloud PC provisioned with warnings; Language Pack (LP) installation ... | A GPO, Settings Catalog, or Custom OMA-URI policy sets 'Allow remote server mana... | Set the 'Allow remote server management through WinRM' policy to 'Not Configured... | 🔵 7.5 | ADO Wiki |
| 6 📋 | Windows 365 Cloud PC provisioning, Language Pack installation, activation, or WN... | Palo Alto Next-Gen Firewall has App Categories configured in its firewall policy... | Check Palo Alto firewall App Categories policy configuration. Identify App Categ... | 🔵 7.5 | ADO Wiki |
| 7 📋 | Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy video, or GPU not d... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEnumerateHWBeforeSW, A... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query "Select * FROM Win32... | 🔵 7.5 | ADO Wiki |
| 8 📋 | Windows 365 GPU-enabled Cloud PC shows low FPS (<60), choppy video, or GPU not d... | GPU registry keys (DWMFRAMEINTERVAL, DisplayRefreshRate, bEnumerateHWBeforeSW, A... | 1) Verify GPU presence via PowerShell: Get-WmiObject -Query "Select * FROM Win32... | 🔵 7.5 | ADO Wiki |
| 9 📋 | Windows App for macOS crashes when user attempts to join a Teams Town Hall meeti... | Teams media optimization (VDI 1.0) does not support Town Hall meetings in Teams.... | Turn off media optimizations and join the Town Hall meeting, or connect to the C... | 🔵 7.5 | ADO Wiki |
| 10 📋 | In Citrix VDI 2.0 environment, Teams app sharing sessions freeze for other parti... | Bug in Citrix VDA 2402 + CWA 2309.1+ interaction with Slimcore VDI 2.0 when vide... | Stopping and resharing the window resolves the issue temporarily. Permanent fix ... | 🔵 7.5 | ADO Wiki |
| 11 📋 | Large Cloud PC provisioning batch fails with service error or NameResolutionFail... | VPN Gateway overwhelmed by packet volume from Cloud PCs. With AES256+SHA256 algo... | 1) Upgrade VPN Gateway to higher SKU. 2) Change algorithm to GCMAES256 (120k pps... | 🔵 7.5 | ADO Wiki |
| 12 📋 | SharePoint site configured for auto-sync via Intune policy takes 8 or more hours... | OneDrive sync timer behavior - not a Windows 365 issue. The Timerautomount regis... | 1) Set HKCU\Software\Microsoft\OneDrive\Accounts\Business1 QWORD Timerautomount ... | 🔵 7.5 | ADO Wiki |
| 13 📋 | Cloud PC DeviceModel changed to 'Virtual Machine' in Intune. Devices fall out of... | Third-party app (e.g., Carbon Black) blocks the SetDeviceModel scheduled task, o... | 1) Check registry HKLM\SYSTEM\ControlSet001\Control\SystemInformation\SystemProd... | 🔵 7.5 | ADO Wiki |
| 14 📋 | Teams calls drop on the local machine that has an HID peripheral connected if a ... | Known issue with Slimcore VDI 2.0 - HID peripheral connected to the local endpoi... | Known issue - avoid running Teams simultaneously on the local machine and in the... | 🔵 7.0 | ADO Wiki |
| 15 📋 | Large Cloud PC provisioning batch fails with 'We encountered a service error'; u... | Default route sends all Cloud PC traffic through VPN Gateway, overwhelming it; p... | Options: 1) Upgrade VPN Gateway to higher SKU; 2) Change encryption algorithm to... | 🔵 6.0 | ADO Wiki |

## Quick Triage Path

1. Check: Unknown `[Source: ADO Wiki]`
2. Check: CMD (Cloud Managed Desktop) Agent running inside t `[Source: ADO Wiki]`
3. Check: A direct license assignment coexists with a group `[Source: ADO Wiki]`
4. Check: Improper user deletion flow: user was removed only `[Source: ADO Wiki]`
5. Check: A GPO, Settings Catalog, or Custom OMA-URI policy `[Source: ADO Wiki]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/w365-provisioning-3.md#troubleshooting-flow)
