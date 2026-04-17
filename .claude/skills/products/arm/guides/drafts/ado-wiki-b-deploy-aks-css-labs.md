---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Readiness/Workloads/AKS enabled by Azure Arc/01-Deploy AKS in CSS Labs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Readiness/Workloads/AKS%20enabled%20by%20Azure%20Arc/01-Deploy%20AKS%20in%20CSS%20Labs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Deploy AKS on Azure Local Disconnected Operations (CSS Labs)

## Overview
AKS Arc for disconnected operations enables Kubernetes cluster management and app deployment without Azure connectivity.

## Prerequisites
1. Azure CLI installed (version 2.60.0+)
2. CLI extensions: `aksarc` v1.2.23, `stack-hci-vm` v1.3.0
3. Azure subscription configured for disconnected operations
4. Completed setup: Identity, Networking, PKI, Hardware, Azure Local

## Known Limitations
- Only supported from release 2408 onward
- Microsoft Entra ID (formerly Azure AD) is NOT supported
- Limited to specific Kubernetes versions (1.27.7, 1.28.5, 1.29.2, etc.)
- Arc Gateway and GPU support NOT available in disconnected mode

## Deployment Steps

### 1. Install CLI Extensions
```powershell
az extension add -n aksarc --version 1.2.23
az extension add -n stack-hci-vm --version 1.3.0
az config set core.instance_discovery=false --only-show-errors
```

### 2. Sign In
```powershell
az login --use-device-code
```

### 3. Create Logical Network
```powershell
az stack-hci-vm network lnet create \
  --resource-group $resourceGroupName \
  --custom-location $customLocationResourceId \
  --location $location \
  --name $lNetName \
  --ip-allocation-method "Static" \
  --address-prefixes $addressPrefixes \
  --ip-pool-start $ipPoolStart \
  --ip-pool-end $ipPoolEnd \
  --gateway $gateway \
  --dns-servers $dnsservers \
  --vm-switch-name $vmSwitchName
```

### 4. Create AKS Cluster
```powershell
az aksarc create -n $aksClusterName \
  --resource-group $resourceGroupName \
  --custom-location $customLocationResourceId \
  --node-count 3 \
  --vnet-ids $logicNetId \
  --generate-ssh-keys \
  --control-plane-ip $controlPlaneIp \
  --control-plane-count 3
```

### 5. Verify
```powershell
az stack-hci-vm network lnet list -o table
az aksarc list | ConvertFrom-Json | Format-Table
```

### 6. Delete (Optional)
```powershell
az aksarc delete --name $aksClusterName --resource-group $resourceGroupName
```
