---
source: ado-wiki
sourceRef: "Supportability/WindowsVirtualDesktop/WindowsVirtualDesktop:/Sandbox/In-Development Content/Context Based Redirection/Scoping Questions"
sourceUrl: "https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop?pagePath=/Sandbox/In-Development%20Content/Context%20Based%20Redirection/Scoping%20Questions"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Context Based Redirection - Scoping Questions

## 1. Environment & Configuration

These questions establish **where the feature is configured and enforced**.
- Are you using **Azure Virtual Desktop (AVD)**, **Windows 365**, or **both**?
- Which **connection client** are users connecting from?
  - Windows App (Windows / macOS / iOS / Android)
  - Web client
- Is **Context Based Redirection** configured via:
  - **Microsoft Entra Conditional Access + Authentication Contexts**?
  - **Windows 365 (Intune Remote connection experience)**?
  - **AVD Host Pool / RDP properties**?
- Which **redirection types** are involved?
  - Clipboard
  - Drive
  - Printer
  - USB
- Can you confirm the **Authentication Context(s)** being used (for example: C1, C2, etc.)?

> Goal: confirm feature usage and eliminate unsupported or misaligned setups early.

## 2. User Scenario / UX Behavior

These questions clarify **what the user actually sees**.
- What is the **exact user experience**?
  - Redirection option is **grayed out**
  - Redirection option is **missing**
  - Redirection appears enabled but **does not work**
- Is the behavior observed:
  - At **connection time**?
  - **After** the session is already connected?
- Do users see **policy messages** such as:
  - "Clipboard redirection has been disabled by your organization's policy"?
- Is the behavior **consistent across all users**, or only specific users/groups?

> Goal: determine if this is **expected policy-driven UX** vs. unexpected behavior.

## 3. Scope & Impact

- How many users are affected? (Single user / Specific group / All users)
- Is this impacting **production workloads** or **business-critical scenarios**?
- Has this behavior **blocked users from completing their work**, or is it a usability concern?
- Is this happening in **all sessions**, or only specific Cloud PCs / host pools?

## 4. Reproducibility

- Can the issue be reproduced **every time**, or intermittently?
- Does it reproduce on **different devices** or **different networks**?
- Does the behavior change if:
  - The user signs out and reconnects?
  - The user connects from a different client (e.g., Web vs. Windows App)?

## 5. Identity & Conditional Access

These are **critical for context-based redirection**.
- Which **Conditional Access policy** is expected to apply?
- Is the user **definitely matching** the intended CA policy conditions? (User/group, Device compliance, Device platform)
- Have you checked **Entra sign-in logs** to confirm:
  - The policy was evaluated
  - The **Authentication Context claim** was issued?
- Do sign-in logs show the **expected Authentication Context ID**?

## 6. Recent Changes

- When did this behavior **start**?
- Were there any recent changes to:
  - Conditional Access policies
  - Authentication Context definitions
  - Intune / Windows 365 configuration
  - User group membership
- Was this feature recently moved from **Preview to GA**, or enabled for the first time?

## 7. Logs, Evidence & Technical Data

- Can you share:
  - **Entra sign-in logs** for an affected user session?
  - **Session diagnostics** from the client showing redirection status?
- In the session diagnostics, what is the reported state for: Clipboard, Drive, Printer, USB?
- Which **client version** is being used?

## 8. Known Limitations vs. Potential Bug

- Is the redirection behavior fully explained by CA policy, or different from what is configured?
- Are you expecting **dynamic behavior** (changes based on context), or **static behavior**?
- Does the issue reproduce **only on a specific client type**?
- Have you validated the same scenario in a **test user or pilot tenant**?

## 9. Workarounds / Mitigations

- Is it acceptable to temporarily remove the Authentication Context?
- Have you tested with a user not targeted by the policy, or a different redirection type?

## 10. CSS Next-Step Decision Aids (Internal)

- Policy evaluated + claim issued + behavior matches → **Expected / By design**
- Policy not applied or claim missing → **Identity / Entra collaboration**
- Claim present but enforcement incorrect → **W365 / AVD engineering**
- Client-specific behavior → **Windows App / UEX client team**
