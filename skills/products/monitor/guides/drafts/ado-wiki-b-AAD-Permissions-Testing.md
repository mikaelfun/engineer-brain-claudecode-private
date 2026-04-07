---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Azure Monitor/How-To/General/How to perform Azure Monitor tests and reproductions that require Azure Active Directory permissions"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FAzure%20Monitor%2FHow-To%2FGeneral%2FHow%20to%20perform%20Azure%20Monitor%20tests%20and%20reproductions%20that%20require%20Azure%20Active%20Directory%20permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Introduction

In some cases you may need permissions to an Azure Active Directory (AAD, AzureAD) tenant in order to perform testing or reproduce a customer issue. The internal Azure subscriptions provided under the Microsoft tenant do not provide you with the appropriate permissions to perform some of these actions.

Examples:
- Working with scenarios that require multiple users.
- Working with scenarios that require users to have administrative permissions to Azure AD.
- Working with scenarios against Azure Management Groups.

# Instructions

## Microsoft Full Time Employees (FTEs)

Follow the steps in article [How to get an Azure Tenant and Subscription via Visual Studio benefits](/Azure-Monitor/How-To/Azure-Internal-Subscriptions/How-to-get-an-Azure-Tenant-and-Subscription-via-Visual-Studio-benefits) to acquire your own Azure Active Directory tenant and subscription.

## Vendors and Outsourced Resources

You will need to collaborate with a Microsoft FTE to leverage their benefits. Please reach out to your TA, PTA or a SME for assistance.
