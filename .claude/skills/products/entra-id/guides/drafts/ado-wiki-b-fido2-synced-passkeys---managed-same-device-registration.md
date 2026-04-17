---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Managed) Same Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Synced%20Passkeys%20in%20Entra/%28Managed%29%20Same%20Device%20Registration"
importDate: "2026-04-06"
type: registration-flow-reference
---

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

When a user signs in to the [Security Info](https://aka.ms/mysecurityinfo) page using a browser on the mobile device where the manually added synced passkey will be stored. Unlike cross-device registration, this process does not use Bluetooth.

___

# Same-Device Registration (Managed mode)

1. **Initial Sign-in**

  - The user opens the [Security Info](https://aka.ms/mysecurityinfo) page in a browser on their mobile device, where the manually added synced passkey will be saved.

2. **Passkey Registration Begins**

	- The user taps **+ Add sign-in method** > **Passkey** which launches the the **Setting up your passkey** prompt.

     ![RegInterrupt](/.attachments/AAD-Authentication/2270825/AddSPK.jpg)

3. **Device Selection**

   - Tapping **Next** launches a **Sign in faster with your face, fingerprint, or PIN** prompt:
     
     ![ChangeRegDevice](/.attachments/AAD-Authentication/2270825/ChangeRegDevice.jpg)

6. **Provider Selection**

   - Choose where to store the passkey:

     - iPhone/iPad > iCloud Keychain (aka: Passwords app)

     - Android > Google Password Manager or Samsung Pass

     - Third-party apps (e.g., Bitwarden) may also appear

       ![SelectProvider](/.attachments/AAD-Authentication/2270825/SelectProvider.jpg)

7. **Passkey Storage**

   - Authenticate with Touch ID or PIN.

6. **Security Info Update**

   - After saving the synced passkey with the provider on the device, the user is redirected to the [Security Info](https://aka.ms/mysecurityinfo) page in their mobile browser.

   - There, they enter a name for the passkey.

   - When they click **Next**, the passkey is saved to their Entra ID account.

   - ![AllowRedirect](C:\Users\deverett\OneDrive - Microsoft\Identity\204685 - Passkey Profiles in Entra ID\Wiki\Registration-Flows\CDRMM\AllowRedirect.jpg)

     

     ![NamePKinSecInfo](C:\Users\deverett\OneDrive - Microsoft\Identity\204685 - Passkey Profiles in Entra ID\Wiki\Registration-Flows\MM\CDR\NamePKinSecInfo.jpg)

10. **Completion**

   - Managed-mode registration is complete with the synced passkey saved to the user account.

     ![SyncedPKSaved](/.attachments/AAD-Authentication/2270825/SyncedPKSaved.jpg)
     

   **Note**: (Outside of the registration flow) View the Passkey stored in selected mobile app as shown here.

| Resource of Passkey | Passkey |
|-----|-----|
| ![ResourceOfPK](/.attachments/AAD-Authentication/2270825/ResourceOfPK.jpg) | ![LocalPK](/.attachments/AAD-Authentication/2270825/LocalPK.jpg) |


