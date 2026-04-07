---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Application Gateway Layer 4 Proxy/Application Gateway Layer 4 Proxy Multisite listeners"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FApplication%20Gateway%20Layer%204%20Proxy%20Multisite%20listeners"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Multisite listeners for Application Gateway (Layer 4 proxy)

> **Status**: This feature is in **Preview** phase for use with Layer 4 proxy.

Multiple site hosting enables you to configure more than one backend TLS or TCP-based application on the same port of an Application Gateway. This can be achieved by using **TLS listeners only**.

This allows a more efficient topology by adding multiple backend applications on the same port using a single Application Gateway. Traffic for each application can be directed to its own backend pool by providing domain name(s) in the TLS listener.

**Example**: Three multisite listeners each with its own domain (contoso.com, fabrikam.com, *.adatum.com), routing to respective backend pools. All three domains must point to the frontend IP address of the Application Gateway.

## Feature Information

- Multisite listener allows adding listeners using the **same Port number**.
- Application Gateway uses **Server Name Indication (SNI)** value from the TLS handshake to route a connection to the appropriate backend pool — picks the common name in TLS handshake data.
- Supports **wildcard characters** (`*` and `?`) in the hostname, and **up to 5 domains** per multi-site TLS listener. For example: `*.contoso.com`.
- **TCP listeners do not support multisite**: The TCP connection inherently has no concept of hostname or domain name. Therefore, multisite listener is only supported for **TLS listeners**, not TCP listeners.
