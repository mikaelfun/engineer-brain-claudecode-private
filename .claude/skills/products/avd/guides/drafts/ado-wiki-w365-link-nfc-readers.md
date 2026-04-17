---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Windows 365 Link/Components/NXT OS/NFC Readers"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Windows%20365%20Link/Components/NXT%20OS/NFC%20Readers"
importDate: "2026-04-05"
type: troubleshooting-guide
---

### **Support for NFC readers**

Windows 365 Link NXT OS Build **26100.3476 (25-3B)** (Tentative) will include the ability for users to take advantage of NFC Readers. Using a USB-C NFC reader, the Windows 365 Link device can be integrated with NFC FIDO2 cards as supported by Azure AD. For users in clean room environments, or where ID Badges contain FIDO technology, this method can enable a "Tap & PIN" experience for Windows 365 Link Sign on. This feature enables a faster sign-in experience for users.

### **USB NFC reader support**

USB-CCID (Chip Card Interface Device) compatible NFC FIDO2 readers with USB base class "0B" and subclass "00" are supported. Refer to [Microsoft Class Drivers for USB CCID Smart Cards](https://learn.microsoft.com/en-us/previous-versions/windows/hardware/design/dn653571(v=vs.85)) for details on Microsoft class driver for USB CCID devices. There are two ways to determine if your NFC reader is compatible with Windows 365 Link. You may refer to the documentation provided by the reader's manufacturer. Or, you may use the Device Manager on your PC, as follows:
1.  Plug in the USB NFC reader to a Windows PC.
2.  In Device Manager, locate the reader device and right click on it and select Properties.
3.  In Details tab, select "Compatible Ids" properties and check if "USB\Class_0b&SubClass_00" is in the list.

**Note**
If a USB NFC reader works on Windows Desktop with the inbox CCID driver, that same reader is expected to be compatible with the Windows 365 Link. If the reader requires a third-party driver (either from Windows Update or through manual driver installation), the reader isn't compatible with Windows 365 Link.

Whether you sign into a device you used before or a new device, follow these steps to sign in with an NFC reader:
1.  From the "Other User" screen, enter the FIDO Key / Tap the NFC Key against the reader.
2.  Enter the FIDO PIN.
3.  Press the button on the FIDO Key / Tap the NFC Key against the reader again.
4.  The Device logs in.
    a. Note: if the user is new to the device, the Single Biometric Disclosure Screen is displayed.
5.  Start Menu then appears.

**Note**
NFC reader support for the Windows 365 Link only supports NFC CTAP for FIDO2 login. There's no plan to provide the same level of Smartcard WinRT API support as on Windows Desktop. This decision is due to variations across Smartcard WinRT APIs. In addition, the SCard API used for Windows 365 Link has less functionality compared to the Desktop versions and some reader types and features may not be supported.
