# AVD AVD MSIX App Attach - 杂项 - Quick Reference

**Entries**: 17 | **21V**: all applicable
**Keywords**: aadds, accesspaths, app-attach, appxdeploymentserver, appxmanifest, arm-throttling, azure-ad-ds, azure-files, break/fix, certificate, contentidea-kb, deprecated, deregistration, disconnected-session, dynamic
**Last updated**: 2026-04-18


## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|------------|----------|-------|--------|
| 1 📋 | MSIX app attach fails with Azure AD DS (AADDS) environment. Cannot add MSIX imag... | MSIX app attach does not support Azure AD DS because AADDS computer objects are ... | Use AD DS (on-premises Active Directory) instead of Azure AD DS for MSIX app att... | 🟢 8.5 | OneNote |
| 2 📋 | When using MSIX app attach in AVD, launching an application (e.g. PuTTY) incorre... | Bug in AVD MSIX app attach where the system launches the last application declar... | PG has a fix in the pipeline. As workaround, modify the appxmanifest to reorder ... | 🔵 7.5 | OneNote |
| 3 📋 | MSIX remote app launches Windows Explorer instead of the intended application af... | Bug in AVD MSIX app attach where a disconnected session state causes the MSIX re... | Bug tracked (OS Bug 34349845). Workaround: ensure the user fully signs out from ... | 🔵 7.5 | OneNote |
| 4 📋 | MSIX app does not appear in Start Menu when user logs into full desktop in AVD s... | MSIX app registration/deregistration timing issue in shared host pools. When use... | Diagnostic steps: 1) Check AppXDeploymentServer Operational event log (Microsoft... | 🔵 7.5 | OneNote |
| 5 📋 | Unable to add MSIX package to AVD host pool via Azure Portal. Page spins and fai... | Two issues: 1) Portal bug causing infinite nextLink pagination loop during MSIX ... | 1. If portal fails, try PowerShell (New-AzWvdMsixPackage) or REST API invoke met... | 🔵 7.0 | OneNote |
| 6 📋 | MSIX App Attach: newly added MSIX application fails to launch (File Explorer ope... | MSIX App Attach staging for packages only occurs during boot or approximately ev... | Reboot the session host machine before trying to launch a newly added MSIX appli... | 🔵 7.0 | ADO Wiki |
| 7 📋 | Apps published through MSIX App Attach not displayed under Start Menu or not fin... | Known issue: using FSlogix or Roaming Profile, the Start Menu breaks so apps are... | Add FSLogix Redirection.xml exclusion for AppData\Local\Packages\Microsoft.Windo... | 🔵 6.5 | ContentIdea |
| 8 📋 | Adding MSIX Packages VHD(x) path under WVD Hostpool gives error Error Accessing ... | Access to WVD where the MSIX packages are published not properly configured. | Assign session host VMs permissions for the storage account and file share: Crea... | 🔵 6.5 | ContentIdea |
| 9 📋 | Adding MSIX packages under WVD Hostpool gives error No MSIX packages could be re... | MSIX image expansion done under the VHD without creating a root/parent folder in... | Create a root folder inside the VHD(x) when expanding MSIX Image with MSIXMGR.ex... | 🔵 6.5 | ContentIdea |
| 10 📋 | MSIX app attach fails to import into the WVD Host Pool. No MSIX packages could b... | UI prevalidation fails for MSIX packages with services unless manifest provides ... | Use PowerShell to add app attach package, or edit manifest to assign icons to al... | 🔵 6.5 | ContentIdea |
| 11 📋 | MSIX app attach application shortcut not appearing in Start Menu when using FSLo... | FSLogix profiles contain start menu layout cache under %localappdata%\Microsoft\... | Apply Redirections.xml via FSLogix with exclusion for AppData\Local\Packages\Mic... | 🔵 6.5 | ContentIdea |
| 12 📋 | MSIX App Attach X64 apps do not register on user logon when in CIM format. App i... | Issue in Win 10 20H2 and 21H1 when requesting On Demand Registration with CIM fo... | Use VHDx instead of CIM disks in X64 format. Or run Add-AppxPackage registration... | 🔵 6.5 | ContentIdea |
| 13 📋 | AVD session host shows shut down status though it is running issue. | Troubleshooting done: &nbsp; 1.First we check the system event log to see if the... | To fix the issue, we need to set the Enable64Bit back to default by running: Ldr... | 🔵 6.5 | ContentIdea |
| 14 📋 | Screen reader  focus moves to an invisible element and announces as &quot;Copied... | Environmental Details OS Version: Dev (26408.1001) Edge Dev Version: 136.0.3240.... | There   is no known workaround at this stage. No ETA for the fix    Bug   576625... | 🔵 6.5 | ContentIdea |
| 15 📋 | We have located an issue where Microsoft Runtime application dependency may beco... | During logoff, app attach in the RDAgent calls PackageManager.RemovePackageAsync... | Workarounds:&nbsp;  Block logoff until removal of package is done (impacts user ... | 🔵 6.5 | ContentIdea |
| 16 📋 | MSIX app not appearing in Start Menu when logging into AVD full desktop session ... | MSIX on-demand registration race condition in shared session host pool. When use... | Under investigation. Workaround: ensure MSIX packages are assigned to separate h... | 🔵 6.5 | OneNote |
| 17 📋 | MSIX App Attach fails: No MSIX Packages could be retrieved from the image Path. ... | Type1: Computer account lacks share permissions. Type2: App signature is untrust... | Type1: Add computer account with Read permission on share (Azure Files: Storage ... | 🔵 6.5 | ContentIdea |

## Quick Triage Path

1. Check: MSIX app attach does not support Azure AD DS because AADDS c... `[Source: OneNote]`
2. Check: Bug in AVD MSIX app attach where the system launches the las... `[Source: OneNote]`
3. Check: Bug in AVD MSIX app attach where a disconnected session stat... `[Source: OneNote]`
4. Check: MSIX app registration/deregistration timing issue in shared ... `[Source: OneNote]`
5. Check: Two issues: 1) Portal bug causing infinite nextLink paginati... `[Source: OneNote]`

> This topic has a fusion troubleshooting guide with detailed workflow and Kusto queries
> -> [Full troubleshooting flow](details/avd-msix-appattach-misc.md#troubleshooting-flow)