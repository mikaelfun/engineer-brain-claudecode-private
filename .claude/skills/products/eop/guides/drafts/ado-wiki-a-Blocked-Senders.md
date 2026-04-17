---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Troubleshooting Blocked Senders"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTroubleshooting%20Blocked%20Senders"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Troubleshooting Restricted Senders, Tenants, and IPs

# Restricted Sender ([**5.1.8**](https://docs.microsoft.com/exchange/mail-flow-best-practices/non-delivery-reports-in-exchange-online/fix-error-code-5-1-8-in-exchange-online))

Typically, this issue arises when an account has been compromised through phishing or malware, leading to excessive spamming, or when the account exceeds the message limits set by the 'Protection settings' in the scoped Outbound spam policy.

## Support Diagnostics

**Validate Sender Health** diagnostic shows the last Network Message ID sent before restriction enforcement: `OutboundSpamLast24Hours=\<x\>;OutboundMailLast24Hours=\<y\>;OutboundSpamPercent=\<z\>;Last Spam Message **MessagetraceId:\<MessageTraceID\>**`

**Get-BlockedSenderAddress -SenderAddress <XX@X.com> | Format-List**

**Extended Message Trace** **Custom Data** shows the filtering verdicts, incl. SCL, DIR, SFV, Analyst Rules.

1. For False Positive escalations, obtain a sample from the mailbox defined for BCC copies of spam in the Outbound Spam policy (M365 Defender \> Email & collaboration \> Policies & Rules \> Anti-spam \> Outbound Spam \> Send a copy of outbound messages that exceed these limits to these users and groups). Confirm that the [X-Forefront-Antispam-Report](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/14135/X-Forefront-Antispam-Report?anchor=how-to-get-%27forefront-antispam-report-header%27-%3Cbr%3E) header shows DIR:OUT and has an SCL value of 5 or higher.

2. If the blockage is due to the Outbound spam policy settings, verify whether the user requires higher limits and make the necessary adjustments, or ensure the user is scoped to the appropriate policy.

<span style="color: Green;"> **Important Note on Outbound Spam Policy Blocks**: <span style="color: Red;"> When using a shared mailbox or the 'send as' feature, it is crucial to apply the policy with the higher message limit to the individual sending the messages as well. If not, they will be subject to their Outbound spam policy, which may have lower limits. The simplest solution is to assign the correct Outbound spam policy to the shared mailbox and to all users with access to it.

**For more information on how "Send As" scenarios relate to Outbound Spam Policy Blocks please see [Understanding and Troubleshooting Recipient Rate Limit (RRL)](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/12583/Understanding-and-Troubleshooting-Recipient-Rate-Limit-(RRL))**

## [Remove blocked users from the Restricted users portal](https://docs.microsoft.com/microsoft-365/security/office-365-security/removing-user-from-restricted-users-portal-after-spam?view=o365-worldwide)

The sender should be able to send e-mail within 1 hour. If still unable to send after a few hours, check for service health issues and escalate the request to unblock the sender to AntiSpam Engineering with the diagnostics and traces outputs.

# Exceeded RRL or Submission Quota ([5.1.90](https://docs.microsoft.com/alchemyinsights/5-1-90-your-message-cant-be-sent-daily-limit) or [5.2.0](https://docs.microsoft.com/exchange/troubleshoot/send-emails/smtp-submission-improvements))

550 5.1.90 Your message can't be sent because you've reached your daily limit for message recipients

The error occurs when the sender has exceeded the Recipient Rate Limit (RRL) as described in [Sending limits](https://docs.microsoft.com/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits#sending-limits).

Exceeding the per day limit may also cause the following error message: `“5.2.0 STOREDRV.Submission.Exception:SubmissionQuotaExceededException; Failed to process message due to a permanent exception with message The message can't be submitted because the sender's submission quota was exceeded.”`

Review the last messages the user sent to find the exact time the 24-hour counter started, and if the block was for internal or external messages limits.

`EmailSendingLimitExceeded;InternalRecipientCountToday=x;ExternalRecipientCountToday=y;ExceedingLimitType=\<Internal\>/\<External\>;Last MessagetraceId=\<\>;LastMessageRcptCount=z;`

The default RRL is 10,000 messages a day, but it’s customizable.

Check the Outbound Spam policy (M365 Defender \> Policies & Rules \> Anti-spam \> Outbound Spam \> Daily Message Limit) to confirm if default value (10000) has been customized. The value “0” means default, which is 10,000 messages a day – **do not** assign 10,000 manually to fix the issue.

Wait 24h after the initial block for the sender to be automatically released.

Educate the customer on the Exchange Online service [limits](https://docs.microsoft.com/office365/servicedescriptions/exchange-online-service-description/exchange-online-limits#sending-limits), especially how we recommend third-party services for bulk relays.

This NDR could indicate the account has been compromised. [Check](https://docs.microsoft.com/office365/troubleshoot/security/determine-account-is-compromised) / [recover](https://docs.microsoft.com/microsoft-365/security/office-365-security/responding-to-a-compromised-email-account?view=o365-worldwide).

Follow this [wiki](https://aka.ms/errl) on how to respond or escalate RRL requests to Engineering.

# Unregistered (Unprovisioned) Domains ([**5.7.750**](https://docs.microsoft.com/exchange/mail-flow-best-practices/non-delivery-reports-in-exchange-online/fix-error-code-5-7-700-through-5-7-750))

5.7.750 Client blocked from sending from unregistered domain.

The error occurs when a large volume of messages is sent from domains that aren't provisioned in Office 365 (added as Accepted Domains and validated).

Run the **Validate Domain Health** diagnostic to identify the block. `(Internal) Event Type: UnprovisionedDomainBlockTenantId`

`Properties tested: Tenant Id: \<\>;Listed Count: x; Delisted Count: y; Listed Date: 2021-01-01 00:00:00Z;Reason:totalOutboundRecipients24Hours=X;OutboundSpam24Hours=Y;OutboundUnprovisionedMail24Hours=Z;TenantAgeInDays=A;TotalSeatCount=B;TrialSeatCount=C;MessageId=\<MessageTraceID\>`

Run the **Get Message Trace** diagnostic with the Network Message ID you collected to review the sender information and if it’s sent from unprovisioned domains.

Use the [**Top Senders**](https://security.microsoft.com/reportv2?id=TopSenderRecipientsATP) report to identify indicators of misconfigurations or compromise.

If sending domains should be Accepted Domains and aren’t yet, [add](https://docs.microsoft.com/microsoft-365/admin/setup/add-domain?view=o365-worldwide) them.

Review if senders are compromised and [**recover**](https://docs.microsoft.com/microsoft-365/security/office-365-security/responding-to-a-compromised-email-account?view=o365-worldwide)**.**

Once secured, **release** with:

**Diag: Release Tenant Unregistered Domains**

**Diag: Validate Domain Health**

# IP Blocked ([**5.7.708**](https://docs.microsoft.com/exchange/mail-flow-best-practices/non-delivery-reports-in-exchange-online/fix-error-code-5-7-700-through-5-7-750))

5.7.708 Access denied, traffic not accepted from this IP

This error occurs when sending email from known, low reputation IP addresses that are typically used by new customers.

Review samples of messages sent from the IP. Check that the IP is not sending any spam or phish.

**Diag: Release Tenant IP Not Accepting Traffic**

# Tenant Exceeded Threshold ([**5.7.705**](https://docs.microsoft.com/office365/troubleshoot/antispam/tenant-has-exceeded-threshold))

5.7.705 Access denied, tenant has exceeded threshold.

This message occurs when too much spam or bulk mail has been sent by your organization and we place a block on outgoing mail.

Follow the up-to-date Wiki guidance: [Investigate Fraud and Recover Mail Flow](https://aka.ms/mdofraud)

# Server Busy (Gray-listed) ([**4.7.500**](https://docs.microsoft.com/exchange/mail-flow-best-practices/non-delivery-reports-in-exchange-online/fix-error-code-451-4-7-500-699-asxxx-in-exchange-online))

4.7.500 Server busy. Please try again later from [XXX.XXX.XXX.XXX] or 4.7.500 Access denied, please try again later. For more information, please go to <http://go.microsoft.com/fwlink/?LinkId=526653>

The source email server (the connecting IP address) changed its previous email sending patterns by sending a much higher volume of messages than in the past. This is “gray listing”: when new senders appear, they're treated more suspiciously than senders with a previously established history of sending email messages (think of it as a probation period).

If the organization does not use EOP (for example, if you provide a third-party service), the error will resolve itself as you establish an email sending history with Microsoft 365 or Office 365 over a period of a few days.

If trying to relay outbound email from on-premises email server through Microsoft 365, configure an Inbound EOP [connector](https://docs.microsoft.com/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/set-up-connectors-to-route-mail). If inbound email to your Microsoft 365 organization is first routed through a third-party service, appliance, or device, set up a [connector](https://docs.microsoft.com/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/set-up-connectors-for-secure-mail-flow-with-a-partner) to apply security restrictions.

**After you have set up a connector, monitor if IP throttling has stopped.**

**Diag: Release Tenant IP Server Busy will allow the sender a 14-day period of exclusion from the Server Busy errors to build enough reputation.**

This diagnostic is not a replacement for the Connector requirements. It’s an extra measure to help restore mail flow.

# Forwarding restricted ([**5.7.520**](https://docs.microsoft.com/microsoft-365/security/office-365-security/external-email-forwarding?view=o365-worldwide))

**550 5.7.520 Access denied, Your organization does not allow external forwarding**

External forwarding is controlled in the **Outbound Spam** policy under
**Microsoft 365 Defender** \> **Email & collaboration** \> **Policies & rules**
\> **Threat policies** \> **Anti-spam.**

**Automatic - System-controlled** (default): Allows outbound spam filtering to control automatic external email forwarding.

**On**: Automatic external email forwarding is not disabled.

**Off**: All automatic external email forwarding is disabled

**Since 2021, “Automatic” means “Off”.**

Review the [auto-forwarded messages report](https://admin.exchange.microsoft.com/#/reports/autoforwardedmessages) and help customers make an informed decision for “On” or “Off” controls: to protect against data exfiltration: “Off” is recommended on the default policy. We recommend “On” be limited to specific Users, Groups, or Domains in a custom outbound spam policy. See [Control automatic external email forwarding in Microsoft 365](https://docs.microsoft.com/microsoft-365/security/office-365-security/external-email-forwarding?view=o365-worldwide) for details.

To allow some users to continue automatic external email forwarding (not recommended), create a new outbound spam policy or modify the existing one to include the **Users, Groups** or **Domains** to allow.

# Sender IP Banned ([**5.7.606-649**](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-the-delist-portal-to-remove-yourself-from-the-office-365-blocked-senders-lis?view=o365-worldwide))

Access denied, banned sending IP [IP1.IP2.IP3.IP4]

The IP that you are attempting to send from has been banned. Verify that you are following the [best practices for email deliverability](https://docs.microsoft.com/dynamics365/marketing/get-ready-email-marketing) and ensure your IPs' reputations have not been degraded as a result of compromise or malicious traffic. If you believe you are receiving this message in error, you can use the self-service portal to request to be removed from this list. For more information, see [Use the delist portal to remove yourself from the blocked senders list.](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-the-delist-portal-to-remove-yourself-from-the-office-365-blocked-senders-lis?view=o365-worldwide)

Collect the information from the relaying Mail Transfer Agent (MTA). The error in the MTA SMTP logs will resemble “To request removal from this list please visit <https://sender.office.com/> and follow the directions. For more information please go to <http://go.microsoft.com/fwlink/?LinkID=526655> AS(1430)”

**Self-delist:** [Use the delist portal to remove yourself from the blocked senders list.](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-the-delist-portal-to-remove-yourself-from-the-office-365-blocked-senders-lis?view=o365-worldwide)

None of the RAVE diagnostics remove this block: if self-delisting doesn’t help within 24h, escalate to Antispam Engineering with the most recent SMTP errors and logs.

# Sender IP Banned ([**5.7.511**](https://docs.microsoft.com/microsoft-365/security/office-365-security/use-the-delist-portal-to-remove-yourself-from-the-office-365-blocked-senders-lis?view=o365-worldwide#what-about-error-code-57511))

In certain situations, Microsoft must conduct additional investigations against traffic from your IP, and if you’re receiving the NDR code 5.7.511, you _will not_ be able to use the delist portal.

550 5.7.511 Access denied, banned sender [xxx.xxx.xxx.xxx]. To request removal from this list, forward this message to <delist@microsoft.com>. For more information, go to <https://go.microsoft.com/fwlink/?LinkId=526653>.

In the email to request removal from this list, provide the full NDR code and IP address. Microsoft will contact you within 48 hours with the next steps.

If the customer has emailed that alias, received a response from Microsoft (a ticket number) but still requires additional assistance, validate the banned IP context, and escalate to Antispam Analysts and provide the entire history of the investigation.

# **FAQ**

**Find Message ID by Network Trace ID**

`Get-MessageTrace -MessageTraceID <MessageTraceID\>`

**Find the mailbox BCCed on outbound spam**

`Get-HostedOutboundSpamFilterPolicy | fl Name, BccSuspiciousOutboundAdditionalRecipients`

**Check the daily recipient limit** (0 means default, which is 10,000 messages a day)

`Get-HostedOutboundSpamFilterPolicy | fl Name, RecipientLimitPerDay`

**To review automatic forwarding configurations**

`Get-HostedOutboundSpamFilterPolicy | fl Name, AutoForwardingMode`

**RRL applies to P2 senders**

In case of users relaying sending as others via SMTP AUTH, the shared mailbox object may be restricted, not the delegate.

**System messages such as OOF and NDRs are sent with empty sender envelope (P1) address \<\>**

This could lead to Unprovisioned Domain blocks.

**In the future, admins will be able to override RRL blocks**.

For now, RRL blocks self-release in 24 hours or by Engineering.

**Automatic forwarding settings support on-premises based users** who are routing mail out via Office 365 as of Nov ’21. 

#**Diagnostics**

[Microsoft Defender for Office365 Diagnostics](https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki/14131/MDO-Diagnostics-Detailed-Description-and-Demos)

## Content Information

Please visit <https://aka.ms/mdopu> , <https://aka.ms/mdoki> , <https://aka.ms/mdoqa> , <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements
