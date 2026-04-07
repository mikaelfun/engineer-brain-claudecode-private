---
source: ado-wiki
sourceRef: "ASIM-Security/Infrastructure Solutions/Sentinel:/Microsoft Sentinel Wiki/Sentinel Repositories/[TSG] - Azure Sentinel Repositories"
sourceUrl: "https://dev.azure.com/ASIM-Security/Infrastructure%20Solutions/_wiki/wikis/Sentinel?pagePath=%2FMicrosoft%20Sentinel%20Wiki%2FSentinel%20Repositories%2F%5BTSG%5D%20-%20Azure%20Sentinel%20Repositories"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Known Limitations

Always refer to the public docs for the most up to date information.

| Known Limitation | What | Why/Available workaround |
| --- | --- | --- |
| Deleting Content | if any content templates are removed from the source repository, their corresponding content will not be removed from the Azure Sentinel UX | Design Limitation. The deployed content can be deleted from UX after its deletion from the source control, or directly through the REST API. If you prefer to do everything from the repository as opposed to the workspace, you can choose to disable content such as analytic rules instead of deleting them. |
| Authorizing GitHub | If you are already signed into GitHub in your browser, you cant authorize your repos connection to a different GitHub account unless you sign out of your currently signed-in one. | By Design. |
| Authorizing Azure DevOps | If users is logged into a different account on Azure DevOps from the one in Azure Sentinel in the same browser, connection creation may fail. | Please make sure that you are not logged into Azure DevOps using a different email. Using a Private window might help. |
| Deployments Limit | Each resource group is limited to 800 deployments in its deployment history. | By Design. Visit DeploymentQuotaExceeded for troubleshooting. |
| Deleting a GitHub connection after uninstalling the AS app | You cannot properly delete a connection from the Repositories blade UI if you have uninstalled the Azure Sentinel App from your connected GitHub repository | Manually remove the workflow from your GitHub repository and remove the connection from the UI. |
| Content Type Filtering | If your branch contains content types beyond the ones chosen in your connection, your deployments will display warnings. | By Design. |
| Cross-workspace queries | Content that requires access to resources outside of your workspace's resource group is not currently deployable through Repositories | By Design. |
| Playbooks missing parameter | Playbook templates deployment fail with a missing parameter error | Bug - add a parameter workspace definition to the playbook ARM template. |
| Hunting Queries and Parsers | Choosing hunting queries will also deploy parsers and vice versa. | They both use the Saved Searches API. |
| Playbooks Support | Only basic playbook cases are currently supported. | More support coming in the future. |
| Multi-tenant/MSSP ADO connection | Guest account users might not see their ADO organization. | - |
| Token expired | Invalid User Access Token: IDX10223: Lifetime validation failed. | Refresh the page and try again. |
| Role assignment failed | Client does not have authorization for roleAssignments/write. | User must have Owner role on the Resource Group. |
| Branch policy push error | TF402455: Pushes to this branch are not permitted. | User must be Contributor or higher with bypass ability. |

# Bicep support

## Introduction

Enables using Bicep templates alongside or as replacement for ARM templates in Sentinel GitHub and ADO repositories.

Bicep is a more intuitive and easier way to use templatized language for describing Azure resources and Sentinel content items.

## Minimum requirements

- Only connections to GitHub and Azure DevOps repositories are supported.
- Collaborator access to GitHub repository or Project Administrator access to Azure DevOps repository.
- Microsoft Sentinel application needs authorization to your repo.
- Actions must be enabled for GitHub.
- Pipelines must be enabled for Azure DevOps.
- ADO connection must be in the same tenant as your Microsoft Sentinel workspace.

## Known Issues or Limitations

- Repositories connections created before November 1, 2024 must be removed and recreated to use Bicep.
- Bicep templates don't support the id property. Remove it when decompiling ARM JSON.
- Change ARM JSON schema to version 2019-04-01 for best decompiling results.

## Escalating to IcM

Collect:
- Details of the repository connection
- A template that exhibits the issue
- Detailed repro steps

# Cross workspace queries

Currently not supported (as of Dec 2025). Temporary workaround (not officially supported): When a new repository connection is established in Sentinel, a corresponding federated identity is automatically created and assigned Sentinel Contributor permissions. Enabling cross-workspace queries requires granting this federated identity Sentinel Contributor access in the additional workspace.

# FAQs

**What is the trigger for new deployments?**
Anytime content in the connected repository branch is modified or new content templates are added, a deployment will be triggered.

**How can I check the health of my connections and deployments?**
No direct mechanism in Sentinel UX. Each connection's side panel has a link to deployment history and logs.

**How many connections can I have in my workspace?**
Current limit is 5 connections per workspace.

**Is there a mechanism for safe or smart deployments?**
Currently deploys to all connected workspaces at the same time. Staged deployment capability is being explored.

**Does this feature validate my content templates?**
No. Content templates are deployed as-is. Validate through your regular process.

**Is there a way to programmatically manage the CI/CD pipeline?**
Possible through REST API but extremely manual. Not officially supported yet.
