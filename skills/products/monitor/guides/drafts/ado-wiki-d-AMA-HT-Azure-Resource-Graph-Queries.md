---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Monitor Agents/Azure Monitor Agent (AMA) - NEW STRUCTURE/How-To/AMA: HT: Azure Resource Graph Queries"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FMonitor%20Agents%2FAzure%20Monitor%20Agent%20(AMA)%20-%20NEW%20STRUCTURE%2FHow-To%2FAMA%3A%20HT%3A%20Azure%20Resource%20Graph%20Queries"
importDate: "2026-04-07"
type: troubleshooting-guide
---

:::template /.templates/Common-Header.md
:::

[[_TOC_]]

# Overview
This how-to will cover different scenarios in which an Azure Resource Graph query might be useful.

# Scenario: Extensions

List all **Extensions** for a specific **Machine Resource ID**:

```
resources
| where id startswith "<Machine-ResourceID>"
| where type contains "extension"
```
## Azure Diagnostics extension

List all **Azure VM Resource IDs** with the Azure Diagnostics extension (LAD/WAD) installed 

```
resources
| where type contains "extension"
| extend parsedProperties = parse_json(properties)
| extend publisher = tostring(parsedProperties.publisher)
| project-away parsedProperties
| where publisher == "Microsoft.Azure.Diagnostics"
| distinct id
```


# Scenario: Azure Network

List all **Private DNS Zones** linked to a specific **Virtual Network Resource ID**:

```
resources
| where type == 'microsoft.network/privatednszones/virtualnetworklinks'
| project dnsLinkId = id, linkedVnetId =  tolower(properties.virtualNetwork.id), dnsZoneId = tolower(tostring(split(id, '/virtualNetworkLinks')[0]))
| where linkedVnetId =~ "<Virtual-Network-ResourceID>"
```

List all **Private DNS Zones** and **DNS Records** linked to the Virtual Network for a specific **VM Resource ID**:

```
resources
|�where�id�==�'<VM-ResourceID>'
|�project�vmId�=�id,�vmName�=�name,�nicIds�=�properties.networkProfile.networkInterfaces
|�mv-expand�nicIds
|�extend�nicId�=�tostring(nicIds.id)
|�join�kind=leftouter�(
����resources
����|�where�type�==�'microsoft.network/networkinterfaces'
����|�project�nicId�=�id,�ipConfig�=�properties.ipConfigurations
����|�mv-expand�ipConfig
����|�extend�subnetId�=�tostring(ipConfig.properties.subnet.id)
����|�extend�vnetId�=�tolower(substring(subnetId,�0,�indexof(subnetId,�'/subnets/')))
)�on�nicId
|�join�kind=leftouter�(
����resources
����|�where�type�==�'microsoft.network/privatednszones/virtualnetworklinks'
����|�project�dnsLinkId�=�id,�linkedVnetId�=��tolower(properties.virtualNetwork.id),�dnsZoneId�=�tolower(tostring(split(id,�'/virtualNetworkLinks')[0]))
)�on�$left.vnetId�==�$right.linkedVnetId
|�join�kind=leftouter�(
����resources
����|�where�type�==�'microsoft.network/privatednszones'
����|�project�dnsZoneId�=�tolower(id),�dnsZoneName�=�name
)�on�dnsZoneId
|�join�kind=leftouter�(
����dnsresources
����|�where�type�in�('microsoft.network/privatednszones/a',�'microsoft.network/privatednszones/aaaa',�'microsoft.network/privatednszones/cname',�'microsoft.network/privatednszones/mx',�'microsoft.network/privatednszones/ptr',�'microsoft.network/privatednszones/srv',�'microsoft.network/privatednszones/txt')
����|�project�recordId�=�id,�recordName�=�name,�recordType�=�type,�dnsZoneId�=�tolower(substring(id,�0,�indexof(id,�'/A/'))),�properties
����|�extend�ttl�=�toint(properties.ttl),�recordValue�=�case(
��������recordType�==�'microsoft.network/privatednszones/a',�properties.records[0].ipv4Address,
��������recordType�==�'microsoft.network/privatednszones/aaaa',�properties.records[0].ipv6Address,
��������recordType�==�'microsoft.network/privatednszones/cname',�properties.record.cname,
��������recordType�==�'microsoft.network/privatednszones/mx',�properties.records[0].exchange,
��������recordType�==�'microsoft.network/privatednszones/ptr',�properties.records[0].ptrdname,
��������recordType�==�'microsoft.network/privatednszones/srv',�properties.records[0].target,
��������recordType�==�'microsoft.network/privatednszones/txt',�properties.records[0].value[0],
������� 'N/A'
��� )
)�on�dnsZoneId
|�project�vmName,�vnetId,�dnsZoneName,�recordName,�recordValue,�recordType,�recordId
|�order�by�['recordId']�asc
```

List all **network interfaces** with a specific **IP address**

```
resources
|�where�type�==�"microsoft.network/networkinterfaces"
|�where�properties�contains�"10.0.1.31"
```

# Scenario: Managed Identity
List the **objectId** of all **user managed identity** resources:

```
resources
| where type =~ "microsoft.managedidentity/userassignedidentities"
| extend objectId = tostring(properties.principalId)
| project type, objectId, id
```