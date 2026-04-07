---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows LAPS/Legacy LAPS or LAPSv1/Workflow: LAPS: Auditing"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20LAPS%2FLegacy%20LAPS%20or%20LAPSv1%2FWorkflow%3A%20LAPS%3A%20Auditing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567268&Instance=567268&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/567268&Instance=567268&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article provides information on how to adjust the verbosity of event logging for the Local Administrator Password Solution (LAPS) Client-Side Extension (CSE) under the "AdmPwd" event source in the computer's Application Event Log.

[[_TOC_]]

# Client logging

The Local Administrator Password Solution (LAPS) Client-Side Extension (CSE) logs all events under the Event Source "AdmPwd" in the computer's Application Event Log. The verbosity of the events that are logged can be adjusted by the following registry `REG_DWORD` value:

`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\GPExtensions\{D76B9641-3288-4f75-942D-087DE603E3EA}\ExtensionDebugLevel`

![An image of the registry editor showing the keys required to configure auditing.](/.attachments/LAPS/LAPS_Auditing.png)

Possible values are as follows:

| **Value** | **Meaning** |
|-----------|--------------|
| 0         | Silent mode; log errors only. When no error occurs, no information is logged about CSE activity. |
| 1         | Log errors and warnings. |
| 2         | Verbose logging. |