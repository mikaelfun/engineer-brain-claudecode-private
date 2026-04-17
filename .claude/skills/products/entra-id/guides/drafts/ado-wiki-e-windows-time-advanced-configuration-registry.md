---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Time/Workflow: Windows Time: Configuration settings/Windows Time advanced configuration (Registry)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Time/Workflow%3A%20Windows%20Time%3A%20Configuration%20settings/Windows%20Time%20advanced%20configuration%20%28Registry%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1760444&Instance=1760444&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1760444&Instance=1760444&Feedback=2)

___
<div id='cssfeedback-end'></div>

You can access this article via shortcut https://aka.ms/W32TimeConfig

The Windows Time service stores information under the following registry paths:

    HKLM\SYSTEM\CurrentControlSet\Services\W32Time
    HKLM\SYSTEM\CurrentControlSet\Services\W32Time\Config
    HKLM\SYSTEM\CurrentControlSet\Services\W32Time\Parameters
    HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient
    HKLM\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpServer

Since the registry editor or Windows does not validate modifications before they are applied, invalid values may lead to unexpected behavior. Therefore, it is crucial to ensure that W32Time is configured with accepted values. 

The information provided below serves as a reference for troubleshooting and validation. Customers can refer to the [Windows Time service tools and settings | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings?tabs=config#windows-time-registry-reference) for more details.

[[_TOC_]]

## \Config
---
### EventLogFlags
- **Description:** This REG_DWORD controls which events Windows Time Service will log in the System events.
- **Possible values:** 
  - 0 for no events
  - 1 for time jump events
  - 2 for source change events
- **Default values hex (dec):** The default value is 2 for both domain controllers and domain members.
- **Note:** The values can also be combined for a multi-valued flag: 0x3 (time jump + source change events).
---
### ClockAdjustmentAuditLimit
- **Description:** This parameter specifies the smallest local clock adjustments that may be logged to the W32time service event log on the target machine.
- **Possible values:** 
  - N/A
- **Default values hex (dec):** 
  - Domain Controllers: N/A
  - Domain Members: 0x320
- **Note:** 
  - Default: 800 Parts per million (PPM). 
  - The key seems to have been added with Windows 10 RS3 and theres no documentation about it, neither internally nor publicly.
---
### ClockHoldoverPeriod
- **Description:** This REG_DWORD indicates how long (in seconds) a system clock can hold its accuracy when losing communication with its peer. If this period of time passes without W32time obtaining new samples from any of its input providers, W32time initiates a rediscovery of time sources.
- **Possible values:** 
  - 1024-260000
- **Default values hex (dec):** 
  - Domain Controllers: N/A
  - Domain Members: 0xC350?
- **Note:** 
  - The key seems to have been added with Windows 10 RS3 and theres no documentation about it, neither internally nor publicly.   
  - The holdover function allows a client machine to keep track of frequency and phase (to understand what time it is) using internal and/or local resources when communication is lost with its reference clock (NTP peer).
    - [https://www.eetimes.com/document.asp?doc_id=1278627](https://www.eetimes.com/document.asp?doc_id=1278627)
    - [https://en.wikipedia.org/wiki/Holdover_in_synchronization_applications](https://en.wikipedia.org/wiki/Holdover_in_synchronization_applications)
    - [https://cept.org/Documents/ecc-pt1/15028/info-doc_wd45_symm_timeholdoverosc_example-of-time-holdover-for-various-oscillators](https://cept.org/Documents/ecc-pt1/15028/info-doc_wd45_symm_timeholdoverosc_example-of-time-holdover-for-various-oscillators)
    - [http://www.chronos.co.uk/files/pdfs/itsf/2014/Day1/1615-rakon_cyril_datin.pdf](http://www.chronos.co.uk/files/pdfs/itsf/2014/Day1/1615-rakon_cyril_datin.pdf)
---
### AnnounceFlags
- **Description:** There are 5 possible values for this REG_DWORD and those can be combined to create multivalued flags, just like the NTP flags:
  - 0x0  Not a Time Server - Pretty much self-explanatory.
  - 0x1  Always Time Server - The computer will always advertise as a time server, even if its time is not correct or if he cannot confirm its correct.
  - 0x2  Automatic Time Server - The computer will detect whether or not it should advertise as a time server.
  - 0x4  Always reliable Time Server - The computer will always advertise as a reliable time server (to fix those who might be considered incorrect).
  - 0x8  Automatic reliable Time server - The computer will detect whether or not it should advertise as a reliable time server.
  - When we say advertise, we mean announce. Every machine can advertise the network, through the netlogon service, of its willingness to synchronize and get synchronized. When a computer is configured as always reliable and always time server (0x5), it announces throughout the network its willingness to sync other clients. The clients will then understand that this is a valid NTP peer.
  - When we add domain hierarchy to the topic, we add some complexity to it:
PDC is 0x5, therefore it will always be available and reliable to synchronize time, regardless of its NTP peer.
  - When we consider domain hierarchy (NT5DS, which will be further explained in the upcoming pages), this will also prevent workstations and members servers from advertising throughout the network, as theyll know their place, they should only get synchronized by domain controllers but not try to synchronize them.
  - In other words, advertising is not equal to synchronizing. A machine can (if incorrectly configured) advertise throughout the network but not synchronize any client requests that come. 
- **Possible values:** 
  - 0x0  Not a Time Server
  - 0x1  Always Time Server
  - 0x2  Automatic Time Server
  - 0x4  Always Reliable Time Server
  - 0x8  Automatic Reliable Time Server
- **Default values hex (dec):** 
  - PDC: 0x5 - The PDC is always a time server and always a reliable one.
  - Domain Controllers: 0xA - These will always be available and reliable to synchronize time as long as its NTP peer (PDC) is reliable.
  - Domain Members 0xA - These will always be available and reliable to synchronize time as long as its NTP peer is reliable, however, theyre NTP Server disabled plus domain hierarchy. 
  - Stand-alone Clients and Servers: 0xA - These will always be available and reliable to synchronize time as long as its NTP peer is reliable, however, theyre NTP Server disabled plus domain hierarchy. 
- **Note:** Can be multivalued
---
### FileLogEntries
- **Description:** This REG_SZ (String) specifies the level of detail of the information in the debug log.
- **Possible values:** 
  - 0-1003
- **Default values hex (dec):** 
  - Domain Controllers: N/A
  - Domain Members: N/A
  - Stand-alone Clients and Servers: N/A
- **Note:** 
  - Public doc (2023) [Windows Time service tools and settings | Microsoft Learn](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings?tabs=config "https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings?tabs=config") states the only valid settings for debug are 0-300 while you will see within our [Workflow: Windows Time: Data Collection - Overview (visualstudio.com)](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423335/Workflow-Windows-Time-Data-Collection "https://supportability.visualstudio.com/windowsdirectoryservices/_wiki/wikis/windowsdirectoryservices/423335/workflow-windows-time-data-collection") the range 0-1003 is used for server 2016 up. 
  - We have reached out to w32time@microsoft.com for feedback on this matter. SEE pointed out that the article [WinX: W32Time: Skew: Time skews if DJ client can't access SSL Time Server at boot (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/e4fe8429-35d4-6e0d-41f0-2319abf495f9 "https://internal.evergreen.microsoft.com/en-us/topic/e4fe8429-35d4-6e0d-41f0-2319abf495f9") also mentions a high range of 0-1100. However, the Principal Software Engineer advised using these high ranges with caution, as they expose internal functions.
---
### FileLogName
- **Description:** This REG_SZ (String) specifies the location of the log file. The path is not fixed. You can use a different path.
- **Possible values:** 
  - Path to file system location and file name (e.g. C:\Windows\Temp\w32time.log
- **Default values hex (dec):** 
  - Domain Controllers: N/A
  - Domain Members: N/A
  - Stand-alone Clients and Servers: N/A
---
### FileLogSize
- **Description:** This REG_DWORD specifies the size of the log file in bytes. A value of 10000000 bytes will limit the log file to approximately 10 MB.
- **Possible values:** 
  - Size in bytes of the log file
- **Default values hex (dec):** 
  - Domain Controllers: N/A
  - Domain Members: N/A
  - Stand-alone Clients and Servers: N/A
- **Note:** 
---
### FrequencyCorrectRate
- **Description:** This REG_DWORD controls the rate at which the clock is corrected. If this value is too small, the clock is unstable and overcorrects. If the value is too large, the clock takes a long time to synchronize.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x4 (4)
  - Domain Members: 0x4 (4)
  - Stand-alone Clients and Servers: 0x4 (4)
- **Note:** Note that 0 is an invalid value for the FrequencyCorrectRate registry entry. On Windows Server 2003, Windows Server 2003 R2, Windows Server 2008 , and Windows Server 2008 R2 computers, if the value is set to 0 the Windows Time service will automatically change it to 1.
---
### HoldPeriod
- **Description:** This REG_DWORD indicates how many consistent time samples the computer must receive in a series before evaluating potential spikes.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x5 (5)
  - Domain Members: 0x5 (5)
  - Stand-alone Clients and Servers: 0x5 (5)
---
### LargePhaseOffset
- **Description:** This entry specifies that a time offset greater than or equal to this value in 10-7 seconds is considered a spike. A network disruption such as a large amount of traffic might cause a spike. A spike will be ignored unless it persists for a long period of time.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x2FAF080 (50000000)
  - Domain Members: 0x2FAF080 (50000000)
  - Stand-alone Clients and Servers: 0x2FAF080 (50000000)
- **Note:** 
  - This key, along with SpikeWatchPeriod dictates what is a spike and how Windows Time Service will handle it.
  - Specially in unstable networks, or networks that suffer of either high latency or jitter, the Windows clock can face spikes. Spikes themselves are not really a problem, however, if the spike is kept for a long time, Windows Time Service will not consider it a spike anymore and will actually consider it the correct time. The value of this key dictates what is a spike for Windows Time Service: 50000000 100-nanoseconds units or 5 seconds.
  -  So, if the Windows Time spikes by 0,05 seconds and the spike remains for the value of SpikeWatchPeriod, then it wouldn't be considered a spike anymore, but rather the correct time.
---
### LastClockRate
- **Description:** This entry is maintained by W32Time. It contains reserved data that is used by the Windows operating system, and any changes to this setting can cause unpredictable results.
- **Possible values:** 
  - N/A
- **Default values hex (dec):** 
  - Domain Controllers: 0x2625B (156251)
  - Domain Members: 0x2625B (156251)
  - Stand-alone Clients and Servers: 0x2625B (156251)
---
### MaxAllowedPhaseOffset
- **Description:** Windows Time Service has two ways o synchronizing time dispersion: immediately or gradually. This REG_DWORD represents the offset in seconds which w32time considers to decide whether synchronization must occur immediately or gradually. If the offset exceeds the value of this key, then synchronization takes place immediately, otherwise it occurs gradually.
- **Possible values (hex):** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x12C (300)
  - Domain Members: 0x12C (300)
  - Stand-alone Clients and Servers: 0x1 (1)
---
### MaxNegPhaseCorrection
- **Description:** This value, expressed in seconds, controls the maximum allowable clock correction that can be made in a reverse direction. If a time sample is received that indicates a time in the past (as compared to the client's local clock) that has a time difference that is greater than the MaxNegPhaseCorrection value, the time sample is discarded. If this happens, the Windows Time source logs an event in the System log of Event Viewer.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x2A300 (172800)
  - Domain Members: 0xFFFFFFFF (4294967295)
  - Stand-alone Clients and Servers: 0xD2F0 (54000)
- **Note:** 
---
### MaxPosPhaseCorrection
- **Description:** This value, expressed in seconds, controls the maximum allowable clock correction that can be made in a forward direction. If a time sample is received that indicates a time in the future (as compared to the client's local clock) that has a time difference greater than the MaxPosPhaseCorrection value, the time sample is discarded. If this happens, the Windows Time source logs an event in the System log of Event Viewer.
- **Possible values:** 
  -  0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x2A300 (172800)
  - Domain Members: 0xFFFFFFFF (4294967295)
  - Stand-alone Clients and Servers: 0xD2F0 (54000)

---
### MaxPollInterval
- **Description:** This REG_DWORD determines what is the maximum interval a machine can wait before attempting to synchronize time. The value represents the interval in Log(2) seconds.
- **Possible values:** 
  - 0x1-0xF
- **Default values hex (dec):** 
  - Domain Controllers: 0xA (10)
  - Domain Members: 0xF (15)
  - Stand-alone Clients and Servers: 0xA (10)
- **Note:**   
  - Therefore a DC can wait up to 2^10 = 1024 seconds before attempting to synchronize time, or, approximately 17 minutes.
  - Therefore a domain member can wait up to 2^15 = 32768 seconds before attempting to synchronize time, or, approximately 9.1 hours.
  - Even though this key can accept values bigger than 0xF, its important that this doesnt surpasses 0xF. Also be careful with values lower than 0x6.

---
### MinPollInterval
- **Description:** This REG_DWORD determines what is the minimum interval a machine can wait before attempting to synchronize time. The value represents the interval in Log(2) seconds.
- **Possible values:** 
  - 0x1-0xF
- **Default values hex (dec):** 
  - Domain Controllers: 0x6 (6)
  - Domain Members: 0xA (10)
  - Stand-alone Clients and Servers: 0x6 (6)
- **Note:** 
  - Therefore a DC can wait a minimum of 2^6 = 64 seconds before attempting to synchronize time, or, approximately 1 minute.
  - Therefore a domain member can wait a minimum of 2^10 = 1024 seconds before attempting to synchronize time, or, approximately 17 minutes.
  - Even though this key can accept values bigger than 0xF, its important that this doesnt surpasses 0xF. Also be careful with values lower than 0x6.
---
### PhaseCorrectRate
- **Description:** This REG_DWORD is a scalar value that controls how quickly W32time corrects the client's local clock difference to match time samples that are accepted as accurate from the NTP server. Lower values cause the clock to correct more slowly, while larger values cause the clock to correct more quickly. This value must be a whole number greater than 0. 
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x7 (7)
  - Domain Members: 0x1 (1)
  - Stand-alone Clients and Servers: 0x7 (7)
---
### PollAdjustFactor
- **Description:** This is a scalar value that controls how quickly W32time changes polling intervals. When responses are considered to be accurate, the polling interval lengthens automatically. When responses are considered to be inaccurate, the polling interval shortens automatically.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x5 (5)
  - Domain Members: 0x5 (5)
  - Stand-alone Clients and Servers: 0x5 (5)
---
### SpikeWatchPeriod
- **Description:** This RED_DWORD determines how long in seconds a suspicious offset sample must persist before it is accepted as correct.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x384 (900)
  - Domain Members: 0x384 (900)
  - Stand-alone Clients and Servers: 0x384 (900)
---
### TimeJumpAuditOffset
- **Description:** An unsigned integer that indicates the time jump audit threshold, in seconds. If the time service adjusts the local clock by setting the clock directly, and the time correction is more than this value, then the time service logs an audit event.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0x7080 (28800)
  - Domain Members: 0x7080 (28800)
  - Stand-alone Clients and Servers: 0x7080 (28800)
---
### LocalClockDispersion
- **Description:** This parameter indicates the maximum error in seconds that is reported by the NTP server to clients that are requesting a time sample. (Only applicable local CMOS clock time is used).

- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - Domain Controllers: 0xA (10)
  - Domain Members: 0xA (10)
  - Stand-alone Clients and Servers: 0xA (10)
---
### UpdateInterval
- **Description:** This entry specifies the number of clock ticks between phase correction adjustments. Therefore, if Windows Time is to synchronize time gradually, each gradual change will happen with this REG_DWORDs value as an interval. This value represents the interval in 1/100th second units.
- **Possible values:** 
  - 0x1-0xFFFFFFFF
- **Default values hex (dec):** 
  - The default value for domain controllers is 100 (1 second).
  - The default value for domain members is 30,000 (300 seconds).
  - The default value for stand-alone clients and servers is 100 (1 second).
- **Note:** For information:
  - 1 minute equals to 60 seconds.
  - 1 second equals to 1000 milliseconds.
  - 1 millisecond equals to 10000 clock ticks.
---
### UtilizeSslTimeData
- **Description:** This REG_DWORD controls whether secure time seeding will be used. Secure Time Seeding is going to get used if and when the time sample is grossly inaccurate. In such cases, it will require some time data from SSL traffic as an additional input for correcting the local clock.
- **Possible values:** 
  - 0x0
  - 0x1
- **Default values hex (dec):** 
  - The default value is 1 for all machines.
- **Note:** Recommended to be disabled on DCs (value "0"). Check https://aka.ms/W32TimeSTS
---
### RequireSecureTimeSyncRequests
- **Description:** It controls whether or not the DC will respond to time sync requests that use older authentication protocols. If Enabled (set to 1), the DC wont respond to older authentication protocols.
- **Possible values:** 
  - 0x0
  - 0x1
- **Default values hex (dec):** 
  - This key doesnt exist by default.
---