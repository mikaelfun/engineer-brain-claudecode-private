---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Drafts/TABL - FAQ"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=/Drafts/TABL%20-%20FAQ"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Tenant Allow/Block List (TABL) — FAQ & Troubleshooting

## Overview

The Tenant Allow/Block List (TABL) in Microsoft Defender for Office 365 enables admins to manage specific senders, domains, and other entities that should be explicitly **allowed** or **blocked**. Configurable through Microsoft Defender portal or Exchange Online PowerShell.

> **NB:** TABL sender allow/block is **not enabled on IntraOrg messages**.

## How to Use TABL

### Check RBAC Permissions
Verify roles are assigned that permit TABL management. Connect via `Connect-ExchangeOnline`.

### Add/Verify Entries

**Defender Portal:**
- Email & collaboration → Policies & rules → Threat policies → Rules → Tenant Allow/Block Lists
- Direct URL: https://security.microsoft.com/tenantAllowBlockList

**PowerShell:**
```powershell
# Add blocked sender domain
New-TenantAllowBlockListItems -ListType Sender -Block -Entries "testdomain12.com" -Verbose

# Verify
Get-TenantAllowBlockListItems -ListType [FileHash,Sender,URL,IP]
```

## Key Facts

- **No "Never Expire" for allows** — Rejected by design to prevent list bloat and reduce phishing risks.
- **IPv4 not supported** — Only IPv6 addresses supported. Use default connection filter policy for IPv4.
- **Entry limits** depend on customer license.

## Troubleshooting

### 1. Known Issues
- **ZAP does not honor TABL sender allow for high confidence phish** (Feature 6044388). TABL URL allow IS honored by ZAP.

### 2. Admins Can't Add Entries
- Check RBAC/URBAC permissions. Exchange Online Permissions must be enabled.

### 3. URL Not Blocked/Allowed as Expected
- Check URL entry syntax, especially wildcards. Refer to valid URL entry scenarios.

### 4. Spoofed Sender Entries Not Saving
- Cause: Multiple HostedConnectionFilterPolicies. TABL spoof entries retrieved only from policy where `isDefault = true`.
- Fix: Set first policy's isDefault to true → Delete second policy → Re-add entries.

### 5. Spoofed Sender Pair Only Works with Subdomain
- Infrastructure domain must match PTR record in Authentication-Results header.
- Use PTR Organization Domain (e.g., if PTR = smtp.inbound.contoso.com, use contoso.com).

### 6. SpoofType for Accepted Domains Shows as External
- Known issue. See Known Issues page for details.

## Escalation Checklist
- Confirm not a known issue or by-design behavior
- Reproduce in test tenant and check previous similar escalations
- Collect: Network Message IDs, URLs, Spoofed sender/user, Diagnostic results, Tenant ID
