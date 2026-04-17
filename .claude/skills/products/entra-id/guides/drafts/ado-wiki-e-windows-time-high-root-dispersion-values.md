---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Time/Workflow: Windows Time: Looking for known solutions/High Root Dispersion values"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Time/Workflow%3A%20Windows%20Time%3A%20Looking%20for%20known%20solutions/High%20Root%20Dispersion%20values"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1786965&Instance=1786965&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1786965&Instance=1786965&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

# Root Dispersion Overview

**Dispersion**is a value used to assess the health of the NTP server. It is measured in milliseconds (ms) and is crucial for determining the reliability of clock synchronization.

**Root dispersion**indicates the recorded time difference between the NTP client and the Root time source (Stratum 1 NTP server). This represents the worst-case scenario, measuring the maximum time transfer error due to network asymmetry.

In your role as an engineer, high root dispersion values reported in Windows Domain Controllers (DCs) may not affect other Windows devices. However, it can cause issues with **Unix and hardware-based devices**, as they will not synchronize time when the Domain Controllers' root dispersion value exceeds a specific threshold (usually 5 seconds).

'Chrony' is a Network Time Protocol (NTP) implementation, it is executed by the daemon 'chronyd' and managed using the command line 'chronyc'. 

The problem from Unix based client will look like this:

```
[root@tux ~]# chronyc sources
210 Number of sources = 2
MS Name/IP address    Stratum Poll Reach LastRx Last sample

^? DC2.CONTOSO.COM      5 7 377 92 +192ms[ +192ms] +/- 15.7s
^? DC1.CONTOSO.COM      5 7 377 16 +194ms[ +194ms] +/- 7942ms
  
[root@tux ~]# timedatectl
  Local time: Mon 2024-04-01 16:19:01 UTC
  Universal time: Mon 2024-04-01 16:19:01 UTC
  RTC time: Mon 2024-04-01 16:19:01
  Time zone: UTC (UTC, +0000)
 NTP enabled: yes
  NTP synchronized: no
  RTC in local TZ: no
  DST active: n/a
  
chronyd -q 'server 192.168.1.31 iburst'
2024-04-01T16:05:37Z chronyd version 4.3 starting (+CMDMON +NTP +REFCLOCK +RTC +PRIVDROP +SCFILTER +SIGND +ASYNCDNS +NTS +SECHASH +IPV6 +DEBUG)
2024-04-01T16:08:56Z No suitable source for synchronisation
```

# Determining Root Dispersion values  
You can obtain the Root Dispersion value in the Windows Domain Controller by running the `w32tm /query /status` command (example below from healthy machine where value is a small fraction of a second:

```
C:\>w32tm /query /status
Leap Indicator: 0(no warning)
Stratum: 4 (secondary reference - syncd by (S)NTP)
Precision: -23 (119.209ns per tick)
Root Delay: 0.0480652s
Root Dispersion: 0.0353577s
ReferenceId: 0xA29FC801 (source IP:  162.159.200.1)
Last Successful Sync Time: 11/28/2024 9:55:59 AM
Source: time.windows.com,0x9
Poll Interval: 9 (512s)
```
 If the root dispersion value is high on the Windows domain controller (several seconds), it is our responsibility to perform the corresponding diagnosis. The fact that only Hardware/Unix devices are affected **does not mean that the problem is with the clients**, but rather with the server.

To examine this in more detail, you can enable the debug log of the Windows Time service. If the issue is consistently reproducible, run the`w32tm /resync`command. If the issue is random, keep the debug logging enabled for the necessary duration until the issue reappears:

    w32tm /debug /enable /file:C:\Windows\debug\w32tm.log /size:100000000 /entries:0-1003

This allows you to observe that the NTP client obtains time samples from the NTP server in **batches of six**, and for each of those time samples we have Dispersion value (displayed as "**Dsp:**") that in this particular example varies between 0 and 16. 

The Root Dispersion value displayed as "**Filter Dispersion**" varies between 3.7s and 7.7s:

```
154764 20:55:22.4697836s - Response from peer DC1.contoso.com (ntp.d|0.0.0.0:123->192.168.1.30:123), ofs: +00.0075191s
154764 20:55:22.4698166s - TSI_PhaseOffset returned:83178286240
154764 20:55:22.4698374s - 5 Age:5 Ofs:+00.0000000s COfs:-00.0129651s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0029632s RDsp:00.0000000s Pnt:00.0118528s Dst:16.0000000s FDsp:00.2500463s Jitter:00.0000000s AgeTime:+13371684922.4698084s stc:0
154764 20:55:22.4699276s - 4 Age:4 Ofs:+00.0000000s COfs:-00.0129651s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0029632s RDsp:00.0000000s Pnt:00.0118528s Dst:16.0000000s FDsp:00.7501389s Jitter:00.0000000s AgeTime:+13371684922.4698084s stc:0
154764 20:55:22.4699904s - 3 Age:3 Ofs:+00.0000000s COfs:-00.0129651s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0029632s RDsp:00.0000000s Pnt:00.0118528s Dst:16.0000000s FDsp:01.7503241s Jitter:00.0000000s AgeTime:+13371684922.4698084s stc:0
154764 20:55:22.4700574s - 2 Age:2 Ofs:+00.0000000s COfs:-00.0129651s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0029632s RDsp:00.0000000s Pnt:00.0118528s Dst:16.0000000s FDsp:03.7506945s Jitter:00.0000000s AgeTime:+13371684922.4698084s stc:0
154764 20:55:22.4701173s - 1 Age:0 Ofs:+00.0075191s COfs:+00.0075190s Dly:+00.0015868s RDly:+00.0281982sDsp:00.0000002s RDsp:00.3004608s Pnt:00.0000000s Dst:00.0015868s FDsp:03.7506945s Jitter:207.4438116s AgeTime:+00.0055194s stc:415516178
154764 20:55:22.4702174s - 0 Age:1 Ofs:+00.0052398s COfs:+00.0029644s Dly:+00.0011002s RDly:+00.0281982sDsp:00.0029633s RDsp:00.2975006s Pnt:00.0118524s Dst:00.0011002s FDsp:03.7521761s Jitter:207.4438116s AgeTime:+256.0193289s stc:415499793
154764 20:55:22.4702916s - Peer jitter: 00.0045546s Filter Dispersion: 03.7521761s
154764 20:55:22.4703342s - best sample stcOld:415499793, stcNew:415516178
[...]
154765 14:40:41.7669910s - Response from peer DC1.contoso.com (ntp.d|0.0.0.0:123->192.168.1.30:123), ofs: +00.0053421s
154765 14:40:41.7670194s - TSI_PhaseOffset returned:83178287216
154765 14:40:41.7670372s - 5 Age:5 Ofs:+00.0000000s COfs:-00.3967961s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0000000s RDsp:00.0000000s Pnt:00.0000000s Dst:16.0000000s FDsp:00.2500000s Jitter:00.0000000s AgeTime:+13371748841.7670128s stc:0
154765 14:40:41.7670939s - 4 Age:4 Ofs:+00.0000000s COfs:-00.3967961s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0000000s RDsp:00.0000000s Pnt:00.0000000s Dst:16.0000000s FDsp:00.7500000s Jitter:00.0000000s AgeTime:+13371748841.7670128s stc:0
154765 14:40:41.7671475s - 3 Age:3 Ofs:+00.0000000s COfs:-00.3967961s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0000000s RDsp:00.0000000s Pnt:00.0000000s Dst:16.0000000s FDsp:01.7500000s Jitter:00.0000000s AgeTime:+13371748841.7670128s stc:0
154765 14:40:41.7672000s - 2 Age:2 Ofs:+00.0000000s COfs:-00.3967961s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0000000s RDsp:00.0000000s Pnt:00.0000000s Dst:16.0000000s FDsp:03.7500000s Jitter:00.0000000s AgeTime:+13371748841.7670128s stc:0
154765 14:40:41.7672556s - 1 Age:1 Ofs:+00.0000000s COfs:-00.3967961s Dly:+00.0000000s RDly:+00.0000000sDsp:16.0000000s RDsp:00.0000000s Pnt:00.0000000s Dst:16.0000000s FDsp:07.7500000s Jitter:00.0000000s AgeTime:+13371748841.7670128s stc:0
154765 14:40:41.7673099s - 0 Age:0 Ofs:+00.0053421s COfs:+00.0053421s Dly:+00.0011006s RDly:+00.0369415sDsp:00.0000002s RDsp:00.0439301s Pnt:00.0000000s Dst:00.0011006s FDsp:07.7500001s Jitter:00.0000000s AgeTime:+00.0040512s stc:419606935
154765 14:40:41.7673629s - Peer jitter: 00.0000000s Filter Dispersion: 07.7500001s
154765 14:40:41.7674048s - Reachability:  peer DC1.contoso.com (ntp.d|0.0.0.0:123->192.168.1.30:123) is reachable.
```


# Known issue - High Root Dispersion values due to network topology changes

Root dispersion can increase due to **network topology changes** as described in the video [65InShorts4DS with Justin - Win32Time Root Dispersion.mp4](https://microsoftapc.sharepoint.com/:v:/r/teams/InShorts/InShorts4DS/65InShorts4DS%20with%20Justin%20-%20Win32Time%20Root%20Dispersion.mp4?csf=1&web=1&e=g9Zrp6&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D). This is 11 minutes long, so if you prefer, keep reading you'll find the same information transcribed but also expanded with a possible solution.

While the high dispersion values are reported in the Windows NTP servers check if the Microsoft-Windows-Time-Service/Operational registers **Event 266** with **Reason Code 2**:

```
Log Name:      Microsoft-Windows-Time-Service/Operational
Source:        Microsoft-Windows-Time-Service
Date:          11/28/2024 6:15:28 AM
Event ID:      266
Task Category: None
Level:         Information
Keywords:      
User:          LOCAL SERVICE
Computer:      WIN-JHS4325V4J6.contoso.com
Description:
W32time Service received notification to rediscover its time sources and/or resynchronize time. Reason Code:2 System Tick Count: 928976312
Reason code description:
  0 : An explicit time resynchronization request from an administrator
  1 : Power state changes on this machine
  2 :  Changes to the network interface or to the network topology 
  3 : State changes within W32time that require time synchronization 
```

In the most recent case I encountered, 1528 of these events were registered during the data capture, averaging about 20 events per hour, which is an unusually high number. If you also observe unexpected amount of Events with ID 266, please coordinate with the customer for data capture while the Windows machine is reporting a few of them:

    .\TSS.ps1 -Start -Scenario NET_NETIO -ADS_W32Time 

 Please NOTE that when the event mention 'network' in this context, this is not referring to network infrastructure. The changes are most likely on the server's adapter. This is why to determine what is happening we need Microsoft Networking engineer involvement in the case to assist with the analysis of the logs captured by the TSS script that are relevant to the network interface.

**Engage Microsoft NET team** asking for assistance with the data analysis.

- DS engineer will review:
  - **Windows Time Debug log (w32time.log)** to determine in which periods there were increases in the Root Dispersion value.
  - **Windows Time - Operational log events** (evtx) to determine the number of Event ID 266 occurrences and the periods in which they appeared.
- NET engineer will review any of the following, but not limited to:
  - **Microsoft-Windows-SMBClient/Connectivity** events (evtx)
  - ETW with the Microsoft-Windows-TCPIP provider
  - netsh trace with provider Microsoft-Windows-TCPIP 

While checking SMBClient/Connectivity events, NET engineer noticed lot of added/deleted operations for the **Teredo interface** (13k added entries, 5k deleted). The Teredo adapter is a virtual network interface that facilitates communication between IPv4 and IPv6 networks. There is a precedent case where this type of change was the network change detected by the Windows Time service, so **the suggestion is to disable the Teredo interface via GPO** in the Domain Controller. This should not have any impact on the operation of the machine.

Run **gpedit.msc** > Computer Configuration > Administrative Templates > Network > TCPIP Settings > IPv6 Transition Technologies and locate "**Set Teredo State**"setting:

![image.png](/.attachments/image-6b7376c0-8f94-4db4-b008-5fcc2d07a2fe.png)

Change it from "Not Configured" to "**Enabled**". Select the state "**Disabled State**" as per picture below and then run "**gpupdate /force**" on the DC ensure changes are applied:

![image.png](/.attachments/image-f7a1644e-857c-4cee-b78c-2dac18b59837.png)

When the Teredo Primary Socket is created, a function to add ICMPv6 Firewall Exceptions (both IN and OUT) is called so this is also recommended to run both commands below within elevated CMD to clean up duplicated firewall rules:

```
netsh advfirewall firewall delete rule name="Core Networking - Teredo (ICMPv6-In)"
netsh advfirewall firewall delete rule name="Core Networking - Teredo (ICMPv6-Out)"
```
Network engineer took this resolution from [WinX: NET: Svchost process with LocalServiceNoNetworkFirewall group takes up an unusual amount of CPU and RAM](https://internal.evergreen.microsoft.com/en-us/topic/38c1126f-002d-7ff6-104f-ee4eb62b0bb3). However, this is mentioned only as a reference, as the article describes a completely different issue.


#  Proactive guidance

We had a customer insisting on **how the root dispersion value is calculated** so he can do it manually. 

Windows Time is based on NTPv3 so the calculation is made according to a formula described in the standard defined by the Internet Engineering Task Force(IETF) [RFC 1305 - Network Time Protocol (Version 3) Specification, Implementation and Analysis](https://datatracker.ietf.org/doc/html/rfc1305) that you can find below:

`As described in Appendix H, the peer dispersion <$Eepsilon> includes contributions due to measurement error <$Erho~=~1~<< <<~roman sys.precision>, skew-error accumulation <$Ephi tau>, where <$Ephi~=~roman {NTP.MAXSKEW over NTP.MAXAGE}> is the maximum skew rate and <$Etau~=~roman {sys.clock~-~peer.update}> is the interval since the last update, and filter (sample) dispersion <$Eepsilon sub sigma> computed by the clock-filter algorithm. The root dispersion <$EEPSILON> includes contributions due to the selected peer dispersion <$Eepsilon> and skew-error accumulation <$Ephi tau>, together with the root dispersion for the peer itself. The system dispersion includes the select (sample) dispersion <$Eepsilon sub xi> computed by the clock-select algorithm and the absolute initial clock offset <$E| THETA |> provided to the local-clock algorithm. Both <$Eepsilon> and <$EEPSILON> are dynamic quantities, since they depend on the elapsed time <$Etau> since the last update, as well as the sample dispersions calculated by the algorithms.`

Justin's video gives us the mathematical representation of the formula:

![image.png](/.attachments/image-445d081b-d258-41fd-a7d4-5a6c17e956c7.png =326x150)
![Root_Dispersion_calculation.gif](/.attachments/Root_Dispersion_calculation-6b6a2ff9-da18-4461-a675-ebc8cfb5cc40.gif  =326x150)

As you can see calculating the Root Dispersion is not as simple as 'doing the math' because it involves a complex statistical formula. Even so, the customer was still looking for how to manually calculate it.

Instead of focusing on the detailed calculations, which can be time-consuming, if you have such request from customer, remember him that our goal is to troubleshoot the value and work on bringing it down to lower levels. This approach will be more efficient and effective in resolving the issue.