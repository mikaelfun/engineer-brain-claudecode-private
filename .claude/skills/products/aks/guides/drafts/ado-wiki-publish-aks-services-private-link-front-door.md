---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Publish AKS services with Azure Private Link and Front Door"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FPublish%20AKS%20services%20with%20Azure%20Private%20Link%20and%20Front%20Door"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Publish your AKS Service with Azure Private Link and Front Door

## Summary and Goals

This doc provides a general review of the AKS Private link feature, how to integrate with private endpoint to expose private AKS service outside.

## Restrictions

- PLS does not support basic Load Balancer or IP-based Load Balancer.
- PLS connectivity is broken with Azure external Standard Load Balancer and floating ip enabled (default).
- To use managed private link service, users can either create an internal service by setting annotation `service.beta.kubernetes.io/azure-load-balancer-internal` to `true` or disable floating ip by setting annotation `service.beta.kubernetes.io/azure-disable-load-balancer-floating-ip` to `true`.
- Due to limitation of kubernetes#95555, when the service's externalTrafficPolicy set to Local, PLS need to use a different subnet from Pod's subnet. If the same subnet is required, then the service should use Cluster externalTrafficPolicy.
- PLS only works with IPv4 and cannot be deployed to an SLB with IPv6 frontend ipConfigurations. In dual-stack clusters, users cannot create a service with PLS if there's existing IPv6 service deployed on the same load balancer.

## Implementation Steps

### 1. Deploy and connect to private AKS cluster

```bash
az aks create --name PrivateAKSCluster --resource-group AKSRG --enable-managed-identity --node-count 3 --enable-private-cluster --disable-public-fqdn --enable-addons monitoring --generate-ssh-keys
sudo az aks get-credentials --resource-group AKSRG --name PrivateAKSCluster --overwrite-existing
```

### 2. Setup a demo application with PLS annotations

Key annotations for the Service:

```yaml
annotations:
  service.beta.kubernetes.io/azure-load-balancer-internal: "true"
  service.beta.kubernetes.io/azure-pls-create: "true"
  service.beta.kubernetes.io/azure-pls-name: aksPLS
  service.beta.kubernetes.io/azure-pls-ip-configuration-subnet: AKSSUBNET
  service.beta.kubernetes.io/azure-pls-ip-configuration-ip-address-count: "1"
  service.beta.kubernetes.io/azure-pls-ip-configuration-ip-address: "10.224.0.141"
  service.beta.kubernetes.io/azure-pls-proxy-protocol: "false"
  service.beta.kubernetes.io/azure-pls-visibility: "*"
```

### 3. Fix LinkedAuthorizationFailed error

If the service events show `LinkedAuthorizationFailed` with missing `Microsoft.Network/networkSecurityGroups/join/action`, assign Contributor role to AKS managed identity on the NSG:

```bash
az role assignment create --assignee "<cluster-msi-object-id>" --role "Contributor" --scope "/subscriptions/<sub-id>/resourceGroups/<rg>/providers/Microsoft.Network/networkSecurityGroups/<nsg-name>"
```

### 4. Deploy Azure Front Door (Premium tier)

- Create Azure Front Door with **Premium** tier (required for Private Link Service).
- Set Origin type: Custom, Origin host name: PLS alias (e.g., `akspls.<guid>.eastus.azure.privatelinkservice`).
- Enable Private Link Service, select the PLS resource.
- Approve the private endpoint connection in Private Link Center.

### 5. Configure Front Door settings

- Set forwarding protocol to **HTTP only** in the default route.
- Set health probe method to **GET** in the origin group.

### 6. Access the application

Access via the Front Door endpoint hostname (e.g., `www-xxx.b01.azurefd.net`).
