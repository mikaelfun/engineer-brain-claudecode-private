# DEFENDER Defender for DNS — Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: ado-wiki-d-defender-for-dns-technical-knowledge.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Defender For Dns
> Sources: ado-wiki

**1. Customer enabled Defender for DNS in Azure AD DS environment but cannot detect alerts when testing with validation scripts from Microsoft community articles**

- **Root Cause**: Defender for DNS only monitors Azure default DNS resolver (agentless). In Azure AD DS environments, the DNS resolver is the Domain Controller, not Azure default DNS resolver. This is not a supported configuration for Defender for DNS.
- **Solution**: Confirm VMs are using Azure default DNS resolver directly. Azure AD DS with Domain Controller as DNS resolver is not supported. Alerts will only trigger when the Domain Controller itself uses Azure default DNS resolver, but this is impractical as all alerts would attribute to the DC without additional logging.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**2. Customer using Azure DNS Private Resolver does not receive Defender for DNS alerts for DNS traffic flowing through private endpoints**

- **Root Cause**: Azure DNS Private Resolver is not supported by Defender for DNS. Traffic from on-prem to Inbound Endpoint and from VMs to Inbound Endpoint is not inspected. Only traffic from VMs to Azure DNS with DNS Forwarding rules through Outbound Endpoint is inspected.
- **Solution**: Explain supported vs unsupported DNS flows: (1) on-prem -> Inbound Endpoint: NOT inspected; (2) VMs -> Inbound Endpoint: NOT inspected; (3) VMs -> Azure DNS with forwarding rules via Outbound Endpoint: inspected. For full DNS protection, ensure VMs use Azure default DNS resolver directly. Feature request tracked: ADO Feature 25491202.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

**3. Customer does not receive Defender for DNS alerts even though the plan is enabled on the subscription**

- **Root Cause**: Defender for DNS alerts are sent only on VM resources that are directly owned by the customer and making direct DNS queries to Azure default DNS resolver. If VMs are managed/not owned by the customer, or using non-Azure DNS resolvers, alerts will not be generated. Note: As of Aug 2023, Defender for DNS is deprecated for new subscribers; alerts are now part of Defender for Servers P2.
- **Solution**: Verify: (1) VMs are directly owned by the customer subscription; (2) VMs use Azure default DNS resolver (not custom DNS servers); (3) For new subscribers after Aug 2023, enable Defender for Servers P2 instead. Existing Defender for DNS subscribers can continue using the standalone plan.
- ✅ **21V/Mooncake**: Applicable
- `[Score: 🟢 8.5/10 — ADO Wiki]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Customer enabled Defender for DNS in Azure AD DS environment but cannot detect alerts when testin... | Defender for DNS only monitors Azure default DNS resolver (agentless). In Azure AD DS environment... | Confirm VMs are using Azure default DNS resolver directly. Azure AD DS with Domain Controller as ... | 🟢 8.5 | ADO Wiki |
| 2 | Customer using Azure DNS Private Resolver does not receive Defender for DNS alerts for DNS traffi... | Azure DNS Private Resolver is not supported by Defender for DNS. Traffic from on-prem to Inbound ... | Explain supported vs unsupported DNS flows: (1) on-prem -> Inbound Endpoint: NOT inspected; (2) V... | 🟢 8.5 | ADO Wiki |
| 3 | Customer does not receive Defender for DNS alerts even though the plan is enabled on the subscrip... | Defender for DNS alerts are sent only on VM resources that are directly owned by the customer and... | Verify: (1) VMs are directly owned by the customer subscription; (2) VMs use Azure default DNS re... | 🟢 8.5 | ADO Wiki |
