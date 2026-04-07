# GPO Administrative Templates Deployment for WHFB

> Source: OneNote MCVKB — WHFB Configuration (Detailed + Simple reference)
> Quality: guide-draft | Needs: review, merge with official docs

## Overview

Deploying the latest GPO Administrative Templates (ADMX) is required to configure WHFB policies via Group Policy in hybrid environments. This guide covers getting, deploying, and verifying templates in the Central Store.

## Steps

### 1. Get the Templates

**Option A** — Copy from existing Win10/Win11 client:
```
Copy all files from C:\Windows\PolicyDefinitions on a source computer
```

**Option B** — Download from Microsoft:
- [Administrative Templates (.admx) for Windows 11 22H2 - v3.0](https://www.microsoft.com/en-us/download/details.aspx?id=105390)
- Install the MSI, then copy from `C:\Program Files (x86)\Microsoft Group Policy\<version>\PolicyDefinitions`

### 2. Deploy to Central Store (SYSVOL)

Target location on Domain Controller:
```
\\domain.com\SYSVOL\domain.com\Policies\PolicyDefinitions\
```

- If `PolicyDefinitions` folder does not exist under SYSVOL → copy entire folder directly
- If it already exists → copy contents into existing folder, choose "Replace files" for duplicates
- Structure: `.admx` files in root, `.adml` language files in `en-US\` subfolder

### 3. Verify Deployment

Open GPMC console → Edit a GPO:
- **No store configured**: shows "Administrative Templates" without source label
- **Central Store**: shows "Administrative Templates: Policy definitions (ADMX files) retrieved from the central store"
- **Local Store**: shows local path reference

## Notes

- Administrative Templates are backward-compatible — updating templates does NOT break existing GPO settings
- No need to worry about version compatibility; newer templates support older OS versions
- For WHFB-specific policies, ensure the templates include `passport.admx` (Windows Hello for Business)

## References

- [Create and manage Central Store for GPO](https://learn.microsoft.com/en-us/troubleshoot/windows-client/group-policy/create-and-manage-central-store)
- [WHFB Hybrid Cloud Kerberos Trust - GPO tab](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/deploy/hybrid-cloud-kerberos-trust?tabs=gpo)
