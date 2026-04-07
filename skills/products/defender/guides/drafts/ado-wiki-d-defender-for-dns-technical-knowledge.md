---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for DNS/[Technical Knowledge] - Defender for DNS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20DNS%2F%5BTechnical%20Knowledge%5D%20-%20Defender%20for%20DNS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Defender for DNS**

This page describes the Defender for DNS feature.

# Azure Defender for DNS

>**Note:**
>As of August 1 2023, customers with an existing subscription to Defender for DNS can continue to use the service, but new subscribers will receive alerts about suspicious DNS activity as part of Defender for Servers P2. [Announcement](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-dns-introduction)

## FAQ

1. **Are DNS transactions recorded on customer logs?**
   We are analyzing the logs in the backend directly from the DNS resolvers of the Azure DNS infrastructure - meaning this is an agentless solution that doesn't require any log collection from the customer itself.

2. **Customer has Defender for DNS enabled in Azure AD DS but cannot detect alerts**
   This is not supported. Defender for DNS is designed to protect Azure resources using **Azure default DNS resolver**. In domain environments the DNS resolver is usually the Domain Controller. Azure AD DS is not a supported configuration.
   Alerts will only be triggered when the Domain Controller itself is using the Azure default DNS resolver, but this is impractical as all alerts would be triggered by the DC.

3. **Do we support Azure Private DNS?**
   Azure DNS Private Resolver is currently **not supported**.
   - on-prem -> Inbound Endpoint: NOT inspected
   - VMs -> Inbound Endpoint: NOT inspected
   - VMs -> Azure DNS with DNS Forwarding rules via Outbound Endpoint: inspected
   Feature request tracked: ADO Feature 25491202 (no ETA).

4. **DNS alerts only on VM resources**
   Defender for DNS Alerts are sent only on VMs directly owned by the customer. If VMs are not directly owned, the customer cannot benefit from Defender for DNS. Only direct connection to Azure DNS is supported.
   Reference ICM: https://portal.microsofticm.com/imp/v5/incidents/details/627989111/summary

## Useful Kusto queries

- Get all DNS alerts:
   ```kql
   union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts,
   cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
   | where AzureResourceSubscriptionId == "{SubscriptionId}" and TimeGeneratedUtc > ago(30d) and ProviderName == "Dns"
   ```

- Drill down on specific alert subset:
   ```kql
   union cluster('romeeus.eastus.kusto.windows.net').database("ProdAlerts").SecurityAlerts,
   cluster('romeuksouth.uksouth.kusto.windows.net').database("ProdAlerts").SecurityAlerts
   | where AzureResourceSubscriptionId == "{SubscriptionId}" and TimeGeneratedUtc > ago(30d) and ProviderName == "Dns"
   | where * contains "Attempted communication with suspicious sinkholed domain"
   | extend domainFQDN=tostring(parse_json(ExtendedProperties)["DomainName"])
   | extend DNSanswers=tostring(parse_json(ExtendedProperties)["Answers"])
   | summarize min(StartTimeUtc), max(EndTimeUtc), make_set(AzureResourceId), make_set(DNSanswers), make_set(CompromisedEntity), make_set(AlertType), make_set(ProductName), make_set(Description) by domainFQDN
   ```

## Support boundaries

Sonars Team owns Defender for DNS logic.
- DNS alerts understanding: escalate to **CE Security Engineering/SonarSRE**
- DNS provider alerts in MDC: escalate to **Azure Storage Threat Detection**

## Documentation
- [Azure Defender for DNS - benefits and features](https://docs.microsoft.com/azure/defender-for-cloud/defender-for-dns-introduction)
- [How to respond to Azure Defender for DNS alerts](https://docs.microsoft.com/azure/defender-for-cloud/defender-for-dns-alerts)
- [Validating Microsoft Defender for DNS Alerts](https://techcommunity.microsoft.com/t5/microsoft-defender-for-cloud/validating-microsoft-defender-for-dns-alerts/ba-p/2227845)
