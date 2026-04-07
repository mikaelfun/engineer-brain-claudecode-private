# Enrollment Status Page (ESP) - Phases and Steps

## Overview
Detailed breakdown of what happens during each phase and step of the Enrollment Status Page.

## Three Main Phases

### Phase 1: Device Preparation
Fixed set of tasks before ESP can track device provisioning.

| Step | What It Does |
|---|---|
| Securing your hardware | Self-deploying mode: TPM attestation for Azure AD join. Other scenarios: does nothing. |
| Joining your organization's network | AAD Join: tracks AAD join process. AD Join: does nothing (join occurs before ESP). |
| Registering for mobile management | AAD Join: does nothing (AAD join triggers auto MDM enrollment). HAADJ: enrollment occurs before ESP. |
| Preparing for mobile management | Waits for policy list from MDM. May need to install additional policy providers. Can take a while. |

### Phase 2: Device Setup
All device-targeted policies delivered and some tracked.

| Step | What It Tracks |
|---|---|
| Security policies | Always shows "0 of 1" then "1 of 1" - not actually tracking real security policies. |
| Certificates | SCEP-issued certificates targeted to the device. |
| Network connections | Wi-Fi profiles targeted to the device. |
| Apps | MSI LOB apps, Win32 apps (via IME), Office 365 ProPlus. IME MSI itself is counted. PowerShell scripts NOT tracked. White glove: also includes user-targeted device-context apps. |

### Between Phases: First Sign-In Animation (FSIA)
- Shows blue shades animation
- Manual sign-in required if: device rebooted during Device Setup, or performing HAADJ

### Phase 3: Account Setup
All user-targeted policies delivered and some tracked.

| Step | What It Tracks |
|---|---|
| Joining your organization's network | HAADJ: waits for AAD Connect device sync (runs every 30 min). AAD Join: does nothing. |
| Security policies | Same dummy tracking as Device Setup phase. |
| Certificates | SCEP certificates targeted to the user. WARNING: WHfB certs may cause blocking. |
| Network connections | Wi-Fi profiles targeted to the user. |
| Apps | User-targeted required apps: MSI, Win32, O365 ProPlus, UWP apps. PowerShell scripts NOT tracked. |

## Key Notes
- ESP can filter which apps to track (subset of targeted required apps)
- Untracked apps still install, just not shown in ESP
- PowerShell scripts are never tracked by ESP
- WHfB is set up AFTER ESP completes; WHfB cert tracking can cause ESP failure
- Credentials cannot be stored across reboots (security)
- HAADJ requires two sign-ins (one for AAD, one for AD)

## Source
Based on analysis from oofhours.com ESP internals documentation.
