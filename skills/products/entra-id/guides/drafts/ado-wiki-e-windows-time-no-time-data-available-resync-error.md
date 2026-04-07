---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Time/Workflow: Windows Time: Looking for known solutions/"No time data was available" resync error"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Time/Workflow%3A%20Windows%20Time%3A%20Looking%20for%20known%20solutions/%22No%20time%20data%20was%20available%22%20resync%20error"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762353&Instance=1762353&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762353&Instance=1762353&Feedback=2)

___
<div id='cssfeedback-end'></div>

The guide below will help you effectively resolve the resync error "No time data was available." This is the most common time synchronization issue, but it can have multiple causes, including configuration problems, network connectivity issues, and third-party tools preventing clock time synchronization.

[[_TOC_]]

# No time data was available (source CMOS clock)

The scenario where the `w32tm /resync` fails with the error "**The computer did not resync because no time data was available**" and the command `w32tm /query /source` shows "**Local CMOS clock**" (or alternatively "Free-running System Clock") arises when the Windows Time service is not able to synchronize with the time source.

![image of the no time data was available error](/.attachments/image-b3007c05-2ea7-4a2a-8b36-ff611aa0018f.png )

### Cause 1: Connectivity issues on the network

#### eventvwr.msc

Go to **System** > Time-Service and see **Event ID 47**: "Time Provider NtpClient: No valid response has been received from manually configured peer XXXXXXXXX after 8 attempts to contact it. This peer will be discarded as a time source and NtpClient will attempt to discover a new peer with this DNS name. The error was: **The peer is unreachable**."

![image of the Time-Service System Event 47](/.attachments/image-104c5e8e-7a9c-4043-b6ed-b1da7f57d21e.png)

This issue is usually network-related, and while this event is a good indicator, **it doesn't always appear every time** the synchronization fails.

 Please note that the Microsoft port scanner tool ([PortQryUi.exe](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1200896/Network-capture-and-analysis?anchor=portqry-and-portqryui)) is expected to return exit code 2 (timeout) since no ACK response is received for any UDP port. Therefore, **the network trace is the main data to consider**.

#### Network capture

To diagnose it:
1. Start a network capture on the client using `netsh`  command as per [Network capture and analysis - Overview](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1200896/Network-capture-and-analysis?anchor=portqry-and-portqryui).
2. Then force the resynchronization with: `w32tm /resync` 
3. After the resynchronization fails, stop the capture.
4. Convert the capture using [etl2pcapng](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1200896/Network-capture-and-analysis?anchor=etl2pcapng) and filter the client network capture by `udp.port == 123` using Wireshark.

In this scenario, it is quite likely that the only packet(s) you see on the network is from the client:

![image showing one single packet, the ntp client request](/.attachments/image-b21bef05-aa2f-41e5-b574-94642461f824.png)

Not receiving a response from the server could mean that the packet was filtered and did not reach the server, or it was intercepted on its way back. A capture from a healthy scenario is expected to contain the client's NTP request and a response from the NTP server.

![image showing the ntp client request and ntp server reply](/.attachments/image-e9166b1f-290d-4de4-a841-50189e5f06cb.png)

#### Conclusion

The recommendation we should provide to the client at this point is to perform a **side-to-side network capture** on both the NTP client and the server to confirm if the packet is received at its destination.

If we do not have access to the NTP server, the recommendation would be to **involve the customer's network team** to track the packet and identify the network devices through which it has been transmitted and determine if there is any point where it is being blocked or dropped.

It is possible that the client assures that there is no firewall or similar that could be interfering with connectivity. On the client machine, you can ping the NTP server and check the **TTL (Time To Live)**. This is a value in the header of an IP packet that indicates how long the packet should remain alive in the network. This is decremented by one for each router that forwards the packet. If the TTL value reaches zero, the packet is discarded, preventing it from circulating indefinitely in the network.

The initial TTL value is set by the operating system of the target device. Common **default values are 64 for Linux** and **128 for Windows**.

In the example below, the default TTL value 128 means that there is no intermediate device between source and destination (this is what we want):

![image.png](/.attachments/image-e58b5980-7ebf-4e10-9cb5-c1fc9231e245.png)

Here the default value 128 has been reduced to 116, so in this example the packet has made 12 hops through the network to reach its destination:

![image.png](/.attachments/image-b746a907-901c-4397-b172-2e6a426b8974.png)

####  Proactive guidance (1)

Even with this evidence, you might encounter a client who insists that there are no issues with the network. At this point, it is crucial to get feedback from their networking team, as the solution will most likely come from them. Offer to share a summary email, reduce severity (if needed), and put the case on hold until the customer has feedback from their networking team.

However, there is one final method you can try to isolate the problem. Keep in mind that the result may not be conclusive and could potentially waste both your time and the client's.

You need to configure the client with "Type: NTP" pointing to an "NtpServer," which could be:

- The ideal approach is to use any machine which we know for certain that the communication does not pass through any other network device (default TTL 128 or 64).
- You can use as NtpServer the name or IP of any DC located in the same site.
- If there is no DC on the same site, you can use any Windows machine, including client operating systems like Windows 10 or Windows 11, as they also act as NTP servers as long as the "TimeProviders > NtpServer > Enabled" value is set to "1".
- You can use time.windows.com, but this option is the least ideal as it will probably fail in the same way, and the only thing this would clarify is that the server is not the cause of the problem.

---

### Cause 2: Communication issues on the machine

Keep reading to explore the same time sync issue "No time data was available" and source "local CMOS clock" with a different resolution, but I warn you in advance that this is a much less frequent scenario.

#### eventvwr.msc

You might or might not get **System** > Time-Service > **Event ID 47**: "Time Provider NtpClient: No valid response has been received from manually configured peer XXXXXXXXX after 8 attempts to contact it. This peer will be discarded as a time source and NtpClient will attempt to discover a new peer with this DNS name. The error was: The peer is unreachable."

#### Network capture

You get the network capture taken while the resync command was executed multiple times:

![image of Wireshark filtered by ntp](/.attachments/image-be948c25-9474-4196-b79c-b55667c5d862.png)

Please take into account the following tips to help you review this network capture (also applicable to any other analysis):
- How many interfaces are present on the client machine? `ipconfig /all` shows we have two preferred IPs **10.XX.XX.X** and **192.XXX.XXX.X**, and the NTP client request is sent from both.
- time.windows.com and similar endpoints are usually highly available services with load balancing endpoints, so you may get a reply from multiple IPs. In the example above, we see a response from two different NTP servers **167.XXX.XXX.X** and **54.XX.XX.X**.

- Depending on the circumstances, in the network capture examined with Wireshark or Network Monitor, you may find that the client's NTP request appears as **client**, **active**, or **request**, all of which are equivalent. Meanwhile, the server's response can be shown as **server**, **passive**, or **response**. For more details on this please review [NTP Server flags](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762352/W32Time-Configuration-issues?anchor=ntp-server-flags).

  ![image.png](/.attachments/image-fa556081-0b0c-4373-b1a7-de8b2cdf6a5e.png)

- Network Monitor has been relegated to a secondary role (please read [No Network Monitor](https://aka.ms/nonetmon) if you don't use Wireshark yet), but in this situation, we can use it to confirm packets are displayed as "**Request**" and "**Response**":

![image.png](/.attachments/image-e2ff50f3-365d-4a1a-91f5-cd821b458707.png)

#### w32time.log

If we have a response, why does it fail? Let's enable the Windows Time debug log:
```
w32tm /debug /enable /file:C:\Windows\debug\w32time.log /size:100000000 /entries:0-1003
```

Tips to have in mind while you navigate through the w32time.log:

- You may find the following sequence of actions:
  1. `Reachability: Attempting to contact peer`
  2. `Polling peer`
  3. `Sending packet to`
  4. `Sample Prepared at XXXXXXXXXXX for peer`
- Those should be followed by an answer. For this **bad scenario**, we just get "**No new NTP sample is available.**"

```
 BAD SCENARIO 

         154795 07:11:38.3961215s - Reachability: Attempting to contact peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123).
         154795 07:11:38.3961307s - Polling peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123)
         154795 07:11:38.3961385s - Sending packet to time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123) in Win2K detect mode, stage 1.
         154795 07:11:38.3961878s - PeerPollingThread: waiting forever
         154795 07:11:38.3962612s - PollIntervalChange(time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123)): reclamp: 17 -> 6 (min=4, max=17, sys=6)
         154795 07:11:38.3962710s - Peer poll: Max:64.0000000s Cur:00.0000000s
         154795 07:11:38.4004689s - Tx timestamp not returned and may be unsupported on the current network interface.
         154795 07:11:38.4004956s - PeerPollingThread: waiting 64.000s
         154795 07:11:38.9797397s - RPC Call - Query Status
         [...]
         154795 07:11:53.9948767s - RPC Call - Query Status
         154795 07:11:54.3999232s - W32TmServiceMain: timeout
         154795 07:11:54.3999780s - Sample Prepared at 133743139143999738 for peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123)
         154795 07:11:54.3999858s - ** NTP sample vector is empty.
         154795 07:11:54.3999919s - No new NTP sample is available.
         154795 07:11:54.4000177s - UpdateTimerQueue1: TN:13526080000000::: LRT:12966958280000  LUT:13525919840000 LAFLTNS:160069404 TSLGT:160069404 LTNS:864000000000
         154795 07:11:54.4000257s - W32TmServiceMain: waiting 64.000s
```

- In a **good scenario**, after the sequence mentioned above, we expect to see:
  - `ListeningThread -- response heard from`
  - `Response from peer`
  - `NtpClient is currently receiving valid time data from`
  - The good scenario allows you to observe that the w32time.log precedes the **network activity** with a **pipeline** symbol "|".
  - Additionally, we can see how the client obtains time samples from the NTP server **in batches of six**, so it can choose the best one among them.

```
 GOOD SCENARIO 

        154795 07:13:25.9189378s - ListeningThread -- response heard from 20.101.57.9:123 <- 10.96.28.4:123
       154795 07:13:25.9189497s - /-- NTP Packet:
       154795 07:13:25.9189544s - | LeapIndicator: 0 - no warning;  VersionNumber: 3;  Mode: 4 - Server;  LiVnMode: 0x1C
       154795 07:13:25.9189587s - | Stratum: 3 - secondary reference (syncd by (S)NTP)
       154795 07:13:25.9189744s - | RootDelay: 0x0000.004Bs - 0.00114441s;  RootDispersion: 0x0000.06C2s - 0.0263977s
       154795 07:13:25.9189821s - | ReferenceClockIdentifier: 0x1942E602 - source IP: 25.66.230.2
       154795 07:13:25.9189869s - | ReferenceTimestamp:   0xEAC5C2CF6069F567 - 13374313807376616800ns - 154795 07:10:07.3766168s
       154795 07:13:25.9189937s - | OriginateTimestamp:   0xEAC5C395DDB60AE9 - 13374314005866059000ns - 154795 07:13:25.8660590s
<     154795 07:13:25.9190001s - | ReceiveTimestamp:     0xEAC5C3966440D5B3 - 13374314006391614300ns - 154795 07:13:26.3916143s
       154795 07:13:25.9190066s - | TransmitTimestamp:    0xEAC5C3966441106B - 13374314006391617800ns - 154795 07:13:26.3916178s
       154795 07:13:25.9190136s - >-- Non-packet info:
       154795 07:13:25.9190169s - | DestinationTimestamp: 154795 07:13:25.9190199s - 0xEAC5C395EB3E0D81154795 07:13:25.9190226s -  - 13374314005918915600ns154795 07:13:25.9190255s -  - 154795 07:13:25.9189156s
       154795 07:13:25.9190292s - | RoundtripDelay: 52853100ns (0s)
       154795 07:13:25.9190345s - | LocalClockOffset: 499128700ns - 0:00.499128700s
       154795 07:13:25.9190431s - \--
        154795 07:13:25.9190580s - ListeningThread STC:86572769
         154795 07:13:25.9190694s - Peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123) is not Win2K. Setting compat flags.
         154795 07:13:25.9190759s - PollIntervalChange(time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123)): peer receive: 0 -> 6
         154795 07:13:25.9190819s - Peer poll: Max:32.0000000s Cur:31.9473093s
         154795 07:13:25.9190903s - Response from peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123), ofs: +00.4991287s
        154795 07:13:25.9190993s - TSI_PhaseOffset returned:440659864288
       154795 07:13:25.9191046s - 5 Age:5 Ofs:+00.0000000s COfs:+00.0000000s Dly:+00.0000000s RDly:+00.0000000s Dsp:16.0000127s RDsp:00.0000000s Pnt:00.0000508s Dst:16.0000000s FDsp:00.2500001s Jitter:00.0000000s AgeTime:+13374314005.9190973s stc:0
       154795 07:13:25.9191234s - 4 Age:4 Ofs:+00.0000000s COfs:+00.0000000s Dly:+00.0000000s RDly:+00.0000000s Dsp:16.0000127s RDsp:00.0000000s Pnt:00.0000508s Dst:16.0000000s FDsp:00.7500004s Jitter:00.0000000s AgeTime:+13374314005.9190973s stc:0
       154795 07:13:25.9191428s - 3 Age:3 Ofs:+00.0000000s COfs:+00.0000000s Dly:+00.0000000s RDly:+00.0000000s Dsp:16.0000127s RDsp:00.0000000s Pnt:00.0000508s Dst:16.0000000s FDsp:01.7500011s Jitter:00.0000000s AgeTime:+13374314005.9190973s stc:0
6<     154795 07:13:25.9191607s - 2 Age:2 Ofs:+00.0000000s COfs:+00.0000000s Dly:+00.0000000s RDly:+00.0000000s Dsp:16.0000127s RDsp:00.0000000s Pnt:00.0000508s Dst:16.0000000s FDsp:03.7500026s Jitter:00.0000000s AgeTime:+13374314005.9190973s stc:0
       154795 07:13:25.9191780s - 1 Age:1 Ofs:+00.0000000s COfs:+00.0000000s Dly:+00.0000000s RDly:+00.0000000s Dsp:16.0000006s RDsp:00.0000000s Pnt:00.0000024s Dst:16.0000000s FDsp:07.7500027s Jitter:00.0000000s AgeTime:+13374314005.9190973s stc:0
       154795 07:13:25.9191952s - 0 Age:0 Ofs:+00.4991287s COfs:+00.4991287s Dly:+00.0528531s RDly:+00.0011444s Dsp:00.0000008s RDsp:00.0263977s Pnt:00.0000000s Dst:00.0528531s FDsp:07.7500031s Jitter:00.0000000s AgeTime:+00.0001817s stc:86572769
       154795 07:13:25.9192127s - Peer jitter: 00.0000000s Filter Dispersion: 07.7500031s
        154795 07:13:25.9192375s - Reachability:  peer time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123) is reachable.
         154795 07:13:25.9192446s - Logging information: NtpClient is currently receiving valid time data from time.windows.com,0x8 (ntp.m|0x8|0.0.0.0:123->20.101.57.9:123).
```

#### Conclusion

We have verified that we are receiving packets at the network layer, but there is something in the NTP client machine that prevents that information from reaching the application layer where the w32time service resides. On the affected machine, we should **discard firewall, antivirus, and any security agent client that performs packet software inspection**. You can use the `fltmc` command (example below) and the Microsoft Public article [Allocated filter altitudes](https://learn.microsoft.com/en-us/windows-hardware/drivers/ifs/allocated-altitudes) to check which third-party filter drivers are installed and ask the client to exclude them.

```
C:\> fltmc

Filter Name                     Num Instances    Altitude    Frame
------------------------------  -------------  ------------  -----
bindflt                                 0       409800         0         Microsoft
DfsDriver                               0       405000         0         Microsoft
PROCMON24                               0       385200         0         Microsoft
CAADFlt                                 5       365601         0         Quest Software Inc.
CSAgent                                 7       321410         0         CrowdStrike Ltd.
DfsrRo                                  0       261100         0         Microsoft
storqosflt                              0       244000         0         Microsoft
wcifs                                   0       189900         0         Microsoft
CldFlt                                  0       180451         0         Microsoft
FileCrypt                               0       141100         0         Microsoft
luafv                                   1       135000         0         Microsoft
UnionFS                                 0       130850         0         Filesystem service for Linux, not relevant for us here
npsvctrig                               1        46000         0         Microsoft
Wof                                     1        40700         0         Microsoft
```

####  Proactive guidance (2)
Customers may present various arguments to suggest that third-party drivers are not the cause of the issue, such as: "_the same third-party software has been running for years_," "_the same third-party software is installed in different scenarios where no issues are found_," "_we cannot disable it_," or "_we have already disabled it and the issue persists._"

Please note the following:

- We only suggest discarding third-party components after we have already collected data when it does not show any malfunctioning from the system and components Microsoft is responsible for.
- We suggest excluding third-party filter drivers because no Microsoft tool will be able to trace the activity they perform. Disabling them is not sufficient; they need to be uninstalled, and the machine must be rebooted.
- Discarding third-party components is the fastest way to proceed, especially in a critical situation.
- If the issue cannot be reproduced after removing the third-party software, we will provide a summary email with Microsoft's statement. The customer can then share our findings when reaching out to the vendor to investigate the software's behavior, as they must have their own logs and tools.
- Try to capture the customer's sentiment. If the issue is resolved after the software removal and they trust your judgment, they will be happy for us to be disengaged. However, to give them greater peace of mind, we can offer to remain on hold for a few days while they get feedback from the vendor. Ideally, reach an agreement with the customer and set a deadline, as otherwise, you might have to keep the case on hold indefinitely.

---

### Cause 3: NtpClient disabled or service is stopped

This is a quick one. The reason for the "**The computer did not resync because no time data was available**" during the resync may fall under configuration problems:

1. If the `w32tm /query /configuration` shows `The following error occurred: The service has not been started. (0x80070426)`, start the service (`net start w32time`) and retry.

2. Ensure the NtpClient time provider is enabled:

```
C:\>w32tm /query /configuration

[...]

NtpClient (Local)
DllName: C:\Windows\system32\w32time.dll (Local)
Enabled: 0 (Local)
InputProvider: 1 (Local)
```

If this is disabled, go to regedit at path `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient`, change **Enabled** from 0 to 1, restart the w32time service, and retry.

---

### Cause 4: Excessive time difference in the NTP server

In this scenario, we have:

- **DC1** is the PDC (Primary Domain Controller) configured with **NTP** type pointing to an external NTP server on the internet.
- **DC2** and **DC3** are standard Domain Controllers configured with **NT5DS** type to take time from PDC.
- **WS1**, **WS2**, **WS3**, and **WS4** are the client computers (workstations) configured with **NT5DS** type to take time from Domain Controllers.

```
        DC1 (PDC)
           |
    ---------------
    |             |
   DC2           DC3
    |             |
  -----         -----
  |   |         |   |
 WS1 WS2       WS3 WS4
```

The resync in the **NTP client** (DC2) shows "The computer did not resync because no time data was available."

#### eventvwr.msc

**System** events can vary significantly from one machine to another, so they might not be significant. However, it is mainly advisable to focus on client events with **Time-Service** source.

#### Network capture

Nothing relevant about the **network trace**; Wireshark will display traffic activity for both the client and server.

#### w32time.log

The Windows Time debug log confirms that we got a response from the NTP server (DC1) but the key point is that the **response received is ignored**:

```
 BAD SCENARIO 

         154801 17:17:24.5549349s - Reachability: Attempting to contact peer DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123).
         154801 17:17:24.5549515s - Polling peer DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123)
         154801 17:17:24.5549643s - Sending packet to DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123) in Win2K detect mode, stage 1.
         154801 17:17:24.5551755s - PollIntervalChange(DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123)): reclamp: 15 -> 6 (min=4, max=15, sys=6)
         154801 17:17:24.5551948s - Peer poll: Max:64.0000000s Cur:00.0000000s
         154801 17:17:24.5564490s - ListeningThread -- DataAvailEvent set for socket 1 (0.0.0.0:123)
         154801 17:17:24.5564820s - TSI_PhaseOffset returned:687049537456
         154801 17:17:24.5564943s - HA Pkt Rcv: delay:0 DestTimeStamp:133748686445564770
         154801 17:17:24.5565056s - Rx timestamp not returned and may be unsupported on the current network interface.
         154801 17:17:24.5565160s - ListeningThread -- response heard from 192.168.100.2:123 <- 192.168.100.3:123
         154801 17:17:24.5685670s - Tx timestamp not returned and may be unsupported on the current network interface.
         154801 17:17:24.5686302s - PeerPollingThread: waiting 64.000s
         154801 17:17:24.5692992s - /-- NTP Packet:
         154801 17:17:24.5693042s - | LeapIndicator: 0 - no warning;  VersionNumber: 3;  Mode: 4 - Server;  LiVnMode: 0x1C
         154801 17:17:24.5693089s - | Stratum: 3 - secondary reference (syncd by (S)NTP)
         154801 17:17:24.5693117s - | Poll Interval: 15 - out of valid range;  Precision: -23 - 119.209ns per tick
         154801 17:17:24.5693205s - | RootDelay: 0x0000.1289s - 0.072403s;  RootDispersion: 0x0010.0000s - 16s
         154801 17:17:24.5693280s - | ReferenceClockIdentifier: 0xA7EB4543 - source IP: 167.235.69.67
         154801 17:17:24.5693321s - | ReferenceTimestamp:   0xEACE3A17A2A36D57 - 13374868631635306200ns - 154801 17:17:11.6353062s
         154801 17:17:24.5693383s - | OriginateTimestamp:   0xEACE3A248E12B28A - 13374868644554972800ns - 154801 17:17:24.5549728s
         154801 17:17:24.5693442s - | ReceiveTimestamp:     0xEACE3A248EA1E9CA - 13374868644557158100ns - 154801 17:17:24.5571581s
         154801 17:17:24.5693503s - | TransmitTimestamp:    0xEACE3A248EDCF96A - 13374868644558059300ns - 154801 17:17:24.5580593s
         154801 17:17:24.5693567s - >-- Non-packet info:
         154801 17:17:24.5693599s - | DestinationTimestamp: 154801 17:17:24.5693623s - 0xEACE3A248E7546D3154801 17:17:24.5693647s -  - 13374868644556477000ns154801 17:17:24.5693673s -  - 154801 17:17:24.5564770s
         154801 17:17:24.5693709s - | RoundtripDelay: 603000ns (0s)
         154801 17:17:24.5693759s - | LocalClockOffset: 1883800ns - 0:00.001883800s
         154801 17:17:24.5693828s - \--
         154801 17:17:24.5694022s - ListeningThread STC:125864420
         154801 17:17:24.5694127s - Response received from domain controller DC1.Contoso.com authenticated successfully (using signature format)
         154801 17:17:24.5694219s - Peer DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123) is not Win2K. Setting compat flags.
         154801 17:17:24.5694315s - Packet test 8 failed (bad value for root delay or root dispersion).
         154801 17:17:24.5694401s - Ignoring packet that failed tests from DC1.Contoso.com (ntp.d|0.0.0.0:123->192.168.100.2:123).
         154801 17:17:25.0353386s - W32TimeHandler called: SERVICE_CONTROL_INTERROGATE
```

#### Conclusion

This may happen when the **NTP server** (DC1) made a time change abruptly. Check in the NTP server for **System event ID 50** that informs us that "the time service detected a time difference of greater than 5000 milliseconds for 900 seconds." This is a precautionary measure that **prevents the NTP server from providing the time to clients**, so the solution for the sync error in the client will come from solving the time issue on the server first. This event ID 50 does not appear every time, so you should consider all the other information you can gather on the NTP server.

![Example of event ID 50](/.attachments/image-548dffd9-e219-46a5-bacc-a32da55e316b.png)

To check in the remote if there is any time **deviation between domain controllers**, consider using the command `w32tm /monitor` and review the offset values:

```
C:\> w32tm /monitor
DC2.Contoso.com[[fe80::3f31:a6d7:6719:b913%6]:123]:
    ICMP: 0ms delay
    NTP: -0.0045331s offset from DC1.Contoso.com               The offset between DC2 and DC1 is -0.0045331s
        RefID: DC1.Contoso.com [192.168.100.2]
        Stratum: 4
DC1.Contoso.com *** PDC ***[192.168.100.2:123]:
    ICMP: 0ms delay
    NTP: +0.0000000s offset from DC1.Contoso.com               The offset of DC1 with itself will be always 0
        RefID: mc1.root.project-creative.net [54.XX.XXX.36]
        Stratum: 3
```

---

### Cause 5: A different application is using the 123 UDP port

This is a rare case where the **NTP client** executes `w32tm /resync` and also returns "The computer did not resync because no time data was available."

#### eventvwr.msc

You most probably will observe that no **System** events are generated at all during the error reproduction.

#### Network capture

The **network capture** might or might not display traffic. I assume you took the trace using TSS or `netsh` command, converted to pcapng format, and filtered by `udp.port == 123`. The key point if you see NTP client activity is to review Wireshark packet details > Packet comments and check which is the PID:

![Example of Wireshark packet details](/.attachments/image-2104f657-3d88-4772-b6ef-fc5978af9824.png)

You can use the PS command below to identify which process is using UDP 123 and correlate with network capture:

```powershell
Get-Process -Id (Get-NetUDPEndpoint -Localport 123).owningprocess
```

The Windows Time Service runs into a shared process, so you should get "**svchost.exe**". To check which process is running within that container, run the `tasklist /svc` ("**findstr**" is key sensitive) and confirm both process IDs match:

```powershell
 GOOD SCENARIO 

    PS C:\> Get-Process -Id (Get-NetUDPEndpoint -Localport 123).owningprocess

    Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName
    -------  ------    -----      -----     ------     --  -- -----------
       1132      13     3404       9372       0.52   9512   0 svchost

    PS C:\> tasklist /svc | findstr W32Time
    svchost.exe                  9512 W32Time
```

In the output below, the port was taken by a PowerShell script, which causes the Windows Time service to be unable to perform the resync:

```powershell
 BAD SCENARIO 

    PS C:\> Get-Process -Id (Get-NetUDPEndpoint -Localport 123).owningprocess

    Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName                                                                
    -------  ------    -----      -----     ------     --  -- -----------                                                                
        672      32    68496       2832       0.98   2864   2 powershell      

    tasklist /svc | findstr W32Time
    svchost.exe                   4744 W32Time         
```

#### w32time.log

The Windows Time debug log will display the message "No new NTP sample is available," as observed in the previous scenarios. The key indicator in the w32time.log for this situation is that listening sockets should be created during the restart of the w32time service:


```powershell
 GOOD SCENARIO 

         154764 20:36:02.1663905s - NtpProvider: Created 2 sockets (0 listen-only): [::]:123<0x0>, 0.0.0.0:123<0x0>
         154764 20:36:02.5065764s - ListeningThread -- DataAvailEvent set for socket 1 (0.0.0.0:123)
```

In this scenario, where a third-party tool is occupying the port, the Windows Time debug log indicates that no sockets have been created:

```
 BAD SCENARIO 

         154876 20:38:27.3985186s - NtpProvider: Created 0 sockets.
         154876 20:38:43.3996309s - ** NTP sample vector is empty.
         154876 20:38:43.3997367s - No new NTP sample is available.
```

#### Conclusion

If a third-party time sync utility or any other software is using UDP port 123, the Windows Time service won't be able to use the port and return "**The computer did not resync because no time data was available**."


####  Proactive guidance (3)

- Ports used by system services are well-known, and it is unexpected for third-party software to use them. Refer to the table at [Service overview and network port requirements for Windows](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/service-overview-and-network-port-requirements#ports-and-protocols).

- The client might expect us to somehow change the port used by the Windows Time service, which is not possible. The client should instead focus on determining the purpose of the other application and confirm if it can be configured to use a different network port. Otherwise, the client will need to choose between the third-party software and the Windows Time service, as both cannot coexist.

- If these details are not enough to convince the client, we can ask them to confirm whether the other application using UDP port 123 can be stopped without affecting the server's functionality. If so, once that application is not running, restart the Windows Time service and perform a successful resync to empirically demonstrate our working theory to the client.



### Cause 6: CrossSiteSyncFlags restricts time source 
  
The`REG_DWORD` named `CrossSiteSyncFlags` at  
`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\NtpClient`  
controls how the Windows Time Service handles cross-site synchronization, with valid values of`0`,`1`, or`2`. 

Ref: [[MS-W32T]: NTP Client Provider Elements | Microsoft Learn](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-w32t/205a1925-d3e3-4912-bff8-271e7037fd75)

| *Value* | *Meaning* |
| --- | --- |
| NCCSS_None  <br>0x00000000<br> | Thetime service SHOULD NOT select atime source outside the same site as the machine.<br> |
| NCCSS_PdcOnly  <br>0x00000001<br> | The time service SHOULD select only theprimary domain controller (PDC)as its time source.<br> |
| NCCSS_All  <br>0x00000002<br>**(Default)** | The time service is allowed to select a time source inside or outside the same site as the machine.<br> |

When CrossSiteSyncFlags = 0x2, Ntpclient is allowed to search in other Active Directory sites, so it should be able to find a good time source but with value 0x0 if the machine is not finding a good time source in its site, it stops searching and ntp client resync will experience the "**The computer did not resync because no time data was available**".

---

# Hands on lab

Please download the lab guide and the dataset obtained from various scenarios where an NTP client runs `w32tm /resync`, all of them resulting in the error "**The computer did not resync because no time data was available**". 

Can you identify the most probable cause for each of the scenarios?

| Download link  | Filename | Last update |
|--|--|--|
| https://aka.ms/WindowsTimeLabGuide | Windows Time - No time data was available - Lab Guide.docx | 31-Dec-2024 |
| https://aka.ms/WindowsTimeLabData | Windows Time - No time data was available - Lab data.zip | 4-Nov-2024 |