---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Application Gateway Ingress Controller/Multiple apps: Multiple AppGWs: 1 Cluster"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/How%20Tos/Networking/Application%20Gateway%20Ingress%20Controller/Multiple%20apps%3A%20Multiple%20AppGWs%3A%201%20Cluster"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Two or more app gateway ingress, one cluster, 2 or more apps

The scope of this document is to provide some more specific instructions for creating and using multiple application gateway ingress for multiple applications in the same AKS cluster. The below instructions will be for HTTP only, not HTTPS.

## Prerequisites

- One AKS cluster, created using Azure cli or using the Azure portal
- Two or more Application Gateways (in the example below we will use 2, one for DEV and one for UAT)
- Inside the cluster create 2 namespaces (UAT and DEV). App1 will be in UAT, and App2 will be in DEV.

## Instructions

### 1. Create the AAD pod Identity deployment

AAD Pod Identity consists of the Managed Identity Controller (MIC) deployment, the Node Managed Identity (NMI) daemon set, and several standard and custom resources.

RBAC-enabled cluster:
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment-rbac.yaml
```

Non-RBAC cluster:
```bash
kubectl apply -f https://raw.githubusercontent.com/Azure/aad-pod-identity/master/deploy/infra/deployment.yaml
```

### 2. Create Azure Identities (one per app)

```bash
az identity create -g <resourcegroup> -n <app1id> -o json
```

Save the `clientId` and `id` values for later use.

### 3. Install Azure Identity (repeat per app)

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentity
metadata:
  name: <app1id>
spec:
  type: 0
  ResourceID: /subscriptions/<subid>/resourcegroups/<resourcegroup>/providers/Microsoft.ManagedIdentity/userAssignedIdentities/app1id
  ClientID: <clientId>
```

```bash
kubectl apply -f aadpodidentity.yaml
```

### 4. Install Azure Identity Binding (repeat per app)

```yaml
apiVersion: "aadpodidentity.k8s.io/v1"
kind: AzureIdentityBinding
metadata:
  name: <app1-azure-identity-binding>
spec:
  AzureIdentity: <app1id>
  Selector: <app1id>
```

Pods need label `aadpodidbinding=<selector>` to match.

### 5. Set Permissions for MIC

Get the service principal:
```bash
az aks show -g <resourcegroup> -n <name> --query servicePrincipalProfile.clientId -o tsv
```

Assign Managed Identity Operator role:
```bash
az role assignment create --role "Managed Identity Operator" --assignee <sp id> --scope <full id of the managed identity>
```

### 6. Install Helm and AGIC repo

```bash
helm repo add application-gateway-kubernetes-ingress https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update
```

### 7. Set up AAD Pod Identity permissions on App Gateway

Give Contributor access to each App Gateway:
```bash
az role assignment create --role Contributor --assignee <clientId> --scope <App-Gateway-ID>
```

Give Reader access to the resource group:
```bash
az role assignment create --role Reader --assignee <clientId> --scope <App-Gateway-Resource-Group-ID>
```

### 8. Install AGIC Helm charts (one per app, different namespace + gateway)

Key helm-config differences per app:
- `appgw.name`: different gateway per app
- `kubernetes.watchNamespace`: different namespace per app
- `armAuth.identityResourceID` and `identityClientID`: different identity per app

```bash
helm install app1-ingress -f helm1-config.yaml application-gateway-kubernetes-ingress/ingress-azure
helm install app2-ingress -f helm2-config.yaml application-gateway-kubernetes-ingress/ingress-azure
```

### 9. Deploy applications with Ingress resources

Each app's Ingress resource should:
- Be in its respective namespace
- Use annotation `kubernetes.io/ingress.class: azure/application-gateway`
- Use DNS hostname-based routing (e.g., via nip.io for testing)

### Verification

After deployment, check:
- Backend pools created in both App Gateways
- HTTP listeners configured
- Backend health is green
- Apps accessible through configured hostnames
