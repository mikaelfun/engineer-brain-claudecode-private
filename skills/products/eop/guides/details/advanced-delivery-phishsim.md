# EOP Advanced Delivery 与钓鱼模拟 - Comprehensive Troubleshooting Guide

**Entries**: 5 | **Draft sources**: 2 | **Kusto queries**: 0
**Source drafts**: mslearn-advanced-delivery-policy.md, ado-wiki-b-Attack-Simulation-Training-FAQ.md
**Generated**: 2026-04-07

---

## Troubleshooting Workflow

### Phase 1: Third-party simulation tools are outside
> Source: ado-wiki

**Symptom**: Third-party phishing simulation messages are being blocked or detonated by MDO; customer expects them to be delivered unfiltered as part of a simulation exercise
**Root Cause**: Third-party simulation tools are outside the scope of Microsoft Attack Simulation and Training (AST). The messages are subject to EOP/MDO filtering unless explicitly bypassed via Advanced Delivery ...

1. Redirect to Advanced Delivery policy configuration. This is not an AST issue. Customer must configure the 3rd party simulation vendor's sending domain (P1Sender or DKIM domain) and sending IP in the Advanced Delivery > Third-party phishing simulations section of Microsoft Defender portal. Refer to the Advanced Delivery troubleshooting guide for detailed steps.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🟢 8.5/10 - [ADO Wiki]]`

### Phase 2: Multiple causes: 1) Sending IP
> Source: ado-wiki

**Symptom**: Third-party phishing simulation emails still quarantined/junked despite Advanced Delivery phish simulation override configured
**Root Cause**: Multiple causes: 1) Sending IP AND P1/DKIM domain must BOTH match. 2) Complex routing (MX to EOP to OnPrem to EOP) prevents identifying true source IP. 3) If DKIM signed, DKIM must PASS. 4) Message...

1. Check Authentication-Results header for sending IP and P1/DKIM domain. Compare with Get-ExoPhishSimOverrideRule - both SenderIpRanges AND Domains must match. For complex routing: route mail directly to M365 MX record. If MX not pointing to M365, enable Enhanced Filtering. Use Assist 365 Validate Phishing Simulation Policy Configuration diagnostic.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 3: Advanced Delivery prevents detonation but
> Source: ado-wiki

**Symptom**: Phishing simulation URLs still wrapped/rewritten by Safe Links despite Advanced Delivery override
**Root Cause**: Advanced Delivery prevents detonation but does NOT prevent Safe Links URL wrapping. DNR list is incompatible with Advanced Delivery.

1. Do NOT use DoNotRewriteUrls with Advanced Delivery - incompatible. To prevent wrapping, disable URL rewrite on Safe Links policy (requires Outlook Windows v16.0.15317.10000+ or Mac v16.74.23061100+). Per MC545900, configuring simulation URLs is no longer necessary for email-based simulations.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 4: Advanced Delivery only works for
> Source: ado-wiki

**Symptom**: IntraOrg email quarantined despite Advanced Delivery/SecOps config after enabling intra-org protection
**Root Cause**: Advanced Delivery only works for Inbound email. With intra-org protection, emails marked phish/spam intra-org (DIR:INT) quarantined because SecOps override not configured for intra-org.

1. Workarounds: 1) For SecOps: create separate anti-spam policy for SecOps mailboxes not quarantining intra-org. 2) For Phish Sim: create dedicated Receive connector without Externally secured auth, or route directly to M365 MX. Engineering fix pending ADO#3978403.

> :warning: 21Vianet: Not applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

### Phase 5: Various potential causes depending on
> Source: ado-wiki

**Symptom**: Microsoft Attack Simulation Training simulation emails, training reminders, notification messages, or QR code simulations not received by targeted users
**Root Cause**: Various potential causes depending on scenario (delivery pipeline, backend simulation engine, tenant configuration, RBAC, payload issues). Specific root cause requires minimum log collection and AS...

1. Collect minimum required logs before escalation per scenario: (1) Email/reminder/notification not received: TenantId + simulationId/simulationName + affected user email addresses. (2) Backend issues: TenantId + simulationId/simulationName. (3) QR code delay/failure: TenantId + simulationId + network capture. (4) Payload issues (HTML, image, phishing link, URL blocked): TenantId + simulationId + screenshot/network capture. (5) RBAC issues: TenantId + simulationId + Entra/Azure Portal configs. Submit with all required logs for AST team escalation.

> :white_check_mark: 21Vianet: Applicable

`[Score: 🔵 7.5/10 - [ADO Wiki]]`

---

## Decision Logic

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| Third-party phishing simulation messages are being blocke... | Third-party simulation tools are outside | -> Phase 1 |
| Third-party phishing simulation emails still quarantined/... | Multiple causes: 1) Sending IP | -> Phase 2 |
| Phishing simulation URLs still wrapped/rewritten by Safe ... | Advanced Delivery prevents detonation but | -> Phase 3 |
| IntraOrg email quarantined despite Advanced Delivery/SecO... | Advanced Delivery only works for | -> Phase 4 |
| Microsoft Attack Simulation Training simulation emails, t... | Various potential causes depending on | -> Phase 5 |

---

## Known Issues Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Third-party phishing simulation messages are being blocked or detonated by MD... | Third-party simulation tools are outside the scope of Mic... | Redirect to Advanced Delivery policy configuration. This is not an AST issue.... | 🟢 8.5 | [ADO Wiki] |
| 2 | Third-party phishing simulation emails still quarantined/junked despite Advan... | Multiple causes: 1) Sending IP AND P1/DKIM domain must BO... | Check Authentication-Results header for sending IP and P1/DKIM domain. Compar... | 🔵 7.5 | [ADO Wiki] |
| 3 | Phishing simulation URLs still wrapped/rewritten by Safe Links despite Advanc... | Advanced Delivery prevents detonation but does NOT preven... | Do NOT use DoNotRewriteUrls with Advanced Delivery - incompatible. To prevent... | 🔵 7.5 | [ADO Wiki] |
| 4 | IntraOrg email quarantined despite Advanced Delivery/SecOps config after enab... | Advanced Delivery only works for Inbound email. With intr... | Workarounds: 1) For SecOps: create separate anti-spam policy for SecOps mailb... | 🔵 7.5 | [ADO Wiki] |
| 5 | Microsoft Attack Simulation Training simulation emails, training reminders, n... | Various potential causes depending on scenario (delivery ... | Collect minimum required logs before escalation per scenario: (1) Email/remin... | 🔵 7.5 | [ADO Wiki] |
