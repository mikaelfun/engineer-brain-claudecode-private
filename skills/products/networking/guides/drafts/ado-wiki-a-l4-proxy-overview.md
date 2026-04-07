---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Application Gateway Layer 4 Proxy/Layer 4 Application Gateway Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway/How%20To/Application%20Gateway%20Layer%204%20Proxy/Layer%204%20Application%20Gateway%20Overview"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Layer 4 Application Gateway Overview

## Overview

In addition to the existing Layer 7 capabilities (HTTP, HTTPS, WebSockets and HTTP/2), Azure Application Gateway now also supports Layer 4 (TCP protocol) and TLS (Transport Layer Security) proxying.

## How It Works

As a reverse proxy service, the Layer 4 operations of Application Gateway work similar to its Layer 7 proxy operations:

1. A client initiates a **TCP connection** with Application Gateway using the listener's IP address and port number (frontend connection)
2. The client's request for a supported protocol from the application layer is sent to the Application Gateway on this frontend TCP connection
3. The Application Gateway establishes a **new connection** with one of the backend targets from the associated backend pool (backend connection)
4. The client's request is sent to the backend server on this backend TCP connection
5. The backend server sends response data to the application gateway, which is then forwarded to the client
6. The same frontend TCP connection can be reused for future requests from the client

## Supported Backend Targets

- Azure Event Hubs (TLS)
- On-premises resources (HTTPS, TCP, or TLS)
- Azure SQL Server (TCP)

## Key Differences from Layer 7

- Layer 7: Proxies HTTP/HTTPS to Web Server backends
- Layer 4: Proxies TCP/TLS to non-HTTP backends (SQL, Event Hubs, on-premises, etc.)
