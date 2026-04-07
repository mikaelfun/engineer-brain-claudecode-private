---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/UEBA&Notebooks/UEBA for Sentinel"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Microsoft%20Sentinel%20Wiki/UEBA%26Notebooks/UEBA%20for%20Sentinel"
importDate: "2026-04-07"
type: troubleshooting-guide
---

[[_TOC_]]

# Concepts
**What is Entity Behavior Analytics?** 

Identifying internal threat sources in your organization, and their potential impact, has always been a labor-intensive process. Sifting through alerts, connecting the dots, and active hunting all add up to massive amounts of effort expended with minimal returns, and the possibility of many internal threats simply evading discovery. 
Azure Sentinels Entity Behavioral Analytics (UEBA) eliminates the drudgery from your analysts workloads and the uncertainty from their efforts, and delivers high-fidelity, actionable intelligence, so they can focus on investigation and remediation. 
As Azure Sentinel collects logs and alerts from all of its connected data sources, it analyzes them and builds baseline behavioral profiles of your organizations entities (users, hosts, IP addresses, applications etc. across time and peer group horizon. Using a variety of techniques and machine learning capabilities, Sentinel can then identify anomalous activity and help you determine if an asset has been compromised. Not only that, but it can also figure out the relative sensitivity of particular assets, identify peer groups of assets, and evaluate the potential impact of any given compromised asset (its blast radius). Armed with this information, you can effectively prioritize your investigation and incident handling.  

**Entity Page** 

When you select any entity (user, host, IP address) in an alert or an investigation, you will land on an entity page, which is basically a portfolio of relevant information about that entity. Each type of entity has its own unique page, since information about users and about hosts will not be of the same type. On the user entity page, you will find basic information about the user, a list of recent events involving the user, summary counts of various types of alerts.

**Architecture Overview**  
![Sentinel_UEBA_Arch.png](/.attachments/Sentinel_UEBA_Arch-1c938616-bd0b-4ee1-a5bf-100efca276f7.png)

**Maximized Value** 

Inspired by Gartners definition for UEBA solutions, Sentinel Entity Behavioral Analytics provides a top-down approach based on 3 different dimensions. 
- Use Cases  Researching for relevant attack scenarios that put various entities as victims or pivot points in an attack chain, and adapting those attack vectors into MITRE ATT&CKs tactics, techniques, and sub techniques terminology, Sentinel EBA focuses only on the most valuable logs each data source can provide. 
- Data Sources  While seemingly supporting Azure data sources, 3rd party data sources are thoughtfully chosen to provide data that matches our threat use cases.   
- Analytics  Using various ML algorithms, evidence of anomalous activities are presents in enrichments such as: first time activity, uncommon activity, contextual information, and more. All evidence is provided in a clear, to the point manner, where a TRUE statement represses an anomaly. 

![UEBA_Funnel.png](/.attachments/UEBA_Funnel-d9de2ad9-0714-4dd6-9108-c3e04fd11103.png)

Anomalies provide Evidence that helps SecOps get a clear understanding of the context, and the profiling of the user. 
The evidence includes information about:  
- Context  Geo location, device information & TI 
- User behavior 
- User Peers behavior 
- Organization behavior 

![UEBA_Context.png](/.attachments/UEBA_Context-955e81fb-2060-45f6-8a1e-ff36388adf33.png)

**Behavior Analytics Table** 

All the enriched data from connected data source is contained within the BehaviorAnalytics and IdentityInfo Tables: [UEBA enrichments](https://learn.microsoft.com/en-us/azure/sentinel/ueba-reference#ueba-enrichments).

Note the OnpremisesExtensionAttribute property is no longer supported: [IcM 552681044](https://portal.microsofticm.com/imp/v5/incidents/details/552681044/summary).

**Scoring:** 

Each activity is scored with Investigation Priority Score  which determine the probability of a specific user performing a specific activity, based on behavioral learning of the user and their peers. Activities identified as the most abnormal receive the highest scores (on a scale of 0-10). 
 
**Example:** 

https://techcommunity.microsoft.com/t5/microsoft-security-and/prioritize-user-investigations-in-cloud-app-security/ba-p/700136 

Using [KQL](https://docs.microsoft.com/en-us/azure/data-explorer/kusto/query/), we can query the Behavioral Analytics Table.

For example  in case wed like to find all the users that failed to login to an Azure, while it was the first attempt to connect from a certain country and is even uncommon for their peers, we can use the following query: 

```q
BehavorialAnalytics
| where ActivityType == "FailedLogOn"
| where FirstTimeUserConnectedFromCountry == True
| where CountryUncommonlyConnectedFromAmongPeers == True
```

**User Peers Metadata Table & Notebook** 

User peers metadata provides an important context in threat detections, in investigating an incident, and in hunting for a potential threat. Security Analyst can observe the normal activities of the peers of a user to get insights of if the user activities are abnormal comparing to his/her peers. 
UserPeerAnalytics table provides a ranked list of peers of a user based on the users group membership in Azure Active Directory. For example, if the user is Guy Malul, Peer Analytics calculates all of Guys peers based on his mailing list, security groups, etc. and provides all his peers in the top 20 ranking in the table. The screenshot below shows the schema of UserPeerAnalytics table and an example of a row in the table. One of the peers of Guy is Pini. His peer rank is 18. TF-IDF algorithm is used to normalize the weigh for calculating the rank, smaller the group higher the weight.  

![UEBA Metadata.png](/.attachments/UEBA%20Metadata-a7d0bd54-43b7-4baf-8ca6-4b0695071098.png)

**Permission Analytic Table & Notebook** 

UserAccessAnalytics table provides the direct or transitive access to Azure resources for a given user. For example, if the user under investigation is Jane Smith, user Access Analytics calculates all the Azure subscriptions that she either can access directly, via groups or service principals transitively. It also lists all the Azure Active Directory security groups of which Jane is a member. The screenshot below shows an example row in UserAccessAnalytics table. Source entity is the user or service principle account, Target entity is the resource that the source entity has access to. The value of Access level and Access type depend on the access control model of the target entity. You can see Jane has Contributor access to Azure subscription Contoso Azure Production 1. The access control model of the subscription is RBAC.    

**Hunting Queries & Exploration Queries**  

Entity Behavior Analytics provides out-of-the-box set of hunting queries, exploration queries and a workbook. Those will present the enriched data the system generates focused on specific use cases that can indicate anomalous behavior. A great addition to the already existing queries and workbooks that exist in Sentinel. 
More information regarding hunting in sentinel, and the investigating graph, can be found here: https://docs.microsoft.com/en-us/azure/sentinel/hunting 

## How-to-guides
Enabling UEBA
![enable_UEBA.png](/.attachments/enable_UEBA-8ed041ec-6185-4026-a968-bc3b06308c8b.png)

# Sept 2025: New UEBA data sources going to public preview

Link to the private preview: [New data sources for UEBA analytics and anomalies](https://microsoft.sharepoint.com/sites/roadmaphub/SitePages/New-data-sources-for-UEBA-analytics-and-anomalies.aspx?CT=1756110565482&OR=OWA-NT-Mail&CID=2d4099f4-3b29-3255-9409-031df218ca64&csf=1&web=1&e=5C5vVo "https://microsoft.sharepoint.com/sites/roadmaphub/sitepages/new-data-sources-for-ueba-analytics-and-anomalies.aspx?ct=1756110565482&or=owa-nt-mail&cid=2d4099f4-3b29-3255-9409-031df218ca64&csf=1&web=1&e=5c5vvo").

This feature allows streaming new activity types from a variety of data sources as listed in the next section.

Please notice that **only**the following sources will be released, and the release is in **all commercial regions**(event types specified below). Fileactivities will not be released to public preview at this time.
*   **Authentication Activities**
    *   MDE: DeviceLogonEvents
    *   AAD: AADManagedIdentitySignInLogs, AADServicePrincipalSignInLogs
*   **Cloud Platforms**
    *   AWS CloudTrail: login events
    *   GCP Audit Logs: failed IAM access
    *   Okta_CL: MFA and auth security change events

# IdentityInfoin Advance Hunting and Log Analytics

The Advanced HuntingIdentityInfotableand the SentinelIdentityInfotableare different by design, and they serve different purposes. The logic behind eachtablevaries, and they track different types of identities.

For example:

*   The Advanced HuntingIdentityInfotableincludes service principals and identities from non-Microsoft sources.

*   The radiusIdentityInfotableis only enriched by UEBA and has totally different logic.

*   Retention and handling of deleted users are also different between the twotables.

Because of these differences, the data between thetablesis not expected to be the same.

Is it possible the Cx can use this explanation when responding to the CRIs.

When you onboard to XDR, you get the Radius (XDR)IdentityInfotable, which is enriched by UEBA data. However, this is a differenttablewith different schema than the SentinelIdentityInfotable.

Although the schemas may appear similar, they are backed by different pipelines and enrichment logic, and therefore the data is not expected to be identical.

In sohrt:
*   **Sentinel without UEBA and without XDR**: NoIdentityInfotableavailable.
*   **Sentinel with UEBA, without XDR**: UEBAIdentityInfotablein Log Analytics. This can also be used in Advanced Hunting as part of "_Log Analytics"_Advanced Hunting support.
*   **XDR customer without UEBA**: classic RadiusIdentityInfotable.
*   **Sentinel with UEBA and XDR**: Unified RadiusIdentityInfotable. This is the XDRtableenriched with UEBA data and fields.

---

:::template /.templates/Wiki-Feedback.md 
:::

---

:::template /.templates/Ava-GetHelp.md 
:::
