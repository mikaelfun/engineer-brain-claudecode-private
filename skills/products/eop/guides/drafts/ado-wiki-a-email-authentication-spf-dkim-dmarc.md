---
source: ado-wiki
sourceRef: "ASIM-Security/Messaging Protection/Messaging Protection Wiki:/Troubleshooting Guides/Email Authentication/Email Authentication - SPF DKIM and DMARC"
sourceUrl: "https://dev.azure.com/ASIM-Security/Messaging%20Protection/_wiki/wikis/Messaging%20Protection%20Wiki?pagePath=%2FTroubleshooting%20Guides%2FEmail%20Authentication%2FEmail%20Authentication%20-%20SPF%20DKIM%20and%20DMARC"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Email Authentication - SPF, DKIM, and DMARC

SPF, DKIM, and DMARC evaluation results are added to the Authentication-Results header of inbound messages.

**NOTE**: A failure in CAUTH does not directly lead to an email being blocked. EOP uses a holistic evaluation strategy considering overall suspicious nature alongside CAUTH outcomes.

## SPF (Sender Policy Framework)

SPF uses a DNS TXT record to store authorized sending IP addresses for a given domain. SPF check verifies the connecting IP against the 5321.MailFrom domain.

### SPF Status Table

| Result | Explanation | EOP Action |
|--------|-------------|------------|
| Pass | Host is allowed to send | None |
| Fail | Connecting IP not in SPF, hardfail configured | Increase spam score. If SPF Hard Fail enabled, SCL 9 |
| SoftFail | Connecting IP not in SPF, softfail configured | Increase spam score |
| Neutral | SPF explicitly says nothing about validity | None |
| None | No SPF record or no result | None |
| PermError | Syntax error in SPF record | None |
| TempError | DNS timeout during SPF check | None |

### Key Points

- If MX doesn't point to O365, SPF checks use the IP of the server handing off to O365, not the original sender
- SPF Hard Fail marks both Fail AND SoftFail as SCL 9 -- USE IS STRONGLY DISCOURAGED
- SPF does not protect against spoofing the 5322.From (display) address
- Lookup: `Resolve-DNSName -Name contoso.com -type TXT`

### SPF Macros

Macros (RFC 7208 section 7.2) allow dynamic SPF policies. Key variables:
- `%{i}` = sender IP, `%{d}` = domain, `%{s}` = sender, `%{l}` = local-part
- Example: `v=spf1 exists:%{i}._i.%{d}._d.espf.agari.com` -- substitute IP and domain to resolve

### Tools

- [DMARCIAN SPF Survey](https://dmarcian.com/spf-survey/)
- [MX Toolbox](https://mxtoolbox.com/spf.aspx)
- [Dig Web Interface](https://www.digwebinterface.com/)
- [SPF Policy Tester (Vamsoft)](https://vamsoft.com/support/tools/spf-policy-tester) -- supports macro expansion

## DKIM (DomainKeys Identified Mail)

### Enabling DKIM in Exchange Online

1. Create two CNAME records:
   - `selector1._domainkey.contoso.com` -> `selector1-contoso-com._domainkey.contoso.onmicrosoft.com`
   - `selector2._domainkey.contoso.com` -> `selector2-contoso-com._domainkey.contoso.onmicrosoft.com`

2. Get exact CNAME values: `New-DkimSigningConfig -DomainName contoso.com -Enabled $True -whatif`

3. Wait 10-60 minutes for DNS propagation, then enable: `New-DkimSigningConfig -DomainName contoso.com -Enabled $True`

4. For hybrid: route all outbound through O365, or install local DKIM agent with different selector (e.g., selector3)

## DMARC (Domain-based Message Authentication, Reporting, and Conformance)

DMARC validates the From (5322.From) address using SPF and DKIM alignment.

### DMARC Alignment

- **Relaxed mode**: subdomains allowed (contoso.com aligns with sub.contoso.com)
- **Strict mode**: exact match required

For DMARC to pass, ONE must be true:
1. From domain matches MailFrom domain AND SPF passes
2. DKIM passes AND DKIM signature domain (d=) matches From domain

### DMARC Status Table

| Result | Action | EOP Action |
|--------|--------|------------|
| None | - | None (no DMARC record) |
| Pass | Any | None |
| Fail | Reject | Mark spam, PCL 8 |
| Fail | Quarantine | Mark spam |
| Fail | None | None |
| bestguesspass | - | None (would have passed if record existed) |

### Key Points

- Parent domain DMARC applies to subdomains unless they have their own record
- Subdomains can use `sp=none/reject/quarantine` in parent record
- For onmicrosoft.com domains: SPF auto-configured, DKIM auto-signs
- DMARC record published at `_dmarc.contoso.com`

### Sample DMARC Deployment Plan

1. Configure SPF hardfail (or transport rule for softfail review)
2. Publish DMARC with p=none: `v=DMARC1;p=none;pct=100;rua=mailto:mailbox@contoso.com`
3. Create transport rule to report failures (BCC or incident report)
4. Wait ~1 week, review false positives, adjust SPF, work with 3rd parties
5. Gradually move to quarantine/reject action
