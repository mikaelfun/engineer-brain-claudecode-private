---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Terraform/Core Functionality"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FTerraform%2FCore%20Functionality"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## What is Terraform?
[[TF] Hashicorp Terraform](https://www.terraform.io/) is an open-source IaC (Infrastructure-as-Code) tool for provisioning and managing cloud infrastructure. It codifies infrastructure in configuration files that describe the desired state for your topology. Terraform enables the management of any infrastructure - such as public clouds, private clouds, and SaaS services - by using [[TF] Terraform providers](https://www.terraform.io/language/providers).

## How does Terraform work?
Terraform creates and manages resources on cloud platforms and other services through their application programming interfaces (APIs). Providers enable Terraform to work with virtually any platform or service with an accessible API.

## Terraform Configuration Files
Configuration files in Terraform language tell Terraform what plugins to install, what infrastructure to create, and what data to fetch. Terraform language also lets users define dependencies between resources and create multiple similar resources from a single configuration block.

Blocks are containers for other content and usually represent the configuration of some kind of object, like a resource. Blocks have a block type, can have zero or more labels, and have a body that contains any number of arguments and nested blocks. Most of Terraform's features are controlled by top-level blocks in a configuration file.

```
<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
    #Block body
    <IDENTIFIER> = <EXPRESSION> # Argument
}
```
Example of a block structure to define a resource group:
```
resource "azurerm_resource_group" "rg" {
  name     = "TF_ResourceGroup"
  location = "westus2"
  tags = {
    Environment = "Terraform Getting Started"
    Team        = "DevOps"
  }
}
```
---

**Arguments** assign a value to a name. They appear within blocks.

**Expressions** represent a value, either literally or by referencing and combining other values. They appear as values for arguments, or within other expressions.

The Terraform language is declarative, describing an intended goal rather than the steps to reach that goal. The ordering of blocks and the files they are organized into are generally not significant; Terraform only considers implicit and explicit relationships between resources when determining an order of operations.

## Providers
A provider is a plugin that Terraform uses to create and manage your resources.

For all available providers check [[TF] Browse Providers | Terraform Registry](https://registry.terraform.io/browse/providers) which most of them provide community support.

## Modules
A module is a container for multiple resources that are used together. Users can leverage modules to create lightweight abstractions, so that they can describe the infrastructure structure in terms of its architecture, rather than directly in terms of physical objects.

In a simple Terraform configuration with only one root module, users create a flat set of resources and use Terraform's expression syntax to describe the relationships between these resources.

When module blocks are introduced, the configuration becomes hierarchical rather than flat: each module contains its own set of resources, and possibly its own child modules.

To *call* a module means to include the contents of that module into the configuration with specific values for its input variables:

```
module "servers" {
  source = "./app-cluster"
  servers = 5
}
```

In most cases it is strongly recommended to keep the module tree flat, with only one level of child modules.

## State
Terraform must store state about the managed infrastructure and configuration. This state is used by Terraform to map real world resources to the configuration, keep track of metadata, and to improve performance on large infrastructures.

This state is stored by default in a local file named `terraform.tfstate`, but it can also be stored remotely, which works better in a team environment.

Terraform uses this local state to create plans and make changes to the infrastructure. Prior to any operation, Terraform does a refresh to update the state with the real infrastructure.

## Terraform main commands

### Terraform init
Run the `terraform init` command to initialize a working directory that contains a Terraform configuration. Initialization performs several tasks to prepare a directory, including accessing state in the configured backend, downloading and installing provider plugins, and downloading modules.

### Terraform plan
The `terraform plan` command creates an execution plan, which lets the user preview the changes that Terraform plans to make to the infrastructure. By default, when Terraform creates a plan it:
- Reads the current state of any already-existing remote objects to make sure that the Terraform state is up to date.
- Compares the current configuration to the prior state and noting any differences.
- Proposes a set of change actions that should, if applied, make the remote objects match the configuration.

### Terraform apply
The `terraform apply` command executes the actions proposed in a Terraform plan.

### Terraform destroy
The `terraform destroy` command is a convenient way to destroy all remote objects managed by a particular Terraform configuration.
