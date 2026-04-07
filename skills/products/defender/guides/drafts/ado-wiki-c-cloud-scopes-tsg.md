---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Defender for Cloud:/Next-Gen - Defender for Cloud/Cloud Scopes/[TSG] - Cloud Scopes"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud?pagePath=%2FNext-Gen%20-%20Defender%20for%20Cloud%2FCloud%20Scopes%2F%5BTSG%5D%20-%20Cloud%20Scopes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Cloud Scopes

## Training sessions
|Date (DD/MM/YYYY)|Session Recording|Presenter|
|--|--|--|
| 20/10/2025 | [Microsoft Defender for Cloud - Cloud Scopes & Unified RBAC in Defender Portal](https://platform.qa.com/resource/mdc-next-gen-cloud-scopes-unified-rbac-in-defender-portal-1854/?context_id=12891&context_resource=lp) | Keren Carmeli |

## Overview

The Next-Gen MDC experience introduces unified cloud scopes and role-based access control (RBAC) to streamline access management across multi-cloud environments. Key benefits include:
- Decoupling security permissions from cloud provider resource permissions
- Granular access to specific experiences (e.g., incidents, recommendations)
- Support for multi-cloud primitives (Azure, AWS, GCP, containers, etc.)
- Unified management interface for scopes and RBAC assignments in the Defender portal
- Global filtering that persists scope selection across experiences

### Supported Primitives for Cloud Scopes

Cloud scopes can be defined using the following primitives:
- **Azure/Subscription**
- **AWS/Organization (MasterAccount)**
- **AWS/MasterAccount**
- **AWS/Account**
- **GCP/Organizations**
- **GCP/Project**
- **GitHub/Organization**
- **GitLab/Projects**
- **AzureDevOps/Organization**
- **Dockerhub/container**
- **JFrog/Organization**
- **Containers/Namespace**
- **Containers/Cluster**
- **Containers/Registry**
- **Containers/Repository**

A cloud asset can belong to multiple scopes, allowing flexible segmentation by business logic.

## Common scenarios and Troubleshooting

### Creating and Managing Cloud Scopes

- **Who can create scopes?** Only users with Global Administrator or Security Administrator roles in Microsoft Entra ID (tenant level) can create, modify, or delete cloud scopes.
- **Supported primitives:** Scopes can include Azure subscriptions, AWS accounts/organisations, GCP projects/organisations, GitHub/GitLab organisations, container clusters/namespaces, and more. A cloud asset can belong to multiple scopes.
- **CRUD operations:** Use the Defender portal scope management experience or public APIs to create, update, or delete scopes. Scopes are static lists; new resources must be manually added unless future dynamic features are enabled.

### Assigning RBAC Permissions

- **Unified RBAC:** Permissions are assigned to users/groups for specific scopes, enabling access only to relevant data and experiences. RBAC supports granular assignment for experiences such as cloud inventory, incidents, recommendations, and dashboards.
- **Permission groups:**
  - _Security operations_: Read/manage incidents, alerts, inventories
  - _Security posture_: Read/manage vulnerability management, exposure management, recommendations, secure score
- **Role assignment:** Assign roles to users/groups and link them to one or more cloud scopes. Assignments can be made for multiple experiences and scopes as needed.

### Filtering and Data Segmentation

- **Global filter:** The Defender portal includes a global filtering component for scopes. Once a scope is selected, it persists across navigation, filtering data in all relevant experiences (e.g., exposure management, cloud inventory, alerts).
- **Device groups vs. cloud scopes:** VMs may be visible in both device inventory (via device groups) and cloud inventory (via cloud scopes). Two permission sets control access to VMs and alerts.

### Telemetry to view existing scopes and their mapping

```kql
cluster("https://ascentitystoreprdus.centralus.kusto.windows.net").database("MDCGlobalData").GetCurrentNativeEnvironmentToCloudScopeMapping
| where MdcTenantId in ("{TenantId}")
| where NativeEnvironmentScopeType in ("AzureSubscription", "AwsMasterAccount", "GitHubOrganization", "AwsAccount", "AzureDevOpsOrganization", "GcpProject", "DockersHubOrganization", "GitLabGroup", "JFrogArtifactory", "GcpOrganization")
| project CloudScopeId, DisplayName, NativeEnvironmentScopeId, NativeEnvironmentScopeType
```

## Escalating to Product Group (PG)

Refer to the IcM escalation path lookup page:
- [Microsoft Defender for Cloud - Escalation Path Lookup](https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Defender%20for%20Cloud/7132/Microsoft-Defender-for-Cloud-(MDC)-vTeams-templates-and-categories-mapping)

Before creating the IcM, make sure you have exhausted all the steps in this document.
- Make sure to collect:
  - Tenant ID
  - Session ID
  - User object ID
  - All 3 are obtainable from "Settings -> Microsoft Defender XDR -> Session details" page
