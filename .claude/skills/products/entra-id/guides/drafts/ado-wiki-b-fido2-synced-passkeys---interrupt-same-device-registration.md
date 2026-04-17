---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/(Interrupt) Same Device Registration"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Synced%20Passkeys%20in%20Entra/%28Interrupt%29%20Same%20Device%20Registration"
importDate: "2026-04-06"
type: registration-flow-reference
---

[[_TOC_]]

# Compliance note

This wiki contains test/lab data only.

___

# Summary

This experience appears when a user signs in to Microsoft Entra from their mobile device. It is triggered when the organization uses conditional access to require synced passkeys for strong authentication, and the user has not yet registered a synced passkey.

___

# Same-Device Registration (Interrupt mode)

1. **Initial Sign-in**

   - User signs into Microsoft Entra using their UPN and password using a browser on their mobile device.
   - Conditional Access policy enforces authentication strength with AAGUIDs for synced passkeys.
   - Prompt: **More information required** > Click **Next** to satisfy MFA.

2. **Passkey Registration Begins**

   - Prompt: **Sign in faster with your face, fingerprint, or PIN** > Organization requires *Specific passkeys* > Click **Next**.

     ![RegInterrupt](/.attachments/AAD-Authentication/2264225/SDRegInterrupt.jpg)

      > **Note**: If the user clicks *Specific passkeys*, they are presented with a list of passkeys they can register to satisfy the login request.

      ![RegInterrupt](/.attachments/AAD-Authentication/2264225/WhichKey.jpg)

3. **Provider Selection**

   - Choose where to store the passkey:

     - iPhone/iPad > iCloud Keychain (aka: Passwords app)

     - Android > Google Password Manager or Samsung Pass

     - Third-party apps (e.g., Bitwarden) may also appear

       ![SelectProvider](/.attachments/AAD-Authentication/2264225/SDSelectProvider.jpg)

4. **Passkey Storage**

   - Authenticate with Touch ID or PIN.

5. **Security Info Update**

   - The user is redirected to **mysignins.microsoft.com**.

   - Name the passkey > Save to Entra ID account.

     ![NamePKinSecInfo](/.attachments/AAD-Authentication/2264225/SDNamePKinSecInfo.jpg)

6. **Sign-in to original page with Passkey**

   - Prompt: **Face, fingerprint, PIN or security key**

     ![SignInPostReg](/.attachments/AAD-Authentication/2264225/SDSignInPostReg.jpg)

   - User performs Touch ID or supplies PIN to provide access to the synced passkey.

     ![ChoosePK](/.attachments/AAD-Authentication/2264225/SDChoosePK.jpg)

7. **Completion**

   - Sign-in completes using synced passkey that satisfies authentication strength.

   - **Note**: (Outside of the registration flow) View the Passkey stored in selected mobile app as shown here.

     ![LocalPK](C:\Users\deverett\OneDrive - Microsoft\Identity\204685 - Passkey Profiles in Entra ID\Wiki\Registration-Flows\CDRMM\LocalPK.jpg)
