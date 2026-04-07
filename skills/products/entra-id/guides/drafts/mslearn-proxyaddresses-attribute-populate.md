# How proxyAddresses Attribute is Populated in Entra ID

> Source: [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/proxyaddresses-attribute-populate)

## Overview

The proxyAddresses attribute in on-premises AD may differ from what appears in Entra ID due to **proxy calculation** logic. This logic takes into account mail, mailNickName, proxyAddresses, and UPN from on-premises AD.

## Key Concepts

- **MOERA** (Microsoft Online Email Routing Address): `mailNickName@tenant.onmicrosoft.com`, auto-added to proxyAddresses
- **Primary SMTP**: uppercase `SMTP:` prefix; **Secondary**: lowercase `smtp:`
- Addresses with reserved domain suffixes (`*.onmicrosoft.com`, `*.microsoftonline.com`) from on-premises are **discarded**
- Legacy protocols (MSMAIL, X400) and malformed addresses (missing SMTP prefix, spaces, invalid chars) are **discarded**
- Non-verified domain proxy addresses are removed when user has Exchange Online license

## Scenario Summary

| Scenario | Key Behavior |
|----------|-------------|
| No mail/mailNickName/proxyAddresses set | Primary SMTP = UPN; MOERA = mailNickName@initial-domain |
| mail set, no mailNickName/proxyAddresses | Primary SMTP = mail; mailNickName = mail prefix; UPN added as secondary |
| proxyAddresses changed | New primary SMTP replaces old; old MOERA kept; UPN kept as secondary |
| Exchange license removed | UPN-based SMTP removed; MOERA promoted to primary |
| mailNickName changed | mailNickName updated; mail and proxyAddresses unchanged |
| Duplicate mailNickName (two users) | Second user gets MOERA with 4 random digits appended |

## Troubleshooting Tips

- If proxyAddresses in Entra ID don't match on-premises, check proxy calculation rules
- Invisible characters in UPN or proxyAddresses cause silent discard
- Space after `SMTP:` prefix causes address to be silently dropped
- UPN with invalid chars -> Entra ID falls back to mailNickName@initial-domain
