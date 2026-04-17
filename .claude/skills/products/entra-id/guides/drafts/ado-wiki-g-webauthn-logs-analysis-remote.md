---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Azure Active Directory Topics/WebAuthn - Local & Remote (Moving forward with Password less Strategy)/Working Logs Analysis - Remote Scenario"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAzure%20Active%20Directory%20Topics%2FWebAuthn%20-%20Local%20%26%20Remote%20(Moving%20forward%20with%20Password%20less%20Strategy)%2FWorking%20Logs%20Analysis%20-%20Remote%20Scenario"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# WebAuthn Working Logs Analysis - Remote Scenario

**Summary:** Detailed analysis of logs collected during a user session involving Microsoft Remote Desktop Client (MSRDC) and WebAuthn. Covers steps for collecting and analyzing logs from both the source and target machines.

## Scenario explanation where the logs were collected

In this example, the user has logged onto the source machine. The user then used the Azure Virtual Desktop (AVD) Client, also known as Microsoft Remote Desktop Client (MSRDC), to connect to the target machine. The user then opened the Edge browser and connected to https://webauthn.io. The user is already registered and is now trying to log in.

## Logs that were collected during the scenario

1. **Edge Debug Logs:** Open Edge and in the browser type: `edge://device-log/`. On the other tab, open https://webauthn.io.
2. **WebAuthn Event Logs on the Source and Target Machine:** Navigate to Event Viewer (eventvwr.msc) | Applications and Services Logs | Microsoft | Windows | WebAuthn.
3. **Remote Desktop Services (RDS)/AVD Tracing**

## Log analysis of the target machine

### 1. Edge Logs
- Close all browsers.
- Open the Edge browser.
- Type `edge://device-log` and enable the checkboxes.
- Open a new tab on the browser and connect to the website.

### 2. WebAuthn Event Logs on the Target Machine
Check Event Viewer for WebAuthn events on the target (remote) machine.

### 3. MSRDC Tracing
Key trace entries to look for:
```
[tsvirtualchannelpal] TsVcPluginLoader_cpp1219 CTSVirtualChannelPluginLoader::LoadExternalPlugin() - Loaded C:\WINDOWS\system32\WebAuthn.dll
[WinDvcLoader] DynVCPluginLoader_cpp526 DynVCPluginLoader::LoadUserPlugins() - Dispatching LoadPlugins (external) calls for ...WebAuthn.dll
```

## Log analysis of the source machine

### WebAuthn Event Logs on the Source Machine
Check Event Viewer for WebAuthn events on the source (local) machine to verify the credential request was properly redirected.
