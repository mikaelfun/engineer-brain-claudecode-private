---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/TSG: This wiki outlines what a Layer 7 or Application layer DDoS attack is and how to identify it"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20This%20wiki%20outlines%20what%20a%20Layer%207%20or%20Application%20layer%20DDoS%20attack%20is%20and%20how%20to%20identify%20it"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Overview

This wiki outlines what a Layer 7 / Application layer DDoS attack is, how to identify it, and how to protect against it.

# What is an L7 Attack?

Application layer attacks (L7 DDoS) target the top layer of the OSI model where HTTP GET/POST requests occur. They consume server resources in addition to network resources, making them more sophisticated despite being smaller in volume.

| | L3/L4 Attacks | L7 Attacks |
|-|-|-|
| **Examples** | TCP/UDP floods, SYN floods | HTTP Request floods |
| **Packet counts** | Massive (> 40k pps) | Can be < 40k pps |
| **Origin behavior** | Server eventually overwhelmed handling SYN/ACK | Application CPU pegged quickly — each request requires full processing |

# How to Identify an L7 Attack

If customer reports DDoS but attack volume seems very low (< 10k req/sec), and it's against a website → likely an Application layer DDoS attack.

Additional indicators:
- **Log Sources show: NOT mitigating, traffic (pps) does NOT exceed thresholds** (check [Log Sources for DDoS Protection](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/209767))
- **High CPU usage** on webserver process (Task Manager / `top` / `htop`)
- **Webserver logs** show all requests from a few IPs sending requests repeatedly (not normal client behavior)

# How to Protect Against L7 Attacks

## Immediate mitigations

1. **Deploy [Azure Web Application Firewall (WAF)](https://docs.microsoft.com/en-us/azure/web-application-firewall/overview)** via AFD, AppGW, or CDN:
   - Differentiates "good" traffic from "bad"
   - Provides Layer 7 DDoS Protection
   - Also available via [Azure Marketplace](https://azure.microsoft.com/marketplace/)

2. **Enable [DDoS Protection Standard](https://docs.microsoft.com/en-us/azure/virtual-network/ddos-protection-overview)**:
   - Note: DDoS Standard alone will NOT address L7 attacks — must be combined with WAF for multi-layer protection
   - Once enabled, actions covered by the DDoS Cost Guarantee

3. **Identify source IPs and block via [Azure NSGs](https://docs.microsoft.com/en-us/azure/virtual-network/security-overview)**

## Long-term protection

- **Reduce attack surface via [Azure Front Door Geo-Filtering](https://docs.microsoft.com/en-us/azure/frontdoor/front-door-geo-filtering)**: Block/allow countries based on expected client locations
- **Reduce origin server load with [Azure CDN](https://azure.microsoft.com/en-us/services/cdn/)**: Serve content at POPs, greatly increasing HTTP requests/sec capacity
- **Plan for scale with [Azure Application Gateway V2](https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-autoscaling-zone-redundant)**: With DDoS Standard, scale-out service credits are subject to refund → use scaling features freely

# Contributors

* Alethea Toh
* ANP DDoS Team
