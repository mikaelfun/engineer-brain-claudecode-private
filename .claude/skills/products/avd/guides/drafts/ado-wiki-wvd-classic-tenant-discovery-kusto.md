---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/🔄Workflows/AVD Classic/WVD Classic Tenant Discovery via Kusto"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=%2F%F0%9F%94%84Workflows%2FAVD%20Classic%2FWVD%20Classic%20Tenant%20Discovery%20via%20Kusto"
importDate: "2026-04-23"
type: guide-draft
---

# WVD Classic Tenant Discovery via Kusto

## Overview

When preparing for WVD/AVD Classic to ARM migration, customers need to identify which Classic tenants are associated with a specific Entra ID (Azure AD) tenant.

## Key Limitation

AVD/WVD Classic tenants are NOT linked to Azure subscriptions. As a result:
- You cannot list Classic tenants by Subscription ID
- Get-RdsTenant does not support Subscription ID as a parameter

This is a core architectural difference: Classic (WVD) is tenant-based, not subscription-scoped, while ARM-based AVD is fully Azure Resource Manager-based and subscription-scoped.

## Supported Workaround: Kusto-Based Discovery

### Important Constraints
- Diagnostic data retention is 29 days
- Only returns Classic tenants that were used in the last 29 days
- Does NOT guarantee a full inventory
- For a complete historical list (including dormant tenants), Product Group (PG) engagement is required

### KQL Query: Identify Classic Tenants by Entra ID Tenant

Replace AADTenantID with the customer's Entra ID tenant ID.

    let valueToSearchFor = "AADTenantID";
    macro-expand isfuzzy=true force_remote=true AVD_Prod as X
    (
    X.DiagActivity
    | where Type == "Connection"
    | where TIMESTAMP >= ago(29d)
    | where DiagTenantGroupName == "Default Tenant Group" or ArmPath == "*"
    | where AadTenantId == valueToSearchFor
    | project Id, AadTenantId, DiagTenantGroupName, DiagTenantName, TenantId, TIMESTAMP,
      StartDate, EndDate, Duration = EndDate-StartDate, UserName, Outcome, ResourceType,
      ResourceAlias, ClientType, ClientVersion, SessionHostPoolName, Region, Geo,
      SessionHostName, AgentVersion, ArmPath
    )

## How to Identify Classic vs ARM Deployments

### ArmPath
- Classic: Empty or contains only "*"
- ARM-based AVD: Full Azure Resource Manager path

### DiagTenantGroupName
- Classic: Human-readable text (e.g. "Default Tenant Group" or custom names)
- ARM-based AVD: Always a GUID

### Classic Filter Condition

    where DiagTenantGroupName == "Default Tenant Group" or ArmPath == "*"

## Important Caveats
- Classic tenants with no activity in the last 29 days or fully dormant tenants will NOT appear
- For a full Classic tenant inventory, engage AVD Product Group (PG)
