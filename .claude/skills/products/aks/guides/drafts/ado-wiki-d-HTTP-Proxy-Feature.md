---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/HTTP Proxy Feature"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FPlatform%20and%20Tools%2FHTTP%20Proxy%20Feature"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# HTTP Proxy

[[_TOC_]]

## Description

Azure Kubernetes Service (AKS) clusters, whether deployed into a managed or custom virtual network, have certain outbound dependencies necessary to function properly. Previously, in environments requiring internet access to be routed through HTTP proxies, this was a problem. Nodes had no way of bootstrapping the configuration, environment variables, and certificates necessary to access internet services.

This feature adds HTTP proxy support to AKS clusters, exposing a straightforward interface that cluster operators can use to secure AKS-required network traffic in proxy-dependent environments.

Some more complex solutions may require creating a chain of trust to establish secure communications across the network. The feature also enables installation of a trusted certificate authority onto the nodes as part of bootstrapping a cluster.

### Support Boundary

With customers help:

* Ensure correct Node level configurations
* Ensure correct Pod level configurations.
* Test basic proxy communication to external source from node.

|Supported | Considerations | More Info|
|----- | ----- | -----|
|Verify Node Configuration | A good example of node configurations can be seen by looking at [Node-Configurations](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?e=RFZiZG) on Page 6| [Node-Configurations](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?e=RFZiZG) are on page 6|
|Verify Pod Configuration | A good example of pod configurations can be seen by looking at [Pod-Configurations](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?e=RFZiZG) are on page 9  |[Pod-Configurations](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?e=RFZiZG) are on page 9|
|Verify CURL Success| If [curl commands](/Azure-Kubernetes-Service-Wiki/AKS/Platform-and-Tools/HTTP-Proxy-Feature#curl-commands) fail, the customer needs to verify their proxy configuration settings. CSS cannot assist with this.  |[Ensure Limitations are understood](https://docs.microsoft.com/en-us/azure/aks/http-proxy#limitations-and-other-details)|

### Escalation Paths

#### The following scenarios may require an ICM to be filed against _Support/EEE AKS_

[AKS Support/EEE Escalation Template](https://aka.ms/CRI-AKS)

* Node configurations are not correct
* Pod configurations are not correct
* CURL commands from TSG respond but proxy still doesn't work
* All configurations are correct but the Proxy still isn't functioning as expected

### Basic Flow

::: mermaid
 graph TD;
 A[HTTP Proxy Deployed?] --> |Yes| B[Node and Pod Configurations Correct?];
A --> |No| Z[https://docs.microsoft.com/en-us/azure/aks/http-proxy];
B --> |Yes| Y[CURL Commands Successful?];
B --> |No| X[Escalate to EEE];
Y --> |Yes| W[Escalate to EEE];
Y --> |No| V[Customer must verify Proxy configurations];
:::

### Verified Learning Resources

|Resource | Description|
|------ | ------|
|[Use an HTTP proxy](https://docs.microsoft.com/en-us/azure/aks/http-proxy#limitations-and-other-details) | Public doc on using the HTTP Proxy|
|[HTTP Proxy Brownbag](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?wdOrigin=TEAMS-ELECTRON.p2p.mw&wdExp=TEAMS-CONTROL&wdhostclicktime=1634064042671) | Short and sweet powerpoint highlighting the required configurations|
|[Troubleshooting Walkthrough](https://microsoft-my.sharepoint.com/personal/amaheshwari_microsoft_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Famaheshwari%5Fmicrosoft%5Fcom%2FDocuments%2FMicrosoft%20Teams%20Chat%20Files%2FScreen%20Recording%202021%2D10%2D11%20at%202%2E14%2E45%20PM%2Emov%2Ezip&parent=%2Fpersonal%2Famaheshwari%5Fmicrosoft%5Fcom%2FDocuments%2FMicrosoft%20Teams%20Chat%20Files&originalPath=aHR0cHM6Ly9taWNyb3NvZnQtbXkuc2hhcmVwb2ludC5jb20vOnU6L3AvYW1haGVzaHdhcmkvRVFRTGp0Vy1RemRHdTdkN2NIS1RUQlFCWkZfOVgweXFpY05BQUZwWmowMUpPQT9ydGltZT1Na2o5azdDTjJVZw) | Quick walkthrough showing what commands to run|

## Basic TSG

This page shows how to troubleshoot HTTP Proxy feature. Look at the [this](https://microsoft-my.sharepoint.com/:p:/p/amaheshwari/EU7ACSW3As5Km-3oDwCmaVIBNHzJwGyu2cQpQ9Xn9upneA?e=I6tsxr) to see what an example of good settings looks like.

### Escalation team

feature owners: Node Lifecycle SIG

* ENG: @<Lily Pan> @<Anuj Arun Maheshwari>
* PM: @<Ally Ford>

### Troubleshooting

## HTTP / HTTPS Proxy Enablement

For information on enabling and setting an HTTP Proxy configuration, see [AKS documentation](https://learn.microsoft.com/azure/aks/http-proxy).

### HTTP Proxy update behavior

Customers can update an existing cluster to set an HTTP Proxy configuration. The existing cluster does not need to have an existing HTTP Proxy configuration.

Starting in March 2025, AKS will automatically trigger a reimage in all of the node pools in the cluster when HTTP Proxy configuration is updated. This will ensure that the proxy values are updated on all nodes and pods within the cluster.

### Is HTTP / HTTPS Proxy Enabled?

HTTP proxy is a Cluster-level property, containing multiple subfields.

One of either httpProxy or httpsProxy must be populated for the feature to be enabled.

If only httpProxy is enabled, httpsProxy will be populated with the same value. An HTTP client can send CONNECT requests to the HTTP proxy, which will be tunneled over TLS.

If httpsProxy is enabled, but not httpProxy, httpProxy will not be automatically populated. An HTTP client requesting an HTTPS resource directly results in a client error.

Additionally, to facilitate trust for HTTPS proxies, a trustedCa field should contain a base64 encoded PEM certificate (you can `cat proxyCA.crt | base64 -d | openssl x509 -noout -text` to validate the user provided a real cert, but we will do some validation in RP frontend anyway). It will be added to the Linux VM filesystem in /usr/local/share/ca-certificates/proxyCA.crt, after which we run `update-ca-certificates`, which creates a symlink to /etc/ssl/certs and appends the certificate to /etc/ssl/certs/ca-certificates.crt, the default Ubuntu trust store.

```json
 "properties": {
    ...,
    "httpProxyConfig": {
        "httpProxy": "string",
        "httpsProxy": "string",
        "noProxy": [
            "string"
        ],
        "trustedCa": "string"
    }
 }
```

## Validation

We can validate proxy functionality by hitting a known good endpoint through the proxy, with and without HTTPS. curl -x uses the provided endpoint as a proxy. Note that the last two commands require HTTPS support from the corporate proxy.

Proxy HTTP to HTTP:
curl -x <http://PROXY:PORT/> -I <http://www.google.com>

PROXY HTTP TO HTTPS over CONNECT (i.e., plain HTTP where only proxy speaks TLS)
curl -x <http://PROXY:PORT/> -I <https://www.google.com>

PROXY HTTPS to HTTP endpoint (not sure why anyone would want this, access an HTTP-only site through a TLS proxy?)
curl -x <https://PROXY:PORT/> -I <http://www.google.com>

PROXY HTTPS to HTTPS -- client-server TLS in all pairs.
curl -x <https://PROXY:PORT/> -I <https://www.google.com>

In addition, if this fails SSL validation, you can use curl -vv -k to force the insecure request to complete and get full debug output for the request (e.g. certificate issuer/subject to see why trust fails).

## Default No Proxy

Some kinds of traffic should not be proxied. By default, we will add IP addresses corresponding to all of the following to noProxy:

* Konnectivity
* Node Subnet
* podCidr
* serviceCidr
* dockerBridgeSubnet (if using docker)
* Azure DNS
* Azure IMDS
* FQDN

To confirm proxy configuration on the cluster using Geneva Action, use `Get Managed Cluster` and look for `httpProxyConfig` under `properties`:

![geneva.png](/.attachments/geneva-3ca12e3a-dbc3-44f5-aeb4-2584edf7e251.png)

You can also confirm feature enablement in ASI under `features`:

![asi.png](/.attachments/asi-b8035430-587d-4c58-855c-0ea7a73a0cbf.png)

### All mutual TLS must be no-proxied

Traffic between some components in the Kubernetes system requires TLS validated against a specific CA. In these cases, the user-provided proxy cannot present a valid certificate, because the client knows the expected CA and will validate against it. The potential IP ranges of all such components should be added to the "noProxy" field by default. This can otherwise cause failures to reach components like apiserver through the proxy.

### Azure "Magic" IPs, on-host traffic should not be proxied

Azure IMDS for example, is a well-known IP which routes to the host wireserver. This should not be proxied, since the proxy may potentially be outside the Azure network range, and be unable to reach IMDS.

Docker bridge CIDR would be another example -- this should stay local to a single VM host.

## Common error scenarios

1. AKS does not support HTTP Proxy configuration for Windows node pools. If an HTTP Proxy configuration is added to a cluster with a windows node pool, the user will receive an error that says `HTTPProxyConfig is not supported for OS type: Windows`.

### Troubleshooting Provisioning Errors

* If CSE fails, refer to the following [TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/how-to-get-systemd-kubelet-log-and-provisioning-logs-and-pod-logs-from-the-node-using-azure-support-center) to retrieve provisioning logs.
  * If CSE exit code is 161, this indicates issue with updating TrustedCA cert. If provisioning fails due to this error, refer to this [TSG](https://eng.ms/docs/cloud-ai-platform/azure-core/azure-management-and-platforms/containers-bburns/azure-kubernetes-service/azure-kubernetes-service-troubleshooting-guide/doc/tsg/tsg-http-https-proxy).
  * If CSE exit code is 50, this indicates issue with outbound connectivity. Things to check:
    * ensure cluster and proxy are in the same vnet and have connectivity. Use the above curl commands to confirm.
    * Get onto the nodes and ensure the follow files have proxy configuration set on the nodes:
      * Check that `/etc/systemd/system.conf.d/proxy.conf`contains correct proxy environment variables
      * Check that `/etc/apt/apt.conf.d/95proxy`contains correct proxy URLs
      * Ensure `cat /etc/systemd/system/kubelet.service.d/10-httpproxy.conf` exists
      * Check that `/etc/evironment` contains expected proxy vars

## Known issues

### Go language compatibility with Subject Alternative Names vs Common Name certs

For compatibility with the numerous Go-based components which are part of the Kubernetes system, the user-provided proxy MUST support Subject Alternative Names. You can see the plain text of the proxyCA.crt with `cat proxyCA.crt | openssl x509 -noout -text` to see whether it has Common Name, SAN, or some mix.

> X.509 CommonName deprecation
>
> The deprecated, legacy behavior of treating the CommonName field on X.509 certificates as a host name when no Subject Alternative Names are present is now disabled by default. It can be temporarily re-enabled by adding the value x509ignoreCN=0 to the GODEBUG environment variable.
>
> Note that if the CommonName is an invalid host name, it's always ignored, regardless of GODEBUG settings. Invalid names include those with any characters other than letters, digits, hyphens and underscores, and those with empty labels or trailing dots.

## Owner and Contributors

**Owner:** Jordan Harder <Jordan.Harder@microsoft.com>
**Contributors:**

- Naomi Priola <Naomi.Priola@microsoft.com>
- Ben Parker <bparke@microsoft.com>
- Chase Overmire <chover@microsoft.com>

