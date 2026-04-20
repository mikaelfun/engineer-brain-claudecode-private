---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/How to Manually Validate ASN and Public Prefixes for ExR"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/How%20to%20Manually%20Validate%20ASN%20and%20Public%20Prefixes%20for%20ExR"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Manually Validate ASN and Public Prefixes for ExR

[[_TOC_]]

## Description

How to manually validate customer ASN and public prefixes for ExpressRoute Microsoft peering

## Overview

Microsoft Peering for Azure ExpressRoute requires customer provided public prefixes.

Microsoft verifies if the specified 'Advertised public prefixes' and 'Peer ASN' (or 'Customer ASN') are assigned to the customer in the Internet Routing Registry. If the customer is getting the public prefixes from another entity and if the assignment is not recorded with the routing registry, the automatic validation will not complete and will require manual validation. If the automatic validation fails, the customer will see the message 'Validation needed'.

If the customer sees the message 'Validation needed', they will need to collect the document(s) that show the public prefixes are assigned to the organization by the entity that is listed as the owner of the prefixes in the routing registry and submit these documents for manual validation by opening a support ticket.

## Symptoms

1.  The customer states that the Microsoft peering is not up according to their side of the peering.
2.  If the customer executes Get-AzExpressRouteCircuitPeeringConfig, they see in the output:

```
AdvertisedPublicPrefixesState: ValidationNeeded
```
## Determine State of Automatic Validation and Enablement of Microsoft Peering

1.  Gather Dump Circuit Information from ASC:

![DumpCircuitinfo in Dump Circuit Into File Uri from Properties tab](/.attachments/ExpressRoute-Validation-howto2.png)

Validation Needed ex:
```
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 01/15/2021 18:07:47
PEER ASN: 
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 0.0.0.0 , SUBNET: 0.0.0.0/30
LEGACY MODE: False
ADVERTISED PREFIXES STATE: ValidationNeeded
ADVERTISED PREFIXES: 
CUSTOMER ASN: 
ROUTING REGISTRY: ARIN
VALIDATION NEEDED ADVERTISED PREFIXES: 0.0.0.0/29
```
Correctly configured circuit ex:
```
VRF NAME: Global, TYPE: Microsoft
PEER CREATION TIME (UTC): 01/15/2021 18:07:47
PEER ASN: 
BGP STATE v4: Enabled, v6: 
IPv4: True, IPv6: False
SHARED KEY EXISTS: False
PEER IP: 0.0.0.0 , SUBNET: 0.0.0.0/30
LEGACY MODE: False
ADVERTISED PREFIXES STATE: Configured
ADVERTISED PREFIXES: 0.0.0.0/29
CUSTOMER ASN: 
ROUTING REGISTRY: ARIN
VALIDATION NEEDED ADVERTISED PREFIXES: 
```
## Manually Verify ASN and Public Prefix Ownership at the Registrar
Confirm that customer IP address and AS number are registered to them in one of the following registries: 

* [ARIN](https://www.arin.net/) 
* [APNIC](https://www.apnic.net/)
* [AFRINIC](https://www.afrinic.net/)
* [LACNIC](https://www.lacnic.net/)
* [RIPENCC](https://www.ripe.net/)
* [RADB](https://www.radb.net/)
* [ALTDB](https://altdb.net/)

https://docs.microsoft.com/en-us/azure/expressroute/expressroute-routing#microsoft-peering

1. Go to the [ARIN](https://whois.arin.net/)
2. Enter the public prefixes from the circuit that needs validation. 
3. Ex: https://whois.arin.net/rest/net/NET-52-120-0-0-1/pft?s=52.121.0.0 
   * Net Type = Direct Assignment (IP address space assigned directly from ARIN to an organization for its own exclusive use.)
   * If net type does not include direct assignment but for example, "allocated to LACNIC", then we need go confirm in the LACNIC registrar. 
4. **We must validate the PeerASN the customer provided as well as an IP in each IP block specified by the customer in order to prove the customer owns the ASN and each block they provided. Verify using the organization information provided and ensure you are dealing with someone from the organization having a matching email address suffix.**
5.  Document in the case the ownership information so the TAs can see it.
6.  If the IP range is not owned by the customer, we will need a Letter of Authorization (LoA), that proves they are allowed to use the resources. <https://docs.microsoft.com/en-us/azure/expressroute/expressroute-routing#microsoft-peering>
7.  **If you are unsure or unable to verify ownership at the given registrar, reach out to a TA**
8.  Once you have the required information noted above, please post to Microsoft Teams in the ExpressRoute channel with the information collected and a TA will assist with the manual validation. 

## Teams Posting Guidelines for Prefix Validation

The following fields are required and need to be included in your team's post in the ExpressRoute channel:

```
Resource ID: 
SUBSCRIPTION ID: 
SERVICE KEY: 
CIRCUIT NAME: 
CIRCUIT LOCATION: 
GATEWAY MANAGER REGION: 
O365 SERVICES AUTHORIZED:
VALIDATION NEEDED ADVERTISED PREFIXES:
PEER ASN:
Customer ASN: 

Registrar Prefix URL: 

LOA Provided: Y/N

Please attach the following files: 
- Dump Circuit 
- Dump Routing
- LOA (if required)
```
*Note: In some circumstances, you may not be able to provide all the data from above. Please try and provide as much data as possible as it helps speed up validation.*

# Contributors
@<F84DD2EA-3ED8-6E71-BBD4-86A47F7D8B78> 