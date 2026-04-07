# DEFENDER Defender for DNS — Troubleshooting Quick Reference

**Entries**: 3 | **21V**: all applicable
**Sources**: ado-wiki | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-for-dns.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer enabled Defender for DNS in Azure AD DS environment but cannot detect alerts when testin... | Defender for DNS only monitors Azure default DNS resolver (agentless). In Azure AD DS environment... | Confirm VMs are using Azure default DNS resolver directly. Azure AD DS with Domain Controller as ... | 🟢 8.5 | ADO Wiki |
| 2 | Customer using Azure DNS Private Resolver does not receive Defender for DNS alerts for DNS traffi... | Azure DNS Private Resolver is not supported by Defender for DNS. Traffic from on-prem to Inbound ... | Explain supported vs unsupported DNS flows: (1) on-prem -> Inbound Endpoint: NOT inspected; (2) V... | 🟢 8.5 | ADO Wiki |
| 3 | Customer does not receive Defender for DNS alerts even though the plan is enabled on the subscrip... | Defender for DNS alerts are sent only on VM resources that are directly owned by the customer and... | Verify: (1) VMs are directly owned by the customer subscription; (2) VMs use Azure default DNS re... | 🟢 8.5 | ADO Wiki |

## Quick Troubleshooting Path

1. Confirm VMs are using Azure default DNS resolver directly. Azure AD DS with Domain Controller as DNS resolver is not supported. Alerts will only trigger when the Domain Controller itself uses Azure... `[Source: ADO Wiki]`
2. Explain supported vs unsupported DNS flows: (1) on-prem -> Inbound Endpoint: NOT inspected; (2) VMs -> Inbound Endpoint: NOT inspected; (3) VMs -> Azure DNS with forwarding rules via Outbound Endpo... `[Source: ADO Wiki]`
3. Verify: (1) VMs are directly owned by the customer subscription; (2) VMs use Azure default DNS resolver (not custom DNS servers); (3) For new subscribers after Aug 2023, enable Defender for Servers... `[Source: ADO Wiki]`
