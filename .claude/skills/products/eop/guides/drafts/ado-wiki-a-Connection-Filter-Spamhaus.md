---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/TSG for Connection Filter Policy and Spamhaus Detection Handling"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FTSG%20for%20Connection%20Filter%20Policy%20and%20Spamhaus%20Detection%20Handling"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**TSG for Connection Filter Policy and Spamhaus Detection Handling**

[[_TOC_]]

#Introduction
The default connection filter policy helps organizations manage email traffic from trusted and untrusted source servers. It is automatically applied to all inbound connections and includes the following key components:

#Key Components

- **IP Allow List:** 
Skips spam filtering for specified IPs but still checks for **malware** and **high-confidence phishing**.

- **IP Block List:**
Blocks and rejects all messages from specified IPs without further filtering.

- **Safe List:** Automatically allows trusted senders identified by Microsoft, with no manual configuration needed. <span style="color: Red;"> **NOTE:** We do not disclose which IPs are included in the safe list, and the list is subject to change at any time.

For more information, refer to:
- [Configure connection filtering](https://learn.microsoft.com/en-us/defender-office-365/connection-filter-policies-configure)
- [Secure by default in Office 365](https://learn.microsoft.com/en-us/defender-office-365/secure-by-default)

# Frequently Asked Questions
<hr>

## Q1: Can I use IPv6 addresses in the Connection filter policy?
**A1:** No, IPv6 addresses aren't supported in the Connection Filter IP Allow/Block List. However, you can manage IPv6 addresses using the [Allow or block IPv6 addresses using the Tenant Allow/Block List](https://learn.microsoft.com/en-us/defender-office-365/tenant-allow-block-list-ip-addresses-configure), which offers similar functionality but only supports IPv6.

<hr>

## Q2: Will messages from IP Block List appear in message trace?
**A2:** No, messages from sources listed in the IP Block List are rejected at the **edge** and do not appear in message trace logs.

<hr>

## Q3: Can I use any CIDR range in the IP Allow/Block List?
**A3:** No, the IP Allow/Block List only supports CIDR IP ranges with a network mask from /24 to /32.

<hr>

## Q4: What happens if an IP address is listed in both the IP Allow List and the IP Block List?
**A4:** The IP Allow List takes precedence over the IP Block List. If an IP address appears in both lists, it will not be blocked.

<hr>

## Q5: How many entries can I add to the IP Allow List and IP Block List?
**A5:** Both the IP Allow List and the IP Block List support a maximum of **1,273 entries** each. An entry can be a single IP address, an IP address range, or a CIDR-formatted IP.

<hr>

## Q6: Does adding an IP to the IP allow/block list affect other tenants?
**A6:** No, adding an IP to the allow/block list only affects the tenant that configured it. It does not impact other tenants.

<hr>

## Q7: Will messages from an IP allow list source be delivered even if they are considered spam or phishing?
**A7:** **Potentially**, messages may be delivered if they are classified as **spam** or **regular phishing**. <span style="color: Red;"> However, high-confidence phishing and malware will still be quarantined in accordance with the [Secure by default in Office 365](https://learn.microsoft.com/en-us/defender-office-365/secure-by-default).

<hr>

## Q8: What is the impact of inbound connectors with a sending IP on connection filter processing?
**A8:** Inbound connectors of the On-premises or Partner type with defined sending IPs do not affect connection filter processing, **provided that Enhanced Filtering for Connectors is not enabled**. 

Keep in mind that internal emails **(DIR:INT)** are not processed by the connection filter policy, even if the sending IP is configured in IP allow list. This typically applies to **emails sent from an on-premises mailbox to a cloud mailbox via an inbound connector**.

<hr>

## Q9: What is the behaviour of the connection filter when Enhanced Filtering for Connectors (EFC) is enabled, particularly in environments where the MX record is pointed to third party email filtering?
**A9:** If Enhanced Filtering for Connectors is enabled, the original connecting IP **(CIP: [IP address])** is not evaluated against the IP Allow/block list. <span style="color: Red;"> In other words, once connecting IP addresses such as those from **gateways servers** are added to the Enhanced Filtering list, the IP Allow override **no longer** applies on CIPs, and all EOP/MDO filtering capabilities remain fully active. 

However, in such scenarios, if the Connection Filter IP Allow list includes a **skip-listed** IP address, it will still be evaluated. As a result, the email may be stamped with **IPV:CAL** and assigned an **SCL of -1**, bypassing all filters. 

This behaviour is generally not recommended, as it defeats the purpose of Enhanced Filtering for Connectors (EFC). Therefore, it's important to only add the original source IPs (i.e., skip-listed IPs) to the IP allow list when you intend to completely bypass filtering. 

You can identify skip-listed IPs in the **Authentication-Results** header or the **X-MS-Exchange-ExternalOriginalInternetSender** header.

<hr>

## Q10: Will the connection filter bypass filtering if the sender IP is on the IP Allow List but also on our internal services block list?
**A10:** No, the connection filter does not bypass IPs listed in our internal services block list. The sender must request delisting through **https://sender.office.com**. 

Please refer to: [External senders - Use the delist portal to remove yourself from the blocked senders list and address 5.7.511 Access denied errors](https://learn.microsoft.com/en-us/defender-office-365/external-senders-use-the-delist-portal-to-unblock-yourself?redirectedfrom=MSDN).

<hr>

## Q11: Does the IP Allow List or an Exchange Transport Rule override Spamhaus listings and still permit message delivery?
**A11:** **No. Neither** the Connection Filter IP Allow List **nor** Transport Rules will permit message delivery if the source IP address is listed on Spamhaus block lists. Please see the next section for more detailed information.

<hr>

# Spamhaus Detection Handling (Internal Use Only)
Direct customers to request delisting directly from **[Spamhaus](https://www.spamhaus.org/)**. 

For critical situations or where strategic/large-seat enterprise customers are impacted, a temporary override using **Manual List** may be considered to allow time for delisting. <span style="color: Red;"> This approach should be applied judiciously and is **not available** for smaller-seat customers. See [example ICM](https://portal.microsofticm.com/imp/v5/incidents/details/628014267).

**NOTE :**
A DCR has been created to address the issue where the **HostedConnectionFilterPolicy IP Allow List** does not override Spamhaus IP blocks. Please use this [link](https://o365exchange.visualstudio.com/IP%20Engineering/_workitems/edit/6231724) to track the progress. 

# Escalation Path
Use Assist 365: **Exchange Online\\MDO Escalations**
