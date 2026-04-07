---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/Deploying an Azure AppGwv2 using Terraform"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FDeploying%20an%20Azure%20AppGwv2%20using%20Terraform"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Deploying an Azure Application Gateway v2 using Terraform

Steps for deploying an Azure Application Gateway v2 with HTTPS listener and modifying its configuration using Terraform.

[[_TOC_]]

## Overview

Terraform is an infrastructure as code tool that lets you build, change, and version cloud and on-prem resources safely and efficiently.

You can deploy Azure Application Gateway V2 using Terraform by following the step-by-step in Microsoft's public documentation:
https://learn.microsoft.com/en-us/azure/developer/terraform/deploy-application-gateway-v2

This is a quick start guide to deploy Application Gateway with a multi-site listener with HTTPS protocol and configuring the same listener with a different SSL certificate.

## Installing Terraform

Terraform can be used with Azure CLI and Azure PowerShell so make sure that you have Azure CLI or Azure PowerShell installed before installing Terraform.

- Install Terraform in Linux and macOS: https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli#install-terraform
- Install Terraform in Windows: https://learn.microsoft.com/en-us/azure/developer/terraform/quickstart-configure

## Sign-in to Azure using Azure CLI or Azure PowerShell

Before starting the deployment in Azure using Terraform you need to sign-in to Azure using Azure CLI or Azure PowerShell and set the subscription in which the resources are to be deployed.

Azure CLI commands:
```
az login
az account set --subscription "<subscription_id_or_subscription_name>"
```

Azure PowerShell commands:
```
Connect-AzAccount
Set-AzContext -Subscription "<subscription_id_or_subscription_name>"
```

You can also sign-in using Terraform service principal:
https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure?tabs=bash#specify-service-principal-credentials-in-a-terraform-provider-block

## Generating Self-Signed Certificate for Application Gateway

Since we will be deploying an Application Gateway with multi-site listener for HTTPS protocol, we will generate a self-signed certificate first.

The self-signed SSL certificate can be generated following:
https://learn.microsoft.com/en-us/azure/application-gateway/self-signed-certificates

1. Install OpenSSL:
   - Windows: https://slproweb.com/products/Win32OpenSSL.html
   - Ubuntu: `sudo apt-get update && sudo apt-get install openssl -y`

2. Create a new directory:
   ```
   mkdir sslcerts
   ```

3. Generate self-signed certificates:
   ```
   openssl ecparam -out root.key -name prime256v1 -genkey
   openssl req -new -sha256 -key root.key -out root.csr
   openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -out root.crt
   openssl ecparam -out server.key -name prime256v1 -genkey
   openssl req -new -sha256 -key server.key -out server.csr
   openssl x509 -req -in server.csr -CA root.crt -CAkey root.key -CAcreateserial -out server.crt -days 365 -sha256
   ```

4. Convert CRT to PFX:
   ```
   openssl pkcs12 -export -out server.pfx -inkey server.key -in server.crt -certfile root.crt
   ```

## Deploying Application Gateway and Dependencies using Terraform

1. Create a new directory:
   ```
   mkdir terraform-deployment
   cd terraform-deployment
   ```

2. Create `providers.tf`:
   ```hcl
   terraform {
     required_version = ">=1.2"
     required_providers {
       azurerm = {
         source  = "hashicorp/azurerm"
         version = "~> 3.0"
       }
       random = {
         source = "hashicorp/random"
         version = "~> 3.0"
       }
     }
   }

   provider "azurerm" {
     features {}
   }
   ```

3. Create `main.tf` with AppGW v2 Standard_v2 SKU, HTTPS listener, SSL certificate, backend pool with 2 Windows VMs, and NIC associations.

4. Create `variables.tf`:
   ```hcl
   variable "backend_address_pool_name" { default = "myBackendPool" }
   variable "frontend_port_name" { default = "myFrontendPort" }
   variable "frontend_ip_configuration_name" { default = "myAGIPConfig" }
   variable "http_setting_name" { default = "myHTTPsetting" }
   variable "listener_name" { default = "myListener" }
   variable "request_routing_rule_name" { default = "myRoutingRule" }
   ```

5. Create `outputs.tf`:
   ```hcl
   output "gateway_frontend_ip" {
     value = "http://${azurerm_public_ip.pip.ip_address}"
   }
   ```

6. Initialize and deploy:
   ```
   terraform init -upgrade
   terraform plan -out main.tfplan
   terraform apply main.tfplan
   ```

## Modifying SSL Certificate on an Existing Listener

After deployment, you can update the SSL certificate on a listener using Terraform by:

1. Generating a new self-signed certificate or obtaining one from a CA.
2. Converting to PFX format.
3. Updating the `ssl_certificate` block in `main.tf` with the new certificate path and password.
4. Running `terraform plan` and `terraform apply` to apply the change.

> **Note**: The listener `host_name` must match the Common Name (CN) of the SSL certificate.
