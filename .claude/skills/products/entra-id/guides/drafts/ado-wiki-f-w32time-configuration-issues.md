---
source: ado-wiki
sourceRef: "Supportability\WindowsDirectoryServices\WindowsDirectoryServices;C:\Program Files\Git\Windows Time\Workflow; Windows Time; Looking for known solutions\W32Time Configuration issues"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Time%2FWorkflow%3A%20Windows%20Time%3A%20Looking%20for%20known%20solutions%2FW32Time%20Configuration%20issues"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762352&Instance=1762352&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1762352&Instance=1762352&Feedback=2)

___
<div id='cssfeedback-end'></div>

In this article, you will find a comprehensive guide to understand w32tm configuration, along with the steps to address issues arising from suboptimal settings.

[[_TOC_]]

# Review W32tm configuration
To check the w32tm configuration and ensure that the Windows Time service is configured to use a reliable external time source, use the command `w32tm /query /configuration`.

## Time providers
By default, there are three time providers defined:

1. **NtpClient** is always enabled. It means the machine acts as NTP (Network Time Protocol) client.
2. **NtpServer** is always enabled on Domain Controllers (DC), usually disabled on domain members but note that any Windows machine, whether it's a server or client operating system, can function as an NTP server.
3. **VMICTimeProvider** is the provider that allows virtual machines (VMs) to take time from the hypervisor like Hyper-V, VMWare or Citrix. **Microsoft recommends disabling the VMICTimeProvider on domain controllers** so they do not receive conflicting time information from the host system and the domain hierarchy, preventing Time Skew as described at the articles below:
   - [Running Domain Controllers in Hyper-V](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2008-R2-and-2008/dd363553(v=ws.10)#time-service) 
   - [You receive Windows Time Service event IDs 24, 29, and 38 on a virtualized domain controller that is running on a Windows Server 2008-based host server with Hyper-V - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/windows-time-service-event-ids-24-29-38) 
   - More details about the fallback mechanism to VMIC or CMOS [below](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?wikiVersion=GBmaster&_a=edit&pagePath=/Windows%20Time/Workflow%3A%20Windows%20Time%3A%20Looking%20for%20known%20solutions/W32Time%20Configuration%20issues&pageId=1762352&anchor=fallback-mechanism).

At first glance, you just need to look at the highlighted values to check which of them are enabled:

![image of time providers configuration]( /.attachments/image-be93b411-c25f-4a13-a4a0-79ac3581e65e.png)

### NtpClient

Then we put the focus on the first provider **NTPClient** and examine the **Type** and **NtpServer** settings:

![image of NtpClient configuration]( /.attachments/image-bb910e04-b6ac-4a0d-aa54-4607462f7d13.png)

The two most common values you will encounter are:

1. **Type: NTP** means that the machine will use the server defined within the NtpServer field. This is the default configuration for non-domain joined machines and the recommended configuration for the Primary Domain Controller (PDC) of the root domain as described at: [Recommendation - Configure the Root PDC with an Authoritative Time Source and Avoid a Widespread Time Skew | Microsoft Learn](https://learn.microsoft.com/en-us/services-hub/unified/health/remediation-steps-ad/configure-the-root-pdc-with-an-authoritative-time-source-and-avoid-widespread-time-skew). 

   You can manually set a valid external time source using the example below (change time.windows.com with customer preferred NTP server):


       w32tm /config /manualpeerlist:"time.windows.com,0x9" /syncfromflags:manual /reliable:YES /update

2. **Type: NT5DS** is the value expected for any other domain member, regardless of whether it is a server or a Domain Controller. This means that the NTP client is configured to take the time from the domain hierarchy as described in the article "[How the Windows Time Service Works](https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/how-the-windows-time-service-works#domain-hierarchy-based-synchronization)". You can set time to be taken from the domain hierarchy by running:

       w32tm /config /syncfromflags:domhier /update

    Please note that when the "Type" value is set to NT5DS, the value set in the "NtpServer" field is ignored.

If configuration changes are needed, you can restart the Windows Time service to apply the changesby running the commands `net stop w32time` and `net start w32time`.

Alternatively you can run the command `w32tm /config /update` to notify the Windows Time service that the configuration has changed, causing the changes to take effect.

Finally, run the command `w32tm /resync` to force the Windows Time service to synchronize with the newly configured time source and check if the command is completed successfully (image of successful resync below) and continue with `w32tm /query /source` to check which is the time source.

![image of successful resync]( /.attachments/image-9bdefe1f-8fbd-4450-bb1b-9c84fe2e2963.png)


### NTP Server flags

When defining the NTP server, the format used is _<NTP Address>,<Flags>_" without the quotation marks and the less than and greater than characters. Multiple NTP servers can be added and separated by a simple space: _<NTP Address 1>,<Flags> <NTP Address 2>,<Flags>_. The NTP Address can be input either in FQDN or IP formats.

  
Flags in this context represents the **modus operandi** used by Windows Time Service. In general, **the NTP protocol offers five operation modes**:

*   **Symmetric Active (1)**: A host operating in this mode sends periodic messages regardless of the reachability state or stratum of its peer. By operating in this mode the host announces its willingness to synchronize and be synchronized by the peer. 

*   **Symmetric Passive (2)**: This type of association is ordinarily created upon arrival of a message from a peer operating in the symmetric active mode and persists only as long as the peer is reachable and operating at a stratum level less than or equal to the host; otherwise, the association is dissolved. However, the association will always persist until at least one message has been sent in reply. By operating in this mode the host announces its willingness to synchronize and be synchronized by the peer.

*   **Client (3)**: A host operating in this mode sends periodic messages regardless of the reachability state or stratum of its peer. By operating in this mode the host, usually a LAN workstation, announces its willingness to be synchronized by, but not to synchronize the peer.

*   **Server (4)**: This type of association is ordinarily created upon arrival of a client request message and exists only in order to reply to that request, after which the association is dissolved. By operating in this mode the host, usually a LAN time server, announces its willingness to synchronize, but not to be synchronized by the peer.

*   **Broadcast (5)**: A host operating in this mode sends periodic messages regardless of the reachability state or stratum of the peers. By operating in this mode the host, usually a LAN time server operating on a high-speed broadcast medium, announces its willingness to synchronize all of the peers, but not to be synchronized by any of them.

 Windows Server Domain Controllers are configured as time servers and use Symmetric Active mode to send synchronization requests. Time sync may not succeed if the Windows-based computer tries to sync time from NTP servers that don't run Windows and respond only to requests that use client mode as described at [Time synchronization may not succeed - Windows Server | Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/time-synchronization-not-succeed-non-ntp).

Windows, however, has four possible flags that represent its modus operandi. These flags **can also be combined** to create multi-valued flags:

*   **SpecialInterval (0x1)**: The synchronization interval (interval between each sample request) will be based off SpecialPollIntervals registry key value.

*   **UseAsFallbackOnly (0x2)**: The peer will only be contacted in case all of the other peers fail.

*   **SymmetricActive (0x4)**: Refer to modus operandi 1.

*   **Client (0x8)**: Refer to modus operandi 3.

  
The combinations will look like this:

*   **0x3** (SpecialInterval + UseAsFallbackOnly)
*   **0x9** (SpecialInterval + Client)
*   **0xA** (UseAsFallbackOnly + Client)
*   **0xB** (SpecialInterval + UseAsFallbackOnly + Client)

Reference:
      
*   [Windows Time Service NTP Server flags | Microsoft Learn](https://learn.microsoft.com/en-us/archive/msdn-technet-forums/c51d0754-8036-4ec0-8428-22385fa97b25)
*   [Configuring your PDCE with Alternate Time Sources | Microsoft Learn](https://learn.microsoft.com/en-us/archive/blogs/askds/configuring-your-pdce-with-alternate-time-sources)
*   [Configuring the Time Service: NtpServer and SpecialPollInterval | Microsoft Learn](https://learn.microsoft.com/en-us/archive/blogs/w32time/configuring-the-time-service-ntpserver-and-specialpollinterval)
*   [Parameters\NtpServer: Core Services | Microsoft Learn](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc779560(v=ws.10)?redirectedfrom=MSDN)

# Fallback mechanism
  
If a Windows machine is configured to synchronize with NTP server and this primary NTP server is not available, the machine will fall back to one of the following:
      
1.  **Internal CMOS clock** (if this is **physical machine**): This is something we cannot avoid so the best recommendation to make to customer is to ensure that CMOS clock in the machine is having the right time. Many server models support SNMP (Simple Network Management Protocol) to sync physical machine clock with external server. 
    - HP iLO: [HPE Integrated Lights Out (iLO 4) - Configuring iLO SNTP Settings](https://support.hpe.com/hpesc/public/docDisplay?docId=a00045504en_us&docLocale=en_US) 
    - Dell iDRAC: [SNMP configuration of integrated Dell remote access controller version 7 | Dell US](https://www.dell.com/support/kbdoc/en-us/000147107/snmp-configuration-of-integrated-dell-remote-access-controller-version-7)

    Please NOTE Microsoft is not responsible for the content on external websites. We recommend reviewing the information carefully and consulting with vendor if customer have any concerns.

2.  **Hypervisor clock** (if this is **Virtual Machine**): Unlike the previous case where we couldn't prevent the fallback to the physical machine's CMOS clock, in the case of VMs, we have the option to change the configuration to avoid this fallback.

    The **Windows Time mechanism** responsible for synchronizing the time of the VM with the time of the HOST is the **VMIC time provider**. This is one of the 3 time providers enabled by default. Disable it is recommended for virtualized Domain Controllers, and this is done by running:

        reg add HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\W32Time\TimeProviders\VMICTimeProvider /v Enabled /t reg_dword /d 0

    Having VMICTimeProvider enabled on physical devices triggers System **Event ID 158** "_The time provider VMICTimeProvider has indicated that the current hardware and operating environment is not supported and has stopped_", but this is just a warning and does not make any kind of impact.

    From the **hypervisor's perspective**, there is also an option to disable time synchronization between the host and the virtual machine: 

    - **For Hyper-V**, you can find this setting in the VM properties under Integration Services, called "Time synchronization":

      ![image.png](/.attachments/image-a1c4c062-dd07-4633-8aaf-331ff6b980a5.png)

    - **For VMware** machine the VM properties also offers a time setting, but it may offer two type of synchronizations: those performed periodically or those only triggered by certain actions:

      ![image.png](/.attachments/image-84650270-be89-4e0e-aa21-102f6e02618f.png)

    Unexpected time synchronizations may occur due to VMware Tools during events such as tool startup, taking a snapshot, resuming from a snapshot, resuming from suspend, or reboot. Microsoft assistance can help identify if this is the case. In some instances, updating or disabling VMware Tools and/or engaging with the vendor may be necessary. Reference:

    - [Disabling Time Synchronization for virtual machines (1189) (vmware.com)](https://kb.vmware.com/s/article/1189)
    - [Synchronize the Time of a Virtual Machine Guest Operating System with the Host](https://docs.vmware.com/en/VMware-vSphere/7.0/com.vmware.vsphere.vm_admin.doc/GUID-83E8FE8D-ACDF-4C9B-A095-860F447A442F.html)
   

      Please NOTE Microsoft is not responsible for the content on external websites. We recommend reviewing the information carefully and consulting with vendor if customer have any concerns.
