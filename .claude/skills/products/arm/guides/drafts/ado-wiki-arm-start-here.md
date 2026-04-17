---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Start Here"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20(ARM)%2FStart%20Here"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

![10007-icon-Resource Groups-General.svg](/.attachments/10007-icon-Resource%20Groups-General-7f33e64c-0288-460b-8f42-7a93d1c9d104.svg =100x)

## What is Azure Resource Manager?
Azure Resource Manager is the gatekeeper for Azure. It hosts the `management.azure.com` API endpoints, where all clients (including the Azure Portal), would reach out to perform any management operations related to Azure Resources (create/update/read/delete and even actions e.g starting/stopping a VM). 

ARM acts as a proxy that redirects requests to the specific resource providers for each service, but apart from acting as a proxy, ARM is a service layer that also provides functionality like ARM templates processing, RBAC and Policy evaluation, resource locks, tags and even caching.

## Where do I get started learning?
You can go to the Azure Resource Manager [Training](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623800/) page.

## Where do I get started troubleshooting?
### Permissions required
From [CoreIdentity](https://aka.ms/coreidentity):
- Join the ARM CSS entitlement

### Browse by Support Area Path
todo
### Browse TSGs
todo

#### Configuration
todo
#### Logs
todo
### Browse Scenarios
todo

## SME channel
[[TEAMS] [ARM] Azure Resource Manager](https://teams.microsoft.com/l/channel/19%3a02a68c1dc756494aa2651843bad13baf%40thread.skype/%255BARM%255D%2520Azure%2520Resource%2520Manager?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

## Daily triage calendar invites
### APAC
Monday through Friday, 7:30 UTC.

### EMEA
Monday through Friday, 10:00 UTC.

### AMER
Monday through Friday, 15:30 UTC.

## IcM paths
| Description | Path/Link |
|-------------|------|
| IcM for ARM issues (Sev 3 & 4) | [[IcM] Support/EEE-ARM](http://aka.ms/EEECRI-ARM) |
| IcM for ARM issues (Sev 2 & 1) | [[IcM] Windows Azure Operations Center/WASU](http://aka.ms/CXPCRI-ARM) | 
| IcM for Terraform/PowerShell/CLI issues | [[IcM] Azure CLI Tools - Azure CLI, PowerShell and Terraform/Triage](http://aka.ms/terraformIcM) | 
| IcM for Azure SDK issues | [[IcM] Azure SDK/Triage](https://aka.ms/AzureManagementAPI_ICM) | 

## Contacts
- [CSS] TA leads and SMEs available through ARM Teams channel
- [PG] EEE team for escalations
- [PG] PM contacts for specific areas: Templates/Deployments, ARM core, Tags, Private link/Resource changes/ARM replication, Terraform
- [PG] DOCS team for documentation issues
