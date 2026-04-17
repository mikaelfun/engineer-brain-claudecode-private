---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Application Gateway Layer 4 Proxy/Application Gateway FAQ"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FApplication%20Gateway%20Layer%204%20Proxy%2FApplication%20Gateway%20FAQ"
importDate: "2026-04-06"
type: troubleshooting-guide
---

## Frequent Asked Questions — Layer 4 proxy

The FAQs in this document are specifically about the Layer 4 (L4) proxy feature of Application Gateway. To view general or Layer 7 (L7) proxy related FAQs, please visit the [public docs](https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-faq).

**Does Application Gateway's Layer 7 and Layer 4 use the same frontend IP addresses?**
- Yes. Both L7 and L4 routing use the same frontend IP configuration. You can direct all clients to a single IP address (public or private) and the same gateway will route them based on listener protocols and ports.

**Can I use TCP or TLS proxy for HTTP(S) traffic?**
- While HTTP(S) traffic can be served through L4 proxy, it is not recommended. L7 proxy offers greater control and security via Rewrites, Session Affinity, Redirection, WebSockets, WAF, etc.

**What are the property names for Layer 4 proxy?**

| Property | Description |
|---|---|
| `listener` | For TLS or TCP based listeners |
| `routingRule` | To associate an L4 Listener with an L4 Backend setting |
| `backendSettingsCollection` | For TLS or TCP based Backend settings |

> You cannot use any L4 properties for HTTP or HTTPS protocol settings.

**Can I use a TCP/TLS listener with an HTTP(S) Backend Setting?**
- No. You cannot cross-link Layer 4 and Layer 7 properties. A routing rule only allows linking a Layer 4-type listener to a Layer 4-type Backend setting.

**Can L7 and L4 properties have the same names?**
- No. You cannot use the same name for an L7 (`httpListeners`) and L4 (`listeners`) resource. This applies to `backendSettingsCollection` and `routingRules` as well.

**Can I add a Private Endpoint to a Backend pool when using Layer 4 (TCP or TLS protocols)?**
- Yes. Similar to L7 proxy, you can add a private endpoint to the backend pool. It must be deployed in an adjacent subnet of the same virtual network.

**Does Application Gateway use Keepalive connections for backend servers?**
- No. For each incoming request, Application Gateway initiates a new backend connection to fulfill that request.

**Which IP address does the backend server see when a connection is established with Application Gateway?**
- The backend server sees the IP address of the Application Gateway. Client IP preservation is not currently supported for L4.

**How can I set the SSL policy for TLS listeners?**
- The same SSL policy configuration is applicable for both L7 (HTTPS) and L4 (TLS). SSL Profile (listener-specific SSL policy or Mutual Authentication) is not currently supported for TLS listeners.

**Does Application Gateway support session affinity for Layer 4 routing?**
- No. Session affinity (routing to the same backend server) is not supported. Connections are distributed in round-robin manner.

**Does the autoscale feature work with Layer 4 proxy?**
- Yes. Autoscale operates for traffic spikes and reductions for TLS or TCP protocols as well.

**Is Web Application Firewall (WAF) supported for Layer 4 traffic?**
- No. WAF capabilities do not work for Layer 4 usage.

**Does Application Gateway's Layer 4 proxy support UDP protocol?**
- No. UDP support is not available.
