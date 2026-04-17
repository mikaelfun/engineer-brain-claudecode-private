---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure DNS/Azure (Public) DNS zones/Authoritative DNS Name Resolution for Azure DNS"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20DNS%2FAzure%20%28Public%29%20DNS%20zones%2FAuthoritative%20DNS%20Name%20Resolution%20for%20Azure%20DNS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Authoritative DNS Name Resolution for Azure DNS

## Description

Customer would like to make use of Authoritative DNS Name Resolution for Azure resources however they are not sure how to achieve the same.

## Solution

- Before we proceed with the zone delegation piece, we first need to create a new DNS Zone in Azure.
- Check if the DNS Zone is created within customer's Azure Subscription. If not, create a zone by following this [article](https://docs.microsoft.com/en-us/azure/dns/dns-delegate-domain-azure-dns#create-a-dns-zone).
- Once you have the DNS Zone created with the customer's subscription, you will be able to see the DNS Zone Details and its associated Name Server in the linked record sets in ASC.
- This public [article](https://docs.microsoft.com/en-us/azure/dns/dns-delegate-domain-azure-dns#delegate-the-domain) will help in delegating the DNS Zone.
- If customers are unsure of how to delegate their domain to Azure, please reference the Domain Delegation to Azure DNS wiki doc.
  - If there are further questions from there, customers should refer to their registrar for any questions and guidance.
