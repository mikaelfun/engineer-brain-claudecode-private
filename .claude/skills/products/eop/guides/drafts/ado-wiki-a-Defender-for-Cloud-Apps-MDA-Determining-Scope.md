---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Case Misroutes/Defender for Cloud Apps (MDA):  Determining Scope"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FCase%20Misroutes%2FDefender%20for%20Cloud%20Apps%20(MDA)%3A%20%20Determining%20Scope"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Defender for Cloud Apps (MDA): Determining Scope

SAP: Azure/Microsoft Defender for Cloud Apps

- Microsoft Cloud App Security (MCAS) 2016-2021
- Microsoft Defender for Cloud Apps (MDA) 2021 - present
- Sometimes informally referred to as MDCA by mistake

## What is it?

A Cloud Access Security Broker (CASB) that covers Microsoft 365 apps AND third-party SaaS apps (like Salesforce, Box, Google Workspace). Handles app governance, OAuth permissions, session controls, shadow IT discovery, and conditional access for cloud apps.

## Alerts about "Risky sign-in" or "Activity from a Botnet-associated IP address"

Make sure to check before transfer if the customer wants/needs CIRT for their objective related to this.

## Adding Tenant information to XDR Alert Emails

By default, MDA Alerts don't include Tenant information, which is hard for customers managing multiple tenants (MSPs). They can configure this via [Configure alert notifications](https://learn.microsoft.com/en-us/defender-xdr/configure-email-notifications).

## MDA Obsolete Anomaly detection policies triggering FP or disabled

Affected alerts:
- Suspicious inbox manipulation rule
- Suspicious email deletion activity
- Suspicious email forwarding rule
- Activity from an anonymous proxy
- Activity from a botnet-associated IP address

MDO Scope: answer basic questions, provide documentation. Anything further needs to be transferred to the MDA team.

## Malware Detection expected behavior when SPO malware indication is lifted

- OneDrive/SharePoint send indication about Malware tagging of files
- MDA receives this indication over the M365 App connector
- The "Malware Detection" policy is matched with those files
- **If MDO removes a malware tag from a file, the change doesn't sync to MDA**
- Customers must manually "authorize" the file under the Infected Files tab
- **This behavior is by design**

## Links being rewritten (mcasproxy.cdn.mcas.ms)

- May be presented as a Safe Links issue because the URL is wrapped
- But in browser the URL shows: `mcasproxy.cdn.mcas.ms`
- This is MDA session proxy, not Safe Links
- Collect network trace if unclear
- Route the case to MDA team
