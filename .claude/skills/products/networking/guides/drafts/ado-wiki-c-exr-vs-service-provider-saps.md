---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/ExpressRoute vs ExpressRoute Service Provider SAPs"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/ExpressRoute%20vs%20ExpressRoute%20Service%20Provider%20SAPs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ExpressRoute vs ExpressRoute Service Provider SAPs

## Overview

This guide outlines the differences between several L2 SAPs with Azure ExpressRoute services to aid users in selecting the proper SAP for transfers, collabs, etc.

**TL;DR: When in doubt, please use the `Azure\ExpressRoute` L2 SAP to engage Azure Networking.**

## SAPs

### `Azure\ExpressRoute`

The "original" ExpressRoute and far and away the most popular. This is the standard "I go to Equinix (or any provider), buy a circuit from them, and connect that circuit to Microsoft via Azure ExpressRoute". There are many service providers a customer can choose from at dozens of locations.

Our "end customers" come through support via this channel, and Microsoft often works hand-in-hand with end customers, service providers, and ExpressRoute PG to solve cases.

> Summary: **[Customer]** > Service Provider > Microsoft. Customer would be opening cases in this context.

### `Azure\ExpressRoute Service Provider`

This SAP is **never** used for end-customers, and most of CSS should not need to transfer/collab to this SAP. It is for the service providers (Equinix, Verizon, AT&T, etc) to report issues and work directly with Microsoft PG when their routers and switches are having issues connecting to ours.

**CSS Does not support this SAP** - ExR Ops team does directly. The SAP is not visible to end-customers. If you select this SAP for an end-customer issue, you will experience delays as the team who supports this is not Azure Networking CSS.

> Summary: Customer > **[Service Provider]** > Microsoft. Service Provider would be opening cases in this context.

**How to confirm if subscription has been enabled for a Service provider:**
- Select the subscription in ASC
- From properties, go to features
- Search for `expressroutepartner`, if authorization is true then this confirms the subscription configured for a ExpressRoute Service Provider.

### `Azure\ExpressRoute Direct`

This SAP is specific for customers who are using the ExpressRoute Direct service, which enables customers to be their own service provider, connecting directly to Microsoft's routers via large (100Gbps typical, 10Gbps also available) fiber pipe. This is a very small SAP relative to the main `Azure\ExpressRoute` SAP. CSS supports this SAP.

> Summary: **[Customer]** > Microsoft. Customer would be opening cases in this context, and there is **no** service provider involved.
