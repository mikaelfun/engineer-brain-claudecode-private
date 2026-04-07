---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Next-Gen - Microsoft Sentinel (USX)/Microsoft Sentinel data lake/[TSG] - Sentinel data lake - Onboarding and Offboarding"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=/Next-Gen%20-%20Microsoft%20Sentinel%20(USX)/Microsoft%20Sentinel%20data%20lake/%5BTSG%5D%20-%20Sentinel%20data%20lake%20-%20Onboarding%20and%20Offboarding"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Onboarding and Offboarding of Microsoft Sentinel to the data lake
---

Original PG TSG is [here](https://microsoft.sharepoint.com/:w:/t/SecurityPlatform/EQASTlrbkvVHrdQfay_btoMBtfvaz29SIqtMbun2d-QV5w?e=QYapdQ) and [here](https://microsoft.sharepoint.com/:w:/t/SecurityPlatform/EYl6qI-mUTdPkLvNnECPbigBTL9uXZlnPs1mGTEKQbIVig?e=uUsRky)

[[_TOC_]]

# Training sessions
---
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
|10/07/2025|[Sentinel Data Lake - Onboarding](https://platform.qa.com/resource/sentinel-data-lake-onboarding-1854/)|Amar Patel|
|14/07/2025|[Data Lake Onboarding Demo (Internal Use Only)](https://platform.qa.com/resource/sentinel-data-lake-test-1854/?context_id=12963&context_resource=lp)|Amar Patel|

# Required Kusto Access
---
| Cluster Path | Database | Permissions |
|--|--|--|
| https://babylon.eastus2.kusto.windows.net | babylonMdsLogs | [TM-AzurePurviewCSS](https://coreidentity.microsoft.com/manage/entitlement/entitlement/tmazurepurvi-xzw2) |

## Overview
---

Microsoft Sentinel data lake, available in the Microsoft Defender portal, is a centralized repository designed to store and manage vast amounts of security-related data from various sources. It enables your organization to collect, ingest, and analyze security data in a unified manner, providing a comprehensive view of your security landscape. Leveraging advanced analytics, machine learning, and artificial intelligence, the Microsoft Sentinel data lake helps in detecting threats, responding to incidents, investigating incidents, and improving overall security posture.

## Feature Description

This TSG describes how to onboard to the Microsoft Sentinel data lake for customers who are currently using Microsoft Defender and Microsoft Sentinel. New Microsoft Sentinel customers can follow this process after onboarding to the Microsoft Defender portal.

The onboarding process creates a Sentinel data lake account and establishes the data lake to house security data for use with Microsoft Defender portal experiences. The onboarding process makes the following changes once onboarding is complete:
- Your Microsoft Sentinel data lake is provisioned for your selected Azure subscription and resource group.
- It attaches all workspaces connected to Defender that are located in the same region as your primary Sentinel workspace region to your Microsoft Sentinel data lake. Workspaces that aren't connected to Defender aren't attached to the data lake.
- Once Microsoft Sentinel data lake is enabled, from that point forward, data in the Microsoft Sentinel Analytics tier will also be available in the Microsoft Sentinel data lake tier without additional charge for the first 90 days. See the table in [this document](https://learn.microsoft.com/en-us/azure/sentinel/manage-data-overview#xdr-data-retention-and-costs) for more information. You can use existing Sentinel workspace connectors to ingest new data to both the Analytics and the lake tiers or just the lake tier. When you enable tables for the first time or switch tiers, it will take 90-120 minutes to take effect. Once the tables are enabled, the data in lake will appear at the same time as your Analytics tier.
- Entitled data pertaining to your Microsoft related assets will be ingested into the Sentinel data lake. The asset data includes Entra, Microsoft 365, and Azure. The expected duration for the tables to appear in your lake when you set up your data lake is 90-120 minutes.
- If your organization currently uses Microsoft Sentinel SIEM features like search jobs and queries, auxiliary logs, long-term retention (also known as �archive�), billing and pricing for those features will switch to the Microsoft Sentinel data lake meters, potentially increasing your costs.
- Auxiliary log tables will become integrated with the Microsoft Sentinel data lake. Auxiliary tables in Microsoft Defender connected workspaces that have been onboarded to the Microsoft Sentinel data lake become an integrated part of the lake and are available for use in the data lake query and job experiences. Auxiliary log tables will not be accessible from Microsoft Defender Advanced hunting once the data lake is enabled.
- It creates a managed identity with the prefix msg-resources- followed by a globally unique identifier (GUID). This managed identity is required for data lake functionality. The identity has the Azure Reader role over subscriptions onboarded into the data lake. Don't delete or remove required permissions from this managed identity. To enable custom table creation in the analytics tier, assign the Log Analytics Contributor role to this identity for the relevant Log Analytics workspaces. For more information, see [Create KQL jobs in the Microsoft Sentinel data lake.](https://learn.microsoft.com/en-us/azure/sentinel/datalake/kql-jobs#permissions)
      
Once you have onboarded to the Microsoft Sentinel data lake, you can use the following features in the Defender portal:
- Sentinel lake KQL queries
- Sentinel lake notebooks
- Sentinel lake jobs
- Sentinel lake table
- Sentinel cost management
- Microsoft Sentinel data lake settings

## Prerequisites

To onboard to the Microsoft Sentinel data lake, you must be an existing Microsoft Defender and Microsoft Sentinel customer with the following prerequisites

- The Microsoft Sentinel data lake is available in the Microsoft Defender portal. Customers must have Microsoft Defender (security.microsoft.com) and Sentinel to onboard to the data lake. They can be licensed for both Microsoft Defender and Sentinel SIEM or be licensed for Sentinel SIEM and using it in the Microsoft Defender portal.
- Have an existing Azure subscription and resource group to set up billing for the data lake. You can use your existing Azure subscription and resource group that you use for Microsoft Sentinel or create a new one.
- Have the following roles that are required to set up billing and authorize ingestion of asset data into the data lake.
  - Azure Subscription owner or Billing Administrator (to set up billing)
  - Microsoft Entra Global Administrator (to enable asset data ingest)
- Have a primary workspace and other workspaces in the same region. Have the privileges (i.e. read access) to the primary and other workspaces so they can be attached to the data lake. We currently support attaching a primary and all workspaces connected to Defender to the data lake in the same region as your primary workspace region. 

## Existing Microsoft Sentinel workspaces

The Microsoft Sentinel data lake uses data from Microsoft Sentinel workspaces. You [must](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-onboarding#prerequisites) connect your Sentinel workspaces to the Defender portal. For more information, see [Connect Microsoft Sentinel to the Microsoft Defender portal.](https://learn.microsoft.com/en-us/unified-secops/microsoft-sentinel-onboard)

If you have connected Sentinel to the Defender portal, to onboard to the lake, the primary workspace and other connected workspaces in the same region will be onboarded.

# Onboarding to the Microsoft Sentinel data lake
---

Onboarding to the Microsoft Sentinel data lake occurs once and starts from the Defender portal. The onboarding process creates a new Sentinel data lake for the subscription you specify during the onboarding process.
Note
The onboarding process can take up to 60 minutes to complete.
Use the following steps to onboard to the Microsoft Sentinel data lake from the Defender portal:

1.�Sign in to your Defender portal at [https://security.microsoft.com](https://security.microsoft.com/).

2. A banner appears at the top of the page, indicating that you can onboard to the Microsoft Sentinel data lake. Select **Get started**.
Note: If you accidentally close the banner, you can initiate setup by going to the data lake settings page located in System/Settings/Microsoft Sentinel.

3. If you don't have the correct role to set up the data lake, a side panel appears indicating that you do not have the required permissions. You will need to make a request to your administrator to set up the data lake.
   
4. If you have the required permissions, you will see a side panel that enables you to start Setup and understand the subsequent Benefits and impact. To begin the Setup, select the **Subscription** and **Resource group** to enable billing for the Microsoft Sentinel data lake.
   
5.�Select **Set up data lake**.

6. The setup process begins. You will see a setup started panel followed by a setup complete panel. You can close the setup started panel while the setup process is running.

7. If you close the setup started panel you will see a setup in progress banner.
    
8.�Once the setup is complete, you will see a setup complete banner with information cards on how to start using the new experiences.

9.�For example, you can click on **Query data lake** to open the Sentinel lake explorer. The Sentinel lake explorer is a new feature in the Defender portal that allows you to explore and analyze data in the Sentinel data lake using KQL.


# TSG
---

## Common scenarios <!-- Describe issue common scenarios as reflected from Cases and CRIs-->

The customer could encounter the following issue during the onboarding process:

| **Issue** | **Symptoms** | **Resolution** |
| --- | --- | --- |
| Missing Permissions | Setup panel does not appear or shows a permissions error. | Ensure you have the following roles:<br> - Azure Subscription Owner or Billing Administrator (for billing setup)�<br> - Microsoft Entra Global Administrator or Security Admin (for data ingestion authorization)�<br> - Read access to all Microsoft Sentinel workspaces |
| Banner Not Visible | Onboarding banner is accidentally closed. | Navigate to System Settings > Microsoft Sentinel > Data Lake in the Defender portal to initiate onboarding manually. |

## Error Codes
Customers could encounter the following provisioning errors during the onboarding process, these can be seen with a HAR trace:
      
| **Error Code** | **Error** | **Description** | �**Resolution** |
| --- | --- | --- | --- |
| DL102 | Can�t complete setup | There is a lack of Azure resources in the region at the time of provisioning | We will require the customer to retry. We will reset setup to enable the customer to retry once the resources situation is resolved |
| DL103 | Can�t complete setup | Customer has enabled policies that prevent the creation of Azure managed resources to enable the data lake | We require the customer to check their Azure policies to address this issue |

If the customer is trying understand when data tables will appear after the data lake is enabled.
- It can take 90-120 minutes for tables to appear in the lake after successfully onboarding to the data lake.
- When tables are enabled for the first time or when customers enable tiering it can take 90-120 minutes for the change to take effect. Once the tables appear, data mirrored to the lake will appear at the same time as it appears in the Analytics tier.

## Known issue/s

- [Known Issue 1823 Sentinel Data Lake - Onboarding issues due to capacity constraints in some regions](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_workitems/edit/1823)
   - Impacted Regions:
      - West Europe
      - East US
   - Error:
     - HAR file showing {"isEligible":false,"errorCode":"CAPACITY_UNAVAILABLE"}

### Support Engineer Suggested Playbook for Low Capacity scenario (**Under Draft - 3 March 2026**)
- Request CSAM to submit [Unified Action Tracker](https://uatracker.microsoft.com/)�(UAT) as suggested in [Known Issue 1823 Sentinel Data Lake](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_workitems/edit/1823). The following information should be included:
  - Attached milestone with estimated data lake ACR
  - Tenant ID of customer
  - Is this dev/test/pre-prod/prod environment
  - Is customer ready to onboard promptly from technical perspective (approvals sorted out / internal technical readiness)? Yes/No
  - Is it compete situation / alternatives evaluation situation
  - Customer�s realistic deadline for onboarding, after which the account team could face significant consequences
  - Any other business impact on Microsoft if customer cannot onboard now
  - Reason for onboarding to data lake (Graph/MCP/Long-term retention/etc)
- Ask CSAM to share the link to the UAT and add to case notes.
- Confirm with the customer that the UAT has been raised.
- Ask the account team to follow up internally�and provide updates to customer.
- No further action can be done by CSS. Case owner should set expectations with customer and CSAM and start working on case closure. 

# Diagnostic Queries
---

*   Connect to: [https://babylon.eastus2.kusto.windows.net](https://babylon.eastus2.kusto.windows.net/)��
*   Queries are here: [Microsoft Sentinel Graph Callback Faulted (CSS Guide) | Microsoft Purview Trouble Shooting Guide](https://eng.ms/docs/microsoft-security/cloud-ecosystem-security/azure-data-governance/security-platform-ecosystem/security-platform-purview/microsoft-purview-troubleshooting-guides/troubleshooting/msgprovisioning/msg-callback-faulted-css-guide)

# Data lake Offboarding
---

- **Currently, customers can't do this by themselves and therefore will reach out to support.**
  - Link to public facing doc regarding [Offboarding Microsoft Sentinel data lake and graph](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-onboarding#offboard-from-microsoft-sentinel-data-lake-and-graph)

If the customer wants to offboard or rollback data lake onboarding, Support will need to open an ICM.

In this case make sure to attach in the IcM the customer confirmation screenshot mentioning that, as a part of the offboarding, any saved queries and any resources that are provisioned as a part of Data Lake will be deleted.

Make sure the customer understand this and confirm the operation. When confirmed attach the confirmation in the IcM and DTM. After the offboarding is complete the customer will have to re-onboard to Data Lake.

For any customers that require offboarding, escalate via ICM to **MSG Tenant Provisioning / MSG Provisioning - Customer Escalation & Engagement**.

- Include:
  - Customer name:
  - Reason for offboarding
  - Tenant ID:
  - Subscription to offboard:
    - (Optional) Workspaces to offboard if only specific workspaces need to be offboarded:

- The SLA for rolling back is 4 days. 

   
# Frequently Asked Questions (FAQ)
---

**Q1**: How do I escalate onboarding and provisioning issues to the product group**?**
- Once the CARE CEM 1SOC team has ownership in ICM, they will investigate engage **MSG Tenant Provisioning**/**MSG Provisioning** as needed.

**Q2**: Can I have one Sentinel data lake or multiple?
- When a customer onboards to the Sentinel data lake, they will have one data lake that works with experiences in security.microsoft.com. In the future, we will also enable the same data lake to work with purview.microsoft.com. This means that they will only onboard once. We will be able to detect if they�ve already onboarded to prevent the creation of multiple data lakes.
      
**Q3**: Is connecting the Sentinel workspace to Defender portal (security.microsoft.com) required to use Sentinel data lake?
- Yes, all workspaces connected to Defender that are located in the same region as your primary Sentinel workspace region are attached to your Microsoft Sentinel data lake. Workspaces that aren't connected to Defender aren't attached to the data lake. See [Sentinel data lake onboarding](https://learn.microsoft.com/en-us/azure/sentinel/datalake/sentinel-lake-onboarding#changes-that-occur-when-onboarding-to-sentinel-data-lake-and-graph)
      
**Q4**: How do I connect additional workspaces?
- Note that if the Admin doing the onboarding doesn�t have read permission to all workspaces in the region, some may not get attached to the data lake. We will need customer support to open an ICM ticket in order to attach any remaining workspaces in the tenant home region to the data lake.

**Q5**: How do I disconnect workspaces?
- We will need customer support to open an ICM ticket to address this request.

**Q6**: How was the data lake region selected?
- The region for the data lake is based on the customer�s primary Sentinel workspace region connected to the Defender portal.

**Q8**: Which regions are supported? 
- See this document for the regions that are supported [regions for Microsoft Sentinel data lake](https://learn.microsoft.com/en-us/azure/sentinel/geographical-availability-data-residency#regions-supported-for-microsoft-sentinel-data-lake)

---
|Contributor Name|Details|Date(DD/MM/YYYY)|
|--|--|--|
| Amar Patel | Creator | 22/09/2025 |
| Austin Beauchamp | contributor | 03/12/2025|
| Eddie Lourinho | Added Offboarding and Known Issues | 29/01/2026|
|Quang Anh Le | Added action plan for low capacity scenario | 03/03/2026 |

---
:::template /.templates/Wiki-Feedback.md 
:::

---
:::template /.templates/Ava-GetHelp.md 
:::
