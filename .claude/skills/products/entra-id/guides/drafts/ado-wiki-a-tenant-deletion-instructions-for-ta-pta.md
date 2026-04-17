---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Azure AD Tenant and Domain Management/Azure AD Directory Deletion/Tenant Deletion - Instructions for Azure Identity TAs and PTAs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Tenant Deletion - Instructions for TAs and PTAs

> Full guide (60K chars) at source URL.

## Prerequisites
CMAT_ReadWrite + CST_ReadWrite, SAW + AME.GBL

## Steps
1. Check CSP (CMAT + SMRT Tool)
2. CMAT Validate+Delete for blockers
3. Resolve subscriptions (CMAT first, OMS last resort)
4. Check MSODS for orphaned subs (DS Explorer / D2K)
5. Execute deletion via CMAT
