---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD.wiki:/Authentication/Entra ID App Management/Application_Consent_Experiences/How to/Azure AD User low risk permission consent in apps"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_Consent_Experiences%2FHow%20to%2FAzure%20AD%20User%20low%20risk%20permission%20consent%20in%20apps"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD User Low Risk Permission Consent in Apps

Tags: cw.Entra, cw.comm-appex, SCIM Identity

> **Compliance note:** This wiki contains test/lab data only.

[[_TOC_]]

## Feature Overview

Allows admins to delegate consent control to users for low-risk delegated permissions. Admins can allow users (and group owners) to consent for apps they own — selecting all, none, or specific delegated permissions.

## Licensing

Requires **Microsoft Entra ID Premium** licensing.

## How to Configure

Navigate to: **Entra ID → Enterprise Applications → Consent and Permissions**

### User Consent Settings

1. *How much consent control would you like to give all users*:
   - **Do not allow user consent**
   - **Allow user consent for apps from verified publishers, for selected permissions** *(Recommended)*
   - **Allow user consent for apps**

2. If "verified publishers + selected permissions" is selected → choose which permissions are classified as low impact by selecting _Select permissions to classify as low impact_
   - Options: **Microsoft APIs** or **APIs my organization uses**

### Group Owner Consent

3. *Group owner consent for apps accessing data*:
   - **Do not allow group owner consent**
   - **Allow group owner consent for selected group owners**
   - **Allow group owner consent for all group owners**

## Troubleshooting

### ICM Escalations

- **Service**: AAD First Party Apps
- **Team**: AAD Application Model
- **Template**: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=HNUz1D

## External Documentation

- [Manage app consent policies for group owners](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-group-owner-consent-policies)
- [Configure how end-users consent to applications](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-user-consent)
- [Managing consent to applications and evaluating consent requests](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/manage-consent-requests)
- [Protecting remote workforce from consent phishing](https://www.microsoft.com/security/blog/?p=91507)
- [Detect and Remediate Illicit Consent Grants](https://docs.microsoft.com/en-us/microsoft-365/security/office-365-security/detect-and-remediate-illicit-consent-grants)
