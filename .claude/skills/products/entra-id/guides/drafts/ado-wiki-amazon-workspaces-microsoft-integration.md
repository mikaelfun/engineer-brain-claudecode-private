---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Amazon WorkSpaces + Microsoft integration (Entra, Intune and Windows Autopilot)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/Device%20Registration/Window%20Devices/Amazon%20WorkSpaces%20%2B%20Microsoft%20integration%20(Entra%2C%20Intune%20and%20Windows%20Autopilot)"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Amazon WorkSpaces + Microsoft Integration (Entra, Intune and Windows Autopilot)

## Overview

Support agreement between Microsoft and Amazon for the use of Entra, Intune, and Windows Autopilot to provision Amazon WorkSpaces running Windows 10/11. **Azure Global cloud only.**

## Target Customers

- Deploy Amazon WorkSpaces running Windows 10/11 OS
- Use Entra, Intune and Windows Autopilot in Azure Global cloud

## Ownership Boundaries

### Microsoft (Intune) Responsibilities
- Availability and performance of the Intune service
- Updates and enhancements to the Intune service or Windows OS
- Security and compliance features
- Device management for Amazon WorkSpaces enrolled in Intune

### Amazon Responsibilities
- Availability and performance of Amazon WorkSpaces
- Amazon Workspaces usage of Windows Autopilot meets same requirements as physical Windows PC
- **First level of support** for any issues related to Amazon Workspaces integration with Intune and Entra
- Directing customers to file support tickets for Intune through Microsoft support channels
- Ensuring WorkSpaces meet requirements for:
  - [Entra Device identity and desktop virtualization](https://learn.microsoft.com/en-us/entra/identity/devices/howto-deviceidentity-virtual-desktop-infrastructure)
  - [Intune virtual machines](https://learn.microsoft.com/en-us/mem/intune/fundamentals/windows-10-virtual-machines)
  - [Autopilot requirements](https://learn.microsoft.com/en-us/autopilot/requirements?tabs=software)

## Support Triage Process

1. Issue occurs with WorkSpaces enrolled in Intune → **Amazon is tier-1 support**
2. If customer contacts Microsoft first → redirect to open issue with Amazon, reference MS case #
3. Amazon troubleshoots and determines if issue is Amazon or Microsoft service
4. If Microsoft service issue → Amazon directs customer to open Intune support ticket, reference Amazon case #
5. **Collaboration required** → customer opens cases with both Amazon and Microsoft

### Escalation Channels

| Direction | Email |
|-----------|-------|
| Amazon → Microsoft | IntuneAmazonSup@microsoft.com |
| Microsoft → Amazon | aws-workspaces-intune-support@amazon.com |

Both emails should reference both Amazon and Microsoft support case numbers.

## Key Rules

- SLAs honored based on customer's existing support agreement with Microsoft
- Amazon support agreement with Microsoft applies only to Amazon tenants, not their customers
- Support teams only engage respective product groups as needed, following internal processes
