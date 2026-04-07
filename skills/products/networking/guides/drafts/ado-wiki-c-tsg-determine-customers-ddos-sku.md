---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/TSG: Determine Customer's DDoS SKU"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20Determine%20Customer%27s%20DDoS%20SKU"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# How to Determine SKU

Azure DDoS Protection has three tiers:

| Feature | DDoS Infrastructure Protection | DDoS Network Plan | DDoS Individual IP Plan |
|-|-|-|-|
| Active traffic monitoring | Yes | Yes | Yes |
| Automatic attack mitigation | Yes | Yes | Yes |
| Availability guarantee | No | Yes | Yes |
| Cost protection | No | **Yes** | **No** |
| App-based mitigation policies | No | Yes | Yes |
| Metrics & alerts | No | Yes | Yes |
| Mitigation reports | No | Yes | Yes |
| Mitigation flow logs | No | Yes | Yes |
| Policy customizations | No | Yes | Yes |
| DDoS rapid response support | No | **Yes** | **No** |

Ref: https://learn.microsoft.com/en-us/azure/ddos-protection/ddos-protection-overview#skus

## DDoS Protection Network Plan

Check in ASC for resource type `Microsoft.Network/ddosProtectionPlans`.

Note: The plan can be in a **different subscription** (Subscription B) but tied to a VNET in Subscription A. Check the VNET in Subscription A — if the **DDoS Protection Plan** field shows a hyperlinked plan name → customer is on **DDoS Protection Network Plan**. If it shows **N/A** → customer is on DDoS Infrastructure Protection.

## DDoS Protection Individual IP Plan

Verify via ASC or by running **Get NRP Subscription Details** and reviewing the Public IP resource of interest:
- Use **[CRI | Jarvis](https://portal.microsoftgeneva.com/dashboard/CNS/CRI?overrides=...)** to check the public IP
- Look for the Customer's IP in the search box
- Scroll down to **Thresholds to start DDoS mitigation**

Alternatively, check the PublicIPAddresses properties in ASC for the Individual IP Plan association.

## DDoS Infrastructure Protection

**Everyone** in Azure has this, on every VIP, for free. No purchase required.

# Contributors

* ANP DDoS Team
