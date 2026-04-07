# API Server Connection Basic Troubleshooting (AKS)

> Source: https://learn.microsoft.com/en-us/troubleshoot/azure/azure-kubernetes/connectivity/troubleshoot-cluster-connection-issues-api-server
> Status: draft (from mslearn-scan)

## Overview
Structured checklist for diagnosing AKS API server connectivity failures (network, auth, authz).

## Checklist

### 1. Verify FQDN Resolution
```bash
az aks show --resource-group <rg> --name <cluster> --query fqdn
nslookup <cluster-fqdn>
```
Note: After stop/start, API server IP may change. Flush DNS cache.

### 2. Test API Server Reachability
```bash
curl -k -Iv https://<cluster-fqdn>
telnet <cluster-fqdn> 443
```

### 3. Private Cluster Check
If cluster is private, must connect from a VM in the same VNet or peered network.
See: [Options for connecting to private cluster](https://learn.microsoft.com/en-us/azure/aks/private-clusters#options-for-connecting-to-the-private-cluster)

### 4. Authorized IP Ranges
If using API server authorized IP ranges, ensure client IP is included.
See: [Client IP cannot access API server](client-ip-address-cannot-access-api-server)

### 5. kubectl Version Compatibility
Must be within 2 minor versions of cluster version.
```bash
sudo az aks install-cli
kubectl version --client
```

### 6. Kubeconfig Validity
Ensure kubeconfig is valid and accessible.
See: [Config file not available when connecting](config-file-is-not-available-when-connecting)

### 7. Firewall Egress Rules
Ensure firewall allows minimum required egress rules for AKS.
See: [AKS outbound rules](https://learn.microsoft.com/en-us/azure/aks/limit-egress-traffic)

### 8. NSG Port 10250
Ensure NSG allows TCP 10250 communication within AKS nodes.

## 21V Applicability
Applicable. Use corresponding 21V FQDN endpoints.
