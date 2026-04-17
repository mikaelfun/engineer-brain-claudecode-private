---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Troubleshoting Guides/Find user or application performing operation"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Resource%20Manager%20%28ARM%29%2FTroubleshoting%20Guides%2FFind%20user%20or%20application%20performing%20operation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

## Introduction

This article explains how to find the information for users or applications that are executing operations in Azure.

## From ASC

### Finding who/what a principal id belongs to
With a **PrincipalOid** (also known as Principal ID) you can determine the user/service principal executing an operation. This value can be found in the **ARMprod** Kusto cluster > **HttpIncomingRequests** table > **principalOid** column.

The easiest way to get these details is in ASC's Tenant Explorer Directory Object option.

To navigate there go to **Azure Support Center** > **Tenant Explorer** > **Directory Object**

You can also use the link below for reference, but replacing `{tenantId}` and `{caseNumber}` will be required.

```
https://azuresupportcenter.msftcloudes.com/tenantexplorerv2/{tenantId}%2Fdirectory%20object?srId={caseNumber}&tab=Search+for+directory+object
```

> The link above is for the public cloud instance of ASC. For government clouds, replace the ASC domain to the corresponding ASC instance link.

### Finding an application

With an **application id** (also known as appId or clientAppId) you can determine the user/service principal executing an operation.  This field can be found in the **ARMprod** Kusto cluster > **HttpIncomingRequests** table > **clientApplicationId** column.

The information for an application can be obtained via ASC's Tenant Explorer Application option.

To navigate there go to **Azure Support Center** > **Tenant Explorer** > **Application**

You can also use the link below for reference, but replacing `{tenantId}` and `{caseNumber}` will be required.

```
https://azuresupportcenter.msftcloudes.com/tenantexplorerv2/{tenantId}%2Fapplication?srId={caseNumber}&tab=Applications
```

> The link above is for the public cloud instance of ASC. For government clouds, replace the ASC domain to the corresponding ASC instance link.

Make sure the Search Type selected option is **AppId**.

## From Jarvis

### Finding who/what a principal id belongs to
Use [[JARVIS] Get graph resource details from principal id](https://portal.microsoftgeneva.com/8A23A6C4?genevatraceguid=e27c7f4e-6185-43da-a539-f4d4b4613dd3) action.

![image.png](/.attachments/image-7b375fea-808a-4d05-b77f-8bd7ef46b6c4.png)
