---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/ARM Platform Core Concepts/Infrastructure"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FArchitecture%2FARM%20Platform%20Core%20Concepts%2FInfrastructure"
importDate: "2026-04-05"
type: troubleshooting-guide
---

[[_TOC_]]

## What is ARM?
ARM is a **distributed application** which provides Azure users with a common management platform to manage resources.

## Components (Top to bottom)
### Clouds
ARM is present in public and government clouds (Like Fairfax or Mooncake), since each Azure cloud is completely independent from the other ones, ARM is a separate instance as well.

### Regions
Azure has many datacenters across the globe grouped into regions. The ARM services are available in all Azure regions to be accessed from the users which traffic is optimal to each datacenter.

This region dynamic distribution is done by Azure Traffic Manager, which is a DNS based solution that resolves a domain to the more optimal region for the user, in the case of ARM, resolving to the public IP of the ARM service in the more optimal Azure region to the user.

For more information see [[ARM WIKI] Regions in Azure Resource Manager](https://armwiki.azurewebsites.net/introduction/concepts/regions.html).

### Azure Cloud Services and VMSS
The ARM services run in two different Azure implementations, one using Azure Classic Cloud Services and the other one using Azure Virtual Machine Scale Sets.

Although the services provided are identical in both implementations, there might be differences in behavior as the releases for both implementations are independent from each other.

Both implementations run in parallel, and calls are distributed to each one of those based on another Azure Traffic Manager service deployed to each one of the regions.

> Whether an operation is running on Cloud Services or VMSS can be determined from the **Role** column in Kusto. If it says `Razzle`, the operation ran in Cloud Services.

### Roles
Each Cloud Service or Virtual Machine Scale Set runs four different set of services.

- A **web role**: Which acts as a reverse proxy with several handlers. It provides a front door to the user calls and other ARM services as well using IIS.
- A **worker role**: Which allows ARM to run asynchronous jobs in the background. These operations go beyond what can be handled within the context of a synchronous HTTP call and therefore require additional processing.
- An **admin role**: Which is similar to the web role but is used for our internal tooling and not accessible by external users.
- A **provider role**: Which hosts all ARM owned resource providers.

### Instances
Each role consists of a load balancer and X number of instances (virtual machines) running the ARM specific code for that role. The number of instances varies depending on the size of the region.

Using the above architecture, ARM can maintain global redundancy, even if multiple instances are down, or a region is out of rotation for maintenance.

### Storage
ARM uses two main services to store data relevant to the ARM services:
- Storage Accounts
  - Tables
  - Queues
- Cosmos Databases
