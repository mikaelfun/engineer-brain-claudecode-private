# INTUNE VPN 配置 — 排查速查

**来源数**: 3 | **21V**: 部分 (7/8)
**条目数**: 8 | **最后更新**: 2026-04-17

## 快速排查路径

1. **MyWorkspace Intune/ConfigMan Lab Generator (VMBuild.cmd) shows 'Storage Access failed' error when launched**
   → 1) Download latest storage config .zip from the attachment link on corp machine. 2) Copy .zip to the host VM. 3) Extract with password 'memlabs' to get _storageConfigYEAR.json. 4) Place the file in... `[ado-wiki, 🟢 9.0]`

2. **Error 'This template cannot be deployed as it exceeds quota constraints' when provisioning a MyWorkspace template**
   → 1) Click settings gear > View my Quotas. 2) On User tab, check 'Segment Name' — if it doesn't contain 'Intune & ConfigMan', go through the MyWorkspace access/onboarding process at https://aka.ms/my... `[ado-wiki, 🟢 9.0]`

3. **'Activate' JIT button is disabled/greyed out in MyWorkspace website for a workspace**
   → 1) Connect to MSFT-AzVPN-Manual (or usual work VPN). 2) Open the ModernRDP app. 3) Click on the name of the workspace needing JIT. 4) Click the 'JIT Needed' button. 5) Select the workspace in the n... `[ado-wiki, 🟢 9.0]`

4. **Guest VM inside MyWorkspace nested Hyper-V host fails to start with error 'The computed authentication tag did not match the Input authentication tag'**
   → Delete the Saved State for the affected VM from the Hyper-V console — this resolves the startup failure. Important: take a snapshot before doing this if the VM contains custom work you don't want t... `[ado-wiki, 🟢 9.0]`

5. **Microsoft Edge on Android 13 ignores PAC setting in per-app VPN profile. Edge does not consume proxy after VPN established.**
   → Disconnect/reconnect VPN while Edge running. For Always-on VPN use airplane mode toggle. Alt: Postpone Android 13 upgrade. `[mslearn, 🟢 8.0]`

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | MyWorkspace Intune/ConfigMan Lab Generator (VMBuild.cmd) shows 'Storage Access failed' error when... | Bad, expired, or changed Azure blob storage token in the lab generator configuration | 1) Download latest storage config .zip from the attachment link on corp machine. 2) Copy .zip to ... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FMy%20Workspace) |
| 2 | Error 'This template cannot be deployed as it exceeds quota constraints' when provisioning a MyWo... | Account segment is not set to 'Intune & ConfigMan' (may be from previous product area), or worksp... | 1) Click settings gear > View my Quotas. 2) On User tab, check 'Segment Name' — if it doesn't con... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FMy%20Workspace) |
| 3 | 'Activate' JIT button is disabled/greyed out in MyWorkspace website for a workspace | MyWorkspace website sometimes fails to enable the JIT activation button; workaround available via... | 1) Connect to MSFT-AzVPN-Manual (or usual work VPN). 2) Open the ModernRDP app. 3) Click on the n... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FMy%20Workspace) |
| 4 | Guest VM inside MyWorkspace nested Hyper-V host fails to start with error 'The computed authentic... | TPM-related issue in nested Hyper-V VM environment (root cause unknown; reported by multiple engi... | Delete the Saved State for the affected VM from the Hyper-V console — this resolves the startup f... | 🟢 9.0 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FMy%20Workspace) |
| 5 | Microsoft Edge on Android 13 ignores PAC setting in per-app VPN profile. Edge does not consume pr... | Android 13 behavior change causes Edge to ignore PAC when VPN established before Edge starts. | Disconnect/reconnect VPN while Edge running. For Always-on VPN use airplane mode toggle. Alt: Pos... | 🟢 8.0 | [mslearn](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/device-enrollment/edge-ignore-pac-android-vpn-profile) |
| 6 | Procmon cannot be launched directly on EUDB AVD multi-session environment | Launching Procmon directly requires admin rights which are not available on the EUDB AVD multi-se... | Map the .pml file type to open with Procmon, then launch the .pml file directly. This bypasses th... | 🔵 7.5 | [ado-wiki](https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FEngineer%20Reference%2FTools%2FEUDB%20AVD) |
| 7 | The jamfAAD pre-fill feature introduced in Jamf Pro 10.14.0 can cause an issue with the authentic... | Jamf Bug (PI-007330)The reason this happens is because the entry of the username/UPN in the jamfA... | A quick workaround is to click the “Sign in with another account&quot; as&nbsp;that will kick off... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4517358) |
| 8 | The&nbsp;jamfAAD&nbsp;pre-fill feature introduced in Jamf Pro 10.14.0 can cause an issue with the... | Jamf Bug (PI-007330)The reason this happens is because the entry of the username/UPN in the&nbsp;... | A quick workaround is to click the “Sign in with another account&quot; as that will kick off the ... | 🔵 7.5 | [contentidea-kb](https://support.microsoft.com/kb/4622040) |
