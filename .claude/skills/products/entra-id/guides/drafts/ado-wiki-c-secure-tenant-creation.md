---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Tenant Governance/Secure Tenant Creation"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Account%20Management%2FAzure%20AD%20Tenant%20and%20Domain%20Management%2FTenant%20Governance%2FSecure%20Tenant%20Creation"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Secure Tenant Creation — Troubleshooting and ASC Diagnostics Guide

## IMPORTANT

Secure add-on tenant creation requires BOTH Entra authorization AND MCA billing prerequisites.
Tenant creation will fail if:
- Creator does not select an MCA-backed cloud subscription
- Governing tenant does NOT have a default tenant governance relationship policy template defined
Entra Admin Center restrictions apply ONLY to portal flows (NOT to Microsoft Commerce signup).

## Authorization Requirements

| Required | Details |
|---|---|
| Billing | Modern Commerce Agreement (MCA)-backed cloud subscription |
| Azure RBAC | Tenant Contributor (or higher) on at least one Azure subscription |
| Entra Role | Tenant Creator or Global Administrator |
| Governance prerequisite | Default governance policy template MUST be defined in governing tenant BEFORE creation |

## Support Boundaries

| Failure Type | Primary Owner | Notes |
|---|---|---|
| Entra role missing | Security and Access Management | Tenant Creator or Global Admin required |
| Azure subscription access | Security and Access Management | Tenant Contributor RBAC required |
| Governance relationship not created | Organization Management | Must declare governance intent AT creation time |
| Invalid tenant classification | Organization Management | Classification determines post-creation config |
| Post-creation config not applied | Organization Management | Done via Graph APIs in delegated mode |
| Missing MCA / invalid billing | Commerce | MCA required; EA/MOSA subscriptions NOT eligible |
| ARM authorization failures (5xx) | Commerce (ARM service) | Escalate to Commerce if roles/subscription are correct |
| Entra ID Free billing asset missing | Commerce | Validate in M365 Admin Center > Billing |

## Troubleshooting Flow

### 1. Fails immediately, no tenant created
- validateTenantGovernance API failed
- Check: governing tenant has default governance policy template
- Check: valid tenant classification values
- Check: no subscription-level restrictions
- Kusto: filter by governing tenant + validateTenantGovernance RequestPath

### 2. Authorization error
- Verify Tenant Creator or Global Admin Entra role
- Verify Tenant Contributor Azure RBAC on selected subscription
- SAP: Azure/Microsoft Entra Directories, Domains, and Objects/Role Based Access Control

### 3. Commerce/billing boundary failure
- Confirm billing account type is Microsoft Customer Agreement (MCA)
  In Azure portal: Cost Management + Billing > check Billing account type
- Verify selected subscription appears under MCA billing account
- If subscription is Legacy EA, MOSA, or different tenant billing: NOT eligible

## ASC Kusto Diagnostics

Cluster: idsharedscus.southcentralus.kusto.windows.net
Database: IAMTGOVPROD
Table: KubernetesEvent
Function: GetKubernetesEvent_AllClusters (union across: northeurope, southcentralus, japaneast, australiacentral)

### Get API calls for tenant creation


### Get detailed logs by trace ID


### Understand validateTenantGovernance
- First API called BEFORE tenant creation (pre-validation gate)
- If it fails: NO tenant created, NO billing asset, NO governance setup
- Logs only in GOVERNING tenant (new tenant ID does not exist yet)

## ICM Paths

| Scope | Owning Service | Owning Team |
|---|---|---|
| Tenant Governance | UMTE | Tenant Governance |
| Tenant Governance Platform | UMTE | UMTE/CSLMS |
| Secure Tenant Creation | UMTE | UMTE/CSLMS |

## Training
Deep Dive 306383 - Tenant Discovery and Secure Tenant Creation (Troubleshooting)
Duration: 70 min | Course: https://aka.ms/AA1085qb
Deck: https://aka.ms/AA1085qc