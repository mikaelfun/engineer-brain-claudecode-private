---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS Deep Dives - Features explained/AD FS sign ins in Azure AD with Connect Health"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.comm-adfs
- cw.adfs features
- SCIM Identity
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [comm-adfs](/Tags/comm%2Dadfs) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AAD-ADFS](/Tags/AAD%2DADFS) [AAD-Troubleshooting](/Tags/AAD%2DTroubleshooting) [AAD-Workflow](/Tags/AAD%2DWorkflow)                
 

[[_TOC_]]

# Feature overview

AD FS sign-ins can now be integrated into the Azure Active Directory sign-ins report by using Connect Health. The Azure AD sign-ins Report report includes information about when users, applications, and managed resources sign in to Azure AD and access resources.

The Connect Health for AD FS agent correlates multiple Event IDs from AD FS, dependent on the server version, to provide information about the request and error details if the request fails. This information is correlated to the Azure AD sign-ins report schema and displayed in the Azure AD Sign-In Report UX. Alongside the report, a new Log Analytics stream is available with the AD FS data and a new Azure Monitor Workbook template. The template can be used and modified for an in-depth analysis for scenarios such as AD FS account lockouts, bad password attempts, and spikes of unexpected sign-in attempts.

## What data is displayed in the report?

The data available mirrors the same data available for Azure AD sign-ins. Five tabs with information will be available based on the type of sign-in, either Azure AD or AD FS. Connect Health correlates events from AD FS, dependent on the server version, and matches them to the AD FS schema.

See [What data is displayed in the report?](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-health-ad-fs-sign-in#what-data-is-displayed-in-the-report) for exact details.

# Case handling

This feature is supported by [Cloud Identity Support Team MSaaS AAD - Authentication Professional](https://msaas.support.microsoft.com/queue/dc834c65-9d09-e711-811f-002dd8151752), [MSaaS AAD - Authentication Premier](https://msaas.support.microsoft.com/queue/5b6689e1-465c-e711-812a-002dd8151751)

# Licensing

- The first Connect Health Agent requires at least one Azure AD Premium (P1 or P2) license.
- Each additional registered agent requires 25 additional Azure AD Premium (P1 or P2) licenses.
- Agent count is equivalent to the total number of agents that are registered across all monitored roles (AD FS, Azure AD Connect, and/or AD DS).
- AAD Connect Health licensing does not require you to assign the license to specific users. You only need to have the requisite number of valid licenses.

See https://docs.microsoft.com/en-us/azure/active-directory/hybrid/reference-connect-health-faq for details.

# Risks

There are no known risks with this feature.

# Limitations and known issues

See [Frequently asked questions](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-health-ad-fs-sign-in#frequently-asked-questions) for current known issues and limitations.

# Configuration

Basic configuration is automatic and data is fed into the reoprt once the feature goes live and prerequisites are met.
## Prerequisites

- Azure AD Connect Health for AD FS installed and upgraded to latest version (3.1.95.0 or greater.)
- Global administrator or reports reader role to view the Azure AD sign-ins

## Enabling Log Analytics and Azure Monitor

Log Analytics can be enabled for the AD FS sign-ins and can be used with any other Log Analytics integrated components, such as Sentinel. See [Enabling Log Analytics and Azure Monitor](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-health-ad-fs-sign-in#ad-fs-additional-details) for more information.


# Troubleshooting

## Kusto logging

```kusto
unioncluster('Idsharedweu').database('ADFSConnectHealth').SignInEvent,  
cluster('Idsharedwus').database('ADFSConnectHealth').SignInEvent 
| where env_time > ago(2d)
| where tenantId == "00000000-0000-0000-0000-000000000000"
| take 15
```



## ICM escalations

Support Engineers should always file ICMs via ASC using https://aka.ms/cssidentityicm  process for their TAs to review and approve.

# Supportability documentation


## Internal documentation

This is MS internal only:

The events in the following link represent both successful sign-ins and error cases to encompass all supported scenarios of successful and failed sign-ins.The same events are correlated for Windows Server 2016 and WindowsServer 2012R2,with the addition of a set of 1200 events that are only present in Server 2016 and above.


[AD FS Sign-Ins in Azure ADSign-In Report Preview](https://microsoft-my.sharepoint-df.com/:b:/p/zhvolosh/Eczcql7g5cdLrPclVT6QT3MBs2l80MlZ9xwydQu7JNKCsQ)

## External documentation

This can be shared with customers:

[AD FS sign-ins in Azure AD with Connect Health - preview](https://docs.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-health-ad-fs-sign-in)


## Training sessions and brownbags

This too is MS only:

Deep dive training session: https://aka.ms/AAbi3x9
