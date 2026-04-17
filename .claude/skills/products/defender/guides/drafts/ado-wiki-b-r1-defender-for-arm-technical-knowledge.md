---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for ARM/[Technical Knowledge] - Defender for ARM"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FDefender%20for%20Cloud%2FWorkload%20Protections%2FDefender%20for%20ARM%2F%5BTechnical%20Knowledge%5D%20-%20Defender%20for%20ARM"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Defender for ARM (Azure Resource Manager)**

This page describe the Defender for ARM feature.

[[_TOC_]]
# Defender for ARM

Microsoft Defender for Azure Resource Manager automatically monitors the resource management operations in your organization, whether they're performed through the Azure portal, Azure REST APIs, Azure CLI, or other Azure programmatic clients. Microsoft Defender for Cloud runs advanced security analytics to detect threats and alerts you about suspicious activity.

Find all there is to know in Doc:
- [Microsoft Defender for Azure Resource Manager - the benefits and features](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-resource-manager-introduction)
- [Respond to Microsoft Defender for Azure Resource Manager alerts](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-resource-manager-usage)

# ARM Authorization alerts

## Intro
- Authorization alerts are a collection of new alert types under the ARM bundle.
- These alerts are scoped to detect anomaly actions at the authorization area.
- The alerts are created by a machine learning (ML) algorithm that processes data in Azure Synapse Analytics. A Kusto query is then executed over the model results to determine whether an alert should be generated.

## Authorization - schema

(See architecture diagram in ADO Wiki)

# ARM Specific pricing calculation

> Note: No longer used - ARM is now under MDC for Servers plan

## Backend transaction query

Customers asking for ARM plan pricing estimation can be provided using this query:

```kusto
let firstPartyAppsSPNonly= dynamic ([
'1f8df027-4f65-451f-bf0c-05c215154146', //Stream Resource Management - Prod
'4115edc4-4de3-4192-811d-660056c485d1', //ServiceBusProdResourceAccess
'2ff814a6-3304-4ab8-85cb-cd0e6f879c1d', //AzureDatabricks
'6bb8e274-af5d-4df2-98a3-4fd78b4cafd9', //Azure Container Instance Service
'4962773b-9cdb-44cf-a8bf-237846a00ab7', //Microsoft.EventGrid
'0b03d5c1-b575-4d80-a203-3aed0ea6c051', //GenevaWarmPathMultiTenantRM
'8378ebc0-1bfd-4b52-b647-83bfc3268536', //CirrusClientServicesProd
'11c174dc-1945-4a9a-a36b-c79a0f246b9b', //Windows Azure Application Insights
'9ae9cfcb-3b6c-457d-a792-93a614513f1b', //SoS Resource Provider
'42a638b4-aa3f-40a1-b7d9-3a168ae722ab', //prodflipgridsp2020
'9469b9f5-6722-4481-a2b2-14ed560b706f', //Hybrid File Sync Service
'd0e7defb-0955-4f3c-b14c-ed053252beaa', //RunnerSvcProdAAD
'262044b1-e2ce-469f-a196-69ab7ada62d3', //Backup Management Service
'730df67f-9f5b-4a74-8f74-b17083810139', //vsts-ghub-mms-mmsghubeus21-RuntimeServicePrincipal
'ddbf3205-c6bd-46ae-8127-60eb93363864', //Microsoft Azure Batch
'bad96e85-3442-4035-8be4-32834a83b0cb', //vsts-ghub-mms-mmsghubeus22-RuntimeServicePrincipal
'b02c679c-1cc5-433e-9864-0c16b94a6b64', //SeaBreeze-InventoryManager
'96231a05-34ce-4eb4-aa6a-70759cbb5e83', //MicrosoftAzureRedisCache
'60e6cd67-9c8c-4951-9b3c-23c25a2169af', //Compute Resource Provider
'e2b15e41-dd46-4bb4-8366-e85fc527b5f9', //ProcessSimpleRP
'da349006-37a3-473f-8585-fca849133cc2', //Azure Key Vault Synthetics
'34b3b81c-a8ad-48c1-8670-8b96f53bef89', //azurert
'722218a7-af64-407c-b608-14f667f9d663', //vsts-ghub-mms-mmsghubeus1-RuntimeServicePrincipal
'483d2301-d3ab-4fc6-9464-3afddfb90b0c', //vsts-prod-mms-mmsprodcus1-RuntimeServicePrincipal
'7319c514-987d-4e9b-ac3d-d38c4f427f4c', //AzureContainerService
'62e7baf3-c611-41d4-a515-b5bc9dc2a488', //SqlCloudDns-PPE (AME)
'80369ed6-5f11-4dd9-bef3-692475845e77', //Microsoft.EventHubs
'6c7f47b9-6b97-4374-9191-33185051a48e', //arcadia-preview (AME)
'85330b27-3780-40ce-94c5-7fa6406b3b33', //ProcessSimpleWorker
'beae6961-643f-4afa-8cc0-8cd83407aa0b', //App Center INT - Log Analytics Workspace Manager
'1c4fb02f-7e93-4ea2-8ae8-725c49f7d412', //vienna-runners
'1a14be2a-e903-4cec-99cf-b2e209259a0f', //Azure Lab Services
'45b9ca71-91c2-4aa3-8501-7405f5025aac', //vsts-ghub-mms-mmsghubeus2-RuntimeServicePrincipal
'6a674a1a-8582-4176-b98d-4976dbd11646', //automated-ingestion
'54207558-8ead-48eb-b19d-daf58b6cf2ed', //vsts-ghub-mms-mmsghubcus1-RuntimeServicePrincipal
'cc1ce1be-98b5-410c-9812-fe772bd69e11', //vsts-prod-mms-mmsprodweu1-RuntimeServicePrincipal
'869a49c3-c404-4f8d-a689-565029085f72', //FlowRunnersClient-AME (AME)
'3896e00e-396f-473f-a894-586ff6d1acd0', //EventGridRunnerTest1
'23e40a52-59f5-4085-b0a0-0c9287dfdb45', //vsts-prod-mms-mmsprodeus21-RuntimeServicePrincipal
'9191c4da-09fe-49d9-a5f1-d41cbe92ad95', //Azure HDInsight Service
'd8e2b765-6517-486d-9153-098a580097d0', //vsts-prod-mms-mmsprodwus21-RuntimeServicePrincipal
'8edd93e1-2103-40b4-bd70-6e34e586362d', //Windows Azure Security Resource Provider
'371cf6f3-ba75-46cf-92e3-e064aa25b974', //XStoreBillingRunnerAppProd
'7cd684f4-8a78-49b0-91ec-6a35d38739ba', //Azure Logic Apps
'fe2d9b27-ba62-4c00-b933-fd2a25a0f491', //cdb-ame-prod-westeurope1-federation (AME)
'9e299542-5496-403d-a20f-f08a4e6704bf', //CirrusImperativeProd (AME)
'514b17ec-0fe2-4f82-8345-2ff3731c276f', //antares-bc0b0109-ea73-4d15-8574-3c20406eb21f (AME)
'453d5b6f-32fb-4549-8760-aa4bd8f88efd', //vsts-ghub-mms-mmsghubcus2-RuntimeServicePrincipal
'8a93bff5-fa11-4352-b96a-9764444f9c9e', //SSISPoolManagementProd (AME)
'b8340c3b-9267-498f-b21a-15d5547fd85e', //Hyper-V Recovery Manager
'f858ebcb-4aa8-43c4-8f2a-96a802d62ef7', //SqlCloudDns-Prod (AME)
'6782adfa-7e18-40ab-b27f-71e4859c1953', //antares-808c0556-4f55-4e01-9293-f5f665c31e0f (AME)
'0c9afdcd-5f66-45f0-a731-865af63dbdbe', //vsts-prod-mms-mmsprodweu2-RuntimeServicePrincipal
'd5d3578d-ebde-4509-9109-c213a64f5c67', //OMSDnsManager (AME)
'0736f41a-0425-4b46-bdb5-1563eff02385', //Azure Machine Learning
'13bec9da-7208-4aa0-8fc7-47b25e26ff5d', //aks-e2e-sp
'5744bc69-8a73-45f7-958d-4640d865f04d', //AzureServiceDeployInternal
'abba844e-bc0e-44b0-947a-dc74e5d09022', //Domain Controller Services
'44627186-a382-4f73-9f92-5630eccbe821', //Azure Deployments Geneva Runner (AME)
'486c78bf-a0f7-45f1-92fd-37215929e116', //GatewayRP
'f5bd6213-474d-4047-b3ea-a30e73931ff4', //cloudtest-dtl
'334465d0-3c1d-4e74-ba44-2a22bc431339', //vmsssqlpoc
'90ba0dbb-25a7-41fe-a207-49cfe34d135a', //E2ETestsRunnerApp
'76c7f279-7959-468f-8943-3954880e0d8c', //Azure SQL Managed Instance to Microsoft.Network
'f36473e5-4cf9-4217-9a83-342123b25e2d', //vsts-prod-mms-mmsprodwcus0-RuntimeServicePrincipal
'475226c6-020e-4fb2-8a90-7a972cbfc1d4', //PowerApps Service
'8122c480-9b56-4413-9338-8397ffffa22b'  //SeaBreezeE2ETest
]);
cluster('armprod.kusto.windows.net').database('ARMProd').HttpIncomingRequests
macro-expand isfuzzy=true ARMProdEG as X
(
    X.database('Requests').HttpOutgoingRequests
    | where TIMESTAMP > ago(1d)
)
| where TIMESTAMP > ago(10d)
| where TaskName != "HttpIncomingRequestStart"
| where authorizationSource != "Direct"
| where clientApplicationId !in (firstPartyAppsSPNonly)
| project-away RoleInstance, Level, EventId, Pid, Tid, ProviderGuid, ProviderName, SourceNamespace, SourceMoniker, SourceVersion, armServiceRequestId, organizationId, contentEncoding, activityVector
| where subscriptionId in ("<SubscriptionId>")
| count
| extend dollars = (todecimal((Count*3))/1000000)*4
```

- The long list of `firstPartyAppsSPNonly` array is the list of application transactions we are **excluding** from billing usage calculation
- The query calculates transactions over a 10-day period and multiplies the result by 4 to estimate a monthly average.
- **This query provides only an estimation and should not be used for precise pricing calculations.**

## ARM metrics - public facing option
Customers can use the new Azure Resource Manager (ARM) metrics available in Azure Monitor:
[Azure Resource Manager metrics in Azure Monitor](https://techcommunity.microsoft.com/t5/azure-governance-and-management/announcing-azure-resource-manager-metrics-in-azure-monitor/ba-p/3037587)  
That will provide a ballpark number of the number of ARM API calls they are making (this number will be higher as it does not filter out internal calls).
