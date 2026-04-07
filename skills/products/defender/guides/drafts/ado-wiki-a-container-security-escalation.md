---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Defender for Cloud/MDC Escalations and procedures/Security Alerts & Containers Security Escalations (RomeDetection)/CRI handling process for CSS/Container Security escalation to Product Group - ICM ticket escalation process"
importDate: "2026-04-06"
type: troubleshooting-guide
---


# Microsoft Defender for Cloud (MDC) Containers Escalation Checklist

Based on Customer Reported Incident (CRI) investigations, please make sure to check these topics and attempt to resolve the issue before creating the Customer Reported Incident (CRI).

| Complaint | Issue Description | Things to Check | Steps to Resolve/Mitigate | Related CRI/Work Item (WI) |
| --------- | ----------------- | --------------- | ------------------------- | -------------------------- |
| Defender for Cloud Extension failure on Azure Kubernetes Service (AKS) hybrid clusters | Defender extension installation was blocked by Policy extension | **1. If Gatekeeper exists**: <br> Go to the AKS cluster - Services and ingresses - gatekeeper-webhook-service <br> **2. Resource lock**: <br> Execute PowerShell command `Get-AzResourceLock` to find | Disable the Gatekeeper service, until a permanent fix is available | [CRI #364031691](https://portal.microsofticm.com/imp/v3/incidents/details/364031691/home) |
| microsoft-defender-publisher is in a CrashLoopBackOff | Tivan agent crash due to missing workspace. Might throw an error like: `'error encountered during client initializationPost \\'https://<wsid>.oms.opinsights.azure.com/AgentService.svc/LinuxAgentTopologyRequest\\': http: ContentLength=1860 with Body length 0'` | 1. Check to which workspace Tivan is reporting: Go to Resource Explorer, expand *[Microsoft.ContainerService/managedClusters] MyCluster* and search for *logAnalyticsWorkspaceResourceID* <br> 2. Check if the above workspace exists. <br> If the workspace does not exist, it might have been removed accidentally. | [Publisher pod is restarting - Troubleshooting Guide (TSG)](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2538/-TSG-Publisher-pod-is-restarting) | [CRI #349423087](https://portal.microsofticm.com/imp/v3/incidents/details/349423087/home)<br>Support Request (SR) #2210190040007484 |
| Defender publisher pods restarting | Agent restarts due to errors reaching Log Analytics | Ensure local authentication for agent is enabled, see [Azure Monitor Authentication](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/azure-ad-authentication-logs?tabs=azure-cli) | Enable local authentication | [Incident-553435740 Details - Incident Case Management (ICM)](https://portal.microsofticm.com/imp/v5/incidents/details/553435740/summary) |
| Image scan | | [Image scan escalation process](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/2557/-TSG-ACR-VA) |
| DCSPM-for-K8s-agentless | | [DCSPM-for-K8s-agentless](/Defender-for-Cloud/Workload-Protections/Defender-for-Containers/DCSPM-for-K8s-agentless) |

Once you have completed the checklist and still face the issue, proceed to escalate the incident to the team.

# Escalation to Engineering Team

Use one of the templates below, choose the support topic relevant for the case:

| Support Topic | Template |
|---------------|----------|
| Container image scanning (Azure Container Registry (ACR)) vulnerability assessment | [D293T2](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=D293T2) |
| Containers posture | [Kh1w3G](https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=Kh1w3G) |

