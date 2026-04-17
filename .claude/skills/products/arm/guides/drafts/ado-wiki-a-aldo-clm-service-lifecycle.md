---
source: ado-wiki
sourceRef: "Supportability/AzureAdaptiveCloud/AzureAdaptiveCloud.wiki:/Azure Local Disconnected Operations/Components/Layer 2 - Runtime/Local Services/Service Lifecycle Mgmt/Clustered-application Lifecycle Manager (CLM)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAdaptiveCloud/_wiki/wikis/AzureAdaptiveCloud.wiki?pagePath=/Azure%20Local%20Disconnected%20Operations/Components/Layer%202%20-%20Runtime/Local%20Services/Service%20Lifecycle%20Mgmt/Clustered-application%20Lifecycle%20Manager%20(CLM)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

CLM is the Arc-A control plane front-end for all clustered services.

- Runs as an agent hosted by ALM (today on 1-node).
- Reuses the functionality of other agents hosted by ALM.

Most Azure services run as containers in Arc-A, but a small subset are not ready to support containerization. CLM supports clustered services running as either containers or processes.

CLM's input is one or more declarative service manifests, such as the previous ACR example. (i.e., It follows the aforementioned declarative DevOps principle.) CLM shreds each declarative document into pieces and then aggregates those pieces into buckets of desired state.

Key architectural points:
- CLM is the central orchestrator for service lifecycle in ALDO (Azure Local Disconnected Operations)
- Uses declarative manifests as input (similar to Kubernetes manifests)
- Aggregates manifest pieces into desired state buckets
- Works with both containerized and process-based services
- Hosted by ALM (Agent Lifecycle Manager)
