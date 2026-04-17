---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/Networking/Ungrouped/Troubleshooting HTTP Proxy Feature"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/TSG/Networking/Ungrouped/Troubleshooting%20HTTP%20Proxy%20Feature"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Troubleshooting the HTTP Proxy feature in AKS

[[_TOC_]]

## Summary

The HTTP/S Proxy feature enables AKS cluster support an external HTTP/S proxy and installation of a trusted certificate authority onto nodes as part of bootstrapping a cluster. **The feature can only be enabled during cluster creation and the proxy is not a feature in the cluster**, so troubleshooting the feature will be limited ensuring the proxy feature has been deployed and helping users confirm traffic is successfully redirected through the proxy. Below are the steps to confirm feature deployment and successful traffic routing.

## Quick Commands

1. Proxy HTTP to HTTP: `curl -x http://PROXY:PORT/ -I http://www.google.com`
2. PROXY HTTP TO HTTPS over CONNECT (HTTP to a proxy using TLS): `curl -x http://PROXY:PORT/ -I https://www.google.com`
3. PROXY HTTPS to HTTP endpoint (TLS connection to proxy, using HTTP to destination): `curl -x https://PROXY:PORT/ -I http://www.google.com`
4. PROXY HTTPS to HTTPS (client-server TLS in all pairs): `curl -x https://PROXY:PORT/ -I https://www.google.com`
5. Validate node configuration by inspecting the following files:
   - ```/etc/evironment```
   - ```/etc/apt/apt.conf.d/95proxy```
   - ```/etc/systemd/system.conf.d/proxy.conf```
6. Validate Trusted CA on node:

   ```bash
   cat proxyCA.crt | base64 -d | openssl x509 -noout -text
   update-ca-certificates
   ```

7. Validate pod configuration is accurate: `kubectl describe pod [pod-name]`

## Confirm HTTP/S Proxy feature is enabled

Confirming the cluster proxy feature is enabled can be done by checking the Features list in ASI for the cluster.

HTTP proxy is a Cluster-level property, containing multiple subfields and one of either httpProxy or httpsProxy must be populated for the feature to be enabled. If only httpProxy is enabled, httpsProxy will be populated with the same value. An HTTP client can send CONNECT requests to the HTTP proxy, which will be tunneled over TLS. If httpsProxy is enabled, but not httpProxy, httpProxy will not be automatically populated. An HTTP client requesting an HTTPS resource directly results in a client error.

The following files in all correctly proxy enabled nodes should have the configurations similar to as shown below:

- /etc/evironment 
- /etc/apt/apt.conf.d/95proxy
- /etc/systemd/system.conf.d/proxy.conf

![Example output from printing the contents of the configuration files referenced above.](/.attachments/HTTPProxyNodeConfig-9e5db22b-8160-452b-b488-ad5ef218479c.png)

The pods should also have the proxy configurations similar to that of the node. Describing a pod using kubectl should give the desired output.

![Example of the expected proxy configuration injected into the pods running in the cluster.](/.attachments/HTTPProxyPodConfig-95546f4e-dccb-4276-8834-66829d5d5ea3.png)

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

## Confirm proxy functionality

We can validate proxy functionality by hitting a known good endpoint through the proxy, with and without HTTPS. curl -x uses the provided endpoint as a proxy. Note that the last two commands require HTTPS support from the corporate proxy.

Use quick commands 1-4 above to validate redirected transactions are successful through the proxy.

## Default No Proxy

Some kinds of traffic should not be proxied. By default, we will add IP addresses corresponding to all of the following to noProxy:

- Konnectivity
- Node Subnet
- podCidr
- serviceCidr
- dockerBridgeSubnet (if using docker)
- Azure DNS
- Azure IMDS
- FQDN

> **NOTE:** All mutual TLS must be no-proxied

Traffic between some components in the Kubernetes system requires TLS validated against a specific CA. In these cases, the user-provided proxy cannot present a valid certificate, because the client knows the expected CA and will validate against it. The potential IP ranges of all such components should be added to the "noProxy" field by default. This can otherwise cause failures to reach components like apiserver through the proxy.

> **NOTE:** Azure "Magic" IPs, on-host traffic should not be proxied

Azure IMDS for example, is a well-known IP which routes to the host wireserver. This should not be proxied, since the proxy may potentially be outside the Azure network range, and be unable to reach IMDS.

Docker bridge CIDR would be another example -- this should stay local to a single VM host.

## Owner and Contributors

**Owner:** Kavyasri Sadineni <ksadineni@microsoft.com>

**Contributors:**

- Kavyasri Sadineni <ksadineni@microsoft.com>
- Ben Parker <bparke@microsoft.com>
