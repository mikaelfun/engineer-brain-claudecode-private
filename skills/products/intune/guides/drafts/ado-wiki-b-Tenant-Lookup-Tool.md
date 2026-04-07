---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Engineer Reference/Tenant Lookup Tool"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Engineer%20Reference/Tenant%20Lookup%20Tool"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Tenant Lookup Tool — Tenant Classification & Routing Guide

## Overview

The **Tenant Lookup Tool** ("Where's My Tenant?") helps engineers quickly determine where a customer's tenant is hosted and identify the correct support process/routing.

**Tool link**: https://gettenantpartitionweb.azurewebsites.net/#

## How to Use

1. Enter the **domain name** or **tenantID** in the box.
2. Click **"Lookup Tenant"**.
3. Review the results:

| Field | Meaning |
|-------|---------|
| **Search string** | The input string used to find the result |
| **Tenant ID** | The tenantID associated with the searched domain |
| **Azure AD Instance** | Which sovereign cloud instance the tenant is on |
| **Tenant Scope** | Compliance scope / access control requirement |

## Azure AD Instance Values

| Instance Value | Description |
|----------------|-------------|
| Contains "**Global**" | Normal **production** instance of Intune |
| Contains "**Government**" | **GCC-H / DoD** instance of Intune |
| Contains "**China**" | **Mooncake (21V)** instance of Intune |

## Tenant Scope Values & Routing Rules

| Tenant Scope | Meaning | Who Can Work the Case |
|--------------|---------|----------------------|
| **Not applicable** | Standard tenant (not GCC, GCC-H, or DoD) | Any non-GCC-H engineer |
| **GCC** | Government Community Cloud (but NOT GCC-H or DoD) | Any non-GCC-H engineer |
| **GCC High** | Government Community Cloud - High | **MUST** be a GCC-H approved engineer only |
| **DOD** | Department of Defense | **MUST** be a GCC-H approved engineer only |

> ⚠️ **Important**: Some tenants are not in a "special" location but still have different handling requirements (EU data boundary, region-restricted, etc.). Business-related handling processes always supersede tenant location decisions.

> 🔒 If you are not GCC-H cleared, you should not have access to view GCC High or DOD cases.

## Quick Use Case

- **Domain → TenantID lookup**: Enter domain (e.g., `contoso.com`) to get the tenant GUID.
- **Tenant routing check**: Confirm whether a case requires GCCH-cleared engineer before picking it up.
