---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Developer/Supported Technologies/Microsoft Graph API/Microsoft Graph Bicep Provider"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FDeveloper%2FSupported%20Technologies%2FMicrosoft%20Graph%20API%2FMicrosoft%20Graph%20Bicep%20Provider"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Microsoft Graph Bicep Provider

## Summary

The "Microsoft Graph Bicep extension" enables customers to manage a limited set of Microsoft Entra ID resources using Bicep templates. Template authors can define Microsoft Graph resources side-by-side with Azure resources in a Bicep template.

Graph resources are first-class Bicep types with full IntelliSense in VS Code. Definitions contain all properties present in public Graph schema.

Deployment modes:
- Interactive: Azure CLI and Azure PowerShell only (Cloud Shell being investigated, VS Code not supported due to OBO elevation issue)
- App-only: Supported for CI/CD pipelines

## Breaking Change (COMPLETED - January 2025)

Migration from "built-in types" to "dynamic types" completed. Built-in types no longer supported.

- **September 2024**: Dynamic type support rolled out
- **September 30, 2024**: Deprecation announced
- **Mid-October 2024**: Compiler warnings for built-in types
- **January 24, 2025**: Built-in types removed; authoring and deployment warnings became errors

**Action Required**: Customers must specify extensions in `bicepconfig.json` referencing versioned artifacts from Microsoft Artifact Registry and reference them in `main.bicep`.

## Sovereign Clouds

Supported in all clouds: Public, USGov (Fairfax), USNat (EagleX), USSec (SCloud), China (Mooncake/Gallatin), Bleu, Delos, GovSG.

## Supported Deployment Scenarios

1. Create/update Entra applications
2. Create/update service principals
3. Create/update Entra groups (manage owners and members)
4. Create/update federated identity credentials (FIC)
5. Grant delegated and application permissions to service principals
6. Assign Azure RBAC roles to security groups, users, or service principals
7. Read existing groups, applications, service principals, and users
8. Manage owners for applications and service principals

## Key Types

- **Users**: Read-only - can be referenced but not created or modified
- **Apps**: Full CRUD support
- **Groups**: Full CRUD with member/owner management
- **FederatedIdentityCredentials**: Configure for managed identity passwordless auth
