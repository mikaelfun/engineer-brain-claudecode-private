---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Tenant Governance/Governance Relationships"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FTenant%20Governance%2FGovernance%20Relationships"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Tenant Governance Relationships

> **Important**: This feature is not to be discussed with customers until public preview begins.

## Summary

Tenant Governance Relationships establish a **directional administrative trust boundary** between Microsoft Entra tenants. This relationship allows one tenant, designated as the governing tenant, to monitor, manage, and administer one or more governed tenants in a controlled and auditable manner without merging tenants or creating a multi tenant organization.

Governance relationships enable **delegated administration through GDAP and cross tenant multitenant application management**, extending capabilities that were previously limited to CSP scenarios in Partner Center to enterprise customers through Tenant Governance. Relationships are created through a request and approval workflow and are configured using policy templates that define delegated permissions, monitoring behavior, and overall relationship scope.

When multitenant application management is enabled, including custom multitenant applications, Tenant Governance automatically provisions the required service principal in the governed tenant with the permissions defined by the relationship policy. Once established, governance relationships support ongoing administration, configuration and security posture monitoring, and governed tenant visibility into governing tenant activity through audit logs and sign in logs. The governed tenant retains lifecycle control, including the ability to terminate the relationship.

## Documentation overview

Public documentation for Tenant Governance is available at:
- https://aka.ms/TenantGovernance

Public documentation for supported builtin roles:
- https://aka.ms/TenantGovernance/Roles

> **Note**: Public Microsoft Graph documentation for Tenant Governance APIs is not yet published.
> Until then, use the Microsoft Graph **beta** endpoints documented in this wiki.

## Experiences supported

- Microsoft Entra admin center
- Microsoft Graph APIs (beta)
- Kusto logs and Microsoft Graph APIs for troubleshooting

## Known Issues

### Send Invite Fails

Attempting to send a governance invite from the tenant that is to be governed fails.

A browser trace shows:
"status":403
"code":"forbidden"
"message":"Failed to send governance invitation."

See "0: Enable Invitations in Settings" to allow governance invitations.

## Relationship Setup (3-step handshake)

### 0: Enable Invitations in Settings

Ensure the governing tenant is configured to accept governance invitations.

1. Navigate to the **Tenant governance settings** blade under **Settings**.
2. Toggle the "Allow other tenants to send governance invitations to this tenant (tenantname)" setting to *Enabled* and click **Save**.

Graph call: `PATCH /directory/tenantGovernance/settings` with body `{"canReceiveInvitations":true}`

### 1: Governed Tenant Sends Invitation to Governing Tenant

1. From the tenant that will be governed, admin opens **Governing tenants** blade → **Sent invitations** tab.
2. Click **New invitations**, enter tenant ID or domain of governing tenant, select **Send invitation**.

- Tenants can send up to **10 outbound governance invitations**.
- Invitations expire after **30 days**.

Graph call: `POST /directory/tenantGovernance/governanceInvitations` with body `{"governingTenantId":"<id>"}`

### 2: Governing Tenant Sends Request to Governed Tenant

1. From governing tenant, admin opens **Governed tenants** blade → **Received invitations** tab.
2. Select **Send governance request** → select appropriate policy template.

Graph call: `POST /directory/tenantGovernance/governanceRequests`

### 3: Governed Tenant Sends Response to Governing Tenant

1. From governed tenant, admin opens **Governing tenants** blade → **Pending requests** tab.
2. Click **Request ID** to view details → **Accept** or **Reject**.

Graph call: `PATCH /directory/tenantGovernance/governanceRequests/{id}` with body `{"status":"accepted"}`

## Using a governance relationship

### Signing in as a GDAP user

Most, but not all, admin portals support target tenant sign-in.

The Microsoft 365 admin portal does **not** support target tenant endpoints.

When a user who belongs to the role-assignable security group signs in to the governed tenant as a GDAP user, they must use `entra.microsoft.com/{governed tenant ID}`.

Workaround: https://learn.microsoft.com/en-us/answers/questions/2275795/login-to-microsoft-365-admin-center-of-specific-ta

### Email notifications

Microsoft Entra sends email notifications to tenant administrators during key governance relationship lifecycle events. These are informational and expected behavior.

Notifications sent when:
- Tenant receives a governance invitation/request
- Another tenant accepts or rejects a governance request
- Tenant receives a termination request
- A governance relationship is terminated

During public preview, notifications are sent to Global Administrators.

### Conditional Access considerations

Conditional Access policies in the governed tenant can block GDAP sign-ins.

GDAP users do not have a user presence in the governed tenant. Policies that require user resolution (for example, Terms of Use) will block sign-in.

## Terminating a governance relationship

Governed tenants are expected to terminate relationships without requiring a termination request.

If the relationship was created using a policy template created before November 2025 (private preview), the governed tenant may be unable to terminate.

In this case:
1. The governing tenant must send a termination request (from **Governed tenants** blade → **Terminate governance** button)
2. The governed tenant can then complete termination (from **Governing tenants** blade → **Confirm termination** button)

## Error Codes

### Create a governance policy template

| Case | Error | Resolution |
|------|-------|------------|
| Unauthorized | Unauthorized | Verify required Tenant Governance role |
| Display name not unique | 409 Governance Policy Template already exists | Use a unique display name |
| Group not role assignable | 400 Group is not role assignable | Use a role-assignable security group |

### Send a governance invitation

| Case | Error | Resolution |
|------|-------|------------|
| Unauthorized | Unauthorized | Verify required role |
| Same tenant | 400 Cannot send governance invitations to your own tenant | N/A |
| Active invitation exists | 409 Invitation already exists | Delete or wait for expiration |
| Tenant already governing | 400 Tenant is governing in active relationship | Terminate existing relationship |
| Max limit reached | 403 Maximum limit of 10 reached | Delete outbound invitation |
| Invitations disabled | 403 Failed to send governance invitations | Enable invitations in settings |
| Target tenant governed | 400 Failed to send governance invitations | Terminate governed relationship |

### Send a governance request

| Case | Error | Resolution |
|------|-------|------------|
| Unauthorized | Unauthorized | Verify required role |
| Missing invitation | 400 No governance invitation found | Send invitation first |
| Insufficient GDAP licensing | License required | Microsoft Entra ID P1 or P2 required |
| Insufficient app injection licensing | License required | Microsoft Entra ID Governance required |
| Duplicate pending request | 409 Request already exists | Update policy template and resend |

### Accept or reject request

| Case | Error | Resolution |
|------|-------|------------|
| Unauthorized | Unauthorized | Verify Tenant Governance admin role |
| Request expired | 400 Request expired | Send a new request |

### Updating an existing governance relationship

To update an active governance relationship, the invitation step does not need to be repeated. The governing tenant can update the governance policy template and send a new governance request.

## General patterns

- A tenant cannot be both a governing and governed tenant at the same time
- API calls fail if this constraint would be violated
- Unauthorized errors typically indicate missing required roles

## Troubleshooting

### Azure Support Center (ASC)

Until data explorers appear in ASC, use ASC's Graph Explorer to view Governance relationships.

#### Graph Explorer queries (ASC)

**List All Governance Requests:**
- URL: `/directory/tenantGovernance/governanceRequests` (beta)

**Get Specific Governance Request:**
- URL: `/directory/tenantGovernance/governanceRequests/{id}` (beta)

**Discover pending requests for a tenant:**
- URL: `/directory/tenantGovernance/governanceRequests?$filter=(status eq 'pending' and (governingTenantId eq '{tenant_Id}' or governedTenantId eq '{tenant_Id}'))` (beta)

**Retrieve active relationships:**
- URL: `/directory/tenantGovernance/governanceRelationships?$filter=(status eq 'active' and (governingTenantId eq '{tenant_Id}' or governedTenantId eq '{tenant_Id}'))` (beta)

**List governed tenants for a governing tenant:**
- URL: `/beta/directory/tenantGovernance/governanceRelationships?$filter=(status eq 'active' and (governingTenantId eq '{tenant_Id}'))&$orderby=creationDateTime desc` (beta)

**Get relationship by ID:**
- URL: `/directory/tenantGovernance/governanceRelationships/{id}` (beta)

**View active governance configuration:**
- URL: `/directory/tenantGovernance/configurationMonitors?$filter=(tenantId eq '{tenant_Id}')` (beta)

**List policy templates:**
- URL: `/directory/tenantGovernance/governancePolicyTemplates` (beta)

**List invitations:**
- URL: `/directory/tenantGovernance/governanceInvitations` (beta)

**Governance settings:**
- URL: `/directory/tenantGovernance/settings` (beta)

### Kusto

Cluster: `idsharedscus.southcentralus` → database: **IAMTGOVPROD** → table: **KubernetesEvent**

Cross-cluster function: **GetKubernetesEvent_AllClusters** (unions `idsharedscus.southcentralus`, `idsharedneueudb.northeurope`, `jpneastgds.japaneast`, `auscentralgds.australiacentral`)

**Step 1 — Get env_dt_traceId:**
```kusto
let crid = "<ClientRequestId>";
GetKubernetesEvent_AllClusters
| where env_time > ago(10d)
| where Tenant !in ("iamtgovtenantgovernanceapi-pub-cus-000")
| where name == "Microsoft.TenantGovernance.API.Middleware.OutboundResponseRecordingMiddleware"
| where ClientRequestId == crid
| project env_time, StatusCode, Method, RequestPath, TenantId, requestBody, Content, body, response, env_dt_traceId
```

**Step 2 — Get all logs for the request:**
```kusto
GetKubernetesEvent_AllClusters
| where env_time > ago(10d)
| where Tenant !in ("iamtgovtenantgovernanceapi-pub-cus-000")
| where env_dt_traceId == "<env_dt_traceId>"
| project env_time, StatusCode, Method, RequestPath, TenantId, requestBody, Content, body, response, env_dt_traceId
```

## Audit Logs

### Log properties for GDAP users

| Property | Format |
|----------|--------|
| User display name | \<Governing tenant name\> Technician |
| UPN | User_\<user object ID\>@\<governing tenant domain\> |
| User ID | Object ID in governing tenant |
| Cross tenant access type | Service provider |
| Home tenant ID | Governing tenant ID |

### Relationship lifecycle events

Audit logs generated in both tenants. In target tenant:
- **Initiated by (actor)** = TenantGovernance application
- Governing tenant details in **Additional details**

Key audit activities:
- `EnableDisableTenantGovernanceInvitations` — invitation settings change
- `SendGovernanceInvitation` / `ReceiveGovernanceInvitation` — invitation lifecycle
- `SendGovernanceRequest` / `ReceiveGovernanceRequest` — request lifecycle
- `AcceptRejectGovernanceRequest` — approval
- `CreateGovernanceRelationshipGoverning` / `CreateGovernanceRelationshipGoverned` — relationship creation
- `SendTerminationRequest` / `ReceiveTerminationRequest` / `GovernanceRelationshipTerminatedGoverning` — termination

## ICM Paths

- **Owning Service**: UMTE
- **Owning Team**: UMTE/Sync Triage

## Training

- Deep Dive 306383 - Governance Relationships (Troubleshooting)
- Format: Self-paced eLearning, 53 minutes
- Course: https://aka.ms/AA1075kz
- Deck: https://aka.ms/AA106y33
