---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/How to launch pin UI (WWAHost.exe)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/428648"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**   
This article provides instructions on launching a PIN scenario via command and includes a method that can be shared for managing key credentials using PowerShell. It explains how to call the Key Credential Manager Show UI Operation and check if Windows Hello for Business (WHfB) is provisioned.

Launch PIN scenario via command:  
run:  
`ms-cxh://NTH/AADNGCONLY`

**This must not be shared outside Microsoft.**

---

### Method that can be shared:

```
Add-Type -IgnoreWarnings -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class KeyCredMan
{
   [DllImport("KeyCredMgr.dll")]
   private static extern uint KeyCredentialManagerGetInformation(ref IntPtr keyCredentialManagerInfo);
   [DllImport("KeyCredMgr.dll")]
   private static extern uint KeyCredentialManagerFreeInformation(IntPtr keyCredentialManagerInfo);

   [DllImport("KeyCredMgr.dll")]
   public static extern uint KeyCredentialManagerShowUIOperation(IntPtr hWndOwner, uint keyCredentialManagerOperationType);
   public static bool IsWHfBProvisionned()
   {
       IntPtr keyInfoPtr = IntPtr.Zero;
       if (0 != KeyCredentialManagerGetInformation(ref keyInfoPtr))
       {
           return false;
       }
       else
       {
           KeyCredentialManagerFreeInformation(keyInfoPtr);
           return true;
       }
   }

   public static uint CallKeyCredentialManagerShowUIOperation(uint KeyCredentialManagerPinChange)
   {
      return KeyCredentialManagerShowUIOperation(IntPtr.Zero, KeyCredentialManagerPinChange);
   }
}
'@

<# 
KeyCredentialManagerShowUIOperation() accepts the following values:

typedef enum KeyCredentialManagerOperationType {
 KeyCredentialManagerProvisioning = 0,
 KeyCredentialManagerPINChange = 1,
 KeyCredentialManagerPINReset = 2
};
#>
```