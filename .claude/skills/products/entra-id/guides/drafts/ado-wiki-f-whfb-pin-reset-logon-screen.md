---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/Common scenarios/O2 PIN reset from logon screen"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/Hello%20for%20Business/Common%20scenarios/O2%20PIN%20reset%20from%20logon%20screen"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# PIN Reset from Logon Screen

The Microsoft PIN reset services enables users who have forgotten their PIN to reset it from the login screen.

Public doc: [Enable the Microsoft PIN Reset Service in your Microsoft Entra tenant](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/pin-reset?tabs=intune#enable-the-microsoft-pin-reset-service-in-your-microsoft-entra-tenant)

## How It Works

1. When a PIN is provisioned on the client, a **Recovery Key** is created.
2. The **PIN Reset Service** sends a **Public key** to the client to **encrypt the recovery key** and stores it locally.
3. When users click "I Forgot My PIN" on the login screen, the client sends the encrypted recovery key to the PIN reset service.
4. The user must authenticate, then the service **decrypts the key using its Private Key** and sends it back to the client.
5. This key associates the new PIN with the existing keys (created during PIN provisioning).

## Conditions Where PIN Reset Would Not Work

1. **Windows 10 Professional**: PIN reset from Login Screen does not work. Requires **Windows 10 build 1709 Enterprise** edition or later.
2. **PIN set before PIN reset policy applied**: Users must first reset their PIN from Settings > Accounts > Sign In options > PIN / Change / I forgot My Pin. This re-encrypts the recovery key with the PIN Reset Service public key.

## PIN Reset Flow

See: [Web Sign-in on Windows - PIN Reset section](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD/1184832/Web-Sign-in-on-Windows?anchor=pin-reset)

## Common Errors

- **"This feature is not supported in your organization. Please contact your administrator"**: Verify PIN Reset Service configuration and ensure client has internet access to connect to the PIN Reset Service endpoints.
