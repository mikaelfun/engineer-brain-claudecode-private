---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Policy/Architecture/Policy RP integrations/AKS and Azure ARC enabled Kubernetes dataplane policies"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=%2F%5BARM%5D%20Azure%20Policy%2FArchitecture%2FPolicy%20RP%20integrations%2FAKS%20and%20Azure%20ARC%20enabled%20Kubernetes%20dataplane%20policies"
importDate: "2026-04-06"
type: troubleshooting-guide
---

Given that sometimes customers want to leverage Azure Policy with features that are not available on the control plane (ARM), there are scenarios where the requirement is fulfilled with data plane policies. These policies work by communicating directly to the source of the data to audit, so that Policy can still present compliance results for these scenarios.

In the case of AKS and Azure ARC enabled Kubernetes (will refer to both as Kubernetes from now on), Policy has integration by leveraging an Azure Policy agent (pod) that runs on the customer's cluster.

Documentation for this integration is available here: [[LEARN] Understand Azure Policy for Kubernetes clusters](https://learn.microsoft.com/en-us/azure/governance/policy/concepts/policy-for-kubernetes)

## Architecture flow

| Step | Description | Initiator | Receiver | Trigger | Logs at initiator | Logs at receiver |
|--|--|--|--|--|--|--|
| 1 | User assigns a data plane Kubernetes policy definition | User | ARM | User action | Http trace on client | Get policy resource changes |
| 2 | Azure Policy pod requests policies from Data Plane service (Check data policy compliance) (Triggers step 4) and writes them to etcd where they are accessible by Gatekeeper | Policy pod | Dataplane Service | Timer, every 10 minutes | Policy pod logs | ActivityCompleted and ActivityFailed logs |
| 3 | Data Plane service gets policies from Evaluation Engine | Data Plane service | Evaluation Engine | Step 3 | ActivityCompleted and ActivityFailed logs | (OneNote internal) |
| 4 | Assignment configuration is queried on demand from ARM, policy definitions are queried on the background when the cache expires | Evaluation microservice | ARM | When cache expires, every 30 minutes | - | - |
| 5a | User creates a pod, policies are evaluated and enforced by Gatekeeper. **Greenfield flow ends here** | User | Cluster endpoint | User action | Input object (call made by customer) | Gatekeeper pod logs |
| 5b | Gatekeeper scans the resources to determine compliance and writes results to etcd | Gatekeeper | Pods in cluster | Timer, every 10 minutes | Constraints logs | N/A |
| 6 | Policy pod reads evaluation results from etcd and sends data to Data Plane service. This data is written to Geneva | Policy pod | Data Plane service | Timer, every 15 minutes | Policy pod logs | Components Brownfield logs |
| 7 | Through ingestion pipeline, data is imported from Geneva to Kusto | Ingestion pipeline | N/A | No trigger, expected within 5 minutes | - | - |
| 8 | Rollup worker reads information by component from Kusto, and then writes back aggregated information to the same Kusto cluster: 1 record per resource instead of the multiple records for components returned by the Policy pod | Rollup worker | Kusto | Timer, every 15 minutes | rollup logs | - |
| 9 | User queries compliance results and PolicyInsights RP reads the data from Kusto | User | PolicyInsights RP | User action | Http trace on client | ARM |

## Support ownership

| Component | CSS ownership | SME channel | IcM Path |
|--|--|--|--|
| Policy definitions/assignments | Azure Policy | [ARM] Azure Policy Teams channel | Azure Policy/Azure Policy Triage On-Call |
| Policy evaluation microservice | Azure Policy | [ARM] Azure Policy Teams channel | Azure Policy/Azure Policy Triage On-Call |
| Data plane service | Azure Policy | [ARM] Azure Policy Teams channel | Azure Policy/Dataplane |
| Azure Policy addon pod | AKS and Arc teams | N/A (Collab with AKS or Arc teams) | Azure Policy/Dataplane |
| Gatekeeper pod | AKS and Arc teams | N/A (Collab with AKS or Arc teams) | N/A (Collab with AKS or Arc teams) |
| Rego policies (Best effort) | AKS and Arc teams | N/A (Collab with AKS or Arc teams) | N/A (Collab with AKS or Arc teams) |

## SAPs for collaboration

Both teams have ownership on this service, so the expectation is not that we move cases over these teams, but instead, keep ownership of the cases and cut collaborations.

| Product | SAP | TSG |
|-|-|-|
| Azure Arc enabled Kubernetes (Microsoft.ContainerService/connectedClusters) | Azure/Azure Arc enabled Kubernetes/Issues applying cluster configurations using Azure policy | |
| Azure Kubernetes Service (AKS) (Microsoft.ContainerService/managedClusters) | Azure/Kubernetes Service (AKS)/Extensions, Policies and Add-Ons/Azure policy add-on | Azure Policy Overview (AKS Containers Wiki) |

## Additional information for custom policies

- Authoring Rego policies is **out of CSS support scope**. Although we do it today for regular policies, the Rego language is not something Microsoft owns, therefore it is out of our scope.
- Troubleshooting Rego policies and Rego language syntax issues falls under AKS' team scope. However, at this time they will likely need to escalate to their PG right away, since training has not been delivered.
