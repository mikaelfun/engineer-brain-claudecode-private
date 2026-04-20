---
title: MAM App Protection Policy for Edge on Windows
source: onenote
sourceRef: "Mooncake POD Support Notebook/POD/VMSCIM/4. Services/Intune 2/## Windows TSG/App protection policy for Edge on Windows.md"
product: entra-id
date: 2026-04-18
tags: [MAM, Edge, Windows, Conditional Access, app protection policy, Workplace Join]
---

# MAM App Protection Policy for Edge on Windows

## Overview
Desktop MAM for Edge on Windows allows Intune App Protection Policies on BYOD devices without full MDM enrollment.

## Requirements
- Windows 11 22H2 (build 10.0.22621) or later
- Microsoft Edge v115.0.1901.155 or later
- Workplace Join only (NOT MDM enrolled AADJ/HAADJ)
- Max 3 users WPJ from same BYOD device across all tenants
- Intune license required
- Entra ID P1 for Conditional Access

## Architecture
1. User signs in via Edge, WAM acquires token
2. Edge sends `x-ms-enrollments` header (base64 comma-separated enrollment IDs) to AAD Authorize endpoint
3. ESTS matches enrollment IDs against CA policy's `EnrollmentIds` property
4. Match found -> `MatchedEnrollmentId` in DataForConditionEvaluation -> token issued
5. No match -> `unauthorized_client` (53005) with suberror `protection_policy_required`

## Diagnostics
- Check MAM flags: `edge://edge-dlp-internals`
- Decode `x-ms-enrollments` header in Fiddler: right-click > Send to TextWizard > From Base64
- Compare decoded IDs with `EnrollmentIds` in ASC Authentication Diagnostics DataForConditionEvaluation
- Check `MatchedEnrollmentId` for successful sign-ins

## Edge ClientAppId
| Application | ClientAppId |
|---|---|
| Microsoft Edge | ecd6b820-32c2-49b6-98a6-444530e5a77a |

## Case Routing

| Issue | Support Team | SAP |
|---|---|---|
| CA Require app protection policy fails with Edge | AAD Auth Professional + AAD Auth Premier (collab with Edge) | Azure/AAD Sign-In and MFA/CA/Grant or block |
| WPJ fails when adding work account to Edge Profile | Edge support | Browser/Microsoft Edge/Edge for Windows |
| MAM flags not enabled / not persisting | Edge support | Browser/Microsoft Edge/Edge for Windows |
| MAM flags enabled but compliance check fails | Intune support | Azure/Intune/App Configprofiles - Windows/ManagedApps |
| MAM flags enabled but lost over time | Intune support | Azure/Intune/App Configprofiles - Windows/ManagedApps |

## Critical Notes
- **Must uncheck** "Allow my organization to manage my device" during WPJ registration
- "No, sign in to this app only" must NOT be selected
- MDM enrolled devices (AADJ/HAADJ) are NOT supported for MAM
- If CA has both "Require app protection" AND "Require compliance device" with OR operand, non-MAM browsers get MDM extension prompt instead
- Separate Windows MAM policy from Android/iOS policies
- Desktop MAM SDK does NOT participate in authentication - all auth flows handled by Edge/WAM layer
