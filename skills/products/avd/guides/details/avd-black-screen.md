# AVD AVD 黑屏 - Issue Details

**Entries**: 10 | **Type**: Quick Reference only
**Generated**: 2026-04-07

---

## Issues

### 1. Black screen after Windows Login on Windows 365 Boot device - user logs in and sees black screen wit...
- **ID**: `avd-ado-wiki-076`
- **Source**: ADO Wiki | **Score**: 🟢 9.0
- **Root Cause**: Boot policy misconfiguration: Boot-to-Cloud fails so user stays local, but Lightweight shell policy applies which prevents local shell from loading. Typically OS edition mismatch or outdated Windows App/HostApp versions.
- **Solution**: 1) Validate Intune policy assignments: Enable Windows 365 Boot Desktop = Enabled, Override Shell Program = Apply Lightweight shell. 2) Confirm OS edition: Windows 11 Pro/Enterprise. 3) Ensure app versions: Windows App >= 2.0.285, HostApp >= 1.2.4159. 4) If unresolved: Reimage device or reapply Boot guided scenario.
- **Tags**: w365-boot, black-screen, boot-policy, lightweight-shell

### 2. AVD user sees black screen after login followed by error message. Session host shows upgrading statu...
- **ID**: `avd-onenote-048`
- **Source**: OneNote | **Score**: 🟢 8.5
- **Root Cause**: Session host VM stuck in upgrading state after RD Agent auto-update did not complete properly, leaving VM in transitional state rejecting connections
- **Solution**: Restart the affected VM to trigger re-check of WVD agent status. VM returns to Available after restart. Use Kusto DiagActivity query by UPN to identify upgrading state
- **Tags**: black-screen, upgrading, agent-update, restart, connection-failure

### 3. AVD/RDS session host experiences server hang, slow performance, slow logons, black screen on login, ...
- **ID**: `avd-ado-wiki-b-r3-004`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: Firewall rules accumulate in AppIso and IfIso registry keys over time when many different users log on regularly. Affects Windows Server 2016/2019 RDS/AVD servers and Windows 10/11 multi-session AVD VMs.
- **Solution**: Phase 1: Enable GPO "Delete cached copies of roaming profiles" to prevent future accumulation. Phase 2: Download FWCLEAN tools from https://aka.ms/fwclean and run on affected servers to clean up leftover firewall rules. Consider scheduling periodic cleanup.
- **Tags**: firewall-policy, registry-bloat, performance, slow-logon, black-screen, session-host

### 4. CTRL+ALT+DEL and CTRL+ALT+END keyboard shortcuts trigger on Cloud PC instead of the remote server in...
- **ID**: `avd-ado-wiki-a-r3-004`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: By design, keyboard shortcuts like CTRL+ALT+DEL do not propagate through nested RDP sessions. See: https://learn.microsoft.com/en-us/windows/win32/termserv/terminal-services-shortcut-keys
- **Solution**: On the destination remote server, create a shortcut: C:\Windows\explorer.exe shell:::{2559a1f2-21d7-11d4-bdaf-00c04f60b9f0} and assign a custom shortcut key (e.g., CTRL+ALT+A). Also set the .RDP file keyboard setting to 'On the remote computer'. Shortcut must be created manually on each server (copy-paste does not carry the key combo).
- **Tags**: connectivity, nested-rdp, keyboard-shortcuts, by-design

### 5. Black screen then disconnect. Error 0x10b or 0x3 (CreateInputDevicesError). Winlogon Event ID 4005. ...
- **ID**: `avd-ado-wiki-a-r11-007`
- **Source**: ADO Wiki | **Score**: 🔵 7.5
- **Root Cause**: DeviceInstallation CSP policies (PreventInstallationOfMatchingDeviceIDs etc.) deployed via Intune prevent RDP input device creation (keyboard/mouse)
- **Solution**: Get MDM report and GPResults. Identify DeviceInstallation CSP policies on Cloud PCs. Exclude these policies from Cloud PC device groups. Once synced, users can connect normally.
- **Tags**: black-screen, winlogon-4005, device-installation, input-devices, 0x10b, 0x3

### 6. Intermittently black screen appears and session disconnects. Winlogon termination 4005 event in appl...
- **ID**: `avd-contentidea-kb-059`
- **Source**: KB | **Score**: 🔵 7.5
- **Root Cause**: Session not terminated completely on logoff. At around 250-260 session IDs, netprofm.dll causes the issue.
- **Solution**: Known issue fixed in 20H1 (2004) and later. For earlier versions, schedule netprofm service restart at regular intervals. Upgrade OS recommended.
- **Tags**: black-screen, winlogon, 4005-event, netprofm.dll, session-leak, contentidea-kb

### 7. Cloud PC shows black screen. RCM process exit in Kusto. Appx/Readiness suspected.
- **ID**: `avd-ado-wiki-a-r11-006`
- **Source**: ADO Wiki | **Score**: 🔵 7.0
- **Root Cause**: AppReadiness tasks timing out during logon causing desktop to fail to render
- **Solution**: Add registry keys: (1) HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\AppReadinessPreShellTimeoutMs=60000 (2) AppReadinessGlobalTimeoutMs=120000 (3) HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\fRunAppReadiness=0. Reboot.
- **Tags**: black-screen, appreadiness, registry, logon

### 8. Azure Virtual Desktop (AVD) users are affected by black screen on logon. While there are many causes...
- **ID**: `avd-contentidea-kb-085`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: A Complete Memory Dump Collected During the re-pro Shows explorer.exe is Stuck at Initialization Explorer Thread that is Stuck 0: kd&gt;!mex.tc
Process                         Thread           UserTime KernelTime COM-Init          Wait Reason Time State
explorer.exe (ffffcc057e7f1340) ffffcc0588fdf080     47ms      172ms ApartmentType_STA UserRequest 78ms Waiting

nt!KiSwapContext+0x76
nt!KiSwapThread+0x500
nt!KiCommitThreadWait+0x14f
nt!KeWaitForMultipleObjects+0x2be
nt!ObWaitForMultipleObjects+0x2f0
win32kfull!xxxMsgWaitForMultipleObjectsEx+0xd9
win32kfull!NtUserMsgWaitForMultipleObjectsEx+0x3fe
win32k!NtUserMsgWaitForMultipleObjectsEx+0x20
nt!KiSystemServiceCopyEnd+0x25
win32u!ZwUserMsgWaitForMultipleObjectsEx+0x14
USER32!RealMsgWaitForMultipleObjectsEx+0x1e
combase!CCliModalLoop::BlockFn+0x18d
combase!ModalLoop+0xa9
combase!ClassicSTAThreadWaitForCall+0xbb
combase!ThreadSendReceive+0x84e                        
combase!CSyncClientCall::SwitchAptAndDispatchCall+0x8df
combase!CSyncClientCall::SendReceive2+0x9d6
combase!SyncClientCallRetryContext::SendReceiveWithRetry+0x25
combase!CSyncClientCall::SendReceiveInRetryContext+0x25
combase!ClassicSTAThreadSendReceive+0xa3
combase!CSyncClientCall::SendReceive+0x18b
combase!CClientChannel::SendReceive+0x84
combase!NdrExtpProxySendReceive+0x4e
RPCRT4!Ndr64pSendReceive+0x2f
RPCRT4!NdrpClientCall3+0x3a4
combase!ObjectStublessClient+0x138
combase!ObjectStubless+0x42
Explorer!AppReadinessTaskStart+0xd1
Explorer!CLogonTaskFramework::s_AppReadinessTaskStart+0xe
Explorer!CLogonTaskFramework::s_AppReadinessPreShellGroupStartMethod+0x14bb68
Explorer!CLogonTaskFramework::_ExecuteTaskFunction+0x22d
Explorer!CLogonTaskFramework::_RunLogonTask+0x82
Explorer!CLogonTaskFramework::_RunLogonOrWaitTask+0x2cd
Explorer!CLogonTaskFramework::_RunLogonTasksInPhase+0x4d0
Explorer!CLogonTaskFramework::_RunPhase+0x45
Explorer!CLogonTaskFramework::RunAllLogonTasks+0x379
Explorer!RunAllLogonTasks+0x35
Explorer!wWinMain+0xa44
Explorer!invoke_main+0x21
Explorer!__scrt_common_main_seh+0x106
KERNEL32!BaseThreadInitThunk+0x14
ntdll!RtlUserThreadStart+0x21
As per this dump, there is a wait chain formed on the machine, which is like Explorer -&gt; AppReadiness -&gt; AppxSVC -&gt; Sihost.exe -&gt; DCOMLaunch.&nbsp; Below thread is waiting for Host Activity Manager (HAM) to terminate a snapshot of all hosts in the specified package (Here is only one application package in the queue).&nbsp; 0: kd&gt; !mex.t ffffcc0573383080
Process                                     Thread           UserTime KernelTime  Wait Reason            Time State
svchost.exe (DcomLaunch) (ffffcc05654170c0) ffffcc0573383080    188ms      359ms  WrAlertByThreadId 3m:56.156 Waiting

Priority:
    Current Base UB FB IO Page
    13      8    80 80 2  5

nt!KiSwapContext+0x76
nt!KiSwapThread+0x500
nt!KiCommitThreadWait+0x14f
nt!KeWaitForAlertByThreadId+0xc4
nt!NtWaitForAlertByThreadId+0x30
nt!KiSystemServiceCopyEnd+0x25
ntdll!ZwWaitForAlertByThreadId+0x14
ntdll!RtlpWaitOnAddressWithTimeout+0x81
ntdll!RtlpWaitOnAddress+0xae
ntdll!RtlWaitOnAddress+0x13
psmserviceexthost!HampHostSnapshotTerminate+0x164
psmserviceexthost!HampPkgTerminate+0x91
psmserviceexthost!HampClientPkgEnableServicing+0x7c
psmserviceexthost!HamSrvEnableServicing+0xa2
RPCRT4!Invoke+0x73
RPCRT4!Ndr64StubWorker+0xb0b
RPCRT4!NdrServerCallAll+0x3c
RPCRT4!DispatchToStubInCNoAvrf+0x18
RPCRT4!RPC_INTERFACE::DispatchToStubWorker+0x1a6
RPCRT4!RPC_INTERFACE::DispatchToStub+0xf8
RPCRT4!LRPC_SBINDING::DispatchToStub+0x1d
RPCRT4!LRPC_SCALL::DispatchRequest+0x31f
RPCRT4!LRPC_SCALL::QueueOrDispatchCall+0x123
RPCRT4!LRPC_SCALL::HandleRequest+0x7f8 
RPCRT4!LRPC_SASSOCIATION::HandleRequest+0x200
RPCRT4!LRPC_ADDRESS::HandleRequest+0x341
RPCRT4!LRPC_ADDRESS::ProcessIO+0x89e
RPCRT4!LrpcIoComplete+0xc2
ntdll!TppAlpcpExecuteCallback+0x260
ntdll!TppWorkerThread+0x456
KERNEL32!BaseThreadInitThunk+0x14
ntdll!RtlUserThreadStart+0x21
 Following are the details about the package. In all cases we worked so far, the application to which HAM is waiting on is Microsoft.AAD.BrokerPlugin. 0: kd&gt; .frame /r 0xa;.echo; !mex.x
0a 000000c8`88d7e670 00007ffd`8d200b7d     psmserviceexthost!HampHostSnapshotTerminate+0x164

000000c8`88d7e6e0 HostSnapshot = 0x000000c8`88d7e710
     TerminateType = 
     TerminateReason = 
     Client = 
     TimeoutMs = 
000000c8`88d7e708 Flags = 0
@ebp              CurrentTimeMs = 0x234f1dd
000000c8`88d7e6a8 Timeout = {140726970862180}
@eax              RemainingTimeMs = 0
@rdi              TerminationBlock = 0x000002bf`21c684c0
@ebx              TerminateEndTimeMs = 0x234f1dc
@rsi              Host = 0x000002bf`211ef890
@edi              HasTimedout = 0x21c684c0
0: kd&gt; !mex.ddt -n Host Application

dt -n Host Application () Recursive: [ -r1-r2 -r ] Verbose dx Normal dt
==================================================================================
Local var @ rsi Type _RM_HAM_ACTIVITY_HOST*
   +0x308 Application              : 0x000002bf`2211eb40 _HAM_APPLICATION

0: kd&gt; !mex.ddt 0x000002bf`2211eb40 psmserviceexthost!_HAM_APPLICATION Package

dt 0x000002bf`2211eb40 psmserviceexthost!_HAM_APPLICATION Package () Recursive: [ -r1 -r2-r ] Verbose Normal dt
==================================================================================
   +0x058 Package                  : 0x000002bf`21e8a940 _HAM_PACKAGE

0: kd&gt; !mex.ddt 0x000002bf`21e8a940 psmserviceexthost!_HAM_PACKAGE Identifier

dt 0x000002bf`21e8a940 psmserviceexthost!_HAM_PACKAGE Identifier () Recursive: [ -r1 -r2-r ] Verbose Normal dt
==================================================================================
   +0x060 Identifier               : _HAM_PACKAGE_INFO

0: kd&gt; !mex.ddt 000002bf21e8a940+0x060 psmserviceexthost!_HAM_PACKAGE_INFO

dt 000002bf21e8a940+0x060 psmserviceexthost!_HAM_PACKAGE_INFO () Recursive: [ -r1 -r2 -r ] Verbose Normal dt
==================================================================================
   +0x000 FamilyName               :  &quot;Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy&quot;
   +0x084 UserSid                  : _RM_SID
   +0x0c8 SessionId                : 0x23 (0n35)
 The Host Activity Manager (HAM) manages packaged (UWP, Centennial, Win32-a-la-carte) applications execution. It supports executing app activities, running in app host processes, managing the resource usage of those hosts including their execution state (running, suspended, terminated, etc.). HAM had requested to change the application status during the very early stage of the login process. Before this thread got into the waiting state, it would queue a work item to change the app state. The worker thread that picks up this work item may have exited because we cannot see such a thread in the DcomLaunch process. Hence, it is not clear what happened to the worker thread.  To debug this further, we need more details. Please follow these steps before reproducing the issue to collect logs: Start the TTD of DcomLaunch. Start the TTD of Explorer. If this is difficult to capture for some reason, then we can collect AdexTrace (step 3). Start AdexTrace (Details are provided in the more information section). Please run the PowerShell script as follows:&nbsp;adextrace.ps1 -start -profiles adexproviders.wprp. Reproduce the issue. Stop the TTD of DcomLaunch and Explorer. Stop AdexTrace by running:&nbsp;adextrace.ps1 -stop From the affected session, please collect the following data:Process dump of sihost.exe of the affected session. Process dump of explorer.exe of the affected session.    However, if we do not know when the issue may occur, we can target one of the AVD machines and enable circular tracing.
- **Solution**: We are tracking this issue in this Bug record (Please do not share this Bug details with Customer): 49315254 Application event log has the following errors logged (this is consistent on all environments where this issue was observed):   Log Name:&nbsp;ApplicationSource:&nbsp;Microsoft-Windows-AppModel-StateDate:&nbsp;06-09-2024 04:53:20Event ID:&nbsp;10Task Category:&nbsp;NoneLevel:&nbsp;ErrorKeywords:User:&nbsp;S-1-5-21-xxxxxxxxx-xxxxxxxxx-xxxxxxxxx-179916Computer:&nbsp;xxxxxxxxxDescription:Failure to load the application settings for package Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy. Error Code: -2147024893 //The system cannot find the path specified.Log Name:&nbsp;ApplicationSource:&nbsp;Microsoft-Windows-AppModel-StateDate:&nbsp;06-09-2024 04:53:20Event ID:&nbsp;23Task Category:&nbsp;NoneLevel:&nbsp;WarningKeywords:User:&nbsp;S-1-5-21-xxxxxxxxx-xxxxxxxxx-xxxxxxxxx-179916Computer:&nbsp;xxxxxxxxxDescription:Triggered repair of state locations because operation Settings Initialize against package Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy hit error -2147009096.//Loading the state store failed.  Looks like this event is related to the black screen issue the users are experiencing. We are investigating this further.    Suggestions on troubleshooting: Application state Store for Microsoft.AAD.BrokerPlugin will be located in the following location:&nbsp;C:\users\AppData\Local\Packages\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\Settings\settings.dat State Registry hive would be loaded in the following Registry location:&nbsp;HKCU\&lt;User SID&gt;\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\SystemAppData\Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy\ Please find out if there are any open handles to this Registry / hive file which is blocking us from loading the file.
- **Tags**: contentidea-kb

### 9. If you are running Windows 10 22H2 in Azure as VDI your user might get stuck for a few minutes in a ...
- **ID**: `avd-contentidea-kb-092`
- **Source**: KB | **Score**: 🔵 6.5
- **Root Cause**: The AppXSvc is crashing. Do you know what it is? Lets ask our good friend Copilot: 
    
       
    
      
    &lt;Copilot&gt;
    
      
    AppXSvc, or the AppX Deployment Service, is responsible for deploying store apps on Windows. Issues with AppXSvc can cause significant problems, such as user logons hanging at a 
    black screen
     for up to 5 minutes and the start menu becoming unresponsive. These issues are often related to deployment requests getting stuck in the AppXSvc queue
    .
     
    
      
    &lt;/Copilot&gt;
    
      
    
      
    As you can see, during the logon, we will try to install / register modern apps for the user. So, if AppXSvc is having a problem, chances are high we end up with a Black screen. 
    
      
    
      
    &lt;Background information on the logon process for the user&gt;
    
      
    If you do want to learn more about the logon process of the user, I can highly recommend the following 
    GEARS
    -Sessions that provides you with a deep dive on Cloud Academy (you do need to login) on this very interesting topic as part of the Windows Performance Foundation: Shell training path: 
    
      
    
      Windows Performance(Perf) Foundation: Shell (Archive) | QA Platform
    
  
  
    I do recommend the following 2 sessions which focusing on the 
    logon process
     for the user
    
      
    
      WIN-35P: Crackin' the Shell - Explorer Initialization, the Desktop, Notifications and Action Center part 1 | QA Platform
    
    
      
    
      WIN-36P - Crackin' the Shell - Explorer Initialization, the Desktop, Notifications and Action Center part 2 | QA Platform
    
    
      
    
      
    But I also recommend to check out the entire learning path as it does contain useful information. 
    
      
    &lt;/Background information on the logon process for the user&gt;
    
      
    
      
    So, getting back to our 
    Black screen 
    issue. This is a known issue and documented externally here: 
    
      
    
      https://learn.microsoft.com/en-us/windows/release-health/status-windows-10-22h2#3421msgdesc
    
    
      
    
      
    And internally here: 
    
      
    
      Servicing: 7D.24: AppXSvc crashes causing black screens on Win10 22H2(ICM 548380823) (KIR)
    
  
  
    It offers you three workarounds: 
    
      
    a.) Install 
    K
    nown 
    I
    ssue 
    R
    ollback (KIR)
    
      
    b.) Install 10D (which will be released 
    today
     (22
    
      nd
    
     of October)) or 11B (which is scheduled for 12
    
      th
    
     of November)
    
      
    c.) Rollback to 7B (which we do not recommend as we would miss out 3 months of security patches)
    
      
    
      
    So, lets talk a bit about KIR: 
    
      
    If I ask 
    CoPilot
    , I am getting the following response: 
    
      
    &lt;Copilot&gt;
    
      
    Known Issue Rollback (KIR) is a Windows Servicing feature that allows for the enabling or disabling of a fix without removing an update. KIR is typically used for non-security code changes contained in Windows Updates. These changes are shipped enabled by default but can be disabled if they introduce a regression. KIRs are managed through local or domain group policy, which configures a registry setting. The KIR activation process involves generating OS-version-specific MSI files that install ADMX files to configure group policy settings.
     
    
      
    &lt;/Copilot&gt;
    
      
    
      
    &lt;Background Information on KIR&gt;
    
      
    We do release several changes as part of our updates. Some of those changes, mostly not security related, are marked as Opt-in or Opt-out for six months, so customers can decide if they want to enable/disable that specific update before it becomes generally activated. One way to accomplish that is our 
    KIR
    -Process. 
    
      
    
      
    When we move forward with the KIR, we offer an ADMX that you can install. Once installed, you will find the policy in the policy definition folder of Windows: 
    
      
    C:\Windows\PolicyDefinitions
    
      
    
      
    If you then open the local group policy editor, you will find the KIR-Policy here: 
    
      
    
      
    
      
    
    
      
    So, in this scenario, for KB5040525, we choose to opt-out of the changes introduced by KB5040525 by setting the policy to disable as documented in 
    
      https://learn.microsoft.com/en-us/windows/release-health/status-windows-10-22h2#3421msgdesc
    
    . 
    
      
    
      
    But what does this mean? Lets try to explain 
    KIR
     briefly with a flow chart with a simplified approach:
    
      
    
      
    We do three steps (Step 1, 2, 3) during an operation. We start with Step 1, which is identical for both code bases. Due to an update, 
    Step 2
     has CHANGED and is now running a different (updated) code base. If we identify that this is causing issues, our PG can release a KIR to offer you the choice to 
    go back 
    to the 
    OLD CODE BASE 
    for Step 2. Step 3 is again the same for both code bases.
     
    
      
     
    
      
     
    
      
    
      
    
      
    
    
      
    
      
    This is accomplished via a special Policy, which can be deployed using local policies or even domain policies. So, once a KIR is deployed and applied, we check it and based on the configuration we will then revert to the old code base if required. 
  
  
    Keep in mind that KIRs are normally well tested and safe. However, depending on the size of the change, 
    KIR
     can introduce you with 
    side effects
    . 
    
      
    
      
    So, when utilizing KIR, make sure to evaluate it before you plan to roll out through your entire configuration. KIR will require you to reboot the device after the policy has been activated. 
  
  
    If you want to learn more about KIR, please see 
    
      Windows Servicing: Understanding Known Issue Rollbacks (KIR)
    
    . 
    
      
    
      
    and 
    
      
    
      KIR - Known Issue Rollback - Overview
    
  
  
    In addition, KIRs are not designed to be a permanent solution and we will be salvaged once we have released the permanent fix via the 
    KIR_Cleanup
     TAG during an update. Once we public announce the resolution, you still want to disable the policy that was activating the KIR. 
    
      
    &lt;/Background Information on KIR&gt;
    
      
     
    
      
    As we have talked about potential side effects, we are also seeing issues with modern Apps in Azure AVD as the AAD Broker is getting stuck. You can identify this by the following event ID: 
    
      
    
      
    
      
    
    
      
    
      
    Event as text: 
    
      
    Log Name:      Application
  
  
    Source:        Microsoft-Windows-AppModel-State
  
  
    Date:          21/10/2024 11:21:57
  
  
    Event ID:      10
  
  
    Task Category: None
  
  
    Level:         Error
  
  
    Keywords:      
  
  
    User:         
    &lt;USER SID&gt;
  
  
    Computer:     xxx
  
  
    Description:
  
  
    Failure to load the application settings for package Microsoft.AAD.BrokerPlugin_cw5n1h2txyewy. Error Code: 
    -2147024893
  
  
    
      
    This error code 
    -2147024893
     translate to ERROR_PATH_NOT_FOUND as you can see on the error translator page at 
    
      https://aka.ms/errors
    
    . 
    
      
    
      
    
      
    
    
      Or you can use the command line version of err.exe which can be found here:&nbsp;Download err.exe: https://www.microsoft.com/en-us/download/details.aspx?id=100432 But what is the AAD Broker? Lets ask again our friend CoPilot: 
    
      
    &lt;CoPilot&gt;
    
      
    The AAD Broker plug-in, also known as Microsoft.AAD.BrokerPlugin.exe, is a component that initiates connections for Azure Active Directory (AAD) operations.&nbsp;
    
      
    &lt;/CoPilot&gt;
  
  
    So, without AAD Broker, we will not be able to authenticate against Azure Active Directory which will have a massive impact on modern apps like Office365 / OneDrive. 
    
      
    
      
    Based on our initial research, we identified a deadlock in the AppXSvc.
    
      
    
      
    Yes, this is the same service that was crashing when we hit the regression in 7D which is documented in our Known issue section for Windows 10  22H2. Once that fix is applied, chances that we hit the Event ID 10 issues are increased as we do not restart the AppXSvc. This is then increasing the chance of getting stuck in the deadlock. 
    
      
    
      
    We are currently investigating this, and as part of the investigation we have created an internal KB for it. 
    
      
    
      PERF: AVD-session host logon black screen + Office SSO failures connection caused by TokenBroker service waiting on AppXSvc to complete the registration of AAD deadlock on Window 10 22H2 multi
    
    
      Action plan to collect data on Event ID 10:&nbsp; 
 
  
  Action plan 
  
 
 
  
  
   
    &nbsp;Increase Size of AppxDeploymentServer
        Operational Event log
                &nbsp; 
    Use this TSS
        command to start after the system got started and it will wait for event ID 10:&nbsp; 
   
   .\TSS.ps1 -PRF_Appx -WaitEvent
   Evt:10:'Application':5:0:AAD/cw5n1h2txyewy:True:OR -NoXperf -NoXray 
   &nbsp; 
   It
   will only stop if we hit EventID 10 and event ID 10 does contain AAD or cw5n1h2txyewy 
   Data collection should be less than 200MB per hour 
   &nbsp; 
  
  
   
    
      
    However, as we are just at the start of the troubleshooting journey, I will talk more about it in a further ShowCaseCSS as this ShowCaseCSS  is focusing on the black screen.
- **Solution**: Apply 10D on Windows 10 22H2 AVD via&nbsp;https://support.microsoft.com/en-us/topic/october-22-2024-kb5045594-os-build-19045-5073-preview-f307a4b0-f62d-4c28-9062-44207aea55c3Please remember to code case against&nbsp;https://microsoft.visualstudio.com/OS/_workitems/edit/53850043&nbsp;if 10D has resolved the issueIn addition, note that it appears that this also helps a little with the second issue (PERF: AVD-session host logon black screen + Office SSO failures connection caused by TokenBroker service waiting on AppXSvc to complete the registration of AAD deadlock on Window 10 22H2 multi) but we are still seeing some incidents. If you want to help, use the Action plan above to collect data.&nbsp;ICM for the second issue:&nbsp;Incident-560255666 Details - IcM
- **Tags**: contentidea-kb

### 10. Black screen on Cloud PC connection followed by disconnection. Error codes 0x10b (ConnectionFailedRe...
- **ID**: `avd-ado-wiki-a-r14-003`
- **Source**: ADO Wiki | **Score**: 🔵 6.0
- **Root Cause**: DeviceInstallation CSP policies (PreventInstallationOfMatchingDeviceIDs, PreventInstallationOfDevicesNotDescribedByOtherPolicySettings, etc.) deployed via Intune block RDP input device creation, causing Winlogon crash.
- **Solution**: Collect MDM report and GPResults. Identify DeviceInstallation CSP policies being delivered to Cloud PCs. Exclude those policies from affected devices or create proper AllowInstallation rules. After policy sync, user should connect without error. Ref: https://learn.microsoft.com/en-us/windows/client-management/mdm/policy-csp-deviceinstallation
- **Tags**: connectivity, black-screen, error-4005, device-installation, intune, csp, w365
