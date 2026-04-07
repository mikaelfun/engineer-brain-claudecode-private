---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Relay Pools"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FRelay%20Pools"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting Relay Pools

[[_TOC_]]

Microsoft has hardened configuration for relaying or forwarding email through Office 365. Relay Pools are separate IP address pools that are used for messages relayed or forwarded via Microsoft 365. Messages sent via relay pools may end up in a recipients Junk mail folders. As noted in the updated [public documentation](https://docs.microsoft.com/microsoft-365/security/office-365-security/high-risk-delivery-pool-for-outbound-messages), mail servers in the Microsoft 365 datacenters might be temporarily guilty of sending spam. For example, a malware or malicious spam attack in an on-premises email organization that sends outbound mail through Microsoft 365, or compromised Microsoft 365 accounts. Attackers also try to avoid detection by relaying messages through [Microsoft 365 forwarding](https://techcommunity.microsoft.com/t5/exchange-team-blog/all-you-need-to-know-about-automatic-email-forwarding-in/ba-p/2074888). These types of scenarios can result in the IP address of the affected Microsoft 365 datacenter servers appearing on third-party block lists, and destination email organizations that use these block lists will reject email from those messages sources.

[May 2023 update] Via MC559257, customers were updated that emails sent through an outbound connector will also use the Relay Pool if messages do not meet any one of the below criteria.

There are three different pool types utilized for outbound mail:

- The **normal IP address pool** for outbound email maintains the reputation for sending "high quality" messages, which reduces the likelihood that these IP address will appear on IP block lists.

- The **high-risk delivery pool**, utilized for all outbound messages from Microsoft 365 datacenter servers that are determined to be spam or exceed the sending limits of the service or outbound spam policies. Using the high risk delivery pool helps prevent the normal IP address pool for outbound email from sending spam. NULL <> sender mail, such as auto-replies and NDR's, are also sent via this pool.

- The **relay pool**. Messages that are forwarded or relayed via Microsoft 365 in certain scenarios will be sent using special relay pools, because the destination should not consider Microsoft 365 as the actual sender. It's important for Microsoft to isolate this email traffic, because there are legitimate and invalid scenarios for auto forwarding or relaying email out of Microsoft 365. Similar to the high-risk delivery pool, this separate IP address pool is used for relayed mail. The IP addresses for the relay pools can change often, and thus are not part of published SPF records for Microsoft 365.

## Impact to administrators

Administrators will need to ensure SPF records are correct so that when relayed or autoforwarded messages arrive to Microsoft Office 365, SPF is passed. Also, for On-Premises messages, administrators should ensure the P1 SMTP MailFrom sender domain and P2 From sender domain match.

**Additionally, if MX records are pointed to a 3rd party or on-premises, administrators should utilize [Enhanced Filtering](https://docs.microsoft.com/exchange/mail-flow-best-practices/use-connectors-to-configure-mail-flow/enhanced-filtering-for-connectors) to ensure the SPF validation is correct.**

See routing examples below for details.

## Impact to users

Messages sent via relay pools may appear in the Junk mail folder for recipients.

Since SRS rewriting is not applied for messages that are sent via relay pool, P1 from (Envelope From) is not modified when it is forwarded. This may cause SPF fail in the recipient side and there are chances that DMARC may fail too (if DKIM of P2 domain do not pass). It may also cause email to be rejected if DMARC fails and DMARC policy is set to reject.

External recepients may have rules or policies to block message that are not SRS rewritten.

## Mitigation

For messages that are autoforwarded or relayed out of Microsoft 365, we're updating our Relay Pools to verify that the original sender is legitimate so we can confidently deliver autoforwarded and relayed messages. In order to do that, email authentication needs to pass when the message comes to us. Moving forward, customers must ensure that forwarded/relayed messages meet **_one_ of the following criteria** to avoid using the Relay Pool:

- The outbound sender is in an accepted domain of the tenant
- SPF passes when the message comes to Microsoft 365.
- DKIM on the P2 sender domain passes when the message comes to Microsoft 365.

All other incoming messages that do not meet _**one**_ of the criteria will be sent through the Relay Pool. The only exception for relayed messages are those that pass the inbound SPF but the outbound SMTP MailFrom P1 is not an accepted domain within the tenant. In those cases, to help the receiver know that the forwarded message is from a trusted source, we will utilize Sender Rewriting Scheme (SRS) to rewrite the P1 address and send it via the Regular Pool instead of Relay Pool. You can read more about how that works and what you can do to help make sure the sending domain passes authentication in [Sender Rewriting Scheme](https://docs.microsoft.com/office365/troubleshoot/antispam/sender-rewriting-scheme) (SRS). In order to keep applying the SRS rewrite, customer needs to make sure when message comes to Office 365, either SPF or DKIM pass. If it is a complex routing scenario, useEnhanced filtering for SPF to pass.

## How to tell if a message was sent via relay pool

- \*NEW Review the Outbound section in the Top Domain Mailflow Status [Report](https://admin.exchange.microsoft.com/#/reports/topdomainmailflowdetails) in Exchange Admin Center. ([Documentation](https://docs.microsoft.com/exchange/monitoring/mail-flow-reports/mfr-top-domain-mailflow-status-report#:~:text=The%20Top%20domain%20mailflow%20status,Flow%20in%20the%20new%20EAC))
- Review the outbound server IP in headers of received messages (on the recipient side). The relay pool will be in the 40.95.0.0/16 range.

**Internal methods, do not communicate to customers:**

- Messages sent through relay pool will have the header X-MS-Exchange-AntiSpam-Relay: 1
- Check if SRS is skipped due to relay pool: if "HasSkipSrsTag=RelayPool" is present in the message trace and sender is not rewritten, then the message falls into relay pool category.
- In SENDEXTERNAL event of detailed message traces, look for S:OutboundIpPool in data property. If S:OutboundIpPool = 1022 or 1023, it indicates that the message is sent from relay pool.
- Review the Customdata field for SFP value. Below are the IP partitions and various pool values:

  | IP Partition | Usage                             |
  | ------------ | --------------------------------- |
  | 1901         | Consumer Outbound Pool            |
  | 1101         | Enterprise Normal Outbound Pool1  |
  | 1102         | Enterprise Normal2 Outbound Pool2 |
  | 1501         | Enterprise HighRisk Outbound Pool |
  | 1022         | Normal Relay Outbound Pool        |
  | 1023         | Highrisk Relay Outbound Pool      |
  | 1701         | LowRisk Outbound Pool             |

### Routing Examples

**A) From a local email server <reports@fabrikam.com> (Accepted Domain) > Office 365 (regular pool) > contoso.com**

Joe works for Fabrikam. He sends an automatic daily report from a local email server to his clients at Contoso. Joe uses the sender address <reports@fabrikam.com>. The domain fabrikam.com is part of Fabrikam's Exchange Online Accepted Domains in Office 365. Email from Joe's server attributes to the Fabrikam Office 365 tenant as "Originating" from this domain, and such messages would not be sent via the relay pool.

**B) From a cloud email service <noreply@fabrikammail.com> (non-accepted domain, SPF passes, no DKIM) > Office 365 (regular pool) > contoso.com**

Leah works for Fabrikam. She sends important business updates from an external cloud email service provider that uses the sender address <noreply@fabrikammail.com>. Although fabrikam.com is part of Fabrikam's Exchange Online Accepted Domains in Office 365, the domain fabrikammail.com is not. An Inbound Connector is configured to receive emails from the public IP address of the email service provider, as published on the provider's website. The IP address of the sending cloud email service is part of fabrikammail.com SPF record, to ensure good email authentication and deliverability. Such messages would not be sent via the relay pool.

**C) From a scanner <bob@scanner.fabrikam.com> (non-accepted domain, no SPF, no DKIM) > Office 365 (relay pool) > contoso.com**

Bob works for Fabrikam. He scans a document using the company scanner. The sending domain it uses is scanner.fabrikam.com to be sent to Contoso. Although fabrikam.com is part of Fabrikam's Exchange Online Accepted Domains in Office 365, the domain scanner.fabrikam.com is not. Furthermore, "Accept Mail from All Subdomains" is not selected under Exchange Online Accepted Domain settings for the domain fabrikam.com. Fabrikam has yet to configure SPF or DKIM. As such, the message may route through the new outbound relay pool and is likely to end up in contoso.com recipients' junk mail folders or spam quarantines.

**Solution**: add the subdomain as an accepted domain, select to accept mail from all subdomains, or sign the scanner messages with SPF or DKIM.

**D) From a cloud email service <notifications@fabrikammail.com> (non-accepted domain, SPF signed, but MX doesnt point to EOP) > 3rd party spam filter > Office 365 (relay pool) > contoso.com**

Sarah works for Fabrikam. She relays notifications from an external cloud email service provider that uses the sender address <notifications@fabrikammail.com>. Fabrikammail.com is not part of Fabrikam's Exchange Online Accepted Domains in Office 365, its MX record does not point to Office 365 in DNS (it does not point to fabrikammail-com.mail.protection.outlook.com - it points to a third-party spam filter service that scans all incoming messages first.) The IP address of the sending cloud email service is part of the senders SPF record, to ensure good email authentication and deliverability. However, Enhanced Filtering for Connectors is not enabled on Fabrikams Inbound Connector which is configured to receive emails from the third-party spam filter service. As such, Office 365 is unable to validate the _original_ SPF record of the cloud email service, and the message may route through the new outbound relay pool and is likely to end up in contoso.com recipients' junk mail folders or spam quarantines.

**Solution**: enable Enhanced Filtering for Connectors on the Inbound Connector from the third-party spam filter service.

## Training

This information was covered in the Nov 2021 [Readiness Connect _This content in this URL has been migrated to the New Stream. Please search aka.ms/betatalks to access this content._](https://aka.ms/betatalks) .

## Frequently asked questions

**Could you check if this will affect our environment at our backend?**
Relay pool is a service-wide feature that impacts all tenants if the criteria match.

**Conditions: Should all conditions match to skip relay pool routing?**
_Either_ of these conditions should match for message to skip relay pool routing.
-Outbound sender domain is an accepted domain of the tenant.
-SPF passes when the message comes to Microsoft 365
-DKIM on the sender domain passes when the message comes to Microsoft 365

**What if a customer's MX points to my on-premises Exchange Server?**
To ensure the right SPF authentication checks, Enhanced Filtering is recommended for _any_ scenario where MX record doesn't point to Office 365, including Exchange Servers.

**Will this impact mail which is sent to an on-premises mail server using a transport-rule-scoped outbound connector where the messages are routed to a non-registered on-prem domain?**
No, this change is only for relay _from_ non-accepted and unauthenticated sender domains _relayed via Office 365_ (for example, by local email server, printers, scanners, line of business applications or another cloud service relaying via Office 365).

**What if Im relaying from a subdomain of an Accepted Domain?**
If a message routes out of a non-accepted _subdomain_, you could either select "Accept Mail from All Subdomains" in the Accepted Domains settings in Exchange Online for the domain in question, add the respective subdomain to Office 365, or authenticate the message with SPF or DKIM.

## Escalating to Microsoft engineering

Use Assist365 path : **Exchange Online\MDO Escalations**

## Customer facing content

MC Posts: [MC293204](https://lynx.office.net/#/messagecenter/MC293204),[MC283873](https://lynx.office.net/#/messagecenter/MC283873),[MC266466](https://lynx.office.net/#/messagecenter/MC266466),[MC345565](https://lynx.office.net/#/messagecenter/MC345565)

[Outbound delivery pools - docs.microsoft.com](https://docs.microsoft.com/microsoft-365/security/office-365-security/high-risk-delivery-pool-for-outbound-messages#relay-pool)

## Content Information

Please visit <https://aka.ms/mdopu> , <https://aka.ms/mdoki> , <https://aka.ms/mdoqa> , <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements
