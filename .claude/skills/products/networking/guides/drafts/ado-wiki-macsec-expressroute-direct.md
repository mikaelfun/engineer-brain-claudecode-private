---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/Features and Functions/MACsec on ExpressRoute Direct ports"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20ExpressRoute%2FFeatures%20and%20Functions%2FMACsec%20on%20ExpressRoute%20Direct%20ports"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# MACsec on ExpressRoute Direct Ports

## Overview

MACsec is an IEEE standard (802.1AE) that encrypts data at the Media Access Control (MAC) level (Network Layer 2).

## Use Case

Encrypt the physical links between customer network devices and Microsoft network devices when connecting via ExpressRoute Direct. MACsec is disabled by default on ExpressRoute Direct ports.

## Configuration Steps

### Prerequisites
1. Create Azure Key Vault with soft-delete enabled
2. Create a user-assigned managed identity
3. Create CAK (Connectivity Association Key) and CKN (Connectivity Association Key Name) in Key Vault
4. Grant GET permission to the managed identity on Key Vault secrets
5. Set the identity for use by ExpressRoute

### Key Requirements
- CKN: even-length string up to 64 hexadecimal digits (0-9, A-F)
- CAK for GcmAes128: even-length string up to 32 hex digits
- CAK for GcmAes256: even-length string up to 64 hex digits

### Enable MACsec
- Can enable on both ports simultaneously or one at a time
- One-port-at-a-time approach minimizes interruption for in-service ExpressRoute Direct
- Use Set-AzExpressRoutePort with MacSecConfig properties (CknSecretIdentifier, CakSecretIdentifier, Cipher)

### Disable MACsec
- Set MacSecConfig properties to empty strings on both links
- Apply with Set-AzExpressRoutePort
