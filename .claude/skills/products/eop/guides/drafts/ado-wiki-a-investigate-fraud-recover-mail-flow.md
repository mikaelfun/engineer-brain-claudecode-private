---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Investigate Fraud and Recover Mail Flow"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FInvestigate%20Fraud%20and%20Recover%20Mail%20Flow"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Investigate Fraud and Recover Mail Flow

**Short link: https://aka.ms/mdofraud**

Microsoft 365 tenants are lucrative resources spammers may abuse to send spam, phish and malware. MDO Engineering employs multiple outbound blocks. This guide helps detect fraud and abuse, report them, and recover legitimate accounts.

## 1. Investigate Fraud

Check multiple indicators before taking any diagnostics action:
- Case description is empty or only a title
- Contact email is invalid, external, or from another tenant
- Contact name or tenant name is generic, meaningless, or impersonating another company
- No valid public website or HTTPS certificate for the domain
- Tenant/domain name unrelated to any real business
- Phone numbers registered in different country than tenant (often +91 India, +212 Morocco, +62 Indonesia)
- Organization address is invalid
- Accepted domains don't match company identity; malicious domains (.ml/.tk TLDs, bogus, impersonation)
- Only 1-2 business licenses or trials; EDU tenants may have large paid counts but few assigned
- Tenant created within last 12 months
- Communication lacks company signature; customer pushes for diagnostic release or offers 5-star survey incentives

> **SMB Support**: For SMB O365/Concierge support, use dedicated fraud v-team. SAP: Office Products/Office 365/Office 365/Fraud Tenant. Update SAP and Transfer to MW SMB Fraud Escalations Review queue.

## 2a. Fraud Found/Suspected

| Situation | Action | DfM |
|-----------|--------|-----|
| Fraud Confirmed | Stop communications. Send DfM collab request to CFAR with evidence and Tenant IDs. | Queue: Azure Security Operations Center; SAP: Azure/Subscription management/Account Review/Security Review Team; Title: Email Infra Fraud |
| Fraud Suspected | Stop communications. Send DfM collab request to CFAR to investigate. | Same queue/SAP; Title: Need help confirming email infra fraud |
| No Fraud Detected | Proceed to recovery steps. GoDaddy partner cases: see https://aka.ms/705gd | - |

## 2b. Fraud Not Found - Release Tenant Exceeded Threshold Blocks

- Investigate if customer sent bulk mail on purpose, in error, or if compromised
- Explain bulk sending limits
- Communicate that release actions don't guarantee they won't be blocked again
- Must stop sending bulk through service; use dedicated solution like ACS
- Run Validate EOP Domain Health diagnostic for block details
- Collect 2 weeks of logs from Exchange and Defender portals
- Remediate per compromised account guide
