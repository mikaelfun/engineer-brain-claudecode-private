---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/SSPR - Self Service Password Reset/Retirement Of Security Questions for SSPR"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/GeneralPages/AAD/AAD%20Account%20Management/SSPR%20-%20Self%20Service%20Password%20Reset/Retirement%20Of%20Security%20Questions%20for%20SSPR"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Retirement of Security Questions (SQSA) in SSPR

## Timeline
- **Retirement date**: March 8, 2027
- Announced mid-February
- After retirement, security questions will no longer be accepted in any SSPR workflow

## Impact
- Users relying only on security questions will NOT be able to reset passwords
- Admins must migrate users to alternative methods before cutoff

## Alternative Methods

### Available Now
1. SMS
2. Voice calls
3. Microsoft Authenticator push
4. Authenticator app (software OATH TOTP)
5. Hardware OATH (TOTP)
6. Email one-time passcode

### Public Preview
- **Verified ID with Face Check and Government ID** — Microsoft Entra ID Account Recovery using Verified ID + Face Check + government-issued ID validation

### Future (Roadmap)
- **Passkey Support** — synced passkeys, device-bound credentials, macOS PSSO, Windows Hello for Business (not yet available in SSPR)

## Exception Handling
Direct requests for exceptions to **Marina Sanchez**

## Training
- Deep Dive course: 341701 - Deprecation of Security Questions (SQSA) in Entra SSPR
- Format: Self-paced eLearning, 20 minutes
- Location: [Cloud Academy](https://aka.ms/AAzyec8)
