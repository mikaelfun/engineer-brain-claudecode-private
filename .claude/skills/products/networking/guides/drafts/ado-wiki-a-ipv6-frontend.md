---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Support for IPv6 Frontend IP"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Support%20for%20IPv6%20Frontend%20IP"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Feature: Support for IPv6 Frontend IP

> Currently in Public Preview

## Overview

This feature enables dual stack capability for Application Gateway by allowing customers to use IPv4 and IPv6 addresses to communicate with their resources. IPv6 is currently available for Application Gateway Standard_V2.

## How to Enable

In Azure Portal, select "Dual stack (IPv4 & IPv6)" during Application Gateway creation or configuration.

## How to Identify

- **Azure Portal**: Frontend IP configurations blade shows "Type" as "Public IPv6" or "Private IPv6"
- **ASC**: Frontend IP configurations for IPv6 shown under Frontend IP configurations

## Limitations

- Only v2 SKU supports a frontend with both IPv4 and IPv6 addresses
- IPv6 backends are currently not supported
- IPv6 private Link is currently not supported
- IPv6-only Application Gateway is currently not supported. Must be dual stack (IPv6 and IPv4)
- Deletion of frontend IP addresses aren't supported
- Existing IPv4 Application Gateways cannot be upgraded to dual stack

## Public Documentation

[Configure Application Gateway with a frontend public IPv6 address using the Azure portal (Preview)](https://learn.microsoft.com/en-us/azure/application-gateway/ipv6-application-gateway-portal)
