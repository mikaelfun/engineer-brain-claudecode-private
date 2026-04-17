# AVD Teams 多媒体 - 杂项 — 排查工作流

**来源草稿**: ado-wiki-b-mmr-technical-solution.md, ado-wiki-screenshot-capture-teams-macos-scoping-questions.md, ado-wiki-screenshot-capture-teams-macos-setup-guide.md, ado-wiki-teams-channel-collaboration-template.md
**Kusto 引用**: (无)
**场景数**: 18
**生成日期**: 2026-04-07

---

## Scenario 1: Confirm client meets requirements
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - [MMR Requirements](https://docs.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection#requirements)
   - This is very important because media extensions will not load if requirements are not met. For example customer does not configure client for Insiders rings. We check this when user connects and if not in Insiders ring we purposely don't load the media extensions.
---

## Scenario 2: Extension Specific Issues
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Extension fails to install
MSI Install
   - Verify multimedia extension are installed on AVD VM by going to Settings > Apps
   - Review install logs
   - `C:\Program Files\MsRDCMMRHost\MsRDCMMRHostInstall.log`
   - `C:\Users\<user who installed MSI>\AppData\Local\Temp\MSIxxxx.LOG`
   - Verify network is not blocking connections to Edge/Chrome update URL's
   - Edge: `https://edge.microsoft.com/extensionwebstorebase`
   - Chrome: `https://clients2.google.com/service/`
   - Verify something is not blocking installer from creating registry keys ie AV
   - Edge: `HKLM\SOFTWARE\WOW6432Node\Microsoft\Edge\Extensions\joeclbldhdmoijbaagobkhlpfjglcihd\`
   - Chrome: `HKLM\SOFTWARE\WOW6432Node\Google\Chrome\Extensions\lfmemoeeciijgkjkgbgikoonlkabmlno\`
GPO Install
   - Confirm GPO was created correctly
   - Confirm GPO is getting applied to AVD VM. Confirm this by running gpresult or collecting AVD collect and reviewing gpresult. Can also check group policy logs on AVD VM `Application and Service Logs\Microsoft\Windows\Group Policy` and `System Log > filter on Source: Microsoft-Windows-GroupPolicy`
   - See [Managing group policies for the multimedia redirection browser extension](https://docs.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection#managing-group-policies-for-the-multimedia-redirection-browser-extension) or [Internal Setup Guide](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/587740/Setup-Guide#install-via-group-policy) for reference if needed
   - Verify network is not blocking connections to Edge/Chrome update URL's
   - Edge: `https://edge.microsoft.com/extensionwebstorebase`
   - Chrome: `https://clients2.google.com/service/`
   - Verify something is not blocking registry keys from getting created ie AV
   - Edge: `HKLM\SOFTWARE\Policies\Google\Chrome`
   - Chrome: `HKLM\SOFTWARE\Policies\Google\Chrome`

##### Extension shows client couldn't connect to multimedia redirection.
   - Verify media redirection is working
   - This verification should happen when users see the green check
   - If there is a red x or no icon, then we are not getting MMR
   - If there is a green check, it's possible video still isn't being redirected, that's when to check redirection vs. non-redirection
   - Verify client meets requirements.
   - Again this is very important because media extensions will not load if requirements are not met. For example customer does not configure client for Insiders rings. We check this when user connects and if not in Insiders ring we purposely don't load the media extensions.
   - If installed via GPO review GPO and confirm:
1. GPO was created correctly.
1. GPO is getting applied to AVD VM. Confirm this by running gpresult or collecting AVD collect and reviewing gpresult. Can also check group policy logs on AVD VM `Application and Service Logs\Microsoft\Windows\Group Policy` and `System Log > filter on Source: Microsoft-Windows-GroupPolicy`
1. The specified URL is allowed in GPO.
1. See [Managing group policies for the multimedia redirection browser extension](https://docs.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection#managing-group-policies-for-the-multimedia-redirection-browser-extension) or [Internal Setup Guide](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/587740/Setup-Guide#install-via-group-policy) for reference if needed
MMR Not Working on Known Site
   - [Websites that work with MMR](https://docs.microsoft.com/en-us/azure/virtual-desktop/multimedia-redirection#websites-that-work-with-mmr)
   - Verify media redirection is working
   - To check if video is being redirected, one can move the window rapidly or scroll. If redirected, video should lag behind the movement slightly, and the occlusion pattern should be visible behind it (can appear either as grey or as pink/green checkerboard). Non-redirected video will not lag with movement but might appear low quality or stuttery.
---

##### Extension Shows Error
   - If customer installed MSI on AVD VM or user installed the multimedia redirection extension from the Microsoft Edge Store or Google Chrome Store then user will have to enable when opens browser first time.
   - The only option that automatically enables extension for user is when done through GPO.
   - In addition if the extension fails to install due to a user dismiss/cancel the prompt when opening the browser, the user will need to install the multimedia redirection extension from the Microsoft Edge Store or Google Chrome Store.
Solution is to enable the extension.
   - Edge
   - To run the extension on Microsoft Edge manually, look for the yellow exclamation mark on the overflow menu. You should see a prompt to enable the Azure Virtual Desktop Multimedia Redirection extension.
   - Click the exclamation mark on the overflow menu > select Turn on extension
   - Chrome
   - To run the extension on Google Chrome manually, look for the notification message that says the new extension was installed. Select the notification to allow your users to enable the extension.
   - Click Error > select New extension added (AVD Multimedia Redirection Extension) > Select Enable extension
---

##### Extension is not enabled
   - If customer installed MSI on AVD VM or user installed the multimedia redirection extension from the Microsoft Edge Store or Google Chrome Store then user will have to enable when opens browser first time.
   - To enable the extension go to Settings > Extensions > Manage extension > Toggle to On to Enable the Extension > Select Turn on extension
   - If the extension fails to install due to a user dismiss/cancel the prompt when opening the browser, the user will need to install the multimedia redirection
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/avd-multimedia-redirectio/joeclbldhdmoijbaagobkhlpfjglcihd)
   - [Chrome](https://chrome.google.com/webstore/detail/wvd-multimedia-redirectio/lfmemoeeciijgkjkgbgikoonlkabmlno)
---

##### Extension Not Working in InPrivate/Incognito Windows
   - User has to configure extension to allow in InPrivate/Incognito Windows. Go to extension options and turn on.
---

##### Teams Live Events (web only)
   - Currently, Teams live events are not media optimized on AVD and W365. MMR is a short-term workaround for a smoother Teams live events playback on AVD
   - How to use MMR for Teams live events
   - Make sure the green check is shown on the status icon
   - Open the link to the Teams live event in a browser (Chrome or Edge)
   - Select Watch on the web instead (DO NOT use the Teams App)
   - The Teams live event should automatically start playing in your browser
---

## Scenario 3: Browser Specific Issues
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Browser crashes when extension is enabled
   - Collect process dump then create ICM

##### Browser hangs/freezes when extension is enabled
   - Restart the VM to see if fixes issue
   - If issue persists collect Server Trace then create ICM

##### Browser hangs/freezes when media is being played using extension
   - Restart the VM to see if fixes issue
   - If issue persists collect Server Trace then create ICM

##### Content plays fine in one browser (Edge Chromium) but not another (Chrome)
   - Collect Server Trace then create ICM
---

## Scenario 4: Content Specific Issues
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Content won't play because DRM protected
   - By default, MMR is not supposed to work on DRM content.
   - However, the playback should work with a fallback path. Collect Server Trace then create ICM.
   - To mitigate the issue, edit group policy so the extension does not work on the website
---

## Scenario 5: Video Specific Issues
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Bad video quality, Screen artifacts, or Video delay
   - Check if media content is redirected by checking if the green check and moving the window around.
   - If the green check shows and theres a lag, its being redirected collect Client Trace then create ICM.
   - If the green check shows but theres no lag or the green check is not shown collect Server Trace then create ICM.

##### Video is in wrong size / wrong place
   - Collect Server Trace then create ICM.
---

## Scenario 6: Audio Specific Issues
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Bad audio quality, Audio is out of sync, Scratchy audio
   - Check if media content is redirected by checking if the green check and moving the window around.
   - If the green check shows and theres a lag, its being redirected collect Client Trace then create ICM.
   - If the green check shows but theres no lag or the green check is not shown collect Server Trace then create ICM.

##### Performance Issues
   - Confirm client computer meets [hardware requirements](https://docs.microsoft.com/en-us/microsoftteams/hardware-requirements-for-the-teams-app#hardware-requirements-for-teams-on-a-windows-pc/)
   - Check resource monitor on client computer and AVD VM and confirm browser is process consuming excessive CPU.
   - If client meets hardware requirements and still seeing performance issues collect Client Trace and Server Trace and then create ICM

## Scenario 7: Tracing
> 来源: ado-wiki-b-mmr-technical-solution.md | 适用: \u901a\u7528 \u2705

### 排查步骤

##### Client Trace
1. Download mmr_client_tracing.zip and upload to workspace
1. Ask customer to download from workspace and copy to AVD client computer (THE COMPUTER WITH WINDOWS CLIENT INSTALLED!!) and extract
1. Open command prompt as administrator and change to directory of extract files
1. Enter command `mmrtrace_client.bat`
1. Reproduce the issue
1. Select the command window and press any key to stop the trace
1. Once tracing has been stopped a folder containing the trace (mmrtrace_client.etl) will open.
1. Zip and upload to workspace

##### Server Trace
1. Open the pop-up window of the extension
1. Click the Start tracing button in the pop-up window to start to collect traces
1. Repro the scenario.
1. Go back to the extension pop-up window and click Stop Tracing
1. Once stop tracing has been clicked, a folder containing 2 files (mmr_extension_trace.log and mmr_host_trace.log) will open.
1. Copy those two files into a folder, zip and upload to workspace

##### Escalation to PG
1. Open case in ASC and verify support topic is `Azure Virtual Desktop\Remote Desktop Clients\Multimedia Redirection (MMR)`
1. If support topic is not correct create solution set with support topic `Azure Virtual Desktop\Remote Desktop Clients\Multimedia Redirection (MMR)`
1. Select MMR on AVD Escalation Template

## Scenario 8: 1. Environment & Configuration
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Which macOS version? What Windows App (Beta) version?
   - Beta channel or another release channel?
   - All macOS devices or specific ones?
   - Connecting to Cloud PC or other remote desktop?

## Scenario 9: 2. User Scenario / UX
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - What is user trying to capture (Teams chat, meeting, shared content)?
   - What happens when selecting Window > Capture Screen?
   - Any on-screen confirmation or notification?

## Scenario 10: 3. Policies, Controls & Restrictions
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Is Screen Capture Protection enabled on Cloud PC (server/client/both)?
   - Are Teams screenshot restrictions enabled in tenant?
   - Conditional Access or device compliance policies involved?

## Scenario 11: 4. Version & Feature Validation
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Windows App version 2926 confirmed?
   - Experimental section enabled? Screen Capture Redirection enabled?
   - Has feature ever worked previously?

## Scenario 12: 5. Logs & Evidence
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Capture Screen option greyed out or clickable?
   - Screenshot file appears in Downloads folder on Cloud PC?
   - Is rdpvchost.exe running on Cloud PC?

## Scenario 13: 6. CSS Triage Outcome
> 来源: ado-wiki-screenshot-capture-teams-macos-scoping-questions.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Expected behavior/limitation (policy or security restriction)
   - Configuration issue (version, Experimental settings, server component)
   - Known limitation (clipboard behavior, local macOS restrictions)
   - Potential product issue (feature enabled but not functioning)

## Scenario 14: Enable the Feature (Client-side)
> 来源: ado-wiki-screenshot-capture-teams-macos-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Install Windows App Beta version 2926
2. Launch Windows App Beta and sign in
3. Navigate to About Windows App
4. Click the Windows icon 10 times to unlock Experimental settings
5. Open Settings > Experimental
6. Enable Screen Capture Redirection

## Scenario 15: Validate Cloud PC Readiness
> 来源: ado-wiki-screenshot-capture-teams-macos-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
1. Connect to the Cloud PC
2. Open Window > Capture Screen
3. If option is greyed out:
   - Open Task Manager on Cloud PC
   - Locate Windows Remote Desktop under Background Processes
   - End the process
   - Launch the beta RDPVCHost.exe provided separately
4. Recheck Window > Capture Screen

## Scenario 16: Validate Success
> 来源: ado-wiki-screenshot-capture-teams-macos-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Capture Screen option is clickable
   - Notification confirms screenshot saved
   - Screenshot appears in Downloads folder on Cloud PC
   - Click notification to open the folder

## Scenario 17: Installer
> 来源: ado-wiki-screenshot-capture-teams-macos-setup-guide.md | 适用: \u901a\u7528 \u2705

### 排查步骤
RDPVCHost installer for Mac available from internal SharePoint.

## Scenario 18: Template for Requesting Assistance
> 来源: ado-wiki-teams-channel-collaboration-template.md | 适用: Global-only \u274c

### 排查步骤
   - **Case Number**:
   - **Issue Description**:
   - **Tenant ID**:
   - **License Type** (Enterprise, Frontline, or Business):
   - **Join Type** (AADJ, HAADJ):
   - **Network Type** (MHN, ANC):
   - **Case Type** (GCC, GCCH, EU or WW):
   - **Image Type** (Custom or Gallery):
   - **Affected client** (Web, Windows/Mac Desktop, Boot to Cloud, Link, etc...):
   - **Expected behavior**:
   - **Affected Cloud PC name/s**:
   - **Affected UserId (GUID)**:
   - **Network Restrictions or filtering present** (eg Proxy, Tunnel, Firewall):
   - **What have you already tried to resolve the issue?**:
   - **What data have you collected and what have you found?** (e.g. ASC logs, MDMDiagnostic logs, ODC logs, SDP, Screenshots, browser traces, network traces):
   - **Relevant links, KB articles, Teams conversations, bugs researched**:
   - **What assistance are you requesting?**:
   - **Have you asked copilot? Was it helpful?**:
   - **TA/PTA alias**:
