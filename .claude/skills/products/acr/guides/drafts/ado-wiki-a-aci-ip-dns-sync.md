---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/How To/Automate Sync of ACI IP to a Private DNS Zone"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FHow%20To%2FAutomate%20Sync%20of%20ACI%20IP%20to%20a%20Private%20DNS%20Zone"
importDate: "2026-04-21"
type: guide-draft
---

# Automate Sync of ACI IP to a Private DNS Zone

## Problem
ACI deployed on a VNET does not offer a static IP address or FQDN. Customers need a way to maintain consistent DNS resolution for their container groups.

## Solution Overview
Use a Private DNS Zone linked to ACI VNET and client VNETs, with Azure Automation to update A records when ACI IP changes. This is more cost-effective than using Application Gateway.

## Prerequisites
- Existing Application Gateway (optional)
- ACI deployment
- Azure Automation account
- Private DNS zone with A record for the ACI container group

## Components
- Azure Automation
- PowerShell

## Alternative Approach
For scenarios requiring a static IP via Application Gateway, see the AppGw backend pool sync guide.
