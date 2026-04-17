---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: and TPMs"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)%2FHello%20for%20Business%2FWHfB%3A%20and%20TPMs"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# WHfB and TPMs

## Introduction

The TPM 2.0 specification refined and scoped aspects of TPM 1.2 that were left to vendor interpretation. Windows Hello for Business uses the TPM differently than BitLocker, Device Guard, and Credential Guard - a healthy TPM may work with those features but fail with WHfB.

## TPM States

### FIPS Mode
- FIPS mode is a setting, not a state - what it means varies by TPM manufacturer
- Some TPMs restrict algorithm usage in FIPS mode, causing WHfB incompatibility
- No easy workaround - cannot simply turn off FIPS in TPM
- Partner with OEM and potentially TPM manufacturer for resolution

### Not Ready
- Mismatch between BIOS configuration and OS expectations
- BIOS may have TPM enabled but not allow OS to configure/use it
- OEM BIOS settings vary: some have enable/disable only, others have granular control
- TPM BIOS settings can change after OEM firmware updates
- **Remediation**: Use Clear TPM feature in TPM management console

### Reduced Functionality
- TPM configured and ready but only subset of commands work
- Very common in TPM 1.2, especially older implementations
- Root cause determination is difficult and time-consuming
- **Remediation**: Use Clear TPM feature in TPM management console

### Ready
- Ideal state - TPM ready to receive commands
- Ready TPM with FIPS mode may still have limited capabilities
- Test if FIPS mode TPM is compatible with WHfB

## Identifying TPM State

Run from elevated command prompt:
```
certutil -v -tpminfo
```

Key sections to check:
- TPM version (1.2 vs 2.0)
- FIPS mode status
- Reduced functionality indicators
- Ready state confirmation
