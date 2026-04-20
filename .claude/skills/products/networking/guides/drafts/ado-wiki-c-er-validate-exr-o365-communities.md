---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How to validate customers for ExR O365 Communities"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20to%20validate%20customers%20for%20ExR%20O365%20Communities"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# How to validate customers for ExR O365 Communities

[[_TOC_]]

## Summary

Process for Microsoft account teams to go through the approval process so they can enable O365 route filters.

## Background

Using ExpressRoute with Microsoft 365 is blocked by default and Microsoft has an authorization process in place for customers who wish to enable ExpressRoute for use with Microsoft 365. The authorization process is used to protect customers from service outages caused by misconfiguration or inadvertently enabling the Microsoft 365 routes, to allow Microsoft to provide relevant information, and to ensure the right Microsoft account staff are available before any investment in design or infrastructure.

Microsoft only authorizes the use of ExpressRoute with Microsoft 365 in certain rare scenarios.

Unauthorized subscriptions trying to create route filters for Office 365 will receive an error message https://support.microsoft.com/kb/3181709.

Microsoft recommends using the Internet to connect to Office 365.

## Process

### Step 1: Support replies to the customer with the following email template

Hello <Customer>,

Thank you for your interest in the ExpressRoute for Office 365 review process.

**ExpressRoute for Office 365 review process:**

Please download the following document: https://www.microsoft.com/en-us/download/details.aspx?id=102899

This document provides detailed information required to understand the achievable outcomes from using ExpressRoute with Microsoft 365 and the steps required to successfully implement ExpressRoute.

For additional information:
- Office 365 Connectivity Guidance: https://docs.microsoft.com/en-us/microsoft-365/enterprise/azure-expressroute?view=o365-worldwide
- Not Authorized Error Message: https://support.microsoft.com/en-us/help/3181709

### Step 2: Request customer speak with their Microsoft account team
### Step 3: Once approval has been completed, route filters for O365 can be added.

## FAQ

- **Does Microsoft recommend using ExpressRoute with Microsoft 365?** No, using ExpressRoute with Microsoft 365 is not advised for most customers.
- **How long does it typically take?** Six months or more using a large technical team.
- **Can ExpressRoute keep all M365 traffic off the internet?** No, Internet connectivity is a critical dependency for M365.
- **Does ExpressRoute help during DDoS attacks?** No, redundancy and protection are required on Internet links.
- **Do I need public DNS?** Yes, clients must resolve public IP addresses.
- **Do I need public IP space?** Yes, unique NAT pools are required for each circuit.
- **Do I need a public ASN?** Yes, if you want to use AS PATH prepending.
- **Does ExpressRoute connect directly to Microsoft datacenters?** No, it connects to Microsoft's global network backbone.
- **Is a single ExpressRoute circuit sufficient?** No, multiple circuits in different peering locations are recommended.
- **Can I use ExpressRoute for inbound connectivity from M365?** Yes, but it adds significant complexity.
- **Does ExpressRoute provide additional security?** No, M365 is designed to operate securely over the Internet.

## Notes
- Customers are not allowed to submit this request without going through their Account team.
- Partners are not allowed to request on behalf of customer.
- Customers without a Microsoft account team cannot use this feature.
- Authorization is given per-subscription. All ExR Circuits in the subscription receive authorization at once.
