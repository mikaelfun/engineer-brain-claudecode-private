---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Time/Workflow: Windows Time: Interesting events to look for"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Time/Workflow%3A%20Windows%20Time%3A%20Interesting%20events%20to%20look%20for"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423329&Instance=423329&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423329&Instance=423329&Feedback=2)

___
<div id='cssfeedback-end'></div>

Event viewer (**eventvwr.msc**) can help us to quickly pinpoint the time issue. This document provides information on interesting events related to Windows Time Service, including detailed steps to troubleshoot and resolve issues. 

You can access this article via shortcut https://aka.ms/W32TimeEvents

[[_TOC_]]

# Interesting events

There are three places where we can check: _System_, _Security_ and _Time-Service-Operational_. This is not intended to be a complete list, just a quick reference for you to identify some of the possible events and actions to take.


## System events

| Event ID | Source | Desc | Actions |
|--|--|--|--|
| 1 | Kernel-General | Whenever you can, try to correlate the PID with `tasklist /svc` output. The system time has changed to <timestamp> from <timestamp>. Change Reason: <reason>. Process: <process>. | When the change is done by w32Time service reason will be "**An application or system component changed the time**" and process "**svchost.exe**".  |
| 12 | Time-Service | Time Provider NtpClient: This machine is configured to use the domain hierarchy to determine its time source, but it is the AD PDC emulator for the domain at the root of the forest, so there is no machine above it in the domain hierarchy to use as a time source. It is recommended that you either configure a reliable time service in the root domain, or manually configure the AD PDC to synchronize with an external time source. Otherwise, this machine will function as the authoritative time source in the domain hierarchy. If an external time source is not configured or used for this computer, you may choose to disable the NtpClient. |  |
| 34 | Time-Service | The time service has detected that the system time needs to be changed by X seconds. The time service will not change the system time by more than X seconds. Verify that your time and time zone are correct, and that the time source <NTPserver> is working properly. The time service has not synchronized the system time |  |
| 35 | Time-Service | The time service is now synchronizing the system time with the time soure <NTPserver> | Note the time source and the IPv4 or IPv6. |
| 36 | Time-Service | The time service has not synchronized the system time for the last X seconds because none of the time service providers provided a usable time stamp. |  |
| 37 | Time-Service | The time provider NtpClient is currently receiving valid time data from <NTPserver> | Note the time source and the IPv4 or IPv6. |
| 47 | Time-Service | Time Provider NtpClient: No valid response has been received from manually configured peer <NTPserver> after 8 attempts to contact it. This peer will be discarded as a time source and NtpClient will attempt to discover a new peer with this DNS name. The error was: _The peer is unreachable._ |  |
| 52 | Time-Service | The time service has set the time with offset X seconds. |  |
| 129 | Time-Service | NtpClient was unable to set a domain peer to use as a time source because of discovery error. NtpClient will try again in 15 minutes and double the reattempt interval thereafter. The error was: _Bad DNS packet. (0x8007251E)_ |  |
| 134 | Time-Service | NtpClient was unable to set a manual peer to use as a time source because of DNS resolution error on '<NTPserver>'. NtpClient will try again in 15 minutes and double the reattempt interval thereafter. The error was: _No such host is known. (0x80072AF9)_ |  |
| 137 | Time-Service | NtpClient succeeds in resolving manual peer <NTPserver> after a previous failure. |  |
| 139 | Time-Service | The time service has started advertising as a time source. |  |
| [142](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/w32time-event-142-time-service-stopped-advertising) | Time-Service | The time service has stopped advertising as a time source because _<cause>_. |  |
| 143 | Time-Service | The time service has started advertising as a good time source. |  |
| 144 | Time-Service | The time service has stopped advertising as a good time source. |  |
| 158 | Time-Service | The time provider 'VMICTimeProvider' has indicated that the current hardware and operating environment is not supported and has stopped. |  |
|  |  |  |  |

## Security events

| Event ID | Source | Desc |  |
|--|--|--|--|
| [4616](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/event-4616) | Windows Security | The system time was changed. | You DO NOT NEED to enable audit subcategory **Security State Change** for this event to be logged. W32Time process runs under `C:\Windows\System32\svchost.exe`. |

## Microsoft-Windows-Time-Service/Operational
In Windows 10 version 1703 or higher, and Windows Server 2016 version 1709 or higher the eventvwr.msc > Applications and Services Logs > Microsoft > Windows > Time-Service > Operational.

For more information, follow the link for each of the event IDs linked to the article [Windows Time for Traceability | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=257).

| Event ID | Source | Desc |  |
|--|--|--|--|
| [257](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=257#tabpanel_1_257) | Time-Service | W32time Startup | This is helpful as it also displays the configuration that was loaded when the W32time service started. |
| [258](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=258#tabpanel_1_258) | Time-Service | W32time Shutdown |  |
| [259](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=259#tabpanel_1_259) | Time-Service | List of time sources used by NTP Client | Logged once every 8 hours. |
| [260](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=260#tabpanel_1_260) | Time-Service | W32time periodically logs its configuration and status | Logged once every 8 hours. |
| [261](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=261#tabpanel_1_261) | Time-Service | System Time is set |  |
| [262](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=262#tabpanel_1_262) | Time-Service | System clock frequency adjusted | Clock accuracy is measured in PPM (Parts Per Million). It indicates how many parts out of a million the clock might deviate from the true time. For example, if a clock has an accuracy of 1 PPM, it means that it could be off by 1 second in about 11.57 days (1,000,000 seconds). |
| [263](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=263#tabpanel_1_263) | Time-Service | Change in the Time service settings or list of loaded time providers |  |
| [264](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=264#tabpanel_1_264) | Time-Service | Change in time sources used by NTP Client |  |
| [265](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=265#tabpanel_1_265) | Time-Service | Time service source or stratum number changes |  |
| [266](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-for-traceability?tabs=266#tabpanel_1_266) | Time-Service | Time resynchronization is requested. Reason Code: <int> | Reason code description:<br/> 0 : An explicit time resynchronization request from an administrator<br/> 1 : Power state changes on this machine<br/> 2 : [Changes to the network interface or to the network topology](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1786965)  **Tap for more details**<br/> 3 : State changes within W32time that require time synchronization |