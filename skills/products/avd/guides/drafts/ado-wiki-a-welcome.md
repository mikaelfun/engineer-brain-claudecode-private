---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Welcome"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2FWelcome"
importDate: "2026-04-06"
type: troubleshooting-guide
---

#  Welcome to the Azure Virtual Desktop Support Wiki
>  Access the wiki quickly using this link: [https://aka.ms/avdcsswiki](https://aka.ms/avdcsswiki)

---
[[_TOC_]]

---
#  What You'll Learn Here

Azure Virtual Desktop (AVD) is a Microsoft-managed service that lets you securely deliver virtual desktops and apps to users—anytime, anywhere—from the cloud.

This wiki is your starting point for understanding, deploying, and supporting AVD. Whether you're brand new or just need a refresher, we've got you covered.

---
#  What is Azure Virtual Desktop?

AVD is a cloud-based virtualization platform that allows you to:
- Deliver full Windows desktops (Windows 11, Windows 10, Windows Server)
- Publish individual apps (RemoteApps) instead of full desktops
- Support multiple users on the same virtual machine (multi-session)
- Use Microsoft 365 Apps for enterprise in virtual environments
- Install custom or line-of-business apps (Win32, MSIX, Appx)
- Offer Software-as-a-Service (SaaS) experiences to external users
- Replace traditional Remote Desktop Services (RDS) deployments

---
#  AVD Architecture Overview

## Core AVD Components

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

## Connection Models

A protocol stack must be installed on the session host to support connections from the session host to the AVD deployment. This is referred to as reverse-connect and eliminates the need for inbound ports to be opened to the RD tenant environment. The opposite of this is referred to as forward-connect and requires an inbound 3389 port to be opened to the RD tenant environment.

- **Reverse Connect**: Secure, no need to open inbound ports
- **Forward Connect**: Requires port 3389 open (less secure)

## Application Delivery

An app group is a logical grouping of the applications that are installed on the session hosts in the host pool. There are two types of app groups, desktop and RemoteApp.

- **Desktop App Group**: Full desktop experience
- **RemoteApp Group**: Individual apps appear on local desktop

For more details, see:
- [Azure Virtual Desktop service architecture and resilience | Microsoft Learn](https://learn.microsoft.com/en-us/azure/virtual-desktop/service-architecture-resilience)
- [AVD Service Framework components](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/767057/AVD-Service-Framework-components)

---
#  Getting Started

New to AVD support? Start here:

- [Using the AVD Support Wiki](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1372648)
- [New to AVD support](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/649000)
- [How can I get help](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1372787)
- [Learning Resources: Session Connectivity](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/1386415)

---
#  Health Checks & Troubleshooting

AVD automatically runs health checks on session hosts to ensure:
- Hosts are ready to accept user connections
- Unhealthy hosts are removed from load balancing
- Issues are visible in the Azure Portal for troubleshooting

See:
- [Health Check Failures](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/467677/Health-Check-Failures)
- [Workflows](https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/466891/Workflows)
