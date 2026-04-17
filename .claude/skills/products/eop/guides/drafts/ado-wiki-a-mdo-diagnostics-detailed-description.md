---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/MDO Diagnostics/MDO Diagnostics Detailed Description and Demos"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FMDO%20Diagnostics%2FMDO%20Diagnostics%20Detailed%20Description%20and%20Demos"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# MDO Diagnostics - Detailed Description and Demos

## An email message to a Teams Channel was not delivered
Validates emails sent to a Team Channel are delivered; if not, determines failure reason. Uses message trace in mail-enabled Teams tenant. Now displays NMID with clear next-step guidance for FP escalations.

## Defender for Office 365 Threat Policy Health Check (NEW)
Also available for customer self-diagnosis at https://aka.ms/thc

Reviews scan history for last 30 days and surfaces:
- Messages where Safe Attachments/Safe Links disabled by ETR
- Messages where Enhanced Filtering not enabled when MX points outside M365
- Messages where Safe Attachments/Safe Links policies not applied
- Messages that M365 found malicious and attempted ZAP but could not because ZAP was disabled

Provides per-domain results for top 10 domains by message/recipient count.

## Validate User Reported Settings (NEW)
Provides insights into User reported settings configuration: which reporting buttons are displayed, where messages are sent, checks for configuration issues.

## Review ODSP and Teams Malware Verdicts (NEW)
Provide SHA256 file hashes (up to 20) to see scan results for files in Teams, SharePoint Online, and OneDrive for Business. Provides guidance on FP troubleshooting and unblocking files.

## Review Submission Activity & Defender for Office 365 Message Explorer (NEW)
- Review Submission Activity: Overview of admin and end-user submissions for a tenant
- MDO Message Explorer: In-depth analysis of submission IDs or network message IDs (up to 20)
- Now includes quarantine-related data

### Available Scenarios:
- Review Details of a Submission
- View Filtering Details of a Message (Spam Verdict Reason)
