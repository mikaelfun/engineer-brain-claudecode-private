---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Training - AGC Configuration Lab/02 - Initial AKS application deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/02%20-%20Initial%20AKS%20application%20deployment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Training - AGC configuration lab - Initial AKS application deployment

Now that the base environment is deployed we have a VNet with two subnets and an AKS Cluster deployed. Make note of the resource group name and kubernetes cluster name. We will need both of these to set them as variables in a moment.

### Variable Configuration

``` azcli
$AKS_NAME="cluster-in-leech"
$RESOURCE_GROUP="rg-handy-flamingo"
$SUBSCRIPTION="$(az account show --query id --output tsv)"
$VNETNAME = "aks-vnet"
$ALB_SUBNET_NAME = "agfc-subnet"
$ALB_SUBNET_ID=$(az network vnet subnet show --name $ALB_SUBNET_NAME --resource-group $RESOURCE_GROUP --vnet-name $VNETNAME --query '[id]' --output tsv)
$RGRESOURCEURI="/subscriptions/$SUBSCRIPTION/resourceGroups/$RESOURCE_GROUP"
$VNETRESOURCEURI="$RGRESOURCEURI/VirtualNetworks/$VNETNAME"
$IDENTITY_RESOURCE_NAME='Ingress-AGfC-ManagedIdent'

$mcResourceGroup=$(az aks show --resource-group $RESOURCE_GROUP --name $AKS_NAME --query "nodeResourceGroup" -o tsv)
$mcResourceGroupId=$(az group show --name $mcResourceGroup --query id -otsv)
```

### Vnet Configuration Requirements

Once our variables are set we can start by updating our subnet for the Application Gateway for Containers controller. The subnet needs to have its delegation set properly so an AGC instance can be deployed.

``` azcli
az network vnet subnet update --resource-group $RESOURCE_GROUP --vnet-name $VNETNAME --name $ALB_SUBNET_NAME --delegations "Microsoft.ServiceNetworking/trafficControllers"
```

Now that our subnet is updated we can deploy our managed identity for the AGC controller pod. This pod is sometimes referred to as ALB or the azure load balancer pod.

### Managed ID Deployment and Permissions

``` azcli
az identity create --resource-group $RESOURCE_GROUP --name $IDENTITY_RESOURCE_NAME
$principalId="$(az identity show -g $RESOURCE_GROUP -n $IDENTITY_RESOURCE_NAME --query principalId -otsv)"
```

We need to wait for the identity to replicate here. This process normally takes about 60 seconds or so but can potentially take a few hours. Once our identity replicates we can set up the needed permissions. There are specific permissions for AGC that need to be set so the controller can work properly.

``` azcli
#Delegate reader permissions for the AKS Managed Cluster RG
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --scope $mcResourceGroupId --role "acdd72a7-3385-48ef-bd42-f606fba81ae7"

# Delegate AppGw for Containers Configuration Manager role to AKS Managed Cluster RG
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --scope $mcResourceGroupId --role "fbc52c3f-28ad-4303-a892-8a056630b8f1"

# Delegate Network Contributor permission for join to association subnet
az role assignment create --assignee-object-id $principalId --assignee-principal-type ServicePrincipal --scope $ALB_SUBNET_ID --role "4d97b98b-1d4f-4787-a291-c67834d212e7"
```

Now that our permissions are set up we need to federate our identity with AKS. This is the same process that we use with identities for AGIC. Federation is functionally like setting up a trust relationship between the internal credentials inside of AKS and the external credentials in Entra ID. We need to enable the OIDC issuer on the AKS cluster immediately prior to this as well.

### Identity Federation

``` azcli
az aks update -g $RESOURCE_GROUP -n $AKS_NAME --enable-oidc-issuer --enable-workload-identity
$AKS_OIDC_ISSUER=$(az aks show -n "$AKS_NAME" -g "$RESOURCE_GROUP" --query "oidcIssuerProfile.issuerUrl" -o tsv)
az identity federated-credential create --name "azure-alb-identity" --identity-name "$IDENTITY_RESOURCE_NAME" --resource-group $RESOURCE_GROUP --issuer "$AKS_OIDC_ISSUER" --subject "system:serviceaccount:azure-alb-system:alb-controller-sa"
```

The service account inside of AKS for the ALB must be "alb-controller-sa" as on 01/24/2024. This is a publicly documented limitation on AGC at this time. As we have all of our environment set up for the AGC deployment we can deploy ALB via helm. We will also load in our AKS credentials so we can work with the cluster directly.

``` azcli
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME
helm install alb-controller oci://mcr.microsoft.com/application-lb/charts/alb-controller --version 1.5.2 --set albController.podIdentity.clientID=$(az identity show -g $RESOURCE_GROUP -n $IDENTITY_RESOURCE_NAME --query clientId -o tsv)
```

### Key Points

- AGC subnet requires delegation to `Microsoft.ServiceNetworking/trafficControllers`
- Managed identity needs Reader, AppGw Configuration Manager, and Network Contributor roles
- OIDC issuer and workload identity must be enabled on AKS cluster
- Federated credential service account must be `alb-controller-sa` in `azure-alb-system` namespace
- ALB controller is deployed via Helm from `mcr.microsoft.com/application-lb/charts/alb-controller`
