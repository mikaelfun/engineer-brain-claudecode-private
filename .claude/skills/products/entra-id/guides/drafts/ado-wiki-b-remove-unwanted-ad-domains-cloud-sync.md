---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Cloud Sync/Object Sync/Remove unwanted AD Domains from Cloud Sync Configuration dropdown menu"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD/pages?pagePath=/Sync%20Provisioning/Cloud%20Sync/Object%20Sync/Remove%20unwanted%20AD%20Domains%20from%20Cloud%20Sync%20Configuration%20dropdown%20menu"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD Synchronization
- cw.AAD Workflow
- cw.AzureAD
- cw.Connect Health
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD Synchronization](/Tags/AAD-Synchronization) [AAD Workflow](/Tags/AAD-Workflow) [AzureAD](/Tags/AzureAD) [Connect Health](/Tags/Connect-Health)  
 


[[_TOC_]]

# Description
When a Tenant administrator installs an on-premises agent (AAD Connect Provisioning Agent) and adds an Active Directory Domain by running the configuration Wizard, a published resource is created at the tenant.
This 'published resource' represents the on-premises directory that the tenant and the tenant administrator can then complete the cloud sync configuration from the Azure Portal by accessing the Azure AD Connect Blade -> Azure AD Connect cloud sync and clicking on + New Configuration.

At the New cloud sync configuration page a dropdown list with all available 'published resource' created by the AAD Connect Provisioning Agent will be presented to the administrator.

  ![Image-with-portal-example](.attachments/AAD-Synchronization/673376/CloudSyncNewConfiguration1.png)

An administrator can add a domain to experiment with cloud sync, or even decommission an unneeded domain and raise a question, How do I clear this unwanted entry from my tenant after it is created? This article is a how to guide on removing the unneeded 'published resource'.

<mark><span style="color:red">**IMPORTANT!**</span><br /> We should only perform the deletion of a 'published resource' if this is not in current use by a Cloud Sync configuration. Removal of a resource in use will disrupt user provisioning jobs.<br />Also, the same published resource could be shared by other provisioning applications such as "WorkDay to AD" or "SuccessFactors to AD". Before deleting a published resource, verify if any of these applications are present and if they are synchronizing to the AD domain corresponding to the published resource. If the published resource is deleted whilst in use by any of these applications, the applications will stop synchronizing. </mark>

## How to remove unwanted 'publishedResouce'?

1) List the currently registered publishedResource entries

> Microsoft Graph Explorer

```
GET   https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/publishedResources
```

2) Take note of the publishedResource id

Example of entries that will be returned by the query above:

```
        {
            "id": "9f94df27-28d9-4cbb-88f3-ef18caaa2fa0",
            "displayName": "contoso.local",
            "resourceName": "contoso.local",
            "publishingType": "provisioning"
        },
```

Take note of the id for the entry that will be removed.

3) Execute a delete call in Graph Explorer

> Microsoft Graph Explorer

```
DELETE   https://graph.microsoft.com/beta/onPremisesPublishingProfiles/provisioning/publishedResources/9f94df27-28d9-4cbb-88f3-ef18caaa2fa0/
```
After running the query a success No Content - 204 will be returned.
Verify the results at the Azure Portal

  ![Image-with-portal-example](/.attachments/AAD-Synchronization/673376/CloudSyncNewConfiguration2.png)
