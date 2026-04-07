---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Managed) Third Party Same Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Synced%20Passkeys%20in%20Entra/%28Managed%29%20Third%20Party%20Same%20Device%20Registration"
importDate: "2026-04-06"
type: registration-flow-reference
---

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

When a user signs in to the [Security Info](https://aka.ms/mysecurityinfo) page from their mobile device and manually adds a synced passkey that gets stored in a third-party passkey provider on that same mobile device.

___

# Third-Party Cross-Device Registration (Managed mode)

1. **Initial Sign-in**

	- User signs into the [Security Info](https://aka.ms/mysecurityinfo) page from a browser on their mobile device

2. **Passkey Registration Begins**

	- The user taps **+ Add sign-in method** > **Passkey** which launches the the **Setting up your passkey** prompt.

   ![RegInterrupt](.attachments/AAD-Authentication/2272333/\AddSPK.jpg)

3. **Passkey Setup**

   - Prompt: *Setting up your passkey...* > Click **Next**.

     ![SecureWindow](.attachments/AAD-Authentication/2272333/\SecureWindow.jpg)

4. **Provider Selection**

   - Choose to store the passkey on a Third-party app (e.g., Bitwarden)

     ![SelectProvider](.attachments/AAD-Authentication/2272333/\SelectProvider.jpg)

5. **Passkey Storage**

   - Tapping **Continue** prompts the user to satisfy biometric, supply a PIN, or master password to access the provider.

   ![UnlockProvider](.attachments/AAD-Authentication/2272333/\UnlockProvider.jpg)

   - It may be necessary to tell the third party provider what action to take, by taping an option like, **Save passkey as a new login**.

     ![SavePKtoProvider](.attachments/AAD-Authentication/2272333/\SavePKtoProvider.jpg)

6. **Security Info Update**

   - The user is redirected back to [Security Info](https://aka.ms/mysecurityinfo) where they name their passkey.

     ![NamePK](.attachments/AAD-Authentication/2272333/\NamePK.jpg)

   - Clicking **Next** stores the public key of the synced passkey to the user account in Entra.

     ![SavePKtoEntra](.attachments/AAD-Authentication/2272333/\SavePKtoEntra.jpg)

7. **Completion**

   - The synced passkey is a registered authentication method for the user.

     ![PKregistered](.attachments/AAD-Authentication/2272333/\PKregistered.jpg)
