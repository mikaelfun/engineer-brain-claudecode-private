---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Sync Provisioning/SyncFabric/Outbound provisioning/Identity Provisioning with Entra ID"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FSync%20Provisioning%2FSyncFabric%2FOutbound%20provisioning%2FIdentity%20Provisioning%20with%20Entra%20ID"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Identity Provisioning with Entra ID

## Overview

Entra ID Provisioning (AKA "Automated User Provisioning for SaaS Apps") allows management of creation, maintenance and removal of users and groups in cloud (SaaS) applications (e.g., Salesforce, ServiceNow, Dropbox).

Supported by the **Entra ID Synchronization team**.

### Case Routing

Customers should create cases using:
- Service: SCIM - Entra ID App Integration and Development
- Problem type: Enterprise Apps
- Problem subtype: Automatic user provisioning to SaaS applications

## Escalations

ICMs should be filed via ASC with correct product + support topic under Azure/Microsoft Entra User Provisioning and Synchronization/Provisioning from Microsoft Entra ID to SaaS.

Fallback IcM template: https://portal.microsofticm.com/imp/v3/incidents/create?tmpl=63C2c2

## SCIM Documentation

- [RFC 7642](https://tools.ietf.org/html/rfc7642), [RFC 7643](https://tools.ietf.org/html/rfc7643), [RFC 7644](https://tools.ietf.org/html/rfc7644)
- [SCIM implementation](https://docs.microsoft.com/azure/active-directory/app-provisioning/use-scim-to-provision-users-and-groups)

## Feature Flags

### 1. Schema Editor for Source and Target System

URL: `https://portal.azure.com/?Microsoft_AAD_Connect_Provisioning_forceSchemaEditorEnabled=true`

Use cases:
- Add a custom attribute to the target app schema (e.g., provisioning tags not part of default SCIM schema)
- Some apps have read-only schema (e.g., GSuite) - changes would be ignored during sync

This includes all attribute mappings and filters.

### 2. Expression Builder

The Entra ID Provisioning Expression Builder tool is now **globally available**:
[Expression Builder documentation](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/expression-builder)

## Feature Requests

- New connectors: https://feedback.azure.com/forums/169401-azure-active-directory?category_id=160599
- Other provisioning features: AAD DCR & Community request portal
