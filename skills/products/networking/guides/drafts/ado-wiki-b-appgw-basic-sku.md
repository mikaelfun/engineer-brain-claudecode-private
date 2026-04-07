---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Application Gateway - Basic SKU"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Application%20Gateway%20-%20Basic%20SKU"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Application Gateway - Basic SKU

## Overview

Application Gateway Basic SKU is intended to remove price as a barrier to adoption for Small and Medium Business and customers in Azure by creating a new low-cost Application Gateway SKU. This SKU offers a subset of features when compared to Application Gateway Standard V2.

## Features

The following table compares the features available with each SKU.

| Feature | Basic SKU | Standard v2 |
|---------|-----------|-------------|
| HTTP/HTTP2/HTTPs | Yes | Yes |
| Websocket | Yes | Yes |
| Public/Private IP | Yes | Yes |
| Cookie Affinity | Yes | Yes |
| Path-based affinity | Yes | Yes |
| Wildcard | Yes | Yes |
| Multisite | Yes | Yes |
| KeyVault | Yes | Yes |
| AKS (via AGIC) | Yes | Yes |
| Zone | Yes | Yes |
| URL re-write | **No** | Yes |
| mTLS | **No** | Yes |
| Private Link | **No** | Yes |
| Private-only | **No** | Yes |
| TLS proxy | **No** | Yes |
| Weighted round robin | **No** | Yes |
| Throughput | 2.22 Mbps | 2.22 Mbps |
| Persistent new connections/CU | 2500 | 2500 |

## How to Identify

The specific SKU type is specified under `SKU Type` and `SKU Name` in ASC.

## Limitations

Basic SKU has some important limits defined:

- Autoscaling limited to **two instances**
- Maximum **5 backend pools**
- Maximum **5 Listeners**
- Maximum **5 rules**

## Public Documentation

[What is Azure Application Gateway v2? | SKU types](https://learn.microsoft.com/en-us/azure/application-gateway/overview-v2#sku-types)
