---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Application Gateway Ingress Controller/Multiple apps: 1 AppGW"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FApplication%20Gateway%20Ingress%20Controller%2FMultiple%20apps%3A%201%20AppGW"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# One Application gateway ingress, One cluster, 2 or more apps

The scope of this document is to provide some more specific instructions for creating and using a single application gateway ingress for multiple applications in the same AKS cluster. The below instructions will be for HTTP only, not HTTPS.

## Prerequisites

- One AKS cluster, created using Azure cli, <https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough> OR using the Azure portal, <https://docs.microsoft.com/en-us/azure/aks/kubernetes-walkthrough-portal>
- One Application Gateway, created using Azure cli, <https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-cli> OR using the Azure Portal, <https://docs.microsoft.com/en-us/azure/application-gateway/quick-create-portal>
- Inside the cluster create 2 namespaces, in the instructions below I will use UAT and DEV as my namespaces. App1 will be in UAT, and App2 will be in DEV.

## Instructions

### 1. Create the AAD pod Identity deployment

AAD Pod Identity consists of the Managed Identity Controller (MIC) deployment, the Node Managed Identity (NMI) daemon set, and several standard and custom resources.

Run this command to create the aad-pod-identity deployment on an RBAC-enabled cluster:
```
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment-rbac.yaml
```

Or run this command to deploy to a non-RBAC cluster:
```
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
```

### 2. Create an Azure Identity

Create a managed identity to update/manage the app gateway config:

```bash
az identity create -g <resourcegroup> -n <appid> -o json
```

Save the `clientId` and `id` values from the output.

### 3. Install the Azure Identity

Create `aadpodidentity.yaml`:

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentity
metadata:
  name: <appid>
spec:
  type: 0
  ResourceID: /subscriptions/<subid>/resourcegroups/<resourcegroup>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/appid
  ClientID: <clientId>
```

Apply: `kubectl apply -f aadpodidentity.yaml`

### 4. Install the Azure Identity Binding

Create `aadpodidentitybinding.yaml`:

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentityBinding
metadata:
  name: <app-azure-identity-binding>
spec:
  AzureIdentity: <appid>
  Selector: <appid>
```

Apply: `kubectl apply -f aadpodidentitybinding.yaml`

### 5. Set Permissions for MIC

Assign Managed Identity Operator role to the cluster service principal:

```bash
az aks show -g <resourcegroup> -n <name> --query servicePrincipalProfile.clientId -o tsv
az role assignment create --role "Managed Identity Operator" --assignee <sp id> --scope <full id of the managed identity>
```

### 6. Install Helm and AGIC

```bash
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update
```

Download and edit `helm-config.yaml` with appgw subscription, name, and armAuth settings.

```bash
helm install appgw-ingress -f helm-config.yaml application-gateway-kubernetes-ingress/ingress-azure
```

### 7. Deploy Applications with Host-based Routing

Deploy apps in separate namespaces (e.g., UAT, DEV). Use Ingress resources with `kubernetes.io/ingress.class: azure/application-gateway` annotation and host-based routing via nip.io or custom DNS.

Each app gets its own Ingress resource with a unique hostname, all sharing the same Application Gateway public IP.

## Owner and Contributors

**Owner:** Naomi Priola
**Contributors:** Ines Monteiro, Karina Jacamo, Hanno Terblanche
