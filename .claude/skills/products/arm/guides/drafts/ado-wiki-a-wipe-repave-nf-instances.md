---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Nexus/Customer Scenarios/Wipe and Repave Procedure for NF Instances"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Nexus/Customer%20Scenarios/Wipe%20and%20Repave%20Procedure%20for%20NF%20Instances"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Wipe and Repave Procedure for NF Instances

_Last full review: 28-July-2025_
**Created by: Delkis Rivas**

## Purpose

Standard operating procedure for performing a wipe and repave on Network Fabric (NF) instances. Includes exception handling and troubleshooting guidance for CSS without requiring immediate escalation.

## Team Involvement

- **CSS**: Initiating process, validating customer readiness, running diagnostics, coordinating communication
- **Product Team**: Backend operations (resource cleanup, automation execution, telemetry validation). Wipe activity owned by DE team.

## Standard Procedure

### 1. Pre-Validation
- Confirm instance eligible for wipe and repave
- Ensure no active workloads or dependencies running
- Validate instance is not in maintenance or upgrade state
- Check for open ICMs or SRs

### 2. Resource Cleanup
- Patch L3 ISD to remove consuming resources
- Delete orphaned CSN CRs (Cloud Service Network Custom Resources)
- Confirm no residual resources in failed/inconsistent state

### 3. Validation
- Use telemetry and health dashboards to verify instance is clean
- Confirm with stakeholders that instance is ready

### 4. Execution
- **Initiate wipe and repave** (Product Team)
  - Deprovision instance from fabric
  - Wipe persistent storage
  - Rebuild using latest image
  - Inputs: Instance ID, Region, NAKS cluster name, pre-validation confirmation
- **Monitor logs and telemetry** (Product Team)

### 5. Closure
- Confirm successful repave and instance health
- Communicate resolution to stakeholders
- Document and close support request

## Roles and Responsibilities Matrix

| Task | Responsible | Notes |
|------|------------|-------|
| Confirm eligibility | CSS | Uses internal tools |
| Confirm no active workloads | Customer (via CSS) | CSS coordinates |
| Validate not in maintenance | Product Team | Internal state transitions |
| Check open ICMs/SRs | CSS | Reviews support queues |
| Patch L3 ISD | Product Team | Requires elevated access |
| Delete orphaned CSN CRs | Product Team | Internal APIs/scripts |
| Telemetry validation | Product Team | Internal dashboards |
| Confirm readiness | CSS | Based on PT input |
| Execute wipe/repave | Product Team | Internal automation |
| Monitor logs | Product Team | Real-time validation |
| Confirm health | Product Team | Final health check |
| Communicate resolution | CSS | Updates customer/case |

## Exception Handling

### Scenario A: Maintenance Mode Not Reflected in Portal

**Symptoms:** Instance appears active in Azure portal despite being in maintenance mode internally.

**Root Cause:** Internal state transitions are not exposed in the Azure portal UI.

**CSS Steps:**
1. Use internal tools (Fabric Control Plane / Instance State Viewer) to verify actual state
2. Cross-check with telemetry logs to confirm maintenance mode
3. Notify customer that portal may not reflect current state (known limitation)
4. Document discrepancy in case notes
5. File low-priority ICM for tracking; proceed with wipe if internal state is valid

### Scenario B: L2 Network Creation Failure

**Symptoms:** L2 network creation fails with errors related to Kubernetes cluster connectivity.

**Root Cause:** Hybrid connection agent is not connected or NAKS cluster is unhealthy.

**CSS Steps:**
1. Identify target NAKS cluster from instance metadata (e.g., `austx45`, `mtrn515`)
2. Run diagnostics on customer NAKS cluster:
   - `kubectl get nodes`
   - `kubectl get pods -A`
3. Check hybrid connection agent status; restart if unresponsive
4. Validate required ports are open and DNS resolution functional
5. Retry L2 network creation using internal provisioning tool
6. If persists, collect logs and escalate with detailed repro steps

## Reference Cases

- **AUSTX45** (2411110010001789): Standard cleanup and repave. L3 ISD patched, orphaned CSN CRs deleted, successful repave.
- **AUSTX85** (2408140010005551): Lab cleanup before repave. Internal team completed cleanup, customer confirmed closure.
- **AUSTX45** (2601150040005918): Instance wipe tracked via ICM 21000000858386.

## Contacts and Escalation

- **Support Engineering (CSS)**: Service Request owner
- **Product Escalation**: Nexus Network Fabric / Network Fabric Triage
