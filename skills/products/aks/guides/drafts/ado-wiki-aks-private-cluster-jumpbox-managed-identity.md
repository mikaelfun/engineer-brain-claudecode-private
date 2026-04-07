---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Cluster Management/Connecting Private Cluster Jumpbox MI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FCluster%20Management%2FConnecting%20Private%20Cluster%20Jumpbox%20MI"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Accessing AKS Private Clusters via Jumpbox with Managed Identity

## Overview

When troubleshooting AKS private clusters, engineers often need TTY terminal sessions on cluster nodes. Since private clusters have no public API server endpoint, a **jumpbox VM** within the same virtual network (or a peered network) is required.

This article documents the recommended approach using **Azure Managed Identity** instead of a Service Principal for authentication on the jumpbox.

---

## Why Not a Service Principal?

Attempting to authenticate with a Service Principal (`az login --service-principal`) from a jumpbox or remote environment will frequently fail due to **Conditional Access (CA) policies** enforced by the organization.

### Common Error

```
AADSTS53003: Access has been blocked by Conditional Access policies.
The access policy does not allow token issuance.
Trace ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Correlation ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Why This Happens

Conditional Access policies may enforce one or more of the following:

| Policy Type | Why It Blocks |
|---|---|
| **Location-based** | The jumpbox VM's IP is not in the corporate trusted network |
| **Device compliance** | Linux VMs are not Intune-enrolled/compliant devices |
| **MFA requirement** | Service principal non-interactive logins cannot satisfy MFA prompts |
| **App restrictions** | The app registration is not allowlisted in the CA policy |

---

## Recommended Approach: User-Assigned Managed Identity

**Managed Identities** bypass Conditional Access policies entirely because they authenticate via the Azure Instance Metadata Service (IMDS) — a local endpoint available only from within the VM itself.

### Benefits

- No passwords or secrets to manage or rotate
- Not subject to Conditional Access policies
- Credentials never leave the Azure platform
- Automatic token management by the Azure platform
- Can be scoped with RBAC like any other identity

---

## Step-by-Step Setup

### Prerequisites

- Azure CLI installed on your local machine (`az --version`)
- An active Azure subscription
- Permissions: **Contributor** on the subscription/resource group, **User Access Administrator** or **Owner** for role assignments

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Set Your Target Subscription

```bash
az account set --subscription "<SUBSCRIPTION_NAME_OR_ID>"
```

### Step 3: Create a Resource Group (if needed)

```bash
az group create --name <RESOURCE_GROUP> --location <LOCATION>
```

### Step 4: Create a User-Assigned Managed Identity

```bash
az identity create \
  --name <IDENTITY_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --location <LOCATION>
```

Save the output values — you will need `principalId` and `clientId`:

```bash
az identity show \
  --name aks-jumpbox-identity \
  --resource-group aks-support-rg \
  --query "{principalId: principalId, clientId: clientId, id: id}" \
  --output table
```

### Step 5: Assign RBAC Role to the Managed Identity

```bash
az role assignment create \
  --assignee-object-id <PRINCIPAL_ID> \
  --assignee-principal-type ServicePrincipal \
  --role Contributor \
  --scope /subscriptions/<SUBSCRIPTION_ID>
```

> **Note:** For AKS node access, the identity may also need **Azure Kubernetes Service Cluster User Role** or **Azure Kubernetes Service Cluster Admin Role** on the AKS cluster resource.

### Step 6: Create the Jumpbox VM with the Managed Identity

```bash
az vm create \
  --name <VM_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --location <LOCATION> \
  --image Ubuntu2404 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --vnet-name <AKS_VNET_NAME> \
  --subnet <JUMPBOX_SUBNET> \
  --assign-identity <MANAGED_IDENTITY_RESOURCE_ID> \
  --output json
```

### Step 7: Connect to the VM

- **SSH**: `ssh azureuser@<PUBLIC_IP>`
- **az vm run-command**: if SSH port 22 is blocked
- **Azure Serial Console**: Portal → VM → Connect → Serial Console
- **Azure Bastion**: if deployed in the VNet

### Step 8: Install Azure CLI on the Jumpbox

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Step 9: Login with the Managed Identity

```bash
az login --identity --client-id <CLIENT_ID>
```

> **Important:** Use `--client-id` (not `--username`). The `--username` flag for managed identity login has been deprecated.

### Step 10: Install kubectl and Access the AKS Private Cluster

```bash
sudo az aks install-cli
az aks get-credentials --resource-group <AKS_RG> --name <AKS_CLUSTER>
kubectl get nodes
```

### Step 11: Open a TTY Session on an AKS Node

```bash
kubectl debug node/<NODE_NAME> -it --image=mcr.microsoft.com/cbl-mariner/busybox:2.0
chroot /host
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| SSH Connection Times Out | Outbound port 22 blocked by corporate network/VPN | Use `az vm run-command`, Serial Console, or Azure Bastion |
| MI Login Fails with `--username` | Flag deprecated in newer Azure CLI | Use `--client-id`, `--object-id`, or `--resource-id` |
| kubectl Cannot Reach API Server | Jumpbox not in same/peered VNet as AKS cluster | Ensure proper VNet placement; verify DNS resolution of private FQDN |
| CA Blocks Service Principal | Organization CA policies block non-compliant devices/locations | Switch to Managed Identity (this guide) |

---

## Cleanup

```bash
az vm delete --name loginVM --resource-group aks-support-rg --yes
az identity delete --name aks-jumpbox-identity --resource-group aks-support-rg
az group delete --name aks-support-rg --yes --no-wait
```
