---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD Enterprise Application Management Access and Permissions"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FAzure%20AD%20Enterprise%20Application%20Management%20Access%20and%20Permissions"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- SCIM Identity
- Users Groups Assignment
---

[[_TOC_]]

# Summary

This document covers scenarios for troubleshooting Access and Permissions for Enterprise Applications.

# Scenario TSGs

## I'm having a problem assigning or removing users or groups to an application

### [I don't know how to assign users and groups to an application](https://docs.microsoft.com/azure/active-directory/application-access-assignment-how-to-add-assignment/?/?WT.mc_id=DMC_AAD_Manage_Apps_Troubleshooting_Nav)

### [I want to remove a user's access to an application but I don't know how](https://docs.microsoft.com/azure/active-directory/application-access-assignment-how-to-remove-assignment/?/?WT.mc_id=DMC_AAD_Manage_Apps_Troubleshooting_Nav)

## Self-service application assignment guide

### [I don't know how to configure self-service application assignment](https://docs.microsoft.com/azure/active-directory/application-access-self-service-how-to/?/?WT.mc_id=DMC_AAD_Manage_Apps_Troubleshooting_Nav)

## I'm seeing an unexpected application or application assignment

### [I don't know how a user was assigned to an application](https://docs.microsoft.com/azure/active-directory/application-access-unexpected-user-assignment/?/?WT.mc_id=DMC_AAD_Manage_Apps_Troubleshooting_Nav)

### [I see an unexpected application in my applications list and want to know more about it](https://docs.microsoft.com/azure/active-directory/application-access-unexpected-application/?/?WT.mc_id=DMC_AAD_Manage_Apps_Troubleshooting_Nav)

## I want to review and remove the permissions on an Enterprise Application
- This can be accessed by going to an Enterprise Application
- Under the Security Section, Click Permissions
- Then select Review permissions
- There will be four options available through radio buttons.
- Select the radio button for the desired permission to review.
  - There will be a PowerShell script provided to perform the action desired.
  - ### [Reviewing Enterprise Application permissions](https://docs.microsoft.com/en-us/archive/blogs/office365security/defending-against-illicit-consent-grants)
