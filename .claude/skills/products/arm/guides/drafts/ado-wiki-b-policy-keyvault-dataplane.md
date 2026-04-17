---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/Key Vault Dataplane policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FKey%20Vault%20Dataplane%20policies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

In the case of Key Vault, Policy has integration on the Key Vault control plane, which allows users to enforce and audit policies on Key Vault objects (keys, secrets, certificates).

## Architecture flow

| Step | Description | Initiator | Receiver | Trigger | Logs at initiator | Logs at receiver |
|--|--|--|--|--|--|--|
| 1 | User assigns a data plane Key Vault policy definition | User | ARM | User action | Http trace on client | Get policy resource changes |
| 2 | Policy Notification Aggregator looks for policy object change events on EventServiceEntries | Policy Notification Aggregator | EventServiceEntries | On data ingestion | (OneNote internal) | N/A |
| 3 | Policy Notification Aggregator writes policy change notification to Event Grid | Policy Notification Aggregator | Event Grid | Step 2 | (OneNote internal) | ?? |
| 4 | Event Grid notifies policy change to Key Vault SLM | Event Grid | Key Vault SLM | Based on event grid subscription | **Gap** | KeyVault traces |
| 5 | Key Vault SLM uses the Policy nuget to retrieve updated policies | Key Vault SLM | Policy nuget | Step 4 | N/A | N/A |
| 6 | Policy nuget calls Microsoft.Authorization ARM APIs to retrieve updated policies, determines applicability and sends data back to Policy SLM for caching | Policy nuget | Microsoft.Authorization ARM APIs | Step 5 | KeyVault Traces | Kusto logs ?? |
| 7a | User creates a Key Vault object via the Key Vault data plane endpoint. Policies are evaluated by the Policy nuget and enforced by Key Vault SLM | User | Key Vault data plane endpoint | User action | ?? | ?? |
| 7b | Key Vault SLM triggers brownfield scan. Policy logic is evaluated by the Policy nuget with Key Vault objects payload provided by Key Vault SLM | Key Vault SLM | N/A | Step 6 | Key Vault traces | - |
| 8 | Policy nuget sends compliance data to the LogComponentEvents API. This data is written to Geneva | Policy nuget | LogComponentEvents API | Step 7a, 7b | Key Vault traces | Components Greenfield/Brownfield logs |
| 9 | Through ingestion pipeline, data is imported from Geneva to Kusto | Ingestion pipeline | N/A | No trigger, expected within 5 minutes | - | - |
| 10 | Rollup worker reads information by component from Kusto, and then writes back aggregated information to the same Kusto cluster: 1 record per resource instead of the multiple records for components returned by the Policy nuget | Rollup worker | Kusto | Timer, every 30 minutes | rollup logs | - |
| 11 | User queries compliance results and PolicyInsights RP reads the data from Kusto | User | PolicyInsights RP | User action | Http trace on client | ARM |

> ⚠️ **Limitation**: At this time, evaluation details are not available through the Policy Compliance UI for Key Vault dataplane policies.

## Support ownership

| Component | CSS ownership | SME channel | IcM Path |
|--|--|--|--|
| Policy definitions/assignments | Azure Policy | [ARM] Azure Policy Teams | Azure Policy/Azure Policy Triage On-Call |
| Policy notification aggregator | Azure Policy | [ARM] Azure Policy Teams | Azure Policy/Dataplane |
| LogComponentEvents API | Azure Policy | [ARM] Azure Policy Teams | Azure Policy/Dataplane |
| Policy nuget | Key Vault team | ?? | ?? |
| Key Vault SLM | Key Vault team | ?? | ?? |
| Key Vault data plane endpoint | Key Vault team | ?? | ?? |

## SAPs for collaboration

| Product | SAP |
|-|-|
| Azure Key Vault (select SAP based on the Key Vault object the policy targets) | Azure/Key Vault/Managing Certificates<br>Azure/Key Vault/Managing Keys<br>Azure/Key Vault/Managing Secrets |
