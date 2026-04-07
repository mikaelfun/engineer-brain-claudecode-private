---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/Azure AD Connect Health for ADFS"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FAzure%20AD%20Connect%20Health%20for%20ADFS"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs troubleshooting
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[[_TOC_]]

## Overview

Azure AD Connect Health for Sync monitors and provides information on the synchronizations that occur between your on-premises Active Directory and Azure Active Directory utilizing an agent installed with Azure Active Directory Connect. It features:

  - Insight into Alerts (see References) and latency
  - Insight into Sync Errors plus provides corrective measures
  - Ability to grant Role Base Access Control (RBAC) to the tool via the Users Tile

## What's New

Per GDPR compliance requirements, Servers with active **Health Service not up to date Error** alerts continuously for over 30 days suggest that no data has reached Connect Health during the time span. These servers will be disabled and not shown in Connect Health portal.

Please note that this does not apply to **Warnings** with the same alert type. Warnings indicate that we are receiving partial data.


### Risky IP

Risky IP is a new feature we launched in public preview for ADFS extranet lockout and bad U/P. [Read more](https://docs.microsoft.com/azure/active-directory/connect-health/active-directory-aadconnect-health-adfs#risky-ip-report) about the feature.

## GDPR and data retention policy

In compliance with GDPR and data retention policy, Azure AD Connect Health provides the option to stop data collection of all registered services in the tenant.

Once the process begins, Connect Health service will stop receiving, processing, and reporting any data of all your services. Existing data in Connect Health service will be retained for no more than 30 days.


### How to stop data collection

If you want to stop data collection of specific server, please follow steps at [deletion of specific servers](https://docs.microsoft.com/azure/active-directory/connect-health/active-directory-aadconnect-health-operations#delete-a-server-or-service-instance). To stop tenant wise data collection, follow the steps to stop data collection and delete all services of the tenant.

1.  Click on General Settings under configuration in the main blade.
2.  Click on Stop Data Collection button on the top of the blade. The other options of tenant configuration settings will be disabled once the process starts.
    <div class="thumb tnone">
    <div class="thumbinner" style="width:580px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/ab993484-6ee5-352a-9eda-5b3495f4539aCH_GDPR_-_stop_collection.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1"><img alt="CH GDPR - stop collection.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/ab993484-6ee5-352a-9eda-5b3495f4539aCH_GDPR_-_stop_collection.png" width="578" height="85" class="thumbimage"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>
3.  Ensure the list of onboarded services which are affected by stopping data collections.
4.  Enter the exact tenant name to enable the Delete action button
5.  Click on Delete to trigger the deletion of all services. Connect Health will stop receiving, processing, reporting any data sent from your onboarded services. The entire process of can take up to 24 hours. **Notice** that this step is not reversible.
6.  After the process is completed, you will not see any registered services in Connect Health any more.
    <div class="thumb tnone">
    <div class="thumbinner" style="width:288px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/90b0c1d4-d91d-7c13-a856-95e6f76c4431CH_GDPR_-_stop_collection2.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1"><img alt="CH GDPR - stop collection2.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/90b0c1d4-d91d-7c13-a856-95e6f76c4431CH_GDPR_-_stop_collection2.png" width="286" height="313" class="thumbimage"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>

### How to resume data collection

**Notice** these steps will be available after 24 hours of disable action.

Data collection can be resumed in Connect Health.

1.  Click on General Settings under configuration in the main blade.
2.  Click on Enable Data Collection button on the top of the blade.
    <div class="thumb tnone">
    <div class="thumbinner" style="width:602px;">
    <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/0ae60ada-0bc6-6b5c-2bdc-856897d93229600px-GDPR_-_Start_data_collection.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1"><img alt="GDPR - Start data collection.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/0ae60ada-0bc6-6b5c-2bdc-856897d93229600px-GDPR_-_Start_data_collection.png" width="600" height="170" class="thumbimage" srcset="/images/thumb/b/bb/GDPR_-_Start_data_collection.png/900px-GDPR_-_Start_data_collection.png 1.5x, /images/thumb/b/bb/GDPR_-_Start_data_collection.png/1200px-GDPR_-_Start_data_collection.png 2x"></a><br/>
    <div class="thumbcaption">
    <div class="magnify">
    
    </div>
    </div>
    </div>
    </div>
3.  Enter the exact tenant name to activate the Enable button.
4.  Click on Enable button to grant permission of data collection in Connect Health service. The change will be applied shortly.
5.  Follow the [install process](https://docs.microsoft.com/azure/active-directory/connect-health/active-directory-aadconnect-health-agent-install) to reinstall the agent in the servers to be monitored and the services will be present in the portal.

**Important**: After enabling of data collection, the presented insight and monitoring data in Connect Health will not show any legacy data collected before.


## Troubleshooting

### Risky IP

  - To use this report, you must ensure that AD FS auditing is enabled. For more information, see [Enable Auditing for AD FS](https://docs.microsoft.com/azure/active-directory/connect-health/active-directory-aadconnect-health-agent-install#enable-auditing-for-ad-fs)
  - The report can be trace back at most 30 days.
  - By default, the risky IP alert email notification is in off state
  - The alert report does not show Exchange IP addresses or private IP addresses. They are still included in the export list.
  - Customer has to enable alert notification in order to receive alerts. By default the alerts are not enabled. Make sure the proper threshold is set to avoid noise.
  - Only activities exceeding designated threshold will be showing in the report list.
  - The download of entire report to csv for large tenants (like MSIT) can take a long time up to 3 minutes. The screen is in freeze when the download is running.
  - All daily events are generated at mid-night UTC time.

### Data freshness alert

Please follow [Azure AD Connect Health Data Freshness Alerts Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184209) for "Health service is not up to date" alert.


### Icm Template

ICM: <https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=q3X02Q>
