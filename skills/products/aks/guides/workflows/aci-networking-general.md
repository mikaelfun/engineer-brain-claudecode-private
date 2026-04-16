# AKS ACI 网络与 DNS — general — 排查工作流

**来源草稿**: ado-wiki-a-aci-troubleshooting-with-asi.md, ado-wiki-aci-troubleshooting-asi.md, ado-wiki-aci-vulnerability-container-tenant-escape.md
**Kusto 引用**: 无
**场景数**: 3
**生成日期**: 2026-04-07

---

## Scenario 1: Troubleshooting Flow
> 来源: ado-wiki-a-aci-troubleshooting-with-asi.md | 适用: 适用范围未明确

### 排查步骤

##### Step 1 — Start with Container Group (CG)

Search by full Resource Id:
```
/subscriptions/<subId>/resourceGroups/<RG>/providers/Microsoft.ContainerInstance/containerGroups/<CG>
```
Or enter CG name / FQDN (for public CGs).

**Key sections:**
- **Container Group Deployments table** → find the caas name matching issue timestamp
- **Issue Detectors** → predefined Kusto queries for known issues
- **Networking tab** → VNET/subnet links (for BYOVNet deployments)
- **Metrics tab** → Shoebox metrics for performance/missing metrics issues
- **ARM tab** → ARM frontend logs, inbound/outbound requests
- **RP tab** → RP-level logs: Incoming, Outgoing, External, Traces & Errors

##### Step 2 — Drill Into Container Group Deployment (caas page)

Search directly with caas identifier: `caas-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Key sections:**
- Provisioning times, latest node, single instance name, CG features
- **Issue Detectors** → can deflect IcM creation for common problems
- **SF Execution Cluster Events** → main SF logs with filter + custom time range
- **Container Exit Codes** → summary of exit codes from containerd
- **Containerd Events** (AME required) → main container runtime logs by container id
- **Container Stats** (AME required) → container metrics from containerd
- **Log Uploader tab** → graphs for missing LA workspace log diagnosis
- **Networking tab** → DNC Messages, Delegation Events, Atlas Init/RP Events
- **SF Container Lifecycle** → per-container Pod/Container Create Request + Hosting Events Gantt chart

##### Step 3 — Correlation Id Search

If you have a correlationId from error message or Activity Log:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Consolidates: ARM Event Service Entries → ARM HTTP Requests → RP Incoming → RP Outgoing → SubscriptionDeployments. Use hyperlinks to navigate to caas/CG pages.

##### Step 4 — Subnet Search (for BYOVNet issues)

Use full Subnet Resource Id. Useful for:
- Validating subnet CIDR for 'Subnet full' errors
- Confirming subnet is no longer in use before cleanup

##### Step 5 — Atlas Cluster (for mass deployment failures)

Search by full Atlas cluster Id or name. Shows:
- Cluster metadata + SF cluster/node info
- **Cluster public IP** → check for SNAT issues (CG outbound connectivity without BYOVNet)
- Issue detectors for node issues and deployment success rate

##### Step 6 — Atlas Cluster Node (for SF node-level issues)

Navigate from hyperlinks in CG Deployment page (SbzExecSFEvent tab). Maps CRP resources for SF cluster nodes.

---

---

## Scenario 2: Troubleshooting Flow
> 来源: ado-wiki-aci-troubleshooting-asi.md | 适用: 适用范围未明确

### 排查步骤

Container Group 页面是最常用的排查起点，类似 ASC 中显示的信息。最重要的部分是 **Container Group Deployment** 区域（包含详细部署状态）。

---

## Scenario 3: ACI Vulnerability - Container/Tenant Escape
> 来源: ado-wiki-aci-vulnerability-container-tenant-escape.md | 适用: 适用范围未明确

### 排查步骤

#### ACI Vulnerability - Container/Tenant Escape

#### Vulnerability Summary

Microsoft recently mitigated a vulnerability reported by a security researcher from Palo Alto Networks in the Azure Container Instances (ACI) that could potentially allow a user to escape the container and tenant boundary and compromise the ACI service. Our investigation surfaced no unauthorized access to customer data. Service health notifications have been sent to impacted subscriptions.

##### Do's

* Stick to the **Q&A** section below to address customer inquiries. Copy/pasting answers as applicable.
* Do reach out to the specific Teams channel with any open questions not addressed by the Q&A
* Use the 'Vulnerability Related Inquiries' Root Cause from ACI's Root Cause Tree when closing out the ticket.

##### Don'ts

* Don't provide any information about the vulnerability unless a customer directly asks by opening a support ticket.
* Don't root cause support tickets as being impacted by vulnerability. There are no known cases of impact.
* Do not answer a question that is not included in the Talking Points Sharepoint. Reach out to azcxpcrisec@microsoft.com if questions are not answered.

#### Q&A

**Q**: I didn't see an Azure Service Health notification, can Azure confirm if my subscriptions were impacted?

_Please reach out to your TA to confirm if the subscription or tenant ID provided by your customer was impacted, then use the language below._

**A (if subscription was found in impacted list)**: The following subscription(s) received a Service Health notification regarding impact. You can stay up to date on important security-related notifications by configuring Azure Service Health Alerts.

**A (if subscription wasn't found in impacted list)**: I have validated that your subscription was not found to be impacted by this issue. No action is required however, rotating secrets and/or credentials used in your ACI deployments on a regular basis is always considered a best practice.

**Q**: What anomalies and/or indicators of compromise should we look for?

**A**: Although we did not find any evidence indicating that your data or resources were impacted, Microsoft has notified all customers who had ACI instances running in same clusters as Security Researchers as a precautionary measure. As a best practice, we recommend rotating any secrets and/or credentials that were accessible to ACI containers. Checking access/audit logs belonging to secret stores, storage accounts, databases, etc. for suspicious or anomalous activity is also suggested.

**Q**: How do I know if I am on the new infrastructure or the old infrastructure?

**A**: The vulnerability has been patched, and ACI's entire infrastructure is now resilient.

**Q**: What was the high-level process for identifying and resolving the vulnerability?

**A**: A security researcher discovered and notified Microsoft of a vulnerability in ACI. Microsoft deployed an update to the ACI service on Aug 31st, 2021, mitigating the underlying issue.

**Q**: MSRC blog mentions that the vulnerability enabled users to access other customers information. Was this actual content of other ACI instances?

**A**: The vulnerability could potentially be exploited to gain control of containers belonging to other customers. Our investigation did not give any indication that this vulnerability was exploited.

**Q**: This vulnerability is 5 years old, how has this happened?

**A**: The ACI service leverages a version of Kubernetes and runtime susceptible to certain vulnerabilities (specifically CVE-2019-5736 and CVE-2018-1002102). The ACI team is migrating customers from this Kubernetes based stack to a new software stack. Microsoft has already deployed mitigations that protect against these attack vectors. ACI runs each container inside a dedicated VM using the hypervisor to isolate each container, and uses a custom Bridge Service to handle 'exec' commands rather than relying on the Kubernetes API server.

**Q**: Do any other Azure services depend on the same stack internally?

**A**: The ACI service is used by internal first parties as well as external customers. We have already notified Microsoft services which leverage ACI, performed our investigation, and found no evidence of this vulnerability being exploited.

**Q**: Is the ACI vulnerability related to the Cosmos DB vulnerability?

**A**: The issue with ACI is specific to a component in ACI service architecture which is used only by ACI service. The CosmosDB attack used a vulnerability in an unrelated visualization tool.

**Q**: Can you confirm Microsoft have adequate logs to detect any abuse going back to 2017?

**A**: Microsoft reviewed all available internal service telemetry and logs during the course of our investigation.

---
