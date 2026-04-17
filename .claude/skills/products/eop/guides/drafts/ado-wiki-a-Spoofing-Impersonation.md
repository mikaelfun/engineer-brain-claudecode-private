---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Spoofing User Impersonation and Domain Impersonation"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FSpoofing%20User%20Impersonation%20and%20Domain%20Impersonation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Spoofing, User Impersonation, and Domain Impersonation**

[[_TOC_]]

Phishing and false negatives can cause a lot of damage in an organization. New features have recently been added to Microsoft 365 that can limit the damage that these attacks can have. In this article we will be looking at Spoofing, User Impersonation, and Domain Impersonation. We will look at what these are, how they are different from each other, and how you can test these features out in your own tenant.

All three of these features, Spoofing, User Impersonation, and Domain Impersonation are configured through an Anti-phishing Policy. You can jump right to these policies by using the link [https://security.microsoft.com/antiphishing](https://security.microsoft.com/antiphishing).

Impersonation features are available to tenants that have Microsoft Defender for Office 365, or Microsoft 365 Enterprise E5 licenses. For more information, see [Anti-phishing policies](https://docs.microsoft.com/microsoft-365/security/office-365-security/set-up-anti-phishing-policies?view=o365-worldwide).

## Spoofing

Spoofing refers to an attacker sending mail from a domain (where that domain is set either as the MailFrom or From domain in an email message) which they do not own. This domain can either be one of your domains, or a domain of a legitimate organization. Spoofing detection will typically kick in when authentication checks on an inbound message fail. Authentication checks refer to [SPF](https://docs.microsoft.com/microsoft-365/security/office-365-security/set-up-spf-in-office-365-to-help-prevent-spoofing?view=o365-worldwide) (Sender Policy Framework), [DMARC](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-dmarc-to-validate-email?view=o365-worldwide) (Domain-based Message Authentication, Reporting and Conformance), and [DKIM](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-dkim-to-validate-outbound-email?view=o365-worldwide) (DomainKeys Identified Mail) checks. The results of these checks can be found in the Authentication-Results header of a received email. When authentication fails, and we have signals to believe the message is a spoof, you will find CAT:SPOOF in the [X-Forefront-Antispam-Report header](https://docs.microsoft.com/microsoft-365/security/office-365-security/anti-spam-message-headers?view=o365-worldwide). The following is an example.

    Authentication-Results:
    spf=none (sender IP is 192.168.0.0) smtp.mailfrom=contoso.com; contoso.com;
    dkim=none (message not signed) header.d=none;contoso.com;
    dmarc=fail action=quarantine header.from=fabrikam.com;compauth=fail reason=000

    X-Forefront-Antispam-Report
    CIP:x.x.x.x;CTRY:DE;LANG:en;SCL:5;SRV:;IPV:NLI;SFV:SPM;H:contoso.com;PTR:InfoDomainNonexistent;CAT:SPOOF

When this happens, Microsoft 365 will take the action that is configured in the Anti-Phish filter for spoofed messages.

![Spoof action](/.attachments/Impersonation/spoof-action.png)

This protection is enabled by default on new Anti-phishing filters.

![Enable spoof intelligence setting](/.attachments/Impersonation/enable-spoof-intelligence.png)

### Exceptions

There are some situations where a spoof is legitimate. For example, you may have a cloud application that sends mail from one of your validated domains. This application only sends mail to your users and so the sending IP was never added to your domains SPF record and you do not have the application signing the messages with a DKIM signature. For these situations you can turn off spoof detection on those messages while still allowing regular spam checks to take place.

There are two ways to disable spoof checks for particular senders. If the sender has previously sent, it will show up on the spoof detection insight page, [https://security.microsoft.com/spoofintelligence?insightmode=yes](https://security.microsoft.com/spoofintelligence?insightmode=yes). This page will list senders that have been seen as spoof and you can either allow or block them directly from here. The following is what youll see when you click one of the entries on this page.

![Spoof flyout](/.attachments/Impersonation/spoof-flyout.png)

You can also use the Tenant Allow/Block Lists at [https://security.microsoft.com/tenantAllowBlockList?viewid=SpoofItem](https://security.microsoft.com/tenantAllowBlockList?viewid=SpoofItem). Under the Spoofing tab, click the Add button.

![Tenant Allow/Block Lists](/.attachments/Impersonation/tenant-allow-block-lists.png)

You will then add pairs consisting of a sender and where they are sending from.

![Spoofing allow list](/.attachments/Impersonation/spoofing-allow-list.png)

### Testing

Testing Domain Spoofing is straightforward. If you have a domain that has SPF and DMARC configured on it, send a message with your domain on the From line, and ensure it is sent from a source that is not present in your SPF record.

## User Impersonation

User Impersonation refers to inbound messages which are sent from an external sender where the sender resembles a user in your organization. An example of this could be the following:

Legitimate user: Joe Ceo <joe.ceo@contoso.com>
Impersonated user the attacker sends mail as: Joe Ceo <andrew@fabrikam.com>

When an inbound message is detected as User Impersonation, the X-Forefront-Antispam-Report header will contain CAT:UIMP. CAT is Category, and UIMP is User Impersonation. When this happens, Defender for Office 365 will take the action configured under If message is detected as an impersonated user in the Anti-Phish Policy:

![Impersonated User action](/.attachments/Impersonation/impersonated-user-action.png)

[User Impersonation](https://docs.microsoft.com/microsoft-365/security/office-365-security/set-up-anti-phishing-policies?view=o365-worldwide#impersonation-settings-in-anti-phishing-policies-in-microsoft-defender-for-office-365) can be detected on up to 350 users in your organization and is configured on an Anti-Phish Filter. When editing the filter, the users you would like to protect in this way are added under Enable users to protect.

![Enable users to protect setting](/.attachments/Impersonation/enable-users-to-protect.png)

All recipients of messages will benefit from this, but only inbound messages that impersonate one of the users on this list will be marked as User Impersonation. We recommend adding high level executives to this list and other users that would frequently be impersonated by attackers.

### Personal mailboxes

What happens if a protected user sends mail from their personal account to their work account? As an example, Joe is the CEO of Contoso and sends a message from his personal account <joe@fabrikam.com>, to his work account, <joe@contoso.com>. Both accounts use the same display name of Joe CEO. In this situation, the messages that he sends to himself from his personal account will be marked as User Impersonation by the Microsoft 365 Anti-Phish filter.

In situations like this, the mail being sent from the personal mailbox is most likely only going to be sent to the CEOs work account, and not to other internal user mailboxes. The recommendation for this situation is to have the CEO add the personal mailbox sending address to the [Safe Senders list](https://support.microsoft.com/office/add-recipients-of-my-email-messages-to-the-safe-senders-list-be1baea0-beab-4a30-b968-9004332336ce) of their Exchange Online mailbox.

Impersonation detection algorithms dont only consider string matching, they go much deeper. An example of another check Microsoft does as part of impersonation detection is to examine if a relationship exists between the sender and recipient. If multiple messages have flowed both ways between the two mailboxes, this is something we take into consideration when evaluating impersonation. For additional reading on how to **Enable mailbox intelligence**, see this [article](https://docs.microsoft.com/microsoft-365/security/office-365-security/set-up-anti-phishing-policies?view=o365-worldwide#impersonation-settings-in-anti-phishing-policies-in-microsoft-defender-for-office-365). When an inbound message is detected as impersonating by mailbox intelligence, the X-Forefront-Antispam-Report header will contain CAT:GIMP, where GIMP is Graph Impersonation.

### Testing

User Impersonation can only be tested with a mailbox that does not have a sending reputation with your organization. For testing, I would recommend spinning up a brand-new mailbox in a free service and setting the display name to match one of the users on the Protected List in the Anti-Phish filter.

## Domain Impersonation

Domain Impersonation will kick in when the sending domain looks like a legitimate domain. The domain can either be one that you own and is validated in your tenant or belong to a partner. For example, you have added and validated the domain contoso.com in your tenant, and you receive an inbound message from ntoso.com, or even ontoso.com.

Domain Impersonation is configured in the protection settings of an Anti-Phish filter.

![Enable domains to protect setting](/.attachments/Impersonation/enable-domains-to-protect.png)

When an inbound message is tagged as Domain Impersonation you will see CAT:DIMP in the X-Forefront-Antispam-Report header. When this happens, Defender for Office 365 will take the action that is configured for domain impersonation in the Anti-phishing filter.

![Impersonated domain action](/.attachments/Impersonation/impersonated-domain-action.png)

## Enable external sender callouts on email in Outlook

Many customers use a mail flow rule to add a banner to an email that will tell the recipient that an email has been sent by an external sender. Microsoft is bringing this ability directly to Outlook clients and this can be turned on through PowerShell. For more information on this see the following URLs.

- [Native external sender callouts on email in Outlook - Microsoft Tech Community](https://techcommunity.microsoft.com/t5/exchange-team-blog/native-external-sender-callouts-on-email-in-outlook/ba-p/2250098)
- [Set-ExternalInOutlook (ExchangePowerShell) | Microsoft Docs](https://docs.microsoft.com/powershell/module/exchange/set-externalinoutlook?view=exchange-ps)

## Additional Links

- [Anti-phishing policies - Office 365 | Microsoft Docs](https://docs.microsoft.com/microsoft-365/security/office-365-security/set-up-anti-phishing-policies?view=o365-worldwide)
- [Anti-spam message headers - Office 365 | Microsoft Docs](https://docs.microsoft.com/microsoft-365/security/office-365-security/anti-spam-message-headers?view=o365-worldwide)
- [Step-by-step threat protection stack in Microsoft Defender for Office 365 - Office 365 | Microsoft Docs](https://docs.microsoft.com/microsoft-365/security/office-365-security/protection-stack-microsoft-defender-for-office365?view=o365-worldwide)

## Content Information

Please visit <https://aka.ms/mdopu> , <https://aka.ms/mdoki> , <https://aka.ms/mdoqa> , <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements
