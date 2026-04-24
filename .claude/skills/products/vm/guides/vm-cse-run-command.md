# VM Run Command 功能 — 排查速查

**来源数**: 2 (AW, ON) | **条目**: 12 | **21V**: 全部
**最后更新**: 2026-04-24

## 症状速查

| # | 症状 | 根因 | 方案 | 分数 | 来源 |
|---|------|------|------|------|------|
| 1 | Cannot log in to Windows VM; VMAccess extension fails to reset password | Local admin password lost; VMAccess extension may not function on certain OS ver | Use Run-Command (Invoke-AzureRmVMRunCommand) to execute PowerShell script that r | 🟢 8 | ON |
| 2 | VM operation (extension install, VM start, resize) takes exactly 90 minutes to complete; subsequent  | An extension is stuck in 'Transitioning' state, hitting the 90-minute timeout. T | 1) Check ASC Resource Explorer → Operations tab for 90-min timing. 2) Use Kusto: | 🔵 7.5 | AW |
| 3 | RunCommand execution fails with error code 'RunCommandConflict' / 'Conflict': 'Run command extension | Another RunCommand operation is already in progress on the VM. Concurrent RunCom | Wait for existing RunCommand to complete (up to 90 min default timeout). If comm | 🔵 7.5 | AW |
| 4 | RunCommand execution fails with Conflict error: 'Run command extension execution is in progress. Ple | A previous RunCommand operation is still in progress. Only one RunCommand can ex | 1) Wait for existing RunCommand to complete (up to 90 min). 2) If hung, log into | 🔵 7.5 | AW |
| 5 | RunCommand extension fails to execute when command argument contains reserved character '&' (ampersa | The '&' character is a cmd.exe reserved character that splits the command line,  | Use caret (^) to escape '&' in the argument. Example: change $paramm='abc&jj' to | 🔵 6.5 | AW |
| 6 | RunCommand extension fails when script path contains backslash-n (e.g., C:\Windows\notepad.exe) beca | RunCommand extension script serialization treats \n as a newline character. Path | Replace lowercase \n with uppercase \N in file paths (e.g., use C:\Windows\Syste | 🔵 6.5 | AW |
| 7 | RunCommand extension fails with error 'XYZ is not recognized as an internal or external command' whe | Registry key HKLM\SOFTWARE\Microsoft\Command Processor\AutoRun has a non-empty v | Clear the AutoRun registry key: ensure HKLM\SOFTWARE\Microsoft\Command Processor | 🔵 6.5 | AW |
| 8 | RunCommand extension fails to execute when command arguments contain the ampersand '&' character or  | The '&' character is interpreted as a command separator by the Windows command p | Use caret (^) to escape '&' in command arguments. Example: change 'abc&jj' to 'a | 🔵 6.5 | AW |
| 9 | RunCommand extension fails when script contains file paths with backslash-n sequence (e.g. C:\Window | The \n sequence in file paths (e.g. \notepad.exe) is interpreted as a newline ch | Replace lowercase \n in file paths with uppercase \N. Use C:\Windows\Notepad.exe | 🔵 6.5 | AW |
| 10 | RunCommand extension fails on Windows VM with error 'XYZ is not recognized as an internal or externa | Registry key HKLM\SOFTWARE\Microsoft\Command Processor\AutoRun is set to a non-e | Clear the registry key HKLM\SOFTWARE\Microsoft\Command Processor\AutoRun to empt | 🔵 6.5 | AW |
| 11 | Cannot access Azure VM remotely because the trusted communication between the VM and the Active Dire | The computer account trust relationship with the AD domain has been broken, prev | Rejoin the VM to the domain using Custom Script Extension (netdom remove + netdo | 🔵 6.5 | AW |
| 12 | Cannot access Azure VM remotely. Trusted communication between VM and Active Directory domain is bro | The secure channel between the VM computer account and the AD domain controller  | Rejoin VM to domain using: (1) CustomScriptExtension with netdom remove/join, (2 | 🔵 6.5 | AW |

## 快速排查路径

1. **Cannot log in to Windows VM; VMAccess extension fails to reset password**
   - 根因: Local admin password lost; VMAccess extension may not function on certain OS versions
   - 方案: Use Run-Command (Invoke-AzureRmVMRunCommand) to execute PowerShell script that resets local admin. No restart required. Prereq: VM agent running.
   - `[🟢 8 | ON]`

2. **VM operation (extension install, VM start, resize) takes exactly 90 minutes to c**
   - 根因: An extension is stuck in 'Transitioning' state, hitting the 90-minute timeout. This blocks all subsequent extension oper
   - 方案: 1) Check ASC Resource Explorer → Operations tab for 90-min timing. 2) Use Kusto: cluster('azcrp').database('crp_allprod').ContextActivity | where acti
   - `[🔵 7.5 | AW]`

3. **RunCommand execution fails with error code 'RunCommandConflict' / 'Conflict': 'R**
   - 根因: Another RunCommand operation is already in progress on the VM. Concurrent RunCommand execution is not supported; only on
   - 方案: Wait for existing RunCommand to complete (up to 90 min default timeout). If command appears hung, guide customer to login to VM, find the process runn
   - `[🔵 7.5 | AW]`

4. **RunCommand execution fails with Conflict error: 'Run command extension execution**
   - 根因: A previous RunCommand operation is still in progress. Only one RunCommand can execute at a time. The existing command ma
   - 方案: 1) Wait for existing RunCommand to complete (up to 90 min). 2) If hung, log into VM, find the process (PowerShell/cmd under SYSTEM account) and termin
   - `[🔵 7.5 | AW]`

5. **RunCommand extension fails to execute when command argument contains reserved ch**
   - 根因: The '&' character is a cmd.exe reserved character that splits the command line, causing unexpected execution behavior wh
   - 方案: Use caret (^) to escape '&' in the argument. Example: change $paramm='abc&jj' to $paramm='abc^&jj' when passing to Invoke-AzVMRunCommand -Parameter.
   - `[🔵 6.5 | AW]`

