---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/Platform and Tools/Tools/Kusto/End to End AKS Cluster Provisioning and Deep Dive Tracing"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=/Azure%20Kubernetes%20Service%20Wiki/AKS/Platform%20and%20Tools/Tools/Kusto/End%20to%20End%20AKS%20Cluster%20Provisioning%20and%20Deep%20Dive%20Tracing"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# End-to-End AKS Cluster Provisioning and Deep-Dive Tracing

[[_TOC_]]

## Introduction

> This wiki provides a focused walkthrough of AKS cluster creation tracing, highlighting how to follow operations across Azure Resource Manager (ARM) and Resource Providers. It combines practical session steps and architectural diagrams [EE - ARM.vsdx](https://microsofteur-my.sharepoint.com/:u:/g/personal/mhedhbisaber_microsoft_com/IQC3MPMwUp6uT4UpJRfxtUR4AVdwiM9dEsy9kF5okKJDy8s?e=19kfwb) to help you quickly understand, audit, and troubleshoot the AKS provisioning process.
> I began by creating a new AKS cluster using the following command:

```text
> az aks create
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 2 \
  --generate-ssh-keys
```

> Now, let's trace the AKS creation step by step:

## Part I: ARM (Azure Resource Manager)

### Introduction

> ARM serves as _Azure\'s unified control plane_, _required for all Azure services_ . It provides a single endpoint for customers to perform **CRUD** (create, retrieve, update, and delete) operations consistently _across any Azure service or resource type._

### 1. HttpIncomingRequests

> This Table will have call logs which **came into ARM**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpIncomingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where httpMethod notcontains "GET"
| where commandName contains "aks create" // For Tracing AKS creation operation for example
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, commandName, parameterSetName, userAgent, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
```

<table>
<colgroup>
<col style="width: 4%" />
<col style="width: 11%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 3%" />
<col style="width: 7%" />
<col style="width: 12%" />
<col style="width: 5%" />
<col style="width: 18%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 3%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeSta mp</th>
<th style="text-align: left;"><blockquote>
<p>operationName</p>
</blockquote></th>
<th>httpMetho d</th>
<th>httpStatusC ode</th>
<th>correlationId</th>
<th>serviceRequestId</th>
<th><blockquote>
<p>clientApplicationI d</p>
</blockquote></th>
<th style="text-align: center;"><blockquote>
<p>commandN ame</p>
</blockquote></th>
<th><blockquote>
<p>parameterSetName</p>
</blockquote></th>
<th><blockquote>
<p>userAgent</p>
</blockquote></th>
<th><blockquote>
<p>principalOid</p>
</blockquote></th>
<th><blockquote>
<p>targetUri</p>
</blockquote></th>
<th><blockquote>
<p>failureCau se</p>
</blockquote></th>
<th><blockquote>
<p>subscriptionId</p>
</blockquote></th>
<th><blockquote>
<p>clientSessi onId</p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:</p>
<p>52:51.2474709Z</p></td>
<td style="text-align: left;"><blockquote>
<p><strong><mark>PUT</mark></strong>/SUBSCRIPTIONS/RESOURCEGROU
PS/PROVIDERS/MICROSOFT.CONTAINE RSERVICE/MANAGEDCLUSTERS/</p>
</blockquote></td>
<td>PUT</td>
<td>-1</td>
<td><p>17818e60-7ddc-4 c69-</p>
<p>b5de-03c27724da 9d</p></td>
<td></td>
<td></td>
<td style="text-align: center;">aks create</td>
<td><blockquote>
<p>--resource-group -- name --node-count -- generate-ssh-keys</p>
</blockquote></td>
<td><blockquote>
<p>AZURECLI/2.79.0 (RPM) azsdk-python- core/1.35.0 Python/3.12.9
(Linux-6.1.91.1- microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://management.azure.com:443/subscriptions/28abb06e-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>c75e-47f2-ba8d-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Mic</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rosoft.ContainerService/managedClusters/myAKSCluster?api-</u></a></p>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>version=2025-08-01</u></a></p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>28abb06e-</p>
<p>c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
<td></td>
</tr>
<tr>
<td><p>2025-11-28T11:</p>
<p>52:59.1749254Z</p></td>
<td style="text-align: left;"><blockquote>
<p><strong>PUT</strong>/SUBSCRIPTIONS/RESOURCEGROU
PS/PROVIDERS/MICROSOFT.CONTAINE RSERVICE/MANAGEDCLUSTERS/</p>
</blockquote></td>
<td>PUT</td>
<td>201</td>
<td><p>17818e60-7ddc-4 c69-</p>
<p><mark>b5de-03c27724da</mark> 9d</p></td>
<td><p>6df685b8-5985-4a</p>
<p>36-8a00-7233bda</p>
<p>89377</p></td>
<td><blockquote>
<p>b677c290-</p>
<p>cf4b-4a8e-</p>
<p>a60e-91ba650a4a be</p>
</blockquote></td>
<td style="text-align: center;"><strong>aks create</strong></td>
<td><blockquote>
<p><strong>--resource-group -- name --node-count --
<mark>generate-ssh-keys</mark></strong></p>
</blockquote></td>
<td><blockquote>
<p><strong>AZURECLI</strong>/2.79.0 (RPM) azsdk-python- core/1.35.0
Python/3.12.9 (Linux-6.1.91.1- microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p>
</blockquote></td>
<td><blockquote>
<p>21dfbf8c- a408-491c-</p>
<p>bc3d-6d8b88cb61 69</p>
</blockquote></td>
<td><blockquote>
<p><a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://management.azure.com:443/subscriptions/28abb06e-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>c75e-47f2-ba8d-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Mic</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rosoft.ContainerService/managedClusters/myAKSCluster?api-</u></a>
<a
href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>version=2025-08-01</u></a></p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>28abb06e-</p>
<p>c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
<td></td>
</tr>
</tbody>
</table>

> From the Table above:
    - _Operation Name_: PUT /SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/
    - _Command Executed_: aks create --resource-group --name --node-count --generate-ssh-keys
    - _User Agent_: AZURECLI/2.79.0  The operation was triggered via Azure CLI.
    - _Target URI_: Points to the managed cluster resource in Azure.
    - _Correlation Id_: is the correlation ID for the cluster creation operation (correlationId = 17818e60-7ddc-4c69-b5de-03c27724da9d)
>
> Now, let's see who created the cluster and which tools were used based on the Claims column information. To do, we will use the **EventServiceEntries** Table.

### 2. EventServiceEntries

> This Table will have Activity logs which is **also viewable on portal**.
> Important: **EventServiceEntries** table has a Claims column _that contains the_ username/AppID _from which the operation was performed._
> As mentioned above, we can identify the correlation ID for the cluster creation operation from the HttpIncomingRequests table . The correlation ID for the cluster creation operation is correlationId = 17818e60-7ddc-4c69-b5de-03c27724da9d

```text
macro-expand isfuzzy=true cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd').ARMProdEG as X (
    X.database('Requests').EventServiceEntries
 | where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
    | where PreciseTimeStamp > ago(1d)
    | where operationName == "Microsoft.ContainerService/managedClusters/write"
| where resourceProvider == "Microsoft.ContainerService"
| extend SourceRun = case
                    (
                        applicationId == "c44b4083-3bb0-49c1-b47d-974e53cbdf3c",
                        "Azure Portal",
                        applicationId == "04b07795-8ddb-461a-bbee-02f9e1bf7b46",
                        "Azure CLI",
                        applicationId == "1950a258-227b-4e31-a9cf-717495945fc2",
                        "Azure PowerShell",
                        applicationId == "7f59a773-2eaf-429c-a059-50fc5bb28b44",
                        "Microsoft docs",
                        applicationId == "0c1307d4-29d6-4389-a11c-5cbe7f65d7fa",
                        "Azure Mobile APP",
                        applicationId == "b677c290-cf4b-4a8e-a60e-91ba650a4abe",
                        "Cloud Shell in Azure Portal",
                        applicationId == "b1395854-dccf-4fe6-9186-655f101f919b",
                        "shell.azure.com",
                        applicationId == "7319c514-987d-4e9b-ac3d-d38c4f427f4c",
                        "AKS RP APP",
                        applicationId == "aebc6443-996d-45c2-90f0-388ff96faa56",
                        "VS Code",
                        applicationId == "61d65f5a-6e3b-468b-af73-a033f5098c5c",
                        "Azure Java Tools",
                        applicationId == "Windows Admin Center(WAC)",
                        "3aa85724-c5ce-42f5-b7f9-36b5a387b7b4",
                        applicationId == "245e1dee-74ef-4257-a8c8-8208296e1dfd",
                        "Cloud Shell in Windows Terminal",
                        "Client application or others"
                    )
| project
   PreciseTimeStamp,
   operationName,
   resourceProvider,
   correlationId,
   status,
   subStatus,
   resourceUri,
   eventName,
   operationId,
   armServiceRequestId,
   subscriptionId,
   applicationId,
   SourceRun,
   claims
| sort by PreciseTimeStamp desc nulls last
)
| where status == "Accepted"
| where subStatus == "Created"
| extend claims = parse_json(claims)
| extend creatorName = claims.name
| project correlationId, SourceRun, creatorName, PreciseTimeStamp
```

  <table>
  <colgroup>
  <col style="width: 6%" />
  <col style="width: 6%" />
  <col style="width: 4%" />
  <col style="width: 29%" />
  <col style="width: 8%" />
  <col style="width: 8%" />
  <col style="width: 3%" />
  <col style="width: 4%" />
  <col style="width: 5%" />
  <col style="width: 22%" />
  </colgroup>
  <thead>
  <tr>
  <th>PreciseTimeStamp</th>
  <th>operationName</th>
  <th>suboperationName</th>
  <th>targetURI</th>
  <th>correlationID</th>
  <th>operationID</th>
  <th>region</th>
  <th>msg</th>
  <th>durationInMilliseconds</th>
  <th>userAgent</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td>2025-11-28T11:52:59.0868319Z</td>
  <td>Cloud Shell in Azure Portal</td>
  <td>None</td>
  <td>N/A</td>
  <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
  <td>N/A</td>
  <td>N/A</td>
  <td>Saber MHEDHBI</td>
  <td>N/A</td>
  <td>N/A</td>
  </tr>
  </tbody>
  </table>

> To determine who performed an operation within a customer\'s subscription, please refer to the  TSG _Who-Performed-Operation_Tool_
>
> NB: _When everything works fine, the content of Incoming (_HttpIncomingRequests_) and Outgoing (_HttpOutgoingRequests_) tables **should be equal.** If instead an operation is only seen in Incoming requests, it means that it wasn\'t processed further by the ARM frontend_
>

### 3. HttpOutgoingRequests

> HttpOutgoingRequests Table will have call logs which **go out of ARM to RPs**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/"
| where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
| sort by PreciseTimeStamp asc
```

  <table>
  <colgroup>
  <col style="width: 5%" />
  <col style="width: 14%" />
  <col style="width: 3%" />
  <col style="width: 3%" />
  <col style="width: 7%" />
  <col style="width: 7%" />
  <col style="width: 6%" />
  <col style="width: 6%" />
  <col style="width: 29%" />
  <col style="width: 3%" />
  <col style="width: 6%" />
  <col style="width: 3%" />
  </colgroup>
  <thead>
  <tr>
  <th>PreciseTimeStamp</th>
  <th><blockquote>
  <p>operationName</p>
  </blockquote></th>
  <th><blockquote>
  <p>httpMetho d</p>
  </blockquote></th>
  <th><blockquote>
  <p>httpStatusC ode</p>
  </blockquote></th>
  <th><blockquote>
  <p>correlationId</p>
  </blockquote></th>
  <th><blockquote>
  <p><strong><mark>serviceRequestId</mark></strong></p>
  </blockquote></th>
  <th><blockquote>
  <p>clientApplicationId</p>
  </blockquote></th>
  <th>principalOid</th>
  <th>targetUri</th>
  <th>failureCaus e</th>
  <th>subscriptionId</th>
  <th>clientSessio nId</th>
  </tr>
  </thead>
  <tbody>
  <tr>
  <td><p>2025-11-28T11:52:</p>
  <p>52.7329156Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>b677c290-cf4b-4a8e- a60e-91ba650a4abe</p>
  </blockquote></td>
  <td>21dfbf8c-a408-491c- bc3d-6d8b88cb6169</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <u><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01">bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClust</a>e</u></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rs/myAKSCluster?api-version=2025-08-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T11:52:</p>
  <p>58.9867455Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>201</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p><strong>6df685b8-5985-4a36-8 a00-7233bda89377</strong></p>
  </blockquote></td>
  <td><blockquote>
  <p>b677c290-cf4b-4a8e- a60e-91ba650a4abe</p>
  </blockquote></td>
  <td>21dfbf8c-a408-491c- bc3d-6d8b88cb6169</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluste</u></a></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01"><u>rs/myAKSCluster?api-version=2025-08-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>47.5926165Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>47.7935831Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a></p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>52.9883516Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>f4223b6e-aed3-4e60- be72-dadd45637c6e</p>
  </blockquote></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluste</u></a>r
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:03:</p>
  <p>53.0808420Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>f4223b6e-aed3-4e60- be72-dadd45637c6e</p>
  </blockquote></td>
  <td><blockquote>
  <p>6c1361c1-056d-42f7-</p>
  <p>a303-0cf8cfa8960e</p>
  </blockquote></td>
  <td><p>4561fa45-58c8-4f19-9c</p>
  <p>04-ee509c6733b5</p></td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedCluster</u></a></p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2021-07-01"><u>s/myAKSCluster?api-version=2021-07-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>05.5130158Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>05.7526374Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>-1</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>10.4262703Z</p></td>
  <td style="text-align: left;"><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>1b4df55e-8791-4451-9b</p>
  <p>63-63e7b3549547</p>
  </blockquote></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r
  <a
  href="https://rp.francecentral.ig.prod-aks.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  <tr>
  <td><p>2025-11-28T12:35:</p>
  <p>10.5543741Z</p></td>
  <td><blockquote>
  <p>PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDE
  RS/MICROSOFT.CONTAINERSERVICE/MANAGEDCL</p>
  <p>USTERS/</p>
  </blockquote></td>
  <td><blockquote>
  <p>PUT</p>
  </blockquote></td>
  <td><blockquote>
  <p>200</p>
  </blockquote></td>
  <td><blockquote>
  <p>17818e60-7ddc-4c69-</p>
  <p>b5de-03c27724da9d</p>
  </blockquote></td>
  <td><blockquote>
  <p>1b4df55e-8791-4451-9b</p>
  <p>63-63e7b3549547</p>
  </blockquote></td>
  <td><blockquote>
  <p>42f6d500-765e-4259-</p>
  <p>baf0-5e5b4a22f26d</p>
  </blockquote></td>
  <td>8ca9b6bc-05cf-4f3a- abe2-b9b987092eec</td>
  <td><p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-</u></a>
  <a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedCluste</u></a>r</p>
  <p><a
  href="https://management.azure.com:443/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/ManagedClusters/myAKSCluster?api-version=2022-06-01"><u>s/myAKSCluster?api-version=2022-06-01</u></a></p></td>
  <td></td>
  <td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
  <td></td>
  </tr>
  </tbody>
  </table>

Important:
**ServiceRequestId** is the ID that RP\'s send back to ARM after accepting the request. _\[serviceRequestId = 6df685b8-5985-4a36-8a00-7233bda89377\]_

## Part II: AKS RP

### Introduction

> AKS RP stands for **Azure Kubernetes Service Resource Provider**. It is the **service component registered with Azure Resource Manager (ARM)** that handles all API requests for AKS clusters operations CRUD.
> **The AKS RP uses the namespace Microsoft.ContainerService in ARM.**
>
> The RP exposes a **REST API contract** that defines operations like Create, Read, Update, and Delete (CRUD) for AKS clusters. These operations are documented in the Azure REST API specs.
>
> **Cluster Lifecycle Management**:
>
> - Validates client requests.
> - Persists the desired state of the cluster in its database.
> - Orchestrates asynchronous operations to bring Azure resources (VMs, networking, storage) into the desired state.
> - Manages control plane resources through components like the OverlayManager.
>
>
> Before we start, please note the key difference between Correlation ID and Operation ID:
>
> - **Correlation ID**: Groups multiple related operations under one logical transaction for observability.
> - **Operation ID**: Tracks a single operation instance for status and lifecycle management.
>
> **Important**: _ServiceRequestId_ in the ARM HttpOutgoingRequests table **equals** _OperationID_ in AKS RP QoS tables (FrontEndQoSEvents, AsyncQoSEvents) **equals** _OperationID_ in AKS RP Verbose tables (FrontEndContextActivity, AsyncContextActivity)

### 1. IncomingRequestTrace

> This table contains summary of calls that come into **AKS RP from ARM**.

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","HttpOutgoingRequests")
| where PreciseTimeStamp > ago(1d)
| where subscriptionId == "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where targetUri contains "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster"
| where operationName == "PUT/SUBSCRIPTIONS/RESOURCEGROUPS/PROVIDERS/MICROSOFT.CONTAINERSERVICE/MANAGEDCLUSTERS/"
| where correlationId == "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, httpMethod, httpStatusCode, correlationId, serviceRequestId, clientApplicationId, principalOid, targetUri, failureCause, subscriptionId, clientSessionId
| sort by PreciseTimeStamp asc
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 4%" />
<col style="width: 29%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 4%" />
<col style="width: 5%" />
<col style="width: 22%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th>suboperationN ame</th>
<th>targetURI</th>
<th>correlationID</th>
<th>operationID</th>
<th>region</th>
<th>msg</th>
<th>durationInMillise conds</th>
<th>userAgent</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:52:52.</p>
<p>7393534Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest Start</td>
<td>na</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:52.</p>
<p>7393534Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest Start</td>
<td>na</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:58.</p>
<p>9852284Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest End</td>
<td>6245</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
<tr>
<td><p>2025-11-28T11:52:58.</p>
<p>9852284Z</p></td>
<td>PutManagedClusterH andler.PUT</td>
<td>None</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters</p>
<p>/myAKSCluster?api-version=2025-08-01</p></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>6df685b8-5985-4a36-8a00-</p>
<p>7233bda89377</p></td>
<td>francecentr al</td>
<td>RPHttpRequest End</td>
<td>6245</td>
<td><p>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9</p>
<p>(Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38)
cloud-shell/1.0</p></td>
</tr>
</tbody>
</table>

### 2. FrontEndQoSEvents and FrontEndContextActivity

> These tables have logs related to _Container Service RP_:
>
> FrontEndQoSEvents table - Will have summary of all the operations that reach _Container Service_ code of AKS RP. This is where most the frontend validations takes place.

```text
cluster('akshuba.centralus').database('AKSprod').FrontEndQoSEvents
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "GET"
| project PreciseTimeStamp, operationName, suboperationName, correlationID, operationID, agentPoolName, clientPrincipalName, region, errorDetails , resourceName, resourceGroupName, resultCode, userAgent, httpMethod, httpStatus, targetURI, subscriptionID
```
>
<table>
<thead>
<tr>
    <th>operationName</th>
    <th>suboperationName</th>
    <th>correlationID</th>
    <th>operationID</th>
    <th>agentPoolName</th>
    <th>clientPrincipalName</th>
    <th>errorDetails</th>
    <th>resourceName</th>
    <th>resourceGroupName</th>
    <th>resultCode</th>
    <th>userAgent</th>
    <th>httpMethod</th>
    <th>httpStatus</th>
    <th>targetURI</th>
</tr>
</thead>
<tbody>
<tr>
    <td>PutManagedClusterHandler.PUT</td>
    <td>Creating</td>
    <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
    <td>6df685b8-5985-4a36-8a00-7233bda89377</td>
    <td></td>
    <td>@microsoft.com</td>
    <td></td>
    <td>myAKSCluster</td>
    <td>myResourceGroup</td>
    <td>Success</td>
    <td>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9 (Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38) cloud-shell/1.0</td>
    <td>PUT</td>
    <td>201</td>
    <td>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01</td>
</tr>
<tr>
    <td>PutManagedClusterHandler.PUT</td>
    <td>Creating</td>
    <td>17818e60-7ddc-4c69-b5de-03c27724da9d</td>
    <td>6df685b8-5985-4a36-8a00-7233bda89377</td>
    <td></td>
    <td>@microsoft.com</td>
    <td></td>
    <td>myAKSCluster</td>
    <td>myResourceGroup</td>
    <td>Success</td>
    <td>AZURECLI/2.79.0 (RPM) azsdk-python-core/1.35.0 Python/3.12.9 (Linux-6.1.91.1-microsoft-standard-x86_64-with-glibc2.38) cloud-shell/1.0</td>
    <td>PUT</td>
    <td>201</td>
    <td>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster?api-version=2025-08-01</td>
</tr>
</tbody>
</table>

> **FrontEndContextActivity** table - Will have **verbose** logs for each operation (OperationID) we see in FrontEndQoSEvents table.
> We will use _OperationID_ from FrontEndQoSEvents table to see all the activity that takes place.

```text
cluster('akshuba.centralus').database('AKSprod').FrontEndContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| extend Message = parse_json(msg)
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| project PreciseTimeStamp, level, code=tostring(Message.code), suboperationName, msg, operationName, operationID, correlationID, region, fileName, resourceName, resourceGroupName, subscriptionID
```

> Now, let's focus on the **key log** generated when you run the above Kusto query.

<table style="width:100%;">
<colgroup>
<col style="width: 4%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 52%" />
<col style="width: 4%" />
<col style="width: 4%" />
<col style="width: 4%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 4%" />
</colgroup>
<thead>
<tr>
<th>PreciseTime Stamp</th>
<th>level</th>
<th>code</th>
<th><blockquote>
<p>suboperati onName</p>
</blockquote></th>
<th>msg</th>
<th style="text-align: left;"><blockquote>
<p>operationNa me</p>
</blockquote></th>
<th><blockquote>
<p>operationID</p>
</blockquote></th>
<th><blockquote>
<p>correlationID</p>
</blockquote></th>
<th>region</th>
<th>fileName</th>
<th>resourceN ame</th>
<th>resourceGr oupName</th>
<th>subscriptionI D</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T</p>
<p>11:52:52.859</p>
<p>9834Z</p></td>
<td>info</td>
<td></td>
<td><blockquote>
<p>None</p>
</blockquote></td>
<td><p><strong>sanitized request body</strong>:
{"location":"francecentral","properties":{"kubernetesVersion":"","dnsPrefix":"myAKSClust-</p>
<p>myResourceGroup-28abb0","agentPoolProfiles":[{"name":"<strong>nodepool1</strong>","count":2,"vmSize":"","type":"VirtualMachineScaleSets","enableAutoScaling":false,"enableNodePublicIP":false,"scaleSetP
riority":"Regular","scaleSetEvictionPolicy":"Delete","spotMaxPrice":-1,"mode":"System","enableEncryptionAtHost":false,"enableUltraSSD":false,"osType":"Linux","upgradeSettings":{},"enableFIPS
":false}],"linuxProfile":{"adminUsername":"azureuser","ssh":{"publicKeys":[{"keyData":"ssh-rsa
AAAAB3NzaC1yc2EAAAADAQABAAABAQCTZP8rTTPVUtTIfc+Rjc5Xt9ZhhcZcCCHtGbA3OJ1eU5K8nS5svQfNeEGkP/AfREw3zAs8BF3A8SZBoUv/CUaNQijlANNC1AZNXUop2d50jDJMZSMpwgA</p>
<p>dwFDQ/0FPYM0fTX0AWdzvidSvwWKFd4bUUkLvVnVtferf2Ui+qZpOPe2DGlehCs6izm1p42DYJVjfLuUrnD/TDsM0JwBynhmAZstr7N3W2jVbXvO5AkhSTFTdFi/f8azZ/mnMoOHWQHND76Y59lqh
dHMNi7hKPk13TT28AnmScnf8eJNMFe3L4SNrBj6MeFMFODhYsnKg/uHq6SwZqQDKwOi207msS8Tp"}]}},"enableRBAC":true,"<strong>networkProfile</strong>":{"loadBalancerSku":"standard","podCidr":"10.244.
0.0/16","serviceCidr":"10.0.0.0/16","dnsServiceIP":"10.0.0.10","outboundType":"loadBalancer"},"disableLocalAccounts":false,"storageProfile":{},"bootstrapProfile":{"artifactSource":"Direct"}},"ide</p>
<p>ntity":{"type":"SystemAssigned"},"sku":{"name":"Base","tier":"Free"}}</p></td>
<td style="text-align: left;"><blockquote>
<p>PutManaged ClusterHandl er.PUT</p>
</blockquote></td>
<td><blockquote>
<p>6df685b8-598</p>
<p>5-4a36-8a00-</p>
<p>7233bda8937</p>
<p>7</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7d</p>
<p>dc-4c69- b5de-03c2772 4da9d</p>
</blockquote></td>
<td>francecent ral</td>
<td>microsoft.com/c ontainerservice/d atamodel/apiloa
der/sanitizer.go</td>
<td>myAKSClu ster</td>
<td>myResourc eGroup</td>
<td>28abb06e- c75e-47f2- ba8d- bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>

> From the screenshot, here's what we can observe about the sanitized request body in AKS RP logs:

**Key Details Visible**:

- Location: francecentral
- Properties included:
- Agent Pool Profiles:
  - Name: nodepool1
  - Count: 2
  - VM Size: VirtualMachineScaleSets
  - Scale settings: enableAutoScaling:false, enableNodePublicIP:false
  - Scale-down policies: scaleSetPriority:Regular,scaleSetEvictionPolicy:Delete
  - OS type: Linux
- Network Profile:
  - loadBalancerSku: \"standard\"
  - podCidr: \"10.244.0.0/16\"
  - serviceCidr: \"10.0.0.0/16\"
  - dnsServiceIP: \"10.0.0.10\"
  - outboundType: \"loadBalancer\"
- Other flags:
  - enableEncryptionAtHost:false
  - enableUltraSSD:false
  - enableIPV6:false
  - enableRBAC:true
  - disableLocalAccounts:false
  - Identity: SystemAssigned
  - SKU: Base, Tier: Free

### 3. AsyncQoSEvents and AsyncContextActivity

> **AsyncQoSEvents** table - Will have summary of all the operations that reach _Container Service Async_ code of _AKS RP_.

```text
cluster('akshuba.centralus').database('AKSprod').AsyncQoSEvents
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| extend Count = parse_json(tostring(parse_json(propertiesBag).LinuxAgentsCount))
| project insertionTime, PreciseTimeStamp, correlationID, operationID, Count , operationName, suboperationName, agentPoolName ,result, errorDetails, resultCode, resultSubCode, k8sCurrentVersion, k8sGoalVersion, subscriptionID, resourceGroupName, resourceName, region, pod, UnderlayName, Underlay
```

> **AsyncContextActivity** table - Will have verbose logs for each operation we see in **AsyncQoSEvents** table.
> We will use OperationID from AsyncQoSEvents table to see all the activity that takes place.

```text
cluster('akshuba.centralus').database('AKSprod').AsyncContextActivity
| where PreciseTimeStamp > ago(5d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| project PreciseTimeStamp, level, msg, namespace, correlationID, operationID
```

> From the _Kusto query output_ , we can see:

- The message has been picked up from the queue.

    <table>
    <thead>
    <tr>
        <th>msg</th>
        <th>namespace</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>created apiTracking from message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>created apiTracking from message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>got Message with ID: 6df685b8-5985-4a36-8a00-7233bda89377, and dequeue count: 1</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>got Message with ID: 6df685b8-5985-4a36-8a00-7233bda89377, and dequeue count: 1</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>servicebusManagedSettlingHandler handling message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>servicebusManagedSettlingHandler handling message 6df685b8-5985-4a36-8a00-7233bda89377</td>
        <td>containerservice-async</td>
    </tr>
    </tbody>
    </table>

- The timeout value for the operation is set to 2 hours.

    <table>
    <thead>
    <tr>
        <th>msg</th>
        <th>namespace</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Start of a PutManagedClusterHandler.PUT operation. Delaying control plane CR reconciliation until underlay is set</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>Operation Timeout: 2h0m0s</td>
        <td>containerservice-async</td>
    </tr>
    <tr>
        <td>Operation Timeout: 2h0m0s</td>
        <td>containerservice-async</td>
    </tr>
    </tbody>
    </table>

- The managed cluster body and the agent pool body to verify the configuration used in the PUT call.

<table>
  <thead>
    <tr>
      <th>section</th>
      <th>json</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>Unversioned Managed Cluster body</td>
      <td>
        { "controlPlaneID":"69298d19806281000116e263",
          "containerService":{
            "id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster",
            "location":"francecentral",
            "name":"myAKSCluster",
            "tags":null,
            "type":"Microsoft.ContainerService/ManagedClusters",
            "properties":{
              "ClusterID":"",
              "powerState":{"code":"Running","lastStateChange":"2025-11-28T11:52:56.299635859Z"},
              "orchestratorProfile":{
                "orchestratorType":"Kubernetes",
                "orchestratorVersion":"1.32.9",
                "kubernetesConfig":{
                  "kubernetesImageBase":"mcr.microsoft.com/oss/kubernetes/",
                  "clusterSubnet":"10.244.0.0/16",
                  "networkPlugin":"azure",
                  "dnsServiceIP":"10.0.0.10",
                  "serviceCidr":"10.0.0.0/16",
                  "useManagedIdentity":true,
                  "userAssignedID":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool",
                  "useCloudControllerManager":true,
                  "enableRbac":true,
                  "enableSecureKubelet":true,
                  "kubeletConfig":{"--cloud-config":"","--cloud-provider":"external","--feature-gates":"","--rotate-certificates":"true"},
                  "cloudProviderBackoffMode":"",
                  "loadBalancerSku":"standard",
                  "disableLocalAccounts":false,
                  "ipFamilies":["IPv4"],
                  "clusterSubnets":["10.244.0.0/16"],
                  "serviceCIDRs":["10.0.0.0/16"],
                  "networkPluginMode":"overlay"
                },
                "specifiedOrchestratorVersion":"1.32"
              },
              "linuxProfile":{"adminUsername":"azureuser","ssh":{"publicKeys":[{"keyData":"REDACTED"}]},"sshPublicKeyVersion":""},
              "extensionProfiles":null,
              "servicePrincipalProfile":{"clientId":"msi","secret":"REDACTED"},
              "hostedMasterProfile":{
                "fqdn":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
                "publicFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
                "privateFQDN":"",
                "dnsPrefix":"myAKSClust-myResourceGroup-28abb0",
                "fqdnSubdomain":"",
                "subnet":"",
                "apiServerWhiteListRange":null,
                "ipMasqAgent":true,
                "ipAddress":""
              },
              "addonProfiles":{
                "image-cleaner":{"enabled":true,"config":{"addonv2":"true"}},
                "keda":{"enabled":true,"config":{"addonv2":"true"}},
                "overlay-upgrade-data":{"enabled":true,"config":{"addonv2":"true"}},
                "trustedaccess":{"enabled":true,"config":{"addonv2":"true"}},
                "workload-identity":{"enabled":true,"config":{"addonv2":"true"}}
              },
              "provisioningState":"Creating"
            }
          },
          "CloudProviderProfile":{
            "cloud":"AzurePublicCloud",
            "tenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "subscriptionId":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5",
            "aadClientId":"msi",
            "aadClientSecret":"REDACTED",
            "useManagedIdentityExtension":true,
            "location":"francecentral",
            "vmType":"vmss",
            "loadBalancerSku":"standard",
            "networkResourceTenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "networkResourceSubscriptionId":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
          },
          "createApiVersion":"2025-08-01",
          "provisionInfo":{"provisionError":"","TunnelVersion":"","controlPlaneUnderlay":null,"aksHTTPCustomFeatures":null,"enableAzureDiskFileCSIDriver":"true","enableCloudControllerManager":"true","overrideAddonVersion":null,"enableEno":false,"overrideControlplaneResources":null,"etcdServersOverrides":null},
          "isSSHKeyAutoGenerated":false,
          "nodeResourceGroup":"MC_myResourceGroup_myAKSCluster_francecentral",
          "createdTime":"2025-11-28T11:52:57Z",
          "syncLastUpdatedTime":"2025-11-28T11:52:58Z",
          "asyncLastUpdatedTime":"",
          "MSIProfile":{
            "type":"SystemAssigned",
            "identityUrl":"https://control-francecentral.identity.azure.net/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster/credentials/v2/systemassigned?arpid=5c706ee7-912a-48cf-9b5d-b4453124e034&keyid=12f71d4a-f330-432f-9688-3bb8dacae5e5&said=a137755a-02a9-46eb-aae9-64a395b2c595&sigver=1.0&tid=16b3c013-d300-468d-ac64-7eda0820b6d3&sig=WviHrGbmDy2ujLhYng7RZZ-BSEuSvQql7iuDU1uB5V4",
            "principalId":"b7c7564a-2e58-4a9c-af25-b8725f914d00",
            "tenantId":"16b3c013-d300-468d-ac64-7eda0820b6d3",
            "InputUserAssignedIdentities":null
          },
          "latestOperationID":"6df685b8-5985-4a36-8a00-7233bda89377",
          "LoadBalancerProfile":{"managedOutboundIPs":{"desiredCount":1},"backendPoolType":"nodeIPConfiguration"},
          "_etag":"aca75b4b-2fc6-46be-95a9-a1578e8d32e4",
          "storageAccountProfile":{"storageAccount":"etcdfrancecentral","container":"69298d19806281000116e263"},
          "outboundType":"loadBalancer",
          "sku":{"name":"Basic","tier":"Free"},
          "networkResourceSubscription":{ "ID":"28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5", "State":"Registered", "RegisteredFeatures":[
            {"name":"Microsoft.ContainerService/AutomaticSKUPreview","state":"Registered"},
            {"name":"Microsoft.ContainerService/NetworkIsolatedClusterPreview","state":"Registered"},
            {"name":"Microsoft.ContainerService/StaticEgressGatewayPreview","state":"Registered"}
          ] },
          "autoUpgradeProfile":{"NodeOSUpgradeChannel":4},
          "securityProfile":{"podLinkLocalAccess":{"method":1}},
          "storageProfile":{"diskCSIDriver":{"enabled":true,"version":"v1"},"fileCSIDriver":{"enabled":true},"snapshotController":{"enabled":true}},
          "oidcProfile":{"enabled":false,"id":"00000000-0000-0000-0000-000000000000"},
          "apiServerServiceAccountIssuerFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io",
          "encryptionProfile":{"version":"REDACTED","encryptedAESKey":"REDACTED","secretURI":"REDACTED","encryptionTime":{"seconds":1764330778,"nanos":952612317}},
          "azurePortalFQDN":"myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io",
          "ccpWebhookProfile":{"autoAssignHostPortsEnabled":true},
          "metricsProfile":{"costAnalysis":{"enabled":false}},
          "secretProperties":"REDACTED",
          "ccpPluginProfiles":{"azure-monitor-metrics-ccp":{"enableV2":true},"gpu-provisioner":{"enableV2":true},"karpenter":{"enableV2":true},"kubelet-serving-csr-approver":{"enableV2":true},"live-patching-controller":{"enableV2":true},"static-egress-controller":{"enableV2":true}},
          "nodeProvisioningProfile":{"mode":"Manual","defaultNodePools":"Auto"},
          "bootstrapProfile":{"artifactSource":"Direct","containerRegistryResourceId":"","byoContainerRegistry":null,"containerRegistryCacheRulePrefix":""},
          "kind":"Base",
          "internalLifeCycleInfo":{"operationName":"PutManagedClusterHandler.PUT","subOperationName":"Creating","operationStartTime":{"seconds":1764330778,"nanos":951807054},"previousOperationID":""},
          "dataBoundaryProfile":{"dataBoundary":"Global"},
          "hostedSystemPoolProfile":{"hobo_subscription_id":"REDACTED","hobo_tenant_id":"REDACTED","hobo_resource_group":"REDACTED","hobo_enabled":false},
          "enableFIPS":false
        }
      </td>
    </tr>
    <tr>
      <td>Unversioned Agent Pool body</td>
      <td>
        { "agentPoolResource":{
            "id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/myResourceGroup/providers/Microsoft.ContainerService/managedClusters/myAKSCluster/agentPools/nodepool1",
            "location":"francecentral",
            "name":"nodepool1",
            "type":"Microsoft.ContainerService/managedClusters/agentPools",
            "properties":{
              "name":"nodepool1",
              "count":2,
              "vmSize":"Standard_D8ds_v5",
              "osDiskSizeGB":300,
              "osType":"Linux",
              "osSku":"Ubuntu",
              "powerState":{"code":"Running","lastStateChange":"2025-11-28T11:52:52.86609573Z"},
              "availabilityProfile":"VirtualMachineScaleSets",
              "storageProfile":"Ephemeral",
              "ipAddressCount":1,
              "distro":"aks-ubuntu-containerd-22.04-gen2",
              "acceleratedNetworkingEnabled":true,
              "kubernetesConfig":{
                "clusterSubnet":"10.244.0.0/16",
                "networkPlugin":"azure",
                "containerRuntime":"containerd",
                "dnsServiceIP":"10.0.0.10",
                "serviceCidr":"10.0.0.0/16",
                "enableRbac":true,
                "enableSecureKubelet":true,
                "kubeletConfig":{
                  "--authentication-token-webhook":"true",
                  "--authorization-mode":"Webhook",
                  "--eviction-hard":"memory.available<100Mi,nodefs.available<10%,nodefs.inodesFree<5%,pid.available<2000",
                  "--image-credential-provider-bin-dir":"/var/lib/kubelet/credential-provider",
                  "--image-credential-provider-config":"/var/lib/kubelet/credential-provider-config.yaml",
                  "--kube-reserved":"cpu=180m,memory=5050Mi,pid=1000",
                  "--max-pods":"250",
                  "--read-only-port":"0",
                  "--rotate-server-certificates":"true",
                  "--serialize-image-pulls":"false"
                }
              },
              "orchestratorVersion":"1.32.9",
              "agentPoolMode":"System",
              "provisioningState":"Creating",
              "securityProfile":{"sshAccess":0,"enableVTPM":false,"enableSecureBoot":false},
              "specifiedOrchestratorVersion":"1.32"
            }
          },
          "syncLastUpdatedTime":"2025-11-28T11:52:58Z",
          "latestOperationId":"6df685b8-5985-4a36-8a00-7233bda89377",
          "upgradeSettings":{"maxSurge":"10%","maxUnavailable":"0"},
          "internalLifeCycleInfo":{"operationName":"PutManagedClusterHandler.PUT","subOperationName":"Creating","operationStartTime":{"seconds":1764330778,"nanos":951807054},"previousOperationID":""}
        }
      </td>
    </tr>
    </tbody>
    </table>

From the log above:

- **From the Managed Cluster body:** we can see details about the cluster configuration, including the network profile, orchestrator settings, identity configurat ion, and enabled add-ons. It also shows the provisioning state and operational context for the cluster.
- **From the Agent Pool body:** we can see information about the node pool configuration, such as compute profile, storage settings, networking configuration , and kubelet parameters. It also includes scaling options, security settings, and operational state for the agent pool.

- The infrastructure resource group \"Create/update\" operation completed successfully

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Create/Update resource group MC_myResourceGroup_myAKSCluster_francecentral</td></tr>
    <tr><td>Create/Update resource group MC_myResourceGroup_myAKSCluster_francecentral</td></tr>
    <tr><td>CreateOrUpdate resource group /subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral successfully</td></tr>
    <tr><td>CreateOrUpdate resource group /subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral successfully</td></tr>
    </tbody>
    </table>

- Create role assignment succeeded.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Create role assignment succeeded.</td></tr>
    <tr><td>Create role assignment succeeded.</td></tr>
    </tbody>
    </table>

- The AKS cluster requires a Standard Load Balancer with one managed outbound IP for egress traffic

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>managedCluster requires SLB with 1 managed outbound IP(s)</td></tr>
    <tr><td>managedCluster requires SLB with 1 managed outbound IP(s)</td></tr>
    <tr><td>Resolved outbound goal for outbound type: loadBalancer. Goal: {"Location":"francecentral",...,"BackendPoolType":"nodeIPConfiguration"}</td></tr>
    <tr><td>Resolved outbound goal for outbound type: loadBalancer. Goal: {"Location":"francecentral",...,"BackendPoolType":"nodeIPConfiguration"}</td></tr>
    </tbody>
    </table>

- Created public ip address

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>EnsureOutboundIPs: Created public ip address "12498857-13b0-4113-806a-c631da6e48da"</td></tr>
    <tr><td>EnsureOutboundIPs: Created public ip address "12498857-13b0-4113-806a-c631da6e48da"</td></tr>
    <tr><td>Successfully ensured 1 public ip address</td></tr>
    <tr><td>Successfully ensured 1 public ip address</td></tr>
    </tbody>
    </table>

- Load Balancer Creation

    <table>
      <thead>
        <tr>
          <th>msg</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            ensureLoadbalancer: Begin to put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Begin to put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Succeeded in put LB "kubernetes" in        ensureLoadbalancer: Succeeded in put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, result: kubernetes
          </td>
        </tr>
        <tr>
          <td>
            ensureLoadbalancer: Succeeded in put LB "kubernetes" in resource group "MC_myResourceGroup_myAKSCluster_francecentral" subscription id 28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, result: kubernetes
          </td>
        </tr>
      </tbody>
      </table>

- Set networkPlugin to azure

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>set networkPlugin to azure</td></tr>
    <tr><td>set networkPlugin to azure</td></tr>
    <tr><td>set networkPluginMode to overlay</td></tr>
    <tr><td>set networkPluginMode to overlay</td></tr>
    <tr><td>set networkPolicy to</td></tr>
    <tr><td>set networkPolicy to</td></tr>
    </tbody>
    </table>

- Identity Profile Setup & FQDN Assignment

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Setting Identity profile in control plane ResourceID: .../userAssignedIdentities/myAKSCluster-agentpool, ClientID: ab1a44db-265e-44eb-886e-2bff6a3ab904, ObjectID: 3c5b8d54-e6a7-4517-8f44-4e915a4764c8</td></tr>
    <tr><td>Setting Identity profile in control plane ResourceID: .../userAssignedIdentities/myAKSCluster-agentpool, ClientID: ab1a44db-265e-44eb-886e-2bff6a3ab904, ObjectID: 3c5b8d54-e6a7-4517-8f44-4e915a4764c8</td></tr>
    <tr><td>fqdn: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, publicFqdn: ..., privatFqdn:</td></tr>
    <tr><td>fqdn: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, publicFqdn: ..., privatFqdn:</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    <tr><td>The dns goal is: ... FQDN: myaksclust-myresourcegroup-28abb0-lg0xm6cm.portal.hcp.francecentral.azmk8s.io, IP: 4.251.147.167, TTL: 60</td></tr>
    </tbody>
    </table>

- CCP components certificates are created.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>CertificateProfile CA certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile APIServer private key is generated successfully</td></tr>
    <tr><td>CertificateProfile APIServer certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile kubeconfig certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile aksService client certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile node client certificate is generated successfully</td></tr>
    <tr><td>CertificateProfile master client certificate is generated successfully</td></tr>
    </tbody>
    </table>

- Waiting for Overlay components to become healthy / All Overlay components are ready / CCP IP is configured / DNS reference is configured

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>waiting for overlay "69298d19806281000116e263" to become healthy</td></tr>
    <tr><td>all overlay components are ready, 36.271046 seconds elapsed in this function.</td></tr>
    <tr><td>updating service ip from "" to "4.251.147.167"</td></tr>
    <tr><td>DNS resource reference: {737d3b89-5550-4cd5-802a-3af418c81181 hcp-underlay-francecentral ...}</td></tr>
    </tbody>
    </table>

- Creation of agent pools.

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>[Perf log]: Start to create vmss for agent pool "nodepool1"</td></tr>
    <tr><td>create VMSS aks-nodepool1-16061838-vmss succeeded.</td></tr>
    <tr><td>[Perf log]: Create vmss for agent pool "nodepool1" succeeded</td></tr>
    <tr><td>validateControlPlaneAddOns: Validating Control Plane AddOns</td></tr>
    <tr><td>Operation finished after 193.518376 seconds, with state Succeeded, removing messageID: 6df685b8-5985-4a36-8a00-7233bda89377 from the queue</td></tr>
    </tbody>
    </table>

- Validate the CCP Add-ons

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>validateControlPlaneAddOns: Validating Control Plane AddOns</td></tr>
    </tbody>
    </table>

- When the operation successfully processed, the message is deleted from the queue .

    <table>
    <thead><tr><th>msg</th></tr></thead>
    <tbody>
    <tr><td>Operation finished after 193.518376 seconds, with state Succeeded, removing messageID: 6df685b8-5985-4a36-8a00-7233bda89377 from the queue</td></tr>
    </tbody>
    </table>

### 4. HcpSyncContextActivity

> The Hosted Control Pane is a database abstraction layer for the AKS Resource Provider(AKS -RP), holds all the entities related to AKS -RP. Entities describe the state of Customer Control plane CCP, like the customer subscription, usage, billing, underlay, mana ged cluster and other azure resources operated by RP backend and front end. The HCP API abstraction provides for scalability, sharding and ca ching of the entities Identified by RP.

```text
cluster('akshuba.centralus').database('AKSprod').HcpSyncContextActivity
| where PreciseTimeStamp > ago(10d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where operationName notcontains "GET"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| extend Message = parse_json(msg)
| project PreciseTimeStamp, level, Message
```
>
### 5. OverlaymgrEvents

> This table Contains events of CCP components.

```text
cluster('akshuba.centralus').database('AKSprod').OverlaymgrEvents
| where PreciseTimeStamp > ago(10d)
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where isnotempty(eventObjectName) and isnotempty(eventReason)
| extend StartTime = todatetime(logPreciseTime)
| project PreciseTimeStamp, level, msg
```

  <table>
  <thead><tr><th>msg</th></tr></thead>
  <tbody>
  <tr><td>sending event for component deployments/69298d19806281000116e263-etcd-etcd-operator in state "Ready"</td></tr>
  <tr><td>sending event for component services/azure-dnc-primary in state "Ready"</td></tr>
  <tr><td>sending event for component pods/ccp-webhook-6fffcfcfc8-tbxzb in state "Ready"</td></tr>
  <tr><td>sending event for component pods/csi-azuredisk-controller-7c4d8dd45d-8vlb6 in state "Ready"</td></tr>
  </tbody>
  </table>

### 6. OutgoingRequestTrace

>This table: Contains summary of calls that **go out of** AKS RP.

```text
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace 
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID
```

  <table>
  <thead><tr><th>suboperationName</th><th>targetURI</th></tr></thead>
  <tbody>
  <tr><td>Creating</td><td>https://login.microsoftonline.com/16b3c013-d300-468d-ac64-7eda0820b6d3/oauth2/v2.0/token</td></tr>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral?api-version=2021-04-01</td></tr>
  <tr><td>Creating</td><td>https://aks-msi-francecentral.vault.azure.net/secrets/ff0bb9...568?api-version=2016-10-01</td></tr>
  </tbody>
  </table>

## Part III: CRP, DiskRP and NRP

> Now: let\'s see interaction with the others RP (focus on CRP, DiskRP and NRP):

### CRP and DiskRP

```text
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace 
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where targetURI contains "Microsoft.Compute"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID, serviceRequestID
```

  <table>
  <thead><tr><th>suboperationName</th><th>targetURI</th><th>serviceRequestID</th></tr></thead>
  <tbody>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/.../<tr><td>Creating</td><td>https://francecentral.management.azure.com/.../virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01</td><td>na</td></tr>
  <tr><td>Creating</td><td>https://francecentral.management.azure.com/.../virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01</td><td>4cde1129-cb5f-4214-acdb-a65ffccfca9f</td></tr>
  </tbody>
  </table>

>
> Note **the correlation ID** and Go to ARM:

```text
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries") 
| where TIMESTAMP > ago(14d)
| where subscriptionId has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where correlationId contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| where operationName notcontains "Microsoft.Authorization/policies/deployIfNotExists/action"
| where operationName contains "microsoft.compute"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId , status, subStatus , resourceUri , eventName , operationId, armServiceRequestId, subscriptionId
| sort by PreciseTimeStamp desc nulls last
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th>resourceProvid er</th>
<th>correlationId</th>
<th style="text-align: center;">status</th>
<th>subStatus</th>
<th>resourceUri</th>
<th style="text-align: center;">eventName</th>
<th><blockquote>
<p>operationId</p>
</blockquote></th>
<th><blockquote>
<p>armServiceRequestId</p>
</blockquote></th>
<th><blockquote>
<p>subscriptionId</p>
</blockquote></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:05:27.</p>
<p>8215869Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>2dab7361-</p>
<p>dad6-40d3-9730-3a19d552b</p>
<p>b9a</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.</p>
<p>4255371Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td>OK</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>effa2095-5b60-42c3-913f-97</p>
<p>c0dba59dcb</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:17.</p>
<p>2676207Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac
hineScaleSets/aks-nodepool1-16061838-vmss</td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>effa2095-5b60-42c3-913f-97</p>
<p>c0dba59dcb</p>
</blockquote></td>
<td><blockquote>
<p>145c233d-1fad-437e- b82e-3e842d787f59</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:11.</p>
<p>1761428Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>8abe1882-42d8-4d35-92a5-</p>
<p>690e9b46236c</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:06.</p>
<p>2713176Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td>OK</td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>a83d876e-a83d-405d- a489-70479e6100f3</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T12:05:03.</p>
<p>9976032Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac
hineScaleSets/aks-nodepool1-16061838-vmss</td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>a83d876e-a83d-405d- a489-70479e6100f3</p>
</blockquote></td>
<td><blockquote>
<p>abcb7035-74c2-42bd- a98d-45bc89696626</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:55:54.</p>
<p>3857825Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>Succeede d</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>eef603ef-9679-44fc-89e3-3a eebeb18252</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.</p>
<p>0929307Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Accepted</td>
<td><strong>Created</strong></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;">EndRequest</td>
<td><blockquote>
<p>8086c7cb-8a0f-4a3c-a497- c39c83ee426a</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
<tr>
<td><p>2025-11-28T11:54:34.</p>
<p>4769220Z</p></td>
<td>Microsoft.Compute/virtualMachi neScaleSets/write</td>
<td>Microsoft.Com pute</td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMac</p>
<p>hineScaleSets/aks-nodepool1-16061838-vmss</p></td>
<td style="text-align: center;"><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><blockquote>
<p>8086c7cb-8a0f-4a3c-a497- c39c83ee426a</p>
</blockquote></td>
<td><blockquote>
<p>e8a57d7d-5a96-4dcf-a716- ab6d019ea447</p>
</blockquote></td>
<td><blockquote>
<p>28abb06e-c75e-47f2-ba8d- bcd3aa9e0ff5</p>
</blockquote></td>
</tr>
</tbody>
</table>

> Now, let\'s switch to the Compute RP:
> **Important** ServiceRequestId in ARM EventServices **equals** OperationID in CRP VMSSQosEvent table **equals** ActivityID in contextactivity

#### 1. ApiQosEvent_nonGet

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
ApiQosEvent_nonGet 
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f" //ServiceRequestId in ARM EventServices == OperationID in CRP VMSSQosEvent table == ActivityID in contextactivity
| project PreciseTimeStamp, resourceName, correlationId, operationId, userAgent, operationName, clientPrincipalName, errorDetails, resourceGroupName, resultCode, e2EDurationInMilliseconds, durationInMilliseconds , httpStatusCode , region , clientApplicationId , subscriptionId, requestEntity
```

  <table>
  <thead>
  <tr><th>resourceName</th><th>userAgent</th><th>operationName</th><th>requestEntity</th></tr>
  </thead>
  <tbody>
  <tr>
  <td>aks-nodepool1-16061838-vmss</td>
  <td>AKS-VMSS azsdk-go-armcompute/v6.4.0 (go1.24.7 X:nocoverageredesign;<td>AKS-VMSS azsdk-go-armcompute/v6.4.0 (go1.24.7 X:nocoverageredesign; linux)</td>
  <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
  <td>{ "name": "aks-nodepool1-16061838-vmss", "type": "Microsoft.Compute/virtualMachineScaleSets", "location": "francecentral", "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true", "aks-managed-coordination": "true" }, "identity": { "type": "UserAssigned", "userAssignedIdentities": { "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool": {} } }, "sku": { "name": "Standard_D8ds_v5", "tier": "Standard", "capacity": 2 }, "properties": { "singlePlacementGroup": false, "orchestrationMode": "Uniform", "upgradePolicy": { "mode": "Manual" }, "virtualMachineProfile": { "osProfile": { "computerNamePrefix": "aks-nodepool1-16061838-vmss", "adminUsername": "azureuser", "linuxConfiguration": { "disablePasswordAuthentication": true, "ssh": { "publicKeys": [ { "path": "/home/azureuser/.ssh/authorized_keys", "keyData": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCTZP8rTTPVUtTIfc+Rjc5Xt9ZhhcZcCCHtGbA3OJ1eU5K8nS5svQfNeEGkP/AfREw3zAs8BF3A8SZBoUv/CUaNQijlANNC1AZNXUop2d50jDJMZSMpwgAdwFDQ/0FPYM0fTX0AWdzvidSvwWKFd4bUUkLvVnVtferf2Ui+qZpOPe2DGlehCs6izm1p42DYJVjfLuUrnD/TDsM0JwBynhmAZstr7N3W2jVbXvO5AkhSTFTdFi/f8azZ/mnMoOHWQHND76Y59lqhdHMNi7hKPk13TT28AnmScnf8eJNMFe3L4SNrBj6MeFMFODhYsnKg/uHq6SwZqQDKwOi207msS8Tp" } ] } } }, "storageProfile": { "osDisk": { "diffDiskSettings": { "option": "Local", "placement": "ResourceDisk" }, "createOption": "FromImage", "caching": "ReadOnly", "managedDisk": { "storageAccountType": "Standard_LRS" }, "diskSizeGB": 300 }, "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" }, "dataDisks": [] }, "networkProfile": {"networkInterfaceConfigurations":[{"name":"aks-nodepool1-16061838-vmss","properties":{"enableAcceleratedNetworking":true,"enableIPForwarding":true,"ipConfigurations":[{"name":"ipconfig1","properties":{"loadBalancerBackendAddressPools":[{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/aksOutboundBackendPool"},{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/kubernetes"}],"primary":true,"subnet":{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNetworks/aks-vnet-29823133/subnets/aks-subnet"}}}],"primary":true}}]}, "extensionProfile": { "extensions": [ { "name": "vmssCSE", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.Azure.Extensions", "type": "CustomScript", "typeHandlerVersion": "2.0" } }, { "name": "aks-nodepool1-16061838-vmss-AKSLinuxBilling", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.AKS", "type": "Compute.AKS.Linux.Billing", "typeHandlerVersion": "1.0" } } ], "extensionsTimeBudget": "PT16M" } }, "provisioningState": 0, "overprovision": false, "uniqueId": "00000000-0000-0000-0000-000000000000", "platformFaultDomainCount": 1 } }</td>
  </tr>
  </tbody>
  </table>

#### 2. VmssQoSEvent

> The VmssQoSEvent table will have summary of all the operations on VMSS.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
VmssQoSEvent
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| project PreciseTimeStamp, operationName, operationId, resourceGroupName, vmssName, oSType, availabilitySetCount, targetInstanceCount, vMCountDelta, e2EDurationSeconds, extensionNamesCsv, predominantErrorCode, predominantErrorDetail, predominantExceptionType
```

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 10%" />
<col style="width: 8%" />
<col style="width: 10%" />
<col style="width: 7%" />
<col style="width: 3%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 4%" />
<col style="width: 5%" />
<col style="width: 15%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 6%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th>operationName</th>
<th><blockquote>
<p>operationId</p>
</blockquote></th>
<th><blockquote>
<p>resourceGroupName</p>
</blockquote></th>
<th>vmssName</th>
<th>oSType</th>
<th>availabilitySetCo unt</th>
<th>targetInstanceCo unt</th>
<th>vMCountDelt a</th>
<th>e2EDurationSeco nds</th>
<th>extensionNamesCsv</th>
<th>predominantError Code</th>
<th>predominantError Detail</th>
<th>predominantExceptio nType</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:55:19.49</p>
<p>02969Z</p></td>
<td>VirtualMachineScaleSets.Resource Operation.PUT</td>
<td><blockquote>
<p>4cde1129-cb5f-4214-acdb- a65ffccfca9f</p>
</blockquote></td>
<td><blockquote>
<p>MC_myResourceGroup_myAKSClust er_francecentral</p>
</blockquote></td>
<td><p>aks-</p>
<p>nodepool1-16061838- vmss</p></td>
<td><mark>Linux</mark></td>
<td><mark>2</mark></td>
<td><mark>2</mark></td>
<td><mark>2</mark></td>
<td>44</td>
<td>Microsoft.Azure.Extensions.CustomScript,Microsoft.AKS.
Compute.AKS.Linux.Billing</td>
<td></td>
<td></td>
<td></td>
</tr>
</tbody>
</table>

#### 3. VMApiQosEvent
>
> The VMApiQosEvent table will have summary of all the operations on VMSS instances.
>
```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
VMApiQosEvent
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where resourceGroupName contains "MC_myResourceGroup_myAKSCluster_francecentral"
//| where resourceName contains "<vmss-name>"
| where operationId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| where operationName notcontains "VirtualMachines.RetrieveVMConsoleScreenshot.POST"
| where operationName notcontains "VirtualMachines.RetrieveVMConsoleSerialLogs.POST"
| project PreciseTimeStamp, operationId, operationName, resourceGroupName, resourceName,  fabricCluster, fabricTenantName, correlationId, durationInMilliseconds
```

  <table>
    <thead>
      <tr>
        <th>operationName</th>
        <th>resourceGroupName</th>
        <th>resourceName</th>
        <th>fabricCluster</th>
        <th>fabricTenantName</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
        <td>MC_myResourceGroup_myAKSCluster_francecentral</td>
        <td>aks-nodepool1-16061838-vmss_0</td>
        <td>francec-prod-c</td>
        <td>9ccc8658-bc67-4aef-b2fd-6966f40b5fcb</td>
      </tr>
      <tr>
        <td>VirtualMachineScaleSets.ResourceOperation.PUT</td>
        <td>MC_myResourceGroup_myAKSCluster_francecentral</td>
        <td>aks-nodepool1-16061838-vmss_1</td>
        <td>francec-prod-c</td>
        <td>345ff9d5-b25c-44f5-83d4-cf3084e55894</td>
      </tr>
    </tbody>
    </table>

#### 4. ContextActivity

> The ContextActivity Table will have verbose logs for each operation we see in VMSSQosEvent table.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('azcrp.kusto.windows.net').database('crp_allprod')]
ContextActivity | union VmssVMGoalSeekingActivity
| where PreciseTimeStamp > ago(16d)
| where subscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where activityId contains "4cde1129-cb5f-4214-acdb-a65ffccfca9f"
| project TIMESTAMP , traceLevel , message , callerName
```

- First, we can see the type of operation that came to CRP

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Request: PUT https://10.0.118.246:30004/f491ff58-9c6e-4c06-b03b-186170d146b7_134057336666909495/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01        Request: PUT https://10.0.118.246:30004/f491ff58-9c6e-4c06-b03b-186170d146b7_134057336666909495/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2024-11-01 HTTP/2
          </td>
        </tr>
      </tbody>
      </table>

- We can see also Invoking action, which contains many important information like:
  - VM SKU,
  - Network Profile,
  - Storage Profile
  - Image Reference

  <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
          Invoking action VirtualMachineScaleSets.ResourceOperation.PUT(subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5, resourceGroupName=MC_myResourceGroup_myAKSCluster_francecentral, resourceName=aks-nodepool1-16061838-vmss, vmss={ "name": "aks-nodepool1-16061838-vmss", "type": "Microsoft.Compute/virtualMachineScaleSets", "location": "francecentral", "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true" }, "identity": { "type": "UserAssigned", "userAssignedIdentities": { "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.ManagedIdentity/userAssignedIdentities/myAKSCluster-agentpool": {} } }, "sku": { "name": "Standard_D8ds_v5", "tier": "Standard", "capacity": 2 }, "properties": { "singlePlacementGroup": false, "orchestrationMode": "Uniform", "upgradePolicy": { "mode": "Manual" }, "virtualMachineProfile": { "osProfile": { "computerNamePrefix": "aks-nodepool1-16061838-vmss", "adminUsername": "azureuser", "linuxConfiguration": { "disableREDACTED": true, "ssh": { "publicREDACTED": [ { "path": "/home/azureuser/.ssh/authorized_REDACTED", "REDACTED" } ] } } }, "storageProfile": { "osDisk": { "diffDiskSettings": { "option": "Local", "placement": "ResourceDisk" }, "createOption": "FromImage", "caching": "ReadOnly", "diskSizeGB": 300 }, "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" } }, "networkProfile": {"networkInterfaceConfigurations":[{"name":"aks-nodepool1-16061838-vmss","properties":{"enableAcceleratedNetworking":true,"enableIPForwarding":true,"ipConfigurations":[{"name":"ipconfig1","properties":{"loadBalancerBackendAddressPools":[{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/aksOutboundBackendPool"},{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalancers/kubernetes/backendAddressPools/kubernetes"}],"primary":true,"subnet":{"id":"/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNetworks/aks-vnet-29823133/subnets/aks-subnet"}}}],"primary":true}}]}, "extensionProfile": { "extensions": [ { "name": "vmssCSE", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.Azure.Extensions", "type": "CustomScript", "typeHandlerVersion": "2.0" } }, { "name": "aks-nodepool1-16061838-vmss-AKSLinuxBilling", "properties": { "autoUpgradeMinorVersion": true, "publisher": "Microsoft.AKS", "type": "Compute.AKS.Linux.Billing", "typeHandlerVersion": "1.0" } } ], "extensionsTimeBudget": "PT16M" } }, "provisioningState": 0, "overprovision": false, "uniqueId": "00000000-0000-0000-0000-000000000000", "platformFaultDomainCount": 1 } })
          </td>
        </tr>
      </tbody>
    </table>

- CRP talks to PIR - Platform image Repository to check for image used for VM creation.
  
<table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            GetGalleryImageVersion uri: internal/Providers/Microsoft.Compute/galleries/109a5e88-712a-48ae-9078-9ca8b3c81345-AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0?inputGalleryResourceId=%2Fsubscriptions%2F109a5e88-712a-48ae-9078-9ca8b3c81345%2FresourceGroups%2FAKS-Ubuntu%2Fproviders%2FMicrosoft.Compute%2Fgalleries%2FAKSUbuntu%2Fimages%2F2204gen2containerd%2Fversions%2F202511.07.0&subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5&tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3&api-version=2015-06-15&$expand=image<br><br>
            Got GalleryImageVersion from PIR: { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NVMe" } ], "identifier": { "publisher": "microsoft-aks", "offer": "AKSUbuntu", "sku": "2204gen2containerd" }, "recommended": {} }, "location": "FranceCentral", "name": "2204gen2containerd" }, "location": "FranceCentral", "name": "202511.07.0" }
          </td>
        </tr>
        <tr>
          <td>
            GetGalleryImageVersion uri: internal/Providers/Microsoft.Compute/galleries/109a5e88-712a-48ae-9078-9ca8b3c81345-AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0?inputGalleryResourceId=%2Fsubscriptions%2F109a5e88-712a-48ae-9078-9ca8b3c81345%2FresourceGroups%2FAKS-Ubuntu%2Fproviders%2FMicrosoft.Compute%2Fgalleries%2FAKSUbuntu%2Fimages%2F2204gen2containerd%2Fversions%2F202511.07.0&subscriptionId=28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5&tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3&api-version=2015-06-15&$expand=image<br><br>
            Got GalleryImageVersion from PIR:
            { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NV        Got GalleryImageVersion from PIR: { "properties": { "storageProfile": { "osDiskImage": { "diskSizeGB": 30, "hostCaching": "None" } }, "IsDerived1PGalleryImageVersion": false, "ownerResourceId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-UBUNTU/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0", "incarnationId": "9907a202-0419-48db-9c27-60c4de916ba8", "commonId": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/PPSCommonId$ResourceGroup/providers/Microsoft.Compute/galleries/AKSUBUNTU/images/2204gen2containerd/versions/202511.07.0", "publishedDate": "2025-11-07T09:22:03.7425755+00:00", "publishingProfile": { "allocationConstraints": { "replicas": 20 } } }, "image": { "properties": { "osType": "Linux", "osState": "Generalized", "hyperVGeneration": "V2", "architecture": "x64", "features": [ { "name": "DiskControllerTypes", "value": "SCSI, NVMe" } ], "identifier": { "publisher": "microsoft-aks", "offer": "AKSUbuntu", "sku": "2204gen2containerd" }, "recommended": {} }, "location": "FranceCentral", "name": "2204gen2containerd" }, "location": "FranceCentral", "name": "202511.07.0" }
          </td>
        </tr>
      </tbody>
</table>

- CRP talks to DiskRP with DiskAllocation request.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            AllocateDisksRequest: { "colocationType": "PolicyBased", "vmScaleSetId": "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss", "vms": [ { "tags": { "aks-managed-azure-cni-overlay": "true", "aks-managed-bootstrap-profile-acr-name": "", "aks-managed-consolidated-additional-properties": "c8eea863-cc50-11f0-b226-ee6259910934", "aks-managed-createOperationID": "6df685b8-5985-4a36-8a00-7233bda89377", "aks-managed-creationSource": "vmssclient-aks-nodepool1-16061838-vmss", "aks-managed-enable-imds-restriction": "false", "aks-managed-kubeletIdentityClientID": "ab1a44db-265e-44eb-886e-2bff6a3ab904", "aks-managed-networkisolated-outbound-type": "", "aks-managed-orchestrator": "Kubernetes:1.32.9", "aks-managed-poolName": "nodepool1", "aks-managed-resourceNameSuffix": "29823133", "aks-managed-ssh-access": "LocalUser", "compute.aks.billing": "true", "aks-managed-coordination": "true" },
            "imageReference": { "id": "/subscriptions/109a5e88-712a-48ae-9078-9ca8b3c81345/resourceGroups/AKS-Ubuntu/providers/Microsoft.Compute/galleries/AKSUbuntu/images/2204gen2containerd/versions/202511.07.0" },
            "id": "/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/virtualMachines/aks-nodepool1-16061838-vmss_0",
            "faultDomain": 0,
            "colocationConstraints": { "colocationT2Spine": { "id": "par61:-520283205" }, "colocationZone": { "id": "francec-az02" } },
            "vmGoalState": "Allocated",
            "disks": [ { "properties": { "osType": "Linux", "creationData": { "createOption": "FromPreprovisioned", "sourceResourceId": "/subscriptions/14bab04b-6fe6-4b71-bae5-507899974b1b/resourceGroups/97c0ac70-7d37-4c56-8ec3-1b7c695d        "disks": [ { "properties": { "osType": "Linux", "creationData": { "createOption": "FromPreprovisioned", "sourceResourceId": "/subscriptions/14bab04b-6fe6-4b71-bae5-507899974b1b/resourceGroups/97c0ac70-7d37-4c56-8ec3-1b7c695d24b0/providers/Microsoft.Compute/disks/pps-vm-01_pps-vm-01_0_OsDisk_1_6a6bc1baf62741ec9636fcc9cbc262d8" },
            "crpDiskId": "6bcc8953-0c0d-453c-9ad3-046c28a30d6e", "isArmResource": false, "disableBilling": false,
            "billingUriOverride": "/subscriptions/010c879a-9b76-4efc-a9fe-3f63de9b3242/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/VMScaleSets/aks-nodepool1-16061838-vmss" },
            "associatedXStoreEntities": [], "sku": { "name": "Standard_LRS" } } ] } ], "faultDomainCount": 1 }
            DiskRP response for AllocateDisks request: { ... full VM0 disk allocation result ... }
          </td>
        </tr>
        <tr>
          <td>
            AllocateDisksRequest: { ... VM1 request block exactly as in source ... }
            DiskRP response for AllocateDisks request: { ... full VM1 disk allocation result ... }
          </td>
        </tr>
      </tbody>
      </table>

- CRP makes several calls to NRP.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 1
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Start: PUT https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2015-06-15. OngoingCallCount = 1
            End: PUT https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Response has Azure-AsyncOperation header https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/operations/ae1875bf-1571-4282-bf17-a010d7682fb1?api-version=2015-06-15
            Waiting for the timed task NRP.ValidateVMScaleSet to complete. Remaining time: 00:00:36.9218763.
            Invoking NRP ValidateVMScaleSet with 1 UpdateGroups, 2 vmInstances and IsMultiTenant as True
            Request Header x-ms-client-request-id: b8157d10-4ce5-4832-8af4-1b60f7190ebe
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 1
            NRPValidateClient: Try sending request with cached dsts token. ValidFrom: 11/28/2025 1:15:45 AM, ValidTo: 11/29/2025 1:15:45 AM<br><br>
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL/providers/Microsoft.Compute/virtualMachineScaleSets/aks-nodepool1-16061838-vmss/validate?api-version=2015-06-15. OngoingCallCount = 0. ResponseHttpVersion: 2.0
            Received HTTP status code OK. x-ms-request-id: 201243d9-9af9-44e5-9885-0b154fac01fe
            From NRP ValidateVMScaleSet response, VMSS healthProbeEnabled: False,  
            CanUsePreProvisionedVMs: True,  
            NetworkInterfaceCount: 1,  
            AccelNetRequired: True,  
            VmSizeAccelNetAvailability: Guaranteed,  
            RequiredNetworkingCapabilities: [FpgaEnabled],  
            SkipOverProvision: False,  
            FastPathEnabled: True
          </td>
        </tr>
      </tbody>
      </table>

> Important: We will use the \"x-ms-request-id\" to trace the calls in NRP logs. (see next section)

- Based on VM size and few constraints (Eg - EphemeralDisk) CRP will look-up all the clusters in the region.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>After applying EphemeralDisk constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying VMSize constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying EphemeralDisk constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>After applying VMSize constraint candidates are: francec-prod-c</td>
        </tr>
        <tr>
          <td>[Reprovision] Skipping reprovision because 0 candidates for ReprovisionOSProvisionTimeOutVMs after set intersection, and m_attemptReprovisionForOSProvisioningTimeout:False</td>
        </tr>
      </tbody>
      </table>

> Important: Based on cluster Utilization and few constraints, one/many fabric clusters will be chosen for VM allocation.

- CRP translates VM model and generates .SVD (Service model) file that fabric understands.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Generate skeletal SVD with assigned FD's for 0 non-existent VMs with allocated disks and determine FD of live VM's</td>
        </tr>
        <tr>
          <td>Generate skeletal SVD with assigned FD's for 0 non-existent VMs with allocated disks and determine FD of live VM's</td>
        </tr>
      </tbody>
      </table>

- CRP talks to Fabric with a commit Tenant allocation call.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            CommitTenantResourceAllocationRequest: { "FabricTenantName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb", "FabricClusterName": "francec-prod-c", "ServiceInstanceId": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "LogicalTimeStamp": 1 }
            CallbackUri for CommitTenantResourceAllocation request:  
            https://francecentral.compute.azure.com:10010/internal/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/nrpCallback/00912dc7-bb44-4618-b45e-406bc94119a2/onOperationComplete?resourceGroup=MC_myResourceGroup_myAKSCluster_francecentral&availabilitySet=_aks-nodepool1-16061838-vmss_9ccc8658bc674aefb2fd6966f40b5fcb&operationName=CommitTenantResourceAllocation&p=f491ff58-9c6e-4c06-b03b-186170d146b7
            Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658        Start: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658-bc67-4aef-b2fd-6966f40b5fcb/CommitTenantResourceAllocation?api-version=2015-06-15&logicalTimeStamp=1. OngoingCallCount = 1
            End: POST https://francecentral.network.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/tenants/9ccc8658-bc67-4aef-b2fd-6966f40b5fcb/CommitTenantResourceAllocation?api-version=2015-06-15&logicalTimeStamp=1.  
            OngoingCallCount = 0. ResponseHttpVersion: 2.0
          </td>
        </tr>
        <tr>
          <td>
            CommitTenantResourceAllocationRequest: { "FabricTenantName": "345ff9d5-b25c-44f5-83d4-cf3084e55894", "FabricClusterName": "francec-prod-c", "ServiceInstanceId": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "LogicalTimeStamp": 1 }
          </td>
        </tr>
      </tbody>
      </table>

- CRP sends a start call to Fabric and polls for a response.

    <table>
      <thead>
        <tr>
          <th>TIMESTAMP</th>
          <th>traceLevel</th>
          <th>message</th>
          <th>callerName</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>2025-11-28T11:54:43.5440265Z</td>
          <td>8</td>
          <td>Poll for RoleInstance _aks-nodepool1-16061838-vmss_0, shouldBeRunning True completed.</td>
          <td>PollForRoleInstanceStatus</td>
        </tr>
        <tr>
          <td>2025-11-28T11:54:44.8680505Z</td>
          <td>8</td>
          <td>Poll for RoleInstance _aks-nodepool1-16061838-vmss_1, shouldBeRunning True completed.</td>
          <td>PollForRoleInstanceStatus</td>
        </tr>
      </tbody>
      </table>

- There was a callback notification from Fabric stating the VM provisioning succeeded.

    <table>
      <thead>
        <tr>
          <th>message</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "5df553f1-db37-405b-a07d-b4172a77bf7e", "guestOsProvisioningResult": "InProgress", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276835058147 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "9ccc8658-bc67-4aef-b2fd-6966f40b5fcb.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "5df553f1-db37-405b-a07d-b4172a77bf7e", "guestOsProvisioningResult": "Success", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276845839265 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "3407ff7a-0841-4d3c-a00e-1c5c48742e4a", "guestOsProvisioningResult": "InProgress", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276848554563 }
          </td>
        </tr>
        <tr>
          <td>
            Got Fabric callback notification: { "serviceInstanceName": "345ff9d5-b25c-44f5-83d4-cf3084e55894.0", "roleInstanceIsRunning": true, "roleInstanceIsExpectedToRun": true, "vmId": "3407ff7a-0841-4d3c-a00e-1c5c48742e4a", "guestOsProvisioningResult": "Success", "expectedRunningStateChangedReason": "Start", "containerState": { "isUpdatedToLatestConfigFile": true, "isRunning": true, "isFaulted": false, "toBeDeleted": false, "normalizedFaultInfo": { "faultCode": 0 } }, "logicalTimeStamp": 638999276892148613 }
          </td>
        </tr>
      </tbody>
      </table>

> **Now regarding the CRP \--\> NRP trace as mentioned above** We will use the \"x-ms-request-id\" to trace the calls in NRP logs.
>
> **Important:** \'x-ms-request-id\' in CRP ContextActivity _equals_ OperationID in NRP QOSEtwEvent table _equals_ OperationID in NRP FrontEndOperationEtwEvent

### NRP

#### 1. QosEtwEvent

> **QosEtwEvent table** will have summary of all the operations in NRP.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('nrp.kusto.windows.net').database('mdsnrp')]
QosEtwEvent
| where PreciseTimeStamp between(datetime("2025-11-28T11:50:35.1488140Z") .. datetime("2025-11-28T12:54:35.1488140Z"))
| where SubscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where ResourceGroup contains "MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL"
| where HttpMethod notcontains "GET"
//| where Success != "1"
| project StartTime, PreciseTimeStamp, CorrelationRequestId, OperationId, HttpMethod, ErrorCode, UserError, Success, ErrorDetails, TeamName, ResourceType, ResourceName, OperationName, Region, TraceSource, ResourceGroup
```

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 7%" />
<col style="width: 9%" />
<col style="width: 9%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 13%" />
</colgroup>
<thead>
<tr>
<th>StartTime</th>
<th><blockquote>
<p>PreciseTimeStamp</p>
</blockquote></th>
<th>CorrelationRequestId</th>
<th>OperationId</th>
<th><blockquote>
<p>HttpMetho d</p>
</blockquote></th>
<th>ErrorCode</th>
<th style="text-align: center;">UserError</th>
<th style="text-align: center;">Success</th>
<th><blockquote>
<p>ErrorDetails</p>
</blockquote></th>
<th><blockquote>
<p>TeamName</p>
</blockquote></th>
<th><blockquote>
<p>ResourceType</p>
</blockquote></th>
<th><blockquote>
<p>ResourceName</p>
</blockquote></th>
<th><blockquote>
<p>OperationName</p>
</blockquote></th>
<th><blockquote>
<p>Region</p>
</blockquote></th>
<th><blockquote>
<p>TraceSourc e</p>
</blockquote></th>
<th>ResourceGroup</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T11:53:10.779</p>
<p>8491Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:10.810</p>
<p>1821Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>0512a14f-b45b-4c78-bcba- cac0a3b8c7fd</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>publicIPAddresses</p>
</blockquote></td>
<td><blockquote>
<p>12498857-13b0-4113-806a-</p>
<p>c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>PutPublicIpAddressOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.779</p>
<p>8491Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:11.032</p>
<p>0966Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>0512a14f-b45b-4c78-bcba- cac0a3b8c7fd</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>publicIPAddresses</p>
</blockquote></td>
<td><blockquote>
<p>12498857-13b0-4113-806a-</p>
<p>c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>PutPublicIpAddressOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.076</p>
<p>7439Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:13.110</p>
<p>4134Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>8624f6a6-93dc-45a7-9a54-</p>
<p>d14c9fdf1d99</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:15.404</p>
<p>8885Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:15.420</p>
<p>9502Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>e3610cc4-8e72-455b- b593-202c29f67ba2</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.264</p>
<p>3083Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:20.298</p>
<p>4760Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>0c58447f-3c62-439b-88df-48a43</p>
<p>a58df48</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkSecurityGro ups</p>
</blockquote></td>
<td><blockquote>
<p>aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>PutNetworkSecurityGroupO peration</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.264</p>
<p>3083Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:20.560</p>
<p>1187Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>0c58447f-3c62-439b-88df-48a43</p>
<p>a58df48</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkSecurityGro ups</p>
</blockquote></td>
<td><blockquote>
<p>aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>PutNetworkSecurityGroupO peration</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.998</p>
<p>7037Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:23.048</p>
<p>9831Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>01822e35-be78-46d0-</p>
<p>a5f0-8f3d5a2dea18</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualNetworks</p>
</blockquote></td>
<td><blockquote>
<p>aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>PutVirtualNetworkOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.998</p>
<p>7037Z</p></td>
<td><blockquote>
<p>2025-11-28T11:53:24.658</p>
<p>5012Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td><p>01822e35-be78-46d0-</p>
<p>a5f0-8f3d5a2dea18</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualNetworks</p>
</blockquote></td>
<td><blockquote>
<p>aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>PutVirtualNetworkOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:35.124</p>
<p>3204Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:35.143</p>
<p>4710Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>201243d9-9af9-44e5-9885-0b15</p>
<p>4fac01fe</p></td>
<td><blockquote>
<p>POST</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>ValidateVMScaleSetOperatio n</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_MYRESOURCEGROUP_MYAKSCLUSTER_FR ANCECENTRAL</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.382</p>
<p>9357Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>05e79930-3896-4e3f-a12a-</p>
<p>b22abede7b2a</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>BatchPutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>1170Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>bc008fd5-9d81-49da-99f4-37ec3 9bbd2d0</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>1315Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>6c3e2ebf-abe8-4a6f- be37-2f1ce9cb862e</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.408</p>
<p>3574Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td><p>ae1875bf-1571-4282-bf17-</p>
<p>a010d7682fb1</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.799</p>
<p>6436Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>6c3e2ebf-abe8-4a6f- be37-2f1ce9cb862e</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:36.358</p>
<p>7006Z</p></td>
<td><blockquote>
<p>2025-11-28T11:54:36.799</p>
<p>6442Z</p>
</blockquote></td>
<td>4cde1129-cb5f-4214-acdb- a65ffccfca9f</td>
<td>bc008fd5-9d81-49da-99f4-37ec3 9bbd2d0</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td style="text-align: center;">false</td>
<td style="text-align: center;">true</td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
</tbody>
</table>

<table>
<colgroup>
<col style="width: 7%" />
<col style="width: 7%" />
<col style="width: 9%" />
<col style="width: 9%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 6%" />
<col style="width: 9%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 13%" />
</colgroup>
<thead>
<tr>
<th><p>2025-11-28T11:54:36.343</p>
<p>0875Z</p></th>
<th><blockquote>
<p>2025-11-28T11:54:36.813</p>
<p>1853Z</p>
</blockquote></th>
<th><p>4cde1129-cb5f-4214-acdb-</p>
<p>a65ffccfca9f</p></th>
<th><p>ae1875bf-1571-4282-bf17-</p>
<p>a010d7682fb1</p></th>
<th><blockquote>
<p>PUT</p>
</blockquote></th>
<th></th>
<th><blockquote>
<p>false</p>
</blockquote></th>
<th><blockquote>
<p>true</p>
</blockquote></th>
<th></th>
<th><blockquote>
<p>Rnm</p>
</blockquote></th>
<th><blockquote>
<p>virtualMachineScale</p>
<p>Sets</p>
</blockquote></th>
<th><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></th>
<th><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></th>
<th><blockquote>
<p>francec</p>
</blockquote></th>
<th></th>
<th><p>MC_myResourceGroup_myAKSCluster_francec</p>
<p>entral</p></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:04:00.101</p>
<p>6438Z</p></td>
<td><blockquote>
<p>2025-11-28T12:04:00.115</p>
<p>8249Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>8adf4885-ca8a-4801- bc7f-5f0310b0c653</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.696</p>
<p>0419Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.710</p>
<p>0840Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td>9dccaf94-922e-4c27-805f-583c9 76387a2</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>networkInterfaces</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>BatchPutNicOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.680</p>
<p>4165Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.730</p>
<p>7864Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td>30dd9615-454d-4caa-a44c- ec0481cc92cf</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:05:19.758</p>
<p>5447Z</p></td>
<td><blockquote>
<p>2025-11-28T12:05:19.793</p>
<p>7248Z</p>
</blockquote></td>
<td>396c83fc-bef2-4aa9- b916-06482bba1bc4</td>
<td><p>63123644-85c3-40aa-</p>
<p>a81e-691ffcf53470</p></td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Rnm</p>
</blockquote></td>
<td><blockquote>
<p>virtualMachineScale Sets</p>
</blockquote></td>
<td><blockquote>
<p>aks-nodepool1-16061838-vmss</p>
</blockquote></td>
<td><blockquote>
<p>PutVMScaleSetOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.601</p>
<p>7769Z</p></td>
<td><blockquote>
<p>2025-11-28T12:35:17.612</p>
<p>9360Z</p>
</blockquote></td>
<td><p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p></td>
<td>68c2fe8e-da03-42de-80b2- b84ccc106020</td>
<td><blockquote>
<p>PUT</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>false</p>
</blockquote></td>
<td><blockquote>
<p>true</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>Slb</p>
</blockquote></td>
<td><blockquote>
<p>loadBalancers</p>
</blockquote></td>
<td><blockquote>
<p>kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>PutLoadBalancerOperation</p>
</blockquote></td>
<td><blockquote>
<p>francec</p>
</blockquote></td>
<td></td>
<td>MC_myResourceGroup_myAKSCluster_francec entral</td>
</tr>
</tbody>
</table>

#### 2. FrontendOperationEtwEvent

> The FrontendOperationEtwEvent table  will have verbose logs for each operation we see in QosEtwEvent table.

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('nrp.kusto.windows.net').database('mdsnrp')]
FrontendOperationEtwEvent
| where PreciseTimeStamp between(datetime("2025-11-28T11:50:35.1488140Z") .. datetime("2025-11-28T12:54:35.1488140Z"))
| where SubscriptionId has '28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5'
| where ResourceGroup contains "MC_MYRESOURCEGROUP_MYAKSCLUSTER_FRANCECENTRAL"
| where OperationId contains "0512a14f-b45b-4c78-bcba-cac0a3b8c7fd"
| project PreciseTimeStamp, Message, ResourceName, ResourceGroup, HttpMethod, EventCode
```

  <table>
    <thead>
      <tr>
        <th>Message</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          GetNrpAuditEvent completed in 0 ms
          Start->PutPublicIpAddressOperation:11/28/2025 11:53:10 AM
          PUT https://francecentral.network.azure.com:30112/11d2ef40-dfa2-492d-a2df-2c920409c411/134059748699071081/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPAddresses/12498857-13b0-4113-806a-c631da6e48da?api-version=2024-07-01  
          x-ms-client-session-id: 6df685b8-5985-4a36-8a00-7233bda89377  
          x-ms-client-request-id: 9019190e-cbcd-406f-87a9-48481f70a6d1  
          client-request-id: 9019190e-cbcd-406f-87a9-48481f70a6d1  
          traceparent: 00-e353f77cd3dabd00c4f3d53a5b9d55ef-287d112921d12775-01  
          X-Forwarded-For: 98.66.132.152  
          X-Azure-Ref: Ref A: 76AEC75924CD47E38CF374C53F449923 Ref B: PAR611100604031 Ref C: 2025-11-28T11:53:10Z  
          X-Forwarded-Host: francecentral.management.azure.com  
          X-Forwarded-Proto: https  
          X-Azure-RequestChain: hops=1
          X-Azure-JA4-Fingerprint: t13d1311h2_f57a46bbacb6_e7c285222651
          x-ms-operation-context: (appId=7319c514-987d-4e9b-ac3d-d38c4f427f4c, tenantId=16b3c013-d300-468d-ac64-7eda0820b6d3, ...)  
          x-ms-arm-resource-system-data: {"createdBy":"7319c514-987d-4e9b-ac3d-d38c4f427f4c", ...}
          Azure-AsyncNotificationUri: https://francecentral.management.azure.com/providers/Microsoft.Resources/notifyResourceJobs?api-version=2018-02-01&asyncNotificationToken=...
          Operation PutPublicIpAddressOperation (0512a14f-b45b-4c78-bcba-cac0a3b8c7fd), thread 872 acquiring lock
          PublicIP '/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/.../12498857-13b0-4113-806a-c631da6e48da' has 'IPv4' configuration
          Standard Static public ip requires a VIP  creating Vip Allocation 47ef59ae-897d-4ff3-9644-0aa33e3a0633 (target: fabric:/rnm/vipmanager/11)
          Added SLbServiceModule /subscriptions/.../slbServiceModule/82075459-09ae-45cc-b234-d4c14e5e077a for V2 public IP
          Incrementing subscription public IP counts (Standard IPv4 = +1)
          AsyncOperation: https://francecentral.management.azure.com/subscriptions/.../operations/0512a14f-b45b-4c78-bcba-cac0a3b8c7fd?api-version=2024-07-01
          Allocating VIP for public ip /subscriptions/.../12498857-13b0-4113-806a-c631da6e48da
          InventoryManagementFacade AllocateVips request (AllocationId: 47ef59ae-897d-4ff3-9644-0aa33e3a0633)
          Completed Async Job Batch (RnmVipAllocationAsyncJobQueue)
          Finished AllocateVips  AllocatedIpAddress: 4.251.129.109
         Allocated public Ip 4.251.129.109 for the resource, allocationId 47ef59ae-897d-4ff3-9644-0aa33e3a0633
        </td>
      </tr>
    </tbody>
    </table>

### ARM to NRP

```text
Open in [ADX Web] [Kusto.Explorer] [Fabric] [cluster('armprodgbl.eastus.kusto.windows.net').database('ARMProd')]
cluster('akshuba.centralus').database('AKSprod').OutgoingRequestTrace 
| where PreciseTimeStamp > ago(14d)
| where subscriptionID has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where resourceGroupName has 'myResourceGroup'
| where resourceName has 'myAKSCluster'
| where httpMethod !contains "GET" and suboperationName !contains "na"
| where operationID contains "6df685b8-5985-4a36-8a00-7233bda89377"
| where targetURI contains "Microsoft.Network"
//| where correlationID contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| project PreciseTimeStamp, operationName, suboperationName, targetURI, correlationID, statusCode, durationInMilliseconds, operationID
```

  <table>
    <thead>
      <tr>
        <th>operationName</th>
        <th>suboperationName</th>
        <th>targetURI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=2022-07-01
        </td>
      </tr>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=202
        </td>
      </tr>
      <tr>
        <td>PutManagedClusterHandler.PUT</td>
        <td>Creating</td>
        <td>
          https://francecentral.management.azure.com/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral/setResourceOwnership?api-version=2022-07-01
        </td>
      </tr>
    </tbody>
    </table>

> Note the **correlation ID** and Go to ARM:

```text
//17818e60-7ddc-4c69-b5de-03c27724da9d
cluster('armprodgbl.eastus').database('ARMProd').Unionizer("Requests","EventServiceEntries") 
| where TIMESTAMP > ago(14d)
| where subscriptionId has "28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5"
| where correlationId contains "17818e60-7ddc-4c69-b5de-03c27724da9d"
| where operationName notcontains "Microsoft.Authorization/policies/auditIfNotExists/action"
| where operationName notcontains "Microsoft.Authorization/policies/audit/action"
| where operationName notcontains "Microsoft.Authorization/policies/deployIfNotExists/action"
| where operationName contains "microsoft.network"
| project PreciseTimeStamp, operationName, resourceProvider, correlationId , status, subStatus , resourceUri , eventName , operationId, armServiceRequestId, subscriptionId
| sort by PreciseTimeStamp desc nulls last
```

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 10%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th>PreciseTimeStamp</th>
<th><blockquote>
<p>operationName</p>
</blockquote></th>
<th><blockquote>
<p>resourceProvid er</p>
</blockquote></th>
<th><blockquote>
<p>correlationId</p>
</blockquote></th>
<th><blockquote>
<p>status</p>
</blockquote></th>
<th><blockquote>
<p>subStatus</p>
</blockquote></th>
<th><blockquote>
<p>resourceUri</p>
</blockquote></th>
<th style="text-align: center;">eventName</th>
<th>operationId</th>
<th>armServiceRequestId</th>
<th>subscriptionId</th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:45:19.</p>
<p>7823426Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>cf418810-080b-4265-95aa-</p>
<p>06b84caa2cdf</p></td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>9172158Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>96ca7b2d-939b-4d4e-9c03- 3c390be37e7d</td>
<td><p>93ec84c1-</p>
<p>cbfe-4de2-90b6-270aa7bfb</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>

**More logs:**

<table>
<colgroup>
<col style="width: 6%" />
<col style="width: 10%" />
<col style="width: 4%" />
<col style="width: 8%" />
<col style="width: 3%" />
<col style="width: 3%" />
<col style="width: 34%" />
<col style="width: 3%" />
<col style="width: 8%" />
<col style="width: 8%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr>
<th></th>
<th></th>
<th></th>
<th></th>
<th style="text-align: center;"></th>
<th></th>
<th><blockquote>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></th>
<th></th>
<th></th>
<th>87d</th>
<th></th>
</tr>
</thead>
<tbody>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>6933011Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>96ca7b2d-939b-4d4e-9c03- 3c390be37e7d</td>
<td><p>93ec84c1-</p>
<p>cbfe-4de2-90b6-270aa7bfb 87d</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>6280369Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>98e640ca-da7d-4881-9b5c- cab1396afc9f</td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:35:17.</p>
<p>4191774Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>98e640ca-da7d-4881-9b5c- cab1396afc9f</td>
<td><p>b018e1e9-0e2a-4501-ab45-</p>
<p>d363ba14b772</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:14:02.</p>
<p>0891667Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>a130d88a-2282-45f6-ac1b-</p>
<p>eb78fc96e7c7</p></td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>2911382Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>4163a76b-791c-4efb- bee1-47afd088f327</td>
<td><p>38902aa7-</p>
<p>fda6-4e50-9727-0c37b43a3</p>
<p>3d1</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>2196885Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>4163a76b-791c-4efb- bee1-47afd088f327</td>
<td><p>38902aa7-</p>
<p>fda6-4e50-9727-0c37b43a3</p>
<p>3d1</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:04:00.</p>
<p>1845329Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan
cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>95fe0734-af11-4973-8085- f70405649ea2</td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:03:59.</p>
<p>9643626Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>95fe0734-af11-4973-8085- f70405649ea2</td>
<td>9d45fba5-3e66-4ccc-840d- a9b99ff43585</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T12:03:16.</p>
<p>9880558Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>588cd53b-</p>
<p>eb70-4db5-8447-</p>
<p>eaf26497813a</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:32.</p>
<p>8071545Z</p></td>
<td><blockquote>
<p>Microsoft.Network/locations/setReso urceOwnership/action</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Accepted</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>c0a2587b-</p>
<p>b375-4070-8c01-5c27464d8</p>
<p>3db</p></td>
<td>778eea40-98d6-405d-af0c- ea3ae9aac820</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:54:32.</p>
<p>7288580Z</p></td>
<td><blockquote>
<p>Microsoft.Network/locations/setReso urceOwnership/action</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-bcd3aa9e0ff5/providers/Microsoft.Network/locations/francecentral</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>c0a2587b-</p>
<p>b375-4070-8c01-5c27464d8</p>
<p>3db</p></td>
<td>778eea40-98d6-405d-af0c- ea3ae9aac820</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:25.</p>
<p>9278954Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet</p>
<p>works/aks-vnet-29823133</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>6ee6f320-2056-481d- b836-50bb56a029f9</td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:25.</p>
<p>0954613Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>cb4b665d-2a09-456a-bfe9- f14a8c15ce17</td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:23.</p>
<p>1717608Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet
works/aks-vnet-29823133</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>7ef60c21-7b23-4611-a536-</p>
<p>fed991ef2664</p></td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:22.</p>
<p>6676037Z</p></td>
<td><blockquote>
<p>Microsoft.Network/virtualNetworks/ write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/virtualNet</p>
<p>works/aks-vnet-29823133</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>7ef60c21-7b23-4611-a536-</p>
<p>fed991ef2664</p></td>
<td>c80518c1-7350-4ee7-8fb4- b5cb66529714</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.</p>
<p>3993294Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>18177c24-b614-48ae-b3b3-</p>
<p>ab9da5ef38cf</p></td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:20.</p>
<p>1552363Z</p></td>
<td><blockquote>
<p>Microsoft.Network/networkSecurityG roups/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/networkS</p>
<p>ecurityGroups/aks-agentpool-29823133-nsg</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>18177c24-b614-48ae-b3b3-</p>
<p>ab9da5ef38cf</p></td>
<td>6f25f8f3-09f3-4eea-ba9f- a32556f468f5</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>5057344Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>07d4f337-</p>
<p>ec7a-4e04-90a2-8ee040318</p>
<p>5a5</p></td>
<td><p>e1b2df62-</p>
<p>b85f-46be-8eb8-5c98c2b18 f28</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>3891275Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>07d4f337-</p>
<p>ec7a-4e04-90a2-8ee040318</p>
<p>5a5</p></td>
<td><p>e1b2df62-</p>
<p>b85f-46be-8eb8-5c98c2b18 f28</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>3479226Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>OK</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>ca4c66e1-dcd0-4747-8d80- ff7fb3be6c04</td>
<td><p>254e9255-3968-4e43-af06-</p>
<p>e81c6ab24fe8</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:16.</p>
<p>0502352Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourcegroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA
ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>50171154-1483-490d-8e5a-</p>
<p>575af1cd3c27</p></td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:15.</p>
<p>3085762Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>ca4c66e1-dcd0-4747-8d80- ff7fb3be6c04</td>
<td><p>254e9255-3968-4e43-af06-</p>
<p>e81c6ab24fe8</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>4893965Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>NoConten t</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>9f0b483b-be5b-4382- b43a-08e34b9e0b9d</td>
<td>b8adfbd0-e19f-4029-80de- b5152430a90e</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>4518011Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/delete</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/aks-managed-temp-outbound-ip</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>9f0b483b-be5b-4382- b43a-08e34b9e0b9d</td>
<td>b8adfbd0-e19f-4029-80de- b5152430a90e</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:13.</p>
<p>2028689Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;"><blockquote>
<p>Succeede d</p>
</blockquote></td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td><p>e0255231-fcca-4195-</p>
<p>a072-6e9d8f878d6b</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:12.</p>
<p>8131833Z</p></td>
<td><blockquote>
<p>Microsoft.Network/loadBalancers/wri te</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/loadBalan</p>
<p>cers/kubernetes</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td><p>e0255231-fcca-4195-</p>
<p>a072-6e9d8f878d6b</p></td>
<td><p>3b342bef-</p>
<p>f197-4368-9f35-2b04af66f4f 9</p></td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.</p>
<p>9364582Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Accepted</td>
<td><blockquote>
<p>Created</p>
</blockquote></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td style="text-align: center;">EndRequest</td>
<td>f93963d7-c1fa-4973-9e87- e95e2b770094</td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
<tr>
<td><p>2025-11-28T11:53:10.</p>
<p>6040214Z</p></td>
<td><blockquote>
<p>Microsoft.Network/publicIPAddresse s/write</p>
</blockquote></td>
<td><blockquote>
<p>Microsoft.Net work</p>
</blockquote></td>
<td><blockquote>
<p>17818e60-7ddc-4c69-</p>
<p>b5de-03c27724da9d</p>
</blockquote></td>
<td style="text-align: center;">Started</td>
<td></td>
<td><blockquote>
<p>/subscriptions/28abb06e-c75e-47f2-ba8d-
bcd3aa9e0ff5/resourceGroups/MC_myResourceGroup_myAKSCluster_francecentral/providers/Microsoft.Network/publicIPA</p>
<p>ddresses/12498857-13b0-4113-806a-c631da6e48da</p>
</blockquote></td>
<td><blockquote>
<p>BeginReque st</p>
</blockquote></td>
<td>f93963d7-c1fa-4973-9e87- e95e2b770094</td>
<td>a4470ee5-8268-4b2c-b2e4- ac3217562334</td>
<td>28abb06e-c75e-47f2- ba8d-bcd3aa9e0ff5</td>
</tr>
</tbody>
</table>
## Owner and Contributors

**Owner:** Saber MHEDHBI <mhedhbisaber@microsoft.com>

**Contributors:**

- Saber MHEDHBI <mhedhbisaber@microsoft.com>

