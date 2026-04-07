# DEFENDER Defender for Cloud Apps — Comprehensive Troubleshooting Guide

**Entries**: 3 | **Draft sources**: 1 | **Kusto queries**: 0
**Source drafts**: mslearn-cloud-apps-anomaly-detection-investigation.md
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Mcas
> Sources: mslearn

**1. Defender for Cloud Apps session control shows 'This site isn't secure' or 'There's no internet connection' network error when accessing protected app**

- **Root Cause**: Firewall not allowing outbound port 443 to Defender for Cloud Apps data center IPs, or browser TLS 1.2 not enabled
- **Solution**: 1) Add outbound port 443 for MCAS data center IPs/DNS names to firewall; 2) Enable TLS 1.2 in browser Internet Options; 3) Restart browser and verify sign-in
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for Cloud Apps SIEM agent fails to connect after upgrading Java JRE to update 291 or higher**

- **Root Cause**: Newer Java versions lack Azure TLS Issuing CA certificates in default keystore, causing TLS handshake failures
- **Solution**: Download Azure TLS Issuing CA certs (CA 01-08) from microsoft.com/pkiops/certs/ and import via keytool -importcert. Restart SIEM agent.
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Defender for Cloud Apps misidentifies Intune Compliant or Microsoft Entra hybrid joined devices; device state filter not working in access/session policies**

- **Root Cause**: Device information not properly synced from Microsoft Entra ID to MCAS; device state not correctly reflected in Entra ID Sign-ins logs
- **Solution**: 1) Verify Device Identification settings in Settings > Cloud Apps > Conditional Access App Control; 2) Check Entra ID > Sign-ins log > Device info tab to confirm Managed/Compliant status; 3) Create access/session policy with Device Tag filter; 4) Some browsers may require Conditional Access extension
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 ⚠️ | Defender for Cloud Apps session control shows 'This site isn't secure' or 'There's no internet co... | Firewall not allowing outbound port 443 to Defender for Cloud Apps data center IPs, or browser TL... | 1) Add outbound port 443 for MCAS data center IPs/DNS names to firewall; 2) Enable TLS 1.2 in bro... | 🔵 6.0 | MS Learn |
| 2 ⚠️ | Defender for Cloud Apps SIEM agent fails to connect after upgrading Java JRE to update 291 or higher | Newer Java versions lack Azure TLS Issuing CA certificates in default keystore, causing TLS hands... | Download Azure TLS Issuing CA certs (CA 01-08) from microsoft.com/pkiops/certs/ and import via ke... | 🔵 6.0 | MS Learn |
| 3 ⚠️ | Defender for Cloud Apps misidentifies Intune Compliant or Microsoft Entra hybrid joined devices; ... | Device information not properly synced from Microsoft Entra ID to MCAS; device state not correctl... | 1) Verify Device Identification settings in Settings > Cloud Apps > Conditional Access App Contro... | 🔵 5.0 | MS Learn |
