---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/Workload Protections/Defender for Containers/Defender for cloud admission controller/[TSG] Agent was not installed in the cluster"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=/Defender%20for%20Cloud/Workload%20Protections/Defender%20for%20Containers/Defender%20for%20cloud%20admission%20controller/%5BTSG%5D%20Agent%20was%20not%20installed%20in%20the%20cluster"
importDate: "2026-04-06"
type: troubleshooting-guide
---

**Overview**

We will investigate the auto installation flow, to track down the root cause of unsuccessful agent installation process.

**Architecture:**

The auto installation process is comprised of the following components
| Component | Description | Owning Team |
| --- | --- | --- |
| MDC Portal | The MDC Dashboard where we enable the plans, define the rules, etc. | MDC Policy Team |
| Pricing Service | Responsible for assigning the relevant roles in the customer's environment, and enable the security plans. | K8s Secure Gating Team |
| Provisioning Service | Perform the installation of the agent inside the customers' clusters. | K8s Secure Gating Team |
| Discovery Service and Entity Store DB | Discovers the resources in the customers' environment, including the AKS, and saves it inside the entity store DB. | K8s Secure Gating Team |


**The installation steps - steps to verify are included:**

**The agent is installed only on AKS 1.31 and above.**

1. The user enables all SecurityGating toggles as described in the sanity check page (parent page of this section).
2. Once enabled, the Pricing service assign to the customer's subscription the _Managed Identity Federated Identity Credential Contributor_ role alongside the _Kubernetes Agent Operator_ role.
To verify that, go to the customer's subscription, on the left pane, choose _Access control (IAM)_ and make sure the role above are assigned (use the filters).

3. Up to 6 hours from the enablement in the dashboard, the agent should be installed. Let's move directly to the end of the flow and look at the Provisioning Service logs:

**Kusto Query:**
```kql
cluster('mdcprd.centralus.kusto.windows.net').database('Detection').Span  
| where ingestion_time() > ago(3d)  
| where k8s_deployment_name contains "mcagentprovision"  
| where * contains "SubscriptionId"  
| where * contains "ClusterName"  
| project env_time, env_dt_traceId, name, success, OperationResult, customData, resultDescription, k8s_deployment_name
```

You should see logs related to the cluster of the customer. Look for logs with _success_ column = false and see the exception.
