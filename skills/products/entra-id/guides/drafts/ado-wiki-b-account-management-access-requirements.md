---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/General Guidance/Account Management Access Requirements"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FGeneral%20Guidance%2FAccount%20Management%20Access%20Requirements"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Account-Management
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
The following security groups will be required for your access to the various tools and logs used in Azure Identity team, you should request these on Day One.   Most will need to be approved by your manager, and renewed every ~90 days

[[_TOC_]]




## Core Identity

Browse to https://coreidentity.microsoft.com/manage/entitlement -> Search Entitlements and put in access requests for each of the groups listed below.  Once approved by management you should receive an email, you can also check status on https://coreidentity.microsoft.com/manage/entitlement - > Pending Requests

|**Group Name**|	**Description**| **Case Requirement?** | **Notes** |
|--|--|--|--|
|[SCIM Identity - Internal](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/scimidentity-feaz)|	Standard access group for Azure Identity team members. | **Yes**, provides access to multiple troubleshooting logs\features.| NON-FTE - Delivery Partners should utilize [SCIM Identity - External](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/scimidentity-welp) instead
| [Azure Standard Access](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azurestandar-bnfs) | SE access to Kusto and Geneva Log Tables | **Yes**, primary troubleshooting tool for Azure Support engineers
|[WA CTS -14817](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/wacts14817-huwx) |	Azure Standard Access for FTE CSS C&E CTS teams that perform Azure Support | Per [Azure Standard Access Overview](https://eng.ms/docs/cloud-ai-platform/azure-edge-platform-aep/aep-engineering-systems/productivity-and-experiences/secure-source/azdo-access-and-administration/home) grants acess to ADO and Source Reprository  https://msazure.visualstudio.com/One | Vendors use [TM-CSSAzureSuppliers" group](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/tmcssazuresu-uk5h)
|[AAD MSODS - MDS Table RO](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/aadmsodsmdst-ds43) | Kusto \ Jarvis MSODS tables https://msodsuseast.kusto.windows.net https://msodsusncnt.kusto.windows.net | **Yes**, required for verbose MSODS AAD log access. [Reference](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/14893/MSODS-logs) | https://aka.ms/tokendiag  verify RRD-LP-22355 group membership
|[Cpim Kusto Viewers - 19029](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/cpimkustovie-uifd) | Kusto \ Jarvis B2C CPIM tables https://idsharedneueudb.northeurope.kusto.windows.net|  **Yes**, required for log access to B2C customers logs which are not included in ASC today
| [MSI-Telemetry](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/msitelemetry-0aty) | Access to https://azmsicl.kusto.windows.net managed service identity Kusto logs | **Yes**, required for engineers supporting managed service identities
| [ARM Logs](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/armlogs-pbfu) | Access to https://armprod.kusto.windows.net | **Yes**, required for RBAC troubleshooting
| [AAD Gateway MDS - 20178](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/aadgatewaymd-ae12) | Access to https://aadgwwst.kusto.windows.net Kusto logs | **Yes**, required for engineers supporting AAD, AAD B2C etc.
|[Azure Source Read Only for partner team](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/azsrcro-wskg)|	Azure source code repros (https://msazure.visualstudio.com/One/) | Used for PG collaboration to view Azure source code base (mostly for TA or Sr. SE)
|[Lynx Access - Full](https://eng.ms/docs/experiences-devices/data-platform-growth/ideas/ideas-wiki/reporting/lynx/new-lynx-access-request-workflow)|	https://lynx.office.net/#/  tenant lookup for Azure commercial customers | Not required, but useful for customer lookup including if customer is S500 or not, how many seats of subscriptions, who their account team is etc.
|[Lynx Access - Lynx Government Access](https://eng.ms/docs/experiences-devices/data-platform-growth/ideas/ideas-wiki/reporting/lynx/new-lynx-access-request-workflow)|	https://lynx.office.net/#/  tenant lookup for AzGov customers | Not required, but useful for Gov. customer lookup including if customer is S500 or not, how many seats, who their account team is etc.
| [CLD-D2KRedacted-MSIT-R](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/cldd2kredact-ugt1) | Access to the d2kredacted kusto cluster used for [querying orphaned MSODS subscriptions during tenant deletion requests](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1326351/Tenant-Deletion-Query-Kusto-for-MSODS-Subscriptions). | **Yes**, if TA or SE is taking tenant deletion support cases.
| [O365-BUILD-ARTIFACTS](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/o365buildart-bdel) | Grants access to Office 365 ADO https://o365exchange.visualstudio.com/ as per [**https://aka.ms/ExchangePermsDoc**](https://aka.ms/ExchangePermsDoc "https://aka.ms/exchangepermsdoc") | Not required, but useful for checking status of bugs and escalations to Exchange Online PG | 
| [ICM Kusto Cluster Access](https://coreidentity.microsoft.com/manage/Entitlement/entitlement/icmkustoacce-ufk0) | Used for access to ICM Kusto Cluster icmcluster.kusto.windows.net' | Not required, but useful for troubleshooting |

## IDWeb 
There are additional groups which may be needed on https://aka.ms/idweb --> "Join a SG" -> use the search box in top right to find the group name -> Then choose join.
<br>NOTE: May have to use Internet Explorer if you get a Forbidden error

In your reason for the request note that you are a CSS Cloud Identity Management support engineer reporting to (your manager's alias)


|**Group Name**|**Description**|**Case Requirement**|
|--|--|--|
| [AAD Account Management Vertical (NOAM)](https://idweb.microsoft.com/identitymanagement/aspx/groups/AllGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FJoinGroups.aspx%3FCacheID%3Df3860a2b-2399-4636-9d30-92382f38cf27) | Access to NOAM Account Management email\security group | **Yes**, for receiving team emails
| [Cloud Identity POD NOAM](https://idweb.microsoft.com/identitymanagement/aspx/groups/AllGroups.aspx?popupFromClipboard=%2Fidentitymanagement%2Faspx%2FGroups%2FJoinGroups.aspx%3FCacheID%3Dbb5a533f-4946-4dc4-987f-064aec23f507) | Access to Cloud Identity POD NOAM email\security group | **Yes**, for receiving team emails
| [Graph AGS Partners](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=graphagspartners) | Access to https://msgraphkus.kusto.windows.net Graph.microsoft.com Kusto Cluster | **Yes**, for troubleshooting Graph API
| Icplogread | Access to Iris ICP logs for SSPR and B2C Email Delivery Issues | **Yes**, for troubleshooting SSPR email delivery


## Other
|**Group Name**|	**Description**| **Case Requirement?** |
|--|--|--|
| Azure Support Center Users | Verify your cloud screening is current under [Cloud Screening Portal](https://personnel.microsoft.com/screening/cloud) and you will be automatically be approved to join the required security group [Azure Support Center Users](https://personnel.microsoft.com/groups/4c3a8323-2236-4c99-aaf6-10650761244d/request)| **Yes**, for ALL support engineers
| ASC USGov | Request access to this group via link https://personnel.microsoft.com/groups/b6922fce-9e89-4a7f-bf77-6cd8454ec55e/request <br><br> NOTE: Must first be [Azure Gov \ US Nat certified](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/335088/Account-Management-Access-Requirements?anchor=azure-government-%5C-us-nat-requirements)<br><bR>See [ASC Access Restrictions](https://azuresupportcenterdocs.azurewebsites.net/supportengineer/AccessRestrictions.html) for troubleshooting| **Yes**, for support engineers supporting Azure Government tenants
| CMAT and CST Access | Follow https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/569460/Requesting-Access-to-CMAT-CST-Portals-for-AAD-CSS-SEs to request access to CMAT and CST portals.  This is needed so you can perform Tenant Deletion support requests.  Once requested, ask your manager to approve you. | **Yes**, for support engineers supporting AAD Tenant Deletion requests (Account Management)
| Remote Access VPN (MSFTVPN) | If you are not a Full Time Engineer, you will need to request access to MSFT VPN via requesting access at https://microsoft.sharepoint.com/sites/Network_Connectivity/SitePages/RemoteAccess/RAS-Request.aspx?OR=Teams-HL&CT=1630433085762 | *Yes* , for remote vendors

<br>
<hr>

## Azure Government \ US Nat Requirements
For US Nationals who will be supporting Azure US Government customers, you will want to review the below steps to ensure you start the process to get your Citizenship and Cloud Background check clearances so that you can successfully open support cases that are coded for USGov or USNat restrictions.


1. Review your existing clearances at https://osp.office.net/idm/identity/access/Clearances  if you do not see BackgroundCheck = US and Citizenship = US then follow steps 2-4.  If you DO see BackgroundCheck = US and Citizenship = US then skip to step 4

   Example:
   
   ![image.png](/.attachments/image-22ddf664-56a1-4746-8533-94f763593533.png)

2. US Citizenship Verification : submit a [US Citizenship verification form](https://personnel.microsoft.com/forms/citizenship-verification) to begin process of verifying US Citizenship


				
3. Cloud Screen Background Check : Use https://screening.microsoft.com initiate Cloud Screening.  Once complete you should see the following under your profile:

   ![image.png](/.attachments/image-e6a4878c-41f1-4ada-ac92-6f7f56750da4.png)

	
		
4. Verify on https://osp.office.net/idm/identity/access/Clearances  both BackgroundCheck = US and Citizenship = US are listed

5. Submit a new request for Standing Access (DfM and Rave) at https://microsoft.sharepoint.com/teams/USGovCloudSupport/SitePages/How.aspx?web=1&OR=Teams-HL&CT=1629821484289

6. Once you submit the above form, wait ~48 hours for request to be fulfilled.  You will receive an email once completed and then you should be able to successfully open cases with USNat or AzGov restricted access program coding in Service Desk and Rave

If you are still having issues accessing restricted access cases after verifying you have the required clearances, review https://microsoft.sharepoint.com/teams/USGovCloudSupport/SitePages/How.aspx?web=1&OR=Teams-HL&CT=1629821484289 and reach out to usgcloud@microsoft.com if you experience any issues with submitting your request.

### Azure Support Center Government 
You can now request security group membership in [ASC USGov](https://personnel.microsoft.com/groups/b6922fce-9e89-4a7f-bf77-6cd8454ec55e/request)  which will be auto-approved if you are already cleared for Background Check and Citizenship. Review documentation on this access request at https://azuresupportcenterdocs.azurewebsites.net/supportengineer/AccessRestrictions.html#access-to-restricted-data-in-fairfaxus-gov. This will grant you access to ASC US Gov tenant information.  You can now browse AzGov tenants with ASC Tenant Explorer.  Once group membership is approved, it may take a few hours before your permissions are reflected in Azure Support Center.
