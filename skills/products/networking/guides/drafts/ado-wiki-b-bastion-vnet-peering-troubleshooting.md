---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Features/Feature: VNET Peering support"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Bastion/Features/Feature%3A%20VNET%20Peering%20support"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Feature Overview

Azure Bastion and VNet peering can be used together. When VNet peering is configured, you don't have to deploy Azure Bastion in each peered VNet. This means if you have an Azure Bastion host configured in one virtual network (VNet), it can be used to connect to VMs deployed in a peered VNet without deploying an additional bastion host.

# Limitations

- This feature is not currently supported with Virtual WAN

# Troubleshooting and Tools

## ASC

Testing connectivity from the Bastion host to remote virtual network can be accomplished via the **Diagnostics** tab. The Azure Bastion Connectivity Checker will provide output similar to Connection Troubleshoot.

## Log Sources

### Jarvis > Logs

ASC should always be your primary destination for log sources. If unavailable, refer to Log Sources for Azure Bastion for the current log source examples.

For Control Plane logs, refer to existing Control-Plane logging.

For Tenant logs, refer to existing Tenant logging.

## Public Documentation

- [VNet peering and Azure Bastion architecture | Microsoft Docs](https://docs.microsoft.com/en-us/azure/bastion/vnet-peering)
