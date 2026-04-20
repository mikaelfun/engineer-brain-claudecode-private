# AVD AVD Windows App 客户端 - 杂项 - Comprehensive Troubleshooting Guide

**Entries**: 12 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Remote Desktop client (MSI and Store versions) end of support timeline... | Microsoft is retiring Remote Desktop client in favor of Windows App. S... | Migrate to Windows App. For Mooncake: MSI version will continue to be ... |
| Windows App (Unified client) crashes or closes by itself with no error... | Critical URLs required by Windows App are blocked by proxy/VPN/firewal... | 1) Collect Windows App logs from C:Users{username}AppDataLocalTempDiag... |
| Need to configure auto-update settings for MSI-based Remote Desktop Cl... |  | Configuration of Auto Updates for the MSI Desktop Client - see ADO wik... |
| The customer is experiencing issues with the Azure Virtual Desktop (AV... | Client      Type and Version Discrepancies:&nbsp;The discrepancies in ... | Clarify      Client Type and Version Reporting:      Use       the pro... |
| Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections via Windows... | For Windows App version 2.0.420.0 and below, MSRDC not sending the cor... | Pull request (PR) for adding correct error message with session lock (... |
| After updating a Windows App, the following error prevents it from lau... | This issue occurs when the Microsoft Account Sign-in Assistant service... | Follow these steps to resolve the issue by setting the startup type of... |
| Windows app is crashing when starting up on specific machine. The user... | Taking a dump of the Windows App shows an issue to open the Health Che... | a) Ensure to put back the correct settings for the user environment va... |
| Abstract  An issue was observed in which copy-and-paste functionality ... |  | In Windows App (Web) version 2.0.03267.1373, disabling the Keyboard sh... |
| A user tries to sign in on Windows App. The following error message ap... | The client network does not allow all required URLs. Required FQDNs an... | Allow all required URLs as described in the following document. Requir... |
| Non persistent VDI environment accessing internet based remote managem... | Actual cause was not determined but appears to be problem with using R... | Utilized Windows App to connect to AVD VDI which resolved recognizing ... |
| Users might experience the following symptoms while using the&nbsp;Win... | This issue happens due to a code defect in the UDP transport handler o... | The issue can be temporarily mitigated by disabling tracing, which is ... |
| Windows key remains held in local session after pressing Ctrl+Win+L fo... | Known Windows limitation: when using Win key, certain key combinations... | Release L or Win key before the Ctrl key when pressing Ctrl+Win+L; alt... |

### Phase 2: Detailed Investigation

#### Entry 1: Remote Desktop client (MSI and Store versions) end of suppor...
> Source: OneNote | ID: avd-onenote-019 | Score: 8.5

**Symptom**: Remote Desktop client (MSI and Store versions) end of support timeline for Mooncake. Customers need to migrate to Windows App

**Root Cause**: Microsoft is retiring Remote Desktop client in favor of Windows App. Store version EOL: May 27, 2025. MSI version EOL extended to September 28, 2026 for Mooncake (previously March 27, 2026). MSI retirement deferred until Windows App fully supports Mooncake

**Solution**: Migrate to Windows App. For Mooncake: MSI version will continue to be supported until Windows App is fully supported in China cloud. Check Azure Health notification 8Q5F-800 for latest timeline. Legacy macOS Remote Desktop available from App Store or App Center

> 21V Mooncake: Applicable

#### Entry 2: Windows App (Unified client) crashes or closes by itself wit...
> Source: ADO Wiki | ID: avd-ado-wiki-016 | Score: 8.0

**Symptom**: Windows App (Unified client) crashes or closes by itself with no errors - either immediately or after 3-4 minutes

**Root Cause**: Critical URLs required by Windows App are blocked by proxy/VPN/firewall: go.microsoft.com and query.prod.cms.rt.microsoft.com

**Solution**: 1) Collect Windows App logs from C:Users{username}AppDataLocalTempDiagOutputDirWindows365Logs. 2) Open Windows365-WebView-instance.log, scroll to bottom, find failing HttpRequests. 3) Match the thread number of the failure with the thread number of the URL request. 4) Look for retry count going up (0/5 → 1/5 → 2/5) as confirmation of network block. 5) Have customer unblock/bypass the failing URLs from proxies/VPNs/firewalls

> 21V Mooncake: Applicable

#### Entry 3: Need to configure auto-update settings for MSI-based Remote ...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r8-003 | Score: 7.0

**Symptom**: Need to configure auto-update settings for MSI-based Remote Desktop Client (MSRDC)

**Root Cause**: 

**Solution**: Configuration of Auto Updates for the MSI Desktop Client - see ADO wiki page (screenshot-based guide) at sourceUrl

> 21V Mooncake: Applicable

#### Entry 4: The customer is experiencing issues with the Azure Virtual D...
> Source: ContentIdea | ID: avd-contentidea-kb-104 | Score: 6.5

**Symptom**: The customer is experiencing issues with the Azure Virtual
Desktop (AVD) client type usage information. Specifically, they are unable to
accurately monitor which types of Remote Desktop App clients are being used by
their thousands of users. The outputs from various queries, such as AVD Insight
and KQL queries, are showing different results, which is causing confusion.
Additionally, the customer has observed that the automatic update for the
Windows App is not functioning correctly, even though the Microsoft Store is
not blocked in their environment

**Root Cause**: Client
     Type and Version Discrepancies:&nbsp;The discrepancies in the client
     type and version information arise because different client tools report
     different versions. For example, the Windows App from the Microsoft Store
     and the Windows App Web Browser report different versions, leading to
     inconsistent results in the queries&nbsp;  
 Automatic
     Update Issues:&nbsp;The automatic update for the Windows App is not
     happening as expected. This could be due to issues with the store
     functionality, even though the Microsoft Store is not blocked in the
     customer's environment&nbsp;

**Solution**: Clarify
     Client Type and Version Reporting: 
 
  Use
      the provided Kusto query to get clarity on the Windows App version used
      in AVD connection history for failures and successes. This query helps
      identify the MSRDCVersion and MainAppVersion for different client
      types&nbsp;     
 
  Ensure
      that the columns in the query are renamed to make it easier to read which
      version corresponds to which client type&nbsp; 
   
 Address
     Automatic Update Issues: 
 
  Verify
      that the Microsoft Store is functioning correctly in the customer's
      environment. If the store apps are not auto-updating, raise a support
      case with the Windows OS Team to investigate the store
      functionality&nbsp; 
   
 
  Refer
      to the Windows App product documentation page for instructions on
      manually updating the Windows App if automatic updates are not
      happening&nbsp;   By following these steps, the customer can
achieve accurate monitoring of client types and versions and ensure that the
Windows App is updated correctly.

> 21V Mooncake: Applicable

#### Entry 5: Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections v...
> Source: ContentIdea | ID: avd-contentidea-kb-115 | Score: 6.5

**Symptom**: Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections via Windows App would report error message&nbsp;&quot;You have been disconnected because another connection was made to the remote PC&quot; when session lock (or session idle time out), network drop or restart the remote machine:

**Root Cause**: For Windows App version 2.0.420.0 and below, MSRDC not sending the correct disconnect code to Windows App. MSRDC does not refer the correct code TS_ERRINFO_IDLE_TIMEOUT, TS_ERRINFO_SESSION_LOCKED, TS_ERRINFO_DISCONNECTED_BY_OTHERCONNECTION for different scenarios.

**Solution**: Pull request (PR) for adding correct error message with session lock (including session idle time out), referring the protocol independent codes. The fix is expected in Windows App version&nbsp;2.0.500.0+  Expected message for session lock (session idle time out):

> 21V Mooncake: Applicable

#### Entry 6: After updating a Windows App, the following error prevents i...
> Source: ContentIdea | ID: avd-contentidea-kb-121 | Score: 6.5

**Symptom**: After updating a Windows App, the following error prevents it from launching:Error message The service cannot be started, either because it is disabled or because it has no enabled devices associated with it.  The issue occurs for all users and persists even after reinstalling the app.

**Root Cause**: This issue occurs when the Microsoft Account Sign-in Assistant service (`wlidsvc`) is set to [Disabled] as its startup type.

**Solution**: Follow these steps to resolve the issue by setting the startup type of the service back to [Manual]: Sign in to the affected environment with a user account that has administrator privileges. Open the Services management tool by typing&nbsp;services.msc&nbsp;in the search bar and pressing Enter.Locate the&nbsp;Microsoft Account Sign-in Assistant&nbsp;service in the list and double-click it to open its properties.In the&nbsp;General&nbsp;tab, change the&nbsp;Startup type&nbsp;to [Manual].Click&nbsp;OK&nbsp;to apply the changes.Restart the operating system as a precaution.After restarting, try launching the Windows App and verify if the issue is resolved.

> 21V Mooncake: Applicable

#### Entry 7: Windows app is crashing when starting up on specific machine...
> Source: ContentIdea | ID: avd-contentidea-kb-138 | Score: 6.5

**Symptom**: Windows app is crashing when starting up on specific machine. The user experience is this: customer click on the Windows App (Windows365.exe) Nothing happens. =&gt;The app does not launch because it crashed.  Crash is visible in the application logs : Error	1/21/2026 5:56:16 AM	Application Error	1000	Application Crashing Events Faulting application name: Windows365.exe, version: 2.0.916.0, time stamp: 0x69541063Faulting module name: ucrtbase.dll, version: 10.0.26100.7623, time stamp: 0x53a0792e Exception code: 0xc0000409 Fault offset: 0x00000000000a4ace Faulting process id: 0x1694 Faulting application start time: 0x1DC8ADDB596E097 Faulting application path: C:\Program Files\WindowsApps\MicrosoftCorporationII.Windows365_2.0.916.0_x64__8wekyb3d8bbwe\Windows365.exe Faulting module path: C:\WINDOWS\System32\ucrtbase.dll Report Id: 192f0a43-f7da-4c59-b044-6befa3a422ed Faulting package full name: MicrosoftCorporationII.Windows365_2.0.916.0_x64__8wekyb3d8bbwe Faulting package-relative application ID: Windows365

**Root Cause**: Taking a dump of the Windows App shows an issue to open the Health Check log on startup of the Windows App (see More Information section).  The cause has 2 factors : customer has changed the TEMP and TMP user environement variables to a different location than the default The user does not have permissions on the new location.

**Solution**: a) Ensure to put back the correct settings for the user environment variable TEMP and TMP. Here are the correct settings:     b) OR another possibility is to have the user have access to the new location if you set a new location for TEMP or TMP in User Environement Variables.

> 21V Mooncake: Applicable

#### Entry 8: Abstract  An issue was observed in which copy-and-paste func...
> Source: ContentIdea | ID: avd-contentidea-kb-140 | Score: 6.5

**Symptom**: Abstract  An issue was observed in which copy-and-paste functionality fails when using the Windows App (Web) in full-screen mode on macOS with the Chrome browser to access Azure Virtual Desktop (AVD).While content copied on the local macOS client cannot be pasted into the AVD session in full-screen mode, the issue does not occur in windowed mode, and paste functionality continues to work after returning to full-screen once a paste has been performed. This behavior is unintended and was confirmed by the development team. Workaround is to Disabe [Keyboard shortcuts] setting this option at Windows App version&nbsp;&nbsp;2.0.03267.1373. Further investigation is ongoing to determine whether the issue can be fully resolved with keyboard shortcuts enabled. Additional details are tracked in the related ICM incident.  Symptoms **Steps to Reproduce:** 1. &nbsp;On macOS, open Chrome browser and connect to Windows App&nbsp; 2. &nbsp;Connect to a desktop in the AVD environment. 3. &nbsp;Switch to full-screen mode. 4. &nbsp;Copy content on macOS (the client machine). 5. &nbsp;Attempt to paste into the AVD environment in full-screen mode (step 3). 6. &nbsp;Confirm that paste does not work. &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; **Shortcut key used:**  (Command) + V. &nbsp; &nbsp; &nbsp; Right-click paste also reproduces the issue. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;The following behavior was observed: * &nbsp; **Full Screen:** Right-click paste and shortcut paste are not possible. * &nbsp; **Window Mode:** Right-click paste (_) and shortcut paste are possible._ &nbsp; &nbsp; &nbsp; _(_) Until the shortcut paste is performed, right-click paste cannot be executed.

**Root Cause**: 

**Solution**: In Windows App (Web) version 2.0.03267.1373, disabling the Keyboard shortcuts option in the settings enables copyandpaste functionality and serves as an effective workaround for this issue. Red marked setting in attached image is it.&nbsp;Whether this issue can be resolved while keeping Keyboard shortcuts enabled is currently under investigation by the development team as of January 26, 2026.
For further details, please refer to the attached ICM.

> 21V Mooncake: Applicable

#### Entry 9: A user tries to sign in on Windows App. The following error ...
> Source: ContentIdea | ID: avd-contentidea-kb-141 | Score: 6.5

**Symptom**: A user tries to sign in on Windows App. The following error message appears.&quot;No Network Connection&quot;Please check your network settings and try again.  In Windows App Log, we can see the following trace, which indicates that some required endpoints may not be reachable.&nbsp;Log Folder: \%TEMP%\DiagOutputDir\Windows365\LogsIn this example, it's the Entra ID-related URLs.[2025-10-14 18:20:03.550] [async_logger]&nbsp;[error]&nbsp;[MSAL:0001] &nbsp; &nbsp;ERROR&nbsp;&nbsp; ErrorInternalImpl:134&nbsp;&nbsp; Created an&nbsp;error:&nbsp;4qm49, StatusInternal::NoNetwork, InternalEvent::None,&nbsp;Error&nbsp;Code -2146697211, Context&nbsp;'' [2025-10-14 18:20:03.551] [async_logger]&nbsp;[error]&nbsp;[OneAuth:0001:Error:4qm49:0df86f49] (Code:2603) The network is offline.    Note: This issue can be reproduced 100 %. If the issue is intermittent, it might be in a different scenario.&nbsp; OneAuth Error Code&nbsp;2603&nbsp; Learnings From ICMs - Overview

**Root Cause**: The client network does not allow all required URLs. Required FQDNs and endpoints for Azure Virtual Desktop - Azure Virtual Desktop | Microsoft Learn  This is usually caused by customers proxy&nbsp;setting (either wininet/winhttp) so make sure the customer's network is configured to allow all required URLs.

**Solution**: Allow all required URLs as described in the following document. Required FQDNs and endpoints for Azure Virtual Desktop - Azure Virtual Desktop | Microsoft Learn  Make sure all required URLs described in the &quot;important&quot; section including &quot;&nbsp;Microsoft Entra ID, Office 365, custom DNS providers, or time services&quot; are all allowed in the client network.

> 21V Mooncake: Applicable

#### Entry 10: Non persistent VDI environment accessing internet based remo...
> Source: ContentIdea | ID: avd-contentidea-kb-143 | Score: 6.5

**Symptom**: Non persistent VDI environment accessing internet based remote management consoles which has a virtual keyboard and the virtual keyboard works well on the Windows 10 AVD non persistent VDI but virtual keyboard doesn't work on the Windows 11 AVD VDI host.    Customer was using RDP method for connecting to AVD VDI.

**Root Cause**: Actual cause was not determined but appears to be problem with using RDP method for connection having problem recognizing keystrokes as opposed to a cloud-based method for connection to AVD desktop which was then connecting to web-based 3rd party management consoles. Hypothesis is it just needed a cloud-based method for connecting to AVD in order for the keystrokes to be recognized with an internet-based management console.&nbsp;

**Solution**: Utilized Windows App to connect to AVD VDI which resolved recognizing keystrokes with internet-based management type consoles.&nbsp;&nbsp;

> 21V Mooncake: Applicable

#### Entry 11: Users might experience the following symptoms while using th...
> Source: ContentIdea | ID: avd-contentidea-kb-146 | Score: 6.5

**Symptom**: Users might experience the following symptoms while using the&nbsp;Windows App in an Azure Virtual Desktop session:  The initial connection works, but becomes increasingly slow over time Process msrdc.exe consumes increasingly more CPU and memory     The session becomes unstable, sometimes pausing and showing message: &quot;Connection paused. Waiting for network to restore...&quot;    The issue is aggravated when performing high RDP traffic activities, such as scrolling through images or playing videos    A memory dump of msrdc.exe with UST (User Stack Trace) enabled contains the following allocation signature:  0:000&gt; !exts.heap -s&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Process &nbsp; &nbsp;Total &nbsp; &nbsp; &nbsp;Total&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Global &nbsp; &nbsp; Heap Reserved &nbsp;Committed&nbsp; &nbsp; Heap Address &nbsp;Signature &nbsp; &nbsp;Flags &nbsp; &nbsp; List &nbsp; &nbsp;Bytes &nbsp; &nbsp; &nbsp;Bytes&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Index &nbsp; &nbsp; &nbsp;(K) &nbsp; &nbsp; &nbsp; &nbsp;(K)&nbsp; &nbsp; &nbsp;29376000000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp;5138432 &nbsp; &nbsp;3631036&lt;--- ~3.6 GB&nbsp; &nbsp; &nbsp;29376400000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 2048 &nbsp; &nbsp; &nbsp; &nbsp; 20&nbsp; &nbsp; &nbsp;29376600000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 6144 &nbsp; &nbsp; &nbsp; 3872&nbsp; &nbsp; &nbsp;29376800000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 2048 &nbsp; &nbsp; &nbsp; &nbsp; 96&nbsp; &nbsp; &nbsp;29376d00000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 4096 &nbsp; &nbsp; &nbsp; &nbsp;896&nbsp; &nbsp; &nbsp;29380200000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 2048 &nbsp; &nbsp; &nbsp; &nbsp;104&nbsp; &nbsp; &nbsp;293aed00000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 2048 &nbsp; &nbsp; &nbsp; &nbsp; 76&nbsp; &nbsp; &nbsp;293aef00000 &nbsp; ddeeddee 20000020 &nbsp; &nbsp; &nbsp; &nbsp;0 &nbsp; &nbsp; 2048 &nbsp; &nbsp; &nbsp; &nbsp; 440:000&gt; !uiext.idallocs /h:29376000000 /t20------------------------------------------------------------------------------Count &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Size &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;Total &nbsp; &nbsp; &nbsp;Requested &nbsp;Type [Heap:0000029376000000]----------- ----------- -------------- -------------- &nbsp;---------------------------------------------&nbsp; &nbsp; &nbsp; 9,176 &nbsp; &nbsp; &nbsp; 1,136 &nbsp; &nbsp; 11,157,984 &nbsp; &nbsp; 10,423,936 &nbsp;UNKNOWN-1136&nbsp; &nbsp; &nbsp;16,980 &nbsp; &nbsp; &nbsp; &nbsp; 632 &nbsp; &nbsp; 11,682,256 &nbsp; &nbsp; 10,731,360 &nbsp;UNKNOWN-632&nbsp; &nbsp; 122,055 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;48 &nbsp; &nbsp; 11,717,280 &nbsp; &nbsp; &nbsp;5,858,640 &nbsp;rdclientax!RdpWinRadcHttpRequest::RdpXRadcHttpRequestTask&nbsp; &nbsp; 132,743 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;64 &nbsp; &nbsp; 14,867,344 &nbsp; &nbsp; &nbsp;8,495,552 &nbsp;UNKNOWN-64&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 1 &nbsp;16,400,000 &nbsp; &nbsp; 16,400,384 &nbsp; &nbsp; 16,400,000 &nbsp;UNKNOWN-16400000&nbsp; &nbsp; 273,212 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;16 &nbsp; &nbsp; 17,485,632 &nbsp; &nbsp; &nbsp;4,371,392 &nbsp;UNKNOWN-16&nbsp; &nbsp; &nbsp;17,367 &nbsp; &nbsp; &nbsp; 1,328 &nbsp; &nbsp; 24,452,736 &nbsp; &nbsp; 23,063,376 &nbsp;UNKNOWN-1328&nbsp; &nbsp; 386,687 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;32 &nbsp; &nbsp; 30,935,136 &nbsp; &nbsp; 12,373,984 &nbsp;UNKNOWN-32&nbsp; &nbsp; 132,593 &nbsp; &nbsp; &nbsp; &nbsp; 208 &nbsp; &nbsp; 33,943,888 &nbsp; &nbsp; 27,579,344 &nbsp;UNKNOWN-208&nbsp; &nbsp; &nbsp;25,446 &nbsp; &nbsp; &nbsp; 1,280 &nbsp; &nbsp; 34,199,424 &nbsp; &nbsp; 32,570,880 &nbsp;UNKNOWN-1280&nbsp; &nbsp; 122,160 &nbsp; &nbsp; &nbsp; &nbsp; 240 &nbsp; &nbsp; 35,182,128 &nbsp; &nbsp; 29,318,400 &nbsp;ntdll!_TP_WORK&nbsp; &nbsp; &nbsp;29,743 &nbsp; &nbsp; &nbsp; 1,296 &nbsp; &nbsp; 39,974,592 &nbsp; &nbsp; 38,546,928 &nbsp;UNKNOWN-1296&nbsp; &nbsp; 122,055 &nbsp; &nbsp; &nbsp; &nbsp; 280 &nbsp; &nbsp; 41,010,480 &nbsp; &nbsp; 34,175,400 &nbsp;rdclientax!RdpWinRadcHttpRequest&nbsp; &nbsp; 259,794 &nbsp; &nbsp; &nbsp; &nbsp; 112 &nbsp; &nbsp; 41,567,088 &nbsp; &nbsp; 29,096,928 &nbsp;UNKNOWN-112&nbsp; &nbsp; 258,568 &nbsp; &nbsp; &nbsp; &nbsp; 144 &nbsp; &nbsp; 49,645,072 &nbsp; &nbsp; 37,233,792 &nbsp;UNKNOWN-144&nbsp; &nbsp; &nbsp;41,929 &nbsp; &nbsp; &nbsp; 1,152 &nbsp; &nbsp; 50,985,664 &nbsp; &nbsp; 48,302,208 &nbsp;UNKNOWN-1152&nbsp; &nbsp; 371,409 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;96 &nbsp; &nbsp; 53,482,928 &nbsp; &nbsp; 35,655,264 &nbsp;UNKNOWN-96&nbsp; &nbsp; 640,582 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;48 &nbsp; &nbsp; 61,495,888 &nbsp; &nbsp; 30,747,936 &nbsp;UNKNOWN-48&nbsp; &nbsp; 109,340 &nbsp; &nbsp; &nbsp; &nbsp; 864 &nbsp; &nbsp; 99,718,128 &nbsp; &nbsp; 94,469,760 &nbsp;UNKNOWN-864&nbsp; &nbsp; 122,055 &nbsp; &nbsp; &nbsp;21,784 &nbsp;2,667,634,080 &nbsp;2,658,846,120 &nbsp;rdclientax!utl::_RefCountVtable&lt;utl::_RefCountStored&lt;EventHubUploaderHttpManager::HostMessage,utl::allocator&lt;int&gt;,0&gt;,0&gt;----------- ----------- -------------- -------------- &nbsp;---------------------------------------------&nbsp; 3,641,745 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;3,552,529,968 &nbsp;3,369,864,715 &nbsp;Entire Heap&nbsp; 3,193,895 &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;3,347,538,112 &nbsp;3,188,261,200 &nbsp;Matches (94.2%)0:000&gt; !uiext.idallocs /h:29376000000 /z:21784 /kgc&lt;snip&gt;Count: 28,810, Size: 629,671,360 bytes&nbsp; 00007ffde143b80c ntdll!RtlpCallInterceptRoutine+0x2ac&nbsp; 00007ffde1479f28 ntdll!RtlpHpAllocateHeapSlow+0x728&nbsp; 00007ffde143c581 ntdll!RtlAllocateHeap+0x3b1&nbsp; 00007ffd3de7bcd8 rdclientax!_malloc_base+0x44&nbsp; 00007ffd3de6097f rdclientax!operator new+0x1f&nbsp; 00007ffd3de62241 rdclientax!operator new+0x9&nbsp; 00007ffd3dd81374 rdclientax!EventHubUploaderHttpManager::SendMessageInternal+0x804&nbsp; 00007ffd3dd80a9e rdclientax!EventHubUploaderHttpManager::SendMessageW+0x13e&nbsp; 00007ffd3dd7bbd8 rdclientax!EventHubUploaderCore::UploadClientLog+0x268&nbsp; 00007ffd3dbf1330 rdclientax!RDmiDiagnosticsCore::UploadClientLogsToEH+0x3d0&nbsp; 00007ffd3dbe010a rdclientax!ConnectionDiagnostics::LogClientEventOrError+0x16a&nbsp; 00007ffd3dbdff04 rdclientax!ConnectionDiagnostics::LogClientEventOrError+0x164&nbsp; 00007ffd3d7a3c53 rdclientax!LogClientEvent+0x153&nbsp; 00007ffd3d7e6c36 rdclientax!&lt;lambda_6c457adf0bd329d0f11846a9e5e5ba86&gt;::&lt;lambda_invoker_cdecl&gt;+0x86&nbsp; 00007ffd5a5ad130 rdpnanoTransport!Microsoft::RdpNano::`anonymous namespace'::CustomLogger::LogEvent+0x100&nbsp; 00007ffd5a32a6a8 rdpnanoTransport!Microsoft::Basix::TraceNormal::LogInterface::operator()&lt;boost::container::small_vector&lt;std::shared_ptr&lt;Microsoft::Basix::Instrumentation::EventLogger&gt;,4,void,void&gt; const &amp;&gt;+0xc4&nbsp; 00007ffd5a45b3f2 rdpnanoTransport!Microsoft::Basix::Instrumentation::TraceManager::TraceMessage&lt;Microsoft::Basix::TraceNormal,unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64,unsigned __int64&gt;+0x16e&nbsp; 00007ffd5a45f31e rdpnanoTransport!Microsoft::Basix::Dct::Rcp::UDPFlowCtlInbound::ProcessAckOfAcks+0x196&nbsp; 00007ffd5a3c99c2 rdpnanoTransport!Microsoft::Basix::Dct::Rcp::CUDPRateController::OnDataReceived+0x1c2&nbsp; 00007ffd5a3dc963 rdpnanoTransport!Microsoft::Basix::Dct::DCTBaseChannelImplNoProp::FireOnDataReceived+0xcf&nbsp; 00007ffd5a584b0b rdpnanoTransport!RdpUdpTransportAdapter::OnDataReceived+0x9cb&nbsp; 00007ffd5a616b6a rdpnanoTransport!Microsoft::RdpNano::IceWrapperImpl::OnDataReceived+0x8a&nbsp; 00007ffd5a3dc963 rdpnanoTransport!Microsoft::Basix::Dct::DCTBaseChannelImplNoProp::FireOnDataReceived+0xcf&nbsp; 00007ffd5a4c4198 rdpnanoTransport!Microsoft::Basix::Dct::SmilesV3::OnDataReceived+0x3af8&nbsp; 00007ffd5a4c0604 rdpnanoTransport!Microsoft::Basix::Dct::LinkDataV3::OnDataReceived+0xc4&nbsp; 00007ffd5a3dc963 rdpnanoTransport!Microsoft::Basix::Dct::DCTBaseChannelImplNoProp::FireOnDataReceived+0xcf&nbsp; 00007ffd5a44b619 rdpnanoTransport!Microsoft::Basix::Dct::ICECore::ReceiveForLinks+0x229&nbsp; 00007ffd5a436361 rdpnanoTransport!Microsoft::Basix::Dct::ICECore::CandidateBase::HandleDataReceived+0x17e5&nbsp; 00007ffd5a436149 rdpnanoTransport!Microsoft::Basix::Dct::ICECore::CandidateBase::HandleDataReceived+0x15cd&nbsp; 00007ffd5a44352c rdpnanoTransport!Microsoft::Basix::Dct::ICECore::CandidateBase::OnDataReceived+0xcc&nbsp; 00007ffd5a3e1082 rdpnanoTransport!Microsoft::Basix::Dct::ChannelThreadQueue::ThreadedProcess+0x342&nbsp; 00007ffd5a51fcda rdpnanoTransport!Microsoft::Basix::Pattern::IThreadedObject::ThreadProcedure+0x5ba

**Root Cause**: This issue happens due to a code defect in the UDP transport handler of the Windows App. The issue is currently being investigated in the following bug:  Bug 60104911 Memory Leak in rdpnanoTransport!Microsoft::Basix::Instrumentation::TraceManager::TraceMessage

**Solution**: The issue can be temporarily mitigated by disabling tracing, which is done by adding the following value to the registry:  DisableEHUpload_&lt;ClientVersion&gt;  *The ClientVersion can be obtained in the &quot;About&quot; section of the Windows App.  For example:  reg.exe add &quot;HKLM\SOFTWARE\Microsoft\Terminal Server Client\Default&quot; /v DisableEHUpload_1.2.6980.0 /t REG_DWORD /d 1 /f However, it only lasts until the app is updated to the next version.

> 21V Mooncake: Applicable

#### Entry 12: Windows key remains held in local session after pressing Ctr...
> Source: MS Learn | ID: avd-mslearn-068 | Score: 4.5

**Symptom**: Windows key remains held in local session after pressing Ctrl+Win+L for live captions in AVD remote session and returning to local desktop

**Root Cause**: Known Windows limitation: when using Win key, certain key combinations are locked to prevent overriding Win+L; releasing Win key last after Ctrl+Win+L causes Win key to stay held in local session

**Solution**: Release L or Win key before the Ctrl key when pressing Ctrl+Win+L; alternatively start live captions from the Start menu instead of keyboard shortcut

> 21V Mooncake: Not verified

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
