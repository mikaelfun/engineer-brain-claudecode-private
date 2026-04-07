---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/Azure AD single sign-on for JIRA and Confluence"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra+ID+App+Management%2FApplication_and_Service_Principal_Object_Management%2FHow+to%2FAzure+AD+single+sign-on+for+JIRA+and+Confluence"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Azure AD Single Sign-On for JIRA and Confluence

## Retirement Notice (March 2026)

Microsoft will retire support for the Microsoft Entra SSO plug-ins for Atlassian Jira Server/Data Center and Confluence Server/Data Center on **June 30, 2026**.

After June 30, 2026, existing plug-ins will continue to function, but Microsoft will no longer provide updates, bug fixes, or technical support.

This change applies **only** to the Microsoft Entra SSO plug-ins for self-hosted Jira and Confluence Server/Data Center deployments. Atlassian Cloud services (Jira Cloud, Confluence Cloud) continue to be supported through existing Atlassian Cloud Microsoft Entra integrations.

### Recommended Migration Steps

- Migrate to Atlassian Cloud: https://www.atlassian.com/migration/assess/journey-to-cloud
- Move to Atlassian Data Center's native SAML SSO: https://confluence.atlassian.com/enterprise/saml-single-sign-on-for-atlassian-data-center-applications-857050705.html
- Review identity architecture and internal documentation

## Feature Overview

The plug-in provides SAML 2.0 SSO capability for on-premises Atlassian JIRA (Core, Software, Service Desk) and Confluence using Entra ID as IdP. The plugin is FREE for customers.

## Prerequisites

- Entra ID subscription
- JIRA Core/Software 6.0-7.2.0 or JIRA Service Desk 3.0-3.2 on Windows 64-bit
- JIRA/Confluence server must be HTTPS enabled
- Server must be reachable on internet for Entra ID authentication
- Admin credentials in JIRA
- WebSudo disabled

## Limitations

- SSO plugin must be manually upgraded
- Only works with on-premises versions (not cloud)
- Only works with Entra ID as IdP (no other IdPs)
- No user provisioning (user must exist in application)
- Does not support cluster versions
- Does not support HTTP (HTTPS only)
- Tested only on 64-bit Windows Server

## Plugin Download Links

- JIRA: https://www.microsoft.com/en-us/download/details.aspx?id=56506
- JIRA 5.2: https://www.microsoft.com/en-us/download/details.aspx?id=56521
- Confluence: https://www.microsoft.com/en-us/download/details.aspx?id=56503

## Tutorials

- JIRA: https://docs.microsoft.com/en-us/azure/active-directory/active-directory-saas-jiramicrosoft-tutorial
- Confluence: https://docs.microsoft.com/en-us/azure/active-directory/active-directory-saas-confluencemicrosoft-tutorial

## ICM Escalation

Template: https://portal.microsofticm.com/imp/v3/incidents/create?os=31024&tm=0

## Support Contact

Azure AD SSO Integration Team: SaaSApplicationIntegrations@service.microsoft.com (24-48 business hours response)
