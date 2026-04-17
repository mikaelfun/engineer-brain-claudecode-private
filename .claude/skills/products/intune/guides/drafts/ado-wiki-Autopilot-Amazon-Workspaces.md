---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Autopilot/Amazon Workspaces"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Autopilot/Amazon%20Workspaces"
importDate: "2026-04-05"
type: troubleshooting-guide
---

Page Author: IntuneAutopilotSMEs@microsoft.com

[[_TOC_]]

# Overview
This document outlines the support agreement between Microsoft and Amazon for the use of Entra and Intune to provision Amazon WorkSpaces using Windows Autopilot (APv1). This release will use APv1 technology (user-driven mode) to provision Amazon Workspaces with Entra join + Intune enrollment and configuring them based on organizations policies defined in Intune.

This offering is targeted at customers that:

- Deploy Amazon WorkSpaces running Windows 10/11 operating system
- Use Entra, Intune and Windows Autopilot in Azure Global cloud.

This document defines the ownership and responsibilities of each party, as well as the support triage / boundaries and escalation channels.

# Intune Ownership and Responsibilities
Intune is a cloud-based service that provides unified endpoint management for devices across various platforms, including Windows, iOS, Android, and macOS. Intune allows organizations to configure, secure, and monitor their devices from a single console, as well as deploy applications and policies to them.

## Intune offers the following support options for its customers:
- Online documentation and tutorials
- Community forums and blogs
- Support tickets through the Microsoft 365 admin center
- Phone support for critical issues

## Feedback and feature requests through UserVoice
- Intune is responsible for the following aspects of the service:
- Ensuring the availability and performance of the Intune service
- Providing updates and enhancements to the Intune service or Windows OS
- Providing security and compliance features for the Intune service
- Providing support for the Intune service and its features
- Providing device management for Amazon WorkSpaces that are enrolled in Intune
- Updating public docs that Amazon is now a supported configuration

# Amazon Ownership and Responsibilities
Amazon offers Amazon WorkSpaces, which is a fully managed desktop-as-a-service (DaaS) solution that provides users with access to Windows or Linux desktops from any device.

## Amazon is responsible for the following aspects of its services:
- Ensuring the availability and performance of Amazon WorkSpaces
- Providing updates and enhancements to Amazon WorkSpaces
- Providing security and compliance features for Amazon WorkSpaces
- Providing support for Amazon WorkSpaces and its features

## Amazon is also responsible for the following aspects of the integration with Intune:
- Amazon Workspaces usage of Windows Autopilot meets the same requirements as that of a physical Windows PC
- Providing the first level of support for any issues related to Amazon Workspaces integration with Intune and Entra using Windows Autopilot
- Directing their customers to file support tickets for Intune through Microsoft support channels
- Creating a webpage with guidance on how to build provision Amazon Workspaces using Entra, Intune and Windows Autopilot. In addition, it should include links to Intune and Autopilot official documents
- Ensuring that Amazon WorkSpaces meet the requirements for:
    - Entra: Device identity and desktop virtualization
    - Intune virtual machines: Using Windows 10 virtual machines with Intune
    - Autopilot: Windows Autopilot requirements
- Regularly testing Amazon WorkSpaces for any changes with Intune, Entra and Windows Autopilot updates
- Creating a known issues page if there are any issues with the integration with Intune

# Support Boundaries
The support triage process for Amazon Workspaces integration with Microsoft (Entra, Intune and Windows Autopilot) is as follows:

- If an issue occurs with Amazon WorkSpaces that is enrolled in Intune, Amazon Services will be responsible for tier one support
- If a customer contacts Microsoft with an issue related to Amazon WorkSpaces integration with Microsoft service, Microsoft will direct the customer to open an issue with Amazon Services and ask them to reference Microsoft support case # when doing so
- Amazon Services will troubleshoot the issue and determine if it is related to Amazon service or a Microsoft service
- If the issue is related to Amazon service, Amazon will resolve the issue or provide a workaround
- If the issue is related to a Microsoft service, Amazon will direct the customer to open a support ticket with Intune through customer support channels and ask them to reference Amazon support case # when doing so
- A customer will be required to open support cases with both Amazon and Microsoft when a collaboration between the two organizations support teams is necessary to resolve a customer issue
- When Amazon support needs to involve Microsoft support on a customer case, Amazon support will send an email to IntuneAmazonSup@microsoft.com referencing both Amazon and Microsoft support case #
- When both Amazon and Microsoft support teams are involved in investigating a customer case, they will follow standard support procedures to resolve the case. Support teams will only engage with their respective product groups as needed and follow internal processes to do so.
- Service Level Agreements will be honored based on the customers' existing support agreement with Microsoft
- Amazon support agreement with Microsoft will only apply to Amazon tenants and not to any of their customers who use Amazon services

# FAQ

**Q: What development work did Microsoft do to enable the implementation of Autopilot support for Amazon WorkSpaces?**

**A:** Intune engineering is shipping no code to support Amazon hosted persistent virtual machines. Identity is shipping no code to support Amazon hosted persistent virtual machines.

**Q: What new functionalities or features were created or introduced to support or enable the support of Amazon hosted virtual machines?**

**A:** No new features or functionalities are introduced with this support; we are only introducing a support statement that does not block them from enrolling, while Amazon is advertising support.

**Q: What special changes were allowed/granted to Amazon to use Autopilot?**

**A:** Amazon will be leveraging Auto-Pilot v1 APIs as-is.

**Q: What does Intune CSS own, related to this Amazon integration?**

**A:** Intune support owns standard Intune service-related issue troubleshooting, including the Windows MDM client. These Amazon hosted virtual machines will be treated like any other Autopilot (v1) user-driven provisioning support case.

**Q: What about Amazon and potential Windows Server hosted virtual machines via MDE enablement to Intune?**

**A:** Windows Server management through Intune MDE Security Management (i.e. MMPC) channel is unsupported on Amazon VMs.

**Q: What commitments exist between Microsoft and Amazon related to this integration?**

**A:** It is not expected that Intune engineering bugfix Autopilot or other Intune services as it relates to integration issues specific to Amazon's virtualization implementation.

**Q: For this Amazon integration to Intune/Autopilot, who will first own initial contact and tier 1 support cases?**

**A:** Amazon owns all first level tier 1 support. All cases coming into Microsoft from Amazon customers should start with Amazon and have collaboration cases. Intune support should request and confirm this to be the case.

**Q: What about cases around the Amazon infrastructure or how the VM operates Windows?**

**A:** Intune customer issues presenting on Amazon VMs related to the Operating System Environment (OSE), including performance, connectivity, or any other Amazon infra dependencies like DNS, etc. should always be owned and primarily driven by Amazon to a level where they deterministically rule out their implementation.

**Q: What if we are not sure if it is an Amazon infra issue, what can be done next?**

**A:** For issues in which it is suspect or ambiguous whether an issue is related to Amazon's infra, Amazon and its customers may be required reproduce the issue on hardware outside of the virtualization environment before Microsoft support can action it.

**Q: When should Intune CSS escalate any related issue to Intune engineering?**

**A:** Intune engineering can be escalated to for issues where Amazon's infrastructure has been deterministically ruled out, especially where issues reproduce on hardware outside of the virtual env.

# Sample Scoping Questions for the Amazon Support Collab
Example scoping question to ask customers and Amazon:
- What is the support case number with Amazon?
- Does this reproduce outside of Amazon, e.g. on physical hardware?
