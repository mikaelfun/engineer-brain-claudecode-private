---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Customer Scenarios/Workloads/Microsoft Sovereign Cloud/Microsoft 365 Local"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=%2FAzure%20Local%20Disconnected%20Operations%2FCustomer%20Scenarios%2FWorkloads%2FMicrosoft%20Sovereign%20Cloud%2FMicrosoft%20365%20Local"
importDate: "2026-04-06"
type: troubleshooting-guide
---

> **Important**: This page is only intended for awareness of M365 Local as a Workload for customers _using Azure Local with disconnected operations_ after it is generally available.

Microsoft 365 Local provides critical productivity services in private cloud environments, running on Azure Local, with the option to run with disconnected operations (ALDO).

Microsoft 365 Local is a validated reference architecture for running a private instance of Microsoft 365 on Azure Local (Azure Stack HCI). It provides Microsoft 365 services, like Teams and Exchange Online, in your own datacenter or sovereign cloud.

## M365 Workloads supported

M365 workloads expected at GA:
1. Exchange Server
1. SharePoint Server
1. Skype for Business Server

Plus AVD is expected soon after.

### Support lifecycle

Mainstream support extension for these "Subscription Edition" servers has been publicly announced in [Additional Support for Select Server Products Following Modern Lifecycle Policy](https://learn.microsoft.com/en-us/lifecycle/additional-support-server-modern-lifecycle-policy).

As of Ignite 2025 (November 2025), [Microsoft 365 Local is Generally Available](https://techcommunity.microsoft.com/blog/AzureArcBlog/microsoft-365-local-is-generally-available/4470170), for connected Azure Local scenarios, with disconnected coming in the future:

> For organizations with the most stringent jurisdictional requirements that need to operate Microsoft 365 Local in a fully disconnected environment, support for Azure Local disconnected operations will be available in early 2026.

## Sovereign Private Cloud

Microsoft's **Sovereign Private Cloud** supports critical collaboration, communication and virtualization services workloads on Azure Local. This solution integrates Microsoft 365 Local and the security platform with Azure Local, providing consistent capabilities for hybrid or air-gapped environments to meet resiliency and business continuity requirements.

### Key Points
- Azure Local delivers Microsoft cloud services in customer locations
- Enables organizations to meet specific data residency and sovereignty requirements
- Includes core Azure capabilities: compute, storage, networking and virtualization services
- Designed for governments, critical industries and regulated sectors
- Microsoft 365 Local is GA for connected scenarios; disconnected operations support coming early 2026

## Support Routing
- If customer is NOT in the public preview for Disconnected operations for Azure Local, redirect to [Microsoft 365 Servers and Sovereign Private Cloud](https://microsoft.seismic.com/app#/doccenter/063a38f4-06e8-404d-bcfb-362e97a9acc3) resources.
