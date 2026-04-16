# AVD 其他杂项 — 排查工作流

**来源草稿**: ado-wiki-a-azure-academy.md, ado-wiki-a-demystifying-avd-introduction.md, ado-wiki-a-eee-mapping.md, ado-wiki-a-welcome.md, ado-wiki-admin-highlights-setup.md, ado-wiki-admin-highlights-troubleshooting.md
**Kusto 引用**: (无)
**场景数**: 44
**生成日期**: 2026-04-07

---

## Scenario 1: **Dean Cefola** from **Azure Academy** has created several videos on various Azure, AVD and FSLogix related topics which can be very useful for anyone starting or wanting to improve in these areas.
> 来源: ado-wiki-a-azure-academy.md | 适用: \u901a\u7528 \u2705

### 排查步骤
If you want to learn more about Azure Academy, visit the [Azure Academy YouTube channel](https://www.youtube.com/channel/UC-MXgaFhsYU8PkqgKBdnusQ).
Some of the most useful videos/playlists for AVD engineers:
Azure:
   - [New to Azure, Start at the Beginning | Azure Fundamentals](https://www.youtube.com/playlist?list=PL-V4YVm6AmwWLTTwZdI7hcpKqTpFUIKUE)
   - [Azure Active Directory Zero to Hero!](https://www.youtube.com/playlist?list=PL-V4YVm6AmwUFpC3rXr2i2piRQ708q_ia)
   - [Networking is the Foundation of Azure, Get it Right!](https://www.youtube.com/playlist?list=PL-V4YVm6AmwXRd3XaREBJbsHzI7nekPvK)
   - [ARM Templates](https://www.youtube.com/playlist?list=PL-V4YVm6AmwXrfxknWYDduzSk5TO-8qZx)
   - [Azure Storage](https://www.youtube.com/playlist?list=PL-V4YVm6AmwWV7TtgmBx3VdIBLGpSvEFb)
   - [Azure Image Management](https://www.youtube.com/playlist?list=PL-V4YVm6AmwUOW4rdQ0RgW4565b3-jPle)
   - [Azure VPNs](https://www.youtube.com/playlist?list=PL-V4YVm6AmwXzkeJq0zyQngu8PaMlrZMl)
AVD:
   - [Master Azure Virtual Desktop Today!](https://www.youtube.com/playlist?list=PL-V4YVm6AmwXGvQ46W8mHkpvm6S5IIitK)
   - [WVD Classic Series](https://www.youtube.com/playlist?list=PL-V4YVm6AmwXzfb4La0224FQXvqhplpsd)
   - [Want to ACE The AZ-140 AVD Exam, Start Here!](https://www.youtube.com/playlist?list=PL-V4YVm6AmwW1DBM25pwWYd1Lxs84ILZT)
   - [The Ultimate FSLogix Compilation!!!](https://www.youtube.com/watch?v=yeiHXaIs_sc)
   - [Nerdio Manager for AVD](https://www.youtube.com/playlist?list=PL-V4YVm6AmwX5lYjt3HoSapcsU9-dKIqD)

## Scenario 2: <div id='cssfeedback-start'></div>
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2297215&Instance=2297215&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8b502565&URL=https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2297215&Instance=2297215&Feedback=2)
___
<div id='cssfeedback-end'></div>
|Contributors|
|--|
| [Robert Klemencz](mailto:Robert.Klemencz@microsoft.com) |
---
This article gives a **brief introduction** to **Azure Virtual Desktop (AVD)** for CSS professionals with little or no prior exposure. Its goal is to help you understand the core concepts and see how AVD connects with the technologies you work with every dayregardless of your role.
[[_TOC_]]
---

## Scenario 3: Watch first!
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
A quick crossteam overview of AVD (L100 training).
   *   [AVD L100 Cross-Team Training](https://microsoft.sharepoint.com/teams/css-rds/_layouts/15/stream.aspx?id=%2Fteams%2Fcss%2Drds%2FLearning%2FAVD%2FAVD%20L100%20Cross%2DTeam%20Training%20%28Jan%202024%29%2Emov&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0&ga=1&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2Ef7d56ad6%2D3c26%2D47e7%2Da982%2De1135aa3c839)
---

## Scenario 4: What is AVD?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
**AVD** (short for Azure Virtual Desktop) is a Microsoft Azure service that lets you **remotely use a full Windows desktop or specific apps** on Azure virtual machines (VMs).
Think of it as a cloudhosted PC (Full Desktop experience) or a set of applications that you can launch from your laptop but are installed and running on a remote machine (RemoteApps experience).
---

## Scenario 5: What is an AVD host pool?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
An AVD host pool is a group (collection) of AVD VMs that serve users.
---

## Scenario 6: What is an AVD VM?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The short answer:
   - An AVD VM is **a normal Azure VM** running Windows with a couple of AVD agents added so it can talk to AVD services.
The longer answer:
   - An AVD VM is an Azure VM deployed as part of an AVD host pool.
   - The deployment is usually done through a dedicated wizard in the Azure portal or using PowerShell cmdlets or other automation/deployment solutions (Terraform, Bicep etc.).
   - Admins can also deploy a regular Azure VM and after the VM is ready, log into that VM and manually install 2 agents (the **AVD Bootloader Agent** and the **AVD Agent**), registering that VM into an existing AVD host pool.
   - The VM may allow one or multiple concurrent remote connections to it over the AVD service, depending on the settings and the Windows operating system used (single vs multi-session OS).
   - Users can connect to this Azure VM using a dedicated Remote Desktop client (see: [Remote Desktop clients](https://learn.microsoft.com/en-us/previous-versions/remote-desktop-client/connect-windows-cloud-services?tabs=windows-msrdc-msi) and [Windows App](https://learn.microsoft.com/en-us/windows-app/get-started-connect-devices-desktops-apps?tabs=windows-avd%2Cwindows-w365%2Cwindows-devbox%2Cmacos-rds%2Cmacos-pc&pivots=windows-365)).
   - We leverage various Azure and AVD services (AVD Web Access, Azure Front Door, AVD Gateway, AVD Broker) to establish the connection between the user's "source/client" device and the Azure VM. These are outside customer control.
---

## Scenario 7: What are the differences between an AVD VM and an Azure VM?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The short answer:
   - They are almost the same.
The longer answer:
   - An AVD VM has some additional AVD-specific components (agents) installed on it which are needed for the communication between the VM and the AVD services and to establish the remote connection.
   - An AVD VM supports both single-session and multi-session operating systems.
   - Windows 10/11 Enterprise multi-session is exclusive to AVD. **It is not supported to deploy/use Windows 10/11 Enterprise multi-session outside of an AVD host pool, unless it is for the sole purpose of creating a custom image that will be used to deploy an AVD host pool.**
   - AVD VMs must be **domainjoined** (Entra ID, onprem AD, or hybrid), they are not supported in a **workgroup-joined** setup.
---

## Scenario 8: I have an "AVD issue"... or not?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Customers tend to associate their issues with the platform it happens on: "I have an AVD issue", "I have an Azure issue", "I have a Windows issue", but within Microsoft, we are split into different teams/areas of expertise, each focusing on specific products or components.
It is important to identify the right team to handle an issue, to provide the best support experience to our customers.
When it comes to AVD:
   - Host pool deployment and management issues are starting with the the Windows User Experience team (or the Azure VM team, depending on the customer's contract), as AVD connectivity issues.
   - The root cause may not always be AVD specific (e.g. could be something on the Network, or third party components), but AVD engineers are best equipped to start the investigation.
   - Connectivity issues that occur **BEFORE** even reaching the Azure VM, or unexpected disconnects are usually starting with the Windows User Experience team (or the Azure VM team, depending on the customer's contract), as AVD connectivity issues.
   - The root cause may not always be AVD specific (e.g. could be something on the Network, or third party components), but AVD engineers are best equipped to start the investigation.
   - **Issues that occur inside already established RDP sessions** may require different support teams. The remote session is working fine, but something else inside the session is having issues (e.g. another app or accessing other network/online resources etc.).
   - For those situations, see: [Issues inside the AVD VM that are not directly related to the AVD service
](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2297215/Demystifying-AVD-An-Introduction-for-CSS-Teams?anchor=issues-inside-the-avd-vm-that-are-not-directly-related-to-the-avd-service)
---

## Scenario 9: What are the AVD services?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The main services (for general interest) are: Web Access, Gateway, Broker
   - **AVD Web Access** (aka RDWeb)
   - A service responsible of publishing the resources (full desktops and/or RemoteApps) that users have access to.
   - Users can interact with it:
   - either through a web-based RD client, a web page where they can log in to see their published resources and launch the remote connections,
   - or by signing in/subscribing to the desktop version of the RD clients, where they can similarly see their published resources and launch the remote connections.
   - For more details, see: [Web service (RD Web) - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/956453/Web-service-(RD-Web))
   - **AVD Gateway** (aka RDGateway)
   - A secure entry point to the AVD deployment.
   - The Gateway is assisting in establishing the initial connection between the RD client and the AVD VM.
   - The Gateway may remain involved as an intermediate in the client-VM communication as long as TCP is used as transport protocol.
   - In AVD, all traffic can be offload from TCP to UDP, leveraging a feature called **RDP Shortpath**.
   - Every single initial connection has to first go through the AVD Gateway using TCP. Afterwards, if UDP is available, traffic is offloaded to UDP and the AVD Gateway is disengaged, no longer participating in that connection.
   - For more details, see: [Gateway service (RD Gateway) - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/830152/Gateway-service-(RD-Gateway))
   - **AVD Broker** (aka RDBroker)
   - The **brain** behind establishing the remote connection.
   - The Broker is checking if there are any available Azure VMs within the AVD host pool, for the user to connect to.
   - If it finds an available VM, it will instruct both the RD client and the Azure VM to connect to each other. See: [How is the initial AVD remote connection established?](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2297215/AVD-for-non-AVD-engineers?anchor=how-is-the-initial-avd-remote-connection-established%3F) for more on how this connection is established.
   - For more details, see: [Broker service (RD Broker) - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/830154/Broker-service-(RD-Broker))
---

## Scenario 10: How is the initial AVD remote connection established?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - You open the RD client (desktop or web) on your local device
   - All remote sessions begin with a connection to[Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview), which provides the global entry point to AVD. Azure Front Door determines the AVD gateway (RDGateway) service with the lowest latency for your device and directs the connection to it.
   - The RDGateway service connects to the AVD broker (RDBroker) service in the same Azure region. The RDGateway service enables session hosts to be in any region and still be accessible to users.
   - The RDBroker service takes over and orchestrates the connection between your device and the session host. The RDBroker service instructs the AVD agent running on the session host to connect to the same RDGateway service that your device has connected through.
   - The session host connects to the RDGateway (aka **Reverse connect**).
   - After both client and session host connected to the RDGateway service, the RDGateway starts relaying the RDP traffic using Transmission Control Protocol (TCP) between the client and session host. Reverse connect transport is the default connection type.
   - If UDP can be negotiated, a direct User Datagram Protocol (UDP)-based transport is created between your device and the session host, and all traffic is offloaded from TCP to UDP, bypassing the RDGateway service.
![image.png](/.attachments/image-8d41ed61-a0a5-45ce-87e8-8e1017e2baca.png)
---

## Scenario 11: How to start troubleshooting an initial remote connection issue to an AVD VM (aka "unable to connect")?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This depends on where exactly in the connection chain the issue occurs. It is important to identify the right area as early as possible, because each of them may require a different troubleshooting approach.
Generally, any AVD remote connection can be split into the following areas:
1. End user (local) client device
   - Issues in this area can be related to:
   - the RD Client application itself.
   - the OS or policy settings, or third party software installed that may interfere with the remote connectivity.
1. Network between the end user's client device and Azure
   - Issues in this area can be related to:
   - the end user's local network infrastructure.
   - the end user's Internet Service Provider (ISP).
1. Azure Network before reaching the RDGateway
   - Issues in this area are extremely rare, but when they do occur, they are with the Microsoft Azure networking infrastructure components.
1. AVD services (RDGateway, RDBroker)
   - Issues directly related to the RDGateway or RDBroker services.
   - These should be quite rare, or short term as we have services deployed in multiple regions and even if there are any issues with a specific instance and the user may get disconnected, when they reconnect they should be redirected to another, "healthy" instance.
1. Azure Network behind the RDGateway and before reaching the AVD VM (Session Host)
   - Issues in this area can be related to:
   - any additional network infrastructure components deployed by the customer in Azure (e.g. Azure Firewall, Azure Load Balancer, Azure NAT Gateway, third party networking solutions etc.).
   - Microsoft Azure networking components outside the customer's control, in very rare situations (e.g. TURN servers).
1. AVD VM (Session Host)
   - Issues in this area can be related to:
   - AVD components (agents, stack)
   - any local OS/Software issues (similar to any other Azure VM or on-prem device).
   - See also: [How to troubleshoot an issue occurring inside the AVD VM, that is not directly related to the AVD service?
](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/2297215/Demystifying-AVD-An-Introduction-for-CSS-Teams?anchor=how-to-troubleshoot-an-issue-occurring-inside-the-avd-vm%2C-that-is-not-directly-related-to-the-avd-service%3F)
For more details on troubleshooting connectivity issues for each of these areas, see: [Session Connectivity - Overview](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/721472/Session-Connectivity)
---

## Scenario 12: Authentication in AVD
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
When accessing AVD, there are 3 authentication phases:
   - Cloud service authentication
   - Remote session authentication
   - In-session authentication
Troubleshooting an authentication issue during any of these 3 phases, requires the same steps as troubleshooting the same phase on an Azure VM or on-prem device.
---

## Scenario 13: Authenticating to the AVD service (Cloud service authentication)
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
AVD supports different types of identities depending on which configuration you choose: On-premises identity, Hybrid identity, Cloud-only identity, Federated identity, External identity.
To access AVD resources, you must first authenticate to the service by signing in with a Microsoft Entra ID account. Authentication happens whenever you subscribe to retrieve your resources, connect to the gateway when launching a connection or when sending diagnostic information to the service. The Microsoft Entra ID resource used for this authentication is Azure Virtual Desktop (app ID 9cdead84-a844-4324-93f2-b2e6bb768d07).
You can also make use of MFA, Passwordless authentication, Smart card authentication.
For more details, see: [Cloud service authentication](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication#cloud-service-authentication)
---

## Scenario 14: Authenticating to an AVD VM (Remote session authentication)
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Authenticating on an AVD VM works exactly the same as when connecting via RDP to any other Azure VM.
You can also make use of Single Sign-On (SSO).
Azure Virtual Desktop supports both NT LAN Manager (NTLM) and Kerberos for session host authentication, however Smart card and Windows Hello for Business can only use Kerberos to sign in. To use Kerberos, the client needs to get Kerberos security tickets from a Key Distribution Center (KDC) service running on a domain controller. To get tickets, the client needs a direct networking line-of-sight to the domain controller. You can get a line-of-sight by connecting directly within your corporate network, using a VPN connection or setting up a[KDC Proxy server](https://learn.microsoft.com/en-us/azure/virtual-desktop/key-distribution-center-proxy).
For more details, see: [Remote session authentication](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication#remote-session-authentication)
---

## Scenario 15: In-session authentication
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
This is related to authenticating to applications and web sites within the remote session.
Here it is important to understand better the type of application used and its authentication requirements, as each may require a different approach.
RDP can provide credential delegation inside the session, to some degree, but different security settings, outside the control of AVD, may also prevent this from happening.
AVD in-session passwordless authentication using[Windows Hello for Business](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-overview)or security devices like FIDO keys when using the[Windows Desktop client](https://learn.microsoft.com/en-us/azure/virtual-desktop/users/connect-windows).
For in-session use of smart cards, you need to install the smart card drivers also on the session host and enable smart card redirection.
For more details, see: [In-session authentication](https://learn.microsoft.com/en-us/azure/virtual-desktop/authentication#in-session-authentication)
---

## Scenario 16: Logon to an AVD VM
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
The logon process once you have reached the AVD VM is similar to any other Azure VM.
The main difference is that in an AVD connection, the AVD Agent is adding the user's account to the local **Remote Desktop Users** group during the initial connection request (after eligibility has been clarified) and then removes the user from the group when the session is logged off.
While for comparison, for a regular RDP (MSTSC) connection to any Azure VM, the user has to already be part of the **Remote Desktop Users** group for that connection to work. This needs to be done by an admin in advance (either manually or through policies or scripts).
In general, troubleshooting an RDP logon issue is similar to troubleshooting a "local" logon, requiring similar logs or traces.
Logon over any RDP method differs slightly from a "local" logon due to additional processes that are performing various actions during the logon sequence (e.g. TermService, Rdpshell etc.) which are not used during a local logon.
The right initial approach may depend also on the phase in which the issue occurs during the logon:
1. Before seeing the initial "blue" logon UI (aka "black screen without a mouse cursor")
1. During the "blue" logon screen, at various steps (e.g.: "Please wait for the Local Session Manager", "Please wait for Group Policy processing", "Please wait for the FSLogix service", "Welcome" etc.)
1. After the "blue" logon screen, before the desktop is displayed (aka "black screen with a mouse cursor")
As you can see, there are 2 locations where a **black screen** can occur. Often the presence of the mouse cursor can indicate in which situation you are, but it's not 100% bulletproof.
It is extremely important to properly scope/understand the issue before jumping into troubleshooting, as each of these may require different types of investigation.
For example:
   - An initial black screen with no mouse cursor **before the "blue" logon UI** may indicate issues setting up the remote session itself, like keyboard or mouse redirection.
   - While a black screen with a mouse cursor **after the "blue" logon UI** may indicate issues with launching Explorer.exe (for full desktop sessions) or Rdpshell.exe (for RemoteApps). In this case you can usually open the remote Task Manager by pressing Ctrl+Shift+End inside the remote window and trying to manually launch Explorer.exe from the Task Manager. Often this will cause the desktop to be displayed properly, pointing towards a "Shell" related problem.
:warning: While direct RDP (MSTSC) connections or Azure Bastion connections to AVD VMs are entirely possible (like to any other Azure VMs - there's no difference) and sometimes needed for administrative/troubleshooting activities, AVD as a service does not support them.
---

## Scenario 17: Issues inside the AVD VM that are not directly related to the AVD service
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
(E.g. installed applications not starting or not working as expected, Start Menu issues, Office activation failure, File Share not reachable, high CPU usage, process crashes, BSOD etc.)
AVD VMs are using regular Windows operating systems, so anything that could happen when using Windows on an Azure VM or an on-prem device, could eventually happen on an AVD VM too.
Troubleshooting such scenarios requires the same data/analysis as troubleshooting the same issues outside AVD, on a random Azure VM or on-prem device.
For example:
   - If you require Auth (DS) traces for a logon issue on a laptop, the same Auth traces would be required for a logon issue on an AVD VM too.
   - If you require a full memory dump when Windows is crashing on an Azure VM, similarly a full memory dump will be required if Windows crashes on an AVD VM.
   - If you need network traces for troubleshooting an SMB connectivity issue from an on-prem device or an Azure VM, the same action plan will be needed for an AVD VM too.
There's a general question that you should always clarify first, namely:
   - **Can this particular problem ever occur outside AVD, for example on an Azure VM or an on-prem device?** (not just for a particular customer reporting it, but in general)
   - If the answer is **No**, then it's an AVD-specific problem, requiring an AVD engineer.
   - If the answer is **Yes**, then it's not an AVD-specific problem. In that case the next question should be:
   - **Is there a specific CSS team supporting this scenario if it happens outside AVD?**
   - If the answer is **No**, then an AVD engineer would still be the most suitable to drive the case, even if they may not be able to solve it, as they have at least the understanding of the environment itself.
   - If the answer is **Yes**, then it's usually not an "AVD issue" and that particular team would be the best to begin with the investigation, as they already have the necessary knowledge about their affected product/component.
::: mermaid
flowchart TB
Issue(["Issue inside remote session"])
DedicatedTeam(["Dedicated team outside AVD/UEX should begin the investigation"])
UEX1(["AVD/UEX should begin the investigation"])
UEX2(["AVD/UEX should begin the investigation"])
Q1{{"Can it occur outside AVD?"}}
Q2{{Is there a dedicated team for it outside AVD/UEX?}}
Issue --> Q1
Q1 --> | YES | Q2
Q1 --> | NO | UEX1
Q2 --> | NO | UEX2
Q2 --> | YES | DedicatedTeam
:::
Example scenarios:

## Scenario 18: My Start Menu is not working inside AVD. I click on an app icon in the Start Menu and nothing happens.
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Q1: Can this particular problem ever occur outside AVD, for example on an Azure VM or an on-prem device?
   - Yes
   - Q2: Is there a specific team supporting this scenario outside AVD?
   - Yes. Windows Performance.
   - => The Perf team would be best to start the investigation, even if the issue (only) happens on an AVD VM. This does not mean that the root cause may not be related to some other technology/team (maybe even AVD), but Perf is equipped to provide the best support for Start Menu issues and they can engage other teams as needed as their investigation progresses.

## Scenario 19: Office is not activating on AVD.
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Q1: Can this particular problem ever occur outside AVD, for example on an Azure VM or an on-prem device?
   - Yes
   - Q2: Is there a specific team supporting this scenario outside AVD?
   - Yes. Office.
   - => The Office team would be best to start the investigation, even if the issue (only) happens on an AVD VM. This does not mean that the root cause might not be related to some other technology/team (maybe even AVD), but Office is equipped to provide the best support for anything Office apps related and they can engage other teams as needed as their investigation progresses.

## Scenario 20: Clipboard copy/paste is not working inside AVD.
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Q1: Can this particular problem ever occur outside AVD, for example on an Azure VM or an on-prem device?
   - Yes, though this is a somewhat special situation. :)
Clipboard redirection is a feature of RDP in general, available for both RDS connections, AVD connections or Cloud PC connections. All of these (RDS, AVD, CPC) are handled mainly by the Windows User Experience (UEX) team, with some exceptions based on customer contracts that are handled by the Azure VM team.
   - Q2: Is there a specific team supporting this scenario outside AVD?
   - Yes. UEX (or Azure VM depending on customer contract).
   - => UEX (or Azure VM depending on customer contract) will be best to start the investigation. This does not mean that the root cause might not be related to some other technology/team (e.g. Intune or DS/domain policy processing), but UEX/AzVM are equipped to provide the best support for anything Clipboard Redirection related and they can engage other teams as needed as their investigation progresses.

## Scenario 21: Screen Capture Protection is not working inside AVD.
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Q1: Can this particular problem ever occur outside AVD, for example on an Azure VM or an on-prem device?
   - No. This is a feature specific to AVD.
   - => UEX (or Azure VM depending on customer contract) will be best to start the investigation. This does not mean that the root cause might not be related to some other technology/team (e.g. Intune or DS/domain policy processing), but UEX/AzVM are equipped to provide the best support for anything Screen Capture Protection related and they can engage other teams as needed as their investigation progresses.
---

## Scenario 22: Can I perform an in-place upgrade of the OS from Windows 10 to Windows 11 on an AVD VM?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| OS | Windows 10 Enterprise<br>single-session | Windows 11 Enterprise<br>single session | Windows 10 Enterprise<br>multi-session | Windows 11 Enterprise<br>multi-session |
| -- | -- | -- | -- | -- |
| Windows 10 Enterprise<br>single-session | N/A | :white_check_mark: Yes | :x: No | :x: No |
| Windows 10 Enterprise<br>multi-session | :x: No | :x: No | N/A | :x: No |
For Windows 10 single-session to Windows 11 single-session, the same in-place upgrade procedures/methods that can be used for any regular Azure VM running Windows 10 Enterprise (single session) can also be used for an AVD VM.
Currently there are no "AVD-specific"/"AVD-only" feature update methods. AVD only offers as alternative to recreate the entire VM using a new image (e.g. using the Session Host Configuration/Update feature), but that's another story.
See also:
   - [Azure Virtual Desktop FAQ - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/faq#can-i-do-an-in-place-upgrade-of-a-session-host-s-operating-system)
   - [Windows Enterprise multi-session FAQ - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/windows-multisession-faq#can-windows-enterprise-multi-session-receive-feature-updates-through-windows-server-update-services--wsus-)
---

## Scenario 23: Can I perform a Windows 10/11 feature update on an AVD VM?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Yes, feature updates **within the same Windows product** (e.g. Windows 10 Enterprise 21H2 to Windows Enterprise 10 22H2, or Windows 11 Enterprise 24H2 to Windows 11 Enterprise 25H2 etc.) are supported.
(Example - same applies for 24H2 to 25H2 and so on)
| OS | Windows 10 Ent<br>24H2 single-session | Windows 11 Ent<br>24H2 single-session |Windows 10 Ent<br>24H2 multi-session | Windows 11 Ent<br>24H2 multi-session |
| -- | -- | -- | -- | -- |
| Windows 10 Ent<br>23H2 single-session | :white_check_mark: Yes | :x: No | :x: No | :x: No |
| Windows 10 Ent<br>23H2 multi-session | :x: No | :x: No | :white_check_mark: Yes | :x: No |
| Windows 11 Ent<br>23H2 single-session | :x: No | :white_check_mark: Yes | :x: No | :x: No |
| Windows 11 Ent<br>23H2 multi-session | :x: No | :x: No | :x: No | :white_check_mark: Yes |
The feature update process is exactly the same as on any other regular Azure VMs.
Currently there are no "AVD-specific"/"AVD-only" feature update methods. AVD only offers as alternative to recreate the entire VM using a new image (e.g. using the Session Host Configuration/Update feature), but that's another story.
See also: [Windows Enterprise multi-session FAQ - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/windows-multisession-faq#can-windows-enterprise-multi-session-receive-feature-updates-through-windows-server-update-services--wsus-)
---

## Scenario 24: Can I upgrade from Windows 10/11 single session to Windows 10/11 multi-session?
> 来源: ado-wiki-a-demystifying-avd-introduction.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| OS | Windows 10 Enterprise<br>multi-session | Windows 11 Enterprise<br>multi-session |
| -- | -- | -- |
| Windows 10 Enterprise<br>single-session | :x: No | :x: No |
| Windows 11 Enterprise<br>single-session | :x: No | :x: No |
Upgrading from "single" to "multi" session is not supported, regardless if the OS is Windows 10 or Windows 11.
See also: [Windows Enterprise multi-session FAQ - Azure | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/windows-multisession-faq#can-i-upgrade-a-windows-vm-to-windows-enterprise-multi-session)
---
content checked: 20260225

## Scenario 25: | Team | EEE |
> 来源: ado-wiki-a-eee-mapping.md | 适用: \u901a\u7528 \u2705

### 排查步骤
|--|--|
| API Management | tehnoonr@microsoft.com |
| API Management - China/Gallatin | tehnoonr@microsoft.com |
| App Service (Web Apps) | showkatl@microsoft.com,srsuredd@microsoft.com,rimarr@microsoft.com |
| Application Insights | toddfous@microsoft.com |
| Azure Activity Log Alerts | vikamala@microsoft.com |
| Azure Advanced Threat Protection | rajatm@microsoft.com |
| Azure Automation | stevechi@microsoft.com |
| Azure Communications Manager | tahuan@microsoft.com |
| Azure Cosmos DB | jimsch@microsoft.com,anferrei@microsoft.com |
| Azure Data Factory | ranjith.katukojwala@microsoft.com,grorcai@microsoft.com |
| Azure Data Movement | vimals@microsoft.com,brianwan@microsoft.com |
| Azure Database for MySQL - Flexible Server | haaqel@microsoft.com |
| Azure Database for PostgreSQL - Flexible Server | haaqel@microsoft.com |
| Azure Database for PostgreSQL - Hyperscale (Citus) | haaqel@microsoft.com |
| Azure Database Migration Service | sojaga@microsoft.com |
| Azure Databricks | sunil.kumar@microsoft.com |
| Azure Firewall | aconkle@microsoft.com,yomashru@microsoft.com |
| Azure Firewall Manager | aconkle@microsoft.com |
| Azure HPC | mohak@microsoft.com |
| Azure Incident Management | aconkle@microsoft.com,yomashru@microsoft.com |
| Azure IoT Hub | jtanner@microsoft.com |
| Azure Kubernetes Service | pkc@microsoft.com |
| Azure Log Analytics | tzachie@microsoft.com |
| Azure Monitor Essentials | vikamala@microsoft.com |
| Azure OSS Databases | haaqel@microsoft.com |
| Azure Resource Manager | heikkiri@microsoft.com |
| Azure Site Recovery | pacherr@microsoft.com |
| Azure SQL DB | subbuk@microsoft.com,sojaga@microsoft.com |
| Azure Stack HCI | cpuckett@microsoft.com |
| Azure Stack ICM | leyasa@microsoft.com |
| Azure Synapse Platform Service | goventur@microsoft.com,saltug@microsoft.com |
| AzureRT | clandis@microsoft.com |
| Azure Virtual Desktop | jobende@microsoft.com |
| Backup (MAB) | yomashru@microsoft.com,aconkle@microsoft.com |
| Cloudnet | aconkle@microsoft.com,yomashru@microsoft.com |
| Compute Manager | rachanr@microsoft.com |
| CPIM | rohsh@microsoft.com,bernaw@microsoft.com |
| HDInsight | farukc@microsoft.com,linjzhu@microsoft.com |
| IAM Services | bernaw@microsoft.com |
| IoT Edge | jtanner@microsoft.com |
| ISP Credentials Management Service | vganga@microsoft.com,sridhara@microsoft.com,xinbai@microsoft.com |
| LogicApps | xuehongg@microsoft.com |
| Marketplace | tahuan@microsoft.com |
| Microsoft Azure Sentinel | yaronsahar@microsoft.com |
| Microsoft Cloud App Security | rajatm@microsoft.com |
| Microsoft Information Protection | saseftel@microsoft.com |
| Network Monitoring service | aconkle@microsoft.com,yomashru@microsoft.com |
| Network Watcher Traffic Analytics | aconkle@microsoft.com |
| RDOS | rachanr@microsoft.com |
| SAP HANA on Azure | aconkle@microsoft.com,yomashru@microsoft.com |
| Service Fabric - Service | pkc@microsoft.com |
| Xstore | yomashru@microsoft.com,aconkle@microsoft.com |

## Scenario 26: Welcome to the Azure Virtual Desktop Support Wiki
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
>  Access the wiki quickly using this link: [https://aka.ms/avdcsswiki](https://aka.ms/avdcsswiki)
---
[[_TOC_]]
---

## Scenario 27: What You'll Learn Here
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Azure Virtual Desktop (AVD) is a Microsoft-managed service that lets you securely deliver virtual desktops and apps to users—anytime, anywhere—from the cloud.
This wiki is your starting point for understanding, deploying, and supporting AVD. Whether you're brand new or just need a refresher, we've got you covered.
---

## Scenario 28: What is Azure Virtual Desktop?
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
AVD is a cloud-based virtualization platform that allows you to:
   - Deliver full Windows desktops (Windows 11, Windows 10, Windows Server)
   - Publish individual apps (RemoteApps) instead of full desktops
   - Support multiple users on the same virtual machine (multi-session)
   - Use Microsoft 365 Apps for enterprise in virtual environments
   - Install custom or line-of-business apps (Win32, MSIX, Appx)
   - Offer Software-as-a-Service (SaaS) experiences to external users
   - Replace traditional Remote Desktop Services (RDS) deployments
---

## Scenario 29: Core AVD Components
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Component | What It Does | Details |
| --- | --- | --- |
| **Web Service** | Entry point for users; returns connection info | [RD Web](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/956453/RD-Web) |
| **Broker** | Orchestrates incoming connections and host assignments | [RD Broker](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/830154/RD-Broker) |
| **Gateway** | WebSocket service for RDP connectivity | [RD Gateway](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/830152/RD-Gateway) |
| **Resource Directory** | Instructs the web service which of the multiple geographical databases hosts the connection information required for each user | |
| **Geographical Database** | Stores connection files and icons for user resources | |
In addition, Azure Virtual Desktop uses other global Azure services, such as [Azure Traffic Manager](https://learn.microsoft.com/en-us/azure/traffic-manager/traffic-manager-overview) and [Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview) to direct users to their closest Azure Virtual Desktop entry points.
Each AVD environment includes:
   - **Workspaces**: Containers for your virtual desktops and apps
   - **Host Pools**: Groups of virtual machines (VMs) that run user sessions
   - **Session Hosts**: The actual VMs where users connect
   - **App Groups**: Collections of apps or desktops published to users
Customers are responsible for creating and managing session hosts, including any operating system image customizations and applications, virtual network connectivity, the resiliency, and the backup and recovery of those session hosts. Customers also provide and manage user identities and control access to the service.

## Scenario 30: Connection Models
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
A protocol stack must be installed on the session host to support connections from the session host to the AVD deployment. This is referred to as reverse-connect and eliminates the need for inbound ports to be opened to the RD tenant environment. The opposite of this is referred to as forward-connect and requires an inbound 3389 port to be opened to the RD tenant environment.
   - **Reverse Connect**: Secure, no need to open inbound ports
   - **Forward Connect**: Requires port 3389 open (less secure)

## Scenario 31: Application Delivery
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
An app group is a logical grouping of the applications that are installed on the session hosts in the host pool. There are two types of app groups, desktop and RemoteApp.
   - **Desktop App Group**: Full desktop experience
   - **RemoteApp Group**: Individual apps appear on local desktop
For more details, see:
   - [Azure Virtual Desktop service architecture and resilience | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/service-architecture-resilience)
   - [AVD Service Framework components](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/767057/AVD-Service-Framework-components)
---

## Scenario 32: Getting Started
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
New to AVD support? Start here:
   - [Using the AVD Support Wiki](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1372648)
   - [New to AVD support](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/649000)
   - [How can I get help](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1372787)
   - [Learning Resources: Session Connectivity](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1386415)
---

## Scenario 33: Health Checks & Troubleshooting
> 来源: ado-wiki-a-welcome.md | 适用: \u901a\u7528 \u2705

### 排查步骤
AVD automatically runs health checks on session hosts to ensure:
   - Hosts are ready to accept user connections
   - Unhealthy hosts are removed from load balancing
   - Issues are visible in the Azure Portal for troubleshooting
See:
   - [Health Check Failures](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467677/Health-Check-Failures)
   - [Workflows](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466891/Workflows)

## Scenario 34: What users can do in the Insights UI
> 来源: ado-wiki-admin-highlights-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
Admins can:
   - View the Admin Insights experience
   - Review service-identified items
   - Open the underlying report (where applicable) and/or engage Copilot (if available, requires Copilot in Intune to be enabled and the user to have the Security Copilot Contributor role)
   - Dismiss an item for a day (24 hours)

## Scenario 35: Expected
> 来源: ado-wiki-admin-highlights-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Insights container appears on the Windows 365 overview page.
   - Items are categorized by severity (Error, Warning, Recommendation) and ranked.
   - "View all" (when present) allows access to more than the initially shown cards.

## Scenario 36: Unexpected
> 来源: ado-wiki-admin-highlights-setup.md | 适用: \u901a\u7528 \u2705

### 排查步骤
   - Insights fail to load due to service errors (not simply "no relevant cards").
   - Mismatch between card counts and report counts (e.g., report missing filters the card applied).
   - A topic never appears when conditions should be met.

## Scenario 37: Expected Failures (No IcM Alert)
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Failure Tag | Description | Resolution |
| --- | --- | --- |
| FlightDisabled | Insights feature not enabled for tenant | Enable flight for tenant |
| TestEnvironment | Service Health API skipped in TEST env | Expected in test environments |
| InvalidTenantId | Tenant ID format is invalid | Check tenant ID format (GUID) |
| ServiceHealthDisabled | Service Health feature disabled for tenant | Enable ServiceHealth flight |
| EntityNotFoundException | Insight ID not found in database | Invalid ID, expired (TTL), or never created |
| DataLeakException | User accessing data from different tenant | Security check - expected |
| ArgumentNullException | Missing required parameter | Check API request parameters |
| 401/Unauthorized | OBO token acquisition failed | User needs proper permissions |
| 403/Forbidden | Access denied to Service Health API | Tenant may lack Graph permissions |

## Scenario 38: Unexpected Failures (May Trigger IcM)
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
| Failure Tag | Description | Resolution |
| --- | --- | --- |
| NullQueryParameters | Query parameters not provided | Code bug - check topic/subcategory mapping |
| InvalidResourceName | Service Health resource name invalid | Code configuration issue |
| HttpRequestException | HTTP call failed with unexpected error | Check network, downstream service |
| TaskCanceledException | Request timed out | Increase timeout or check service health |
| Exception (generic) | Unhandled exception | Check logs for stack trace |
| 500/Other 5xx | Server error from downstream | Check downstream service status |

## Scenario 39: 1. Find Insights API Errors
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName in ("HighlightController", "HighlightService", "HighlightSourceDataService")
| where TraceLevel <= 3
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`

## Scenario 40: 2. Investigate Service Health API Failures
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`

## Scenario 41: 3. Find Errors for Specific Tenant
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where TenantId == "<TenantId>"
| where UserId == "<UserId>"
| where ComponentName contains "Highlight"
| where TraceLevel <= 3
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`

## Scenario 42: 4. Track HTTP Failures by Status Code
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName == "ServiceHealthClient" or ComponentName contains "Highlight"
| where Message contains "code: 4" or Message contains "code: 5"
| summarize Count = count() by bin(env_time, 1h)
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`

## Scenario 43: 5. Error Distribution Summary
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(1d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight" or ComponentName == "ServiceHealthClient"
| where TraceLevel <= 2
| summarize ErrorCount = count() by ComponentName
| order by ErrorCount desc
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`

## Scenario 44: 6. Daily Error Trend
> 来源: ado-wiki-admin-highlights-troubleshooting.md | 适用: \u901a\u7528 \u2705

### 排查步骤
```kql
CloudPCEvent
| where env_time > ago(7d)
| where ApplicationName contains "aldp"
| where ComponentName contains "Highlight"
| summarize Total = count(), Errors = countif(TraceLevel <= 2), Warnings = countif(TraceLevel == 3) by bin(env_time, 1d)
```
`[来源: ado-wiki-admin-highlights-troubleshooting.md]`
