---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway for Containers (formerly Azure Traffic Controller)/Training - AGC Configuration Lab/01 - Terraform Deployment"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Application%20Gateway%20for%20Containers%20(formerly%20Azure%20Traffic%20Controller)/Training%20-%20AGC%20Configuration%20Lab/01%20-%20Terraform%20Deployment"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Training - AGC configuration lab - Terraform Deployment

## Lab

We can start out by deploying our lab environment with Terraform. We are doing this to simplify this lab and as we do not really care about the intricacies of AKS for our purposes here. Start by creating an empty folder and the following files inside of it with the included content. The variables.tf file can be updated as needed to reflect the desired environment configurations. You will also need to update the subscription ID in the providers.tf file with your own Subscription ID.

### Initial Terraform File Setup

**File Name: providers.tf**

``` terraform
terraform {
  required_version = ">=1.9.8"

  required_providers {
    azapi = {
      source  = "azure/azapi"
      version = "~>2.0.1"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>4.11.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.6.3"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.12.1"
    }
  }
}

provider "azurerm" {
  subscription_id = "00000000-0000-0000-0000-000000000000"
}

resource "random_integer" "ri" {
  min = 10000
  max = 99999
}

provider "azuread" {
  tenant_id = "16b3c013-d300-468d-ac64-7eda0820b6d3"
}
```

**File Name: ssh.tf**

``` terraform
resource "random_pet" "ssh_key_name" {
  prefix    = "ssh"
  separator = ""
}

resource "azapi_resource_action" "ssh_public_key_gen" {
  type        = "Microsoft.Compute/sshPublicKeys@2022-11-01"
  resource_id = azapi_resource.ssh_public_key.id
  action      = "generateKeyPair"
  method      = "POST"

  response_export_values = ["publicKey", "privateKey"]
}

resource "azapi_resource" "ssh_public_key" {
  type      = "Microsoft.Compute/sshPublicKeys@2022-11-01"
  name      = random_pet.ssh_key_name.id
  location  = azurerm_resource_group.rg.location
  parent_id = azurerm_resource_group.rg.id
}

output "key_data" {
  value = azapi_resource_action.ssh_public_key_gen.output
}
```

**File Name: variables.tf**

``` terraform
variable "resource_group_location" {
  type        = string
  default     = "centralus"
  description = "Location of the resource group."
}

variable "resource_group_name_prefix" {
  type        = string
  default     = "rg"
  description = "Prefix of the resource group name that's combined with a random ID so name is unique in your Azure subscription."
}

variable "node_count" {
  type        = number
  description = "The initial quantity of nodes for the node pool."
  default     = 2
}

variable "username" {
  type        = string
  description = "The admin username for the new cluster."
  default     = "azureadmin"
}

variable "namespace" {
  type    = string
  default = "monitoring"
}

variable "vnet_name" {
    type    = string
    default = "aks-vnet"
}

variable "subnet1_name" {
    type    = string
    default = "aks-subnet"
}

variable "subnet2_name" {
    type    = string
    default = "agfc-subnet"
}

variable "vnet_address_space" {
    type    = list(string)
    default = ["10.0.0.0/16"]
}

variable "subnet1_address_prefix" {
    type    = string
    default = "10.0.0.0/23"
}

variable "subnet2_address_prefix" {
    type    = string
    default = "10.0.2.0/24"
}
```

**File Name: outputs.tf**

``` terraform
output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "kubernetes_cluster_name" {
  value = azurerm_kubernetes_cluster.k8s.name
}

output "client_certificate" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].client_certificate
  sensitive = true
}

output "client_key" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].client_key
  sensitive = true
}

output "cluster_ca_certificate" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].cluster_ca_certificate
  sensitive = true
}

output "cluster_password" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].password
  sensitive = true
}

output "cluster_username" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].username
  sensitive = true
}

output "host" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config[0].host
  sensitive = true
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.k8s.kube_config_raw
  sensitive = true
}

output "agfcw_subnet_id" {
  value = azurerm_subnet.agfcsubnet.id
}
```

**File Name: main.tf**

``` terraform
# Generate random resource group name
resource "random_pet" "rg_name" {
  prefix = var.resource_group_name_prefix
}

resource "azurerm_resource_group" "rg" {
  location = var.resource_group_location
  name     = random_pet.rg_name.id
}

resource "random_pet" "azurerm_kubernetes_cluster_name" {
  prefix = "cluster"
}

resource "random_pet" "azurerm_kubernetes_cluster_dns_prefix" {
  prefix = "dns"
}

resource "azurerm_kubernetes_cluster" "k8s" {
  location            = azurerm_resource_group.rg.location
  name                = random_pet.azurerm_kubernetes_cluster_name.id
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = random_pet.azurerm_kubernetes_cluster_dns_prefix.id

  identity {
    type = "SystemAssigned"
  }

  default_node_pool {
    name       = "agentpool"
    vm_size    = "Standard_D2_v2"
    node_count = var.node_count
    vnet_subnet_id = azurerm_subnet.akssubnet.id
  }
  linux_profile {
    admin_username = var.username

    ssh_key {
      key_data = azapi_resource_action.ssh_public_key_gen.output.publicKey
    }
  }
  network_profile {
    network_plugin    = "azure"
    network_policy   = "azure"
    load_balancer_sku = "standard"
    service_cidr = "172.16.0.0/13"
    dns_service_ip = "172.16.0.5"
  }
}

resource "azurerm_virtual_network" "vnet" {
  name                = var.vnet_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = var.vnet_address_space
}

resource "azurerm_subnet" "akssubnet" {
  name           = var.subnet1_name
  resource_group_name = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes = [var.subnet1_address_prefix]
}

resource "azurerm_subnet" "agfcsubnet" {
  name           = var.subnet2_name
  resource_group_name = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes = [var.subnet2_address_prefix]
}
```

### Initial Terraform Deployment

Once these files are created and terraform, helm and azure cli is installed we can initialize terraform, log into azure cli by running the following command.

``` azcli
az login
```

Next we can initiate terraform to handle our deployment.

``` terraform
terraform init
```

We can now see that a .terraform folder has been created as well as a terraform lock folder. Terraform is now ready. Now we can deploy this environment

``` terraform
terraform apply
```

Terraform will now ask you to confirm that you want to deploy this environment. Type "yes" and hit enter.

Deploying the lab environment should take several minutes. This should deploy two resource groups in addition to deploying an AKS cluster, an application gateway and a vnet with two subnets in side of it.
