# DEFENDER Defender for Servers — Comprehensive Troubleshooting Guide

**Entries**: 7 | **Draft sources**: 4 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-endpoint-protection-support-workflow.md, ado-wiki-a-iaas-antimalware-basic-knowledge.md, ado-wiki-a-mdc-servers-plan-resources-exclusion.md, ado-wiki-b-trusted-launch-guest-attestation.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Endpoint Protection
> Sources: ado-wiki, onenote

**1. Installed IaaS Antimalware extension on VM but MDC still shows Install endpoint protection solution on virtual machines recommendation**

- **Root Cause**: MDC detects antimalware installed through Azure extensions only - pre-installed or config-management-deployed AV is not detected. Extension may be in failure state, or ProtectionStatus data not flowing to Log Analytics workspace
- **Solution**: 1) Check IaaS Antimalware extension status (Azure Support Center Insights or VM Extensions tab) - must be Provisioning succeeded. 2) Check ProtectionStatus in LA workspace. 3) If no ProtectionStatus, verify VM heartbeat first. 4) EP data updates within 8 hours
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Need to update IaaS Antimalware configuration after deployment but no option available in portal or API**

- **Root Cause**: No API exists to update a deployed IaaS Antimalware configuration - the extension only accepts config at install time
- **Solution**: Uninstall and reinstall IaaS Antimalware extension with the new configuration. Current config can be checked at: C:\Packages\Plugins\Microsoft.Azure.Security.IaaSAntimalware\<version>\RuntimeSettings\0.settings
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Cannot access SCEP (System Center Endpoint Protection) client UI on downlevel OS (Windows Server 2008/2012) - UI is hidden**

- **Root Cause**: SCEP UI is disabled by policy via UILockDown registry key when deployed as IaaS Antimalware extension
- **Solution**: Registry fix: Navigate to HKLM\SOFTWARE\Policies\Microsoft\Microsoft Antimalware\UX Configuration, create/modify DWORD UILockDown to value 0. Then search Start menu for System Center Endpoint Protection. Note: UILockDown resets on extension update/reinstall
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**4. ASC recommendation 'Install endpoint protection solutions on your virtual machine' - unclear assessment criteria for Windows Defender and System Center Endpoint Protection**

- **Root Cause**: Endpoint protection recommendation evaluates whether supported EP solutions (Windows Defender, SCEP, etc.) are installed and reporting healthy. Assessment criteria documented at docs.microsoft.com/azure/security-center/security-center-endpoint-protection.
- **Solution**: Test VMs with Windows Defender and SCEP installed separately per the assessment doc. Check ADO wiki Endpoint Protection overview for latest detection logic. Verify EP health status in ASC recommendations.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🔵 6.0/10 — OneNote]`

### Phase 2: Antimalware
> Sources: mslearn, onenote

**1. Cannot install IaaSAntimalware extension on Windows Server 2012 or older - extension deployment fails**

- **Root Cause**: For Windows Server 2012 and earlier, the Antimalware extension uses Windows API MpClient to set registry values and installs SCEP (System Center Endpoint Protection). If a previous SCEP installation is corrupted or incomplete, the extension installation fails.
- **Solution**: 1) Fully uninstall SCEP: run C:\Program Files\Microsoft Security Client\Setup.exe /x /u /s. 2) Verify MsMpSvc service no longer exists. 3) Manually install SCEPInstall.exe from extension package at C:\Packages\Plugins\Microsoft.Azure.Security.IaaSAntimalware\1.5.4.4\SCEPInstall.exe. 4) If manual install fails, collect logs via MpCmdRun.exe -getfiles and check MPSupportFiles.cab.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

**2. Defender for Cloud antimalware not working on Azure VMs**

- **Root Cause**: Guest agent failure from custom image, wrong OS extension, old version, third-party blocking, firewall, ACL, or disk space
- **Solution**: Verify guest agent; use correct extension; update agent; check exclusions, firewall, ACLs, disk space
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

### Phase 3: Jit
> Sources: onenote

**1. JIT VM Access deprecated with Defender for Servers retirement in Mooncake - contradicts initial notification. ICM 675243059**

- **Root Cause**: Defender for Servers retired Aug 24 2025 in Mooncake. JIT was a Defender for Servers feature deprecated with it, contradicting Feb 2025 notification.
- **Solution**: No direct JIT replacement in Mooncake. Use NSG-based access controls or Azure Bastion. S500 escalations: engage CSAM and PM Charlie.Hanzel@microsoft.com.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 9.0/10 — OneNote]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Cannot install IaaSAntimalware extension on Windows Server 2012 or older - extension deployment f... | For Windows Server 2012 and earlier, the Antimalware extension uses Windows API MpClient to set r... | 1) Fully uninstall SCEP: run C:\Program Files\Microsoft Security Client\Setup.exe /x /u /s. 2) Ve... | 🟢 9.0 | OneNote |
| 2 | JIT VM Access deprecated with Defender for Servers retirement in Mooncake - contradicts initial n... | Defender for Servers retired Aug 24 2025 in Mooncake. JIT was a Defender for Servers feature depr... | No direct JIT replacement in Mooncake. Use NSG-based access controls or Azure Bastion. S500 escal... | 🟢 9.0 | OneNote |
| 3 | Installed IaaS Antimalware extension on VM but MDC still shows Install endpoint protection soluti... | MDC detects antimalware installed through Azure extensions only - pre-installed or config-managem... | 1) Check IaaS Antimalware extension status (Azure Support Center Insights or VM Extensions tab) -... | 🟢 8.5 | ADO Wiki |
| 4 | Need to update IaaS Antimalware configuration after deployment but no option available in portal ... | No API exists to update a deployed IaaS Antimalware configuration - the extension only accepts co... | Uninstall and reinstall IaaS Antimalware extension with the new configuration. Current config can... | 🟢 8.5 | ADO Wiki |
| 5 | Cannot access SCEP (System Center Endpoint Protection) client UI on downlevel OS (Windows Server ... | SCEP UI is disabled by policy via UILockDown registry key when deployed as IaaS Antimalware exten... | Registry fix: Navigate to HKLM\SOFTWARE\Policies\Microsoft\Microsoft Antimalware\UX Configuration... | 🟢 8.5 | ADO Wiki |
| 6 | ASC recommendation 'Install endpoint protection solutions on your virtual machine' - unclear asse... | Endpoint protection recommendation evaluates whether supported EP solutions (Windows Defender, SC... | Test VMs with Windows Defender and SCEP installed separately per the assessment doc. Check ADO wi... | 🔵 6.0 | OneNote |
| 7 ⚠️ | Defender for Cloud antimalware not working on Azure VMs | Guest agent failure from custom image, wrong OS extension, old version, third-party blocking, fir... | Verify guest agent; use correct extension; update agent; check exclusions, firewall, ACLs, disk s... | 🔵 6.0 | MS Learn |
