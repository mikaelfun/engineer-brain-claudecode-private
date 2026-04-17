# How proxyAddresses Attribute Is Populated in Entra ID

> Source: https://learn.microsoft.com/en-us/troubleshoot/entra/entra-id/user-prov-sync/proxyaddresses-attribute-populate

## Key Concepts

- **MOERA**: Microsoft Online Email Routing Address = mailNickName@initial-domain.onmicrosoft.com
- **Proxy Calculation**: Internal Entra ID logic that processes mail, mailNickName, proxyAddresses
- **Primary SMTP**: Uppercase `SMTP:` prefix; Secondary: lowercase `smtp:`

## Proxy Calculation Rules

1. **Reserved domain suffixes discarded**: @*.onmicrosoft.com, @*.microsoftonline.com
2. **Legacy protocols discarded**: MSMAIL, X400, etc.
3. **Malformed addresses discarded**: Missing SMTP: prefix, spaces, invalid chars per RFC 5322
4. **Non-verified domain addresses removed**: Only if user has Exchange Online license
5. **UPN auto-added as proxy**: When user has Exchange license

## Scenario Quick Reference

| Scenario | Behavior |
|----------|----------|
| No mail/mailNickName/proxy set | mailNickName = UPN prefix; with EXO license: Primary SMTP = UPN |
| mail set, no proxy | Primary SMTP = mail value; mailNickName = mail prefix |
| proxyAddresses changed | New primary SMTP applied; old MOERA kept; UPN kept as secondary |
| Exchange license removed | UPN address removed; MOERA promoted to Primary SMTP |
| mailNickName changed | mailNickName updated; mail and proxyAddresses unchanged |
| Duplicate mailNickName | Second user gets MOERA with 4 random digits appended |

## Troubleshooting Tips
- On-prem proxyAddresses ≠ Entra ID proxyAddresses is EXPECTED due to proxy calculation
- Check if reserved domain suffixes were discarded
- Check if Exchange Online license is assigned (affects which addresses appear)
- Invisible characters in UPN/proxyAddresses cause silent discards
