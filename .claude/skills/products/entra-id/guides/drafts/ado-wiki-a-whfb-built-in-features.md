---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/Hello for Business/WHfB: Built in features"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FAuthentication%2FStrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29%2FHello%20for%20Business%2FWHfB%3A%20Built%20in%20features"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Windows Hello for Business Built-in Features

## PIN Reset

[Windows Hello for Business PIN Reset](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/pin-reset?tabs=intune) enables users to recover a forgotten WHfB PIN.

### How it works

- When a PIN is provisioned, a **Recovery Key** is created on the client.
- The **PIN Reset Service** sends a **Public key** to encrypt the recovery key, stored locally.
- When users click "I Forgot My PIN" at login, the client sends the encrypted recovery key to the PIN Reset Service. After user authentication, the service decrypts the key using its Private Key and sends it back.
- The decrypted key is used to associate the new PIN with existing keys (created during provisioning).

### Conditions when PIN Reset does NOT work

- **Windows 10 Professional**: PIN reset from Login Screen does not work. Requires **Windows 10 build 1709 Enterprise** or later.
- **PIN set before PIN Reset policy applied**: Users must first reset PIN from Settings > Accounts > Sign In Options > PIN / Change / I forgot My Pin. After that, the PIN Reset service will work from the login screen on subsequent attempts.

### Common Errors

- **"This feature is not supported in your organization"** when clicking "I Forgot My PIN":
  - Verify PIN Reset Service configuration
  - Ensure client has internet access to reach PIN Reset Service

## Dual Enrollment

Enables administrators to perform elevated functions by enrolling both nonprivileged and privileged credentials on their device.

Reference: [Windows Hello for Business Dual enrollment](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/dual-enrollment)

## Dynamic Lock

Automatically locks a Windows device when a Bluetooth-paired phone signal falls below the maximum RSSI value.

Reference: [Dynamic lock](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-feature-dynamic-lock)

## Multi-factor Unlock

Configure devices to request a combination of factors and trusted signals to unlock.

Reference: [Multi-factor unlock](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/multifactor-unlock?tabs=intune)

## Remote Desktop Sign-in with WHfB

Use WHfB to sign in to remote desktop sessions using RDP redirected smart card capabilities. Requires deploying a certificate to the user's device.

Reference: [Remote Desktop sign-in with Windows Hello for Business](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/rdp-sign-in?tabs=intune)
