---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Managed) Third Party Cross Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Synced%20Passkeys%20in%20Entra/%28Managed%29%20Third%20Party%20Cross%20Device%20Registration"
importDate: "2026-04-06"
type: registration-flow-reference
---

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

When a user signs in to the [Security Info](https://aka.ms/mysecurityinfo) page from a device other than their phone, they can manually add a synced passkey stored on their mobile device. This process uses Bluetooth to securely connect the two devices and confirm they’re nearby, helping prevent remote attacks.

___

# Cross-Device Registration (Managed mode)

1. **Initial Sign-in**

	- User signs into the [Security Info](https://aka.ms/mysecurityinfo) page from a desktop browser.

2. **Passkey Registration Begins**

	- The user clicks **+ Add sign-in method** > **Passkey** which launches the the **Setting up your passkey** prompt.

   ![RegInterrupt](/.attachments/AAD-Authentication/2272329/AddSPK.jpg)

3. **Device Selection**

   - Clicking **Next** launches a **Save your passkey prompt** which indicates the passkey will be saved on the local device:
     - Click **OK** > launches *Save your passkey* dialog
     - Click **Change** to the right of **This will be saved to your Windows device**.

   ![ChangeRegDevice](/.attachments/AAD-Authentication/2272329/ChangeRegDevice.jpg)

4. **Passkey Setup**

   - Dialog: *Choose where to save your passkey* > Select **iPhone, iPad, or Android device**.

     ![WhereToSave](/.attachments/AAD-Authentication/2272329/WhereToSave.jpg)

   - Prompt: *Setting up your passkey...* > Click **Next**.

     ![SecureWindow](/.attachments/AAD-Authentication/2272329/SecureWindow.jpg)

   - Dialog: QR code appears showing the location where the synced passkey will be saved.

     ![QRcode](/.attachments/AAD-Authentication/2272329/QRcode.jpg)

   - Scan with camera app on mobile device > Tap **Save a passkey**.

     ![ScanQR](/.attachments/AAD-Authentication/2272329/ScanQR.jpg)

5. **Bluetooth Connection**

   - Bluetooth connects desktop and mobile device.

     ![BTConnect](/.attachments/AAD-Authentication/2272329/BTConnect.jpg)

6. **Provider Selection**

   - Choose to store the passkey on a Third-party app (e.g., Bitwarden)

     ![SelectProvider](/.attachments/AAD-Authentication/2272329/SelectProvider.jpg)

   - If the third party provider is not the default in *Settings* tap **Save another way**, then select the provider where the passkey will be stored.

     ![SelectProvider2](/.attachments/AAD-Authentication/2272329/SelectProvider2.jpg)

   - The option comes up to open *Settings* to change the default provider or *Use once* to save the passkey without changing the default provider. *Use once* is used in this example.

     ![SelectProvider4](/.attachments/AAD-Authentication/2272329/SelectProvider4.jpg)

   - The Create passkey to sign in to Entra shows it will save to the third party provider.

     ![SelectProvider5](/.attachments/AAD-Authentication/2272329/SelectProvider5.jpg)

7. **Security Info Update**

   - Desktop browser shows popup: **login.microsoft.com is requesting extended information about your security key, which may affect your privacy.** 

   - Click **Allow** > Redirected to Security Info page.

     ![AllowRedirect](/.attachments/AAD-Authentication/2272329/AllowRedirect.jpg)

   - Name the passkey > Save to Entra ID account.

     ![NamePKinSecInfo](/.attachments/AAD-Authentication/2272329/NamePKinSecInfo.jpg)

10. **Completion**

   - Managed-mode registration is complete with the synced passkey saved to the user account.

     ![SyncedPKSaved](/.attachments/AAD-Authentication/2272329/SyncedPKSaved.jpg)

**Passkey Storage**

   - Launch the third party passkey provider

   - Authenticate with biometric, PIN or master password.

   - Passkey stored in selected mobile app as shown here.

     | Resource of Passkey | Passkey |
     |-----|-----|
     | ![ResourceOfPK](/.attachments/AAD-Authentication/2272329/ResourceOfPK.jpg) | ![LocalPK](/.attachments/AAD-Authentication/2272329/LocalPK.jpg) |
     

