---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Reverse DNS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FReverse%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---


[[_TOC_]]

## Reverse DNS lookup Overview

Reverse DNS lookup sometimes referred to as reverse DNS Resolution (rDNS) is the determination of a domain name that is associated with a given IP address. The process of resolving an IP address to a domain uses the pointer DNS record type PTR Record.

**Example:**

192.168.1.1@<span>8.8.4.4</span> (Default):

250.52.55.65.in-addr.arpa. 2440 IN PTR co1gmehub09.msn.<span>com</span>.

## Application

Reverse DNS lookup alone is not typically used to prevent spam, instead Forward Confirmed Reverse DNS or FCrDNS is. An IP is said to have FCrDNS if it has a forward DNS (name -\> IP) and reverse DNS (IP -\> name) that match. This is done through the following steps:

1)An IP address has a reverse DNS check performed. This returns a list of hostnames associated with that IP (the list could be 0, 1 or more entries).
**Example:**
192.168.1.1@<span>8.8.4.4</span> (Default):
250.52.55.65.in-addr.arpa. 2440 IN PTR co1gmehub09.msn.<span>com</span>.

2)For each entry returned a regular DNS A lookup is performed to see if the IP matches the original IP address.
**Example:**
co1gmehub09.msn.<span>com</span>@8.8.4.4 (Default):
co1gmehub09.msn.<span>com</span>. 899 IN A 192.168.1.1

In Office 365 FCrDNS or rDNS questions typically come up from customers regarding outbound mail delivery.

## More information

- <https://en.wikipedia.org/wiki/Forward-confirmed_reverse_DNS>
- <https://en.wikipedia.org/wiki/Reverse_DNS_lookup>

</div>

</div>

## Content Information

Please visit <https://aka.ms/mdopu> , <https://aka.ms/mdoki> , <https://aka.ms/mdoqa> , <https://aka.ms/mdonews> for product updates, known issues, training updates, and MDO-related announcements
