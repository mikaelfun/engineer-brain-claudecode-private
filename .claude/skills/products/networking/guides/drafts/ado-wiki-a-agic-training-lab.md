---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/AGIC Application Gateway Ingress Controller/Training - AGIC configuration lab"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FAGIC%20Application%20Gateway%20Ingress%20Controller%2FTraining%20-%20AGIC%20configuration%20lab"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Training — AGIC Configuration Lab

> End goal: deploy AGIC on an existing AKS cluster + existing V2 Standard Application Gateway, familiarize with deployment and basic management.
> Run locally (e.g., VSCode) — not in Cloud Shell.

[[_TOC_]]

## Prerequisites

| Tool | Link |
|------|------|
| Azure CLI (includes kubectl install) | https://learn.microsoft.com/en-us/cli/azure/install-azure-cli |
| Terraform | https://developer.hashicorp.com/terraform/install |
| Helm | https://helm.sh/docs/intro/install/ |
| VSCode (recommended) | https://code.visualstudio.com/download |
| openSSL | https://aka.ms/openssl-install |
| Trusted test cert (DigiCert internal) | https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/393783 |

> ⚠️ Kubernetes is case-sensitive and almost always uses lowercase characters.

---

## Lab: Terraform Deployment

Create an empty folder with the following files:

### providers.tf

```hcl
terraform {
  required_version = ">=1.9.8"
  required_providers {
    azapi   = { source = "azure/azapi",        version = "~>2.0.1" }
    azurerm = { source = "hashicorp/azurerm",  version = "~>4.11.0" }
    random  = { source = "hashicorp/random",   version = "~>3.6.3" }
    time    = { source = "hashicorp/time",     version = "0.12.1" }
  }
}
provider "azurerm" {
  subscription_id = "00000000-0000-0000-0000-000000000000"   # replace with yours
}
```

### variables.tf (key defaults)

```hcl
variable "resource_group_location" { default = "centralus" }
variable "node_count"              { default = 2 }
variable "vnet_address_space"      { default = ["10.0.0.0/16"] }
variable "subnet1_address_prefix"  { default = "10.0.0.0/23" }   # AKS subnet
variable "subnet2_address_prefix"  { default = "10.0.2.0/24" }   # AppGW subnet
variable "appgw_name"              { default = "agicappgw" }
```

> See full lab at wiki source for complete `ssh.tf`, `outputs.tf`, and AKS/AppGW resource definitions.

---

## AGIC Deployment via Helm

After Terraform provisioning:

```bash
# Add AGIC Helm repo
helm repo add application-gateway-kubernetes-ingress \
  https://appgwingress.blob.core.windows.net/ingress-azure-helm-package/
helm repo update

# Deploy AGIC
helm install ingress-azure \
  -f helm-config.yaml \
  application-gateway-kubernetes-ingress/ingress-azure \
  --version 1.9.1
```

### helm-config.yaml template

```yaml
verbosityLevel: 3
appgw:
  subscriptionId: <subscriptionId>
  resourceGroup: <resourceGroupName>
  name: agicappgw
  shared: false
armAuth:
  type: workloadIdentity    # or servicePrincipal
rbac:
  enabled: true
```

---

## Validation Steps

```bash
# Check AGIC pod status
kubectl get pods -n default

# Check AGIC logs for errors
kubectl logs -l app=ingress-azure

# Deploy test workload and ingress
kubectl apply -f test-deployment.yaml
kubectl get ingress
```

---

## Key Notes

- AGIC 1.8.0+ required for Azure CNI Overlay support
- Kubernetes and AKS are case-sensitive — use lowercase
- For service principal auth: see `How to configure a service principal for use with AGIC Helm deployments`
