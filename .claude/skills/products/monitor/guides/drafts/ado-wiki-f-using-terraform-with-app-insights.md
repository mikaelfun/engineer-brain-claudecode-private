---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/How-To/Code Samples and Lab Walkthroughs/Lab Walkthroughs/Using Terraform with Application Insights"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/How-To/Code%20Samples%20and%20Lab%20Walkthroughs/Lab%20Walkthroughs/Using%20Terraform%20with%20Application%20Insights"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Using Terraform with Application Insights

Walkthrough on the basics of setting up Terraform environment and working with Application Insights resources through Terraform deployment. Creates a Resource Group, Log Analytics workspace, and Application Insights component.

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli-windows?tabs=azure-cli)
- [Visual Studio Code](https://code.visualstudio.com/Download)

## Installing Terraform

1. Download Terraform and unzip to a location (e.g., `C:\Terraform`)
2. Add Terraform to Environment Variables:
   - Open **Edit system environment variables** > **Environment Variables**
   - Select **Path** variable > **Edit** > **New** > enter the Terraform folder path
   - Click OK to apply
3. Verify: open cmd and run `terraform --version`

## Setting up Files

Create a working directory with 4 files:

### provider.tf

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.81.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}
```

### main.tf

```hcl
resource "azurerm_resource_group" "example" {
  name     = "TerraformLab-Test"
  location = "EastUS"
}

resource "azurerm_log_analytics_workspace" "example" {
  name                = "TerraformLab-Test"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

resource "azurerm_application_insights" "example" {
  name                                  = var.application_insights_settings[0].name
  location                              = azurerm_resource_group.example.location
  resource_group_name                   = azurerm_resource_group.example.name
  workspace_id                          = azurerm_log_analytics_workspace.example.id
  application_type                      = "web"
  internet_ingestion_enabled            = var.application_insights_settings[0].internet_ingestion_enabled
  internet_query_enabled                = var.application_insights_settings[0].internet_query_enabled
  disable_ip_masking                    = var.application_insights_settings[0].disable_ip_masking
  daily_data_cap_in_gb                  = var.application_insights_settings[0].daily_data_cap_in_gb
  daily_data_cap_notifications_disabled = var.application_insights_settings[0].daily_data_cap_notifications_disabled
  retention_in_days                     = var.application_insights_settings[0].retention_in_days
  sampling_percentage                   = var.application_insights_settings[0].sampling_percentage
}
```

### variables.tf

```hcl
variable "application_insights_settings" {
  description = "List of settings for Application Insights component"
  type = list(object({
    name                                  = string
    require_new_resource_group            = bool
    resource_group_name                   = string
    resource_group_location               = string
    application_type                      = string
    daily_data_cap_in_gb                  = number
    daily_data_cap_notifications_disabled = bool
    retention_in_days                     = number
    sampling_percentage                   = number
    disable_ip_masking                    = bool
    workspace_id                          = string
    local_authentication_disabled         = bool
    internet_ingestion_enabled            = bool
    internet_query_enabled                = bool
    force_customer_storage_for_profiler   = bool
  }))
  default = [
    {
      name                                  = "TerraformLab-Test"
      require_new_resource_group            = true
      resource_group_name                   = "TerraformLab-Test"
      resource_group_location               = "EastUS"
      application_type                      = "web"
      daily_data_cap_in_gb                  = 100
      daily_data_cap_notifications_disabled = false
      retention_in_days                     = 90
      sampling_percentage                   = 100
      disable_ip_masking                    = false
      workspace_id                          = ""
      local_authentication_disabled         = false
      internet_ingestion_enabled            = true
      internet_query_enabled                = true
      force_customer_storage_for_profiler   = false
    }
  ]
}
```

### output.tf

```hcl
output "instrumentation_key" {
  value     = azurerm_application_insights.example.instrumentation_key
  sensitive = true
}
output "app_id" {
  value = azurerm_application_insights.example.app_id
}
```

## Workflow

1. Log into Azure CLI: `az login`
2. `terraform.exe init` — initialize providers
3. `terraform.exe plan` — preview what will be created/modified
4. `terraform.exe apply` — create the resources (confirm when prompted)

**Optional**: `terraform destroy` to tear down the environment when done.

## Public Documentation

- Terraform registry: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_insights

Last Modified: 1/30/2024
