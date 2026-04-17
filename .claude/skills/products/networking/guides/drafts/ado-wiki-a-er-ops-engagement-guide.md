---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/ExpressRoute Ops - When & How to Engage"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FExpressRoute%20Ops%20-%20When%20%26%20How%20to%20Engage"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# ExpressRoute Ops — When & How to Engage

[[_TOC_]]

## Overview

This wiki outlines why you may need to engage the ExpressRoute Operations team (EROps) as well as how to engage them if needed.

## What is ExpressRoute Ops?

EROps manages the physical routers for ExpressRoute and ExpressRoute Direct platforms. They handle:

- **Physical troubleshooting**: Hardware issues, cabling issues on MSEEs; engage Cisco/Juniper vendors for RMAs
- **Service Provider Troubleshooting**: Direct path for SPs (Equinix, Verizon, etc.) for physical connectivity support

> **NOTE:** Non-physical issues (portal management, route filters, etc.) are handled by Azure Networking CSS and escalated via [CRI Process](https://aka.ms/anpcriprocess) to `Cloudnet/EEE Cloudnet` & `Cloudnet/ExpressRoute` — **NOT EROps**.

## When to Engage EROps

| Scenario | Engage EROps? | Method |
|----------|--------------|--------|
| TA-confirmed physical connectivity/router issue on ExR/ExR Direct | ✅ Yes | ICM (with TA approval) |
| Service Provider SR about physical connectivity issues | ✅ Yes | DFM transfer |
| Portal/route filter/circuit management issue | ❌ No | CRI to Cloudnet/ExpressRoute |
| End-customer SR unrelated to physical connectivity | ❌ No | Standard CRI process |

## How to Engage via ICM

> ⚠️ **IMPORTANT:** Must follow [CRI Process](https://aka.ms/anpcriprocess) — requires TA approval.

1. TA confirms physical connectivity/router issue
2. TA approves CRI
3. Create CRI in ASC using the approved template for the issue type
4. If no template exists: use "Empty" template → select `Cloudnet/ExpressRouteOps` as owning team
5. Include descriptive title, all relevant info, and **TA approver name**

> ⚠️ Do NOT manually override in ASC empty template without first reaching out if a template should exist.

## How to Engage via DFM (Service Providers Only)

**Condition:** SR is from a Service Provider (not end-customer) AND is about physical connectivity issues.

1. Confirm with TA
2. Transfer the SR via: [**Azure\ExpressRoute Service Provider**](https://msaas.support.microsoft.com/sap/manage;sap=Azure%5CExpressRoute%20Service%20Provider%5C)
3. Use automatic transfer feature in Service Desk, Case Buddy, or DFM

## How to Confirm if Customer is a Service Provider

### Method 1 — Resource Provider Type
In ASC, check if the resource provider type shows `expressRouteCrossConnections`.

### Method 2 — Subscription Features
In ASC → root subscription → Features → search `expressroutepartner` → if "Is Authorized" = True → service provider subscription.

## Next Steps Before Engaging

Review the ExpressRoute/ExR Direct troubleshooting guides to confirm escalation is needed.

Questions? Contact TA via [Microsoft Teams ExpressRoute Channel](https://teams.microsoft.com/l/channel/19%3a5693c71a57e34093a0d7c4dae35b05ed%40thread.skype/Express%2520Route?groupId=c3e00ac7-3f76-4350-ba3b-e335a6bbbe21&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

# Contributors
@B0B19791-83EB-4561-9380-2B186BDF9BC7, @F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78
