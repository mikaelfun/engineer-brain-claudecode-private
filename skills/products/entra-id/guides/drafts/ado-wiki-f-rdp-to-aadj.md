---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/Device Registration/Window Devices/Microsoft Entra Join/Troubleshooting RDP to Azure AD Joined machines"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FDevice%20Registration%2FWindow%20Devices%2FMicrosoft%20Entra%20Join%2FTroubleshooting%20RDP%20to%20Azure%20AD%20Joined%20machines"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Troubleshooting RDP to Azure AD Joined Machines

## Prerequisites
- Local PC must be Azure AD-joined or Hybrid Azure AD-joined (Win10 1607+), or Azure AD registered (Win10 2004+)
- Remote PC must be Azure AD-joined
- Cannot RDP to Workplace Joined only machines

## P2P Server Service Principal
- Automatically registered in Azure AD after successful AADJ
- Essential for PKU2U authentication between DJ++ and AADJ devices
- App ID is unique per tenant

## RDP Authentication Flow
1. RDP Client: CloudAPPlugin requests User P2P certificate from ESTS using user credentials
2. RDP Client presents User P2P cert to RDP Server
3. RDP Server validates (same tenant CA) and presents Device P2P cert back
4. If validated, user credentials sent with device MS-Organization-Access cert to obtain PRT

## Certificate Details
| Certificate | Location | Validity | Renewal |
|-------------|----------|----------|---------|
| Device P2P (MS-Organization-P2P-Access) | Local Machine/Personal | 24 hours | Every 5 hours or reboot |
| User P2P | Not persisted | 1 hour | On demand |
| CA Root (AAD Token Issuer) | Local Machine/AAD Token Issuer | 1 year | Every 5 hours (AADJ), 24 hours (WPJ) |

Note: "Cannot be verified up to trusted certification authority" message is expected (self-signed CA).

## Troubleshooting Checklist
1. Both machines successfully Azure AD joined?
2. Check AAD Operational + Analytic logs on both client and server
3. Verify "Network security: Allow PKU2U authentication requests" policy is enabled on server
4. Review P2P certificates exist and are valid

## Known Issue
RDP reconnect shows "username or password is incorrect" — use `AzureAD\user@contoso.com` format as workaround (Windows Bug 31608330).

## Support Scope
- PKU2U: Windows Directory Service team
- Device registration/PRT: AAD Device Registration team
- Orange parts in flow diagram = AAD Auth scope
