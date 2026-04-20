# AVD USB 与外设重定向 — Troubleshooting Workflow

**Scenario Count**: 16
**Generated**: 2026-04-18

---

## Scenario 1: USB camera/imaging device cannot be redirected to AVD sessio...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- 1) Install RDSH role on server (requires reboot)
- 2) On client: enable GPO 'Allow RDP redirection of other supported RemoteFX USB devices'
- 3) Add registry keys under UsbSelectDeviceByInterfaces: Camera GUID {ca3e7ab9-b4c3-4ae6-8251-579ef933890f}, Image GUID {6bdd1fc6-810f-11d0-bec7-08002be2092f}
- 4) Install device drivers on server if needed.

**Root Cause**: On Windows Server OS, the RDSH (Remote Desktop Session Host) role must be installed for RemoteFX USB device redirection to work. This is by design.

## Scenario 2: USB redirection cannot be disabled on Windows 365 Cloud PC w...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Use alternative methods to restrict USB redirection on Windows 365 Cloud PC (e.g., Intune device configuration policies)

**Root Cause**: Known product limitation - USB redirection control via authentication context is not supported on Windows 365 Cloud PC

## Scenario 3: Copying files in Remote Desktop Web Client redirected virtua...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Workaround: Retry the file copy operation a second time. The second attempt should succeed. Awaiting permanent fix from PG.

**Root Cause**: Bug: WriteFile operation fails due to a denied access error. File is opened and closed repeatedly. (ICM 365606610, Bug 43302951)

## Scenario 4: Virtual drive redirection does not work in AVD web client. A...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Set the RDP property audiomode:i:0 (Play sounds on the local computer) to re-enable virtual drive redirection.

**Root Cause**: Bug: Any audiomode RDP property setting different than 0 (e.g., audiomode:i:1 or audiomode:i:2) also disables virtual drive (file copy) redirection. (ICM 575471426, Bug 38761562)

## Scenario 5: Copying files in Remote Desktop Web Client redirected virtua...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Workaround: perform a second copy attempt if the first one fails. Bug fix pending from PG.

**Root Cause**: Bug in Web Client virtual drive redirection. File is opened and closed repeatedly causing access denied on first attempt. (ICM 365606610, Bug 43302951)

## Scenario 6: Virtual drive redirection does not work in Web Client. Acces...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Enable audio redirection by setting audiomode:i:0 ('Play sounds on the local computer'). This will also restore virtual drive redirection.

**Root Cause**: Bug: Setting audiomode to any value other than 0 (e.g., 1 or 2) disables virtual drive redirection in addition to audio. (ICM 575471426, Bug 38761562)

## Scenario 7: Mouse pairs successfully but cursor does not move inside rem...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Navigate to iOS Privacy/Bluetooth settings, confirm Windows App has Bluetooth access enabled, toggle Bluetooth off and on, fully close and relaunch Windows App. Reinstalling app may reset permissions.

**Root Cause**: Bluetooth permission denied or revoked for Windows App, commonly after OS upgrades

## Scenario 8: Mouse disconnects randomly during Windows App session on iOS
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check mouse battery level, keep Windows App in foreground during testing, re-pair mouse and restart session. Collect disconnect frequency and whether it occurs only in Windows App.

**Root Cause**: Bluetooth power management, low mouse battery, or iOS background restrictions killing connection

## Scenario 9: Relative Mouse feature not functioning in AVD session - mous...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- In ASC, go to Host Pool > RDP Properties > confirm/add `AllowRelativeMouseMode:i:1`

**Root Cause**: RDP property `AllowRelativeMouseMode:i:1` not added to Host Pool

## Scenario 10: Low-level device redirection not available for Linux Thin Cl...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Use FabulaTech Device Redirector as workaround. Microsoft planned to add support to Linux SDK in H1 2025

**Root Cause**: Microsoft Linux SDK does not support low-level device redirection for Linux Thin Client providers

## Scenario 11: Cursor moves but clicks or scrolling do not work in Windows ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Test basic inputs (left-click, right-click, scroll wheel), confirm whether issue reproduces across sessions. Escalate if cursor works but input actions fail consistently.

**Root Cause**: Mouse profile not fully supported, partial HID compatibility, or custom mouse button mapping

## Scenario 12: AVD session hosts Bugcheck 0xA IRQL_NOT_LESS_OR_EQUAL from D...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Downgrade to Intel Wireless Bluetooth driver version 21.110.0.3.

**Root Cause**: USB redirection of Intel Wireless Bluetooth driver accessing invalid memory.

## Scenario 13: User gets 'Reconnecting' page when connecting from AVD deskt...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Do not redirect the Intel Wireless Bluetooth on the AVD session:Peripheral and resource redirection over the Remote Desktop Protocol | Microsoft Learn Detailed steps for same:  Get the Class Guid from Device manager for Intel
     wireless Bluetooth:2. Run the below cmds in admin cmd prompt on your client machine by replacing the Class Guid which you got from Device Manager for Intel Wireless Bluetooth:$deviceClassGuid = &quot;e0cbf06c-cd8b-4647-bb8a-2**********4&quot;Get-PnpDevice | Where-Object {$_.ClassGuid -like
&quot;*$deviceClassGuid*&quot; -and $_.InstanceId -like &quot;USB\*&quot; -and
$_.Present -like &quot;True&quot;} | FT -AutoSize3. Replace the Instance ID and update in �Advanced� tab under RDP properties in Hostpool:usbdevicestoredirect:s:-usb\vid_8087&amp;pid_0033\***1ffe37&amp;0&amp;10Peripheral
and resource redirection over the Remote Desktop Protocol | Microsoft Learn   After following the above steps, you should be able to connect to the AVD session via desktop client and you can select the devices needs to be redirected by clicking on marked option below:

**Root Cause**: Disabling 'Do not allow supported Plug and Play device redirection' policy will allow USB devices to redirect from client to SH.USB Redirection - Overview (azure.com) When USB redirection is enabled, Intel Wireless Bluetooth Wireless was also getting redirection which was causing Azure VM to crash:Windows: Session hosts crash with Bugcheck A when AVD session taken using AVD Desktop Client. (microsoft.com)  Issue repro ways: Issue is reproducible connecting via AVD desktop client. Issue is NOT reproducible connecting via web client (HTML). Issue is reproducible on direct RDP (mstsc) when 'Intel Wireless Bluetooth' is checked under RemoteFx USB devices:

## Scenario 14: Users local Microsoft Teams calls disconnect shortly (within...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Resolution 1  Disable Teams HID Manager (low risk, reversible) Mitigates device conflict by stopping Teams from actively managing HID peripherals when VDI starts. Registry (peruser): Path:  HKEY_CURRENT_USER\Software\Microsoft\Teams\HID
Name:  DisableHidManagerV1
Type:  REG_DWORD
Value: 1
PowerShell (user context): PowerShell      New-Item -Path &quot;HKCU:\Software\Microsoft\Teams\HID&quot; -Force | Out-Null New-ItemProperty -Path &quot;HKCU:\Software\Microsoft\Teams\HID&quot; -Name &quot;DisableHidManagerV1&quot; -PropertyType DWord -Value 1 -Force | Out-Null                Deployment tip: Roll out via Intune (user script) or GPO (User Configuration  Preferences  Registry). Pilot first, then expand. Resolution 2  Prevent or Delay Teams AutoStart Inside VDI Avoids the collision during an active local call by not starting Teams in the VDI session immediately. Remove autostart entries (user context in VDI): PowerShell      $runKey = &quot;HKCU:\Software\Microsoft\Windows\CurrentVersion\Run&quot;  # Classic Teams if (Test-Path &quot;$runKey\com.squirrel.Teams.Teams&quot;) {   Remove-ItemProperty -Path $runKey -Name &quot;com.squirrel.Teams.Teams&quot; -ErrorAction SilentlyContinue }  # New Teams if (Test-Path &quot;$runKey\com.microsoft.teams&quot;) {   Remove-ItemProperty -Path $runKey -Name &quot;com.microsoft.teams&quot; -ErrorAction SilentlyContinue }                 Set client preference Open Teams automatically = Off in the base profile or enforce via script/GPO. User guidance: Start/finish calls in one environment; avoid launching VDI midcall or launch VDI first and use the same environment for the call.  Validation &amp; Rollout Pilot with a small user group:
Group A: Resolution 1 only. Group B: Resolution 1 + 2.   Test scenario: Start a local Teams call  launch VDI  observe for 2 minutes. Success criteria: The local call remains connected; no unexpected device flip or session drop. Scale: Use Intune/GPO for registry/policy deployment; bake service changes into the VDI gold image where applicable.

**Root Cause**: Competing Teams media stacks (local machine vs. VDIoptimized Teams) contend for HID/audio devices and WebRTC/optimization channels.  The account/tenant mismatch between local Teams and VDI Teams increases the chance that VDI media optimization or device redirection seizes control, causing the local call session to tear down.

## Scenario 15: By default RDP setting created to WVD resource will have dri...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Spring 2020 update: Use PowerShell Update-AzWvdHostPool -ResourceGroupName <RG> -Name <hostpool> -CustomRdpProperty drivestoredirect:s: to set empty. Fall 2019: Use Set-RdsHostPool -Name <hostpool> -TenantName <tenant> -CustomRdpProperty drivestoredirect:s: to set empty.

**Root Cause**: RDP file at C:\Users\Username\AppData\Local\rdclientwpf\GUID contains drivestoredirect:s:* which redirects all local drives to the session host.

## Scenario 16: Need to disable local drive visibility on WVD RD Client.
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Configure GPO: Computer Configuration\Policies\Administrative Templates\Windows Components\Remote Desktop Services\Remote Desktop Session Host\Device and Resource Redirection. Enable Do not allow drive redirection and link to OU with WVD Session host computer accounts. Note: This policy works at machine level for RD Client app only, not for WVD Web client.

**Root Cause**: Drive redirection is enabled by default and needs GPO configuration to block.
