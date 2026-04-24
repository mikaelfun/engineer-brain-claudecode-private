---
source: ado-wiki
sourceRef: "Supportability/Windows365/Windows365 Support Wiki:/Features/Client Applications/Windows App/Unified Mobius Clients/iOS, macOS"
sourceUrl: "https://dev.azure.com/Supportability/Windows365/_wiki/wikis/Windows365%20Support%20Wiki?pagePath=/Features/Client%20Applications/Windows%20App/Unified%20Mobius%20Clients/iOS%2C%20macOS"
importDate: "2026-04-21"
type: guide-draft
---

**Connection Flow for macOS Client**

![image.png](/.attachments/image-dfe56287-476c-42ed-88fe-3408b1293623.png)




# **Troubleshooting**

**Verbose UI Logging.**

- Enable verbose logging by navigating to Help \ Troubleshooting \ Logging.. from the menu bar
- Select "Verbose" under "UI log level"
- Click "Start logging"
- Reproduce the issue
- Collect the log file from the location that was defined in the logging window.

![image.png](/.attachments/image-f2bb7859-1d7d-4e4c-9463-8d7e148e5ea8.png)

![image.png](/.attachments/image-6109b16a-18ff-44f7-8e13-42a039d9ad7a.png)

Please request customer to share the Verbose UI logs and identify the **ActivityId** from the verbose UI logs.

![image.png](/.attachments/image-c964dee6-beec-495e-8589-c550961d09de.png)

![image.png](/.attachments/image-f2d69bf9-a1dc-418d-a2f1-b53b2faa3de0.png)


Use the **ActivityId** in the AVD kusto queries for detailed session details/errors.
https://supportability.visualstudio.com/Windows365/_wiki/wikis/Windows365%20Support%20Wiki/742513/AVD-Kusto-Queries



**Drive/Folder redirection**
MacOS does not use drive letters, so instead you'll need to redirect local folders.

You might also notice that the Beta client automatically redirects the 'home' folder from the Mac device, but the AppStore client does not do that.

For the AppStore client (orange icon) you have to manually select a specific folder to redirect from either the Settings/Preferences (applies to both full desktops and RemoteApps) or the 'Edit PC' menu (for full desktops only):

![image.png](/.attachments/image-beb7005e-4df3-49a8-859c-d17de9f68c14.png)

![image.png](/.attachments/image-ee172012-55f8-4da6-bd09-fd18686690c1.png)

# macOS Client Trace

1. Open Terminal app

   ![image.png](/.attachments/image-fff1b618-b32b-44a6-a131-963c81fce9cd.png)

1. Enable tracing using one of the following commands - SU (super user) permissions not required
   ```
   //Public Client
   defaults write com.microsoft.rdc.macos.beta ClientSettings.CoreLogLevel 4

   //Beta Client
   defaults write com.microsoft.rdc.osx.beta ClientSettings.CoreLogLevel 4
   ```

   ![image.png](/.attachments/image-ec0053b3-3230-423f-9d08-fdd8b20a374c.png)

1. Open Console app

   ![image.png](/.attachments/image-d773de3e-8453-48ef-89ab-11a7a60780c2.png)



1. Press Start to begin logging

  ![image.png](/.attachments/image-675de85c-a6e4-4ff6-84e1-503e12e8fcc3.png)

1. Connect to CPC

1. In the Console app it should begin logging

   ![image.png](/.attachments/image-e85665c9-0d8b-4369-8af1-f2a1b1a001d3.png)

1. Reproduce issue 

1. Stop tracing by going back to Terminal app entering one of the following commands
   ```
   //Public Client
   defaults write com.microsoft.rdc.macos.beta ClientSettings.CoreLogLevel 0

   //Beta Client
   defaults write com.microsoft.rdc.osx.beta ClientSettings.CoreLogLevel 0
   ```

1. Save logs by going to Console app > Edit > Select All

   ![image.png](/.attachments/image-bc2c47a1-5f63-4acd-ac64-847a40d50daf.png)

1. Open text editor app > paste

   ![image.png](/.attachments/image-657213cc-f56b-4ce1-ae3d-bd02ef6ad2c9.png)

7. Once you have collected the log from customer, please looks for **ActivityId** in the logs. And use the ActivityId in the AVD Kusto Queries for detailed session details.

![image.png](/.attachments/image-5fcc988e-c9f3-422e-a886-19dca673e86d.png)