# DEFENDER Defender for Cloud Apps — Troubleshooting Quick Reference

**Entries**: 3 | **21V**: not applicable
**Sources**: mslearn | **Last updated**: 2026-04-07

> This topic has a fusion troubleshooting guide with complete workflow
> → [Full troubleshooting workflow](details/defender-cloud-apps.md)

## Symptom Quick Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 | Defender for Cloud Apps session control shows 'This site isn't secure' or 'There's no internet co... | Firewall not allowing outbound port 443 to Defender for Cloud Apps data center IPs, or browser TL... | 1) Add outbound port 443 for MCAS data center IPs/DNS names to firewall; 2) Enable TLS 1.2 in bro... | 🔵 6.0 | MS Learn |
| 2 | Defender for Cloud Apps SIEM agent fails to connect after upgrading Java JRE to update 291 or higher | Newer Java versions lack Azure TLS Issuing CA certificates in default keystore, causing TLS hands... | Download Azure TLS Issuing CA certs (CA 01-08) from microsoft.com/pkiops/certs/ and import via ke... | 🔵 6.0 | MS Learn |
| 3 | Defender for Cloud Apps misidentifies Intune Compliant or Microsoft Entra hybrid joined devices; ... | Device information not properly synced from Microsoft Entra ID to MCAS; device state not correctl... | 1) Verify Device Identification settings in Settings > Cloud Apps > Conditional Access App Contro... | 🔵 5.0 | MS Learn |

## Quick Troubleshooting Path

1. 1) Add outbound port 443 for MCAS data center IPs/DNS names to firewall; 2) Enable TLS 1.2 in browser Internet Options; 3) Restart browser and verify sign-in `[Source: MS Learn]`
2. Download Azure TLS Issuing CA certs (CA 01-08) from microsoft.com/pkiops/certs/ and import via keytool -importcert. Restart SIEM agent. `[Source: MS Learn]`
3. 1) Verify Device Identification settings in Settings > Cloud Apps > Conditional Access App Control; 2) Check Entra ID > Sign-ins log > Device info tab to confirm Managed/Compliant status; 3) Create... `[Source: MS Learn]`
