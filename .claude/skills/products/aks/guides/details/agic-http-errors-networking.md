# AKS AGIC HTTP 错误码排查 — networking -- Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-a-agic-request-routing-verification.md
**Generated**: 2026-04-07

---

## Phase 1: Network connectivity from AGIC pod to Azure Resour

### aks-860: AGIC pod logs show 'ErrorGetApplicationGatewayError' with 'Failed fetching confi...

**Root Cause**: Network connectivity from AGIC pod to Azure Resource Manager endpoint (management.azure.com:443) is blocked. Common causes: UDR routing through NVA/Azure Firewall without allowing ARM traffic, NSG denying AzureResourceManager service tag, or Network Policies blocking AGIC pod outbound.

**Solution**:
Check and fix egress rules: (1) If UDR outbound, verify NVA/Firewall allows traffic to management.azure.com; (2) If LB outbound with route table 0.0.0.0/0 to NVA, check NVA rules; (3) Verify NSG allows AzureResourceManager service tag; (4) Check Network Policies do not block AGIC pod outbound on port 443.

`[Score: [B] 7.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues)]`

## Phase 2: AGIC v1.7.5+ introduced a fix to clean up stale UR

### aks-1062: AGIC returns 400 error when updating Application Gateway: InvalidResourceReferen...

**Root Cause**: AGIC v1.7.5+ introduced a fix to clean up stale URL path maps not defined in the local cluster Ingress resources. When two AGIC instances (from different AKS clusters) share the same Application Gateway, each AGIC reconciliation removes paths defined by the other cluster, causing invalid references. Sharing Application Gateway between clusters via AGIC addon is not supported.

**Solution**:
Option 1: Use a unique Application Gateway per AKS cluster when using the AGIC addon. Option 2: For shared Application Gateway, deploy AGIC via Helm (not addon) with subResourceNamePrefix to isolate path/rule names per cluster: helm upgrade ingress-azure ... --set appgw.subResourceNamePrefix=abc. This ensures each AGIC only manages its own prefixed resources. Start with v1.7.4 + prefix, then upgrade to v1.7.6+.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20fails%20to%20update%20shared%20application%20gateway)]`

## Phase 3: The Application Gateway used by AGIC does not expo

### aks-1063: TLS certificate issuance fails with cert-manager and Let's Encrypt using HTTP-01...

**Root Cause**: The Application Gateway used by AGIC does not expose the HTTP-01 challenge path (.well-known/acme-challenge) by default. The cert-manager solver pod needs to serve the challenge token via the ingress controller, but without specifying the ingress class in the Issuer/ClusterIssuer configuration, cert-manager cannot create the temporary Ingress resource needed to route challenge traffic to the solver pods.

**Solution**:
Update the ClusterIssuer/Issuer http01 solver section to include the ingress class: solvers: - http01: ingress: class: azure/application-gateway. This tells cert-manager to create a temporary Ingress with the correct class for AGIC to route challenge traffic. As of cert-manager 1.12, this is the recommended configuration. Alternatively, switch from HTTP-01 to DNS-01 challenges by configuring a DNS provider in the Issuer.

`[Score: [Y] 4.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FHTTP01%20challenges%20fail%20with%20Lets%20Encrypt%20and%20cert%20manager)]`

## Phase 4: The ALB controller pod in the AKS cluster cannot r

### aks-1058: AGC (Application Gateway for Containers) does not route HTTP requests as configu...

**Root Cause**: The ALB controller pod in the AKS cluster cannot reach the AGC control plane configuration endpoint (public FQDN/IP on port 443). This is typically caused by NSG rules, firewall, or UDR blocking outbound traffic from the node to the AGC configurationEndpoint address. The endpoint FQDN can be found in the AGC resource JSON view under configurationEndpoint. Without connectivity, AGC cannot receive user intent (Gateway/HTTPRoute configs) and falls back to default 404.

**Solution**:
1. Find the AGC configurationEndpoint FQDN from the AGC resource JSON view in Azure Portal. 2. Verify DNS resolution of the endpoint from the node (nslookup). 3. Test connectivity from node to the endpoint on port 443 (curl -v <fqdn>:443). Expected: Connection reset by peer (working). Unexpected: Connection timed out (blocked). 4. Check and fix NSG, UDR, or firewall rules blocking traffic from the node subnet to the endpoint IP. 5. After fixing connectivity, delete ALB controller pods to trigger restart and config resync.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGC%2FAGC_routing_not_functioning)]`

## Phase 5: When managed identity is enabled on a cluster with

### aks-1060: AGIC backend pools not updated with new pod IPs after pod restart. AGIC pod in C...

**Root Cause**: When managed identity is enabled on a cluster with Microsoft Entra pod-managed identity (aad-pod-identity) installed manually (not via addon), the NMI pods modify node iptables to intercept all calls to the IMDS endpoint (169.254.169.254). This blocks AGIC pod authentication requests to IMDS, causing credential acquisition failure. This does not occur with Service Principal auth (no IMDS needed) or when using the aad-pod-identity addon (which auto-creates AzurePodIdentityException).

**Solution**:
Option 1: Install the Microsoft Entra pod-managed identities addon (az aks update), which automatically creates AzurePodIdentityException for system pods. Option 2: If using manual aad-pod-identity installation, create AzurePodIdentityException resources for kube-system namespace with podLabels matching kubernetes.azure.com/managedby: aks to exempt AGIC and other AKS addon pods from NMI interception.

> **21V Warning**: This feature/solution may not be available in Azure China (Mooncake)

`[Score: [W] 2.5 | Source: [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20Backend%20Pools%20Not%20Getting%20Updated%20After%20Migrating%20From%20service%20Principal%20to%20ManageIdentity)]`

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | AGIC pod logs show 'ErrorGetApplicationGatewayError' with 'Failed fetching confi... | Network connectivity from AGIC pod to Azure Resource Manager... | Check and fix egress rules: (1) If UDR outbound, verify NVA/... | [B] 7.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki/%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FAKS%20Network%20Troubleshooting%20Methodology%2F%5BTSG%5D%20AGIC%2F%5BTSG%5D%20AGIC%20Troubleshooting%20AGIC%20AppGw%20Integration%20Issues) |
| 2 | AGIC returns 400 error when updating Application Gateway: InvalidResourceReferen... | AGIC v1.7.5+ introduced a fix to clean up stale URL path map... | Option 1: Use a unique Application Gateway per AKS cluster w... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20fails%20to%20update%20shared%20application%20gateway) |
| 3 | TLS certificate issuance fails with cert-manager and Let's Encrypt using HTTP-01... | The Application Gateway used by AGIC does not expose the HTT... | Update the ClusterIssuer/Issuer http01 solver section to inc... | [Y] 4.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FHTTP01%20challenges%20fail%20with%20Lets%20Encrypt%20and%20cert%20manager) |
| 4 | AGC (Application Gateway for Containers) does not route HTTP requests as configu... | The ALB controller pod in the AKS cluster cannot reach the A... | 1. Find the AGC configurationEndpoint FQDN from the AGC reso... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGC%2FAGC_routing_not_functioning) |
| 5 | AGIC backend pools not updated with new pod IPs after pod restart. AGIC pod in C... | When managed identity is enabled on a cluster with Microsoft... | Option 1: Install the Microsoft Entra pod-managed identities... | [W] 2.5 | [ADO Wiki](https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FTSG%2FNetworking%2FAGIC%2FAGIC%20Backend%20Pools%20Not%20Getting%20Updated%20After%20Migrating%20From%20service%20Principal%20to%20ManageIdentity) |
