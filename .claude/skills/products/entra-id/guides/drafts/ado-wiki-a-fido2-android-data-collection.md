---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/Authentication/StrongAuth Passwordless(WHfB FIDO phone based)/FIDO2 passkeys/FIDO2: Android Data Collection and Troubleshooting"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=/Authentication/StrongAuth%20Passwordless%28WHfB%20FIDO%20phone%20based%29/FIDO2%20passkeys/FIDO2%3A%20Android%20Data%20Collection%20and%20Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
- cw.AAD-Workflow
- cw.Passwordless
- cw.Webauthn
- cw.FIDO2
- cw.Passkey
--- 
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::


[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD) [AAD-Workflow](/Tags/AAD%2DWorkflow) [Passwordless](/Tags/Passwordless) [Webauthn](/Tags/Webauthn) [FIDO2](/Tags/FIDO2) [Passkey](/Tags/Passkey)         

[[_TOC_]]

# Troubleshooting FIDO2 on Android Devices

You need to use USB or Wireless debugging.  If using a USB FIDO key you'll need to use wireless.

## Device Side Troubleshooting and Data Collection

### Install Android Studio
1. Install [Android Studio](https://developer.android.com/studio/install) on the computer you want to debug from.  To use WiFi debugging you will need the computer to be on the same network as the device.
1. At first launch you will get a welcome screen, click **New Project**.
1. Under Phone and Tablet choose **No Activity**.
1. Give your project a meaningful name.
1. Wait for the packages to load.  You should get a Defender notification, be sure to allow network access for Android Studio or the connection will fail.   

### Enable Debug Mode and Connect

1. Enable [Developer mode](https://developer.android.com/studio/debug/dev-options) on device.
   
   ![Enable Dev Mode and USB/WiFi](../../../.attachments/AAD-Authentication/1405676/EnableDevMode.png)
1. Enable USB/Wireless Debugging on the device.  **Note:** if you are using a USB security key, you will want to use Wireless debugging option as the USB port will be taken.
1. Connect device to the computer running Android Studio, by choosing the **Pair Devices Using Wi-Fi** button under Device Manager/Running Devices.
   
   ![Pair WiFi](../../../.attachments/AAD-Authentication/1405676/PairWifi.png)
1. A QR code will appear in Android Studio.
   
   ![QR Code](../../../.attachments/AAD-Authentication/1405676/QR.png)

1. On the device under Developer Options click on the **Wireless debugging** text (not the slider).  This will give you the option to scan the QR code.
 
   ![Wireless Debugging](../../../.attachments/AAD-Authentication/1405676/WirelessDebugging.png)
1. Complete pairing.

   ![Pair Successful](../../../.attachments/AAD-Authentication/1405676/SuccessfulPair.png)

### View Android Logs with Logcat
Once you have paired the device you can capture a log session of the issue.  You'll want to use the following steps to capture, filter, and save a logcat of the issue.

1. Inside Android select the logcat window.
2. Ensure that you are examining the correct device.
3. You should now see a running log session.
![Android Studio](../../../.attachments/AAD-Authentication/1405676/AndroidStudio.png)

4. Add a filter to focus on FIDO by using the filter: "**tag:FIDO**".
5. Reproduce issue on the device.
6. Review log, focusing on Error "**E**" and Warning "**W**" messages first.
7. You can also export the log file for later review or to attach to an IcM.

### Collecting Web Trace
In addition to the logcat you can also capture an [web traffic trace](https://developer.chrome.com/docs/devtools/remote-debugging).

1. From the device you are troubleshooting open the browser and browse to [mysignins.microsoft.com](https://mysignins.microsoft.com).
2. From the computer you are debugging from open Chrome and browse to [chrome://inspect/#devices](chrome://inspect/#devices).
3. Wait a while for the computer to poll the device for running processes.
4. Once remote target appears, click the **inspect** link associated with **My Sign-Ins**.
  ![Inspect Devices](../../../.attachments/AAD-Authentication/1405676/inspect-devices.png)
5. A new DevTools window will appear, select the **Network** tab and ensure recording has been started.
  ![alt text](../../../.attachments/AAD-Authentication/1405676/export-har.png)
6. Reproduce the issue.
7. Once completed, export the HAR file for investigation in Fiddler and/or for attaching to the IcM.

You will want to start by focusing on calls to https://account.activedirectory.windowsazure.com.

## Turn of Developer Options
Once you have collected your logs and finished troubleshooting don't forget to turn off the developer options.

## Microsoft Entra FIDO2 Troubleshooting

You can troubleshoot Entra service-side FIDO2 Android issues the same as you would troubleshoot any other FIDO2 issue.  Here are the wikis to get you started:

[FIDO2: Case scoping questions](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=1245294)

[FIDO2: Data collection guidance](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=1245290)

[FIDO2: Data analysis](https://supportability.visualstudio.com/AzureAD/_wiki/wikis/AzureAD?pageid=1245288)

**Note**: Android-specific - There could also be Android OS specific issues that cause the registration experience to error out. Unfortunately at this time, it's very difficult for us to identify these issues as Google is still discovering (and potentially fixing) bugs with their support for security keys. **User remediation** would be to ask them to register their key on Windows first, before using it for sign-in on Android.
