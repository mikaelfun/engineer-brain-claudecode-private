# AVD AVD MSIX App Attach - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 17 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| MSIX app attach fails with Azure AD DS (AADDS) environment. Cannot add... | MSIX app attach does not support Azure AD DS because AADDS computer ob... | Use AD DS (on-premises Active Directory) instead of Azure AD DS for MS... |
| When using MSIX app attach in AVD, launching an application (e.g. PuTT... | Bug in AVD MSIX app attach where the system launches the last applicat... | PG has a fix in the pipeline. As workaround, modify the appxmanifest t... |
| MSIX remote app launches Windows Explorer instead of the intended appl... | Bug in AVD MSIX app attach where a disconnected session state causes t... | Bug tracked (OS Bug 34349845). Workaround: ensure the user fully signs... |
| MSIX app does not appear in Start Menu when user logs into full deskto... | MSIX app registration/deregistration timing issue in shared host pools... | Diagnostic steps: 1) Check AppXDeploymentServer Operational event log ... |
| Unable to add MSIX package to AVD host pool via Azure Portal. Page spi... | Two issues: 1) Portal bug causing infinite nextLink pagination loop du... | 1. If portal fails, try PowerShell (New-AzWvdMsixPackage) or REST API ... |
| MSIX App Attach: newly added MSIX application fails to launch (File Ex... | MSIX App Attach staging for packages only occurs during boot or approx... | Reboot the session host machine before trying to launch a newly added ... |
| Apps published through MSIX App Attach not displayed under Start Menu ... | Known issue: using FSlogix or Roaming Profile, the Start Menu breaks s... | Add FSLogix Redirection.xml exclusion for AppData\Local\Packages\Micro... |
| Adding MSIX Packages VHD(x) path under WVD Hostpool gives error Error ... | Access to WVD where the MSIX packages are published not properly confi... | Assign session host VMs permissions for the storage account and file s... |
| Adding MSIX packages under WVD Hostpool gives error No MSIX packages c... | MSIX image expansion done under the VHD without creating a root/parent... | Create a root folder inside the VHD(x) when expanding MSIX Image with ... |
| MSIX app attach fails to import into the WVD Host Pool. No MSIX packag... | UI prevalidation fails for MSIX packages with services unless manifest... | Use PowerShell to add app attach package, or edit manifest to assign i... |
| MSIX app attach application shortcut not appearing in Start Menu when ... | FSLogix profiles contain start menu layout cache under %localappdata%\... | Apply Redirections.xml via FSLogix with exclusion for AppData\Local\Pa... |
| MSIX App Attach X64 apps do not register on user logon when in CIM for... | Issue in Win 10 20H2 and 21H1 when requesting On Demand Registration w... | Use VHDx instead of CIM disks in X64 format. Or run Add-AppxPackage re... |
| AVD session host shows shut down status though it is running issue. | Troubleshooting done: &nbsp; 1.First we check the system event log to ... | To fix the issue, we need to set the Enable64Bit back to default by ru... |
| Screen reader  focus moves to an invisible element and announces as &q... | Environmental Details OS Version: Dev (26408.1001) Edge Dev Version: 1... | There   is no known workaround at this stage. No ETA for the fix    Bu... |
| We have located an issue where Microsoft Runtime application dependenc... | During logoff, app attach in the RDAgent calls PackageManager.RemovePa... | Workarounds:&nbsp;  Block logoff until removal of package is done (imp... |
| MSIX app not appearing in Start Menu when logging into AVD full deskto... | MSIX on-demand registration race condition in shared session host pool... | Under investigation. Workaround: ensure MSIX packages are assigned to ... |
| MSIX App Attach fails: No MSIX Packages could be retrieved from the im... | Type1: Computer account lacks share permissions. Type2: App signature ... | Type1: Add computer account with Read permission on share (Azure Files... |

### Phase 2: Detailed Investigation

#### Entry 1: MSIX app attach fails with Azure AD DS (AADDS) environment. ...
> Source: OneNote | ID: avd-onenote-016 | Score: 8.5

**Symptom**: MSIX app attach fails with Azure AD DS (AADDS) environment. Cannot add MSIX image to host pool when storage account is joined to AADDS

**Root Cause**: MSIX app attach does not support Azure AD DS because AADDS computer objects are not synchronized to Azure AD, making it impossible to provide the required RBAC permissions for Azure Files

**Solution**: Use AD DS (on-premises Active Directory) instead of Azure AD DS for MSIX app attach. Join storage account to AD DS, sync computer objects to AAD, then assign RBAC and NTFS permissions

> 21V Mooncake: Applicable

#### Entry 2: When using MSIX app attach in AVD, launching an application ...
> Source: OneNote | ID: avd-onenote-003 | Score: 7.5

**Symptom**: When using MSIX app attach in AVD, launching an application (e.g. PuTTY) incorrectly launches a different application from the same MSIX package (e.g. PuTTYGen)

**Root Cause**: Bug in AVD MSIX app attach where the system launches the last application declared in the appxmanifest rather than the intended one, affecting multi-entry MSIX packages

**Solution**: PG has a fix in the pipeline. As workaround, modify the appxmanifest to reorder application entries so the desired app is listed last, or split multi-entry apps into separate MSIX packages

> 21V Mooncake: Applicable

#### Entry 3: MSIX remote app launches Windows Explorer instead of the int...
> Source: OneNote | ID: avd-onenote-006 | Score: 7.5

**Symptom**: MSIX remote app launches Windows Explorer instead of the intended application after user disconnects from a session desktop and relaunches the MSIX app. Sequence: launch MSIX app -> close (disconnect) -> launch session desktop -> sign out (session stays Disconnected) -> relaunch MSIX app -> Explorer opens instead

**Root Cause**: Bug in AVD MSIX app attach where a disconnected session state causes the MSIX remote app process to incorrectly launch explorer.exe instead of the registered application executable

**Solution**: Bug tracked (OS Bug 34349845). Workaround: ensure the user fully signs out from the session desktop (not just disconnect) before relaunching the MSIX remote app. Alternatively, log off all disconnected sessions before launching MSIX apps

> 21V Mooncake: Applicable

#### Entry 4: MSIX app does not appear in Start Menu when user logs into f...
> Source: OneNote | ID: avd-onenote-089 | Score: 7.5

**Symptom**: MSIX app does not appear in Start Menu when user logs into full desktop in AVD shared session host pool (FSLogix + MSIX app attach). Repro: assign both RemoteApp (MSIX) and Desktop to same user on single session host → login full desktop → no MSIX app in Start Menu. After launching RemoteApp separately then logging back into full desktop, the app briefly appears, but disappears again on next logoff/logon cycle.

**Root Cause**: MSIX app registration/deregistration timing issue in shared host pools. When user logs off, DeregisterMsixWithPackageManager runs. On next full desktop login, OnDemandRegisterMsixWithPackageManager fires for the app, but GetAppAttachPackagesToStage returns numberOfPackages:0, meaning the staging health check does not detect packages to stage. The registration happens on-demand only when the specific app is launched, not proactively for Start Menu population in full desktop mode.

**Solution**: Diagnostic steps: 1) Check AppXDeploymentServer Operational event log (Microsoft-Windows-AppXDeploymentServer%4Operational.evtx) on session host, search by app name for registration/deregistration events. 2) Use Kusto: cluster("rdskmc.chinaeast2.kusto.chinacloudapi.cn").database("WVD").RDOperation | where HostPool contains "<hostpool>" | where Name contains "packages" or Name contains "register" or Name contains "msix" or Name contains "stag" to trace the staging/registration sequence. 3) This is a known behavior: MSIX apps in shared host pools with both desktop and RemoteApp assignments may not reliably appear in Start Menu. Workaround: use RemoteApp-only assignment, or launch apps via alternative means (not Start Menu).

> 21V Mooncake: Applicable

#### Entry 5: Unable to add MSIX package to AVD host pool via Azure Portal...
> Source: OneNote | ID: avd-onenote-087 | Score: 7.0

**Symptom**: Unable to add MSIX package to AVD host pool via Azure Portal. Page spins and fails with error: subscriptionrequestthrottled - the write request has exceeded 1200 during 1:00:00. Browser trace shows nextLink pagination looping thousands of times during expand operation, hitting ARM request limits. Same MSIX works on one host pool but fails on another.

**Root Cause**: Two issues: 1) Portal bug causing infinite nextLink pagination loop during MSIX package expand operation, hitting ARM throttling limits (confirmed by PG as portal bug, ICM 401942040). 2) Underlying VHD corruption causing Mount-DiskImage to succeed but Get-Partition returning empty AccessPaths/DeviceId, preventing MSIX package expansion.

**Solution**: 1. If portal fails, try PowerShell (New-AzWvdMsixPackage) or REST API invoke method. 2. If PS/API also fails, test VHD manually: Mount-DiskImage -ImagePath <UNC> -PassThru -NoDriveLetter -Access ReadOnly, then Get-Partition - verify DeviceId is not empty. 3. If DeviceId is empty, the VHD is corrupted - recreate the MSIX VHD image from scratch. 4. Workaround: use expand result from a working host pool as parameter to add MSIX to the failing pool.

> 21V Mooncake: Applicable

#### Entry 6: MSIX App Attach: newly added MSIX application fails to launc...
> Source: ADO Wiki | ID: avd-ado-wiki-156 | Score: 7.0

**Symptom**: MSIX App Attach: newly added MSIX application fails to launch (File Explorer opens instead) if user tries to open the app within ~30 minutes of adding it without rebooting the session host

**Root Cause**: MSIX App Attach staging for packages only occurs during boot or approximately every 30 minutes during health checks, making it not fully dynamic

**Solution**: Reboot the session host machine before trying to launch a newly added MSIX application, or wait up to 30 minutes for the next health check cycle

> 21V Mooncake: Applicable

#### Entry 7: Apps published through MSIX App Attach not displayed under S...
> Source: ContentIdea | ID: avd-contentidea-kb-037 | Score: 6.5

**Symptom**: Apps published through MSIX App Attach not displayed under Start Menu or not findable through Windows Search. Get-AppxPackage shows the MSIX package listed.

**Root Cause**: Known issue: using FSlogix or Roaming Profile, the Start Menu breaks so apps are not visible.

**Solution**: Add FSLogix Redirection.xml exclusion for AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\TempState.

> 21V Mooncake: Applicable

#### Entry 8: Adding MSIX Packages VHD(x) path under WVD Hostpool gives er...
> Source: ContentIdea | ID: avd-contentidea-kb-038 | Score: 6.5

**Symptom**: Adding MSIX Packages VHD(x) path under WVD Hostpool gives error Error Accessing Virtual Disk and Code: 400.

**Root Cause**: Access to WVD where the MSIX packages are published not properly configured.

**Solution**: Assign session host VMs permissions for the storage account and file share: Create AD DS security group, add computer accounts, sync to Azure AD, create storage/file share, join storage to AD DS, assign Storage File Data SMB Share Contributor role.

> 21V Mooncake: Applicable

#### Entry 9: Adding MSIX packages under WVD Hostpool gives error No MSIX ...
> Source: ContentIdea | ID: avd-contentidea-kb-039 | Score: 6.5

**Symptom**: Adding MSIX packages under WVD Hostpool gives error No MSIX packages could be retrieved from the image path. Downloading VHD(x) and mounting throws Access is Denied.

**Root Cause**: MSIX image expansion done under the VHD without creating a root/parent folder inside it.

**Solution**: Create a root folder inside the VHD(x) when expanding MSIX Image with MSIXMGR.exe: msixmgr.exe -Unpack -packagePath <pkg>.msix -destination D:\<root folder> -applyacls.

> 21V Mooncake: Applicable

#### Entry 10: MSIX app attach fails to import into the WVD Host Pool. No M...
> Source: ContentIdea | ID: avd-contentidea-kb-040 | Score: 6.5

**Symptom**: MSIX app attach fails to import into the WVD Host Pool. No MSIX packages could be retrieved error. Excluding 3rd party services from MSIX package allows adding successfully.

**Root Cause**: UI prevalidation fails for MSIX packages with services unless manifest provides icons for all entry points.

**Solution**: Use PowerShell to add app attach package, or edit manifest to assign icons to all entry points including services. Turn off auto update.

> 21V Mooncake: Applicable

#### Entry 11: MSIX app attach application shortcut not appearing in Start ...
> Source: ContentIdea | ID: avd-contentidea-kb-041 | Score: 6.5

**Symptom**: MSIX app attach application shortcut not appearing in Start Menu when using FSLogix. Disabling FSlogix or new user shows shortcut correctly.

**Root Cause**: FSLogix profiles contain start menu layout cache under %localappdata%\Microsoft\Windows\Shell that overwrites start menu on machine.

**Solution**: Apply Redirections.xml via FSLogix with exclusion for AppData\Local\Packages\Microsoft.Windows.StartMenuExperienceHost_cw5n1h2txyewy\TempState.

> 21V Mooncake: Applicable

#### Entry 12: MSIX App Attach X64 apps do not register on user logon when ...
> Source: ContentIdea | ID: avd-contentidea-kb-046 | Score: 6.5

**Symptom**: MSIX App Attach X64 apps do not register on user logon when in CIM format. App is staged but not present for user.

**Root Cause**: Issue in Win 10 20H2 and 21H1 when requesting On Demand Registration with CIM format.

**Solution**: Use VHDx instead of CIM disks in X64 format. Or run Add-AppxPackage registration script manually.

> 21V Mooncake: Applicable

#### Entry 13: AVD session host shows shut down status though it is running...
> Source: ContentIdea | ID: avd-contentidea-kb-088 | Score: 6.5

**Symptom**: AVD session host shows shut
down status though it is running issue.

**Root Cause**: Troubleshooting
done: &nbsp; 1.First
we check the system event log to see if the machine has restart record or not. If the machine has not been started for over
90 days, then it is a normal behavior as RDCB will clear the record.  -&gt;Checked, no issue. &nbsp; 2.As
per our checking, we found there should be some agents missing in the target
host.  &nbsp;&nbsp;&nbsp; We only have Remote Desktop Agent Boot
Loader &amp; Infrastructure Agent &amp; WebRTC Redirector Services installed on
the issued host.  &nbsp; &nbsp; &nbsp; &nbsp;&nbsp; Expected: &nbsp; &nbsp; &nbsp; &nbsp; 2.Ran
command dism /online /cleanup-image /restorehealth and scf /cannow, got the
following error: &nbsp;&nbsp;&nbsp; Error: 0x800f081f &nbsp; 3.
When we tried to check the event log from backend, we found therere no events
related to MSIInstaller and WVD-agent since 4/5/2024. &nbsp;&nbsp;&nbsp;&nbsp; Its strange since normally there is URL
checking event recorded and new package downloaded when latest version is
detected. &nbsp;&nbsp;&nbsp;&nbsp; From backend side, we found the current
RDAgentBootLoader version is 1.0.8297.800, actually the latest RDAgent version
is 1.0.8431.2300 &nbsp;&nbsp;&nbsp;&nbsp; And the OS version is lower than other
working session hosts in the same host pool. &nbsp; &nbsp;4.After
we register a VM to a host pool within the Azure Virtual Desktop service, the
agent regularly refreshes the VM's token whenever the VM is active.  &nbsp;&nbsp;&nbsp; &nbsp;The
certificate for the registration token is valid for 90 days. Because of this
90-day limit, we recommend VMs to be online for 20 minutes every 90 days so
that the machine can refresh its tokens and update the agent and side-by-side
stack components.  &nbsp;&nbsp;&nbsp; &nbsp;Turning
on the VM within this time limit prevents its registration token from expiring
or becoming invalid.  &nbsp;&nbsp;&nbsp;&nbsp; If we started your VM after 90 days and
are experiencing registration issues, follow the instructions in the Azure
Virtual Desktop agent troubleshooting guide to remove the VM from the host
pool, reinstall the agent, and reregister it to the pool. &nbsp; 5.
Then we tried to reinstall the RD Agent Boot Loader. Then the azure vm has been
added to the host pool. &nbsp;&nbsp;&nbsp;&nbsp; But in the registry: Computer\HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\RDInfraAgent,
lots of registry keys are missing. Especially IsRegistered. &nbsp;&nbsp;&nbsp;&nbsp; The expected display: below screenshot is from testing lab environment: &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; 6.Then
we collected process monitor log for installing RD Agent Boot Loader process. Compare the good scenario and fail scenario. &nbsp; 6.1
The&nbsp;RDAgentBootLoader.exe&nbsp;launched is a 32bit version.  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; This is the reason why it tries to
access the registry &quot;HKLM\SOFTWARE\WOW6432Node\Microsoft\RDAgentBootLoader&quot;
and cannot find it. &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 12:07:08.6109265
PM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RDAgentBootLoader.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4704&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6008&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Process
Start&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.0000000&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SUCCESS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Parent
PID: 912, Command line: &quot;C:\Program Files\Microsoft
RDInfra\RDAgentBootLoader_1.0.8925.0\RDAgentBootLoader.exe&quot;, Current
directory: C:\Windows\system32\, Environment:&nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; 12:07:17.7408945
PM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RDAgentBootLoader.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4704&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6792&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;RegOpenKey&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HKLM\SOFTWARE\WOW6432Node\Microsoft\RDAgentBootLoader&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.0000086&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NAME NOT FOUND&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Desired
Access:
Read/Write&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NT
AUTHORITY\SYSTEM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&quot;C:\Program
Files\Microsoft
RDInfra\RDAgentBootLoader_1.0.8925.0\RDAgentBootLoader.exe&quot; &nbsp; 6.2
The file&nbsp;&quot;C:\Program Files\Microsoft
RDInfra\RDAgentBootLoader_1.0.8925.0\RDAgentBootLoader.exe&quot;&nbsp;is
created by msiexec.exe. The 32bit seems no difference. &nbsp; &nbsp; Non-working:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 12:06:56.0725504
PM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;msiexec.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8796&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1592&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FASTIO_QUERY_INFORMATION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C:\Program
Files\Microsoft
RDInfra\RDAgentBootLoader_1.0.8925.0\RDAgentBootLoader.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.0000049&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SUCCESS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Type:
QueryStandardInformationFile, AllocationSize: 45,056, EndOfFile: 44,824,
NumberOfLinks: 1, DeletePending: False, Directory:
False&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NT
AUTHORITY\SYSTEM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C:\Windows\system32\msiexec.exe
/V &nbsp; Working: &nbsp; 10:25:17.6553130
AM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;msiexec.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4220&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6316&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FASTIO_QUERY_INFORMATION&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C:\Program
Files\Microsoft
RDInfra\RDAgentBootLoader_1.0.8925.0\RDAgentBootLoader.exe&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.0000046&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SUCCESS&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Type:
QueryStandardInformationFile, AllocationSize: 45,056, EndOfFile: 44,824,
NumberOfLinks: 1, DeletePending: False, Directory:
False&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;NT
AUTHORITY\SYSTEM&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;C:\Windows\system32\msiexec.exe
/V &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; It means the AnyCPU&nbsp;RDAgentBootLoader.exe&nbsp;is
forced to run as 32bit on customer's machine.  &nbsp;In
local environment, it runs as 64bit.  &nbsp;&nbsp;&nbsp;&nbsp; We need to check customer's environment
and file directly by corflags.exe and ldr64.exe &nbsp; &nbsp; Cause: We
checked customer's machine. Their global Enable64Bit setting is 0. This causes
the AnyCPU .NET application runs as 32bit and causes problem. Actually
we installed the .msix 64bit agent.  no issue for the .msix package. &nbsp; But
the cx machine has configured only 32 bit .net program to run. It
causes it tries to read the 32 bit related path instead of the 64 bit path. But
name not found. Thus it will not continue. &nbsp; Customer
side: Run CorFlags.exe   &nbsp;The PE32 format stands for Portable Executable
32-bit, while PE32+ is Portable Executable 64-bit format. &nbsp; C:\temp\Tools&gt;Ldr64.exe query loading
kernel32...done. retrieved
GetComPlusPackageInstallStatus entry point retrieved
SetComPlusPackageInstallStatus entry point Current
status is: 0x00000000

**Solution**: To
fix the issue, we need to set the Enable64Bit back to default by running: Ldr64.exe set64 Then
we try reinstall the RD Agent Boot Loader. Then the Azure VM has been
registered to the AVD host pool successfully. Check
all components are installed successfully.

> 21V Mooncake: Applicable

#### Entry 14: Screen reader  focus moves to an invisible element and annou...
> Source: ContentIdea | ID: avd-contentidea-kb-124 | Score: 6.5

**Symptom**: Screen reader
 focus moves to an invisible element and announces as &quot;Copied&quot; in
 scan mode

**Root Cause**: Environmental Details OS Version: Dev (26408.1001) Edge Dev Version: 136.0.3240.76 URL:&nbsp;Firefox
- Microsoft Azure AT: Screen Reader &nbsp; Pre-Requisite Turn on Narrator by using
Windows+Control+Enter key. Switch to scan mode by using Caps
lock+Space key &nbsp;  Repro Steps 
  Open the above URL and login with valid
     credentials. Navigate to Overview&quot; button in the left
     navigation pane and invoke it with enter key. Now in the overview page, navigate by using Up
     and down arrow keys. When the focus is on the &quot;copy to
     clipboard&quot; use down arrow key and observe the issue.   
 
 
    Actual Result: After the &quot;Copy to clipboard&quot;
is announced, on pressing down arrow key, screen reader focus is moving to some
unknown element and it is announcing as &quot;Copied&quot; &nbsp; Expected Result: Screen reader focus should not move to
the invisible elements in the page. Focus should move between the elements
available in the page. &nbsp;

**Solution**: There
  is no known workaround at this stage. No ETA for the fix 
  Bug
  57662507 [AVD - Azure][Third Party Package App Attach Support]: Screen reader
  focus moves to an invisible element and announces as &quot;Copie... 
 
 &nbsp;

> 21V Mooncake: Applicable

#### Entry 15: We have located an issue where Microsoft Runtime application...
> Source: ContentIdea | ID: avd-contentidea-kb-133 | Score: 6.5

**Symptom**: We have located an issue where Microsoft Runtime application dependency may become corrupt when 2 or more users log onto a Session Host and use that app. The issue occurs when a user logs off and breaks the Runtime so on next user logon, the app may fail Here is the scenario:  User A connects to AVD Session host launches 2 apps &nbsp;( app attach ( VHDX) that depend on Runtime 1.4 ( pre installed ) User B connects to AVD Session Host launches the same 2 apps that User A has launched User B closes the apps and logs off User A closes the app and logs off User B logs back on and now get the 2 apps greyed out on the start menu, and gets the following on App Launch&nbsp; &nbsp;  &nbsp; Check the Runtime &nbsp;and its broken: &nbsp;    This is happening on 24H2 ( at the time of writing 23H2 and 25H2 have not been tested)

**Root Cause**: During logoff, app attach in the RDAgent calls PackageManager.RemovePackageAsync() to deregister packages for the logged off user. This triggers automatic removal of framework dependencies. The removal operation enters &quot;user profile changing&quot; state while Windows/Appx is unloading the user profile.&nbsp;  When the profile becomes inaccessible mid-operation (because logoff could be complete), Appx fails to complete the removal and attempts to roll back. The rollback fails because it tries to restore state to the now-unloaded user profile, causing Appx to mark the framework package as &quot;Modified, NeedsRemediation.  To summarize, it's a race condition between profile offloading during logoff and package deregistration.

**Solution**: Workarounds:&nbsp;  Block logoff until removal of package is done (impacts user experience) Stage the remediated package immediately if it goes into a bad state Instead of registering dependency package by full name, register package by family name. This would ensure Appx doesn't deregister/removes the dependency package upon logoff that causes this issue.    The other option for the customer is for the user to remove the dependency from their package manifest, but that requires repackaging and updating the package.  Preferred workaround:  There are 2 scripts available. &nbsp; Create-FrameworkStagingTask.ps1
-&nbsp; You can test this manually on a session host to ensure all is working. Run the script via Powershell ISE in elevated context. It will prompt you for the Runtime Location source, e.g c:\temp\Micrsoft.WindowsAppRuntime.msix. Enter the full path inc the file name, Once complete you will see    Check in Task Scheduler , the newly created Task appears:    Once you are happy , you can now deploy that
script via the other PowerShell script Deploy-FrameworkStagingTask-AzureVMs.ps1
to all session hosts in the HP: &nbsp; You can do it via Azure CLI 
PowerShell &nbsp; It will prompt you for the Resource
Group containing the Session Hosts &nbsp; And then it will ask you for the
location of the runtime dependency which will be needed. &nbsp;   &nbsp; In my test I just copied the
Microsoft.WindowsAppRuntime to c:\temp\ on each of my 2 session hosts in a Temp
folder and specified that location ( as you can see above) or provide a share location containing the RunTime.  Check each session host that the scheduled task is created:      Please reach out to the content owner to access the scripts.

> 21V Mooncake: Applicable

#### Entry 16: MSIX app not appearing in Start Menu when logging into AVD f...
> Source: OneNote | ID: avd-onenote-088 | Score: 6.5

**Symptom**: MSIX app not appearing in Start Menu when logging into AVD full desktop session after RemoteApp use. Repro steps: assign both RemoteApp (MSIX) and Desktop to same user on single session host → login desktop (no app in start menu) → logoff → login RemoteApp (app opens) → logoff RemoteApp → login desktop (app appears) → logoff → login desktop again (app gone again).

**Root Cause**: MSIX on-demand registration race condition in shared session host pool. When user first logs into full desktop, MSIX packages are registered on-demand but the AppxDeploymentServer registration/deregistration cycle between RemoteApp and Desktop sessions causes the package to not be properly staged. GetAppAttachPackagesToStage returns numberOfPackages:0 during health check after RemoteApp deregistration, preventing proper re-staging on next desktop login.

**Solution**: Under investigation. Workaround: ensure MSIX packages are assigned to separate host pools for RemoteApp vs Desktop, or use dedicated session hosts. Check AppxDeploymentServer event log (Microsoft-Windows-AppXDeploymentServer%4Operational.evtx) and Kusto RDOperation table for RegisterMsixPackages/DeregisterMsixPackages events to trace the registration lifecycle.

> 21V Mooncake: Applicable

#### Entry 17: MSIX App Attach fails: No MSIX Packages could be retrieved f...
> Source: ContentIdea | ID: avd-contentidea-kb-031 | Score: 6.5

**Symptom**: MSIX App Attach fails: No MSIX Packages could be retrieved from the image Path. Type1: Access Denied. Type2: untrusted signature.

**Root Cause**: Type1: Computer account lacks share permissions. Type2: App signature is untrusted, disk mounts then dismounts.

**Solution**: Type1: Add computer account with Read permission on share (Azure Files: Storage File Data SMB Share Reader role). Type2: Import app Publisher Certificate under Trusted People.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
