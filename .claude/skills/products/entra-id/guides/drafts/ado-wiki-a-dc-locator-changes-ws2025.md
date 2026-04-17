---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Changes in Windows Server 2025 and Windows 11 24H2/DC Locator changes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Changes%20in%20Windows%20Server%202025%20and%20Windows%2011%2024H2%2FDC%20Locator%20changes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1715192&Instance=1715192&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1715192&Instance=1715192&Feedback=2)

___
<div id='cssfeedback-end'></div>

![VNext-Banner.png](/.attachments/VNext-Banner-098bb40b-bb91-44b9-9e54-14a3e12b6701.png)
[[_TOC_]]

**Note:** Before diving into the details of the new feature, this document provides a primer on the topic to ensure readers have the necessary background and context to fully understand the changes.

**Pre-reqs:**
- Domain Controller Locator [Click here](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/570974/Domain-Controller-Locator-(DCLocator))
- Locating domain controllers in Windows and Windows Server [Click here0](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/dc-locator?tabs=dns-based-discovery)


# Locating domain controllers in Windows and Windows Server

Domain controller location, also known as _DC Locator_, refers to the algorithm the client machine uses to find a suitable domain controller. Domain controller location is a critical function in all enterprise environments to allow client authentication with Active Directory.

In this article, learn about the domain controller locator process, including discovery, closest site detection, and configuration of NetBIOS domain name mappings.

## Domain controller locator process

The domain controller locator (Locator) algorithm consists of two parts:

- Locator finds which domain controllers are registered.

- Locator submits a query to locate a domain controller in the specified domain.

An LDAP User Datagram Protocol (UDP) lookup is then sent to one or more of the domain controllers listed in the response to ensure their availability. Finally, the _Netlogon service_ caches the discovered domain controller to aid in resolving future requests.

### Discovery process

Active Directory domains always have two distinct names: the DNS fully qualified domain name (FQDN) and the NetBIOS domain name. NetBIOS domain names have legacy length and other constraints. For example, NetBIOS domains are limited to 15 characters.

The NetBIOS domain name of an Active Directory domain doesn't need to be the same as the Active Directory domains FQDN. For example, an Active Directory domain's FQDN might be `contoso.com` with a NetBIOS domain name of `fabrikam`.

DC location in Windows can operate in two basic modes:

- **DNS-based discovery** is based on domain controller advertisement using DNS.

  Domain controllers register various SRV records in DNS, such as records that represent key capabilities like Key Distribution Center or Global Catalog, and records that describe locality like Active Directory site records. Clients query DNS for the appropriate SRV records and then ping those servers by using UDP-based LDAP pings.

  This mode is supported only when you use DNS domain names and your domain controllers are running Windows 2000 and later. Supported domain controllers run more optimally in this mode but can change to the other mode in certain scenarios.

- **NetBIOS-based discovery** involves domain controllers registering records in [Windows Internet Name Service (WINS)](https://learn.microsoft.com/en-us/windows-server/networking/technologies/wins/wins-top). Clients query WINS for the appropriate records, followed by pinging the possible target candidate DCs. A variant of this mode uses a broadcast mechanism supported by [mailslot messages](https://learn.microsoft.com/en-us/windows/win32/ipc/about-mailslots) where the client broadcasts packets on its local network to look for DCs.

> **[!IMPORTANT]**
> When an application requests a DC but specifies a short NetBIOS-style domain name, DC location always tries to map that short domain name to a DNS domain name. If DC location can map the domain names successfully, it uses DNS-based discovery with the mapped DNS domain name.

**NetBIOS-style domain names are mapped to DNS domain names from multiple sources in the following order:**

1. Cached information from a previous lookup

1. All domains in the current forest

1. Top-level names (TLNs) for all trusting forest trusts and external trusts

1. For Windows Server 2025 and later:

   > **[!IMPORTANT]**
   > Windows Server 2025 is in PREVIEW. This information relates to a prerelease product that may be substantially modified before it's released. Microsoft makes no warranties, expressed or implied, with respect to the information provided here.

   1. Administrator-configured domain name mappings

   1. Domain name mappings for all forests and child domains in trusting forest trusts

1. Sign-in sessions on the client machine

When none of these sources can find a DNS domain name, DC location can proceed with NetBIOS-based discovery by using the original NetBIOS-style short domain name

Beginning with Windows Server 2025, Netlogon downloads and caches naming information about domains and child domains in all trusting forests. This information is used when you're mapping NetBIOS-style domain names to DNS domain names.

We recommend using DNS-based discovery instead of NetBIOS-based discovery. DNS-based discovery is more reliable and secure. [DsGetDcName](https://learn.microsoft.com/en-us/windows/win32/api/dsgetdc/nf-dsgetdc-dsgetdcnamew) is the primary DC location API.

> **[!IMPORTANT]**
> Beginning with Windows Server 2025, DC locator doesn't allow the use of NetBIOS-style location. To learn how to configure this behavior, see the [NetBIOS discovery policy setting](#netbios-discovery-policy-setting) section.

To learn about the discovery process, select the tab that corresponds to the method you want to learn about.

#### [DNS-based discovery](#tab/dns-based-discovery)

The process that the Locator follows can be summarized as follows:

1. On the client (the computer that is locating the domain controller), the Locator is initiated as a remote procedure call (RPC) to the local Netlogon service. The Netlogon service implements the Locator API (`DsGetDcName`).

1. The client collects the information that is needed to select a domain controller and passes the information to the Netlogon service by using the `DsGetDcName` API.

1. The Netlogon service on the client uses the collected information to look up a domain controller for the specified domain. The lookup process uses one of the following two methods:

1. Netlogon queries DNS by using the IP/DNS-compatible Locator. `DsGetDcName` calls the DnsQuery call to read the Service Resource (SRV) records and A records from DNS after it appends the domain name to the appropriate string that specifies the SRV records.

    - When a workstation signs in to a Windows-based domain, it queries DNS for SRV records in the format `_<service>._<protocol>.<DnsDomainName>`. Clients querying DNS for an LDAP server for the domain using the following format, where `DnsDomainName` is the domain name.

      `_ldap._tcp.DnsDomainName`

1. The Netlogon service sends a datagram as an LDAP UDP search to the discovered domain controllers that register the name.

1. Each available domain controller responds to the datagram to indicate that it's currently operational and then returns the information to `DsGetDcName`.

1. The Netlogon service returns the information to the client from the domain controller that responds first.

1. The Netlogon service caches the domain controller information so that it isn't necessary to repeat the discovery process for subsequent requests. Caching this information encourages the consistent use of the same domain controller and, thus, a consistent view of Active Directory.

#### [NetBIOS-based discovery](#tab/netbios-based-discovery)

The process that the Locator follows can be summarized as follows:

1. On the client (the computer that is locating the domain controller), the Locator is initiated as a remote procedure call (RPC) to the local Netlogon service. The Netlogon service implements the Locator API (`DsGetDcName`).

1. The client collects the information that is needed to select a domain controller and passes the information to the Netlogon service by using the DsGetDcName API.

1. The Netlogon service on the client uses the collected information to look up a domain controller for the specified domain. The lookup process uses one of the following two methods:

1. For a single label name, Netlogon performs domain controller discovery by using the Windows NT 4.0compatible Locator. The Windows NT 4.0compatible Locator uses the transport-specific mechanism (for example, WINS).

1. The Netlogon service sends a datagram as a mailslot message to the discovered domain controllers that register the name.

   > **[!IMPORTANT]**
   > WINS and mailslots were deprecated in Windows Server 2022 and Windows Server 2025 respectively, as these legacy technologies are no longer secure in today's environments. To learn more, see [Features removed or no longer developed starting with Windows Server 2022](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2022) and [Features removed or no longer developed starting with Windows Server 2025](https://learn.microsoft.com/en-us/windows-server/get-started/removed-deprecated-features-windows-server-2025).

1. Each available domain controller responds to the datagram to indicate that it's currently operational and then returns the information to DsGetDcName.

1. The Netlogon service returns the information to the client from the domain controller that responds first.

1. The Netlogon service caches the domain controller information so that it isn't necessary to repeat the discovery process for subsequent requests. Caching this information encourages the consistent use of the same domain controller and, thus, a consistent view of Active Directory.

# **Whats New with DC Locator changes in Windows Server 2025 and Windows11 24H2?**

### NetBIOS discovery policy setting

Beginning with Windows Server 2025, DC locator doesn't allow the use of the NetBIOS-based discovery. `BlockNetBIOSDiscovery` is a new group policy setting for the Netlogon service that allows administrators to control this behavior. To access the policy in Group Policy Management Editor, go to **Computer Configuration** > **Administrative Templates** > **System** > **Net Logon** > **DC Locator DNS Records** > **Block NetBIOS-based discovery for domain controller location**.

The following settings apply to `BlockNetBIOSDiscovery`:

- `TRUE` (default): DC locator doesn't allow the use of NetBIOS-style DC location.
- `FALSE`: DC locator allows the use of WINS or mailslot-based discovery if all legacy constraints also allow it.

You use the `BlockNetBIOSDiscovery` setting to enforce a secure-by-default posture for DC location. We recommend that you keep it set to `TRUE`. Disable it only for temporary periods while you're pursuing other mitigations.

The new policy setting looks like this:

![image.png](/.attachments/image-c2bc73ad-f81d-4fd4-93d1-96a2d38ce565.png =800x600)



> **[!TIP]**
> You can separately enable or disable the ability to use mailslots on a machine-wide basis by using the SMB `EnableMailslots` policy setting. For DC locator to be able to use mailslots for DC discovery, you must enable mailslots at the SMB level and disable `BlockNetBIOSDiscovery`. You can query and set the `EnableMailslots` setting by running the `Get-SmbClientConfiguration` and `Set-SmbClientConfiguration` PowerShell cmdlets.

[The beginning of the end of Remote Mailslots as part of Windows Insider](https://techcommunity.microsoft.com/t5/storage-at-microsoft/the-beginning-of-the-end-of-remote-mailslots-as-part-of-windows/ba-p/3762048)

##**DC Locator - NETBIOS to DNS name Mapping**

Beginning with Windows Server 2025, forest administrators can configure custom mappings from DNS domain name to NetBIOS domain name. Administrator-configured mappings at the forest level are an optional mechanism that you should use only when all other options are insufficient. For example, if an application or environment requires other domain name mappings that other sources can't automatically provide

The custom domain name mappings are stored in a `serviceConnectionPoint` object located in the naming context for the Active Directory configuration. For example:

`CN=DCLocatorDomainNameMappings,CN=Windows NT,CN=Services,CN=Configuration,DC=contoso,DC=com`

The `msDS-Setting`s attribute of this `serviceConnectionPoint` object can contain one or more values. Each value contains the DNS domain name and the NetBIOS domain name, separated by a semicolon as in, ```DNSdomainName:NetBIOSdomainName```


For example:

- `contoso.com:fabrikam`
- `tatertots.contoso.com:tots`
- `tailspintoys.com:tailspintoys`

![image.png](/.attachments/image-4e6278f0-0498-4e49-8490-044861ecbad7.png)

You can configure these mappings in the Active Directory Domains and Trusts management settings by following these steps:

1. Right-click the domain.
1. Select **Properties**.
1. Select the **DC locator mappings** tab.

The Netlogon service on clients then downloads and caches the custom mappings in the `DCLocatorDomainNameMappings` object every 12 hours. The service automatically uses this information when you're mapping NetBIOS-style domain names to DNS domain names.

**The new Active Directory Domains and Trusts management page looks like this:** <br>

![image.png](/.attachments/image-31d9516d-43e3-4178-810f-8cca1a61bb4b.png =600x500)

> **[!IMPORTANT]**
> Configure administrator-configured forest-level domain name mappings only when you're sure that all other name mapping sources are insufficient. As a general rule, such arbitrary mappings are necessary only when no trust relationship exists between clients and the target domains, and client applications can't be migrated over to specifying DNS-style domain names.

##**How it works in previous versions:**

![image.png](/.attachments/image-74384c1e-9c78-4c1b-a7fe-a83423cae6f2.png =900x230)

**Scenario:** A user is trying to discover a domain controller in the contoso domain.  <br>
**Equivalent command:** nltest /dsgetdc:contoso /force

- Reviews the cached information from a previous lookup
- Validates all the domains in the current forest 
- Check for Trusted Name lists for all thhe trusting forest trusts and external trusts
- Sign-In sessions or Logged on user sessions on the client machines
- Finally tries a netbios based discovery 

##**How it works in Windows Server 2025 and Windows11 24H2**

![image.png](/.attachments/image-24bf7a56-fdb1-4d64-8fd0-7815edcbbebd.png =900x230)

**Scenario:** A user is trying to discover a domain controller in the contoso domain.  <br>
**Equivalent command:** nltest /dsgetdc:contoso /force

- Reviews the cached information from a previous lookup
- Validates all the domains in the current forest 
- Check for Trusted Name lists for all thhe trusting forest trusts and external trusts
- **Checks for the Administrator configured domain name mappings**
- **Reviews the All domain mappings from trust scanner** 
- Sign-In sessions or Logged on user sessions on the client machines

##Domain Name mapping cache

- Domain name mapping cache is updated every 12 hours on the machine
- You can view the Domain name mapping cache using the command : 

As you can observe you can find an Admin enabled Domain Name cache agains the treyresearch.com cache. 

```
c:\nltest.exe /list_dclocmappings
Trust: fabrikam.com (FABRIKAM)
Trust: contoso.com (CONTOSO)
Trust: emea.contoso.com (EMEA)
Admin: treyresearch.com (tailspintoys) ------> This is the Admin created Domain Name Cache 
Two-way trust scaninfo: fabrikam.com (FABRIKAM)

```
- You can refresh and update the Domain Name mapping using the below method
```
C:\Nltest /update_dclocmappings
A DC locator name mappings update request was successfully submitted. Please check the Microsoft-Windows-Security-Netlogon/Operational event log for details on the outcome of the request.

The command completed successfully
```

**Event Logs:** 
You can review the event logs for Domain Name cache update events
Event Viewer | Application and Services Logs | Microsoft | Windows | Security - Netlogon

```
Log Name:      Microsoft-Windows-Security-Netlogon/Operational
Source:        Microsoft-Windows-Security-Netlogon
Date:          10/25/2024 9:01:21 AM
Event ID:      9011
Task Category: LOCATOR
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      vNextDC01.contoso.com
Description:
Netlogon successfully downloaded the latest administrator-configured domain name mappings. Run 'nltest.exe /list_dclocmappings' to view the data.
```

```
Log Name:      Microsoft-Windows-Security-Netlogon/Operational
Source:        Microsoft-Windows-Security-Netlogon
Date:          10/25/2024 9:01:21 AM
Event ID:      9013
Task Category: LOCATOR
Level:         Information
Keywords:      
User:          SYSTEM
Computer:      vNextDC01.contoso.com
Description:
Netlogon successfully downloaded the latest trusted-domain-based domain name mappings. Run 'nltest.exe /list_dclocmappings' to view the data.
```

**Netlogon.log snippet**
- Enable Netlogon logging to a level : 2fffffff by running the command: <br>
**nltest /dbflag:2fffffff**

```
10/24 08:59:48 [MISC] [1012] NetrServerQueryLocatorNameMappings: starting
10/24 08:59:48 [MISC] [1012] NetrServerQueryLocatorNameMappings: returning NetStatus:0x0
```