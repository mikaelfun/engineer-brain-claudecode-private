---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/Features and Functions/Feature: Layer 4 Application Gateway Overview"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FFeatures%20and%20Functions%2FFeature%3A%20Layer%204%20Application%20Gateway%20Overview"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Overview of Application Gateway Layer 4 capabilities

Azure Application Gateway now supports Layer 4 (TCP protocol) and TLS (Transport Layer Security) proxying, in addition to existing Layer 7 capabilities (HTTP, HTTPS, WebSockets and HTTP/2).

## How it works

As a reverse proxy service, the Layer 4 operations work similar to Layer 7:

1. A client initiates a TCP connection with Application Gateway using the listener's IP address and port number (frontend connection).
2. The client's request for a supported protocol from the application layer is sent to the Application Gateway on this frontend TCP connection.
3. The Application Gateway establishes a new connection with one of the backend targets from the associated backend pool (backend connection).
4. The client's request is sent to the backend server on this backend TCP connection.
5. The backend server sends response data to the application gateway, which is then forwarded to the client.
6. The same frontend TCP connection can be used for future requests from the client.
