---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: References/PIN Reset"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Windows%20Hello%20and%20Modern%20Credential%20Providers/WHfB/WHFB%3A%20References/PIN%20Reset"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430689&Instance=430689&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430689&Instance=430689&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This article explains the process of resetting a PIN in Windows Hello for Business, detailing both destructive and non-destructive methods. It includes the roles of the recovery key and the PIN reset service.

### PIN Reset

When a PIN is provisioned on the client, aRecovery Key is created. ThePIN Reset Service sends aPublic key to the client toencrypt the recovery key and stores it locally on the machine. When users try to reset the PIN from the login screen using "I Forgot My PIN," the client sends the encrypted recovery key to the PIN reset service. The user must then authenticate, and the service decrypts the key using its Private Key and sends it back to the client. This key is then used to associate the new PIN with the existing keys (created during the PIN provisioning).

There are two forms of PIN reset: destructive and non-destructive.

### Destructive PIN reset

**Destructive PIN reset** is the default and does not require configuration. During a destructive PIN reset, the user's existing PIN and underlying credentials, including any keys or certificates added to their Windows Hello container, will be deleted from the client, and a new logon key and PIN are provisioned.

### Non-destructive PIN reset

**For non-destructive PIN reset**, you must deploy the Microsoft PIN reset service and client policy to enable the PIN recovery feature. During a non-destructive PIN reset, the user's Windows Hello for Business container and keys are preserved, but the user's PIN that they use to authorize key usage is changed.

---

### Next step

Have a look at the logs [examples](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/430173/Pin-Reset) in working scenario.
