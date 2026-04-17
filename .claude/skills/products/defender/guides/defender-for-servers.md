# DEFENDER Defender for Servers — Troubleshooting Quick Reference

**Entries**: 7 | **21V**: 6/7 applicable
**Sources**: ado-wiki, mslearn, onenote | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-for-servers.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot install IaaSAntimalware extension on Windows Server 2012 or older - extension deployment f... | For Windows Server 2012 and earlier, the Antimalware extension uses Windows API MpClient to set r... | 1) Fully uninstall SCEP: run C:\Program Files\Microsoft Security Client\Setup.exe /x /u /s. 2) Ve... | 🟢 9.0 | OneNote |
| 2 | JIT VM Access deprecated with Defender for Servers retirement in Mooncake - contradicts initial n... | Defender for Servers retired Aug 24 2025 in Mooncake. JIT was a Defender for Servers feature depr... | No direct JIT replacement in Mooncake. Use NSG-based access controls or Azure Bastion. S500 escal... | 🟢 9.0 | OneNote |
| 3 | Installed IaaS Antimalware extension on VM but MDC still shows Install endpoint protection soluti... | MDC detects antimalware installed through Azure extensions only - pre-installed or config-managem... | 1) Check IaaS Antimalware extension status (Azure Support Center Insights or VM Extensions tab) -... | 🟢 8.5 | ADO Wiki |
| 4 | Need to update IaaS Antimalware configuration after deployment but no option available in portal ... | No API exists to update a deployed IaaS Antimalware configuration - the extension only accepts co... | Uninstall and reinstall IaaS Antimalware extension with the new configuration. Current config can... | 🟢 8.5 | ADO Wiki |
| 5 | Cannot access SCEP (System Center Endpoint Protection) client UI on downlevel OS (Windows Server ... | SCEP UI is disabled by policy via UILockDown registry key when deployed as IaaS Antimalware exten... | Registry fix: Navigate to HKLM\SOFTWARE\Policies\Microsoft\Microsoft Antimalware\UX Configuration... | 🟢 8.5 | ADO Wiki |
| 6 | ASC recommendation 'Install endpoint protection solutions on your virtual machine' - unclear asse... | Endpoint protection recommendation evaluates whether supported EP solutions (Windows Defender, SC... | Test VMs with Windows Defender and SCEP installed separately per the assessment doc. Check ADO wi... | 🔵 6.0 | OneNote |
| 7 | Defender for Cloud antimalware not working on Azure VMs | Guest agent failure from custom image, wrong OS extension, old version, third-party blocking, fir... | Verify guest agent; use correct extension; update agent; check exclusions, firewall, ACLs, disk s... | 🔵 6.0 | MS Learn |

## Quick Troubleshooting Path

1. 1) Fully uninstall SCEP: run C:\Program Files\Microsoft Security Client\Setup.exe /x /u /s. 2) Verify MsMpSvc service no longer exists. 3) Manually install SCEPInstall.exe from extension package at... `[Source: OneNote]`
2. No direct JIT replacement in Mooncake. Use NSG-based access controls or Azure Bastion. S500 escalations: engage CSAM and PM Charlie.Hanzel@microsoft.com. `[Source: OneNote]`
3. 1) Check IaaS Antimalware extension status (Azure Support Center Insights or VM Extensions tab) - must be Provisioning succeeded. 2) Check ProtectionStatus in LA workspace. 3) If no ProtectionStatu... `[Source: ADO Wiki]`
4. Uninstall and reinstall IaaS Antimalware extension with the new configuration. Current config can be checked at: C:\Packages\Plugins\Microsoft.Azure.Security.IaaSAntimalware\<version>\RuntimeSettin... `[Source: ADO Wiki]`
5. Registry fix: Navigate to HKLM\SOFTWARE\Policies\Microsoft\Microsoft Antimalware\UX Configuration, create/modify DWORD UILockDown to value 0. Then search Start menu for System Center Endpoint Prote... `[Source: ADO Wiki]`
