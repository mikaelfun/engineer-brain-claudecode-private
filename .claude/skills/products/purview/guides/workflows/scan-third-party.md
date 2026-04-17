# Purview 第三方数据源扫描 — 排查工作流

**来源草稿**: `ado-wiki-a-aws-data-sources.md`, `ado-wiki-a-current-purview-governance-sap.md`, `ado-wiki-a-lab-setup-new-environment.md`, `ado-wiki-a-m365-tenant-access.md`, `ado-wiki-a-saps-skillgroup-mapping.md`, `ado-wiki-aws-s3-scan-failure-diagnostic.md`, `ado-wiki-salesforce-scan-troubleshooting.md`
**Kusto 引用**: 无
**场景数**: 18
**生成日期**: 2026-04-07

---

## Scenario 1: AWS Data Sources for Purview Scanning
> 来源: ado-wiki-a-aws-data-sources.md | 适用: 未标注

### 排查步骤
Currently Purview scanning supports 2 AWS data types:

`[来源: ado-wiki-a-aws-data-sources.md]`

---

## Scenario 2: 1. Amazon S3 Bucket
> 来源: ado-wiki-a-aws-data-sources.md | 适用: 未标注

### 排查步骤
- Storage service similar to Azure Blob Storage
- Contains unstructured data
- Register via Data sources > Amazon S3

`[来源: ado-wiki-a-aws-data-sources.md]`

---

## Scenario 3: 2. AWS Account (Multi-resource scan)
> 来源: ado-wiki-a-aws-data-sources.md | 适用: 未标注

### 排查步骤
- Scans all S3 buckets in a certain AWS account
- Register via Data sources > AWS account
- Selecting specific buckets to scan from the account is a feature about to release

`[来源: ado-wiki-a-aws-data-sources.md]`

---

## Scenario 4: Below is a table of the current SAP tree for Microsoft Purview Governance
> 来源: ado-wiki-a-current-purview-governance-sap.md | 适用: 未标注

### 排查步骤
| L1 | L2 | L3 | L4 |
| --- | --- | --- | --- |
| Azure | Purview | Assets | Assets missing or not found |
| Azure | Purview | Assets | Creating or updating assets via API and SDK |
| Azure | Purview | Assets | Deleted Asset not going away |
| Azure | Purview | Assets | Duplicate Assets in the Catalog |
| Azure | Purview | Assets | Editing and Updating Assets |
| Azure | Purview | Assets | Resource Sets grouping is incorrect |
| Azure | Purview | Assets | Wrong Asset schema |
| Azure | Purview | Auditing | Auditing and Diagnostics issues |
| Azure | Purview | Auditing | Eventhub configuration |
| Azure | Purview | Billing & pricing | - |
| Azure | Purview | Catalog Management | Classic Types |
| Azure | Purview | Catalog Management | Data products catalog |
| Azure | Purview | Catalog Management | Governance domains |
| Azure | Purview | Catalog Management | Other |
| Azure | Purview | Catalog Management | Requests |
| Azure | Purview | Classification and Labeling | Creating or updating classifications via API or SDK |
| Azure | Purview | Classification and Labeling | Deleting or removing a classification |
| Azure | Purview | Classification and Labeling | Missing or incorrectly classified assets |
| Azure | Purview | Classification and Labeling | Missing or incorrectly labeled assets |
| Azure | Purview | Data Share | Attach or re-attach a share |
| Azure | Purview | Data Share | Create, view, edit or delete a share |
| Azure | Purview | Discovery | Data Assets Search |
| Azure | Purview | Discovery | Data Products Search |
| Azure | Purview | Discovery | Enterprise Glossary |
| Azure | Purview | Discovery | Other |
| Azure | Purview | Health management | Actions |
| Azure | Purview | Health management | Controls |
| Azure | Purview | Health management | Data Quality |
| Azure | Purview | Health management | Other |
| Azure | Purview | Health management | Reports |
| Azure | Purview | Insights & Reports | Assets insights report issues |
| Azure | Purview | Insights & Reports | Classifications insights report issues |
| Azure | Purview | Insights & Reports | Glossary insights report issues |
| Azure | Purview | Integration Runtime | Kubernetes Self-Hosted Integration Runtime issues |
| Azure | Purview | Integration Runtime | Unable to use AWS IR |
| Azure | Purview | Integration Runtime | Unable to use Managed VNET IR |
| Azure | Purview | Integration Runtime | Windows Self-Hosted Integration Runtime issues |
| Azure | Purview | Lineage | ADF, Synapse and AML pipelines lineage issues |
| Azure | Purview | Lineage | Asset lineage is incorrect |
| Azure | Purview | Lineage | Assets do not have lineage |
| Azure | Purview | Lineage | Connecting to lineage sources |
| Azure | Purview | Lineage | Custom lineage via API and SDK |
| Azure | Purview | Lineage | Scan lineage missing or incorrect |
| Azure | Purview | Privacy | - |
| Azure | Purview | Purview Administration | Access Control |
| Azure | Purview | Purview Administration | Account and Portal Private Endpoint |
| Azure | Purview | Purview Administration | Account Provision and Deletion |
| Azure | Purview | Purview Administration | Collections Issues |
| Azure | Purview | Purview Administration | SDK or API for Account Management |
| Azure | Purview | Scan | Data Source Registration Issues |
| Azure | Purview | Scan | Incorrect scan insights report |
| Azure | Purview | Scan | Rulesets grouping not working |
| Azure | Purview | Scan | Scan configuration and setup |
| Azure | Purview | Scan | Scan did not discover assets |
| Azure | Purview | Scan | Scan did not discover classifications |
| Azure | Purview | Scan | Scan did not run when I expected it to |
| Azure | Purview | Scan | Scan failing with error |
| Azure | Purview | Scan | Scan Performance and Scaling |
| Azure | Purview | Scan | Unable to create or start scan with SDK or API |
| Azure | Purview | Scan | Unable to scan AWS S3 or VPC |
| Azure | Purview | UX | Data Catalog UX Issues |
| Azure | Purview | UX | General UX Issues |
| Azure | Purview | Workflow | Approval & Task |
| Azure | Purview | Workflow | SDK or API for Workflows |
| Azure | Purview | Workflow | Workflow Authoring issues |
| Azure | Purview | Workflow | Workflow not running |
| Azure | Purview | Workflow | Workflow UI not working |

`[来源: ado-wiki-a-current-purview-governance-sap.md]`

---

## Scenario 5: Pre-requisite
> 来源: ado-wiki-a-lab-setup-new-environment.md | 适用: 未标注

### 排查步骤
1. Join security group **adflabenvgrp** via IDWeb
2. Setup Cloud Shell: run `Dismount-CloudDrive` if popup does not show
3. Choose PowerShell option
4. Click "Show advanced settings"
5. Setup with File Share "adflabsfileshare" (must match exactly)

`[来源: ado-wiki-a-lab-setup-new-environment.md]`

---

## Scenario 6: Steps
> 来源: ado-wiki-a-lab-setup-new-environment.md | 适用: 未标注

### 排查步骤
1. Run setup script in Cloud Shell after prerequisites complete
2. Follow on-screen instructions for resource provisioning
3. Lab environment includes Purview account and connected data sources

> Note: This is an archived guide. Lab setup procedures may have changed.

`[来源: ado-wiki-a-lab-setup-new-environment.md]`

---

## Scenario 7: Activate Azure Credit - Visual Studio Subscription (FTE)
> 来源: ado-wiki-a-m365-tenant-access.md | 适用: 未标注

### 排查步骤
1. Log into https://my.visualstudio.com/ with alias@microsoft.com
2. Choose Azure $150 monthly credit and click Activate
3. Separate from Internal Azure Subscription - can have both

`[来源: ado-wiki-a-m365-tenant-access.md]`

---

## Scenario 8: Azure AD Default Directory
> 来源: ado-wiki-a-m365-tenant-access.md | 适用: 未标注

### 排查步骤
- Activating Azure Subscription auto-creates a Default Azure AD tenant (Free tier)
- Check tenant info: Azure Portal > Azure Active Directory > Overview

`[来源: ado-wiki-a-m365-tenant-access.md]`

---

## Scenario 9: Create Global Administrator account
> 来源: ado-wiki-a-m365-tenant-access.md | 适用: 未标注

### 排查步骤
- Required for full tenant administration during testing

> Note: This is an archived guide. Procedures may have changed.

`[来源: ado-wiki-a-m365-tenant-access.md]`

---

## Scenario 10: Purview Governance Skill Taxonomy
> 来源: ado-wiki-a-saps-skillgroup-mapping.md | 适用: 未标注

### 排查步骤
| Skill Group | Skills |
|-------------|--------|
| SkG: Administration | Deployment, Access Control, Data Policy, Security, DR/HA, Sensitivity Label, Networking |
| SkG: Data Map | Glossary, Lineage, Assets, Collections, Classification, SDK/REST API, Resource Sets |
| SkG: UX | Data Catalog UX, Workflow UX, Data Source UX, Scan UX, AAD, SDK/REST API |
| SkG: Data Estate Insights | Report Refresh, Insights, Labeling Reports, Classification Reports, Report Summary |
| SkG: Data Source | Azure connection, On-prem connection, Third party connection, Ingestion, Networking |
| SkG: Scan | Azure IR, Managed Vnet IR, SHIR, Scan Performance, Scan Rulesets, Resource Sets, Networking |
| SkG: Workflow | Authoring, Approval/Task, Workflow Runs |
| SkG: Discovery | Discovery |
| SkG: Catalog Management | Catalog Management |
| SkG: Health Management | Health Management |
| SkG: Billing | Billing |

All under Skill Domain: SkD: Purview Governance / SkSD: Purview Governance.

`[来源: ado-wiki-a-saps-skillgroup-mapping.md]`

---

## Scenario 11: Steps
> 来源: ado-wiki-aws-s3-scan-failure-diagnostic.md | 适用: 未标注

### 排查步骤
1. Open an ICM using the [template](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Kul1M2)

2. Collect the Scan Run ID from the Purview UI:
   - Navigate to the scan history
   - Copy the Run ID from scan diagnostics

3. Get Multi-cloud PipelineId and ActivityId via Kusto:

```kql
// Execute: https://babylon.eastus2.kusto.windows.net/MultiCloud
MultiCloudIRLog
| where Message contains "<RunIdFromUI>" and Message contains "PipelineId"
| extend parsedMessage = parse_json(Message)
| extend PipelineId = parsedMessage["PipelineId"]
| project ActivityId, PipelineId
```

4. Include all collected data in the IcM ticket for escalation.

`[来源: ado-wiki-aws-s3-scan-failure-diagnostic.md]`

---

## Scenario 12: Key Differences from Other Connectors
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. Uses Salesforce REST API (app created in Salesforce, NOT Azure)
2. Key Vault Credential uses "Consumer Key"
3. Purview Credential requires 2 Key Vault secrets; configuration differs for SHIR, AIR, and Salesforce Firewall scenarios

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 13: Scan Fails — Data Collection
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. UI Error message
2. Scan ID
3. SHIR Report ID (if using SHIR)
4. Browser Network logs
5. Network Configuration

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 14: Troubleshooting Decision Tree
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. Check Kusto logs for errors
2. Check Network logs for errors
3. If error related to permissions/URL/connection → Test with cURL:

```bash
curl -v -k https://[SALESFORCE ENDPOINT]/services/oauth2/token \
  -d "grant_type=password" \
  -d "client_id=[SALESFORCE CONSUMER KEY]" \
  -d "client_secret=[SALESFORCE SECRET]" \
  -d "username=[SALESFORCE USERID]" \
  -d "password=[SALESFORCE PWD]"
```

- **cURL fails** → Issue is Salesforce configuration → Collect Salesforce Info
- **cURL succeeds** → Issue is Purview → Collect KeyVault Info

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 15: Collect Salesforce Information
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. App Permissions
2. App IP Restrictions
3. Verify OAuth is enabled
4. Network Configuration

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 16: Collect KeyVault Information
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. Confirm Purview Credential configured correctly:
   - **Secret 1**: Salesforce User ID password
     - If SHIR machine IP in Salesforce trusted IP ranges → just password
     - Otherwise → concatenate password + security token
   - **Secret 2**: Consumer Key with Consumer Secret
2. Confirm Key Vault has necessary permissions
3. Network Configuration

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 17: Known Limitations
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
1. Purview does not support friendly names for Salesforce objects → column name discrepancies
2. No Atlas API capability to retrieve display names for Salesforce objects
3. No direct mapping solution; workaround: add display names in asset descriptions
4. Deleted Salesforce objects not auto-removed by subsequent scans

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---

## Scenario 18: MRC Notice
> 来源: ado-wiki-salesforce-scan-troubleshooting.md | 适用: 未标注

### 排查步骤
Use manager recovery process if Salesforce support was previously involved by the customer without resolution.

`[来源: ado-wiki-salesforce-scan-troubleshooting.md]`

---
