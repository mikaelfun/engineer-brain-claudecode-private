---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/Azure Policy/How to identify the owning product group of a policy definition for Azure Policy"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FAzure%20Policy%2FHow%20to%20identify%20the%20owning%20product%20group%20of%20a%20policy%20definition%20for%20Azure%20Policy"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to identify the owning product group of a policy definition for Azure Policy

## Introduction

Azure Policy helps enforce organizational standards and assess compliance at-scale. Built-in policy definitions are defined by various Microsoft product teams including Azure Monitor product teams. This article describes how to identify the Microsoft product team responsible for any given built-in policy definition.

## Instructions

1. Open the **Azure Policy** service in the Azure portal (search bar → **Policy**)
2. Select **Definitions** on the left side of the Azure Policy blade
3. Use the filter options to locate your desired policy definition
4. Click on your desired policy definition and copy the **DefinitionID GUID**
   - Ensure that the **Type** of the policy definition is **Built-in**
5. Search the [PolicyMetaData.json](https://msazure.visualstudio.com/One/_search?action=contents&text=file%3A%22PolicyMetaData.json%22&type=code&lp=code-Project&filters=ProjectFilters%7BOne%7DRepositoryFilters%7Bmgmt-Governance-Policy%7D&pageSize=25&result=DefaultCollection/One/mgmt-Governance-Policy/GBmaster//settings/BuiltInPolicies/PolicyMetadata.json) file in the [mgmt-Governance-Policy](https://msazure.visualstudio.com/One/_git/mgmt-Governance-Policy) repository for your policy DefinitionID
   - You will need to be a member of [AzurePolicy Readers (Service Tree service)](https://myaccess.microsoft.com/@microsoft.onmicrosoft.com#/access-packages/571cd044-5f2f-42ca-ac9a-cbc529619546) in MyAccess
6. Copy the **serviceTreeId**
7. Navigate to https://aka.ms/servicetree
8. In the **Search** box, paste the value from **serviceTreeId**
9. Click on the matching service tree entity to get details including Dev and PM owners

With this information, you can either collaborate with resource provider teams or [escalate to the appropriate Azure Monitor PG](/Azure-Monitor/Collaboration-Guides/Product-Group-Escalation).
