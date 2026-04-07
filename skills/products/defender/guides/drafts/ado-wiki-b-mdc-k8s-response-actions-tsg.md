---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/Response Platform/[TSG] - MDC Cloud-Native Response Actions in XDR on Kubernetes (K8s) Pods"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FNext-Gen%20-%20Defender%20for%20Cloud%2FResponse%20Platform%2F%5BTSG%5D%20-%20MDC%20Cloud-Native%20Response%20Actions%20in%20XDR%20on%20Kubernetes%20%28K8s%29%20Pods"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# TSG - MDC Cloud-Native Response Actions in XDR on Kubernetes (K8s) Pods

## Background
MDC Response service is an integrated service with XDR that provides customers the ability to trigger actions on their K8s pods to help with security attack containment.

**Important**: This feature is only available in the Microsoft Defender portal (NOT in Azure Portal).

## Required Kusto Access
Refer to [MDC CSS Access Permissions for Kusto](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2915/MDC-CSS-Access-Permissions-for-Kusto-and-other-services)

## Troubleshooting Dashboards
| Name | Access |
|--|--|
| [MDC Response Platform Dashboard](https://dataexplorer.azure.com/dashboards/54a5be64-4790-47b0-aea5-b9308ab199ec) | [IDWeb SG - SCIM S&C Cloud Protection IS](https://idweb.microsoft.com/IdentityManagement/aspx/common/GlobalSearchResult.aspx?searchtype=e0c132db-08d8-4258-8bce-561687a8a51e&content=SCIM%20S%26C%20Cloud%20Protection%20IS) |

## Symptom
Response action failed, either during submission or post submission.

## Investigation Steps

### Step 1: Check Span Table for Errors
Go to [Kusto TeamX Telemetry](https://dataexplorer.azure.com/clusters/mdcprd.centralus/databases/Teamx):

```kql
Span
| where TIMESTAMP > ago(1d) // adjust date per case details
| where OperationResult == "Failure"
| where name in ("MtpActionBL.GetActionStatusAsync", "MtpActionBL.CreateMtpActionAsync", "AgentlessMessageHandler.HandleMessageAsync")
```

### Step 2: Identify Failure Type

| Failure Operation | Impact |
|--|--|
| **MtpActionBL.GetActionStatusAsync** | User cannot properly see available actions in the UI |
| **MtpActionController.CreateMtpActionAsync** | Action could not be submitted for execution |
| **AgentlessMessageHandler.HandleMessageAsync** | Action could not be executed successfully |

### Step 3: Use Dashboard for Tracing
For CreateMtpActionAsync actions, use the MDC Response Platform Dashboard. Put the `env_dt_traceId` value in the dashboard param to see the entire execution chain in both MDC response service and its upstream dependencies.

## Common Issues & Mitigation

| Issue | Mitigation |
|--|--|
| Insufficient URBAC permissions (CreateMtpActionAsync / GetActionStatusAsync) | Ask customer to ensure MDC workload "Response(Manage)" permission is assigned |
| Authentication issues in agentless platform (HandleMessageAsync) | For AKS: escalate to engineering. For non-AKS: re-run security connector scripts from the connectors pane |
| Unsupported Kubernetes version by AKS | Run `az aks get-versions --location [location] --output table` to check supported versions |
| Missing network enforcer | Ensure network plugin/enforcer is enabled on the K8s cluster (prerequisite for isolate/unisolate pod network) |
| Action on non-existent pod | Pod does not exist; action will fail. Verify pod status with customer |

## Escalation to PG
Before creating IcM:
1. Exhaust all troubleshooting steps in this document
2. Collect detailed reproduction steps
3. Refer to [MDC Escalation Path Lookup](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/7132/Microsoft-Defender-for-Cloud-(MDC)-vTeams-templates-and-categories-mapping)

## Support Boundaries
Both MDC PG and CSS team support this feature end to end. Customers should create tickets in the M365 portal (not Azure portal). Tickets may fall under XDR/MDE queue - reroute to MDC:

| Product Family | Product | Support Topic |
|---|---|---|
| Azure | Microsoft Defender for Cloud | Azure\Microsoft Defender for Cloud\Defender CSPM plan\Agentless container posture |

## References
- [Investigate and respond to container threats in Defender portal](https://learn.microsoft.com/en-us/defender-xdr/investigate-respond-container-threats)
- [Restrict Pod Access Response Action (internal)](https://microsoft.sharepoint.com/sites/roadmaphub/SitePages/Threat%20Protection/Restrict%20Pod%20Access%20-%20Response%20Action.aspx)
- [Cloud Native Response Actions training](https://platform.qa.com/resource/css-training-cloud-native-response-actions-for-pod-1854/)
