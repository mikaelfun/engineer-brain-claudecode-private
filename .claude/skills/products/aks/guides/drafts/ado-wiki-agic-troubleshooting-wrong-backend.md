---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/TSG/AKS Network Troubleshooting Methodology/[TSG] AGIC/[TSG] AGIC Troubleshooting Wrong Backend Application Reached"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20Wrong%20Backend%20Application%20Reached"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting Wrong Backend Application Reached

The following workflow can be used to troubleshoot AGIC cases where the requests are found to be reaching the wrong backend application.

## [1] Is the DNS resolution for the FQDN used in the URL OK?

1. Confirm the IP address to which the FQDN used in the request is actually resolving to. Use standard DNS lookup tools such as `dig` or `nslookup`.

2. Use the following kubectl command to check the public IP address assigned to the AppGW frontend:

    ```bash
    kubectl get ingress -A
    ```

## [2] Are there multiple matching ingress rules for the request?

Having multiple rules matching a given request can lead to inconsistent and/or undesired behavior. Use the following command to display the existing ingress rules:

```bash
(echo "NAMESPACE INGRESS HOST PATH SERVICE PORT" && kubectl get --all-namespaces ingress -o json | jq -r '.items[] | . as $parent | .spec.rules[] | .host as $host | .http.paths[] | ($parent.metadata.namespace + " "  + $parent.metadata.name + " " + ($host // "*") + " " + .path + " " + .backend.service.name + " " + (.backend.service.port.number // .backend.service.port.name | tostring))') | column -s\  -t
```

Based on this output check for the following common scenarios:

- Check that there are no 2 rules (specified in the same or different ingress resources) which share the same value for both host and path
- Check that there are no 2 rules (specified in the same or different ingress resources) which do not specify host and share the same value for path (if no host is specified, the rule matches all inbound HTTP traffic arriving at the specified IP address as long as the rule's path matches the request's path)
