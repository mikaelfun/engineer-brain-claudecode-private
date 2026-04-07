---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Entra ID App Management/Application_and_Service_Principal_Object_Management/How to/ADFS to AAD Application Migration Wizard"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FEntra%20ID%20App%20Management%2FApplication_and_Service_Principal_Object_Management%2FHow%20to%2FADFS%20to%20AAD%20Application%20Migration%20Wizard"
importDate: "2026-04-05"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-appex
- cw.comm-adfs
- cw.AAD-ADFS
- SCIM Identity
- ADFS to Entra ID migration
- SSO Configuration
- Singe Sign On configuration
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [comm-adfs](/Tags/comm%2Dadfs) [AAD-ADFS](/Tags/AAD%2DADFS) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-Troubleshooting](/Tags/AAD%2DTroubleshooting) [AAD-Migration](/Tags/AAD%2DMigration)        




[[_TOC_]]


# Compliance note

This wiki contains test and/or lab data only.

___

# Summary

Many customers want to migrate their on-premises AD FS relying party applicationsto the cloudso their organization can benefit from the security features provided by Azure AD. The [ADFS Application Activity Report](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) blade which already exists under [Usage & insights](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade) is limited to reporting only. The existing experience evaluates the relying party configuration of on-premises relying party applications and generates a report that identifies the feasibility of migrating to Azure AD.

A new ADFS **Application Migration** blade will appear under *Usage & insights* to provide tooling support for Active Directory Federation Services (AD FS) to Azure AD Application Migration. Organizations with Azure AD Premium 1 or higher that have Azure AD Connect health installed on-premises will find this interface gives administrators a guided migration experience of relying party applicationsfrom Active Directory Federation Services (AD FS) to Azure AD. It also offers single click configuration of basic SAML URLs,claims mapping, anduser assignments. The new migration dashboard provides three tabs:

- **All Apps** provides an Application activity report for all SAML apps that have sign-in activity taking place.

- **Ready to migrate** lists those applications that are ready to migrate. This contains relying party application usage statics such as unique user count, successful sign-in and failed sign-ins count. In addition, all relying party application configurations are imported from the on-premises environment.

- **Ready to configure** lists all previously migrated applications. Migrated applications will be editable in the Azure portal under Enterprise applications. 

This report shows all the same information that is available in the **AD FS application activity** blade and more. In addition to showing the **Application Identifier**, the **Unique User Count**, the number of **Successful sign-ins** and **Failed sign-ins** for all on-premises applications, the **Application Migration (Preview)** report also includes a **Name** column. This new report has a **Next Steps** column which replaces the **Migration status** column, but it serves the same purpose by identifying potential migration issues. When migration issues are detected, the **Next Steps** column provides an *Additional steps required* link. Clicking the link exposes 16 rules that are run against the Replying Party Trust to identify configuration issues that ight interfere with the migration of the on-premises application to Azure AD. Clicking on rules under **Potential migration issues** provides the AD FS admin with guidance on changes that needs to be made.

**NOTE**: Allow 24 hours to pass once corrective actions have been performed in the premises environment. This allows enough time for the AD FS Migration Insights job to re-evaluate the configuration changes.

# Scope

Using new migration UX, IT admin would be able to complete the following actions:

- A new ADFS **Application Migration** blade has been introduced under the *Usage & insights* section. The new migration dashboard includes the existing [AD FS migration report](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) along with new assisted migration tabs.

	- The existing [AD FS Application activity](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) report will be retired in future.

- **Ready to migrate** application tab lists applications that are ready to migrate along with relying party application usage statics such as unique user count, successful sign-in and failed sign-ins count.

- All Relying party application configurations are imported from the on-premises environment.

- Assisted migration wizard supports:

	- Option to customize the new Azure AD application name.

	- SAML configurations only. OIDC (OpenID Connect) and WS-Fed are currently not supported.

	- *Identifier (Entity ID)* and *Reply URL* will be used for the **Single single-on** settings.

	- Permit all, allow specific groups and deny specific groups access policies are supported. The wizard automatically assigns the groups to the application, but automatic configuration of conditional access policies are not supported. However, customers can manually configure those after migration.

	- Azure AD compatible claims configuration is extracted from the Relying party claims configurations.

	- If any non-migration blocker issues occur, warning indicators appear with further details that explain actions that the administrator must perform.

- Previously migrated applications will continue to be available under the **Ready to configure** tab. However, once customer switches the sign-in traffic to Azure AD, the sign-in traffic to the AD FS relying party trust will ultimately go down and application will no longer be available on the reports.

- Migrated applications will be editable into the Azure portal under the [Enterprise applications](https://entra.microsoft.com/#view/Microsoft_AAD_IAM/StartboardApplicationsMenuBlade/~/AppAppsPreview) blade.

___

# Limitations

- Assisted migration wizard support SAML configurations only. OIDC (OpenID Connect) and WS-Fed are currently not supported.

- Automatic configuration of conditional access policies is not supported.

___

# Pre-requisites

- [Azure AD Connect health](https://www.microsoft.com/en-us/download/details.aspx?id=104056) must be installed on the on-premises environments.
- [Azure AD Connect health AD FS health agents](https://www.microsoft.com/en-us/download/details.aspx?id=48261) must be installed on the on-premises environments.

___

# Licensing

- Azure AD Premium 1 or higher, or Office 365 E3 or higher is required for Azure AD Connect health.

___

# Roles

- Global Administrator (eligible for upcoming application migration)
- Application Administrator (eligible for upcoming application migration)
- Cloud Application Administrator (eligible for upcoming application migration)
- Report reader (Read only report reader)
- Security Reader (Read only report reader)
- Equivalent custom roles

___

# Case Handling

The Migration state of the rule being worked on indicates which support team is primarily responsible for troubleshooting.

**Before transferring case ownership** - If the migration state of the rule that is being worked indicates the support incident should be worked by a different primary support team, speak with the customer to scope the issue, then cut a collaboration for yourself and send case to the Primary support team.

- **Ready**: Wizard says migration should succeed. AppEx Support is primary and collaborates with AD FS support as needed.

- **Needs Review**: Wizard detects changes need to occur, but it is still eligible for migration. Changes made. AppEx Support is primary and collaborates with AD FS support as needed.
- **Additional Steps Required**: Things need to be performed in ADFS Side. AD FS Support is primary and collaborates with AppEx as needed.

| Support community | Support Area Path |
|-----|-----|
| AD FS and WAP | Azure\Azure Active Directory Sign-In and Multi-Factor Authentication\AD FS (Active Directory Federation Services) |
| Application Experiences | Azure\Azure Active Directory App Integration and Development\Enterprise Applications\ADFS to Microsoft Entra ID SAML application migration |

___

# Data flow diagram

1. On-premises AD FS environment
2. Azure AD Connect and AAD Connect AD FS Health Agents
3. Azure AD Connect Health Cloud Services
4. Relying party and sign-in data source Kusto clusters
5. AD FS Application Insights jobs - Contains AD FS migration business logic.
6. AD FS Migration processed output - The processed AD FS migration data intermediate storage.
7. Relying Party Summary API - The *getRelyingPartyDetailedSummary* endpoint which powers data to the UX.
8. AD FS application activity/migration UX experience

![Architecture](.attachments/AAD-Authentication/1078423/Architecture.jpg)

___

# Dependencies & owners

The following diagram shows dependencies of AD FS application activity report and migration experience along with their respective owners.

![Dependencies](.attachments/AAD-Authentication/1078423/Dependencies.jpg)

| Component name | Description | Owner Team | ICM Queue |
|-----|-----|-----|-----|
| Relying Party Kusto clusters | Provides source Relying Party data. | AAD Connect Health | AAD Connect Health |
| Sign-in Kusto clusters | Provides source sign-in data. | Reporting and Audit Insights | Reporting and Audit Insights |
| AD FS Migration Insights jobs	| Contains business logic to analyze the Relying party and sign-in data. Jobs are hosted on IDX Synapse platform. | ESTS | ESTS |
| Relying party summary endpoint | Endpoint exposes data for the UX and MS Graph. | Reporting and Audit Insights | Reporting and Audit Insights |
| AD FS activity report & AD FS Application migration UX | Feature UX for the customer interaction. | App Management team | Enterprise App Management |

___

# AD FS migration insights jobs instances

AD FS migration insights jobs are currently available into the public and Fairfax clouds only. Following are the job instances which are evaluating the AD FS migration data. Each job instance uses the Relying Party and Sign-in Kusto clusters to extract Relying Party summary and sign-in traffic against each relying party trust.

- Australia East (AUE)
- North Central US (NCU)
- Southeast Asia (SEA)
- North Europe (NEU)
- Africa (WEU)
- Fairfax

___

# Relying party Kusto clusters

Each AD FS migration insights job instance uses one Relying party Kusto cluster which are listed below. However, most of the data is available within the North central America cluster. In response to go-local initiatives, there is dedicated instance for Europe.

All these Kusto cluster has database as `"AdfsApplicationEvents"`` and table as `"AdfsWebApiApplicationEvents"`` which contains the relying party metadata.

- Australia East (AUE):
  https://adprovisioningstoreeus.kusto.windows.net 
  https://adprovisioningstorewus.kusto.windows.net (backup)

- North Central US (NCU):
  https://adprovisioningstoreeus.kusto.windows.net 
  https://adprovisioningstorewus.kusto.windows.net (backup)

- Southeast Asia (SEA):
  https://adprovisioningstoreeus.kusto.windows.net 
  https://adprovisioningstorewus.kusto.windows.net (backup)

- North Europe (NEU):
  https://adprovisioningstoreneu.kusto.windows.net 
  https://adprovisioningstoreweu.kusto.windows.net (backup)

- Africa (WEU):
  https://adprovisioningstoreeus.kusto.windows.net 
  https://adprovisioningstorewus.kusto.windows.net (backup)

- Fairfax:
  https://adpsusgovusg00usgova.usgovarizona.kusto.usgovcloudapi.net 
  https://adpsusgovusg00usgovt.usgovtexas.kusto.usgovcloudapi.net (backup)

___

# Sign-in Kusto clusters
Unlike to Relying party Kusto clusters there more than one sign-in clusters which contains sign-in data against the given Relying party trusts.

- Australia East (AUE):
  https://adlsprodoc00ase.australiasoutheast.kusto.windows.net 
  https://adlsprodoc01ase.australiasoutheast.kusto.windows.net 
  https://adlsprodoc02ase.australiasoutheast.kusto.windows.net 
  https://adlsprodoc00aue.australiaeast.kusto.windows.net (backup)
  https://adlsprodoc01aue.australiaeast.kusto.windows.net (backup)
  https://adlsprodoc02aue.australiaeast.kusto.windows.net (backup)

- North Central US (NCU):
  https://adlsprodna00eus2.eastus2.kusto.windows.net 
  https://adlsprodna01eus2.eastus2.kusto.windows.net 
  https://adlsprodna02eus2.eastus2.kusto.windows.net 
  https://adlsprodna03eus2.eastus2.kusto.windows.net 
  https://adlsprodna04eus2.eastus2.kusto.windows.net 
  https://adlsprodna05eus2.eastus2.kusto.windows.net 
  https://adlsprodna06eus2.eastus2.kusto.windows.net 
  https://adlsprodna07eus2.eastus2.kusto.windows.net 
  https://adlsprodna08eus2.eastus2.kusto.windows.net 
  https://adlsprodna09eus2.eastus2.kusto.windows.net 
  https://adlsprodna10eus2.eastus2.kusto.windows.net 
  https://adlsprodna00wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna01wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna02wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna03wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna04wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna05wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna06wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna07wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna08wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna09wus2.westus2.kusto.windows.net (backup)
  https://adlsprodna10wus2.westus2.kusto.windows.net (backup)

- Southeast Asia (SEA):
  https://adlsprodas00sea.southeastasia.kusto.windows.net 
  https://adlsprodas01sea.southeastasia.kusto.windows.net 
  https://adlsprodas02sea.southeastasia.kusto.windows.net 
  https://adlsprodas03sea.southeastasia.kusto.windows.net 
  https://adlsprodas04sea.southeastasia.kusto.windows.net 
  https://adlsprodas00jpe.japaneast.kusto.windows.net (backup)
  https://adlsprodas01jpe.japaneast.kusto.windows.net (backup)
  https://adlsprodas02jpe.japaneast.kusto.windows.net (backup)
  https://adlsprodas03jpe.japaneast.kusto.windows.net (backup)
  https://adlsprodas04jpe.japaneast.kusto.windows.net (backup)

- North Europe (NEU):
  https://adlsprodeu00neu.northeurope.kusto.windows.net 
  https://adlsprodeu01neu.northeurope.kusto.windows.net 
  https://adlsprodeu02neu.northeurope.kusto.windows.net 
  https://adlsprodeu03neu.northeurope.kusto.windows.net 
  https://adlsprodeu04neu.northeurope.kusto.windows.net 
  https://adlsprodeu05neu.northeurope.kusto.windows.net 
  https://adlsprodeu06neu.northeurope.kusto.windows.net 
  https://adlsprodeu07neu.northeurope.kusto.windows.net 
  https://adlsprodeu08neu.northeurope.kusto.windows.net 
  https://adlsprodeu09neu.northeurope.kusto.windows.net 
  https://adlsprodeu10neu.northeurope.kusto.windows.net 
  https://adlsprodeu00weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu01weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu02weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu03weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu04weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu05weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu06weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu07weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu08weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu09weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu10weu.westeurope.kusto.windows.net (backup)

- Africa (WEU):
  https://adlsprodeu00neu.northeurope.kusto.windows.net 
  https://adlsprodeu01neu.northeurope.kusto.windows.net 
  https://adlsprodeu02neu.northeurope.kusto.windows.net 
  https://adlsprodeu03neu.northeurope.kusto.windows.net 
  https://adlsprodeu04neu.northeurope.kusto.windows.net 
  https://adlsprodeu05neu.northeurope.kusto.windows.net 
  https://adlsprodeu06neu.northeurope.kusto.windows.net 
  https://adlsprodeu07neu.northeurope.kusto.windows.net 
  https://adlsprodeu08neu.northeurope.kusto.windows.net 
  https://adlsprodeu09neu.northeurope.kusto.windows.net 
  https://adlsprodeu10neu.northeurope.kusto.windows.net 
  https://adlsprodeu00weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu01weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu02weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu03weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu04weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu05weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu06weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu07weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu08weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu09weu.westeurope.kusto.windows.net (backup)
  https://adlsprodeu10weu.westeurope.kusto.windows.net (backup)

- Fairfax:
  https://adlsusgovusg00usgova.usgovarizona.kusto.usgovcloudapi.net 
  https://adlsusgovusg00usgovv.usgovvirginia.kusto.usgovcloudapi.net (backup)
  https://adlsusgovusg00usgovt.usgovtexas.kusto.usgovcloudapi.net (backup)

___

# Stepping Through App Migration Phases

## All apps

The **All apps** tile provides an *Application activity report* for all SAML apps that have sign-in activity taking place.

![ApplicationMigrationBlade](/.attachments/AAD-Authentication/1078423/ApplicationMigrationBlade.jpg)

- Applications with migration details that are successful will appear in the list with a <span style="color:green">**green**</span> icon under **Next steps**.

- Applications that require administrative action will have a <span style="color:orange">**yellow**</span> warning indicator and a link under **Next steps**.

![WarningRuleGuidance](/.attachments/AAD-Authentication/1078423/WarningRuleGuidance.jpg)

1. If the **All apps** tile is selected, a *Ready* link will appear to the right of any app that is ready to migrate. Clicking the *Ready* link exposes all of the rules that have passed in a *Migration details* blade.

![ReadyMigrate](/.attachments/AAD-Authentication/1078423/ReadyMigrate.jpg)

2. The *Migration details* blade provides a **Begin Migration** button which launches the *Application migration* wizard.

![ReadyBeginMigration](/.attachments/AAD-Authentication/1078423/ReadyBeginMigration.jpg)

## Ready to migrate

1. If the **Ready to migrate** tile is selected, it provides a filtered view of just those apps that are ready for *Assisted migration*. This contains relying party application usage statics such as unique user count, successful and failed sign-ins count. In addition, all relying party application configuration information is imported from the on-premises environment.

2. Clicking the *Begin migration* link under the **Next steps** column launches the *Application migration* wizard.

![ReadyMigBegin](/.attachments/AAD-Authentication/1078423/ReadyMigBegin.jpg)

### Ready to migrate - Summary

This tab provides a list of *Configuration* settings with a *Migration summary* for each.

- **Application name** - allows the administrator to specify any name they wish for the Azure AD Application. If desired, they can reuse the name that is listed on the Relying Party Trust, which appears at the top left.
- **Users & groups** - shows the scope of users that are permitted: *All users are permitted*, *Allow specific groups*, *Deny specific groups*.
- **SAML configurations** - This contains the following information, which is used to construct the *Identifier (Entity ID)* of the Azure AD App that will be created:
	- *Identifier*:
		- the *Endpoint type* of the relying party identifier, which is obtained from the **Endpoint** tab of the Relying Party Trust in ADFS.
		- the *identifier name* located in the *Relying party identifier* field of the **Identifiers** tab of the Relying Party Trust in ADFS.
	- *Reply URL*:
		- the *Trusted URL*, which is obtained from the **Endpoint** tab of the Relying Party Trust in ADFS.
- **Claims** - This is a list of claim type mappings, which are obtained from the **Claim Issuance Policy** of the Relying Party Trust in ADFS.
- **Configuration results** - This is a summary of issues found.

![MigrateWizard](/.attachments/AAD-Authentication/1078423/MigrateWizard.jpg)

### Ready to migrate - Application template

This tab lists all of the Gallery apps that support SAML single sign-on. When a specific application template is selected, some of the properties will be automatically imported from the application template, e.g. Identifier, Reply URL, claims and logo, etc. Nothing of the customer's ADFS configuration is overwritten when an application is selected. The application template selection experience only supports selecting one application that is used as a template for Service Principal instantiation. Proceeding without selecting will proceed with the migration using the default custom application template.

![AppTemplates](/.attachments/AAD-Authentication/1078423/AppTemplates.jpg)

### Ready to migrate - Users & groups

This tab shows the scope of users that are permitted: *All users are permitted*, *Allow specific groups*, *Deny specific groups*.

### Ready to migrate - SAML configurations

This tab contains the *Identifier* and *Reply URL* SAML settings which were pulled from AD FS. The admin can change these once the Azure AD Application has been created.

### Ready to migrate - Claims

This tab contains a list of claim type mappings, which are obtained from the **Claim Issuance Policy** of the Relying Party Trust in ADFS. The admin can change these once the Azure AD Application has been created.

### Ready to migrate - Configuration results

This tab indicates the application is ready to migrate without issues or not.

### Ready to migrate - Review + create

1. As long as the name for the application has been provided, this should show a summary list of items that are ready to migrate.

![AppReadyToconfigure](/.attachments/AAD-Authentication/1078423/AppReadyToconfigure.jpg)

2. Clicking **Create** steps through the list of items that were "ready to migrate" and checks them off. Once all of the items are successfully completed it shows a result stating, "New Azure Active Directory application is configured successfully."

3. Clicking the link to the right of **Azure Active Directory Application** takes the admin to the Single sign-on blade of the newly create Enterprise application where the admin can review or update the application configuration.

![AppConfiguredSuccessfully](/.attachments/AAD-Authentication/1078423/AppConfiguredSuccessfully.jpg)

## Ready to configure

This tile lists all previously migrated applications. Migrated applications will be editable in the Azure portal under Enterprise applications.

When the **Ready to configure** tile is selected the administrator can click the *Configure application in Azure AD* link, which opens the *Single sign-on* blade of the newly created Azure AD Application.

![ReadyToConfigure](/.attachments/AAD-Authentication/1078423/ReadyToConfigure.jpg)

Currently there is no guidance from the wizard on what step the admin needs to take, but it is implied that something needs to be done on the Single Sign-on page.

- The customer needs to upload the Federation Metadata of the newly created Azure AD app to their Web application. The customer has two options: 

1. Locate **Federation Metadata XML** on the Single Sign-on blade of the newly created Azure AD app and click *Download*.  Upload the Federation Metadata XML file to their web application.
2. If the web application does not support uploading the Federation Metadata XML file.
	1. Copy the URL to the right of **App Federation Metadata Url** on the Single Sign-on blade of the newly created Azure AD app.
	2. Paste the URL into a new tab and hit Enter to view the application's federation metadata.
	3. Copy the contents of the entire page and paste it to a text editor.
	4. Import the Azure AD application's federation metadata into the web application.

![AppFederationMetadata](/.attachments/AAD-Authentication/1078423/AppFederationMetadata.jpg)

___

# Known Issues

## Issue 1: 'Download agent' blade appears instead of 'Application migration'

The **Download agent** blade appears when there is no AD FS to Azure AD migration report data available for the on-premises environment. This could be due to the following reasons, 

- AD Connect is not installed on the AD FS environment.
  - **Corrective action**: Install [Microsoft Azure Active Directory Connect](https://www.microsoft.com/en-us/download/details.aspx?id=47594) 

- AD Connect AD FS Health agents are not installed on the AD FS environment. 
  - **Corrective action**: Install [Azure Active Directory Connect Health Agent for ADFS](https://www.microsoft.com/en-us/download/details.aspx?id=48261) 

- Agents are not configured correctly.
  - **Corrective action**: Follow [Install the Azure AD Connect Health agents in Azure Active Directory](https://learn.microsoft.com/en-us/azure/active-directory/hybrid/connect/how-to-connect-health-agent-install#to-enable-auditing-for-ad-fs-on-windows-server-2016) 

- If there is no user sign-ins activity against the AD FS Relying party trust in last 30 days. 

If agents are newly installed or any configuration is newly updated, customers need to wait for 24 hours for the AD FS migration jobs to process their data by midnight GMT.  

___

## Issue 2: 'Application migration' is not accessible

The **Application migration** experience is an Azure AD Premium feature. It is available for the following subscriptions and user roles only.  

- **Azure subscription**: Azure AD P1 or P2 license or Office 365 E3 or Office 365 E5 license

- **Roles**: 
  - Global Administrator (eligible for upcoming application migration)
  - Application Administrator (eligible for upcoming application migration)
  - Cloud Application Administrator (eligible for upcoming application migration)
  - Report reader (Read only report reader)
  - Security Reader (Read only report reader)
  - Equivalent custom roles

___

## Issue 3: No application with 'Ready' migration status

The migration status is identified based on the Relying Party Trust configuration analysis. These are the three Relying Party Trust configurations scenarios: 

- Supported on Azure AD side with basic SAML configuration.  
- Supported on Azure AD side with advanced configurations e.g., with use of conditional access policies. 
- Relying Party Trust uses some features from the AD FS side which are not yet supported on Azure AD.  

If there are supported configurations found, the applications migration status is marked as **Ready**. Otherwise migration status gets marked as **Additional steps required**.

___

## Issue 4:  How to migrate applications with 'Additional steps required' migration status

The assisted migration experience is only supported for the applications with a status of **Ready** and **Needs review**. Customers wanting to migrate applications with a status of **Additional steps required** must use the **Application activity report** which is available on the first tab under the **All apps** section by clicking the *Additional steps required* link to the right of each application. Review all of the rule results to identify the blocking rule. Corrective actions need to be performed in the premises environment and 24 hours should be allowed for the AD FS Migration Insights job to re-evaluate the configuration changes. If no blocking issues found during the next iteration, a new migration status will be identified for the application. Once the application shows a status of **Ready** or **Needs review** the assisted migration wizard can be used for the configuration.

___

## Issue 5: 'Begin migration' link is missing from the dashboard

Assisted migration using the migration wizard is only available for the applications with a migration status of **Ready** or **Need review**. The *Begin migration* link is not available when all the applications show a migration status of **Additional steps required**.

**Note**: The **Begin Migration** button is available for **Needs review** apps, but the administrator will have to change configurations after the migration.

___

## Issue 6: How to use the user login statistics principle

User login and usage statistics present the admin with the usage of specific applications. This data can help administrators identify applications that have the least amount of usage to identify those they might want to initiate migration sooner. This data is also useful for impact analysis.

___

## Issue 7: All Relying Party Trusts are not on 'Application migration' dashboard

The application migration dashboard only shows those applications which are actively handling sign-in traffic for a specific duration of time. The **Date range** filter on the [AD FS application activity](https://portal.azure.com/#view/Microsoft_AAD_IAM/UsageAndInsightsMenuBlade/~/AD%20FS%20application%20activity) blade supports the last *1 days*, *7 days* or *30 days*. Any Relying Party Trusts that are inactive for the last 30 days and not handling any sign-in traffic will not be available on the **Application migration** dashboard.

___

## Issue 8: All applications are not under 'Ready to migrate'

Applications with a migration status of **Ready** or **Need review** are supported for assisted migration. The **Ready to migrate** tab does not show applications with a migration status of **Additional steps required**. Along with that, all the applications which were already configured in the past, won't be available under the **Ready to migrate** section. 

___

## Issue 9:  Users in the Relying Party Trust access policy are not listed in 'Users and groups' tab of migration wizard 

At this time the assisted migration wizard does not support advanced configurations such as configuration of conditional access policies. Only Groups assigned to the Relying Party Trust access policies are automatically extracted and assigned to the applications. Into the subsequent versions, support for the Users will be introduced.  

___

## Issue 10: Some groups are missing from migration wizard 'Users and groups' tab 

Azure AD Connect agents are responsible for synchronizing all on-premises entities such as users and groups to Azure AD. The AD FS migration jobs try to resolve all the Relying Party Trust access policies. However, in some cases some rules will not resolve and extract the Group Ids. This can cause customers to see fewer groups than there are. In this situation, case assisted migrations will proceed with the extracted data only. Administrators can manually assign more groups to the application later from the Enterprise applications section of Azure portal.

___

## Issue 11: How to update the application identifier and reply URL

At this time, the AD FS migration wizard does not support modification of any of the data. All the data used for the assisted migration is extracted from the on-premises environment. However, once assisted migration is done configuring the new application in Azure AD, customers can update the newly configured application from Enterprise Applications in the Azure AD Portal.

___

## Issue 12: Some claims on Relying Party Trust are missing

AD FS and Azure AD do not follow the same claims collection. Not all the claims from the AD FS side can be translated on the Azure AD side. The assisted migration experience can only migrate those claims which can be translated on the Azure AD side.  

When the migration experience fails to resolve all the claim rules successfully, it's possible customers will see lesser claims in the migration wizard than the actual number of claims assigned to their Relying Party Trust. This situation can be addressed by manual assignment of claims from the Enterprise Applications of Azure portal.

___

## Issue 13: Why claim transformations on the Relying Party Trust are not configured against the Service Principal

The current version of assisted migration does not support automated configuration of custom claims or claims transformation. However, customers can manually enhance their Service Principals and add more claims and transformation by directly editing Service Principals from Enterprise Applications in the Azure AD portal.  

___

## Issue 14: How to add, edit, or delete claims

The current version of assisted migration does not support addition, modification and removal of claims that are extracted from customers' on-premises application configurations. However, customers can manually update their Service Principals and add, edit, or remove the claims by directly editing Service Principals from Enterprise Applications in the Azure AD portal.  

___

## Issue 15: What does the 'Configuration results' tab show

Assisted migration is designed to help customers with migration. However, it is not sufficient by itself. Administrators are required to perform additional manual steps to configure the application and get it ready for use. The **Configuration results** section contains the list of recommendations for the customer to perform after successful configuration of the application using assisted migration.

___

## Issue 16: How to roll back the migration

The assisted migration experience enables customers to configure new applications and service principals on their Azure AD tenant. It also tries to configure claims and assign groups to them. However, the application is not "active" unless  the application side is updated to point to Entra ID as the Identity provider. In situations where the customer wants to roll back, they simply need to make the changes on the application side to point it back to AD FS and delete the newly configured Azure AD application and service principle from the **App Registration** and **Enterprise application** blades.

___

## Issue 17: Migration fails with Application with same identifier already exists

If the customer previously attempted the migration and for some reason it did not complete, it will leave the service principal in the customer's tenant. When the customer attempts to migrate the same application again, the APIs will find a Service principal with the same identifier already exists in the customers tenant. It is not allowed to have Service Principals with the same identifier. To address this customers need to manually delete the old service principal instance from the  **Enterprise application** blade and retry the migration.

| Text | Image |
|-----|-----|
| Another object with the same value for property identifierUris already exists. | ![Conflict](/.attachments/AAD-Authentication/1078423/Conflict.jpg) | 

___

## Issue 18: Why more applications appear under Enterprise apps after a failed migration attempt

The assisted migration experience configures new Application and Service Principal instance into the customer's tenant. In case of any configuration failure, old instances of Application and Service Principal will remain in the customers tenant which they have to manually cleanup.

___

## Issue 19: How to clean up unused applications from the Azure AD tenant

Manually Delete the App registration and Service Principal instance from the **App Registration** and **Enterprise application** blades.

___

## Issue 20: Conditional access policies are not automatically configured

Advanced features such as configuration of conditional access policies are not currently supported. Future versions may have this support.

___

## Issue 21: Single Sign-in Test option fails with AADSTS7500525

Administrators attempting to test SAML Single Sign-in by clicking **Test** at the bottom of the Single Sign-in blade of the newly create Azure AD App will encounter this error.

| Text | Image| 
|-----|-----|
| **Sign in**<br><br>Sorry, but we're having trouble signing you in.<br><br><br>AADSTS7500525: There was an XML error in the SAML message at line 1, position><br>376. Verify that the XML content of the SAML messages conforms to the SAML protocol specifications. | ![AADSTS7500525](/.attachments/AAD-Authentication/1078423/AADSTS7500525.jpg) |

Examination of the SAMLRequest in fiddler using "From DeflatedSAML" shows the Issuer name is missing:

```code
<samlp:AuthnRequest xmlns="urn:oasis:names:tc:SAML:2.0:metadata" ID="F84D888AA3B44C1B844375A4E8210D9E" Version="2.0" IssueInstant="2023-07-21T22:07:40.978Z" IsPassive="false" AssertionConsumerServiceURL=https://sptest.iamshowcase.com/acs xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ForceAuthn="false"><Issuer xmlns="urn:oasis:names:tc:SAML:2.0:assertion"></Issuer></samlp:AuthnRequest>
```

**Solution**: The **Identifier** property in the Single Sign-in blade shows *Default* is not checked. Place a check next to *Default* and **Save**. Identifier is now passed in the SAMLRequest when the **Test** button is used. 

___

# Rule Checks for Federation Relying Party Trusts

| Rule name | Description | WARNING or FAIL | SUCCESS | Detected on-premises settings | Portal Description |
|-----|-----|-----|-----|-----|-----|
| AdditionalWSFedEndpoint | Gets the list of additional WSFed endpoints | Relying Party has additional WS-Federation Endpoints. | No additional WS-Federation endpoints were found. | **Claim type: supported claim**<br><br>The relying party in AD FS allowsmultiple WS-Fed assertion endpoints.Currently, Azure AD only supports one.If you have a scenario wherethis is blocking the migration, let us know. |
| AllowedAuthenticationClassReferences (aka: allowedAuthClassRef) | Gets the list of allowed authentication class references | Relying Party has set AllowedAuthenticationClassReferences. | AllowedAuthenticationClassReferences is not set up. | **Claim type: supported claim**<br><br>This setting in AD FS lets you specify whether the application is configured to only allow certain authentication types. We recommend using Conditional Access to achieve this capability. If you have a scenario wherethis is blocking the migration, let us know. [Learn more about Conditional Access.](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/overview?WT.mc_id=migration_service_aad_-inproduct-azureportal) |
| AlwaysRequireAuthentication (aka: alwaysRequireAuth) | Gets or sets a value indicating whether always require authentication is enabled | Relying Party has AlwaysRequireAuthentication enabled. | AlwaysRequireAuthentication is not set up. | **Claim type: supported claim**<br><br>This setting in AD FS lets you specify whether the application is configured to ignore SSO cookies and **Always Prompt for Authentication**. In Azure AD, you can manage the authentication session using Conditional Access policies to achieve similar behavior. [Learn more about configuring authentication session management with Conditional Access.](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime?WT.mc_id=migration_service_aad_-inproduct-azureportal) |
| AutoUpdateEnabled | Gets or sets a value indicating whether auto update is enabled | Relying Party has AutoUpdateEnabled set to true. | AutoUpdateEnabled is not set up. | **Claim type: supported claim**<br><br>This setting in AD FS lets you specifywhether AD FS is configured to automatically update the application based on changes within the federation metadata. Azure AD doesnt support this today but should not block the migration of the application to Azure AD. |
| ClaimsProviderName | Gets the list of claims providers | Relying Party has multiple ClaimsProviders enabled.<br><br>or<br><br>Relying Party has a non-Active Directory store: %s .' % data[0] | No Additional Claim Providers were configured. | **Claim type: supported claim**<br><br>This setting in AD FS calls out the identity providers from which the relying party is accepting claims. In Azure AD, you can enable external collaboration using Azure AD B2B. [Learn more about Azure AD B2B.](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/what-is-b2b?WT.mc_id=migration_service_aad_-inproduct-azureportal) |
| EncryptClaims | Gets or sets a value indicating whether claims are encrypted | N/A | Relying Party is set to encrypt claims. This is supported by Azure AD.<br><br>or<br><br>Relying Party is not set to encrypt claims. | **Claim type: supported claim**<br><br>With Azure AD, you can encrypt the token sent to the application. To learn more, see [Configure Azure AD SAML token encryption.](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/howto-saml-token-encryption?WT.mc_id=migration_service_aad_-inproduct-azureportal&tabs=azure-portal) |
| encryptedNameIdRequired | Gets or sets a value indicating whether encrypted name ID is required | Relying Party is set to encrypt Name ID. | Relying Party is not set to encrypt name ID. | **Claim type: supported claim**<br><br>The application is configuredto encryptthenameIDclaim in the SAML token.With Azure AD, you can encrypt the entire token sent to the application.Encryptionof specific claims is not yet supported. To learn more, see [Configure Azure AD SAML token encryption.](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/howto-saml-token-encryption?WT.mc_id=migration_service_aad_-inproduct-azureportal&tabs=azure-portal)
| monitoringEnabled | Gets or sets a value indicating whether monitoring is enabled | Relying Party has MonitoringEnabled set to true. | MonitoringEnabled is not set up. | **Claim type: supported claim**<br><br>This setting in AD FS lets you specify whether AD FS is configured to automatically update the application based on changes within the federation metadata. Azure AD doesn't support this today, but this should not block the migration of the application to Azure AD. |
| NotBeforeSkew | Gets or sets the not before skew | Relying Party has NotBeforeSkew configured. | Relying Party has NotBeforeSkew configured to value 5.<br><br>or<br><br>NotBeforeSkew is not set up. | **Claim type: supported claim**<br><br>AD FS allows a time skew based on the NotBefore and NotOnOrAfter times in the SAML token. Azure AD handles this by default. |
| RequestMFAFromClaimsProviders | Gets or sets a value indicating whether request MFA from claims providers | Relying Party has RequestMFAFromClaimsProviders set to true. | RequestMFAFromClaimsProviders is not set up. | **Claim type: supported claim**<br><br>This setting in AD FS determines the behavior for multifactor authentication when the user comes from a different claims provider. In Azure AD, you can enable external collaboration using Azure AD B2B. Then, you can apply Conditional Access policies to protect guest access. Learn more about [Azure B2B](https://learn.microsoft.com/en-us/azure/active-directory/external-identities/what-is-b2b?WT.mc_id=migration_service_aad_-inproduct-azureportal) and [Conditional Access](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/overview?WT.mc_id=migration_service_aad_-inproduct-azureportal).
| signedSamlRequestsRequired (aka: signedSamlRequest) | Gets or sets a value indicating whether signed SAML requests are required | Relying Party has SignedSamlRequestsRequired set to true. | SignedSamlRequestsRequired is not set up. | **Claim type: supported claim**<br><br>The application is configured in AD FS to verify the signature in the SAML request. Azure AD accepts a signed SAML request; however, it will not verify the signature. Azure AD has different methods to protect against malicious calls. For example, Azure AD uses the reply URLs configured in the application to validate the SAML request. Azure AD will only send a token to reply URLs configured for the application. If you have a scenario wherethis is blocking the migration, let us know. |
| TokenLifetime | Gets or sets the token lifetime | TokenLifetime is set to less than 10 minutes. | TokenLifetime is set to a supported value. | **Claim type: supported claim**<br><br>The application is configured for a custom token lifetime. The AD FS default is one hour.Azure AD supports this functionality using Conditional Access. To learn more, see [Configure authentication session management with Conditional Access](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/howto-conditional-access-session-lifetime?WT.mc_id=migration_service_aad_-inproduct-azureportal). |
| AdditionalAuthenticationRules (aka: additionalAuth) | Gets or sets the additional authentication rules |  | AdditionalAuthentication is valid.| **Claim type: supported claim**<br><br>The relying party has rules to prompt for multifactor authentication. To move to Azure AD, translate those rules into Conditional Access policies. If you're using an on-premises multifactor authentication, we recommend that you move to Azure multifactor authentication. [Learn more about Azure multifactor authentication](https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-mfa-howitworks?WT.mc_id=migration_service_aad_-inproduct-azureportal).
| DelegationAuthorizationRules (aka: DelegationAuthorization) | Gets or sets the delegation authorization rules |  | DelegationAuthorization is valid. | **Claim type: supported claim**<br><br>The application has custom delegation authorization rules defined. This is a WS-Trust concept that Azure AD supports by using modern authentication protocols, such as OpenID Connect and OAuth 2.0. [Learn more about the Microsoft Identity Platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc?WT.mc_id=migration_service_aad_-inproduct-azureportal).
| ImpersonationAuthorizationRules (aka: issuanceAuthorization) | Gets or sets the impersonation authorization rules |  | IssuanceAuthorization is valid. | **Claim type: supported claim**<br><br>Theapplication has custom issuance authorization rules definedin AD FS.Azure AD supports this functionality with Azure AD Conditional Access. [Learn more about Conditional Access](https://learn.microsoft.com/en-us/azure/active-directory/conditional-access/overview?WT.mc_id=migration_service_aad_-inproduct-azureportal).<br><br>You can also restrict access to the application by user or groups assigned to the application. [Learn more about assigning users and groups to access applications](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/assign-user-or-group-access-portal?WT.mc_id=migration_service_aad_-inproduct-azureportal&pivots=portal). Refer to the [claim rule tests](https://learn.microsoft.com/en-us/azure/active-directory/manage-apps/migrate-adfs-application-activity#check-the-results-of-claim-rule-tests?WT.mc_id=migration_service_aad_-inproduct-azureportal) table below for information about the rawIssuanceAuthorizationrules configured in AD FS.
| IssuanceTransformRules (aka: issuanceTransform) | Gets or sets the issuance transform rules |  | IssuanceTransform is valid. | **Claim type: supported claim**<br><br>The application has custom issuance transform rules definedin AD FS. Azure AD supports the customizing the claims issued in the token. To learn more, see [Customize claims issued in the SAML token for enterprise applications](https://go.microsoft.com/fwlink/?linkid=2110604). Refer to the claim rule tests table below for information about the rawIssuanceTransformationrules configured in AD FS.<br>**The following raw IssuanceTransform rules are configured in AD FS**<br>Each claim will be listed. |

___

# Troubleshooting

AD FS Migration insights jobs only executes once by mid-night everyday GMT. If the portal does not reflect changes to the migration state of the rule...

- Verify the correct property was changed on the Relying Party Trust.
- If the correct property was changed, consider waiting an additional 24 hours or verify the migration insights jobs ran using Kusto.

AD FS Migration insights job extracts data from the Relying party and sign-in Kusto clusters using intersection of TenantId, ServiceID and Identifier which is usually an URL. Most frequently reported ICM incidents are around unavailability of AD FS application activity report. As AD FS migration insights has consistent Kusto query it has very few variables. Hence, most of the time the issue lies within the Relying Party or sign-in data because of user configurations.

In the event the AD FS activity report or migration does not show up because of missing data, the following queries can be used to make sure that tenant data is available within both Relying party and sign-in Kusto clusters.

**Note**: To identify the exact Kusto clusters, you need to identify the tenant region scope as shown in the [How to find tenant region scope](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=1078423&anchor=how-to-find-tenant-region-scope) section of this wiki and check the respective regions cluster.

___

# How to find tenant region scope

One possible way to identify the tenant region scope to use the following url with tenant id,

https://login.microsoft.com/{tenantId}/.well-known/openid-configuration 

**Response**:

![TenantRegion](/.attachments/AAD-Authentication/1078423/TenantRegion.jpg)

___

## Query for Relying party Kusto clusters

```json
cluster('https://adprovisioningstoreeus.kusto.windows.net/').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
| where tenantId == '{tenantId}'  and env_time > ago(2d)
| project tenantId, serviceId, Identifier
```

___

## Query for signin Kusto clusters

```json
union
    cluster('https://adlsprodoc00ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodoc01ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodoc02ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns
| where tenantId == '{tenantId}' and env_time > ago(30d)
| project tenantId, serviceId, resourceId
```

**Note**: PremiumSignIns maintains the Identifier within the resourceId column, whereas AdfsWebApiApplicationEvents keep it within Identifier column itself.

If both queries return the data, make sure there is overlap between the data by using following query for manual comparison of data. In case there is over overlap following queries should return the results.

- Australia East (AUE):

```json
let customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
    cluster('https://adprovisioningstoreeus.kusto.windows.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinid = Identifier);
let signinData = materialize(union
    cluster('https://adlsprodoc00ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodoc01ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodoc02ase.australiasoutheast.kusto.windows.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinid = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinid);
rankedCandidateCounts
    | project tenantId, serviceId, joinid
```

- North Central US (NCU):

```json
et customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
    cluster('https://adprovisioningstoreeus.kusto.windows.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinid = Identifier);
let signinData = materialize(union
    cluster('https://adlsprodna00eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna01eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna02eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna03eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna04eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna05eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna06eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna07eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna08eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna09eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodna10eus2.eastus2.kusto.windows.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinid = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinid);
rankedCandidateCounts
    | project tenantId, serviceId, joinid
```

- Southeast Asia (SEA):

```json
let customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
    cluster('https://adprovisioningstoreeus.kusto.windows.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinid = Identifier);
let signinData = materialize(union
    cluster('https://adlsprodas00sea.southeastasia.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodas01sea.southeastasia.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodas02sea.southeastasia.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodas03sea.southeastasia.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodas04sea.southeastasia.kusto.windows.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinid = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinid);
rankedCandidateCounts
    | project tenantId, serviceId, joinid
```

- North Europe (NEU):

```json
let customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
    cluster('https://adprovisioningstoreneu.kusto.windows.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinId = Identifier);
let signinData = materialize(union
    cluster('https://adlsprodeu00neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu01neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu02neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu03neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu04neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu05neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu06neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu07neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu08neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu09neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu09neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinId = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinId);
rankedCandidateCounts
    | project tenantId, serviceId, joinId
```

- Africa (WEU):

```json
let customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
    cluster('https://adprovisioningstoreeus.kusto.windows.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinId = Identifier);
let signinData = materialize(union
    cluster('https://adlsprodeu00neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu01neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu02neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu03neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu04neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu05neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu06neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu07neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu08neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu09neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns,
    cluster('https://adlsprodeu09neu.northeurope.kusto.windows.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinId = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinId);
rankedCandidateCounts
    | project tenantId, serviceId, joinId
```

- Fairfax:

```json
let customerTenantId = '{tenantId}';
let relyingPartyTrusts = materialize(
   cluster('https://adpsusgovusg00usgova.usgovarizona.kusto.usgovcloudapi.net').database('AdfsApplicationEvents').AdfsWebApiApplicationEvents
    | where tenantId == customerTenantId
    | extend joinId = Identifier);
let signinData = materialize(union
    cluster('https://adlsusgovusg00usgova.usgovarizona.kusto.usgovcloudapi.net').database('signins-*').PremiumSignIns
    | where tenantId == customerTenantId
    | extend joinId = resourceId
);
let rankedCandidateCounts = materialize(relyingPartyTrusts
    | join kind = inner signinData on tenantId, serviceId, joinId);
rankedCandidateCounts
    | project tenantId, serviceId, joinId

```

___

## Azure Support Center (ASC)

___

### Graph explorer

Under the `AdditionalWSFedEndpointCheckResult` section, identify the name of each rule that has a `value` containing a `result` that is not "0".

- **Success** = `0` - represented with green icon. 

- **Fail** = `1` - represents programmatic evaluation failure/error scenario with the Migration Insights jobs. This will show a yellow warning icon on the rule.

- **Warning** = `2` - represented with a yellow warning icon on the rule and guidance the admin can perform to flip the rule to "0"/success the next time the Migration Insights jobs execute by mid-night GMT. 

**Query Url**: `https://graph.microsoft.com/beta/reports/getRelyingPartyDetailedSummary(period='D30')?emitv2rules=true`

**Version**: `beta`

___

# ICM Path

## Migration Insight Issues

Support engineers should set the Support topic to `Azure\Azure Active Directory App Integration and Development\Enterprise Applications\Access Management(Users, Groups, Owners, App-Roles and Self-Service)`

If ASC Escalations are not working, support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=bl1w2j%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B%E2%80%8B) to create an ICM.

TAs route the ICM to this PG:

- **Owning Service**: ESTS
- **Owning Team**: ESTS

## AppEx support

The migration state shows **Ready** indicating migration should succeed, or migration state shows **Needs Review** indicating changes need to occur, but it is still eligible for migration.

Support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=bl1w2j) to file and ICM.

TAs route the ICM to this PG:

- **Owning Service**: Enterprise App Management

- **Owning Team**: Enterprise App Management

___

## AD FS support

The migration state shows **Additional steps required** indicating steps are need to be performed in AD FS.

Support engineers can use [this template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=3r1z30) to file and ICM.

TAs route the ICM to this PG:

- **Owning Service**: Windows Server Role ADFS

- **Owning Team**: Ask ADFS PG

___

# Training

**Title**: Deep Dive 156752 - ADFS Application Migration

Identity PM, Smriti and developers Swapnil Maldhure and Emanuel Vitorino present the new Active Directory Federation Services (AD FS) to Azure AD Application Migration tool that appears under **Usage & insights** in the "Monitoring & health" section of the Microsoft Entra ID portal.

Many customers want to migrate their on-premises AD FS relying party applicationsto the cloud in orderto take advantage of security features in Azure AD. A new **ADFS Application Migration** blade that appears under **Usage & insights** makes this possible. Unlike its predecessor, the **ADFS Application Activity Report** blade, this tool actually facilitates the migration of relying party applications from ADFS into an Azure AD application.

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 48 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752) and [MSaaS AAD - Applications Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072) 

**Tool Availability**: August 30, 2023

**Training Completion**: August 30, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAm3ptx)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.



