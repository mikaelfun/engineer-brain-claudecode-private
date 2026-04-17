---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FMicrosoft%20Entra%20Domain%20Services"
importDate: "2026-04-05"
type: troubleshooting-guide
---
---
Tags:
- cw.Entra
- cw.AAD-Workflow
- cw.EntraId
- cw.comm-orgmgt
---
:::
 

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Account-Management](/Tags/AAD%2DAccount%2DManagement) [AAD-Workflow](/Tags/AAD%2DWorkflow) [AzureAD](/Tags/AzureAD) [comm-orgmgt](/Tags/comm%2Dorgmgt)   
 


[[_TOC_]]


# Upcoming Entra DS feature roadmap (as of June 2024)
- [Recorded session](https://microsofteur-my.sharepoint.com/:v:/g/personal/tovascon_microsoft_com/EbOTC3AZlQRJl8qqTqLkgpEBj9_fnqEqyCWKUSm_CmAUiw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D&e=u12uLk)

  -   Please note that the Entra DS feature roadmap is subject to change based on the availability of our development team, as we are currently prioritizing company-wide security efforts. Contact your Entra DS EEE for latest status and get involved with beta. 

 - **Support for multiple instances**
Allow customers to create multiple instances within the same subscription. This will enable scenarios such as setting up staging environments for load tests and setting up separate instances for business units.

 - **Domain Controller Network Watcher**
This feature will allow admins to self-diagnose whenever they lose network connection to their Domain controller. 

 - **Investigate high performance billing tiers**
Investigate the business case for customers who would like higher CPU/RAM resources to match their on-prem resources.

 - **Support for Schema Extensions**
Allow customers to use legacy applications that rely on custom attributes on Entra Domain Services.

 - **SamAccountName Conflict Resolution**
Change the sync rules between Entra ID and Entra Domain Services to populate samAccountName attribute from the onPremisesSamAccountName attribute instead of populating it from mailNickname attribute in the Entra ID tenant.

 - **Integrate ReplicaSets with AD sites**
Allow customers using Linux clients to properly configure their AD sites and services with ReplicaSets.

 - **Integrate Telemetry Dashboards**
Update telemetry dashboards available to customers with relevant insights such as synchronization performance.

 - **TBD Security Log view in ASC **


# MEDS feedback email!

**Do not send customers to the MEDS feedback DL\!**

Reports from the product group indicate that some engineers are referring customers to our internal MEDS feedback DL. This is not a troubleshooting DL and we should **never** direct customers to engage the PG via this DL. Please follow your standard escalation process with our customers.

thanks.

#Case documentation and good practices when looking for help
It is extremely important to be consistent in case documentation specially when looking for help in Teams or via escalation.
 
**Basic information to always check and include in the documentation:**

- **What is the customer goal:** Note that is not about what issues the customer is having but what his intended use of MEDS is.
- **Issue:** What is the exact issue, replication steps and errors the customer is getting, screenshots, screen recordings.

**Tenant ID**
- Ask the customer for it.
- Depending on how the case was open it will be available in the case details.
- Open ASC and go to resource explorer depending on how the case was opened you can find it there.
- If you only have the subscription id available run this query: https://jarvis-west.dc.ad.msft.net/17943F82
- If you only have the domain name run this query: https://jarvis-west.dc.ad.msft.net/DF62B093

**SubscriptionID**
- Depending on how the case was opened it will be available in SD and in ASC resource explorer.
- If you have the tenant id, run this query (clientSubscriptionId): https://jarvis-west.dc.ad.msft.net/4FA151C4
- If you only have the domain name (clientSubscriptionId): https://jarvis-west.dc.ad.msft.net/DF62B093 
- Ask the customer for it

**Domain name and deployment id:**
- Get the subscriptionID load it in ASC resource explorer and find it in the main page
- Ask the customer for the domain name, customers donÆt have visibility of the deployment ID, we can get it from ASC


**Basic checks depending on the issue.**
- Domain health
- Sync health
- Replica health
- ASC diagnostic comparison
- ASC link


**Information needed when escalating**
- All the above
- Make emphasis on the customer goal, the replication steps followed, if you are using Teams record the session, modify it to be accessible to all with link and include it (point to the time gap of the rep if too long), get screenshots. In general be specific on what the customer is using MEDS for, what is having troubles with, what steps is following to get to those troubles and add support imagery in any way you can when possible.
- What have you checked, done and recommended so far and the results.
- What is your specific question, given your troubleshooting and research what do you expect from the escalation, what are your suspicions, what would you like to get confirmation on, are you looking for advisory, troubleshooting or RCA?


**Information to include as part of the case closure.**

Closing the case is not the end of the road, with each interaction we generate knowledge, making sure that knowledge is accessible to other in the future is part of our case management. When closing the case make sure to leave in notes and in the case details the following information:

- Symptom / Issue / Goal: Regardless of what the case was about there is always a reason why the customer opened the case What was the customer question, what error while doing what did he get, what is his goal, was it working before, is it a new implementation, when did the problem start or after doing what?
- Cause: What was the result of the case analysis, what is causing the issue, error o question, was it some thing the customer did, was it a service side issue, how did you identify the root cause.
- Resolution: What is the step by step instructions that fixed the customerÆs issue.

# Overview

Microsoft Entra Domain Services provide managed domain services such as domain join, group policy, LDAP, Kerberos/NTLM authentication, etc. that are compatible with Windows Server Active Directory. Microsoft Entra Domain Services enable you to consume these domain services typically provided by a Windows Server domain controller, without the need for you to deploy, manage and patch domain controllers.

With Microsoft Entra Domain Services you can deploy your workloads in Azure Infrastructure Services, without having to worry about maintaining identity infrastructure in Azure. This managed service is different from a typical Windows Server Active Directory deployment that you deploy and administer on your own. The service is easy to deploy and delivers automated health monitoring and remediation. We are constantly evolving the service to add support for [common deployment scenarios](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-scenarios).

### Choosing to use Microsoft Entra Domain Services

Use [How to decide if Microsoft Entra Domain Services is right for your use-case](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-comparison) to compare Microsoft Entra Domain Services with 'Do-it-yourself AD in Azure VMs' to see if Microsoft Entra Domain Services is right for you.

Use [Compare Microsoft directory-based services](https://learn.microsoft.com/en-us/entra/identity/domain-services/compare-identity-solutions) to learn differences between Entra ID join and Microsoft Entra Domain Services and helps you choose, based on your use-cases.

Also, see [Microsoft Entra Domain Services overview with Ignite 2017 presentation](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-overview)

**This article contains references to the Azure classic portal in order to be as complete as possible. The Azure classic portal is no longer being developed and should no longer be used. Please direct customers and support engineers to <http://portal.azure.com> to access Azure features.**

# Features

The following features are available in Microsoft Entra Domain Services managed domains.

  - **Simple deployment experience:** You can enable Microsoft Entra Domain Services for your Entra ID tenant using just a few clicks. Regardless of whether your Entra ID tenant is a cloud-tenant or synchronized with your on-premises directory, your managed domain can be provisioned quickly.
  - **Support for domain-join**: You can easily domain-join computers in the Azure virtual network your managed domain is available in. The domain-join experience on Windows client and Server operating systems works seamlessly against domains serviced by Microsoft Entra Domain Services. You can also use automated domain join tooling against such domains.
  - **One domain instance per Entra ID directory**: You can create a single Active Directory domain for each Entra ID directory.
  - **Create domains with custom names**: You can create domains with custom names (for example, 'contoso100.com') using Microsoft Entra Domain Services. You can use either verified or unverified domain names. Optionally, you can also create a domain with the built-in domain suffix (that is, '\*.onmicrosoft.com') offered by your Entra ID directory.
  - **Integrated with Entra ID**: You do not need to configure or manage replication to Microsoft Entra Domain Services. User accounts, group memberships, and user credentials (passwords) from your Azure AD directory are automatically available in Microsoft Entra Domain Services. New users, groups, or changes to attributes from your Entra ID tenant or your on-premises directory are automatically synchronized to Microsoft Entra Domain Services.
  - **NTLM and Kerberos authentication**: With support for NTLM and Kerberos authentication, you can deploy applications that rely on Windows Integrated Authentication.
  - **Use your corporate credentials/passwords**: Passwords for users in your Entra ID tenant work with Microsoft Entra Domain Services. Users can use their corporate credentials to domain-join machines, log in interactively or over remote desktop, and authenticate against the managed domain.
  - **LDAP bind & LDAP read support**: You can use applications that rely on LDAP binds to authenticate users in domains serviced by Microsoft Entra Domain Services. Additionally, applications that use LDAP read operations to query user/computer attributes from the directory can also work against Microsoft Entra Domain Services.
  - **Secure LDAP (LDAPS)**: You can enable access to the directory over secure LDAP (LDAPS). Secure LDAP access is available within the virtual network by default. However, you can also optionally enable secure LDAP access over the internet.
  - **Group Policy:** You can use a single built-in GPO each for the users and computers containers to enforce compliance with required security policies for user accounts and domain-joined computers. You can also [create your own custom GPOs and assign them to custom organizational units](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-admin-guide-administer-group-policy) to manage group policy.d
  - **Manage DNS**: Members of the 'Entra DC Administrators' group can manage DNS for your managed domain using familiar DNS administration tools such as the DNS Administration MMC snap-in.
  - **Create custom Organizational Units (OUs):** Members of the 'Entra DC Administrators' group can create custom OUs in the managed domain. These users are granted full administrative privileges over custom OUs, so they can add/remove service accounts, computers, groups etc. within these custom OUs.
  - **Available in multiple Azure regions**: See the Azure services by region page to know the Azure regions in which Microsoft Entra Domain Services is available.
  - **High availability**: Microsoft Entra Domain Services offers high availability for your domain. This feature offers the guarantee of higher service uptime and resilience to failures. Built-in health monitoring offers automated remediation from failures by spinning up new instances to replace failed instances and to provide continued service for your domain.
  - **Use familiar management tools**: You can use familiar Windows Server Active Directory management tools such as the Active Directory Administrative Center or Active Directory PowerShell to administer managed domains.

# What's new

## Synching of Custom Attributes

When a Microsoft Entra Domain Services (MEDS) managed domain is deployed, an automatic one-way synchronization is configured, and objects replicate from Entra ID to the local domain. Until now organizations could only synchronize a built-in set of attributes.

Custom Attributes for Microsoft Entra Domain Services will Generally Available around 31 March 2025 and will include Entra PowerShell commandlets. This release exposes a new **Custom Attributes** blade which allows the Enterprise SKU of Microsoft Entra Domain Services (MEDS) to add custom data to resources using directory extensions. This enables companies that can't modify code on legacy applications with LDAP attribute dependencies to use custom attributes, such as a custom employee ID.

![CustomAttributes](/.attachments/AAD-Account-Management/183952/CustomAttributes.jpg)

The feature allows the following types of extensions to be synchronized from Entra local domain resources for consumption by legacy apps:

- **Enable predefined attribute synchronization**

Checking **OnPremisesExtensionAttributes (Exchange custom attributes 1-15)** and clicking **Save** causes the entire set of 15 [Exchange custom attributes](https://learn.microsoft.com/en-us/graph/api/resources/onpremisesextensionattributes?view=graph-rest-1.0) to store extended user string attributes as a single blob attribute on users.

If you use Entra Connect and sync the extension attribute 1-15 they get synced as the `OnPremisesExtensionAttributes` blob.

For on-perm users Entra Connect must be used to update these properties, but they can be modified for cloud only users.

Enabling this feature syncs all 15 Exchange custom attributes.

- **Synchronize Entra directory extension attributes**

These directory extension are based on applications. Extending the schema in AD for users and/or groups allows Applications to find them.  When extensions are onboarded, Administrators can select from a list of individual user and group attributes that exist in Entra ID for synchronization from Entra ID to local domain resources and click **Save**.

**Note**: Even though they are in the list does not mean that the extension is successfully onboarded. For example, attempting to sync custom attributes like SamAccountName or msDS-aadObjectId could conflict with existing schema configuration.

Click **Add** to launch the Select custom attributes view when the desired extension isnÆt present in the list. This exposes all available directory extensions in the tenant, excluding those in the onboarded list. If an extension is not listed, enter the Application ID, and click **Search** to load that applicationÆs defined extension properties.

![SelectCustomAttributes](/.attachments/AAD-Account-Management/183952/SelectCustomAttributes.jpg)

Failures will likely be due to customers adding an attribute that conflicts with the AD schema. For example, adding `extensionattribute5`, which is part of Exchange custom attributes 1-15 would fail. Customers wanting to sync Exchange custom attributes 1-15 should not add them to this list. Instead, they should use the first option of `OnPremisesextensionAttributes` (Exchange custom attributes 1-15)**.

Click **Remove** to eliminate any attributes in the onboarded list which already exist in the schema and cause failures.

While both types of extensions can be configured by using Entra Connect for users who are managed on-premises, or MSGraph APIs for cloud-only users, the following extension types are not supported for synchronization:

-	Custom Security Attributes in Entra ID (Preview)
-	MSGraph Schema Extensions
-	MSGraph Open Extensions

### Requirements

The minimum SKU supported for custom attributes is the Enterprise SKU. Organizations using Standard SKU, must [upgrade](https://learn.microsoft.com/en-us/azure/active-directory-domain-services/change-sku) the managed domain to Enterprise or Premium.

- **Attribute** name is the extension name.
- The format is always: `extension_<applicationGUIDwithoutTheDashes>_<nameOfTheExtension>`

Any dashes that are present are always converted to underscores "_".

- **LDAP name**: This is just the name parsed out. There is no way to change the LDAP name.

- **Type**: There are 6 tpes that are supported: String, Boolean, Integer, LargeInteger, Binary, dateTime and multiValued (which can be string or binary).

- **Targets**: Users, Groups or both.

Customers can a Add or Remove extensions, but they must click **Save** for it to take effect. If they remove and extension it is defuncted and removed from all existing users, but the value will not be cleared out.

**NOTE**: There is no way to setting isDefunct back to false. If the admin onboards the extension again a separate attribute with the same exact LDAP name and it will be synced again.

Attributes that already have an existing built-in schema attribute will not be defuncted.

Collisions, which can occur if schema attributes already exist, are blocked.

This is a list of existing schema attributes that are allowed:

```code
"msDS-cloudExtensionAttribute1"
"msDS-cloudExtensionAttribute2"
"msDS-cloudExtensionAttribute3"
"msDS-cloudExtensionAttribute4"
"msDS-cloudExtensionAttribute5"
"msDS-cloudExtensionAttribute6"
"msDS-cloudExtensionAttribute7"
"msDS-cloudExtensionAttribute8"
"msDS-cloudExtensionAttribute9"
"msDS-cloudExtensionAttribute10"
"msDS-cloudExtensionAttribute11"
"msDS-cloudExtensionAttribute12"
"msDS-cloudExtensionAttribute13"
"msDS-cloudExtensionAttribute14"
"msDS-cloudExtensionAttribute15"
"msDS-cloudExtensionAttribute16"
"msDS-cloudExtensionAttribute17"
"msDS-cloudExtensionAttribute18"
"msDS-cloudExtensionAttribute19"
"msDS-cloudExtensionAttribute20"
"uid"
"uidNumber"
"gidNumber"
"unixHomeDirectory"
"loginShell"
"employeeType"
"employeeNumber"
```

Before an attribute is onboarded the service checks AD to see if there is an attribute with the same LDAP Name. If it is conflicting, then a check will occur to see if it is allow listed. It also checks to make sure the syntax is correct. For example, if it is a String the omsyntax and attributesyntax is checked.

- If it is allow listed it will be onboarded without updating the schema.
- If it is not conflicting it will fail with an error.

If an attribute is compatible and allow listed the attribute will be allowed. 

There is no pop-up when synchronization is blocked. When an attribute is blocked the admin will see it in the **Health** blade. There will be a *Warning* **Alert** that lists all of the specific attributes that have failed.

#### Custom Attributes Sync Public documents

- [Create and manage custom attributes for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/concepts-custom-attributes)

-[Microsoft Entra Domain Services troubleshooting](https://learn.microsoft.com/en-us/entra/identity/domain-services/troubleshoot)

- [AADDS120: The managed domain has encountered an error onboarding one or more custom attributes](https://learn.microsoft.com/en-us/azure/active-directory-domain-services/troubleshoot-alerts#aadds120-the-managed-domain-has-encountered-an-error-onboarding-one-or-more-custom-attributes) in the "Known issues: Common alerts and resolutions in Microsoft Entra Directory Domain Services" document. This is the only error that can occur.

See the [Custom Attributes Sync Training](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?PageID=183952&anchor=custom-attributes-sync-training) section in this document.

## Deprecating Classic Microsoft Entra Domain Services

Microsoft Entra Directory Domain Services became available to host in an Azure Resource Manager network. Since then, we have been able to build a more secure service using the Azure Resource Manager's modern capabilities. Because Azure Resource Manager deployments fully replace classic deployments.

### How does this affect the customer
Customer's current MEDS classic virtual network deployment will be removed, and all applications using MEDS will no longer function.

### What actions should the customer take?

To avoid losing access to your managed domain, migrate Microsoft Entra Domain Services from your classic virtual network to an Azure Resource Manager virtual network.

[Learn more](https://docs.microsoft.com/azure/active-directory-domain-services/migrate-from-classic-vnet) about migrating your managed domain to an Azure Resource Manager virtual network.

## ADV190023 Update [updated 02/10/2020]

The March 2020 security update includes ADV190023 - Microsoft Guidance for Enabling LDAP Channel Binding and LDAP Signing, which changes the default behavior of LDAP by *requiring* LDAP clients to connect to the LDAP server using a signed connection.

For more information see

* [ADV190023 | Microsoft Guidance for Enabling LDAP Channel Binding and LDAP Signing](https://portal.msrc.microsoft.com/en-us/security-guidance/advisory/ADV190023)
* [2020 LDAP channel binding and LDAP signing requirement for Windows](https://support.microsoft.com/help/4520412)
* [LDAP channel binding](https://support.microsoft.com/help/4034879/how-to-add-the-ldapenforcechannelbinding-registry-entry)
* [LDAP signing](https://support.microsoft.com/help/935834/how-to-enable-ldap-signing-in-windows-server-2008)

### Key points of ADV190023

* Windows Updates in March 2020
  * **Adds** new *audit events*, *additional logging*, and a *remapping of Group Policy values that will enable hardening LDAP Channel Binding and LDAP Signing*. The remapping **does not change any state**; it simply changes the Group Policy display names that map to the specified settings.
  * **Does not** make changes to LDAP signing or channel binding policies or their registry equivalent on new or existing domain controllers.
* A **future monthly update**, anticipated for **the second half of calendar year 2020**, will *enable LDAP signing and channel binding on domain controllers configured with default values for those settings*.

### LDAP signing

The suggested H2 2020 update will change the default LDAP configuration to require LDAP signing to bind to Microsoft Entra Domain Services. Any attempt to bind to Microsoft Entra Domain Services without LDAP signing enabled results in the return value of "Strong authentication is required." (LDAP Error code 8). This update also does not allow simple LDAP binds.

Windows clients, by default, use LDAP signing

### LDAP Channel Binding

The suggested H2 2020 update will change the default LDAP configuration to use LDAP channel binding when the client supports LDAP channel binding. LDAP channel binding is only used with secure LDAP (LDAPS). The change in the future update does not affect Azure AD Domain Services because its default value for LDAP Channel Binding matches the default in the future update.

### Impact on Microsoft Entra Domain Services

**The changes do not affect Microsoft Entra Domain Services at this time.** The Microsoft Entra Domain Services PM and Engineering team are monitoring for any changes to these settings that may disrupt the service.


## Azure Files MEDS Integration
Are you looking for information on accessing Azure Files from Microsoft Entra Domain Services? There is a complete wiki for this. Check out [Azure Files AAD DS Integration](https://supportability.visualstudio.com/AzureIaaSVM/_wiki/wikis/AzureIaaSVM/495027/AAD-DS-Integration_Storage)

## Preview - Microsoft Entra Domain Services Resource Forest
Microsoft Entra Domain Services Resource Forest is now in public preview. See https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/267461/Azure-AD-Domain-Services-Resource-Forest for more information.


## Migrate Microsoft Entra Domain Services from the Classic virtual network model to Resource Manager

Microsoft Entra Domain Services (MEDS) supports a one-time move for customers currently using the Classic virtual network model to the Resource Manager virtual network model.

MEDS on Classic deployments will start a sunset period beginning in March 2020, ending March 2023. By then all MEDS deployments on Classic virtual networks will need to be moved.

Read all about it here:[Overview of Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/overview)

View the troubleshooting guide here: [AADDS Classic TSG.pdf](https://microsoft.sharepoint-df.com/:b:/s/AccountManagement-SupportEngineeringconnection/Ed530mhx1DBLgdGNDwicwEABmomcadGB6JbYLKLn_VQIFA?e=qJ0B4G)



## MEDS Creation UI is being updated

Look for changes in the creation user interface starting around October 17, 2019. Our documentation will be updated to reflect the changes.  

See more here:[Tutorial - Create a Microsoft Entra Domain Services managed domain](https://learn.microsoft.com/en-us/entra/identity/domain-services/tutorial-create-instance)

 



## Customers can Enable Security Audits for Microsoft Entra Domain Services (Preview)

Public preview will start rolling out early the week of 8 July 2019.

Microsoft Entra Domain Services is adding a feature to enable customers to subscribe to security events logs sourcing from Microsoft Entra Domain Services service. Microsoft Entra Domain Services Security Auditing enables customers to use the Microsoft Entra Domain Services portal to stream security audit events to targeted resources. Resources that can receive these events include Azure Storage, Azure Log Analytics workspaces, or Azure Event Hub. Shortly after enabling security audit events, Microsoft Entra Domain Services sends all the audited events for the selected category to the targeted resource. Security audit events enable customers to archive audited events into Azure storage. Additionally, customers can stream events into security information and event management (SIEM) software (or equivalent) using event hubs, or do their own analysis and insights using Azure Log Analytics from the Azure portal.á

Use these logs for audit purposes, account lockouts, bad password attempts, and anything else that would be written to the security event logs on a classic domain controller.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![2019-06-26 16-23-50.png](/.attachments/edb69ff4-4378-c481-6ca3-0b98da75b4b3600px-2019-06-26_16-23-50.png)](/.attachments/edb69ff4-4378-c481-6ca3-0b98da75b4b3600px-2019-06-26_16-23-50.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

Enable Security Audits for Microsoft Entra Domain Servicesá: [Enable security and DNS audits for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/security-audit-events)

Support boundaries:

|Action| Supporting team|
|--|--|
| Problems creating the Log Analytics Workplace or subscribing to the auditing | Azure Monitor/Log analytics |
| Enable the feature | Entra Account Management ensures the feature is not being enabled on a classic network deployment, not supported. |
| Questions about the data contained in the logs | Entra Account Maangement |
| Customizing the MEDS Log Analytics workbooks |  Azure workbooks|
| Advisory and issues querying data | Azure Monitor/Log analytics |



## *Plan your network for Microsoft Entra Domain Services* has been updated

As of 7 June 2019 we updated this article to provide guidance for customers to properly plan and deploy their network for Microsoft Entra Domain Services.

Plan your network for Microsoft Entra Domain Servicesá: [Network planning and connections for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/network-considerations)

## Microsoft Entra Domain Services now has email notifications\!

As of October 23rd 2018:

A new blade is available for customers to edit their email notifications and receive info about alerts found on their managed domain. More info in the documentation all about MEDS notifications:á[Email notifications for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/notifications)

**How will this impact you?**

Many customers whoá*were unaware*áof their service misconfiguration or problems will be getting emails today û the emails will be sent to anyone who is a global administrator or a member of the MEDS Admin groups on that tenant. This means that we can expect a lot of customers to realize that their MEDS instance is broken and will want to fix it. We have tried to create this feature to be self-service; each alert should be able to be solved by themselves (except for the case of a suspended tenant).

**What to do if a customer gets an email notification?**

Each email notification mirrors one of the alerts already available in the Azure portal. The alerts are accompanied with a set of resolution steps that walks the customer through how to solve their problem. You can view the steps needed to be taken by going toá<https://aka.ms/aadds-alerts>áand search for the alert active on their tenant. You can also go to ASC for this information.

**How many customers are impacted?**

In the last 7 days, we would have emailedá*one-thousand*ádifferent tenants. 1000\!

**More info:**

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-notifications>

If any of you have any feedback or questions about notifications (which we would love to hear), it can be sent toá\[null ergreenl@microsoft.com\]áorá\[null aaddsfb@microsoft.com\]á

As of October 5th 2017:

  - [General availability: Azure AD DS in the new Azure portal](https://azure.microsoft.com/en-us/updates/azure-ad-domain-services-azure-portal-ga/)
  - [General availability: Azure AD DS support for Resource Manager virtual networks](https://azure.microsoft.com/en-us/updates/azure-ad-domain-services-support-for-resource-manager-virtual-networks-ga/)

[Third-party software compatible with Azure AD Domain Services](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-compatible-software)

# Case Handling

Case handling is managed by [AAD - Account Management](https://expert.partners.extranet.microsoft.com/expert/Radius?QueueName=AAD%20-%20Account%20Management&QueueNameFilter=azure%20ad%20domain%20services&SearchFlag=True) for issues that involve deployment or operation.

# How it works

Microsoft Entra Domain Services provides managed domain services such as domain join, group policy, LDAP, Kerberos/NTLM authentication that are fully compatible with Windows Server Active Directory. You can consume these domain services without the need for you to deploy, manage, and patch domain controllers in the cloud. Microsoft Entra Domain Services integrates with your existing Entra ID tenant, thus making it possible for users to log in using their corporate credentials. Additionally, you can use existing groups and user accounts to secure access to resources, thus ensuring a smoother 'lift-and-shift' of on-premises resources to Azure Infrastructure Services.

Microsoft Entra Domain Services functionality works seamlessly regardless of whether your Entra ID tenant is cloud-only or synced with your on-premises Active Directory.

## Architecture Diagrams

### Microsoft Entra Domain Services for cloud-only organizations

A cloud-only Entra ID tenant (often referred to as 'managed tenants') does not have any on-premises identity footprint. In other words, user accounts, their passwords, and group memberships are all native to the cloud - that is, created and managed in Entra ID. Consider for a moment that Contoso is a cloud-only Entra ID tenant. As shown in the following illustration, Contoso's administrator has configured a virtual network in Azure Infrastructure Services. Applications and server workloads are deployed in this virtual network in Azure virtual machines. Since Contoso is a cloud-only tenant, all user identities, their credentials, and group memberships are created and managed in Entra ID.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![Aadds-overview.png](/.attachments/dd9107e4-f652-4a68-9665-e770491c2f4d600px-Aadds-overview.png)](/.attachments/dd9107e4-f652-4a68-9665-e770491c2f4d600px-Aadds-overview.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

Advantages are:

  - Contoso's IT administrator does not need to manage, patch, or monitor this domain or any domain controllers for this managed domain.
  - There is no need to manage AD replication for this domain. User accounts, group memberships, and credentials from Contoso's Azure AD tenant are automatically available within this managed domain.
  - Since the domain is managed by Microsoft Entra Domain Services, Contoso's IT administrator does not have Domain Administrator or Enterprise Administrator privileges on this domain.

### Microsoft Entra Domain Services for hybrid organizations

Organizations with a hybrid IT infrastructure consume a mix of cloud resources and on-premises resources. Such organizations synchronize identity information from their on-premises directory to their Entra ID tenant. As hybrid organizations look to migrate more of their on-premises applications to the cloud, especially legacy directory-aware applications, Microsoft Entra Domain Services can be useful to them.

Litware Corporation has deployed Entra Connect, to synchronize identity information from their on-premises directory to their Entra ID tenant. The identity information that is synchronized includes user accounts, their credential hashes for authentication (password sync) and group memberships.

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![Aadds-overview-synced-tenant.png](/.attachments/81b31104-3e15-1d8f-cfe5-52fc8fa5ab80600px-Aadds-overview-synced-tenant.png)](/.attachments/81b31104-3e15-1d8f-cfe5-52fc8fa5ab80600px-Aadds-overview-synced-tenant.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

Advantages are:

  - The managed domain is a stand-alone domain. It is not an extension of Litware's on-premises domain.
  - Litware's IT administrator does not need to manage, patch, or monitor domain controllers for this managed domain.
  - There is no need to manage AD replication to this domain. User accounts, group memberships, and credentials from Litware's on-premises directory are synchronized to Entra ID via Entra Connect. These user accounts, group memberships, and credentials are automatically available within the managed domain.
  - Since the domain is managed by Microsoft Entra Domain Services, Litware's IT administrator does not have Domain Administrator or Enterprise Administrator privileges on this domain.

### How synchronization works

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-synchronization>

# Limitations

### Current limitations

  - We are unable to move Microsoft Entra Domain Services from one subscription to another. This is because Microsoft Entra Domain Services is exposed to a specific vNet. Customers can disable Microsoft Entra Domain Services and then migrate and then re-create a new instance in the new subscriptioná

##### The Entra ID Tenant is too large, and takes a long time to sync data to MEDS

This can be identified by a health alert in the Azure portal as described above. Depending on the size of your directory, it may take a while for user accounts and credential hashes to be available in Microsoft Entra Domain Services. Ensure you wait long enough before retrying authentication (depending on the size of your directory - a few hours to a day or two for large directories). Currently, we have known issues around synchronizing large tenants, where number of users and groups are \>15K each (not necessarily, it is a figurative number), and the sync may never converge. Current ETA is March 2018 for making the situation better by converging quicker.á

### Exclusions - what isn't synchronized to your managed domain

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-synchronization>

  - **Excluded attributes**: You may choose to exclude certain attributes from synchronizing to your Entra ID tenant from your on-premises domain using Azure AD Connect. These excluded attributes are not available in your managed domain.
  - **Group Policies**: Group Policies configured in your on-premises domain are not synchronized to your managed domain.
  - **SYSVOL share**: Similarly, the contents of the SYSVOL share on your on-premises domain are not synchronized to your managed domain.
  - **Computer objects**: Computer objects for computers joined to your on-premises domain are not synchronized to your managed domain. These computers do not have a trust relationship with your managed domain and belong to your on-premises domain only. In your managed domain, you find computer objects only for computers you have explicitly domain-joined to the managed domain.
  - **SidHistory attributes for users and groups:** The primary user and primary group SIDs from your on-premises domain are synchronized to your managed domain. However, existing SidHistory attributes for users and groups are not synchronized from your on-premises domain to your managed domain.
  - **Organization Units (OU) structures:** Organizational Units defined in your on-premises domain do not synchronize to your managed domain. There are two built-in OUs in your managed domain. By default, your managed domain has a flat OU structure. You may however choose to create a custom OU in your managed domain.

### Administrative privileges you do not have on a managed domain

The domain is managed by Microsoft, including activities such as patching, monitoring and, performing backups. Therefore, the domain is locked down and you do not have privileges to perform certain administrative tasks on the domain. Some examples of tasks you cannot perform are below.

  - You are not granted Domain Administrator or Enterprise Administrator privileges for the managed domain.
  - You cannot extend the schema of the managed domain.
  - You cannot connect to domain controllers for the managed domain using Remote Desktop.
  - You cannot add domain controllers to the managed domain.
  - You cannot change the value 'ms-DS-MachineAccountQuota' which limits the number of machines that a single account can join.

### Unable to configure RDS license server

Members of the 'AAD DC Administrators' group should be able to add computer objects for the license server to the built-in domain local group 'Terminal Server License Servers group'. This functionality was recently introduced - i.e. in Dec 2017. See [external blog](https://www.jasonfritts.me/2021/04/03/remote-desktop-licensing-on-azure-ad-domain-services/) on this scenario for more details.

### SMB v1 in AADDS

SMB v1 is disabled in MEDS. This is by design. For a temporary workaround see [SMB v1 is disabled in AADDS](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183952#SMB_v1_is_disabled_in_AADDS_2).áá

### Increasing MachineAccountQuota for single or group of accounts

In some specific scenarios customers will incurr on the MachineAccountQuota limit, or might want to reduce it. For changing the quota of a single or group of accounts, run this PowerShell script from a domain joined machine with Active Directory PowerShell Module:

    $RootDSE = Get-ADRootDSE
    $Quota = <NewQuota>

    $GroupName = "<GROUPNAME>"
    $DomainUsers = Get-ADGroup $GroupName

    dsadd quota $RootDSE.defaultNamingContext -qlimit $Quota -acct $DomainUsers.DistinguishedName

  OR 

    $RootDSE = Get-ADRootDSE
    $Quota = <NewQuota>

    $AccountName = "<USERNAME>"
    $DomainUsers = Get-ADUser $AccountName

    dsadd quota $RootDSE.defaultNamingContext -qlimit $Quota -acct $DomainUsers.DistinguishedName

Confirm the change:

    dsget group $DomainUsers.DistinguishedName -part $RootDSE.defaultNamingContext -qlimit -qused  

# How to configure & manage

Please note: the Azure Classic Portal is deprecated and will soon be removed. Steps for the classic portal are for informational use only. Customers and support engineers should always use the Azure portal (preview) which is located at <http://portal.azure.com>

### Azure classic portal (Deprecated, use Azure Portal)

1.  [Enable Azure Active Directory Domain Services using the Azure classic portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-create-group)
2.  [Create or select a virtual network for Azure Active Directory Domain Services](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-vnet)
3.  [Enable Azure Active Directory Domain Services using the Azure classic portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-enableaadds)
4.  [Update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-update-dns)
5.  Enable password synchronization to Azure Active Directory Domain Services (choose one of the following)
    1.  [enable password synchronization to your managed domain for cloud-only user accounts](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync)
    2.  [enable password synchronization to your managed domain for user accounts synced with your on-premises AD](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync-synced-tenant)

### Azure portal

1.  [Enable Azure Active Directory Domain Services using the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started)
2.  [Configure network settings](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-network)
3.  [Configure administrative group](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-admingroup)
4.  [update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-dns)
5.  Enable password synchronization to Azure Active Directory Domain Services (choose one of the following)
    1.  [enable password synchronization to your managed domain for cloud-only user accounts](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync)
    2.  [enable password synchronization to your managed domain for user accounts synced with your on-premises AD](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync-synced-tenant)
6.  [How to update or check Azure AD Domain Services email notifications](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-notifications)

### Create an Organizational Unit (OU) on an Azure AD Domain Services managed domain

Microsoft Entra Domain Services managed domains include two built-in containers called 'AADDC Computers' and 'AADDC Users' respectively. The 'AADDC Computers' container has computer objects for all computers that are joined to the managed domain. The 'AADDC Users' container includes users and groups in the Azure AD tenant. Occasionally, it may be necessary to create service accounts on the managed domain to deploy workloads. For this purpose, you can create a custom Organizational Unit (OU) on the managed domain and create service accounts within that OU. This article shows you how to create an OU in your managed domain.

See [Create an Organizational Unit (OU) on an Azure AD Domain Services managed domain](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-admin-guide-create-ou) for more information.

### Administer Group Policy on an Microsoft Entra Domain Services managed domain

Microsoft Entra Domain Services includes built-in Group Policy Objects (GPOs) for the 'AADDC Users' and 'AADDC Computers' containers. You can customize these built-in GPOs to configure Group Policy on the managed domain. Additionally, members of the 'AAD DC Administrators' group can create their own custom OUs in the managed domain. They can also create custom GPOs and link them to these custom OUs. Users who belong to the 'AAD DC Administrators' group are granted Group Policy administration privileges on the managed domain.

See [Administer Group Policy on an Azure AD Domain Services managed domain](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-admin-guide-administer-group-policy) for more information.

### Configure secure LDAP (LDAPS) for an Azure AD Domain Services managed domain

  - **Azure portal**á: [Enable secure LDAP using the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-admin-guide-configure-secure-ldap)

### Configure Password Policy and Account Lockout using Fine Grained Password Policies

Customers now have the ability to configure their own Fine Grained Password Policies objects allowing them to override our default password and account lockout policies. In the case of an account being locked out, the customer should update the application causing the account to be locked out, either using an updated NSG setting, updating the application's credential (password, certificate) so it stops causing failed authentications, or stopping the application. If those aren't possible, you can override our existing policy using this capability.

The customer will create a new Password Policy object using Active Directory Administrative Center (ADAC). For every policy they are override they provide a new value for the policy with the policy checked.

This document describes in detail how to configure the password policy object: <https://blogs.technet.microsoft.com/canitpro/2013/05/29/step-by-step-enabling-and-using-fine-grained-password-policies-in-ad/>

Note: Currently the save fails if "**Protect from Accidental Deletion**" is checked in ADAC. This is expected to be fixed shortly.

### Other how-to articles

#### Join a Windows Server VM to the managed domain using a Resource Manager templateá

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-join-windows-vm-template>

#### Join a CentOS Linux VM to the managed domain

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-join-centos-linux-vm>

#### Join a CoreOS Linux VM to the managed domain

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-join-coreos-linux-vm>

#### Join an Ubuntu Linux VM to the managed domain

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-join-ubuntu-linux-vm>

#### Disable Azure Active Directory Domain Services using the Azure portal

<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-disable-aadds>

## Creating a keytab file for Linux

### What is a keytab file

Think of keytab files as saving your password in a browser so you donÆt have to provide it again. Except you save it a file and you do this ahead of time (not during sign in). With Linux, you sign in using a client application **kinit**. To sign in using a keytab file, you use the following command:

```kinit -k -t <keytab_file> userprincipal_name```

Using Linux, you create a keytab file using the Linux application **ktutil**. More information about ktutil can be found on the [MIT Kerberos Documentation](https://web.mit.edu/kerberos/krb5-devel/doc/admin/admin_commands/ktutil.html).

Each entry in a keytab file includes:

* The user principal name of the identity that will authenticate
* The keyVersionNumber
* The encryption used
* Optionally, a salt

### Prereqs

The **ktutil** client application must be installed on Linux before you can create a keytab file. The MIT version of **ktutil** is included in the **krb5-user** package. Installing the package may be different among Linux distributions. Consult the distributions documentation for more infomration.

The command to install **krb5-user** on Unbuntu is:

```sudo apt install krb5-user```

You will need credentials equivalent to **root** to install the package.

By default, **ktuil** creates an RC4-based entry in the keytab file, which is not as secure as an AES-based entry (RC4 and AES are types of encryptions used when creating the password hash).

Customers should always use an AES-based entry to sign in to AAD DS as it is more secure

### Create an AES-based entry in a keytab file

Consider the following information for these instructions:

* Azure AD domain name: **contoso.onmicrosoft.com**
* MEDS domain name: **aaddscontoso.com**
* User name: **user**

1. Change to the folder where the keytab file should be saved.
2. Type: ```ktutil``` in the Linux shell and press **Enter**.
3. Type ```addent -password -p [userPrincipalName] -k 1 -e aes256-cts-hmac-sha1-96 -s [salt]```

|Parameter|Description|Example|
|:----|:---------|:------|
|userPrincipalName|The user principal name that uses the Azure AD Domain Services name as the suffix (not the value listed in AAD DS or AAD)|user principal name value to use: user@AADDSCONTOSO.COM (the suffix **must** be capitalized).|
|salt| This value will be the user's UPN suffix (the value in AAD or UPN coming from OnPrem) **capitalized** immediately followed by the **lowercase** username (the user's name that is before the @ sign in the user principal name| salt value to use: CONTOSO.ONMICROSOFT.COMuser (the domain portion **must** be capitalized and the user **must** be lowercase).|

**Example:**
addent -password -p user@AADDS.CONTOSO.COM -k 1 -e aes256-cts-hmac-sha1-96 -s CONTOSO.COMuser

If you not add the salt parameter, MEDS will use the MEDS domain to match the user and that will fail with a "PreAuthentication issue" during the kinit. So, you need to specify the correct realm for MEDS and in that way it will match the user coming from Entra or AD with the one in MEDS.

### Create a RC4-based entry in a keytab file

Consider the following information for these instructions:

* Azure AD domain name: **contoso.onmicrosoft.com**
* MEDS domain name: **aaddscontoso.com**
* User name: **user**

1. Change to the folder where the keytab file should be saved.
2. Type: ```ktutil``` in the Linux shell and press **Enter**.
3. Type ```addent -password -p [userPrincipalName] -k 1 -e rc4-hmac```

### List the entries in a keytab file 

1. Change to the folder where the keytab file should be saved.
2. Type ```ktutil``` in the Linux shell and press **Enter**.
3. Type ```list -k -e```


# Troubleshooting

Along with the multiple tools listed below to troubleshoot Microsoft Entra Domain Services, the Azure Support Center (ASC) poses as the starting point for troubleshooting. See <https://azuresupportcenter.msftcloudes.com/caseoverview> . You can access ASC by either pasting the SR number on the link behind or click the "Azure Support Center" button on the Service Request tab on your MSSolve ticket. Please browse to the following link to have access to the demo on how to use ASC with AADDS: <https://learn.microsoft.com/activity/S2258609/launch>

Once in ASC, click on the Resource Explorer tab and you will be presented under the Microsoft.AAD/DomainServices provider, the MEDS instance with two sections (as depicted below):

[![AADDS Overview 1.png](/.attachments/57ba4936-0b99-6b55-e29b-be23cca3ef3e1400px-AADDS_Overview_1.png)](/.attachments/57ba4936-0b99-6b55-e29b-be23cca3ef3e1400px-AADDS_Overview_1.png)

On the Overview tab you will have a centralized repository of data on the managed domain. Information on the Resource URI, Subscription and Tenant Ids, Domain Controllers' information and Health status, and also Networking settings (VNet and subnet names) as well as other Azure Resources that complement MEDS. Below is highlighted the Networking part of the Overview tab on ASC:

[![AADDS Overview 2.png](/.attachments/ed8c3140-6d23-57ba-84e1-23e3a85d8c251400px-AADDS_Overview_2.png)](/.attachments/ed8c3140-6d23-57ba-84e1-23e3a85d8c251400px-AADDS_Overview_2.png)

The Insights tab on ASC will show you the Health Alerts presented to the customer in the Azure portal on his MEDS resource, as can also be shown below:

[![AADDS Portal Health.png](/.attachments/68d887c1-1215-47ad-467c-c4eb07a5acb51400px-AADDS_Portal_Health.png)](/.attachments/68d887c1-1215-47ad-467c-c4eb07a5acb51400px-AADDS_Portal_Health.png)

which reflected on the Insights tab for MEDS on ASC:

[![AADDS Insights Tab.png](/.attachments/f6e23a6a-47a8-817d-90ea-f5e589bf1c721400px-AADDS_Insights_Tab.png)](/.attachments/f6e23a6a-47a8-817d-90ea-f5e589bf1c721400px-AADDS_Insights_Tab.png)

Please see below how you can leverage ASC and Resource Explorer to troubleshoot Network settings on MEDS.

## Public troubleshooting documentation

This article provides troubleshooting hints for issues you may encounter when setting up or administering Microsoft Entra Domain Services and is shareable with customers: [Azure AD Domain Services - Troubleshooting guide](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-troubleshooting)

### Microsoft Entra Domain Services: Frequently Asked Questions (FAQs)

This page answers frequently asked questions about the Microsoft Entra Domain Services. Keep checking back for updates. See [Azure Active Directory Domain Services: Frequently Asked Questions (FAQs).](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-faqs)

### Resolve mismatched directory errors for existing Microsoft Entra Domain Services managed domains

You have an existing managed domain that was enabled using the Azure classic portal. When you navigate to the new Azure portal and view the managed domain, you see the following error message:

<div class="thumb tnone">

<div class="thumbinner" style="width:602px;">

[![Mismatched-tenant-error.png](/.attachments/b36940d6-dd0f-4c0a-13b3-3cb1a3954702600px-Mismatched-tenant-error.png)](/.attachments/b36940d6-dd0f-4c0a-13b3-3cb1a3954702600px-Mismatched-tenant-error.png)

<div class="thumbcaption">

<div class="magnify">



</div>

</div>

</div>

</div>

See [Resolve mismatched directory errors for existing Azure AD Domain Services managed domains](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-mismatched-tenant-error) for more information.

## Troubleshooting sync issues \[NEW\]

The product group has supplied this workflow for troubleshooting sync issues and would like us to use this prior to escalating a sync issue: [Azure AD Domain Services - Sync Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184100)

## Troubleshooting workflow

Point customers to these self service troubleshooting steps first:

**\*New\* from Feb 2018** - Ensure the Health tab in the Azure portal for MEDS shows all clear. If not, follow corresponding troubleshooting steps to fix the problems.

Top-level landing-page article for troubleshooting alerts: <https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-troubleshoot-alerts>

Troubleshooting NSG issues: <https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-troubleshoot-nsg>

Restoring missing service principals: <https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-troubleshoot-service-principals>

Troubleshooting secure LDAP errors: <https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-troubleshoot-ldaps>

### Deployment

This information is pulled from [How to Enable Azure AD Domain Services](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=184176) and [Troubleshooting AADDS Deploymen](https://microsoft.sharepoint.com/teams/CloudIdentity2/_layouts/15/WopiFrame.aspx?sourcedoc=%7B7c21e975-94ff-484e-8325-e429a5155c41%7D&action=edit&wd=target%28Account%20Management%2FAzure%20AD%20Domain%20Services%20%28DCaas%5C%29%29)

#### Enable MEDSá

**Can you locate Active Directory** in classic portal <https://manage.windowsazure.com>áoráthe Azure portal [http://portal.azure.com](http://portal.azure.com/)

  - Yes:áá
      - Create the 'AAD DC Administrators' group using the articleáá [Enable Azure Active Directory Domain Services using the Azure classic portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-create-group)áá
      - Proceed to Do you have classic VNETá
  - No:áá
      - Sync with Subscription management team (ASMS)á
      - Check what type of subscription customer has and does it have access to classic resourcesá

**Do you have classic VNET**á

  - Yes: Go to "Enable Microsoft Entra Domain Services"á
  - No:áá
      - Do you see classic Networks node in left hand pane in classic portalá
          - Yes:áá
              - Validate if MEDS is supported in your region where you want to enable AAD DS [\[1\]](https://azure.microsoft.com/en-us/regions/services/)<https://azure.microsoft.com/en-us/regions/services/>áá
              - Create VNET in your required & Supported region [\[2\]](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-vnet)[Create or select a virtual network for Azure Active Directory Domain Services](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-vnet)á
              - You can verify the properties of customer vNet using ACISá
                  - Extension: RDFEá
                  - Endpoint: Mirosoftá
                  - OperationGroup: Deployment Managementá
                  - Operation: List Network Virtual Sitesá
                  - Subscription: \<Customer Subscription\>á
          - Noá:á
              - Sync with Subscription management team (ASMS)á
              - Check what type of subscription customer has and does it have access to classic resources? Can they create classic VNETá
              - Get access from ASMS.á
              - Create VNET using above steps.á

##### "Select a virtual network" does notáshow your VNET?

[Check region of your VNET and validate if AADDS is supported in your region](https://azure.microsoft.com/en-us/regions/services/)  
[Update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-dns)

##### Enable password synchronization

[Cloud-only Azure AD tenant](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync)  
[Synced Azure AD tenant](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync-synced-tenant)

#### Disable MEDS

if you are unable to disable MEDSfollow these steps:

##### Do you see AADDS is enabled for your tenantá

  - Yes: **Is it in pending state**á
      -   - Yes: if it is in pending state for more than 2 hoursá
              - No: waitáá
              - Yes: CSS-Get Tenant ID, Domain Name & billing subscription ID and open ICM for Product teamá
  - No:á
      - MEDS is not enabled for this tenant. If you are still getting billed for MEDS, it might be enabled for another tenantá You need to login to Azure portal (AUX) as an admin of that AAD Tenant ID to be able to see and disable MEDS. If any of your co-admins created other Entra ID tenants, and enabled MEDS on them, you would not be able to see them.á If you are the admin for the subscription, and want to delete this MEDS instance for sure we can disable the service from the backend.: CSS-Get Tenant ID, Domain Name & billing subscription ID and open ICM for Product team

#### Verifying existence of a deployment

Use this query in Jarvis:


```
    https://portal.microsoftgeneva.com/s/956D2BD2
```

From the above query, you can retrieve any MEDS deployment byáá

1.  Tenant IDá
2.  MEDS Domain Nameá
3.  Customer Subscription IDá

What you can learn from the entry if found:á

1.  Creation time of the deploymentá
2.  Regioná
3.  Deployment ID (Internal to MEDS. Not to be confused with Azure hosted service deployment ID)á
4.  Based on the timestamp given, the fact that that deployment existed at that given time/dayá

#### Identify MEDS deletion time

Use the following query to detect a domain teardown request. You may have to run this query multiple times to identify the date of deletion:á

Change "Scoping Condition" to dcaasarm-prod-su-1 if you are looking for an AAD DS deployment on ARM based vNetá

```
    https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-24&offsetUnit=Hours&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=OperationEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&conditions=[["operationName","%3D%3D","DomainTeardownRequest"],["domainName","contains","ukdemolab.com"],["contextId","%3D%3D","2c1bfdc8-edc8-41c7-9adb-d33d6c0a3ad0"]]&aggregates=["Count%20by%20env_cloud_deploymentUnit"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""],["Count%20by%20durationMs58","groupby%20env_time.roundDown(\"PT1M\")%20as%20X%20,%20durationMs%20where%20durationMs%20%3D%3D%2085678%20||%20durationMs%20%3D%3D%2057568%20||%20durationMs%20%3D%3D%2078032%20||%20durationMs%20%3D%3D%20165442%20||%20durationMs%20%3D%3D%20254409%20||%20durationMs%20%3D%3D%20224171%20||%20durationMs%20%3D%3D%20301618%20||%20durationMs%20%3D%3D%20359704%20||%20durationMs%20%3D%3D%2042630%20||%20durationMs%20%3D%3D%20403617%20let%20Count%20%3D%20Count()"]]%20
```

á

In the query, you may present one or both of the following (If you have only one remove the other parameter before searching)á

  - ContextID is the Entra tenant IDá
  - domainName is the MEDS domain name.áá

To get details on what happened to the deletion request, and how it was handled and the result,á

1.  Copy the "**activityId**" from the resulting dataá

2.  Use the query as below with activityID replaced from above for the timestamp + or - 1 hour of the DomainTearDownRequest event. (Change "Scoping Condition" to dcaasarm-prod-su-1 if you are looking for an AAD DS deployment on ARM based vNet)
    
    ```
        https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=~1&offsetUnit=Hours&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=OperationEvent,TraceEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&conditions=[["activityId","%3D%3D","6a8f6c16-81e3-43e4-899a-8613748b01d1"]]&clientQuery=orderby%20env_time%20asc&aggregates=["Count%20by%20env_cloud_deploymentUnit"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""],["Count%20by%20durationMs58","groupby%20env_time.roundDown(\"PT1M\")%20as%20X%20,%20durationMs%20where%20durationMs%20%3D%3D%2085678%20||%20durationMs%20%3D%3D%2057568%20||%20durationMs%20%3D%3D%2078032%20||%20durationMs%20%3D%3D%20165442%20||%20durationMs%20%3D%3D%20254409%20||%20durationMs%20%3D%3D%20224171%20||%20durationMs%20%3D%3D%20301618%20||%20durationMs%20%3D%3D%20359704%20||%20durationMs%20%3D%3D%2042630%20||%20durationMs%20%3D%3D%20403617%20let%20Count%20%3D%20Count()"]]%20
    ```


#### Identifying creation and deletion times

These Jarvis examples can be used to determine who created or deleted and MEDS instance, along with the IP address of the actor.

https://jarvis-west.dc.ad.msft.net/F8CB1232

https://jarvis-west.dc.ad.msft.net/6C638351

You must supply **tenantID** and approximate time stamp.

### Configuration issues

#### Troubleshooting Domain Join

These two sections cover the bulk of issues encountered when performing a domain join to AADDS. Before continuing make sure you have a good understating of the domain join process outlined here: [Join and Authentication Issues](https://technet.microsoft.com/en-us/library/cc961817.aspx)

##### Connectivity issues for Domain Join

If the virtual machine is unable to find the domain, refer to the following troubleshooting steps:

1.  Ensure that the virtual machine is connected to the same virtual network as that you've enabled Domain Services in. If not, the virtual machine is unable to connect to the domain and therefore is unable to join the domain.
2.  If the virtual machine is connected to another virtual network, ensure that this virtual network is connected to the virtual network in which you've enabled Domain Services.
3.  Try to ping the domain using the domain name of the managed domain (for example, 'ping contoso100.com'). If you're unable to do so, try to ping the IP addresses for the domain displayed on the page where you enabled Azure AD Domain Services (for example, 'ping 10.0.0.4'). If you're able to ping the IP address but not the domain, DNS may be incorrectly configured. You may not have configured the IP addresses of the domain as DNS servers for the virtual network.
4.  Try flushing the DNS resolver cache on the virtual machine ('ipconfig /flushdns').

If you get to the dialog box that asks for credentials to join the domain, you do not have connectivity issues.

##### Credentials-related issues during Domain Join

Refer to the following steps if you're having trouble with credentials and are unable to join the domain.

1.  Try using the UPN format to specify credentials. The SAMAccountName for your account may be auto-generated if there are multiple users with the same UPN prefix in your tenant or if your UPN prefix is overly long. Therefore, the SAMAccountName format for your account may be different from what you expect or use in your on-premises domain.
2.  Try to use the credentials of a user account that belongs to the 'AAD DC Administrators' group to join machines to the managed domain.
3.  Ensure that you have [enabled password synchronization](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync) in accordance with the steps outlined in the [Getting started section](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started).
4.  Ensure that you use the UPN of the user as configured in Azure AD (for example, 'bob@domainservicespreview.onmicrosoft.com') to sign in.
5.  Ensure that you have waited long enough for password synchronization to complete as specified in the Getting Started guide.

#### Secure LDAP (LDAPS) configuration

  - **Azure portal (Preview)**:á[\[3\]](https://github.com/MicrosoftDocs/azure-docs/blob/master/articles/active-directory-domain-services/active-directory-ds-admin-guide-configure-secure-ldap-enable-ldaps.md)[Enable secure LDAP using the Azure portal](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-admin-guide-configure-secure-ldap)

  
If you have trouble connecting to the managed domain using secure LDAP, perform the following troubleshooting steps:

1.  Ensure that the issuer chain of the secure LDAP certificate is trusted on the client. You may choose to add the Root certification authority to the trusted root certificate store on the client to establish the trust.
2.  Verify that the LDAP client (for example, ldp.exe) connects to the secure LDAP endpoint using a DNS name, not the IP address.
3.  Verify the DNS name the LDAP client connects to resolves to the public IP address for secure LDAP on the managed domain.
4.  Verify that the secure LDAP certificate is not issued by an intermediate certificate authority that is not trusted by default on a fresh windows machine.
5.  Verify the secure LDAP certificate for your managed domain has the DNS name in the Subject or the Subject Alternative Names attribute.
6.  If connection to LDAPS is happening from the internet (outside of the vNet), ensure your NSG settings allow the traffic to port 636 from the internet

Please verify, and if you still have trouble, please create an IcM against Microsoft Entra Domain Services, Team: [NOT ENTRA ID] Triage. Include the following:

  - A screenshot of ldp.exe making the connection and failing.
  - Your Entra tenant ID, and the DNS domain name of your managed domain.
  - Exact user name that you are trying to bind as.

#### Network Security Group (NSG) configuration

Many times, customers create a Network Security Group that blocks ports AAD-DS needs to service their managed domain. This can cause issues such as sync not completing, users not able to sign-in, domain-join issues, and LDAPs connectivity issues.

How to check the NSG:

1.  Have the customer check their health page to see if the have the alert AADDS001. This will confirm that an NSG is blocking access.
2.  You can view the customer's NSG by going to Azure Support Center \> Resource Explorer \> Resource Providers \> Microsoft.Network \> networkSecurityGroups.
3.  Review the NSG networking requirements at [https://aka.ms/aadds-networking](https://aka.ms) and ensure that their NSG meets networking requirements.
4.  Once NSG is fixed, the alert should disappear from the customer's health page in about 2 hours. This should ensure that the NSG is not blocking the ports required.

#### DNS configuration

Azure Classic portal: [\[4\]](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-update-dns)[Update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-update-dns)

Azure portal (preview): [\[5\]](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-dns)[update DNS settings for the Azure virtual network](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-dns)

#### SMB v1 is disabled in MEDS

The consensus from the feature team is that we will not support SMB v1.ááIf this is not acceptable to the customers, they need to escalate with business justification.áá

The Feature team will be able to temporarily enable SMB v1 for a short period of time until the customer can upgrade their infrastructure. For this workaround, please open an ICM againstáá

**Service**: Microsoft Entra Domain Services

**Team**: [NOT ENTRA ID] Triage

**Title**: Please enable SMB v1 for \<customer name\>á

Data in the IcM must containáá

1.  The Entra Tenant ID where MEDS is enabledá
2.  The MEDS domain nameá

### Login issues

If customer has issues logging in, it may be because

  - The account has not synced into MEDS yet.
  - MEDS does not have the password hashes to be able to login the user
  - The account has been locked out

For debugging, follow the order as below.

**The account has been locked out:**

As of May 2018, 5 bad password attempts on an account within 2 minutes will lockout an account for 30 minutes. There is no way for customer to unlock account without waiting for 5 minutes.

1. Utilize [TSG Azure AD Domain Services Account Lockout Troubleshooting](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/343034/Azure-AD-Domain-Services-Account-Lockout-Troubleshooting)
#### Credential Issues:

Troubleshooting credential issues can be dependent on whether the account is managed or federated. Problems with credentials can also prevent domain join. Refer to the following sections to investigate credential issues.

##### The AAD Tenant is too large, and takes a long time to sync data to MEDS

Depending on the size of your directory, it may take a while for user accounts and credential hashes to be available in Microsoft Entra Domain Services. Ensure you wait long enough before retrying authentication (depending on the size of your directory - a few hours to a day or two for large directories). Currently, we have known issues around synchronizing large tenants, where number of users and groups are \>15K each (not necessarily, it is a figurative number). If all the below steps are handled, please contact engineering team with information about the size (in terms of users and groups) in your query.

##### Investigate Cloud-only Entra ID tenant User issue

á

  - Have you changed password for this account after enabling AD Domain Services? (if you disable MEDS and reenable MEDS you must change password again after enabling MEDS.)á
      - No:á
          - Please change the password for this account wait for 15 min. and try to login using this account. Requirement for changing password is discussed in <https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync-synced-tenant>á
      - Yes:áá
          - Try to sign in using the UPN format (for example, 'joeuser@contoso.com') instead of the SAMAccountName format ('CONTOSO\\joeuser'). The SAMAccountName may be automatically generated for users whose UPN prefix is overly long or is the same as another user on the managed domain. The UPN format is guaranteed to be unique within an Azure AD tenant.á

If you still see issuesá- CSS-Get Tenant ID, Domain Name, user name and open an ICM.

##### Investigate Synced Entra ID tenant User issue

Depending on the size of your directory, it may take a while for user accounts and credential hashes to be available in Microsoft Entra Domain Services. Ensure you wait long enough before retrying authentication (depending on the size of your directory - a few hours to a day or two for large directories).á

  - Have you deployed or updated to the latest recommended release of Azure AD Connect. [\[6\]](https://www.microsoft.com/en-us/download/details.aspx?id=47594)<https://www.microsoft.com/en-us/download/details.aspx?id=47594>á
  - Have you configured Azure AD Connect to perform a full synchronization after enabling AADDS (if you disable AADDS and reenable AADDS you have to follow these steps again)á [\[7\]](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync)<https://docs.microsoft.com/en-us/azure/active-directory-domain-services/active-directory-ds-getting-started-password-sync>á If the issue persists after verifying the preceding steps, try restarting the Microsoft Azure AD Sync Service. From your sync machine, launch a command prompt and execute the following commands:á

<!-- end list -->

  - net stop 'Microsoft Azure AD Sync'á
  - net start 'Microsoft Azure AD Sync'á

If you still see issueá - CSS-Get Tenant ID, Domain Name, user name and open ICM.

#### The user account is an External User to the AAD tenant

Microsoft Entra Domain Services does not have credentials for such user accounts, these users cannot sign in to the managed domain. This is not supported scenario.áááá



#### SamAccountNames with random GUIDs appended ###

The SamAccountName for synced users in AADDS is based on the MailNickname property in AAD. 
The SamAccountName has a maximum length of 20 characters and must be unique in AD.

These two requirements for every user in AD results in the need to change the MailNickname to meet the requirements and write to AD, as the MailNickname does not need to be unique in Entra and can also be longer than 16 characters.

When a user's SamAccountName encounters this, the sync agent will add an 11 character suffix at the end in the format of: " (XXXXXXX)"

A common cause of this is a guest user account with the same MailNickname in the customer's tenant.

Example:<br>
DistinguishedName = CN=John Doe (0eFEDF225), OU=AADDC Users, DC=domain, DC=com

This is by design to keep these two users from Entra unique in MEDS.  This issue will only affect customers if they are trying to sign in with DOMAIN\username format.  It will not affect them if they use the recommended UPN login format username@domain.com as mentioned in our public docs [Azure AD to Azure AD Domain Services attribute mapping](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/synchronization#attribute-synchronization-and-mapping-to-azure-ad-ds)


#####Investigation
1. Utilize Azure Support Center -> Resource Explorer -> Microsoft.AAD\DomainServices resource -> Diagnostics -> User Object Comparison in AAD and AADDS tool
2. Enter the user's Entra UPN in the User ID search
3. From results, review the AADDS User Object section, to confirmt he SamAccountName has random GUIDs.  Compare to the AAD User's MailNickName.

     ![image.png](/.attachments/image-afb14783-6d0f-46b1-8fc6-61b761969e18.png)

4. If there are random GUIDs appended to AAD DS User's SamAccountName then follow below resolution

#####Resolution
We will refer to the two users with conflicting SamAccountName as "User A" and "User B". Both users have a SamAccountName with a guid suffix appended at the end. Assume User A should have the original, unchanged SamAccountName without a suffix.
1. Find user's in Microsoft Enta ID with similar or identical MailNickNames using this Entra Powershell  example (https://learn.microsoft.com/en-us/powershell/module/microsoft.entra/get-entrauser?view=entra-powershell#example-5-get-a-user-by-mailnickname)
   
```powershell
Connect-Entra -Scopes 'User.ReadWrite.All', 'Directory.AccessAsUser.All'
get-entraUser -Filter "startsWith(mailnickname, 'admin')" -Property id,userprincipalname,displayname,mailnickname | select id,userprincipalname,displayname,mailnickname

```
   ![image.png](/.attachments/image-0783c0fb-b424-4bf6-804d-bf1b8c0f3ffe.png)

2.  From AAD DS Compare this to Microsoft Entra Domain Services user profile for these users using Windows AD PowerShell from MEDS management VM joined to AAD DS

        Get-ADUser -Filter 'SamAccountName -like "*admin*"' |  Select UserPrincipalName, SamAccountName, DistinguishedName | sort UserPrincipalName

       ![image.png](/.attachments/image-7bdb96aa-18cc-40e9-9e18-ec23b7502ce8.png)

1. Change both User A and User B's MailNicknames temporarily to a different value using MSGraph or Az Powershell.  Example:

```powershell
 Set-EntraUser -UserId db378915-6df8-428e-9617-de199292ab70 -MailNickName "tempAdmin1"
 Set-EntraUser -UserId 4a117924-6d76-4d94-8c58-c8d38d075b05 -MailNickName "tempAdmin2"
```


1. Ensure the beginning of the new MailNickname is different. Ex: "mySAM" -> "diffSAM" Whether the new temporary MailNickname conflicts with another or not does not matter.  If these are synched user's from on-prem the above should be performed in on-prem AD.
1. Wait for sync of both Users to complete to Microsoft Entra Domain Services, and verify with MEDS Managed VM RSAT tools -> AD Users and Computers -> User profile.  Or via Windows AD Power Shell cmds.



1. Change User A's MailNickname back to the original and allow this to sync to AAD -> AAD DS
```powershell
 Set-EntraUser -UserId db378915-6df8-428e-9617-de199292ab70 -MailNickName "admin"
```

1. Confirm in Microsoft Entra Domain Services that this user's MEDS SamAccountName is now properly after waiting 5-10 minuets for Entra to MEDS sync to complete

       Get-ADUser -Filter 'SamAccountName -like "*admin*"' |  Select UserPrincipalName, SamAccountName, DistinguishedName | sort UserPrincipalName

      ![image.png](/.attachments/image-c9748db0-4595-49a0-9605-561a354585e0.png)


8. In Summary, the random guid characters get added to MEDS user samAccountName in two different scenarios:
 
   1. The Entra ID user's mailNickName attribute is greater than 20 characters 
	
   2. At the time of the initial Entra to MEDS sync provisioning of MEDS user, there was another MEDS user with the same SamAccountName in MEDS

   For # 1, the fix is to shorten the MEDS user's mailNickName to < 20 characters
 
   For # 2, the fix is to identify the conflicting MEDS user object (by SamAccountName) or the conflicting Entra user (by mailNickName) and remove the conflict by either deleting or updating the Entra user's mailNickname and then allow MEDS to resync the users.  If no conflicting users are found, then potentially updating the Entra ID user's mailNickname to something temporary, waiting 5-10 minutes for that to sync to MEDS and then updating the Entra ID user's mailNickName back to the original name and allowing that to sync to Entra  Domain Services will fix the issue. 


### Billing Inquiries

This section will cover billing scenarios such as customer queries about being billed after a service is disabled. It also covers how billing works.

#### Disabled but still being billed

If customer saying they are being billed when they donÆt have MEDS enabled then:

1.  Get billing subscription ID from customer (This is available in billing provided to customer)
2.  Ensure that the customer is logging into the correct Entra tenant that parents the subscription being billed, and he is able to manage the Subscription that is being billed from Azure portal
3.  Get tenant ID from ACIS using billing subscription id Use ACIS to find if there is MEDS enabled for it
    1.  Extension: AD Fabric - DCAAS
    2.  Endpointá: DCAAS - PROD (For classic vNets) / DCAAS ARM - PROD (For ARM vNets)
    3.  Operation Group: TenantOperations
    4.  Operation: GetActiveTenants
    5.  BillingSubscriptionId: \< billing subscription ID from customer\>
        <div class="thumb tnone">
        <div class="thumbinner" style="width:712px;">
        <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d1733338-f2f9-d3f3-5102-54a545dfbe48710px-AcisCapture.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/d1733338-f2f9-d3f3-5102-54a545dfbe48710px-AcisCapture.jpg" width="710" height="471" class="thumbimage" srcset="/images/thumb/1/13/AcisCapture.jpg/1065px-AcisCapture.jpg 1.5x, /images/1/13/AcisCapture.jpg 2x"></a><br/>
        <div class="thumbcaption">
        <div class="magnify">
        
        </div>
        ACIS for ARM vNets
        </div>
        </div>
        </div>
        <div class="thumb tnone">
        <div class="thumbinner" style="width:591px;">
        <br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/609aaa74-7ea2-488b-27bd-5d098eefe80d589px-AADDS_disabled.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="AADDS disabled.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/609aaa74-7ea2-488b-27bd-5d098eefe80d589px-AADDS_disabled.png" width="589" height="447" class="thumbimage" srcset="/images/thumb/7/71/AADDS_disabled.png/884px-AADDS_disabled.png 1.5x, /images/thumb/7/71/AADDS_disabled.png/1178px-AADDS_disabled.png 2x"></a><br/>
        <div class="thumbcaption">
        <div class="magnify">
        
        </div>
        </div>
        </div>
        </div>
4.  If you find Active Tenant, provide that information to customer using the following guidance: You need to login to Azure portal as an admin of that subscription to be able to see and disable MEDS. If customer are the admin for the subscription, and cannot access the subscription because the subscription has expired, we can delete it from the backend. CSS- Get Tenant ID, Domain Name & billing subscription ID and open ICM for Product team
    1.  If customer can't login as the subscription admin, he has to let us delete his deployment. CSS open incident to disable MEDS.
        
<div class="thumb tnone">
            
<div class="thumbinner" style="width:610px;">
            
<br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/6c7ee64d-9235-d75e-a58b-82ad9e53fd6b608px-ARM_vNEt_Delete_Domain.jpg&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/6c7ee64d-9235-d75e-a58b-82ad9e53fd6b608px-ARM_vNEt_Delete_Domain.jpg" width="608" height="368" class="thumbimage" srcset="/images/thumb/d/d3/ARM_vNEt_Delete_Domain.jpg/912px-ARM_vNEt_Delete_Domain.jpg 1.5x, /images/d/d3/ARM_vNEt_Delete_Domain.jpg 2x"></a><br/>
            
<div class="thumbcaption">
            
<div class="magnify">
            
            
            
</div>
            
ARM vNet Delete Domain
            
</div>
            
</div>
            
</div>
            
<div class="thumb tnone">
            
<div class="thumbinner" style="width:602px;">
            
<br/><a href="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/e5f50aff-8449-50f6-5bd2-ed619ebaa3a3600px-BillingIssuesAADDS02.png&download=false&resolveLfs=true&%24format=octetStream&api-version=5.0-preview.1" class="image"><img alt="BillingIssuesAADDS02.png" src="https://supportability.visualstudio.com/f3a37cb5-3492-4581-8dbd-f3381f2b1736/_apis/git/repositories/5888ffad-f6e1-45e9-8a4d-43716fe1a833/Items?path=%2FAzureAD/.attachments/e5f50aff-8449-50f6-5bd2-ed619ebaa3a3600px-BillingIssuesAADDS02.png" width="600" height="353" class="thumbimage" srcset="/images/9/94/BillingIssuesAADDS02.png 1.5x"></a><br/>
            
<div class="thumbcaption">
            
<div class="magnify">
            
            
            
</div>
            
</div>
            
</div>
            
</div> 

5.  Other helpful things to do that were discussed earlier are:

6.  Determine when the the deployment was created by following [Verifying existence of a deployment](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183952#Verifying_existence_of_a_deployment)
7.  Determine when the deployment was deleted by following [Identify AADDS deletion time.](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183952#Identify_AADDS_deletion_time)

#### How billing works

MEDS is billed against the subscription that the vNet belongs to.á

It is possible for users to login to a subscription that they are co-admins of, and create their own Entra tenants and enable MEDS on a vNet that belongs in that subscription for an Entra instance that no-one else has access to.áá

In that case, the bill will still be made against the subscription although none of the other co-admins have a view of the Entra tenant (and hence the fact that MEDS is enabled on it)

### Basics of MEDS logging

You should know TenantId, DomainName for case you are investigating.á

#### Finding operationEvent logs

```
    https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=OperationEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&serverQuery=&aggregatesVisible=true&aggregates=["Count%20by%20contextId","Count%20by%20domainName","Count%20by%20resultType","Count%20by%20operationName"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""]]%20
```

Select appropriate time rangeáá

Change "Scoping Conditions" to dcaasarm-prod-su-1 for deployment of MEDS on ARM based vNet.

Use appropriate filtering conditions as below:

where domainName == "\<domainName"á

where operationName == "\<OperationName\>"á

where contextId == "\<TenantID\>"

### Getting details of specific operations

Get activityId from operation event and search traceEvent logs using link below. (replace activityId)

```
    https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-1&offsetUnit=Days&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=TraceEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&serverQuery=where%20activityId%20%3D%3D%20"42fa862e-0a25-4085-b6bd-757e2570fdda"&aggregatesVisible=true&aggregates=["Count%20by%20contextId","Count%20by%20domainName","Count%20by%20resultType","Count%20by%20operationName"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""]]%20
```

Change "Scoping Conditions" to dcaasarm-prod-su-1 for deployment of AAD DS on ARM based vNet.á

where domainName == "contoso.com"á

where contextId == "f2824985-415a-4557-853-339fe1d9db96"á

where operationName == "DomainCreateRequest"á

á=== HowTo Steps ===

#### Azure Deployment ID -\> MEDS Deployment and vice versa

##### If you have the Azure Deployment ID and want to get to the MEDS deployment, use the following query.

```
    https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-3&offsetUnit=Hours&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=OperationEvent,TraceEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&conditions=[["message","contains","b16bb716beb74760bbd049ced50e97b4"]]&clientQuery=groupby%20contextId,%20domainName,%20env_cloud_location,%20hostSubscriptionId&aggregates=["Count%20by%20env_cloud_deploymentUnit"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""],["Count%20by%20durationMs58","groupby%20env_time.roundDown(\"PT1M\")%20as%20X%20,%20durationMs%20where%20durationMs%20%3D%3D%2085678%20||%20durationMs%20%3D%3D%2057568%20||%20durationMs%20%3D%3D%2078032%20||%20durationMs%20%3D%3D%20165442%20||%20durationMs%20%3D%3D%20254409%20||%20durationMs%20%3D%3D%20224171%20||%20durationMs%20%3D%3D%20301618%20||%20durationMs%20%3D%3D%20359704%20||%20durationMs%20%3D%3D%2042630%20||%20durationMs%20%3D%3D%20403617%20let%20Count%20%3D%20Count()"]]%20á
```

á

  - Change "Scoping Conditions" to dcaasarm-prod-su-1 for deployment of AAD DS on ARM based vNet.á
  - Substitute the time stamp with a time when the deployment was actually active.á
  - Substitute "**b16bb716beb74760bbd049ced50e97b4**" with the deployment ID in question.á
  - This gives youáá
      - Entra Tenant Name as contextIdá
      - MEDS Domain Name as domainNameá
      - Azure subscription that is owned by MEDS (not customer subscription) as hostSubscriptionIdá

From the data above, you can get more details about this deployment by using instructions in this page: [Verifying existence of a deployment](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageId=183952#Verifying_existence_of_a_deployment)

##### If you have the MEDS Tenant ID, and want to get to the Azure IaaS Deployment ID:

```
    https://jarvis-west.dc.ad.msft.net/?page=logs&be=DGrep&offset=-3&offsetUnit=Hours&UTC=false&ep=Diagnostics%20PROD&ns=dcaasprod&en=OperationEvent,TraceEvent&scopingConditions=[["ScaleUnit","dcaas-prod-su-1"]]&conditions=[["message","contains","DomainTopologyEvaluator.GetAzureDeployment:%20Got:"],["contextId","contains","867ab3dc-0344-4a3c-a858-7ffbcdb6aedb"]]&aggregates=["Count%20by%20env_cloud_deploymentUnit"]&chartEditorVisible=true&chartType=Line&chartLayers=[["New%20Layer",""],["Count%20by%20durationMs58","groupby%20env_time.roundDown(\"PT1M\")%20as%20X%20,%20durationMs%20where%20durationMs%20%3D%3D%2085678%20||%20durationMs%20%3D%3D%2057568%20||%20durationMs%20%3D%3D%2078032%20||%20durationMs%20%3D%3D%20165442%20||%20durationMs%20%3D%3D%20254409%20||%20durationMs%20%3D%3D%20224171%20||%20durationMs%20%3D%3D%20301618%20||%20durationMs%20%3D%3D%20359704%20||%20durationMs%20%3D%3D%2042630%20||%20durationMs%20%3D%3D%20403617%20let%20Count%20%3D%20Count()"]]%20
```

  - Change "Scoping Conditions" to dcaasarm-prod-su-1 for deployment of MEDS on ARM based vNet.á
  - Substitute the timestamp with a time when the deployment was actually active.á
  - Substitute **867ab3dc-0344-4a3c-a858-7ffbcdb6aedb** part with the AAD Tenant ID in question.á
  - In the result, the "message" column has the deployment details, including PrivateID

### Troubleshooting Alerts

#### Check what alerts the customer has:

1.ááááááUse <https://jarvis-west.dc.ad.msft.net/C0FFBC73> to double check if they have any active alerts by searching using their tenantID

2.ááááááUsing the table in the "What's New" section, match up the alert with the ôinvalidReasonö column. Click on the resolution link.

3.ááááááWalk the customers through the steps or send the link to the customer.

# Supportability Documentation

### ICMs and Escalations

#### Support Engineers
Support engineers should always follow https://aka.ms/cssidentityicm (https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/589927/2-ICM-Submission) to file an ICM for TA review\approval.  Using Azure Support Center and choose DCaaS ICM template.

#### Technical Advisors
Technical Advisors should review ICM quality and necessary data to triage to engineering as mentioned below.  Once approved the Microsoft Entra Domain Services ICM queue is [Microsoft Entra Domain Services/[NOT ENTRA ID] Triage](https://portal.microsofticm.com/imp/v3/incidents/search/advanced?serviceCategories=4&services=10142&teams=11608)

For engineering to debug this, here is the information we should supply:

**Common to all:**

|                                                        |
| ------------------------------------------------------ |
| Exact error message or behavior                        |
| What behavior is the customer expecting?               |
| Tenant GUID for the customer                           |
| Exact Repro steps                                      |
| UPN of user who is experiencing the issue              |
| When did it happen? Exact Time and Date and Time zone. |

**If this is an authentication issue:**

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<tbody>
<tr class="odd">
<td style="vertical-align:top">UPN of user who is experiencing the issueá(one example)</td>
</tr>
<tr class="even">
<td style="vertical-align:top">Is the user object created in AAD as a result of AAD Sync?á
<p>If yes, was a full sync done on AAD Connect? If so, when (in UTC)?</p>
<p>If no, was the userÆs password changed? If so, when (in UTC)?</p></td>
</tr>
</tbody>
</table>

**If this is an user object attribute mismatching expectations:**

|                                                                                    |
| ---------------------------------------------------------------------------------- |
| UPN of user who is experiencing the issueá(one example)                            |
| Is the user object created in Entra as a result of Entra Sync?                         |
| Dump of the user object on Entra from Get-MGUser                                |
| Dump of the user object on MEDS from ldp, for example showing all the attributes |

**If this is about changes that are done in Entra, but not available in MEDS:**

<div>

Example of a change that was done in Entra, with the object dumped using graph PowerShell command, and changes highlighted, the timestamp of the change (in UTC)

</div>

## Pull logs from Kusto and Jarvis


https://teams.microsoft.com/l/entity/com.microsoft.teamspace.tab.wiki/tab::06875bfc-2442-45b8-9157-c37ec44723ef?context=%7B%22subEntityId%22%3A%22%7B%5C%22pageId%5C%22%3A2%2C%5C%22sectionId%5C%22%3A14%2C%5C%22origin%5C%22%3A2%7D%22%2C%22channelId%22%3A%2219%3A4af5b0bef0744592a0d4258a9aff9295%40thread.skype%22%7D&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47

# Training

## AD Training and backgrounder

It helps to have a basic understanding of how an Active Directory Domain functions. Here is a link to the on-prem world of AD training that can help you understand how this is supposed to work.

http://aka.ms/dstechnicalfoundation

### Custom Attributes Sync Training

**Title**: Custom Attributes Sync

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 27 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c), and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Tool Availability**: March 15, 2023

**Training Completion**: March 15, 2023

**Region**: All regions

**Course Location**: [QA](https://aka.ms/AAjyfy1)

**Note**: To access the course, click **Login with your company account** and type `Microsoft` in the *Company Subdomain* field, then click **Continue**.

### Deep Dive: 07244 - Microsoft Entra Domain Services Summer Feature Updates

**Title**: Deep Dive: 07244 - Microsoft Entra Domain Services Summer Feature Updates

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 21 minutes

**Audience**: Cloud Identity Support Team [MSaaS AAD - Account Management Professional](https://msaas.support.microsoft.com/queue/ce0b7553-9d09-e711-8121-002dd815174c), [MSaaS AAD - Account Management Premier](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c), and [MSaaS AAD - Developer](https://msaas.support.microsoft.com/queue/5ba5f352-01bc-dd11-9c6c-02bf0afb1072)

**Tool Availability**: July 1, 2022

**Training Completion**: July 1, 2022

**Region**: All regions

**Course Location**: 

1. [Login](https://cloudacademy.com/login/) to Cloud Academy (now QA) and click **Log in to your company workspace**.
2. In the *Company subdomain* field, type `microsoft`, then click **Continue**.
3. Launch the [Deep Dive: 07244 - Azure AD Domain Services Summer Feature Updates](https://aka.ms/AAhdxc1) course.

## General questions

**Is it possible to restore a managed domain instance from deletion?**:

No, When the instance is deleted all data is destroyed and the resources deprovissioned. This is an unsupported request, this is documented in: https://docs.microsoft.com/en-us/azure/active-directory-domain-services/delete-aadds

![image.png](/.attachments/image-18916803-5b07-45e3-a4c0-8c19d65e6dbf.png)

**Can the necessary NSG rules be manually created?**:

No, there is no reason to modify the default NSG rules created during deployment. Furthermore, if modified the change cannot be rolled back from the portal. (This is because the service tag CorpNetSaw is internal and not visible from the customer facing portal.)  This means that the customer cannot manually create or modify an existing NSG to be used as default for AADDS. Our documentation states that this can be achieved via PowerShell but there is no command available as of now to set the sourcetype "ServiceTag" when creating the rule. This is being addressed and corrections will be made when the command becomes available.

As per PG, the following little script can be used to recreate the CorpNetSaw service tag:
```
$nsgName = "<enterNSGname>"
$rgName = "<enterResourceGroupname>"
$ruleName = "AllowRD"
$serviceTagName = "CorpNetSaw"

Get-AzNetworkSecurityGroup `
-Name $nsgName `
-ResourceGroupName $rgName |
    Add-AzNetworkSecurityRuleConfig `
    -Name $ruleName `
    -Access Allow `
    -Protocol Tcp `
    -Direction Inbound `
    -Priority 201 `
    -SourceAddressPrefix $serviceTagName `
    -SourcePortRange * `
    -DestinationAddressPrefix * `
    -DestinationPortRange 3389 |
        Set-AzNetworkSecurityGroup
```
Or the whole NSG can be manually reconfigured as follows:

1. Have the customer navigate to the NSG in the portal.
2. Dissociate the NSG from the Vnet/Subnet.
3. Navigate to the MEDS overview, in the "Protect your managed domain using a network security group." section click "Configure". this will create a new NSG with the necessary default values.

Documentation on this can be found here: https://docs.microsoft.com/en-us/azure/active-directory-domain-services/network-considerations

<br><Br><br><br><br><br><Br><br><br><br><Br><br><br><br>
# Support Boundaries & Content

Please review [public documentation on the differences between Azure AD, Azure AD Domain Services, and Windows AD](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/compare-identity-solutions)  a quick summary of the different domain join types and who supports each:

|**Scenario & Public docs**|**Support Path**|**Vertical**
|--|--|--|
| [Azure AD Domain Services Domain Join](https://docs.microsoft.com/en-us/azure/active-directory-domain-services/join-windows-vm) | Azure\Azure Active Directory Domain Services (VM û Domain Controllers)\Azure AD Domain Services\User sign-in-domain join issues | [MSaaS AAD - Account Management](https://msaas.support.microsoft.com/queue/6014a8ba-465c-e711-8129-001dd8b72a0c)
|[Azure AD Device Join](https://docs.microsoft.com/en-us/azure/active-directory/user-help/user-help-join-device-on-network)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Azure AD join| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)
|[Hybrid Azure AD Device Join](https://docs.microsoft.com/en-us/azure/active-directory/devices/concept-azure-ad-join-hybrid)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Hybrid Azure AD join| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)
| [Azure AD Device Registration](https://docs.microsoft.com/en-us/azure/active-directory/user-help/user-help-register-device-on-network)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Device administration| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)
| [Windows Active Directory Domain Join](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/join-a-computer-to-a-domain) | Windows Servers\Windows Server 2019\Windows Server 2019 Standard\Active Directory | [MSaaS Windows Directory Services Premier](https://msaas.support.microsoft.com/queue/4d4fcd74-2858-e711-812b-002dd8151746)



Microsoft Entra Domain Services support topics are not intended for general Windows AD questions, or for customers running their own Windows AD environment in their Azure Virtual Machines. Microsoft Entra Domain Services support topics are also not intended for customers using Azure AD Device join or Azure AD Hybrid Device Join features.

Before accepting support cases to Microsoft Entra Domain Services, verify the customer is running Microsoft Entra Domain Services, and not simply their own  customer-managed Windows AD on a Azure VM or asking questions about their own customer-managed Windows AD on-premises.

## Verify customer subscribes to Microsoft Entra Domain Services Managed Instance:
1. First verify you have one of the following pieces of information from the customer to verify Microsoft Entra Domain Services

        1. Entra tenant id or context id  (ex. 91ceb514-####-####-####-############)
        2. Azure Subscription ID (ex. ed6a63cc-####-####-####-############)
        3. Active Directory domain name (ex. domain.com)
        4. Microsoft Entra Domain Services resource URI: (ex. /subscriptions/f964a2e9-####-####-####-############/resourceGroups/AADDS/providers/Microsoft.AAD/domainServices/jfritts.us)

2. Next, verify this customer has Microsoft Entra Domain Services via running one of the following Jarvis queries (depending on what info you have)

     |**Scenario**|**Query**  |**Notes**  |
     |--|--|--|
     |Search for managed domain by Entra tenant ID | https://jarvis-west.dc.ad.msft.net/446B35D4 |Replace the context ID filter to match your customer's AAD tenant ID, and update time range to include current time.
     | Search for managed domain by customer Azure Subscription ID | https://jarvis-west.dc.ad.msft.net/89C7DF3 | Replace clientSubscriptionID filter to match your customer's Azure subscription ID, and update time range to include current time. 
     | Search for managed domain by managed domain name | https://jarvis-west.dc.ad.msft.net/DB2B0759 | Replace the domainName filter to match the domain name provided by customer, and update time range to include current time. 

3. If you verify customer is running Microsoft Entra Domain Services or has questions around enabling Microsoft Entra Domain Services, proceed with support case.
4. Lastly if the customer does not have an Microsoft Entra Domain Servicess managed domain, determine which of the following scenarios the customer is asking about and route the case\collab to the appropriate support path:
     

|**Scenario & Public docs**|**Support Path**|**Vertical**
|--|--|--|
| [Windows Active Directory Domain Join](https://docs.microsoft.com/en-us/windows-server/identity/ad-fs/deployment/join-a-computer-to-a-domain) | Windows Servers\Windows Server 2019\Windows Server 2019 Standard\Active Directory | [MSaaS Windows Directory Services Premier](https://msaas.support.microsoft.com/queue/4d4fcd74-2858-e711-812b-002dd8151746)
|[Azure AD Device Join](https://docs.microsoft.com/en-us/azure/active-directory/user-help/user-help-join-device-on-network)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Azure AD join| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)
|[Hybrid Azure AD Device Join](https://docs.microsoft.com/en-us/azure/active-directory/devices/concept-azure-ad-join-hybrid)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Hybrid Azure AD join| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)
| [Azure AD Device Registration](https://docs.microsoft.com/en-us/azure/active-directory/user-help/user-help-register-device-on-network)|Azure\Azure Active Directory Directories, Domains, and Objects\Devices\Device administration| [MSaaS AAD - Authentication](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)


