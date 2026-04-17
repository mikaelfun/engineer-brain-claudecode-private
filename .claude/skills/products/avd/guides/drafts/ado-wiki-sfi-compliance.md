---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Support Processes and Guidance/ICM process & templates/SFI Compliance"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=%2FSupport%20Processes%20and%20Guidance%2FICM%20process%20%26%20templates%2FSFI%20Compliance"
importDate: "2026-04-05"
type: troubleshooting-guide
---

In May 2024, Microsoft CEO Satya Nadella made security the company's top priority, with the Secure Future Initiative (SFI) highlighted as the way we will drive progress toward greater security and resiliency. SFI evolves how Microsoft designs, builds, tests, and operates products and services.

As part of this effort a number of new baselines are being applied to resources that may be owned by team members (Azure Subscriptions etc.). These baselines are organized by org and represent the most relevant and approved security configurations for specific technologies and environments.

### Public IP Addresses

**Background**

As part of SFI all services will be required to specify a tag when they deploy an IP address. There are two types of Service Tagging:
- Standard Service Tags which allow for pre-allocated ranges to be assigned to a specific service.
- Virtual Tags — a new level of tagging that will identify IP allocations as either first party or third party.

**Application**

The first requirement is to register the subscription for the `AllowBringYourOwnPublicIpAddress` feature. Without it you will get an error when trying to create the IP:

```
Subscription /subscriptions/.../resourceGroups//providers/Microsoft.Network/subscriptions/ is not
registered for feature Microsoft.Network/AllowBringYourOwnPublicIpAddress required to carry out the requested operation.
StatusCode: 400
ReasonPhrase: Bad Request
ErrorCode: SubscriptionNotRegisteredForFeature
```

Once enabled, confirm by checking the feature status:

```powershell
Get-AzProviderFeature -FeatureName AllowBringYourOwnPublicIpAddress -ProviderNamespace Microsoft.Network
```

Then create a tagged IP Address:

```powershell
$iptag = New-AzPublicIpTag -IpTagType "FirstPartyUsage" -Tag "/Unprivileged"
New-AzPublicIpAddress -ResourceGroupName CloudPC -Name UKFWIPAddress -AllocationMethod Static -Location uksouth -Sku Standard -IpTag $iptag
```

Confirm the tag:

```powershell
(Get-AzPublicIpAddress -Name UKFWIPAddress).IpTagsText
```

### Single Instance Virtual Machines

**Background**

The SFI program requires 1P services to plan and execute a successful migration from single instance virtual machines to Virtual Machine Scale Sets (Flex), as well as adopt other standards that will enhance the security, reliability, and performance of the service.

Benefits of migrating to VMSS Flex include: improved deployment reliability and latency at scale, improved availability and spreading across racks, reduced management overhead, batched API calls to reduce throttling quota, cost savings via Azure Autoscale, and automated security compliance through Automatic Guest Patching, OS Upgrades, and Extension Upgrades.
