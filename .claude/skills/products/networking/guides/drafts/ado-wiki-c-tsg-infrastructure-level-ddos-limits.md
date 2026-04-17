---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DDoS Protection/TSG: Infrastructure Level DDoS Limits for both inbound and outbound"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DDoS%20Protection%2FTSG%3A%20Infrastructure%20Level%20DDoS%20Limits%20for%20both%20inbound%20and%20outbound"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Scenario

Additional validation steps for inbound and outbound packet drops after all infrastructure-level scenarios have been examined. Particularly relevant for high volumes of UDP traffic to/from Azure or Azure to the Internet. Applicable when customer-reported issues can't be linked to nodes, containers, SLB, or other Azure services/components.

# Troubleshooting

It is crucial to have the datapath accurately mapped from source to destination. Azure has three types of **highly confidential** policies and limits ([Azure DDoS Limits - internal only](https://microsoft.sharepoint.com/teams/Aznet/SitePages/Azure-DDoS-limits.aspx)):

1. **Inbound Limits**: Protecting Microsoft IP addresses.
2. **Inbound Limits for Azure Storage Clusters.**
3. **Outbound Limits**: Protecting from non-Microsoft IP addresses.

> **Note**: Do not share these limits externally. Internal use only. Do not mention to customers or external partners.

# How to identify the issue

Use **Eagle Eyes** → **VM to Public IP** tab to check if the destination VIP is under DDoS mitigation due to triggered limits:

**[EagleEye-VmToVip](https://eagleeye.trafficmanager.net/view/services/EagleEye/pages/Home?__userData=%7B%22nodeData%22%3A%7B%2202d55dc7-644d-4a12-9059-c2f3520f38a6%22%3A%22a10310ab-d258-4b7f-9837-3e3d389b4cc3%22%7D%7D)**

If DDoS triggers present → visible in **DDoS Analysis** tab. Correlate customer-reported issues with metrics timeline. The insights provide signals, descriptions, recommended actions, and useful external links.

Use **Sflow Dashboard** within EE Insights for additional signal. Also check:

**[DDoS Dashboard (Jarvis)](https://portal.microsoftgeneva.com/s/6560C9A?overrides=[{"query":"//*[id='DestinationVIP']","key":"value","replacement":""}])** — add the destination VIP to see mitigation actions.

> **Note**: On the DDoS Dashboard, VIPs are considered as DST VIPs regardless of whether they are SRC or DST VIPs.

Once confirmed the customer is exceeding limits and DDoS policy is being applied → proceed to Next Action.

> **Note**: DDoS Mitigation policies are in place to protect the platform and apply across the entire Azure infrastructure. Customers do not have the option to select or modify these limits.

# Case Study

[ICM - 505454756](https://portal.microsofticm.com/imp/v5/incidents/details/505454756/summary)

# Next Action

Engage a TA/SME via an AVA post in the DDoS channel and get approval from TA/SME prior to engaging DDoS PG with CRI ticket.

# Contributors

* Kirubel Tesfa
