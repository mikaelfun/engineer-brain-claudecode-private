---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Networking/Application Gateway Ingress Controller/AGIC with private IP only - How to overcome the limitation"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FNetworking%2FApplication%20Gateway%20Ingress%20Controller%2FAGIC%20with%20private%20IP%20only%20-%20How%20to%20overcome%20the%20limitation"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# AGIC with private IP only - How to overcome the limitation

## Scope

Using AGIC with private IP address only is NOT supported natively. The workaround involves creating the Application Gateway with a mandatory public IP, then blocking it at NSG level so only the private IP is functional.

## Scenario

- Create a VNET with two subnets for Cluster and Application Gateway
- Create the public IP which is mandatory
- Create the NSG and associate it to the subnet of Application Gateway
- Add the deny rule for the public IP address that will be assigned to the Application Gateway
- Add the mandatory rule in NSG as per https://docs.microsoft.com/en-us/azure/application-gateway/configuration-infrastructure#network-security-groups
- Create a managed identity for AKS cluster with existing VNET/subnet
- Create the AKS cluster
- Create the Application Gateway
- Enable AGIC addon

## Script

```bash
#Setting environment variables
LOCATION=westeurope
RESOURCEGROUP=agic-rg

az group create --name $RESOURCEGROUP --location $LOCATION
az network vnet create --resource-group $RESOURCEGROUP --name agic-vnet --address-prefixes 10.0.0.0/8
az network vnet subnet create --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name appgw-subnet --address-prefixes 10.2.0.0/16
az network vnet subnet create --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name aks-subnet --address-prefixes 10.240.0.0/16
az network public-ip create -n appgw-pip -g $RESOURCEGROUP --allocation-method Static --sku Standard
az network nsg create -g $RESOURCEGROUP -n nsg
az network vnet subnet update --resource-group $RESOURCEGROUP --vnet-name agic-vnet --name appgw-subnet --network-security-group nsg

appgwpip_IP=$(az network public-ip show -g $RESOURCEGROUP -n appgw-pip --query ipAddress | sed 's/"//g')
az network nsg rule create -g $RESOURCEGROUP --nsg-name nsg -n DenyAppGwPip --priority 100 --source-address-prefixes '*' --source-port-ranges '*' --destination-address-prefixes $appgwpip_IP/32 --destination-port-ranges '*' --access Deny --protocol '*' --description "Deny Application Gateway's Public IP address"
az network nsg rule create -g $RESOURCEGROUP --nsg-name nsg -n Mandatory --priority 4096 --source-address-prefixes 'GatewayManager' --source-port-ranges '*' --destination-address-prefixes '*' --destination-port-ranges 65200-65535 --access Allow --protocol TCP --description "Mandatory GatewayManager"

az identity create --name AKSIdentity --resource-group $RESOURCEGROUP

aksidentity_ID=$(az identity show -n AKSIdentity -g $RESOURCEGROUP -o tsv --query "id")
akssubnet_ID=$(az network vnet subnet show -g $RESOURCEGROUP -n aks-subnet --vnet-name agic-vnet -o tsv --query "id")
az aks create -n aks-agic -g $RESOURCEGROUP --network-plugin azure --enable-managed-identity --assign-identity $aksidentity_ID --vnet-subnet-id $akssubnet_ID
az network application-gateway create -n appgw-agic -g $RESOURCEGROUP --sku Standard_v2 --public-ip-address appgw-pip --vnet-name agic-vnet --subnet appgw-subnet --private-ip-address 10.2.0.10

appgw_ID=$(az network application-gateway show -n appgw-agic -g $RESOURCEGROUP -o tsv --query "id")
az aks enable-addons -n aks-agic -g $RESOURCEGROUP -a ingress-appgw --appgw-id $appgw_ID
```

## Testing

To expose the application privately, add the ingress annotation:
```
appgw.ingress.kubernetes.io/use-private-ip: "true"
```

Reference: https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-annotations#use-private-ip

## Conclusion

The public IP address still exists as a resource in Azure, but it is not functional as it is blocked at NSG level, thus the application gateway is usable via the private IP address only.
