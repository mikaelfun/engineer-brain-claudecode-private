# ADFS Account Lockout via EXO Basic Authentication

> Source: entra-id-onenote-118 | Status: draft

## Confirm Brute Force Attack

Look for high volumes of these events:
- **Event 4740** in DC Security log — `Caller Computer Name` = ADFS servers
- **Event 411** in ADFS Security log (2012 R2)
- **Event 1210** in ADFS Security log (2016/2019)

Prerequisites: ADFS auditing must be enabled.

Source IP in events may include multiple addresses: actual attacker IP, EXO IP, Load Balancer IP, WAP IP.

### Identifying EXO as Source

- ADFS endpoint used: `/adfs/services/trust/2005/usernamemixed`
- At least 2 IPs visible: client IP + EXO IP
- Verify EXO IP: [Office 365 URLs and IP ranges](https://docs.microsoft.com/en-us/office365/enterprise/urls-and-ip-address-ranges)

## Mitigation Steps

### Short-term
1. **Disable EXO basic auth per-user** — focus on non-critical accounts first
   - [Disable basic auth in EXO](https://docs.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/disable-basic-authentication-in-exchange-online)
2. **Block malicious IPs on EXO**: `Set-OrganizationConfig contoso.onmicrosoft.com -IPListBlocked 127.0.0.1` (passive, less recommended)
3. **Adjust lockout thresholds** — raise AD lockout and/or ADFS lockout threshold (many customers set < 10, consider higher)

### Long-term
- Migrate to modern authentication (WAF can protect ADFS from direct attacks)
- Consider PHS or PTA for smart lockout capability (value-add, share only after trust established)

## Why Modern Auth Helps

WAF protects ADFS from direct attacks but cannot filter EXO-proxied traffic. Modern auth also costs more resources for attackers on `/adfs/ls/` vs `/adfs/services/trust/2005/usernamemixed`.

## Monitoring Extranet Smart Lockout (ESL)

| Event ID | Meaning |
|----------|---------|
| 516 | Account locked out (first time or observation window not passed) |
| 512 | Login attempt allowed after observation window passed |
| 515 | Successful login after observation window (transition) |
| 1210 | Extranet Smart Lockout triggered |
