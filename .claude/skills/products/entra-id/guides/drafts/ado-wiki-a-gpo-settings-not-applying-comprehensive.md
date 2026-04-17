---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Group Policy/Workflow: GPO: Unknown Solution Investigation/Workflow: GPO: GPO settings not applying"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FGroup%20Policy%2FWorkflow%3A%20GPO%3A%20Unknown%20Solution%20Investigation%2FWorkflow%3A%20GPO%3A%20GPO%20settings%20not%20applying"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418743&Instance=418743&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418743&Instance=418743&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This workflow outlines how to troubleshoot issues where Group Policy fails to apply settings. It includes four sample scenarios to guide you through the troubleshooting process.

[[_TOC_]]

#Scenario
This workflow outlines how to troubleshoot issues where Group Policy fails to apply settings.  

It contains 4 sample scenarios:
1. Starter analysis
2. Group Policy Object (GPO) does not appear in GPResult output (settings disabled)
3. Enforced GPOs
4. Loopback processing mode

#Scoping
Comprehensive Scoping questions can be found on the main page of the Group Policy Troubleshooting workflow: 

Workflow: GPO: [Scoping](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418760) and [Scoping Aids](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418758) Pages 

#Action Plan
Always start with collecting data as suggested in [Data Collection - Starter](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418756) page.  

An additional data such as network trace or Process Monitor would be required in some cases and can be found on the [Data Collection - Advanced](https://supportability.visualstudio.com/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/418749) page. 


#Example Scenarios
##Starter analysis

- Ensure the GPO is linked to the correct Organizational Unit (OU) where users and/or machines that need the GPO applied reside.
- Check the Security Filtering to ensure that users and/or machines that the GPO should apply to are included.  
![A picture showing a GPO, highlighting the discussed sections.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying.png)

- Verify that the GPO Status is enabled for users, computers, or both, depending on the configured settings.
- Find the Unique ID.  
![A picture highlighting where the ID is located.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_1.png)

- Ensure that under the Delegation tab, the group to which you applied the GPO has both Read and Apply Group Policy rights, and that either Authenticated Users or Domain Computers have Read rights.   
![A picture showing the delegation tab.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_2.png)

- If the entire GPO is not applying and you have verified all of the above, note down the GPO name and Unique ID, and start gpsvc debug logging.
- For specific settings not applying, go under the Details Tab and note down the settings not applying. Focus on one setting if there are multiple.
![A picture highlighting a specific setting](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_3.png)

- Focus on the Autoenrollment machine-side setting.
- Know the GPO name and Unique ID.
- Follow the GPO into Sysvol and check how the setting looks there. The GPO can be found using its Unique ID.  
![A picture highlighting the GPO in the sysvol.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_4.png)

- Open the Registry.pol file and check for the exact settings that will be propagated.  
![A picture showing registry.pol content](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_5.png)

- The setting needs to be propagated to the client registry. AEPolicy will be created under `HKLM\SOFTWARE\Policies\Microsoft\Cryptography\AutoEnrollment` together with some other values. 
- Use gpsvc debug logging to follow up on how the GPO is delivered, and on the client, use a filter in Process Monitor to ensure the setting is deployed. 

###How to start GPSVC Debug Log:
Use the following in a CMD started with admin rights:
```shell
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Diagnostics" /v GPSvcDebugLevel /t REG_DWORD /d 0x30002 /f
mkdir %windir%\debug\usermode
```

![A picture showing registry setting mentioned above](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_19.png)  
![A picture showing the gpsvc.log file.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_6.png)  
![A picture showing the contents of gpsvc.log](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_17.png)  

- Use the GPSVC analysis [blog](https://learn.microsoft.com/en-us/archive/blogs/askds/a-treatise-on-group-policy-troubleshootingnow-with-gpsvc-log-analysis) to get further.
- Use Process Monitor to trace and check if the setting is being deployed by "svchost" (container for gpsvc service).
- For example, from my GPO where I used Autoenrollment, you can see the key AEPolicy is being written with a value of 7, along with other keys from the same setting.  
![A picture showing Procmon with the value mentioned above.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_7.png)

- This troubleshooting approach is valid for when GPOs aren't applied when they should be, as well as for certain settings not applying from a specific GPO. The difference between the two is that for whole GPOs not applying, you won't have to go as granular as for specific settings and focus more on the GPO as a whole.  


##GPO does not appear in GPResult output (settings disabled) 

- In this scenario I have disabled the user configuration settings and removed the WMI filter from the DisableScreensaver GPO.  
![A picture showing the above-mentioned scenario.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_8.png)

- I took a GPResult from the 2012R2 machine while logged on with the user David.  
- As you can see, there is no trace of the DisableScreensaver GPO in this GPResult because the GPO never passes the gpsvc service check. This means that the gpsvc debug log will tell us more.  
![A picture showing the above-mentioned scenario.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_9.png)

- In the gpsvc debug log, we have the information below, telling us that the GPO cannot be accessed, either because we lack rights, it is disabled (which it is), or it has no configuration at all. 
- You can only find out the exact reason by checking (or asking the customer to check) the security rights on the GPO in GPMC. It needs Read and Apply Group Policy rights, and you need to check that the settings are disabled and the GPO is not empty.     
![A picture showing this in gpsvc.log](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_10.png)

##Enforced GPOs 

- In this scenario I have created a new OU under "TestEnvironment" called "EnforceTest". 
- I have created a new GPO called "EnableScreenSaver" and linked it to "EnforceTest" OU. 
- The GPO "EnableScreenSaver" does exactly as the name suggests and enables the screen saver. 
- The parent OU "TestEnvironment" has a GPO linked called "DisableScreenSaver" which is configured to disable the screen saver. 
- The "DisableScreenSaver" GPO has been enforced.  
![A picture showing the discussed scenario](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_11.png)  
![A picture highlighting an enforced GPO.](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_18.png)

- Because this GPO is enforced, it **will have priority** over any other GPO configured underneath it at any other level and even if Block Inheritance has been set.  
- This means that even though "EnableScreenSaver" GPO has been set at a lower level than "DisableScreesaver", because "Disablescreensaver" is enforced it will be the one that applies. 
- Bear in mind that this affects only equal settings with different values, any other configuration will not be affected. This means that in cases having two settings with different values, the one that is being enforced will win. 
- So in our case "DisableScreensaver" and "EnableScreenSaver" have the same setting with different values (as the name suggests), but the winner is "DisableScreensaver" because it is being enforced. 
- GPResult will point this out right away.  
![Workflow_GPO_GPO_settings_not_applying_12.png](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_12.png)  
![Workflow_GPO_GPO_settings_not_applying_13.png](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_13.png)

- You can see a GPO is being enforced in the gpsvc debug log when the ldap GPO query takes place and the result returns an ldap path that contains the number 2 at the end.  
- Also, since Windows 8 we added an extra line at the end of those ldap queries that explicitly has this written.   
![Workflow_GPO_GPO_settings_not_applying_14.png](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_14.png)

##Loopback processing mode 

- The customer has configured LoopBack policy processing but is not aware of the impact. 
- Scenarios where customers have one GPO containing "Loopback" GPO processing need to be carefully considered and depending on that loopback configuration addressed accordingly.  
- In such cases I can only recommend the following blogs, as explaining the concept here would be redundant:   
[Circle Back to Loopback](https://learn.microsoft.com/en-us/archive/blogs/askds/circle-back-to-loopback)  
[Back to the Loopback: Troubleshooting Group Policy loopback processing, Part 2](https://learn.microsoft.com/en-us/archive/blogs/askds/back-to-the-loopback-troubleshooting-group-policy-loopback-processing-part-2)

- I just want to point out that you can check if Loopback processing has been set through GPResult:  
![Workflow_GPO_GPO_settings_not_applying_15.png](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_15.png)

- Or you can check in the gpsvc debug log:   
![Workflow_GPO_GPO_settings_not_applying_16.png](/.attachments/GroupPolicy/Workflow_GPO_GPO_settings_not_applying_16.png)

- The registry location of the "UserPolicyMode" registry key on the client is: HKLM\Software\Policies\Microsoft\Windows\System\UserPolicyMode  
The values are 1 (Merge) and 2 (Replace) 
- Loopback processing can cause different behavior to policy processing if not given proper thought before deployment.  
- If you have a scenario where certain GPOs do not apply when they should and Loopback policy is set, please review the configuration and make sure it is not being impacted by this.