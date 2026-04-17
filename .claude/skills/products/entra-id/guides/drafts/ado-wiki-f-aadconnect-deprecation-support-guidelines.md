---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/Connect Sync/Wizard and ADSync service/Support Guidelines for AADConnect Deprecation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FConnect%20Sync%2FWizard%20and%20ADSync%20service%2FSupport%20Guidelines%20for%20AADConnect%20Deprecation"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Synchronization
- cw.AAD-Sync
- cw.AAD-Connect
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Synchronization](/Tags/AAD%2DSynchronization) [AAD-Sync](/Tags/AAD%2DSync) [AAD-Connect](/Tags/AAD%2DConnect)                        


[[_TOC_]]


# Support guidelines for Azure AD Connect deprecation

This article is intended to help support engineers handle customers with questions regarding deprecation of Azure AD Connect as well as providing guidance in requests of pro-active continuous support throughout the upgrade process (AKA, _"hand holding"_).
This article will also cover the available upgrade methods including important considerations to keep in mind regarding each of these methods.

<br>

# Deprecation of Azure AD Connect versions

Every Microsoft developed product and / or service, constantly undergoes software changes and updates to improve or introduce functionalities, improve usability and security or simply to fix bugs. Azure AD Connect is, of course, no exception.
With Azure AD Connect however, we also need to take in consideration its many dependencies such as SQL, network connectivity, authentication libraries, PowerShell versions and modules, etc. If one of the dependencies is deprecated, any Azure AD Connect versions that rely on those deprecated dependencies need to be deprecated as well.
It's always a recommended best practice to keep any system or application, such as Azure AD Connect, updated with the latest versions. But some customers may need some time in planning and testing before they can upgrade due to the complex nature of their environments. It's important that we understand why the deprecation is happening and if the reason is tied to a deprecation of a dependency, in which case there is indeed a potential for service impact that we should be prepared to inform customers about.

In September 2021, Microsoft issued a public statement as well as e-mail communications to customer tenant's technical contacts, informing about [Upgrade to the latest version of Azure AD Connect before 31 August 2022](https://azure.microsoft.com/en-us/updates/action-required-upgrade-to-the-latest-version-of-azure-ad-connect-before-31-august-2022/). Customers are advised to upgrade to a newest build of Azure AD Connect version 2.x, which contains various changes to the dependencies used, as we can find in [AADConnect V2.0 Intro public documentation](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/whatis-azure-ad-connect-v2).
As documented, Azure AD Connect V2.0 updates the following dependencies which are about to get deprecated or have been already deprecated:

* **SQL Server 2019 LocalDB**: Azure AD Connect V1.x shipped with SQL Server 2012 LocalDB. This version of SQL Server went out of extended support in July 2022, so Azure AD Connect V2 has been updated with SQL Server 2019 LocalDB.

* **MSAL Authentication Library**: Azure AD Connect V2.x has been updated with MSAL authentication library replacing ADAL authentication library from Azure AD Connect V1.x since ADAL will be deprecated in December 2022. Per public documentation in [Migrate to the Microsoft Authentication Library (MSAL)](https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-migration). applications using ADAL will continue to work after December 31st 2022, although there's an associated risk due to the lack of security fixes after end of support.

* **TLS 1.2**: TLS 1.0 and TLS 1.1 are being deprecated by Microsoft since these are considered unsafe protocols. Azure AD Connect V2.0 only supports TLS 1.2. We've released public documentation with guidance on how to [enforce TLS 1.2 in Azure AD Connect](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-tls-enforcement).

<br>

## Will Azure AD Connect v1.x stop working after the deprecation date?

As of today, the deprecation of Azure AD Connect v1.x scheduled for 31 August 2022, doesn't necessarily mean that customers still using this version after the deprecation date, will see synchronization stop working or break. However, as explained above, some dependencies are being deprecated, which leads to older Azure AD Connect versions being deprecated. 

Deprecation of SQL Server 2012 LocalDB, should not cause any issues for customers using older versions of Azure AD Connect beyond deprecation date. However, if a customer reports an issue related with SQL, it's out of support since the SQL team ended extended support and customer will have to upgrade to Azure AD Connect v2. Customers using full SQL server are also affected by SQL LocalDB deprecation because Azure AD Connect v1 is using a deprecated SQL Client.

On the other hand, once ADAL Authentication Library gets deprecated in December 2022, older Azure AD connect v1.x versions will be unable to authenticate against Azure AD, meaning **synchronization with Azure AD will stop working**.

Regarding TLS 1.0 and TLS 1.1 deprecation, all versions of Windows Server that are supported for Azure AD Connect v2 already default to TLS 1.2 or can be enabled manually via registry or PowerShell (see [Azure AD Connect: TLS 1.2 enforcement for Azure Active Directory Connect](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-tls-enforcement). If the Windows server doesn't support TLS 1.2, then it's most likely a very old and deprecated Windows Server version. Some Azure endpoints are already blocking TLS 1.0 and TLS 1.1 traffic and over time Microsoft will continue to deprecate these protocols for all cloud services to a point where **synchronization will stop working if not using TLS 1.2**.

<br>

## Support case handling - Please read

We see a few cases where customers are trying to upgrade Azure AD Connect and are facing an issue that requires support engagement for troubleshooting and analysis. These are **reactive cases** that Support must prioritize, especially if synchronization is blocked. However, there's more cases where customers just need help hand-holding the upgrade process, raising **advisory cases** with questions that might already be answered in our documentation, hence our Support teams are not the right resource, and this practice might cause a significant exhaustion of our capacity to support all customers. In such cases, the support engineer should instead reach out to the Customer's IM and CSAM asking to engage a customer engineer / customer success engineer (aka PFE) to proactively help the customer plan Azure AD Connect v2 upgrade. 

</br>

## Deprecation exemption requests

Microsoft Support doesn't provide deprecation exceptions to customers running Azure AD Connect v1.x. Customers worldwide have been notified of Azure AD Connect v1.x. deprecation since September 2021 which we considered to give enough time to plan the upgrade. Furthermore, as explained above, the deprecation of Azure AD Connect v1.x is a consequence of other product dependencies that have been or are about to be deprecated which Azure AD Connect team does not control. In such requests, Customer, Support and Engineering should rather concentrate on how to remove any blockers for Azure AD Connect upgrade as soon as possible.

<br>

# Upgrade Methods

In-place upgrade of an old Azure AD Connect v1 version is a no-go because it's too risky and you can't revert back the configuration in case something goes wrong. Use this method as a last resort and only if Customer has a working backup at server level (e.g. full VM backup) which can be easily used to restore the whole server to the last working state. Additionally, in-place upgrade of the Windows Server OS running Azure AD Connect, is not supported and will break ADSync service.

The preferred method for upgrading Azure AD Connect is to use a [swing migration](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-upgrade-previous-version#swing-migration) approach where you keep the original server and you copy the configuration to a new server. You should keep a the new server in stating mode until you have validated the pending exports. To check for pending exports, go to **Connectors** tab in **Synchronization Service Manager**, right-click the Azure AD Connector and select **Search Connector Space...**, then under **Scope** select **Pending Export**, enable **Add/Modify/Delete** and **Search**. Alternatively, you can also use the method described under [Verify](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-sync-staging-server#verify) results (i.e. using csanalyzer tool). Checking pending exports is a very important step to prevent irreversible changes to Azure AD objects due to incorrect configuration settings (e.g. mass deletion of user/group/contact objects).

In order to migrate settings to the new Azure AD Connect server you can use one of the following methods:

* **Migrate/Export/Import configuration settings**: [How to import and export Azure AD Connect configuration settings](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-import-export-config)

* **Use existing database**: [Install Azure AD Connect by using an existing ADSync database](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-existing-database)

**Note:** These 2 methods are mutually exclusive.

We strongly discourage using AADConnectConfigDocumenter tool as way of comparing/copying configuration settings between servers, as this tool generates a very long and convoluted report due to the complexity of Azure AD Connect configuration.


<br>

# References

[What is Azure AD Connect v2.0?](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/whatis-azure-ad-connect-v2)

[Upgrade to the latest version of Azure AD Connect before 31 August 2022](https://azure.microsoft.com/en-us/updates/action-required-upgrade-to-the-latest-version-of-azure-ad-connect-before-31-august-2022/)

[Azure AD Connect: Upgrade from a previous version](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-upgrade-previous-version)

[Azure AD Connect: TLS 1.2 enforcement for Azure Active Directory Connect](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-tls-enforcement)

[Azure Active Directory Connect FAQ](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-faq)


<br>
