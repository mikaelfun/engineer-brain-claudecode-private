---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Jarvis/Use Jarvis Actions related to AI"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FApplication%20Insights%2FHow-To%2FJarvis%2FUse%20Jarvis%20Actions%20related%20to%20AI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Use Jarvis Actions Related to Application Insights

## Overview

Using Jarvis (Geneva) actions requires access to a SAW device (physical or virtual). Some write actions additionally require an AME domain account.

### Actions Requiring Both SAW + AME Account
- **Swap iKeys** (instrumentation key swap)

### Actions Requiring SAW Only (No AME Account Needed)
- Accessing resource properties (e.g., workspace name for LA Ingestion mode)
- Determining which Application Insights resources receive telemetry via global ingestion
- ARM cache refresh

> **Note:** Restore deleted AI Components can now be done via ASC (no SAW required): [Recover a deleted AI Component](https://supportability.visualstudio.com/AzureMonitor/_wiki/wikis/AzureMonitor.wiki)

## Team Members with AME Domain Accounts (for Restricted Write Operations)

| Name | Email |
|------|-------|
| Matt Hofacker | matthofa@microsoft.com |
| Todd Foust | toddfous@microsoft.com |
| Pedro Monteiro | pemon@microsoft.com |
| José Miguel Constantino | josecons@microsoft.com |
| Brian McDermott | bmcder@microsoft.com |
| Steve Chilcoat | stevechi@microsoft.com |
| Nina Li | nali2@microsoft.com |

## How to Access Jarvis Actions for Application Insights

1. Open a browser and navigate to Jarvis:
   - New portal: https://portal.microsoftgeneva.com/actions
   - Old portal: https://jarvis-west.dc.ad.msft.net/actions
2. When prompted, authenticate with your **@microsoft.com** account (or @ame.gbl if you have one)
3. In "Select Environment", choose **Public** (for public cloud)
4. Click **Go to Geneva Actions** → authenticate again with Active Directory (username/password) → approve via Authenticator
5. In the Filter box, type **Application Insights** to narrow the action list
6. Expand the Application Insights tree on the left to find available actions

> For AME-required actions (e.g., iKey swap), you will be prompted to use your AME.GBL account. Your AME account must be a member of **AME\\App-Insights-CSS-TA-EEE** security group, or access will be auto-rejected.

*Source: https://msazure.visualstudio.com/One/_wiki/wikis/One.wiki/41604/Application-insights-CSS-priveleged-actions-Swapping-iKeys-Undeleting-resources*
