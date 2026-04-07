---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Synced Passkeys in Entra/*"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless(WHfB%20FIDO%20phone%20based)/FIDO2%20passkeys/FIDO2:%20Synced%20Passkeys%20in%20Entra"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Synced Passkeys Registration Flows in Entra ID

This guide consolidates the expected user experiences for registering synced passkeys across different scenarios.

## Interrupt Mode: Cross-Device Registration

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

---

## Interrupt Mode: Same-Device Registration

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

---

## Interrupt Mode: Third-Party Cross-Device Registration

# Summary

This experience usually appears when a user signs in to Microsoft Entra from a device other than their mobile phone where the third party passkey provider is installed. It is triggered when the organization uses conditional access to require synced passkeys for strong authentication, and the user has not yet registered a synced passkey.

___

# Third Party Cross-Device Registration (Interrupt mode)

1. **Initial Sign-in**

   - User signs into Microsoft Entra using their UPN and password using a desktop browser.
   - Conditional Access policy enforces authentication strength with AAGUIDs for synced passkeys.
   - Prompt: **More information required** > Click **Next** to satisfy MFA.

2. **Passkey Registration Begins**

   - Prompt: **Sign in faster with your face, fingerprint, or PIN** > Organization requires *Specific passkeys* > Click **Next**.

     **Note**: Clicking the **Specific keys** link required by the organization informs the user of the type they must register.
     
     ![RegInterrupt](/.attachments/AAD-Authentication/2272348/RegInterrupt.jpg)

      > **Note**: If the user clicks *Specific passkeys*, they are presented with a list of passkeys they can register to satisfy the login request.

      ![RegInterrupt](/.attachments/AAD-Authentication/2272348/WhichKey.jpg)

3. **Device Selection**

   - If user is in scope for Entra Passkey on Windows and synced passkeys:
     - Click **Change** > launches *Choose where to save your passkey* dialog.
     - Select **iPhone, iPad, or Android device**.

     ![ChangeRegDevice](/.attachments/AAD-Authentication/2272348/ChangeRegDevice.jpg)

4. **Passkey Setup**

   - Dialog: *Choose where to save your passkey* > Select **iPhone, iPad, or Android device**.

     ![WhereToSave](/.attachments/AAD-Authentication/2272348/WhereToSave.jpg)

   - Prompt: *Setting up your passkey...* > Click **Next**.

     ![SecureWindow](/.attachments/AAD-Authentication/2272348/SecureWindow.jpg)

   - Dialog: QR code appears showing the location where the synced passkey will be saved.

     ![QRcode](/.attachments/AAD-Authentication/2272348/QRcode.jpg)

   - Scan with camera app on mobile device > Tap **Save a passkey**.

     ![ScanQR](/.attachments/AAD-Authentication/2272348/ScanQR.jpg)

5. **Bluetooth Connection**

   - Bluetooth connects desktop and mobile device.

     ![BTConnect](/.attachments/AAD-Authentication/2272348/BTConnect.jpg)

6. **Provider Selection**

   - Choose to store the passkey on a Third-party app (e.g., Bitwarden)

     ![SelectProvider](/.attachments/AAD-Authentication/2272348/SelectProvider.jpg)
     
   - Satisfy biometrics, PIN or master password to unlock the provider.

     ![UnlockProvider](/.attachments/AAD-Authentication/2272348/UnlockProvider.jpg)

   - If prompted, tap **Save a passkey as new login**.

     ![TapSavePK](/.attachments/AAD-Authentication/2272348/TapSavePK.jpg)

7. **Security Info Update**

   - Desktop browser shows popup: **login.microsoft.com is requesting extended information about your security key, which may affect your privacy.** 

   - Click **Allow** > Redirected to Security Info page.

     ![AllowRedirect](/.attachments/AAD-Authentication/2272348/AllowRedirect.jpg)

   - Name the passkey > Save to Entra ID account.

     ![NamePKinSecInfo](/.attachments/AAD-Authentication/2272348/NamePKinSecInfo.jpg)

8. **Sign-in to original page with Passkey**

   Now that interrupt mode registration is complete, the flow returns to signing the user into the page they originally navigated to.

   - Prompt: **Face, fingerprint, PIN or security key**

     ![SignInPostReg](/.attachments/AAD-Authentication/2272348/SignInPostReg.jpg)

   - Select **iPhone, iPad, or Android device**

     ![ChoosePK](/.attachments/AAD-Authentication/2272348/ChoosePK.jpg)

   - QR code appears.

     ![PostRegQRprompt](/.attachments/AAD-Authentication/2272348/PostRegQRprompt.jpg)

   - Scan QR code with camera app > Tap **Sign in with a passkey**.

     ![TapSignIn](/.attachments/AAD-Authentication/2272348/TapSignIn.jpg)

   - Bluetooth connects > Authenticate > Redirected to Keep Me Signed In (KMSI) prompt.

     ![BTSignIn](/.attachments/AAD-Authentication/2272348/BTSignIn.jpg)

9. **Completion**

   - Sign-in completes using synced passkey that satisfies authentication strength.

- **Passkey Storage**
  
   - Launch the third party passkey provider

   - Authenticate with biometric, PIN or master password.

   - Passkey stored in selected mobile app as shown here.

     | Resource of Passkey | Passkey |
     |-----|-----|
     | ![ResourceOfPK](/.attachments/AAD-Authentication/2272348/ResourceOfPK.jpg) | ![LocalPK](/.attachments/AAD-Authentication/2272348/LocalPK.jpg) |
     

___

---

## Managed Mode: Cross-Device Registration

# Summary

When a user signs in to the [Security Info](https://aka.ms/mysecurityinfo) page from a device other than their phone, they can manually add a synced passkey stored on their mobile device. This process uses Bluetooth to securely connect the two devices and confirm they�re nearby, helping prevent remote attacks.

___

# Cross-Device Registration (Managed mode)

1. **Initial Sign-in**

	- User signs into the [Security Info](https://aka.ms/mysecurityinfo) page from a desktop browser.

2. **Passkey Registration Begins**

	- The user clicks **+ Add sign-in method** > **Passkey** which launches the the **Setting up your passkey** prompt.

     ![RegInterrupt](/.attachments/AAD-Authentication/2269570/AddSPK.jpg)

3. **Device Selection**

   - Clicking **Next** launches a **Save your passkey prompt** which indicates the passkey will be saved on the local device:
     - Click **OK** > launches *Save your passkey* dialog
     - Click **Change** to the right of **This will be saved to your Windows device**.

     ![ChangeRegDevice](/.attachments/AAD-Authentication/2269570/ChangeRegDevice.jpg)

4. **Passkey Setup**

   - Dialog: *Choose where to save your passkey* > Select **iPhone, iPad, or Android device**.

     ![WhereToSave](/.attachments/AAD-Authentication/2269570/WhereToSave.jpg)

   - Prompt: *Setting up your passkey...* > Click **Next**.

     ![SecureWindow](/.attachments/AAD-Authentication/2269570/SecureWindow.jpg)

   - Dialog: QR code appears showing the location where the synced passkey will be saved.

     ![QRcode](/.attachments/AAD-Authentication/2269570/QRcode.jpg)

   - Scan with camera app on mobile device > Tap **Save a passkey**.

     ![ScanQR](/.attachments/AAD-Authentication/2269570/ScanQR.jpg)

5. **Bluetooth Connection**

   - Bluetooth connects desktop and mobile device.

     ![BTConnect](/.attachments/AAD-Authentication/2269570/BTConnect.jpg)

6. **Provider Selection**

   - Choose where to store the passkey:

     - iPhone/iPad > iCloud Keychain (aka: Passwords app)

     - Android > Google Password Manager or Samsung Pass

     - Third-party apps (e.g., Bitwarden) may also appear

       ![SelectProvider](/.attachments/AAD-Authentication/2269570/SelectProvider.jpg)

7. **Passkey Storage**

   - Authenticate with Touch ID or PIN.     

8. **Security Info Update**

   - Desktop browser shows popup: **login.microsoft.com is requesting extended information about your security key, which may affect your privacy.** 

   - Click **Allow** > Redirected to Security Info page.

     ![AllowRedirect](/.attachments/AAD-Authentication/2269570/AllowRedirect.jpg)

   - Name the passkey > Save to Entra ID account.

     ![NamePKinSecInfo](/.attachments/AAD-Authentication/2269570/NamePKinSecInfo.jpg)

10. **Completion**

   - Managed-mode registration is complete with the synced passkey saved to the user account.

     ![SyncedPKSaved](/.attachments/AAD-Authentication/2269570/SyncedPKSaved.jpg)

   **Note**: (Outside of the registration flow) View the Passkey stored in selected mobile app as shown here.

   | Resource of Passkey | Passkey |
   |-----|-----|
   | ![ResourceOfPK](/.attachments/AAD-Authentication/2269570/ResourceOfPK.jpg) | ![LocalPK](/.attachments/AAD-Authentication/2269570/LocalPK.jpg) |

---

## Managed Mode: Same-Device Registration

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

---

## Managed Mode: Third-Party Cross-Device Registration

# Summary

When a user signs in to the [Security Info](https://aka.ms/mysecurityinfo) page from a device other than their phone, they can manually add a synced passkey stored on their mobile device. This process uses Bluetooth to securely connect the two devices and confirm they�re nearby, helping prevent remote attacks.

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

---

## Managed Mode: Third-Party Same-Device Registration

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