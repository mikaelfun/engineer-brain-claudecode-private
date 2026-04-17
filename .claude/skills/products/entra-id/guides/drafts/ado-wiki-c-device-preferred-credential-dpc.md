---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Entra ID Device Preferred Credential (DPC)"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FEntra%20ID%20Device%20Preferred%20Credential%20(DPC)"
importDate: "2026-04-07"
type: troubleshooting-guide
---

# Entra ID Device-Preferred Credential (DPC)

## Summary

Device-Preferred Credential (DPC) is a new sign-in logic that replaces the Most-Recently Used (MRU) credential selection. Instead of defaulting to the last used credential, DPC evaluates the best possible credential based on device context and available authentication methods.

## Configuration States

| State | Behavior |
|-------|----------|
| **Disabled** | MRU logic used, no DPC |
| **Microsoft Managed** | System-preferred for MFA only (default). Toggle for primary+MFA (preview) |
| **Enabled** | System-preferred for MFA only |

### Settings
- **Apply to both primary and MFA** toggle (preview): OFF = MFA only, ON = both primary and secondary
- Include/exclude specific users or groups
- Location: Authentication Methods > Settings > System-Preferred Authentication

## Factor Sort Order (Priority)
The system uses a global system-defined sort order prioritizing credentials by strength and phishing resistance (passkeys > CBA > Authenticator > SMS > password).

## Key Behaviors

1. **DPC is scoped to users**, not devices - device context evaluated dynamically
2. **No admin mapping required** - credential priority is system-defined and global
3. **Cross-device passkeys**: Synced passkeys detected and prompted via cross-device flow
4. **Policy change delay**: If policy changed for a target group, doesn't reflect on next sign-in but will for all subsequent sign-ins

## Design Limitations
- CA policy is validated only for MFA and doesn't apply to first-factor
- Policy changes for target groups take effect after one additional sign-in

## Test Scenarios

| # | Configuration | Scenario | Expected |
|---|--------------|----------|----------|
| 1 | Managed, Primary OFF | Passkey + Push + Password, passkey available | MRU 1FA (password), MFA: passkey |
| 2 | Managed, Primary ON | TAP + Passkey + Password, TAP active | TAP first, completes both factors |
| 3 | Disabled | Any | MRU logic, no DPC |
| 4 | Enabled | Password + Auth app + SMS | MRU 1FA (password), MFA: Authenticator push |
| 5 | Managed, Primary ON | CBA + Password + Auth app | CBA first, no further MFA needed |
| 6 | Managed, Primary ON | Passkey on iOS, sign-in on Android | iOS: passkey, Android: Authenticator (best available) |

## FAQ Highlights
- DPC is configured per user, not per device
- No admin credential mapping needed
- Cross-device passkeys supported
- CBA can satisfy both primary and MFA requirements when DPC is ON for primary
