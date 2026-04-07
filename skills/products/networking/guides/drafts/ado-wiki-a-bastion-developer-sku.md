---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Features/Azure Bastion - Developer SKU"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Bastion%2FFeatures%2FAzure%20Bastion%20-%20Developer%20SKU"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Azure Bastion: Developer SKU

## Overview

Bastion Developer is a low-cost, zero-configuration, **multitenant** SKU of Azure Bastion with usage-based pricing (similar cost to Public IP). Ideal for Dev/Test scenarios.

> **Important:** Do NOT create Sev A / Sev 2 ICM for Bastion Developer issues. It is a free SKU — recommend upgrading to Basic/Standard/Premium for urgent production needs.

## Architecture

Two main components:

1. **BastionAgent** — deployed on all Azure hosts; establishes data-path between user and resource.
2. **Bastion Pool** — regional multi-tenant service (built on Project Helix) accepting connection requests and establishing end-to-end sessions.

Unlike other SKUs, Developer SKU is NOT a VNET-injected service — it uses tunneling via BastionAgent.

## Regions Supported (Preview)

- Central US EUAP
- East US 2 EUAP
- West Central US
- North Central US
- West US
- North Europe

## Limitations

- **No VNet peering support** — deploy one Developer Bastion per VNet.
- **Only one Bastion per VNET** — if another Bastion (any SKU) already exists, deployment will fail.
- **No downgrade** — cannot downgrade from Basic/Standard/Premium to Developer SKU; must delete existing Bastion first.

## Troubleshooting

### Deployment Issues

Developer SKU deployment involves only:
- Azure Resource Manager (ARM)
- Network Resource Provider (NRP)

No BRKGWM or CRP components (unlike other SKUs).

### How to Identify

**Portal:** Bastion blade shows SKU type and Public DNS name for the regional deployment.

**ASC:** Look for the Developer SKU label in ASC view.

### Log Sources

See main article: [Log Sources For Azure Bastion](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/427935/Log-Sources-For-Azure-Bastion)
(Developer SKU-specific section available at the anchor `#developer-sku-specific`)
