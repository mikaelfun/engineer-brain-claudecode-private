# AVD Windows App 客户端 - 杂项 — Troubleshooting Workflow

**Scenario Count**: 12
**Generated**: 2026-04-18

---

## Scenario 1: Remote Desktop client (MSI and Store versions) end of suppor...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- Migrate to Windows App. For Mooncake: MSI version will continue to be supported until Windows App is fully supported in China cloud. Check Azure Health notification 8Q5F-800 for latest timeline. Legacy macOS Remote Desktop available from App Store or App Center

**Root Cause**: Microsoft is retiring Remote Desktop client in favor of Windows App. Store version EOL: May 27, 2025. MSI version EOL extended to September 28, 2026 for Mooncake (previously March 27, 2026). MSI retirement deferred until Windows App fully supports Mooncake

## Scenario 2: Windows App (Unified client) crashes or closes by itself wit...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Collect Windows App logs from C:Users{username}AppDataLocalTempDiagOutputDirWindows365Logs
- 2) Open Windows365-WebView-instance.log, scroll to bottom, find failing HttpRequests
- 3) Match the thread number of the failure with the thread number of the URL request
- 4) Look for retry count going up (0/5 → 1/5 → 2/5) as confirmation of network block
- 5) Have customer unblock/bypass the failing URLs from proxies/VPNs/firewalls

**Root Cause**: Critical URLs required by Windows App are blocked by proxy/VPN/firewall: go.microsoft.com and query.prod.cms.rt.microsoft.com

## Scenario 3: Need to configure auto-update settings for MSI-based Remote ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Configuration of Auto Updates for the MSI Desktop Client - see ADO wiki page (screenshot-based guide) at sourceUrl

**Root Cause**: None

## Scenario 4: The customer is experiencing issues with the Azure Virtual D...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Clarify
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

## Scenario 5: Azure Virtual Desktop (AVD) and Cloud PC (CPC) connections v...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Pull request (PR) for adding correct error message with session lock (including session idle time out), referring the protocol independent codes. The fix is expected in Windows App version&nbsp;2.0.500.0+  Expected message for session lock (session idle time out):

**Root Cause**: For Windows App version 2.0.420.0 and below, MSRDC not sending the correct disconnect code to Windows App. MSRDC does not refer the correct code TS_ERRINFO_IDLE_TIMEOUT, TS_ERRINFO_SESSION_LOCKED, TS_ERRINFO_DISCONNECTED_BY_OTHERCONNECTION for different scenarios.

## Scenario 6: After updating a Windows App, the following error prevents i...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Follow these steps to resolve the issue by setting the startup type of the service back to [Manual]: Sign in to the affected environment with a user account that has administrator privileges. Open the Services management tool by typing&nbsp;services.msc&nbsp;in the search bar and pressing Enter.Locate the&nbsp;Microsoft Account Sign-in Assistant&nbsp;service in the list and double-click it to open its properties.In the&nbsp;General&nbsp;tab, change the&nbsp;Startup type&nbsp;to [Manual].Click&nbsp;OK&nbsp;to apply the changes.Restart the operating system as a precaution.After restarting, try launching the Windows App and verify if the issue is resolved.

**Root Cause**: This issue occurs when the Microsoft Account Sign-in Assistant service (`wlidsvc`) is set to [Disabled] as its startup type.

## Scenario 7: Windows app is crashing when starting up on specific machine...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- a) Ensure to put back the correct settings for the user environment variable TEMP and TMP. Here are the correct settings:     b) OR another possibility is to have the user have access to the new location if you set a new location for TEMP or TMP in User Environement Variables.

**Root Cause**: Taking a dump of the Windows App shows an issue to open the Health Check log on startup of the Windows App (see More Information section).  The cause has 2 factors : customer has changed the TEMP and TMP user environement variables to a different location than the default The user does not have permissions on the new location.

## Scenario 8: Abstract  An issue was observed in which copy-and-paste func...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- In Windows App (Web) version 2.0.03267.1373, disabling the Keyboard shortcuts option in the settings enables copyandpaste functionality and serves as an effective workaround for this issue. Red marked setting in attached image is it.&nbsp;Whether this issue can be resolved while keeping Keyboard shortcuts enabled is currently under investigation by the development team as of January 26, 2026.
For further details, please refer to the attached ICM.

**Root Cause**: 

## Scenario 9: A user tries to sign in on Windows App. The following error ...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Allow all required URLs as described in the following document. Required FQDNs and endpoints for Azure Virtual Desktop - Azure Virtual Desktop | Microsoft Learn  Make sure all required URLs described in the &quot;important&quot; section including &quot;&nbsp;Microsoft Entra ID, Office 365, custom DNS providers, or time services&quot; are all allowed in the client network.

**Root Cause**: The client network does not allow all required URLs. Required FQDNs and endpoints for Azure Virtual Desktop - Azure Virtual Desktop | Microsoft Learn  This is usually caused by customers proxy&nbsp;setting (either wininet/winhttp) so make sure the customer's network is configured to allow all required URLs.

## Scenario 10: Non persistent VDI environment accessing internet based remo...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Utilized Windows App to connect to AVD VDI which resolved recognizing keystrokes with internet-based management type consoles.&nbsp;&nbsp;

**Root Cause**: Actual cause was not determined but appears to be problem with using RDP method for connection having problem recognizing keystrokes as opposed to a cloud-based method for connection to AVD desktop which was then connecting to web-based 3rd party management consoles. Hypothesis is it just needed a cloud-based method for connecting to AVD in order for the keystrokes to be recognized with an internet-based management console.&nbsp;

## Scenario 11: Users might experience the following symptoms while using th...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- The issue can be temporarily mitigated by disabling tracing, which is done by adding the following value to the registry:  DisableEHUpload_&lt;ClientVersion&gt;  *The ClientVersion can be obtained in the &quot;About&quot; section of the Windows App.  For example:  reg.exe add &quot;HKLM\SOFTWARE\Microsoft\Terminal Server Client\Default&quot; /v DisableEHUpload_1.2.6980.0 /t REG_DWORD /d 1 /f However, it only lasts until the app is updated to the next version.

**Root Cause**: This issue happens due to a code defect in the UDP transport handler of the Windows App. The issue is currently being investigated in the following bug:  Bug 60104911 Memory Leak in rdpnanoTransport!Microsoft::Basix::Instrumentation::TraceManager::TraceMessage

## Scenario 12: Windows key remains held in local session after pressing Ctr...
> Source: MS Learn | Applicable: ❓

### Troubleshooting Steps
- Release L or Win key before the Ctrl key when pressing Ctrl+Win+L; alternatively start live captions from the Start menu instead of keyboard shortcut

**Root Cause**: Known Windows limitation: when using Win key, certain key combinations are locked to prevent overriding Win+L; releasing Win key last after Ctrl+Win+L causes Win key to stay held in local session
