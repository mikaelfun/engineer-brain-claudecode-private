---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Tenant Deletion - Instructions for Azure Identity Support Engineers (SE)"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Deletion - Instructions for SE

## Prerequisites
- CMAT/CST portal read-only access
- Validate customer followed self-service deletion doc
- Verify NOT B2C tenant
- Customer data consent granted

## Step 0: Create Temporary Admin
Create temp GA, delete all users, permanently delete, retry self-service deletion.

## Step 1: Check CSP Relationship
CMAT > Partner+Customer Relation. If CSP exists: STOP.

## Step 2: Request TA/PTA Provide Blockers
TA queries CMAT Validate+Delete, sends GA Approval Letter, raises ICM.
