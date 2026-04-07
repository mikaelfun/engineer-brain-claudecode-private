---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/AKS HTTP Proxy Walkthrough"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FAKS%20HTTP%20Proxy%20Walkthrough"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AKS HTTP Proxy Walkthrough

## Summary

General review of the AKS HTTP proxy feature and how it affects nodes outbound traffic. Uses mitmproxy as example proxy server.

## High Level Topology

Proxy server VM (separate VNET) ↔ VNET peering ↔ AKS cluster VNET

## Setup Steps

1. Deploy proxy server VM with mitmproxy
2. Generate proxy certificates, extract PEM cert as base64
3. Create `aks-proxy-config.json` with httpProxy, httpsProxy, noProxy, trustedCA
4. Deploy AKS cluster with `--http-proxy-config aks-proxy-config.json`
5. VNET peering between proxy and AKS VNETs

## Node OS Proxy Files

```bash
# Review on AKS nodes:
cat /etc/environment
cat /etc/systemd/system.conf.d/proxy.conf
cat /etc/apt/apt.conf.d/95proxy
ls -l /etc/ssl/certs/proxyCA.pem
openssl x509 -in /etc/ssl/certs/proxyCA.pem -text -noout
```

## Key Points

- Proxy config changes require **node image upgrade** or **new node pool** to take effect on nodes
- Add domains to `noProxy` to bypass proxy for specific destinations
- Check proxy config: `az aks show -n <name> -g <rg> --query httpProxyConfig -o json`
- Support can view proxy config in ASC "http proxy config" tab

## Troubleshooting

- If proxy blocks traffic → add affected domain to noProxy list
- If noProxy changes don't take effect → upgrade node image or create new node pool
- If proxy server issue → ask customer to troubleshoot from proxy server side

**Owner:** Adam Margherio
