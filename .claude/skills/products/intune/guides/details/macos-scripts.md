# INTUNE macOS Shell 脚本与 Sidecar Agent — 已知问题详情

**条目数**: 8 | **生成日期**: 2026-04-17

---

## Quick Troubleshooting Path

### Step 1: Error uploading macOS shell script (.sh) in Intune console - script preview shows extra Unicode characters (e.g. 'i p c o n f i g' with embedded sp...
**Solution**: Copy the script content to a new file in Notepad, then Save As with ANSI encoding (or UTF-8 without BOM). Re-upload the corrected .sh file to Intune.
`[Source: ado-wiki, Score: 9.0]`

### Step 2: Exclude groups option missing for PowerShell scripts assignments in Intune UI — cannot exclude groups from script targeting
**Solution**: 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM/IET 2) WARNING: procedure removes ALL existing Windows PowerShell script assignments 3) Customer must capture current assignments before procedure (screenshots or Graph API export) 4) Requires GA approval 5) Only affects Windows platform scripts, not macOS 6) Tag also enables 'All Users/All Devices' option
`[Source: ado-wiki, Score: 9.0]`

### Step 3: macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending indefinitely), shell scripts don't run, Intune management agent installat...
**Solution**: Upgrade the device to macOS 11.3 or later version.
`[Source: mslearn, Score: 8.0]`

### Step 4: Customer is using RBAC roles to manage scripts and other resources.RBAC showed the user with this RBAC should be able to access the script as user ...
**Solution**: Please have
the customer attempt the following as a potential workaround:
 With
     an admin account, go to Devices -&gt; macOS -&gt; Custom attributesOpen
     all custom attribute policies and edit the scope tags to include at least
     one scope tag assigned to the custom roleHave
     the user with the custom role sign back in and go to Devices -&gt; ScriptsThe
     user should now be able to see their script policies again.
`[Source: contentidea-kb, Score: 7.5]`

### Step 5: This article describes generic troubleshooting steps to follow when investigating MacOS scripts delivered from Intune.
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 6: THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER TO THE INTUNE CSS WIKI FOUND HERE:&nbsp;SAW Actions - Overview (visual...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

### Step 7: The Exclusion&nbsp;button for Powershell Scripts is not visible in the UI.
**Solution**: To resolve this problem, the customer must be flighted&nbsp;EnableGAndTForPowershell. Note however that if this is done, the customer will&nbsp;lose their original assignments for existing PowerShell scripts and will need to redo all assignments.&nbsp;  For more information about this, see&nbsp;Intune: How to request flighting for PowerShell exclusion groups (microsoft.com).
`[Source: contentidea-kb, Score: 7.5]`

### Step 8: Currently, the Intune platform does not support retrieving or downloading PowerShell scripts once they have been uploaded. As a result, users may b...
**Solution**: 
`[Source: contentidea-kb, Score: 7.5]`

---

## All Known Issues

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Error uploading macOS shell script (.sh) in Intune console - script preview s... | Script file saved with Unicode/UTF-16 encoding, injecting non-standard Unicod... | Copy the script content to a new file in Notepad, then Save As with ANSI enco... | 9.0 | ado-wiki |
| 2 | Exclude groups option missing for PowerShell scripts assignments in Intune UI... | Older tenant was built without exclude groups functionality for PowerShell sc... | 1) Submit SAW request to add flighting tag 'EnableGAndTForPowershell' via ICM... | 9.0 | ado-wiki |
| 3 | macOS 11.2.x devices: apps can't be downloaded/installed (Install Pending ind... | Known macOS Big Sur 11.2.x bug causing ASDErrorDomain Code=506 duplicate inst... | Upgrade the device to macOS 11.3 or later version. | 8.0 | mslearn |
| 4 | Customer is using RBAC roles to manage scripts and other resources.RBAC showe... | Issue is caused at service level. Fix roll-out is in preparation. | Please have the customer attempt the following as a potential workaround:  Wi... | 7.5 | contentidea-kb |
| 5 | This article describes generic troubleshooting steps to follow when investiga... |  |  | 7.5 | contentidea-kb |
| 6 | THIS CONTENT IS NO LONGER UP TO DATE. FOR THE MOST UP-TO-DATE CONTENT, REFER ... |  |  | 7.5 | contentidea-kb |
| 7 | The Exclusion&nbsp;button for Powershell Scripts is not visible in the UI. | The customer must be flighted for EnableGAndTForPowershell&nbsp;to get the Ex... | To resolve this problem, the customer must be flighted&nbsp;EnableGAndTForPow... | 7.5 | contentidea-kb |
| 8 | Currently, the Intune platform does not support retrieving or downloading Pow... |  |  | 7.5 | contentidea-kb |
