---
source: ado-wiki
sourceRef: "Supportability/AzureIaaSVM/AzureIaaSVM:/Processes/Security Cases Guidance/DDoS Attack_Process"
sourceUrl: "https://dev.azure.com/Supportability/AzureIaaSVM/_wiki/wikis/AzureIaaSVM?pagePath=%2FProcesses%2FSecurity%20Cases%20Guidance%2FDDoS%20Attack_Process"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Process
- cw.Reviewed-03-2023
---

[[_TOC_]]

# Overview

A distributed denial-of-service (DDoS) attack is a malicious attempt to disrupt the normal traffic of a targeted server, service, or network by overwhelming the target or its surrounding infrastructure with a flood of Internet traffic.

In Azure, we offer Azure DDoS Protection, which protects resources in a virtual network, including public IP addresses associated with virtual machines, load balancers, and application gateways.

When coupled with the Application Gateway web application firewall, or a third-party WAF deployed in a virtual network with a public IP, Azure DDoS Protection can provide full layer 3 to layer 7 mitigation capability.

# Summary

This article provides instructions on how to handle a ticket where the customer was compromised by a DDoS attack. The goal is to ensure Support Engineers collect important information that will help the IR engineers assist the customer.

# Expectations

Help the customer understand that information is being collected for the **Networking team** to ensure timely resolution, but we still need the Networking team to analyze and assist once we gather the information.

**Note:** Collect basic information and document it in notes **prior to transferring** cases or collaboration tasks to the Networking team. While waiting for the Networking team to be engaged, **continue running additional diagnostics**.

## Information to Collect from Customer

1. How did you discover the attack?
2. What was the sign of the attack?
3. Did you receive any error messages? Share the DTM link with the customer to receive it.
4. Any other information you think could help define the investigation path.

## Common DDoS Scenarios

Reference for scenarios supported by Networking team:

- [I'm under attack](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=i%27m-under-attack)
- [I was under attack, and I didn't have logging enabled, but want to know info about the attack](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=i-*was*-under-attack)
- [How to confirm if a VIP is protected](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=how-to-confirm-if-a-vip-is-protected)
- [DDoS Seems to not unlink](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=ddos-seems-to-not-unlink)
- [Unable to link a VNET with DDOS Protection Plan](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=unable-to-link-a-vnet-with-ddos-protection-plan)
- [Service is being DDoS'd, but DDoS Protection is not mitigating?](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=service-is-being-ddos%27d%2C-but-ddos-protection-is-not-mitigating%3F)
- [DDoS mitigation is initiated but it should not be](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/181191/Common-DDoS-Scenarios?anchor=ddos-mitigation-is-initiated-but-it-should-not-be)
- [I'm Under a DDoS Attack (Internal wiki)](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/277561/TSG-I'm-Under-a-DDoS-Attack-)

# Next Steps

Once information is collected and added to case notes:

1. Transfer the ticket or create a collaboration task with the **Networking team**
2. Edit the SAP of the ticket to match the Networking team:
   - **Category:** Azure
   - **Product Version:** "I'm under attack - Network Protection Plan"

# Reference Links

- [What is Azure DDoS Protection?](https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview)
- [Azure DDoS Protection FAQ](https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-faq)
- [Types of attacks Azure DDoS Protection mitigates](https://learn.microsoft.com/en-us/azure/ddos-protection/types-of-attacks)
