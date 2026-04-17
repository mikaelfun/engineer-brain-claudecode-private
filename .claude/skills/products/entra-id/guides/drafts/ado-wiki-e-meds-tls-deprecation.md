---
source: ado-wiki
sourceRef: "Supportability\AzureAD\AzureAD;C:\Program Files\Git\GeneralPages\AAD\AAD Account Management\Microsoft Entra Domain Services\TLS 1.0 1.1 Deprecation For Entra Domain Services"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/Microsoft%20Entra%20Domain%20Services/TLS%201.0%201.1%20Deprecation%20For%20Entra%20Domain%20Services"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.AADDS
- cw.TSG
- cw.TSG-AADDS
- cw.comm-orgmgt-tsg
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::

# Summary:

On November 10, of 2023, we announced that we will be deprecating TLS 1.0 / 1.1 in Azure Services. As part of this deprecation, TLS 1.0 / 1.1 for Azure Domain Services will be deprecated on August 31, 2025. Customers that have not disabled TLS 1.1 / 1.0 are being notified via email that this change will affect their tenants. See: [Iridias - Health advisories](https://iridias.microsoft.com/healthadvisories?id=5S_C-5QZ).

Customers should disable TLS 1.0 / 1.1 for Azure Domain Services prior to the deprecation date. See: [How to migrate to Transport Layer Security (TLS) 1.2 enforcement for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/reference-domain-services-tls-enforcement?tabs=portal) for details. 

# Extensions: 

There are currently approximately 13000 tenants with TLS 1.0/1.1 enabled. Of those approximately 667 have active applications that are using the legacy TLS protocol. Please use the following guidance for discussing extensions should a customer have a valid business impact:

## Extension Approval Process for S500 Customers with TLS 1.0 / 1.1 Enabled Tenants (Approximately 12 Tenants):

- Upon August 31 2025 Deadline: Do not automatically disable TLS 1.0 / 1.1
- Extensions Offered: S500 / Strategic customers were contacted via their CSAM/account teams and informed of the option to request an extension. 

**Note:** Do not use the terms S500 or Strategic to customers. This is not an offering and may confuse customers. 

- Extension duration: 90 days.
- Initiation: S500 customers raise extension requests through their CSAM/account team or via support ticket.
- Approval Workflow: Extension requests are reviewed by delegated approvers.
- Notification: Approved extensions are tracked, and customers are notified of their new deadlines.
- Assessment Criteria: Application logs are used to determine the number and criticality of applications still using legacy TLS. Customers with more critical dependencies may receive longer extensions, while those with minimal usage may receive shorter ones.
- Customer Instructions: Customers are provided with guidance on accessing logs to identify and remediate affected applications.
- Extensions of extensions: Case-by-case basis, likely to be approved. 

## Extension Approval Process for Customers with Active Applications (Approximately 667 Tenants)

- Upon August 31 2025 Deadline: Automatically disable TLS 1.0 / 1.1.
- Extensions Offered: We won?t invite customers to submit extension requests. 
- Extension duration: 90 days.
- Initiation: S500 customers raise extension requests through their CSAM/account team or via support ticket.
- Approval Workflow: Extension requests are reviewed by delegated approvers.
- Notification: Approved extensions are tracked, and customers are notified of their new deadlines.
- Assessment Criteria: Application logs are used to determine the number and criticality of applications still using legacy TLS. Customers with more critical dependencies may receive longer extensions, while those with minimal usage may receive shorter ones.
- Customer Instructions: Customers are provided with guidance on accessing logs to identify and remediate affected applications.
- Extensions of extensions: Case-by-case basis, unlikely to be approved.

## Extension Approval Process for No Legacy Usage Customers (Approximately 13000 Tenants):

- Upon August 31 2025 Deadline: Automatically disable TLS 1.0 / 1.1.
- Extensions Offered: We won?t invite customers to submit extension requests. 
- Extension duration: 30 days.
- Initiation: S500 customers raise extension requests through their CSAM/account team or via support ticket.
- Approval Workflow: Extension requests are reviewed by delegated approvers.
- Notification: Approved extensions are tracked, and customers are notified of their new deadlines.
- Assessment Criteria: Application logs are used to determine the number and criticality of applications still using legacy TLS. Customers with more critical dependencies may receive longer extensions, while those with minimal usage may receive shorter ones.
- Customer Instructions: Customers are provided with guidance on accessing logs to identify and remediate affected applications.
- Extensions of extensions: None.

**Note:** The number of affected tenants may change prior to the deprecation deadline. 

## How to Identify Clients Authenticating using Legacy TLS (TLS1.0 or TLS1.1)

In the current ongoing efforts to migrate customers from legacy TLS (TLS1.0 or 1.1) to TLS 1.2, we have managed to migrate about 23k tenants to modern TLS. We still have about 654 tenants who have TLS1.2Only mode not activated as of 24th October 2025.


We have sent out communications encouraging tenants to switch over to TLS12Only mode in an effort to test their environment for legacy TLS dependencies by enabling TLS1.2Only mode and observing for failures. Here are the steps we have shared with our customers.
1.  Switch your Entra Domain Services tenant to TLS 1.2 Only mode, as documented in this.
2.  Note the timestamp when TLS 1.2 Only mode is enabled and monitor your application behavior.
3.  If errors occur,
4.  disable the TLS 1.2 Only mode
5.  Open a support request to get help identifying the affected applications using fleet logs.


Customers' switchover to TLS12Only mode and rollback instructions are as documented:?[How to migrate to Transport Layer Security (TLS) 1.2 enforcement for Microsoft Entra Domain Services - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/domain-services/reference-domain-services-tls-enforcement?tabs=portal)

?
In this process we might get a CRI with above information, and we will be required to help the customers identify the apps that are trying to authenticate. We are also planning to migrate these tenants to TLS1.2Only Mode in the first week of November 2025 as outlined in this plan:?[EntraDS Legacy TLS Retirement Plan.docx](https://microsoft.sharepoint-df.com/:w:/t/AADDS/IQBChSerj4GlQaDtTFKDihQgAY4-KJ5kxCIBCFE5ZXHNSn0?e=MguR4J)?, we will be following the steps documented in this wiki page:?[Switching On and Off Legacy TLS in Targeted Tenants - Overview](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/80267/Switching-On-and-Off-Legacy-TLS-in-Targeted-Tenants). 

Due to this we might get CRIs requesting us to help customers identify the apps that are failing authentication due to dependency on TLS1.0 or TLS1.1. Below are the steps to follow:
1.  Note the timestamp shared by the customer if the switch over was done by the customer or note the day the tenant was migrated depending on the region as documented here:?[EntraDS Legacy TLS Retirement Plan.docx](https://microsoft.sharepoint-df.com/:w:/t/AADDS/IQBChSerj4GlQaDtTFKDihQgAY4-KJ5kxCIBCFE5ZXHNSn0?e=MguR4J)?
2.  Open this DGrep query and adjust the Timestamp and tenantID accordingly:?[https://portal.microsoftgeneva.com/s/9450C455](https://portal.microsoftgeneva.com/s/9450C455)??Note: Dgrep processess data for 2 days max. So if looking at a weeks data you can begin from Monday, check Monday and Tuesday, then Wednesday and Friday etc.
3.  If the query completes with no data for all the targeted days then it means we did not have any clients attempting to authenticate with TLS1.0 or TLS1.1 and in that case advise customer to remain on TLS12 mode  
    
![Items.png](/.attachments/Items-fc1d0e04-9d45-4171-96df-cb3169620653.png)

4.  If there are apps existing that are authenticating with TLS1.0 or TLS1.1 mode then the application name will be available on?`Data2`?column. This is the information to be shared on the ICM.

# ICM Path to file an Extension Request: 

**Owning Service:** Microsoft Entra domain Services

**Owning Team:** [NOT ENTRA ID] Triage
