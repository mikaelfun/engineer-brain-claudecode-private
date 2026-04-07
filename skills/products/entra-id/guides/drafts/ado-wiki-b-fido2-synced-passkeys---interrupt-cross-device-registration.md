---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Interrupt) Cross Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Synced%20Passkeys%20in%20Entra/%28Interrupt%29%20Cross%20Device%20Registration"
importDate: "2026-04-06"
type: registration-flow-reference
---

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

This experience usually appears when a user signs in to Microsoft Entra from a device other than their mobile phone. It is triggered when the organization uses conditional access to require synced passkeys for strong authentication, and the user has not yet registered a synced passkey.

___

# Cross-Device Registration (Interrupt mode)

1. **Initial Sign-in**

   - User signs into Microsoft Entra using their UPN and password using a desktop browser.
   - Conditional Access policy enforces authentication strength with AAGUIDs for synced passkeys.
   - Prompt: **More information required** > Click **Next** to satisfy MFA.

2. **Passkey Registration Begins**

   - Prompt: **Sign in faster with your face, fingerprint, or PIN** > Organization requires *Specific passkeys* > Click **Next**.

     ![RegInterrupt](/.attachments/AAD-Authentication/2264224/RegInterrupt.jpg)

     > **Note**: If the user clicks *Specific passkeys*, they are presented with a list of passkeys they can register to satisfy the login request.

      ![RegInterrupt](/.attachments/AAD-Authentication/2264224/WhichKey.jpg)

3. **Device Selection**

   - If user is in scope for Entra Passkey on Windows and synced passkeys:
     - Click **Change** > launches *Choose where to save your passkey* dialog.
     - Select **iPhone, iPad, or Android device**.

     ![ChangeRegDevice](/.attachments/AAD-Authentication/2264224/ChangeRegDevice.jpg)

4. **Passkey Setup**

   - Dialog: *Choose where to save your passkey* > Select **iPhone, iPad, or Android device**.

     ![WhereToSave](/.attachments/AAD-Authentication/2264224/WhereToSave.jpg)

   - Prompt: *Setting up your passkey...* > Click **Next**.

     ![SecureWindow](/.attachments/AAD-Authentication/2264224/SecureWindow.jpg)

   - Dialog: QR code appears showing the location where the synced passkey will be saved.

     ![QRcode](/.attachments/AAD-Authentication/2264224/QRcode.jpg)

   - Scan with camera app on mobile device > Tap **Save a passkey**.

     ![ScanQR](/.attachments/AAD-Authentication/2264224/ScanQR.jpg)

5. **Bluetooth Connection**

   - Bluetooth connects desktop and mobile device.

     ![BTConnect](/.attachments/AAD-Authentication/2264224/BTConnect.jpg)

6. **Provider Selection**

   - Choose where to store the passkey:

     - iPhone/iPad > iCloud Keychain (aka: Passwords app)

     - Android > Google Password Manager or Samsung Pass

     - Third-party apps (e.g., Bitwarden) may also appear

       ![SelectProvider](/.attachments/AAD-Authentication/2264224/SelectProvider.jpg)

7. **Passkey Storage**

   - Authenticate with Touch ID or PIN.

   - Passkey stored in selected mobile app as shown here.

     ![LocalPK](/.attachments/AAD-Authentication/2264224/LocalPK.jpg)

8. **Security Info Update**

   - Desktop browser shows popup: **login.microsoft.com is requesting extended information about your security key, which may affect your privacy.** 

   - Click **Allow** > Redirected to Security Info page.

     ![AllowRedirect](/.attachments/AAD-Authentication/2264224/AllowRedirect.jpg)

   - Name the passkey > Save to Entra ID account.

     ![NamePKinSecInfo](/.attachments/AAD-Authentication/2264224/NamePKinSecInfo.jpg)

9. **Sign-in to original page with Passkey**

   - Prompt: **Face, fingerprint, PIN or security key**

     ![SignInPostReg](/.attachments/AAD-Authentication/2264224/SignInPostReg.jpg)

   - Select **iPhone, iPad, or Android device**

     ![ChoosePK](/.attachments/AAD-Authentication/2264224/ChoosePK.jpg)

   - QR code appears.

     ![PostRegQRprompt](/.attachments/AAD-Authentication/2264224/PostRegQRprompt.jpg)

   - Scan QR code with camera app > Tap **Sign in with a passkey**.

     ![TapSignIn](/.attachments/AAD-Authentication/2264224/TapSignIn.jpg)

   - Bluetooth connects > Authenticate > Redirected to Keep Me Signed In (KMSI) prompt.

10. **Completion**

    - Sign-in completes using synced passkey that satisfies authentication strength.

___
