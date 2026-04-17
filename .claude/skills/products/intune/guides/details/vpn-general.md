# INTUNE VPN 配置 — 已知问题详情

**条目数**: 8 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: MyWorkspace Intune/ConfigMan Lab Generator (VMBuild.cmd) shows 'Storage Access failed' error when launched
**Solution**: 1) Download latest storage config .zip from the attachment link on corp machine. 2) Copy .zip to the host VM. 3) Extract with password 'memlabs' to get _storageConfigYEAR.json. 4) Place the file in E:\memlabs\vmbuild\config on the host VM. 5) Close and re-run VMBuild.cmd. Old _storageConfig.json files do not need to be removed.
`[Source: ado-wiki, Score: 9.0]`

### Step 2: Error 'This template cannot be deployed as it exceeds quota constraints' when provisioning a MyWorkspace template
**Solution**: 1) Click settings gear > View my Quotas. 2) On User tab, check 'Segment Name' — if it doesn't contain 'Intune & ConfigMan', go through the MyWorkspace access/onboarding process at https://aka.ms/myworkspace. 3) Also check Machines tab for available quota and Hyper-V Host tab for nested workspace limits. Note: existing workspaces may be deleted when changing segments (uncommon but possible).
`[Source: ado-wiki, Score: 9.0]`

### Step 3: 'Activate' JIT button is disabled/greyed out in MyWorkspace website for a workspace
**Solution**: 1) Connect to MSFT-AzVPN-Manual (or usual work VPN). 2) Open the ModernRDP app. 3) Click on the name of the workspace needing JIT. 4) Click the 'JIT Needed' button. 5) Select the workspace in the new window. 6) Specify duration. 7) Click 'Activate'. Status in both ModernRDP and the MyWorkspace website will update as approval processes.
`[Source: ado-wiki, Score: 9.0]`

### Step 4: Guest VM inside MyWorkspace nested Hyper-V host fails to start with error 'The computed authentication tag did not match the Input authentication tag'
**Solution**: Delete the Saved State for the affected VM from the Hyper-V console — this resolves the startup failure. Important: take a snapshot before doing this if the VM contains custom work you don't want to lose.
`[Source: ado-wiki, Score: 9.0]`

### Step 5: Microsoft Edge on Android 13 ignores PAC setting in per-app VPN profile. Edge does not consume proxy after VPN established.
**Solution**: Disconnect/reconnect VPN while Edge running. For Always-on VPN use airplane mode toggle. Alt: Postpone Android 13 upgrade.
`[Source: mslearn, Score: 8.0]`

### Step 6: Procmon cannot be launched directly on EUDB AVD multi-session environment
**Solution**: Map the .pml file type to open with Procmon, then launch the .pml file directly. This bypasses the admin requirement and allows Procmon to be used for reviewing captures.
`[Source: ado-wiki, Score: 7.5]`

### Step 7: The jamfAAD pre-fill feature introduced in Jamf Pro 10.14.0 can cause an issue with the authentication for those organizations that use Active Dire...
**Solution**: A quick workaround is to click the “Sign in with another account&quot; as&nbsp;that will kick off the home realm discovery.To resolve this issue if your organization uses ADFS, upgrade to Jamf Pro 10.17.0 or later and deploy the configuration profile as detailed in https://www.jamf.com/jamf-nation/articles/713/troubleshooting-the-jamfaad-pre-fill-authentication-issue. Doing so will activate a listener in the jamfAAD code for a setting to be read to not auto fill the user field so that the end us
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: The&nbsp;jamfAAD&nbsp;pre-fill feature introduced in Jamf Pro 10.14.0 can cause an issue with the authentication for those organizations that use A...
**Solution**: A quick workaround
is to click the “Sign in with another account&quot; as that will kick off the
home realm discovery.&nbsp;To resolve this
issue if your organization uses ADFS, upgrade to Jamf Pro 10.17.0 or later and
deploy the configuration profile as detailed in https://www.jamf.com/jamf-nation/articles/713/troubleshooting-the-jamfaad-pre-fill-authentication-issue.
Doing so will activate a listener in the jamfAAD code for a setting to be read
to not auto fill the user field so that the end u
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | MyWorkspace Intune/ConfigMan Lab Generator (VMBuild.cmd) shows 'Storage Acces... | Bad, expired, or changed Azure blob storage token in the lab generator config... | 1) Download latest storage config .zip from the attachment link on corp machi... | 9.0 | ado-wiki |
| 2 | Error 'This template cannot be deployed as it exceeds quota constraints' when... | Account segment is not set to 'Intune & ConfigMan' (may be from previous prod... | 1) Click settings gear > View my Quotas. 2) On User tab, check 'Segment Name'... | 9.0 | ado-wiki |
| 3 | 'Activate' JIT button is disabled/greyed out in MyWorkspace website for a wor... | MyWorkspace website sometimes fails to enable the JIT activation button; work... | 1) Connect to MSFT-AzVPN-Manual (or usual work VPN). 2) Open the ModernRDP ap... | 9.0 | ado-wiki |
| 4 | Guest VM inside MyWorkspace nested Hyper-V host fails to start with error 'Th... | TPM-related issue in nested Hyper-V VM environment (root cause unknown; repor... | Delete the Saved State for the affected VM from the Hyper-V console — this re... | 9.0 | ado-wiki |
| 5 | Microsoft Edge on Android 13 ignores PAC setting in per-app VPN profile. Edge... | Android 13 behavior change causes Edge to ignore PAC when VPN established bef... | Disconnect/reconnect VPN while Edge running. For Always-on VPN use airplane m... | 8.0 | mslearn |
| 6 | Procmon cannot be launched directly on EUDB AVD multi-session environment | Launching Procmon directly requires admin rights which are not available on t... | Map the .pml file type to open with Procmon, then launch the .pml file direct... | 7.5 | ado-wiki |
| 7 | The jamfAAD pre-fill feature introduced in Jamf Pro 10.14.0 can cause an issu... | Jamf Bug (PI-007330)The reason this happens is because the entry of the usern... | A quick workaround is to click the “Sign in with another account&quot; as&nbs... | 7.5 | contentidea-kb |
| 8 | The&nbsp;jamfAAD&nbsp;pre-fill feature introduced in Jamf Pro 10.14.0 can cau... | Jamf Bug (PI-007330)The reason this happens is because the entry of the usern... | A quick workaround is to click the “Sign in with another account&quot; as tha... | 7.5 | contentidea-kb |
