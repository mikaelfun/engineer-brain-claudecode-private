---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Log Analytics/How-To Guides/RBAC permissions/How-to: Check RBAC details from ASC"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=%2FLog%20Analytics%2FHow-To%20Guides%2FRBAC%20permissions%2FHow-to%3A%20Check%20RBAC%20details%20from%20ASC"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# How to Check RBAC Details from ASC

## Scenario

How to check RBAC (Resource Based Access Control) for a specific user given the email address from ASC (Azure Support Center).

## Required Details

- Subscription Id
- E-mail address of the user we need to check roles for.

## Steps

1. From ASC under **Tenant Explorer**, select "User" under "Azure AD Explorer". Get the **ObjectId** of the User by entering the email address in "search for cloud user" and then click "Run".

2. On the subscription level or resource level, check access for that ObjectId under **Access Control (IAM)**. Enter the ObjectId from step 1 in the "Check Access" area and click "Check Access". The output shows the RBAC role the user has on the subscription or resource level, or if they are part of a group which has RBAC assigned.
