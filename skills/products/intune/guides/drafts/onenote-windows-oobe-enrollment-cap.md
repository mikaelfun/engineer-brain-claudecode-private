# Windows OOBE Enrollment Process with Conditional Access Policy

> Source: OneNote — Mooncake POD Support Notebook/Intune/Windows TSG/Windows Enrollment

## Overview

This guide documents the step-by-step Windows OOBE enrollment flow when a Conditional Access Policy (CAP) enforcing device compliance is in place.

## Key Insight

Intune MDM enrollment can proceed even when a CAP requires device compliance. This is by-design: the enrollment process uses a special token flow that bypasses the compliance requirement during initial enrollment (chicken-and-egg scenario).

## Enrollment Flow

1. **Login to Microsoft Entra ID** during OOBE
2. **MFA kicks in** (if configured)
3. **Discover tenant realm** — ENROLLClient queries tenant endpoints
4. **Device Registration** — dsreg creates TPM-bound RSA 2048-bit key pair (device key dkpub/dkpriv + transport key tkpub/tkpriv), initiates PKCS device certificate request
5. **Receive device certificate** — Device ID + device certificate received from DRS
6. **Discover Intune service endpoints** — MDM discovery call from Windows ENROLLClient to Intune
7. **Intune enrollment** — MDM enrollment client authenticates and enrolls despite CAP requiring compliance (by-design)
8. **Receive MDM device certificate** — Intune MDM device certificate received

## Event Log Locations

- `Microsoft\Windows\User Device Registration\Admin` — Device registration events
- Entra Sign-In Logs — Device Registration Service events
- Entra Audit Logs — Microsoft Intune Enrollment events

## Troubleshooting Tips

- If enrollment fails at step 3, check DNS records for `enterpriseregistration` and `enterpriseenrollment`
- If enrollment fails at step 4, verify TPM is functional and not in lockout
- If enrollment fails at step 7 with CAP error, this is NOT expected — escalate to PG as the enrollment bypass should work
