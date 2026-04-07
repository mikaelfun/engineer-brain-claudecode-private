---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Azure AD Blank or White screen"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FAzure%20AD%20Blank%20or%20White%20screen"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# Blank or White Screen When Prompted to Sign-in

## Overview

There are a number of reasons that can cause this issue. Not all of them are listed here. This would be out of the control of the application the customer is using that popped up the sign-in window.

## Troubleshooting

### Test Signing-in

On the same problem device, open a web browser and make sure you can access https://myapps.microsoft.com

### Network Capture

It will be best to take a Fiddler capture and determine if there are any network errors causing the white or blank screen. If you see a 200 OK response from login.microsoftonline.com with the following contents starting with...

```
<!-- Copyright (C) Microsoft Corporation. All rights reserved. -->
<!DOCTYPE html>
<html dir="ltr" class="" lang="en">
<head>
    <title>Sign in to Microsoft Azure</title>
```

Then more than likely, there is something on the device that may be blocking the content from being generated within the popup such as Internet Options settings or Group Policies.

If there are network errors seen, customer should engage their networking team. This would not be an issue on the device itself, app, or Entra ID.

### Check Group Policies Pushed to Device

The following command will output the group policy results to a file:

```
gpresult /H C:\path\to\outputfile.html
```

## Possible Solutions

These are a list of solutions known to resolve similar issues. This is not a complete list as there are many possible causes.

### 1. Reset Internet Option Settings

Do this first as it may undo other solutions below.

```
RunDll32.exe InetCpl.cpl,ResetIEtoDefaults
```

### 2. Delete Temporary Internet Files

1. Open Internet Options: Press Windows+R, type `inetcpl.cpl`, press Enter
2. Go to the General Tab
3. Check "Temporary Internet files and website files"
4. Click "Delete" to remove all temporary internet files

### 3. Enable JavaScript

1. Open Internet Options (Windows+R > `inetcpl.cpl`)
2. Security Tab > Internet zone > Custom level
3. Scroll to Scripting > Active Scripting > Enable
4. Confirm and Apply

### 4. Re-register Required DLL Components

```
regsvr32 urlmon.dll
regsvr32 mshtml.dll
regsvr32 iertutil.dll
regsvr32 wininet.dll
regsvr32 shdocvw.dll
```

**Component details:**
- shdocvw.dll: Web browser control (rendering issues)
- mshtml.dll: Core HTML rendering engine for IE
- iertutil.dll: IE utility functions
- wininet.dll: Network functions for IE
- urlmon.dll: Web content interaction

### 5. Add Entra ID URLs to Trusted Sites

Add these URLs to Internet Options > Security > Trusted sites:
- https://login.microsoftonline.com
- https://login.windows.net
- https://login.microsoft.com
- https://sts.windows.net
- https://aadcdn.msauth.net
- https://aadcdn.msftauth.net
- https://autologon.microsoftazuread-sso.com
- https://secure.aadcdn.microsoftonline-p.com
- https://mysignins.microsoft.com
- https://account.activedirectory.windowsazure.com

### 6. Internet Explorer Enhanced Security Configuration (Windows Server Only)

1. Open Server Manager
2. Select Local Server
3. Find IE Enhanced Security Configuration > On
4. Enable for both Administrator and User accounts

### 7. Windows Update and Display Drivers

Display drivers have been known to cause issues. Ensure the latest Windows Updates are installed and the latest Display Drivers are installed for the video card.
