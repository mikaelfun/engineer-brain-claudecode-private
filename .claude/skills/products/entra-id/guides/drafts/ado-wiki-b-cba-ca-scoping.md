---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Cert Based Auth/CBA CA Scoping Scoping groups to certificate authorities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/Cert%20Based%20Auth/CBA%20CA%20Scoping%20Scoping%20groups%20to%20certificate%20authorities"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Workflow
- cw.Passwordless

---
:::template /.templates/Shared/findAuthorContributor.md
:::

:::template /.templates/Shared/MBIInfo.md
:::

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Passwordless](/Tags/Passwordless) [CBA](/Tags/CBA)  


[[_TOC_]]

# CBA: CA Scoping Scoping Groups to Certificate Authorities

----

# Feature Overview

Azure AD certificate-based authentication (CBA) enables customers to allow or require users to authenticate directly with X.509 certificates against their Azure Active Directory (Azure AD) for applications and browser sign-in. This feature enables customers to adopt a phishing resistant authentication and authenticate with an X.509 certificate against their Public Key Infrastructure (PKI). 

Certificate Authority (CA) Scoping in Microsoft Entra allows tenant administrators to restrict the use of specific certificate authorities (CAs) to defined user groups. This feature enhances the security and manageability of certificate-based authentication (CBA) by ensuring that only authorized users can authenticate using certificates issued by specific CAs.

CA Scoping is particularly useful in multi-PKI or B2B scenarios where multiple CAs are used across different user populations. It helps prevent unintended access and supports compliance with organizational policies.

**Key Benefits**

- Restrict certificate usage to specific user groups
- Support for complex PKI environments with multiple CAs
- Enhanced protection against certificate misuse or compromise
- Visibility into CA usage via sign-in logs and monitoring tools

CA Scoping allows admins to define rules that associate a CA (identified by its Subject Key Identifier, or SKI) with a specific Microsoft Entra group. When a user attempts to authenticate using a certificate, the system checks whether the certificate s issuing CA is scoped to a group that includes the user. Entra walks up the CA chain and applies all the scope rules until user is found in one of the groups in all the scope rules. If the user is not in the scoped group, authentication fails, even if the certificate is otherwise valid.

## Pre-requisites

Tenants should have Certificate-based authentication method enabled and set up./  Tenant users should have a valid certificate. Tenant user objects should be updated with correct values in the certificate. Tenants should have uploaded the certificate authorities (CAs) in the Entra store. 

### Steps to enable CA scoping feature

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com/) as at least an [Authentication Policy Administrator](https://review.learn.microsoft.com/en-us/entra/identity/role-based-access-control/permissions-reference#authentication-policy-administrator).
2. Browse to **Entra ID** > **Authentication methods** > **Certificate-based Authentication**.
3. Under **Configure**, go to **Certificate issuer scoping policy**

![image](/.attachments/AAD-Authentication/264896/ca-scoping-config.png)

1. Select **Add rule**

![image](/.attachments/AAD-Authentication/264896/ca-scoping-add-rule.png)

1. Select **Filter CAs by PKI**. **Classic CAs** will show all the CAs from classic CA store and selecting a specific PKI will show all the CAs from the selected PKI. Select a PKI.

![image](/.attachments/AAD-Authentication/264896/ca-scoping-pki-filter.png)

1. **Certificate issuer** drop down will show all the CAs from the selected PKI. Select a CA to create a scope rule.

![image](/.attachments/AAD-Authentication/264896/ca-scoping-select-cert.png)

1. Select **Add group**

![image](/.attachments/AAD-Authentication/264896/ca-scoping-add-group.png)

1. Select a group

![image](/.attachments/AAD-Authentication/264896/a-scoping-select-group.png)

1. Select **Add** to save the rule

![image](/.attachments/AAD-Authentication/264896/ca-scoping-save-rule.png)

1. Select **I Acknowledge** and Select **Save** to save CBA config

![image](/.attachments/AAD-Authentication/264896/ca-scoping-save-cbaconfig.png)

1. To edit or delete a CA scoping policy select "..." on the rule row. Select **Edit** to edit the rule and **Delete** to delete the rule.

![image](/.attachments/AAD-Authentication/264896/ca-scoping-policy-edit-delete.png)

### Known Limitations

- Only one group can be assigned per CA.
- A maximum of 30 scoping rules is supported.
- Scoping is enforced at the intermediate CA level.
- Improper configuration may result in user lockouts if no valid scoping rules exist.



### Sign-in log entries

- Sign in log will show success and in **Additional Details** tab the SKI of the CA from scoping policy rule will be shown.

![image](/.attachments/AAD-Authentication/264896/sign-in-log-success.png)

- When a CBA authentication fails due to a CA scoping rule, the Basic info tab in the sign-in log will show the error code 500189



- End users will see the error message below.

![image](/.attachments/AAD-Authentication/264896/ca-scoping-policy-user-error.png)

# Troubleshooting

## Audit logs

### Public Key Infrastructure Objects

Filter the Audit logs on these:

**Service**: Core Directory

**Category**: PublicKeyInfrastructure

**Activity**:

- `Create PublicKeyInfrastructure` - The **Object ID** shown on the **Activity** tab is not the objectID of the PKI container being created. The **Targets** tab shows `displayName` and `ID` of the object being managed. The **Modified Properties** tab shows the `DisplayName` property that were added.
- `Delete PublicKeyInfrastructure` - The **Object ID** shown on the **Activity** tab is not the objectID of the PKI container being created. The **Targets** tab shows `displayName` and `ID` of the object being managed.
- `Update PublicKeyInfrastructure` - The **Object ID** shown on the **Activity** tab is not the objectID of the PKI container being created. The **Targets** tab shows `displayName` and `ID` of the object being managed.

**Note**: When the **Display Name** of a PKI container is updated the **Modified Properties** tab will show the old and new value of that property. However, this event is also recorded every time a new CA is added into a PKI. Only in this scenario the **Modified Properties** tab is empty. While none of the direct properties are updated on the PKI container, the child property CA[] is updated.

- `Hard Delete PublicKeyInfrastructure` - This fails during public preview and needs updating once it is fixed for GA.
- `Restore PublicKeyInfrastructure` - The **Object ID** shown on the **Activity** tab is not the objectID of the PKI container being restored. The **Targets** tab shows `displayName` and `ID` of the object being managed.

### Certificate Authority Objects

Filter the Audit logs on these:

**Service**: Core Directory

**Category**: CertificateAuthorityEntity

**Activity**:

- `Create CertificateAuthorityEntity` - The **Object ID** shown on the **Activity** tab is not the objectID of the CA being created. The **Targets** tab shows `displayName` and `ID` of the object being managed. The **Modified Properties** tab shows the properties that were added.
- `Delete CertificateAuthorityEntity` - The **Object ID** shown on the **Activity** tab is not the objectID of the CA being deleted. The **Targets** tab shows `displayName` and `ID` of the object being managed.
- `Restore CertificateAuthorityEntity` - The **Object ID** shown on the **Activity** tab is not the objectID of the CA being restored. The **Targets** tab shows `displayName` and `ID` of the object being managed.
- `Hard Delete CertificateAuthorityEntity` - The **Display Name** shown on the **Activity** tab is `Microsoft Online Services Garbage Collector`. The **Targets** tab shows `displayName` and `ID` of the object being managed.
- `Initiate PublicKeyInfrastructure file upload` - TBD, this will be functional in time for Public Preview.


------

# Support Topic

```
Azure/Microsoft Entra Sign-in and Multifactor Authentication/Microsoft Entra Native Certificate Based Authentication/Problems configuring Native Certificate Based Authentication
```

------

# Root Cause

```
Root Cause - CID Sign In and MFA/AAD Certificate Based Authentication (X.509 Auth)
```

------

## **When to Submit an ICM to ESTS?**  
**1)** ICM should only be submitted for addressing break/fix issues. Note that, for Customer Reported Incidents, due diligence by Identity Auth support teams (CSS) should be performed.  

**Important:**  
***1.1)*** Escalations should only come directly from the **Azure Entra ID and Office 365 Identity Support Teams (CSS)**.  
If the submitter is **not a member** of such teams, but belongs to the broader CSS group, a collaboration process should be initiated.  
***1.2)*** CSS Support teams are encouraged to work together with Identity CSS Teams (AAD Auth) by **raising a DFM Collaboration task first**. This ensures the right team addresses the issue at the earliest possible stage, saving time, avoiding unnecessary delays and escalations.  
Following the collaboration guidelines, guarantees **Faster Resolution** (Identity teams are equipped to resolve most Entra ID authentication issues without needing Engineering escalation) and **Improved Escalation Quality** (required diagnostic data is collected in advance).   

**2)** If you're not part of any **Customer support teams (CSS)**, and the issue is not clearly identified as ESTS related, or you do not know exactly what escalation path to use, please submit a support request through the normal [support channels](https://azure.microsoft.com/en-us/support), [Services Hub Support Portal](https://learn.microsoft.com/en-us/services-hub/unified/support/open-support-requests?pivots=existing) or [Customer service phone numbers](https://support.microsoft.com/en-us/topic/customer-service-phone-numbers-c0389ade-5640-e588-8b0e-28de8afeb3f2). Note that, before this, if you have a specific dedicated support team that can help address your issue, e.g., Microsoft IT ([MSIT](https://aka.ms/filloutaform)), you should engage it first. 

**3)** Obtaining information on features, their timelines or PIR (Post-Incident Reports) is not part of the ICM scope.  

**4)** For new features requests or design change requests (DCR), follow guidelines available [here](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/412862/AAD-DCR).  

**5)** If you're looking for first-party development help, you should use the [proper channels](https://eng.ms/docs/microsoft-security/identity/entra-developer-application-platform/app-vertical/aad-first-party-apps/identity-platform-and-access-management/microsoft-identity-platform/get-help), [Engineering System Chat (ES Chat)](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/es-chat) or [existent guidance](https://eng.ms/docs/microsoft-security/identity/entra-developer-application-platform/app-vertical/aad-first-party-apps/identity-platform-and-access-management/microsoft-identity-platform/overview).  

**6)** Any [RED team�s](https://en.wikipedia.org/wiki/Red_team) findings should be routed via [MSRC](https://msrc.microsoft.com/report/) (in case of any findings of a compromised scenario or security breach). This is the correct process defined. Submitting an ICM to Engineering teams (e.g. ESTS) should not be considered as a valid option.  

**7)** If issue is related to ESTS Regional Endpoints (ESTS-R), Internal Partners should use exclusively the respective [StackOverflow channel](https://stackoverflow.microsoft.com/posts/tagged/29598).

---
<p><br/><br/></p>

---
## **ICM Severity**  
ICM severity and prioritization in ESTS follows the [Identity CEN Model](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/2712/Identity-CEN-Model). 

Before you set or change the severity of an Incident within ESTS scope, please read the [Identity CEN Model](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/2712/Identity-CEN-Model) classification details carefully. 

Any <b>Customer Reported Incident (CRI)</b> with <b>Severity 3</b> or lower (e.g., <b>SEV 4</b>) must be transferred to <b>[ESTS\Incident Triage (CRI's only - No Sev 2)]</b>. 

Any <b>Customer Reported Incident (CRI)</b> or <b>Live Site Incident</b> with <b>Severity 2.5</b>, <b>Severity 2</b> or higher (e.g., <b>SEV 1</b>) must be transferred to <b>[ESTS\ESTS]</b>. 
This also applies to SEV 3/4 Customer reported incidents where the Severity needs to be raised to SEV 2.5 or higher.  

When an incident is set with <b>Severity 2</b> or higher (e.g., <b>SEV 1</b>), and gets transferred or remains under <b>[ESTS\Incident Triage (CRI's only - No Sev 2)]</b>, if severity is valid, will be manually transferred to <b>[ESTS\ESTS]</b> containing the details of the investigation performed, if any, or if no investigation was performed, will contain the note "<b>Sev 2, no investigation performed by Incident Triage</b>".   

---
<p><br/><br/></p>

---
## **ESTS ICM Flow Guidelines and Notes - For ESTS Internal Usage Only and General Awareness**  
1) The definition of <b>Live Site Incident (LSI)</b> and <b>Customer Reported Incidents (CRI)</b> is available [here](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/36559/IcM-CRI-LSI-Tool). 

2) <b>Customer Reported Incidents (CRI)</b> process flow can be found [here](https://identitydivision.visualstudio.com/IdentityWiki/_wiki/wikis/IdentityWiki.wiki/36554/CRI-Process-Flow).  

3) When minimum required data for ESTS team investigation is not available on the ICM, or there is no clear actionable request for ESTS team, ICM will be transferred back to previous team or submitter's team (when available/applicable), tagging the requestor for awareness, informing about missing data or required clarification. 

4) During incident investigation, specific subject matter experts (SMEs) might need to be engaged to help with investigation. Such internal process includes the following steps:  
4.1) Engaging and discussing the incident with current On-Call Engineer (OCE).  
4.2) If confirmed that incident needs specific SME engagement, accurate business impact should be obtained, and with such impact information, along with findings, OCE will facilitate the identification and engagement of the specific SME to investigate further the incident.  
<b>Notes</b>:  
If incident requires ESTS-R SME, engagement should be targeted to [respective OCE](https://portal.microsofticm.com/imp/v3/oncall/current?serviceId=0&teamIds=97727).  

5) If after incident investigation a bug is identified, two scenarios exist:  
5.1) Bug/Behavior exists since the beginning (internally known as zero-day bug). The ICM will be mitigated/resolved and a work item will be created to track further the fix/change on the behavior. Temporary solution/workaround to surpass any block will try to be provided.  <p></p>
5.2) Bug/Behavior is recent due to a product change (internally known as regression). The ICM should remain active until the fix/change on the behavior is deployed and confirmed. Temporary solution/workaround to surpass any block will try to be provided.  

5) When a <b>Live Site Incident (LSI)</b> originated from an alert/monitoring event (alert source ADROCS) is transferred to ESTS\Incident Triage (CRI's only - No Sev 2), ESTS EEE will access the monitor event dashboard to find the last modified owner/feature team, and engage them for acknowledge/handle the incident.  
---
<p><br/><br/></p>  

------

# Training

**Title**: Deep Dive 264896 - CBA: CA Scoping - Scoping Groups to Certificate Authorities

**Course ID**: TBD

**Format**: Self-paced eLearning

**Duration**: 55 minutes

**Audience**: Cloud Identity Support Communities **Strong Auth Methods**

**Tool Availability**: 

**Training Completion**:

**Region**: All regions

**Deep Dive Recording Link:**    [Deep Dive Recording](http://aka.ms/AAwua5v)

**Public Article:** [Microsoft Entra CBA Technical Concepts - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-certificate-based-authentication-technical-deep-dive#certificate-authority-ca-scoping-preview)