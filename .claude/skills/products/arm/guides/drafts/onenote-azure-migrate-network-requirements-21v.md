# Azure Migrate Appliance Network Requirements - Mooncake (21Vianet)

## Overview
Required URLs/endpoints for Azure Migrate appliance connectivity in Azure China (21Vianet).

Source: [Azure Migrate appliance - Azure China URLs](https://docs.microsoft.com/en-us/azure/migrate/migrate-appliance#azure-china-21vianet-azure-china-urls)

## Required URLs

| URL | Details |
|-----|---------|
| `*.portal.azure.cn` | Navigate to the Azure portal |
| `graph.chinacloudapi.cn` | Sign in to your Azure subscription |
| `login.microsoftonline.cn` | Access control and identity management by Azure AD |
| `management.chinacloudapi.cn` | Resource deployments and management operations |
| `*.services.visualstudio.com` | Upload appliance logs (internal monitoring) |
| `*.vault.chinacloudapi.cn` | Manage secrets in Azure Key Vault |
| `aka.ms/*` | Download and install latest updates for appliance services |
| `download.microsoft.com/download` | Downloads from Microsoft download center |
| `*.servicebus.chinacloudapi.cn` | Communication between appliance and Azure Migrate service |
| `*.discoverysrv.cn2.windowsazure.cn` | Connect to Azure Migrate service URLs |
| `*.cn2.prod.migration.windowsazure.cn` | Connect to Azure Migrate service URLs |
| `*.cn2.hypervrecoverymanager.windowsazure.cn` | VMware agentless migration - Azure Migrate service URLs |
| `*.blob.core.chinacloudapi.cn` | VMware agentless migration - Upload data to storage |
| `*.applicationinsights.azure.cn` | Upload appliance logs (internal monitoring) |

## Notes
- Ensure all URLs are whitelisted in customer's firewall/proxy
- These endpoints are specific to Azure China (Mooncake) and differ from Global Azure
- For VMware agentless migration, the `*.cn2.hypervrecoverymanager.windowsazure.cn` and `*.blob.core.chinacloudapi.cn` endpoints are critical

## Tags
azure-migrate, network, firewall, 21v, mooncake, appliance
