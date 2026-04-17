---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/ACI/ACI Troubleshooting with ASI"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FACI%2FACI%20Troubleshooting%20with%20ASI"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Troubleshooting ACI with Azure Service Insights (ASI)

## Purpose

Demonstrate how to use Azure Service Insights (ASI) to effectively troubleshoot ACI.

## Accessing ASI

Open [Azure Service Insights](https://azureserviceinsights.trafficmanager.net/) and select ACI service. Note: allow at least 15 minutes for Kusto data ingestion before searching for newly created resources. Main search table is `SubscriptionDeployments` with 120 days retention.

---

## Troubleshooting Flow

### Step 1 — Start with Container Group (CG)

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

### Step 2 — Drill Into Container Group Deployment (caas page)

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

### Step 3 — Correlation Id Search

If you have a correlationId from error message or Activity Log:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Consolidates: ARM Event Service Entries → ARM HTTP Requests → RP Incoming → RP Outgoing → SubscriptionDeployments. Use hyperlinks to navigate to caas/CG pages.

### Step 4 — Subnet Search (for BYOVNet issues)

Use full Subnet Resource Id. Useful for:
- Validating subnet CIDR for 'Subnet full' errors
- Confirming subnet is no longer in use before cleanup

### Step 5 — Atlas Cluster (for mass deployment failures)

Search by full Atlas cluster Id or name. Shows:
- Cluster metadata + SF cluster/node info
- **Cluster public IP** → check for SNAT issues (CG outbound connectivity without BYOVNet)
- Issue detectors for node issues and deployment success rate

### Step 6 — Atlas Cluster Node (for SF node-level issues)

Navigate from hyperlinks in CG Deployment page (SbzExecSFEvent tab). Maps CRP resources for SF cluster nodes.

---

## Common Investigation Scenarios

| Symptom | ASI Starting Point |
|---------|-------------------|
| CG deployment failing | CG page → Issue Detectors; caas page → Atlas RP Events |
| CG stuck deleting | caas page → issue detector `failed_stop_deployment_errors` |
| Container not running (ghost IP) | CG Deployment page → SF Execution Cluster Events |
| Missing logs/metrics | CG Metrics tab; caas Log Uploader tab |
| Outbound connectivity failure | Atlas Cluster page → cluster public IP + SNAT check |
| Mass deployment failures | Atlas Cluster page → deployment success rate; node issue detectors |
| Insufficient capacity | CG page → Insufficient Capacity detector |

## Tips

- DB icon on any widget: inspect and run the underlying Kusto query in your editor
- Feedback icon: preferred way to report ASI issues (sends email to owners with page snapshot)
- Subscription page: check quotas and deployment success rate graphs for mass deployment issues
