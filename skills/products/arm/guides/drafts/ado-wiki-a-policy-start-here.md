---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Start Here"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FStart%20Here"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## What is Azure Policy?
Azure Policy is a service for governance. It lets security administrators specify specific configurations the resources in the environment must comply according to the specific needs of the business.

Azure Policy works based on the properties of the resources, and it evaluates the resource configurations against the rules configured in the Azure Policy settings. It can be used as an audit mechanism, but also it can prevent non-compliant changes. In some scenarios, Azure Policy can also adjust a resource configuration to make it compliant according to the administrators expected results.

## Where do I get started learning?
You can go to the Azure Policy [Training](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623708/) page.

## Where do I get started troubleshooting?
Review the [[Process] Support scope and collaboration scenarios](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623682/).

### Permissions required
#### Public cloud
From [CoreIdentity](https://aka.ms/coreidentity):
- Join the ARM CSS entitlement

#### Fairfax/US Gov
Please follow [Access to restricted data in Fairfax/US Gov](https://azuresupportcenterdocs.azurewebsites.net/supportengineer/AccessRestrictions.html#access-to-restricted-data-in-fairfaxus-gov).

### Browse by Support Area Path
- [[SAP] Azure Policy/Authoring a Policy/Writing a policy definition](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623699/)
- [[SAP] Azure Policy/Authoring a Policy/Debugging a Policy](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623698/)
- [[SAP] Azure Policy/Authoring a Policy/Assistance with Aliases](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623697/)
- [[SAP] Azure Policy/Issues when assigning a Policy/Issues when assigning a Policy](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623701/)
- [[SAP] Azure Policy/Operation blocked by Policy/Operation blocked by Policy](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623703/)
- [[SAP] Azure Policy/Policy behavior not as expected/Compliance state and details not as expected](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623705/) 
- [[SAP] Azure Policy/Policy behavior not as expected/Policy enforcement not as expected](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623706/)

### Browse TSGs
- [[TSG] Condition checklist](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623711/)
- [[TSG] Find the right alias](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623713/)
- [[TSG] Get the right resource payload](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623716/)

#### Configuration
[[TSG] Get customer configuration](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623714/)
#### Logs
[[TSG] Get customer logs](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623715/)

### Browse Scenarios
- [Deleted resource is scanned by Policy | Resource not found](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623685/)
- [Non taggable resources scanned in indexed mode](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623686/)
- [Policy compliance shows no resources](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623687/)
- [Policy deployment fails](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623688/)
- [SQL master DB not scanned](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623691/)

## SME channel
[[TEAMS] [ARM] Azure Policy](https://teams.microsoft.com/l/channel/19%3a5b312c9bf8dc4cdbb788d0617aa05cf5%40thread.skype/%255BARM%255D%2520Azure%2520Policy?groupId=8a6a0fe1-0d7d-41a0-93f0-0fd7af9ac2c8&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47)

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
| IcM for Policy issues (including Dataplane issues)| [[IcM] Azure Policy/Azure Policy Triage On-Call](https://aka.ms/AzurePolicy-ICM) | 

## Supportability requests
See [[Process] Supportability request process](https://dev.azure.com/supportability/AzureDev/_wiki/wikis/Dev_ARM/1623683/).
