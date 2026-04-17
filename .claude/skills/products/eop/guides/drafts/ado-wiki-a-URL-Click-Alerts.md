---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/TSG: "A potentially malicious URL click was detected" alert | Unexplained URL Click entries"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTSG%3A%20%22A%20potentially%20malicious%20URL%20click%20was%20detected%22%20alert%20%7C%20Unexplained%20URL%20Click%20entries"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario
The customer receives "A potentially malicious URL click was detected" alert(s) or sees entries in the URLClick report/table, but the end user states that they did not click on the link.

Note: if the malicious clicks are actually from a third-party phishing sim that the customer initiated, then be sure to configure Advanced Delivery correctly for phishing simulations (see [Configure the advanced delivery policy for third-party phishing simulations and email delivery to SecOps mailboxes - Microsoft Defender for Office 365 | Microsoft Learn](https://learn.microsoft.com/en-us/defender-office-365/advanced-delivery-policy-configure)).

# Troubleshooting
1. Obtain the relevant URL click data from the customer. URLClicks can be found through any of these sources:
    - Threat Explorer>URL Clicks
    - Advanced Hunting>UrlClickEvents table. See:
      - [Introducing the UrlClickEvents table in advanced hunting with Microsoft Defender for Office 365 | Microsoft Community Hub](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/introducing-the-urlclickevents-table-in-advanced-hunting-with-microsoft-defender/3295096)
    - Unified Audit Log, e.g. by using the Search-UnifiedAuditLog cmdlet with '-Operations TIUrlClickData'

(Note that the Reports>Email & collaboration>URL protection report also has some data, but does not include IP addresses.)

2. Check the disputed IPs on [MicrosoftIPs](https://csstoolkit.azurewebsites.net/(S(jz5gk3fr1nfnydhnyfzmf1a0))/Home/MicrosoftIPs). Are the IPs from Microsoft?
    - If the IPs are found in the search **Results**, next check the service which they are from. Here, for example, the source service is 'Azure Public Cloud'.

![image.png](/.attachments/image-2e68fb6a-ca5d-408d-ad52-ca6aaa014eee.png =800x)

- If the IPs belong to EOP, please see [Escalating to Engineering](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives#escalating-to-engineering).
- If the IPs belong to 'Azure Public Cloud', you will also need to follow [Escalating to Engineering](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/7858/Troubleshooting-False-Positives-and-False-Negatives#escalating-to-engineering). APC clicks will often be a service or user accessing the mailbox  (or Teams) from there. SONAR (ATP) also uses some APC IP addresses to scan URLs as well, so engineering will need to confirm if those IPs were being used by SONAR at the time-of-click.
- If the IPs belong to any other Microsoft service, please ask the customer to investigate further themselves. Please see [Investigating non-ATP URLClicks](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?wikiVersion=GBmain&pagePath=/Drafts/TSG%3A%20%22A%20potentially%20malicious%20URL%20click%20was%20detected%22%20alert&pageId=9747&_a=edit&anchor=investigating-non-atp-urlclicks) below for further scenarios and suggestions.
- If the IPs are not Microsoft IPs, then the IPs were accessed outside Microsoft. The customer should troubleshoot further themselves. Please see [Investigating non-ATP URLClicks](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?wikiVersion=GBmain&pagePath=/Drafts/TSG%3A%20%22A%20potentially%20malicious%20URL%20click%20was%20detected%22%20alert&pageId=9747&_a=edit&anchor=investigating-non-atp-urlclicks) below for further scenarios and suggestions.

## Investigating non-ATP URLClicks
This section provides some best-effort tips to help customers to investigate "A potentially malicious URL click was detected" alerts where EOP/ATP/SONAR (i.e. our service) did not make that click.

### When is the "A potentially malicious URL click was detected" alert triggered?
Once EOP determines that a URL is malicious (it may have been classed as 'clean' originally), we look back up to 48hrs to see which users had already clicked on it. We won't know the status of the URL at that time for sure, so the alert triggers for any user who had clicked on the URL. It's up to the admin to decide whether to investigate these situations further, as they could indicate an account compromise.
Bear in mind that Safe Links URL rewrites by default contain the original recipient address, so that rewritten link is always associated with that user, no matter who or what clicks on it.

### Does the click represent a compromise of the user account?
Very often, cases come to us asking where a click in the URLClick report comes from, as the user says they didn't click on it. Here are some possible scenarios (not exhaustive):
  - The user **did** click on the URL.
  - Someone else on the mail thread clicked the wrapped URL, i.e. where the rewritten links persists in the mail thread.
  - The mail passed through a third-party service (maybe used by the customer, maybe not) that clicked the wrapped URL. (Check mail headers to verify this.)
  - A third-party add-on accesses emails and scanned the wrapped URL.
  - The wrapped URL was exfiltrated from the email/Teams thread and was accessed elsewhere (shared in other emails, docs (e.g. OneDrive, Sharepoint), blogs, tweets, other messaging apps (e.g. Teams)).

Note that, where the original Safe Links rewrite was done for a shared mailbox or a mailbox that is used by delegates, it will be harder to track who clicked on the link, since the click will be attributed to that mailbox. The source IP of the click may help to determine the actual user who click it, however.

While Safe Links is supported for shared mailboxes, URLClicks aren't, for the reason above. To work around this, Safe Links wrapping can be disabled for shared mailboxes (not officially recommended), however the admin needs to be sure that all users accessing the mailbox only do so through Safe Links-aware clients (most Outlook/OWA clients), so that the unwrapped URLs are still scanned via the Safe Links API.

### Tips for investigating non-ATP URLClicks
These are tips for the customer. MDO support does not need to lead and investigate into this. 
  - Look up the IPs on a site like [Whois.com](https://www.whois.com/whois/), [IP WHOIS Lookup](https://iplocation.io/ip-whois-lookup), or [Whois Lookup, Domain Availability & IP Search - DomainTools](https://whois.domaintools.com/)
  - Check sign-in logs to see if the same/similar IPs connected to ExO around the time-of-click or earlier. Clicks could have been made by a user or non-user. Entra has sign-in logs that go back 30 days for both interactive and non-interactive sign-ins. The Unified Audit Log has sign-in logs that go back 180 days, but only for interactive sign-ins.
  - Store events (only accessible to support through an Assist Diag) should show if someone/something access a particular mail (but not the URL). This can be useful to confirm e.g. if a third-party app is accessing mails, which may have triggered the URLClick. You can help the customer with this on a best-effort basis, if you wish.

### If the customer believes that an account may have been compromised, they could take the following actions.
  - [Responding to a Compromised Email Account - Microsoft Defender for Office 365 | Microsoft Learn](https://learn.microsoft.com/en-us/defender-office-365/responding-to-a-compromised-email-account)
  - [Revoke user access in an emergency in Microsoft Entra ID - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access)
  - [How to kill an active user session in Office 365 | Microsoft Learn](https://learn.microsoft.com/en-gb/archive/blogs/educloud/how-to-kill-an-active-user-session-in-office-365)

Please note that MDO does not support compromised account scenarios/investigations, apart from reviewing certain parts of mailflow. The [CIRT support team](https://aka.ms/EngageIr) (click on CSS CIRT) can help customers to investigate further, if there is a suspicion that an account has been compromised. This service is available to Premier support customers only (with the exception of Internal Premier and ASfP).

# Escalating to Engineering
- Please provide full information when escalating, including IPs, timestamps and NMIDs for any EOP/MDO or Azure Public Cloud IPs that you need us to check.
- Be sure to choose the correct path when escalating via Assist 365:
  - **Exchange Online/MDO Escalations [CFL/PSI/CRITSIT ONLY]**: Severity 2 IcM
  - **Exchange Online/MDO Escalations [ISSUE/RFC/DCR]**: Severity 3 IcM.
