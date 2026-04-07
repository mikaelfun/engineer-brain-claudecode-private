---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Feature Specific/Managed NAT Gateway"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FFeature%20Specific%2FManaged%20NAT%20Gateway"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Managed NAT Gateway

[[_TOC_]]

## Overview

Managed NAT gateway allows customers to use a NAT gateway for outbound traffic instead of a Load Balancer. This helps eliminate the issue with SNAT port exhaustion.  

Initial TSG content from: <https://dev.azure.com/msazure/CloudNativeCompute/_wiki/wikis/CloudNativeCompute.wiki/186829/TSG-NAT-Gateway>

## Training video

PG has created a quick training video to go over this feature. [NAT Gateway support guide (7min 30sec)](https://msit.microsoftstream.com/video/acfa99ff-0300-94f4-c4d4-f1ec58fb5e99)

## Identify clusters using NAT gateway outbound

1. managedNATGateway

   - MC `networkProfile.outboundType` is `managedNATGateway`
   - `networkProfile` doesn't have `loadBalancerProfile`
   - `networkProfile` has `natGatewayProfile` which contains the information of configurations and managed outbound IPs

2. userAssignedNATGateway

   - MC `networkProfile.outboundType` is `userAssignedNATGateway`
   - Must use custom VNet subnet (agentPoolProfile.vnetSubnetId) is not empty
   - `networkProfile` doesn't have `loadBalancerProfile`
   - `networkProfile` doesn't have `natGatewayProfile`
   - Custom VNet subnet(s) has NAT gateway associated by user

## Troubleshooting

### Kusto Logs

Check `AsyncContextActivity` for error messages

Example:  

```txt
cluster("Aks").database("AKSprod").AsyncContextActivity
| where TIMESTAMP > ago(1d)
| where msg contains "NATGateway"
| where subscriptionID == "{Sub_ID}"
```

### Possible Error Messages

These are error messages from the code that may show in Kusto. It is broken down by what may be a customer side issue, or what should be escalated to the NAT GW team.

- Customer Error (GA features)
  - NAT gateway %q does not exist in resource group %q in subscription %q
  - existing NAT gateway %q is not Standard SKU
  - existing NAT gateway %q is not regional NAT gateway (current zones: %q)
  - existing NAT gateway %q location %q is different to expected location %q
  - NAT gateway %q does not exist in resource group %q in subscription %q. Goal not achieved.
  - NAT gateway %q has one or more public IP prefixes associated. Goal not achieved.
  - NAT gateway %q has zero public IP address associated. Goal not achieved.
  - NAT gateway %q has %d public IP addresses associated but expect %d. Goal not achieved.
  - NAT gateway %q is not associated to managed outbound IP %q. Goal not achieved.
- Move to NAT GW team
  - EnsureManagedOutboundIPs returned IP without ID
  - EnsureManagedOutboundIPs returned IP without PublicIPAddressPropertiesFormat or IPAddress
  - EnsureManagedOutboundIPs returned IP without ID)
  - EnsureManagedOutboundIPs returned ResourceGroupNotFound error, will try again.
  - EnsureManagedOutboundIPs returned SubscriptionNotRegistered error, will try again.
  - NAT gateway %q does not have NatGatewayPropertiesFormat. Goal not achieved.
  - NAT gateway %q provisioning state is not Succeeded. Goal not achieved.
  - NAT gateway %q has nil IdleTimeoutInMinutes. Goal not achieved.
  - NAT gateway %q has IdleTimeoutInMinutes %d but goal is %d. Goal not achieved.
  - existing NAT gateway %q is not in terminating state, current state %q

### NAT Gateway Metrics (SNAT)

[Jarvis Dashboard](https://portal.microsoftgeneva.com/dashboard/slbv2stage/ManagedNat/ManagedNat%2520Metrics)
Lookup the `NatGatewayId` from NAT gateway JSON view

### Customer questions to ask

- Have you modified NSG rules within the AKS VNET?
- Have you made or attempted to make modification to the outbound type definition for the Kubernetes cluster?
- Have you made any modifications to the Managed NAT Gateway that has been created as part of this process?
