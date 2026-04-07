---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Bastion/Features/Feature: Native Client support"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20Bastion/Features/Feature%3A%20Native%20Client%20support"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Feature: Native Client Support for Azure Bastion

## Feature Overview

Native client support brings CLI support for the Bastion Connect experience. Users can use **Azure CLI** to connect to their Azure VMs via Bastion (instead of using the portal). The main goal is to leverage Azure Active Directory (AAD) CLI work so users can log into their AAD domain-joined VMs via Bastion.

## Limitations

TBD

## How To Deploy and Manage

### Portal

Not applicable (CLI-only feature).

### Azure CLI

[Connect to a VM using a native client](https://docs.microsoft.com/en-us/azure/bastion/connect-native-client-windows)

## Troubleshooting and Tools

### ASC (Azure Support Center)

In ASC this feature shows under Features as **"Tunneling"**.

### Log Sources (Jarvis/Logs)

ASC should always be the primary destination for log sources. If unavailable:

- **Control Plane logs**: Refer to [Control-Plane logging](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/427935/Log-Sources-For-Azure-Bastion?anchor=control-plane-logging)
- **Tenant logs**: Refer to [Tenant logging](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/427935/Log-Sources-For-Azure-Bastion?anchor=tenant-logging)
- General reference: [Log Sources for Azure Bastion](https://supportability.visualstudio.com/AzureNetworking/_wiki/wikis/Wiki/427935/Log-Sources-For-Azure-Bastion)

## Public Documentation

- [Connect to a VM using a native client and Azure Bastion](https://docs.microsoft.com/en-us/azure/bastion/connect-native-client-windows)
- [Azure CLI reference: az network bastion](https://docs.microsoft.com/en-us/cli/azure/network/bastion?view=azure-cli-latest)
