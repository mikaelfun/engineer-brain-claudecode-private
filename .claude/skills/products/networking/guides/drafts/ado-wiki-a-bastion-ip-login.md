---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Features/Feature: IP Based Login"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Bastion/Features/Feature%3A%20IP%20Based%20Login"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Feature: Bastion IP Based Login

## Feature Timeline

- Private Preview: 2021-05-12
- GA: 2022-05-25

## Feature Overview

IP based login/connection allows a user to remotely connect to a virtual machine managed by an Azure Bastion host by providing the **IP address** of the target virtual machine.

Prior to this feature, customers were only able to remotely connect to a VM managed by Azure Bastion by navigating to the target VM blade in the Azure portal. This feature now allows customers to navigate to the Azure Bastion **Connect** blade and input the private IP address of the target virtual machine.

## Key Capabilities

- Connect to VMs by entering their private IP address directly in the Bastion Connect blade
- Enables Bastion to remotely access VMs created **outside of an Azure Virtual Network**, provided that the Azure Bastion host can route to the destination IP address
