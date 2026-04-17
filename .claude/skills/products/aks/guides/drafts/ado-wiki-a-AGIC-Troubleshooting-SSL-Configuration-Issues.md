---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting SSL Configuration Issues"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20SSL%20Configuration%20Issues"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting SSL Configuration Issues

Workflow for scenarios where TLS behavior is wrong or incorrect SSL certificate is presented.

## [1] Is the ingress TLS specification correct?

Ingress must include TLS section referencing secret name and optionally hostnames. See: AGIC tutorial - Expose services over HTTPS.

## [2] Is the TLS secret properly configured?

Verify certificate contents:
```bash
kubectl get secret <SECRET_NAME> -n <NAMESPACE> -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -text
```

Verify thumbprint:
```bash
kubectl get secret <SECRET_NAME> -n <NAMESPACE> -o jsonpath='{.data.tls\.crt}' | base64 -d | openssl x509 -fingerprint -noout
```

Note: CSS cannot access TLS secret data per Microsoft privacy standards.

## [3] Fix TLS secret

Delete existing secret, create new one with correct cert+key. See: Kubernetes TLS Secrets documentation.

## [4] Is AppGW Listener configured with certificate?

Portal: Application Gateway > Listeners > select listener. Check:
- Protocol = HTTPS
- Port = 443
- Certificate = cert-default-<SECRET_NAME>
- Host names match ingress spec

CSS: ASC > HTTP Listeners panel.

## [5] AGIC/AppGW integration issues

See: Troubleshooting AGIC AppGw Integration Issues workflow.
