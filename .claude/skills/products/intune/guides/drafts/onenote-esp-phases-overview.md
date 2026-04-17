# Enrollment Status Page (ESP) Phases and Steps

## Overview
The ESP has three main phases tracking device provisioning during Autopilot/OOBE.

## Phase 1: Device Preparation (Fixed Tasks)
- **Securing your hardware** - TPM attestation for self-deploying mode; no-op for other scenarios
- **Joining your organization's network** - Azure AD join process (no-op for Hybrid AADJ)
- **Registering for mobile management** - MDM enrollment (auto-triggered by AADJ; pre-loaded for HAADJ)
- **Preparing for mobile management** - Waiting for policy list (security, certs, network, apps). May require installing additional policy providers.

## Phase 2: Device Setup (Device-targeted Policies)
- **Security policies** - Always shows "0 of 1" -> "1 of 1" (dummy tracking, not real security policy count)
- **Certificates** - SCEP-issued device certificates
- **Network connections** - Wi-Fi profiles targeted to device
- **Apps** - MSI LOB apps, Win32 apps (via IME), Office 365 ProPlus. IME itself counted in app count. Can be filtered in ESP settings. With white glove + assigned user, user-targeted device-context apps also included.

## Between Phases: First Sign-In Animation (FSIA)
Re-sign-in required when:
- Device reboots during Device Setup (credentials not stored across reboots)
- Hybrid Azure AD Join (first: AAD auth, second: AD auth)

## Phase 3: Account Setup (User-targeted Policies)
- **Joining your organization's network** - For HAADJ: waiting for AAD Connect sync (30-min cycle). If sync completes before user signs in, everything is ready.
- **Security policies** - Same dummy "1 of 1" tracking
- **Certificates** - SCEP user certificates. Caution: WHfB certs may block ESP if WHfB not yet set up.
- **Network connections** - User-targeted Wi-Fi profiles
- **Apps** - MSI, Win32, Office 365, UWP apps (user-targeted required). PowerShell scripts NOT tracked.

## Key Notes
- ESP can be filtered to track only a subset of targeted apps
- Untracked apps still install, just not shown in progress
- PowerShell scripts are not tracked by ESP in any phase
