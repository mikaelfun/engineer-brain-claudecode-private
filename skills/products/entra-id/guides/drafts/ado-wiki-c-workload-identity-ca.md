---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Conditional Access Policy/Azure AD Conditional Access for Workload Identities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Conditional%20Access%20Policy%2FAzure%20AD%20Conditional%20Access%20for%20Workload%20Identities"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Workload Identity Conditional Access

## Important: Licensing
Post-GA, **Microsoft Entra Workload Identities premium** licenses are required to create or edit CA policies for service principals. Error 1150 if missing. Trial activation:
- Entra admin center: `entra.microsoft.com/?Microsoft_AAD_IAM_isWorkloadIdentitiesFreeTrialEnabled=true&...`
- Azure Portal: Similar URL with portal.azure.com
- Note: `Workload_Identities_for_EPM_customers` is NOT the same SKU

## Summary
CA policy now protects app-to-app calls by restricting sign-ins for single-tenant workload identities (service principals). The "Users or workload identities" dropdown determines policy scope.

## Requirements
- Microsoft Entra Workload Identities premium licenses
- Dynamic targeting requires Attribute definition administrator/reader role

## Limitations
- Cannot assign users AND workload identities to same policy (error 1072)
- Managed identities not supported (error 1078)
- Multi-tenant/3P SaaS apps not supported
- OBO flows not supported
- Only Block grant control available when SPs configured
- Must target "All cloud apps" (no individual app selection)

## Configuration

### Azure Portal
1. Azure AD > Security > Policies > New Policy
2. Change "Users and groups" dropdown to "Service principals"
3. Cloud apps: Must select "All cloud apps"
4. Conditions: Only Locations available
5. Grant: Block access

### Targeting Types

#### Static Targeting
Select specific service principals from object picker.

#### Dynamic Targeting (Custom Security Attributes)
- Requires Attribute definition administrator/reader role
- Rule syntax: `CustomSecurityAttribute.SetName_AttrName -eq "value"`
- Global/CA admins get read-only access to dynamic-targeting policies

### Graph API
```
POST https://graph.microsoft.com/beta/identity/conditionalaccess/policies/

{
  "displayName": "Block Service Principal Sign-ins by Location",
  "state": "enabled",
  "conditions": {
    "applications": { "includeApplications": ["All"] },
    "clientApplications": {
      "includeServicePrincipals": ["<SP-ObjectID>"],
      "excludeServicePrincipals": []
    },
    "locations": {
      "includeLocations": ["All"],
      "excludeLocations": ["<Named-Location-ID>"]
    }
  },
  "grantControls": {
    "operator": "and",
    "builtInControls": ["block"]
  }
}
```

For all workload identities: use `"ServicePrincipalsInMyTenant"` instead of specific ObjectID.

## Troubleshooting

### Kusto (SAW with JIT)
```kql
cluster("estswus2").database("ESTSPII").VerboseTracesSecureIfx
| where env_time >= ago(1d)
| where RequestId == "<request-id>"
| project Message
```
PII access: https://aadwiki.windows-int.net/index.php?title=JIT_eSTS_Telemetry_PII_Reader_Access

### ASC
- Conditional Access > Policies: Service principals in Include/Exclude sections
- Sign-ins > Service Principal Sign-ins tab
- Auth Diagnostics: Expert view > CA Diagnostics for workload identity evaluation
- Dynamic targeting attributes: Expert view > Diagnostic Logs > `ServicePrincipalModelForDynamicRuleEvaluation`

### Graph Explorer Queries for Custom Security Attributes
- All attribute sets: `GET /directory/attributeSets` (beta)
- Attributes on SP: `GET /servicePrincipals/{id}?$select=customSecurityAttributes` (beta)

## Error Codes
| Error | Code | Description |
|-------|------|-------------|
| 53003 | BlockedByConditionalAccess | Access blocked by CA for workload identity |
| 1072 | BadRequest | Cannot assign users AND service principals to same policy |
| 1078 | InternalServerError | Managed identity/multi-tenant SP not supported |
| 1150 | BadRequest | Workload Identities premium license required |

## ICM Path
- Owning Service: ESTS
- Owning Team: Conditional Access
- Support Engineer ICM Template: https://portal.microsofticm.com/imp/v3/incidents/cri?tmpl=83L3k1

## Self-Testing
1. Register app in tenant (follow quickstart guide)
2. Use Postman with client_credentials grant
3. Set grant_type=client_credentials, client_id, scope=https://graph.microsoft.com/.default, client_secret
