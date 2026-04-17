---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/AVD or RDP Sign in using WHfB or FIDO2/AVD or RDP Sign in using WHfB or FIDO2 RDP Legacy Authentication flow"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Hello%20for%20Business/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2/AVD%20or%20RDP%20Sign%20in%20using%20WHfB%20or%20FIDO2%20RDP%20Legacy%20Authentication%20flow"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Legacy Authentication Flow (WHfB only)

## Configuration

- **AVD**: The Advanced RDP Property `enablerdsaadauth:i:1` must be removed from the session host or set to `0`.
- **Remote Desktop Client (mstsc.exe)**: Use the IP Address to connect. The **Advanced** option "Use a web account to sign in to the remote computer" must be disabled (unchecked) under User Authentication.

## How It Works

This flow uses the existing Windows credential provider that services Windows Hello for Business and Smart Card sign-in:

- If the user is signed into the source computer using their **password**: they see a username/password prompt. They must click "More choices" to expose PIN as an option.
- If the user is signed into the source computer using **WHfB**: they see a PIN prompt directly.

Both flows use a FIDO2 assertion to get the UPN of the user from the Hello credential. When the user supplies their PIN to unlock the key, the key is used as the secret. Since FIDO2 is used over CTAP the user will be signed into the target computer and will have an `mfa` claim in their PRT.

## Important Notes

- The PIN prompt does NOT state "Windows Hello" even though the user enters their WHfB PIN.
- **FIDO2 security keys cannot be used with this method**. If a FIDO2 security key with a registered credential is present, it appears with a smart card icon and shows error: "No valid certificates were found for this smart card. Please try another smart card or contact your administrator."
