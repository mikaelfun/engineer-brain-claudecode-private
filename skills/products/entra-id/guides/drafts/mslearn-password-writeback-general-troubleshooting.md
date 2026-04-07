# Password Writeback General Troubleshooting Steps

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/password-writeback-general-troubleshooting-steps

## Overview

General troubleshooting methodology for password writeback issues in Microsoft Entra Connect.

## Key Steps

### 1. Focus on the exact failure scenario
- Distinguish between **password reset** (user doesn't know current password) vs **password change** (user provides current password)
- Be consistent in repro steps — use the same operation each time

### 2. Compare working vs non-working users
- Export AD user info via `Ldifde` or `Get-ADUser`
- Get Entra ID info via Microsoft Graph PowerShell
- Compare: admin roles, group membership, OU placement, last sync time, password sync time

### 3. Use the same domain controller
- Set a preferred DC in AD Connector → Synchronization Service Manager → Connectors → Properties → Configure Directory Partitions
- Use the DC that owns PDC emulator role or the nearest one
- Also point Active Directory Users and Computers (dsa.msc) to the same DC

### 4. Temporarily relax AD password policy
- Set minimum password age to 0
- Use complex passwords (upper + lower + numerals)
- Always use a new password (history typically enforces 24 remembered)
- Increment an integer suffix for each test (Password1, Password2, etc.)

### 5. Check Application Events (Event Viewer)
- Most writeback-specific articles reference Event Viewer entries
- `Eventvwr.msc` is the most effective tool for password writeback troubleshooting

### 6. Identify the AD DS Connector account
- Verify the MSOL_ account name in Synchronization Service Manager
- Ensure it matches the account Microsoft Entra Connect actually uses

### 7. Check supported vs unsupported operations
- Review: [How does SSPR writeback work](https://learn.microsoft.com/en-us/azure/active-directory/authentication/concept-sspr-writeback)
