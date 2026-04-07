---
source: ado-wiki
sourceRef: "Supportability/AzureMonitor/AzureMonitor.wiki:/Application Insights/Support Topics/Deploy or manage Application Insights resources/Access and permissions (RBAC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureMonitor/_wiki/wikis/AzureMonitor.wiki?pagePath=/Application%20Insights/Support%20Topics/Deploy%20or%20manage%20Application%20Insights%20resources/Access%20and%20permissions%20(RBAC)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Application Insights Access and Permissions (RBAC) Troubleshooting

## Scenario
Troubleshoot RBAC permissions or access issues to Application Insights, including built-in or custom RBAC roles.

## Scoping Questions
- User's name and object ID
- If custom role, name of the custom role
- Operation being attempted
- Error message when operation is failing
- Request ID of failed operation

## Troubleshooting Steps

### RBAC Permissions or Access Issues
1. Validate user is in appropriate role via "Access Control" tab of the App Insights Component
2. Reference: [Resources, roles, and access control](https://docs.microsoft.com/azure/azure-monitor/app/resources-roles-access-control)
3. Try a different browser
4. Try a different user

### Custom Roles
1. Remove user from custom role, place in built-in role with desired access to isolate issue
2. Alternatively, recreate the custom role in your test subscription and test with a colleague
3. Use process of elimination on [custom role properties](https://learn.microsoft.com/azure/role-based-access-control/custom-roles#custom-role-properties)

### Enable Application Insights Greyed Out (App Service)
- Workspace-based App Insights requires Log Analytics Contributor role access
- Assign Log Analytics Contributor at resource group or subscription scope

## Key References
- [Resources, roles, and access control](https://docs.microsoft.com/azure/azure-monitor/app/resources-roles-access-control)
- [Select a role](https://docs.microsoft.com/azure/azure-monitor/app/resources-roles-access-control#select-a-role)
