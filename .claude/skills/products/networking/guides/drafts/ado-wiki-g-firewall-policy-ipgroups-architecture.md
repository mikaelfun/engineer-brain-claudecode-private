---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Firewall/Features & Functions/Firewall, Firewall Policy, Ipgroups - Architecture and Control Plane Operations"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki/pages/Azure%20Firewall/Features%20%26%20Functions/Firewall%2C%20Firewall%20Policy%2C%20Ipgroups%20-%20Architecture%20and%20Control%20Plane%20Operations"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Azure Firewall Architecture

Backend deploys a Virtual Machine Scale Set (VMSS) running Ubuntu Linux and a pair of Load Balancers. These resources are created in an internal Microsoft subscription and injected into customer's VNet (VNet Injected Service).

## Deployment Flow
ARM -> NRP -> BRKGWM -> CRP (Linux VMSS deployment)

Use the "FAILED STATE: TSG" for sample links for each of these logs.

# Azure Firewall Policy

Allows customers to configure firewall rules once and apply to multiple firewall deployments.

## CRUD Operations
ARM -> NFVRP -> COSMOS DB

## Behaviors
- Supports hierarchical policies: Base Policy and Child Policy
- Base policy rules evaluated before child policy rules
- Each rule collection group can have Application, Network, and NAT rule collections
- NAT > Network > Application rule collection priority
- On policy update, control plane triggers PUT on each referencing Azure Firewall in parallel
- If any PUT call fails, Firewall Policy provisioning state = Failed

# IP Groups

## CRUD Operations
ARM -> NFVRP -> COSMOS DB

## Behaviors
- Firewall/policy can reference up to 200 IP Groups
- On IP Group update, control plane triggers PUT on each referencing Firewall/Policy in parallel (PATCH operation)
