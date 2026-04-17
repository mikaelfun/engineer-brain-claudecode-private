---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Features Restrictions and Custom/iOS"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FDevice%20Config%20Features%20Restrictions%20and%20Custom%2FiOS"
importDate: "2026-04-05"
type: troubleshooting-guide
---
[[_TOC_]]
# Support boundaries

Page author: Carlos Hernandez

Intune's job is to send the configuration settings to the device (this can be validated by following steps 3 & 4 from Troubleshooting workflow). 

If the settings are delivered successfully to the device, but the device fails to apply those changes or does not behave as expected, this is not necessarily an Intune issue. Rather, it is most likely an OS or device specific problem and the OS or device provider (Apple in this case) should be engaged to continue troubleshooting.

**Custom Profiles**

For custom profiles, the Intune Support Team is not responsible for providing or creating custom XML files for customers. The MobileConfig file or XML configuration should be provided if they would like to validate/confirm the issue is not specific to their tenant or file. The best approach to help customers with XML questions is to contact the person who created the file or have them use Apple configurator to create the profile from a macOS device as this will have the correct configuration.

Common troubleshooting steps when working with Custom profiles is, validating whether the custom profile can be installed though Apple Configurator (taking Intune out of the picture). If the profile does not installed with apple configurator, the profile is within the file and not something Intune should troubleshoot.

**Note**: Many iOS/iPadOS configuration settings require a supervised device. If customer's device is not supervised there is nothing Intune can do to enforce such settings if that is a requirement. The only solution is to make the device supervised, either by using Apple configurator or by enrolling the device using the Automated Device Enrollment (ADE) program and setting the enrollment profile to "**Supervised = Yes**". See [Turn on iOS/iPadOS supervised mode](https://learn.microsoft.com/en-us/mem/intune/remote-actions/device-supervised-mode)

# Scoping questions
**1. Did this policy ever worked or showed as succeeded?**

- Are all the individual settings erroring out or just a few? Collect Screenshots.
- What error, if any is displayed on Microsoft Endpoint Manager Admin center?

**2. Are all targeted users/devices impacted, or only a few?**

- If only a few, specify how many?
- This will indicate if the issue could be a configuration issue on the policy, or a device specific issue)

**3. What is the goal of the policy (what is it supposed to do)?**

**4. If the same profile is deployed through Apple Configurator, does it work or does the issue persist?**
- Since Custom profiles are literally Apple Configurator profiles, if the issue persists even without Intune, then customer needs to contact Apple to validate the configuration XML file.

**5. What is the affected user and/or device information (If multiple or everyone is impacted, still collect a sample user/device to focus on)**

	o UPN: 
	o User ID: 
	o Intune Device ID: 
	o Azure Device ID and Azure Object ID: 
	o Serial Number: 
	o OS Version and Device Model: 
	
	a. Is the affected/sample user licensed for Intune?
	
**6. What is the enrollment type of the affected device?**

**Note:** BYOD or Corporate is not a valid answer, we are looking to validate exactly which enrollment method was used. Reference article [Intune: Rave/Assist365 Enrollment types and what do they mean](https://internal.evergreen.microsoft.com/en-us/topic/8b9275d4-c5a9-2f07-5bf8-c948eaede8dc))

**7. Is the Supervised? (Yes or No)**
	
**8. What is the affected policy name and policy ID?**
- You can use Assist365, Kusto or the Browser URL from MEM Admin center (while looking at the policy) to gather this information.

**9. Is the policy assigned to a user or device group?**

- If not sure, use Azure Support Center to look up the Group ID or Display Name. Then validate the type and also that the user or device are members of it.
- Are there any "Exclude" assignments, if so, validate the same affected user/device is not a member of the excluded group.
	
**10. Regardless of the Policy status showed in MEM Admin Center, does the device show/list the device restriction in the Remote Management Profile?** 

Collect screenshots or a [video recording on iOS](https://support.apple.com/guide/iphone/take-a-screenshot-iphc872c0115/ios)

This is important because if the restriction is listed, it means the policy was successfully delivered and perhaps the issue is just a reporting issue.
	
	Note: This will show the restrictions applied to the device from all the policies applying to it (not just the one you might be troubleshooting). Also, the remote Management profile will not be visible of iPadOS devices enrolled as Shared iPads and that is expected and by design.
	
	ò On OS 13/14 Settings App -> General -> Device Management -> Management profile -> Restrictions 
	ò On OS 15+ Settings App -> General -> VPN & Device Management -> Management profile -> Restrictions 

**11. Collect device logs while forcing a sync and jot down the time and date for reference:**

- If a macOS device is available collect Console logs by following [Intune: How to collect Console Logs using a MacOS Device (Applies to iOS, iPadOS and macOS](https://internal.evergreen.microsoft.com/en-us/topic/da09cdb3-de81-ef4a-80da-f61f0f0a39b1)

- If no macOS device is available, this Microsoft Internal tool [IOS Console Support Tool for PC](https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/archive/intunewiki/docs/iosconsolesupporttoolforpc) can be used instead.
	
**Note**: The Windows tool does not collect Debug messages that sometimes will provide additional insight, so set the expectations with customer and always try to use a macOS instead to collect the logs when both are available.

# Troubleshooting

**PII compliance disclaimer**: UserPrincipalName, Serial Number and any other information shown in videos and screenshots within this article belong to a test Tenant and no actual customer PII data has been exposed.
 
**Note:** This Troubleshooting also applies for GCC High, although some modification to Kusto queries might be required (these changes will be noted in the Kusto query itself).
 
1. Before you can start troubleshooting you will need at least the following information. If you don't have it, please review [Scoping questions](#Scoping-questions). before continuing.
	 
		o UPN and User ID: 
		o Intune Device ID: 
		o Azure Device ID and Azure Object ID: 
		o Serial Number: 
		o OS Version and Device Model: 
		o Enrollment Type according to Assist365 or Kusto: (Not the one customer thinks was used)
		o Policy Name and PolicyID: 
		  
2. Validate whether the affected device is Supervised or not. As there are some iOS/iPadOS device restrictions that are only supported (will only apply and work) on supervised devices.

   - This Kusto will show you not only the supervision state, but the actual enrollment type, OS Version and other information typically show in hardware inventory. (**Works on GCCH**)  
      
        ```
        //To Know the Enrollment Type for iOS (Works on GCCH Kusto)
        let IntuneDeviceID ="xxxx";
        IntuneEvent
        //| where env_time > ago(1d)
        | where env_time between (datetime(2026-03-08 00:00)..datetime(2026-03-09 23:59))
        | where SourceNamespace in ("IntunePE","IntuneFXP")
        | where ActivityId == IntuneDeviceID//IntuneDeviceId
        | where Col1 has "EnrollmentType" or Col1 has "OSVersion:"//for iOS Shows multiple device Details, like OSversion, Model and other hardware details
        | project env_time, Col1, Col2, Col3, Col4, Col5, Col6,ActivityId, UserId, DeviceId,AccountId
        ```
            
       |**Col1**|
       |--|
       |**OSVersion**:16.7.11, Agent:8, **Model**:iPhone X, **Manufacturer**: Apple,|
       |IsUserChannel: False 
       **IsUserEnrollment**: False
       **IsSupervised**: True
       **DeviceOwner**: Company
       **EnrollmentType**: AppleBulkEnrollmentModernAuth|

		 
   - Using Intune admin center > Sample device > Hardware > Supervised

     ![](../.attachments/Dev-Config-restriction/iOS/SupervisedHardwareInventory.png)

   - From the device itself, you can open the Settings app and a supervised device will show **"This iPhone/iPad/iPod is supervised by <Company Name>"**		 	

     ![](../.attachments/Dev-Config-restriction/iOS/KustoiOSTS2c.jpg)							
		 
3. Use the IntuneDeviceID in this Kusto to validate Intune is sending the policy to the device and its report status.
     - **"ReportComplianceState"** should match MEM admin Center, otherwise you might be facing a reporting issue.
     - **Compliant**: the policy and ALL its individual settings successfully applied to that device
     - **Error**: The policy or at least one of its individual settings did not apply to the device, and further investigation is needed.
		 
     - Feel free to comment out or modify this Kusto depending on what Device configuration type you are troubleshooting.
			 
        ```
        //Device Check-in and Policy evaluation High Level (Works On GCC High)
        //To know what policies (Compliance, Device configuration, apps and app configuration policies) are targeting a device/user
        //Works for iOS/iPadOS, macOS (LOB and 365 apps), Windows policies (only some policies) and Android DA (Including Teams IP Phones) or Personally Owned Work Profile
        let IntuneDeviceID ="xxxxxx";//AffectedADE
        HighLevelCheckin(deviceIdentifier=IntuneDeviceID, startTime= datetime(2026-03-09 T00:01), endTime=datetime(2026-03-09 T23:59))
        | where PolicyApplicability == "Applicable" | project env_time, PolicyId, PolicyCompliance,PolicyType,commandType,commandResultStatus,errorCode,message, EventMessage,PolicyVer
        ``` 
		 
   - The **EventMessage** column will list all sorts of important information that can help you validate the **PolicyID**, **AccountID**, etc. especially on GCC High cases were all of that information is not available in Assist365.
			 
   - **PolicyID** will be listed, however due to privacy changes, Policy Name is expected to be blank, but Assist365 can be used to figure out the policy name. Unfortunately for GCC High customer we will have to look for the policy in the customer's UI.
	 
4. If the policy does not show in the Kusto's for step 3, then validate the assignments of the policy, as this would typically mean the user/device is not targeted or that the Intune Effective Group Membership is not working as expected.		 
   - Make sure the User or Device, is a member of the groups included in the assignments.
   - Make sure the User or Device IS NOT a member of any group excluded in the assignments.
   - Use Azure Support Center (ASC) to look up the Group ID or Display Name. Then validate the type of group 
(User, Device, assigned or Dynamic) then validate the membership.

     - Assist365 or MEM Admin Center can also be used for this validation; however Azure Support Center is the most user-friendly method besides MEM Admin Center.
     - For User Groups, Assist365 > Applications > Intune > User > <UPN or USerID> > then expand "AAD User Groups"
     - For Device Groups, Assist365 > Applications > Intune > Troubleshooting > Device > Look for Intune DeviceId/Azure AD DeviceID/Serial Number/ EMEI > Then expand "AAD User Groups"
	 
5. For policies reporting Error this next Kusto can be used to see the individual settings evaluated for each policy and will help you determine with setting or settings are causing the error. Keep in mind this will only tell you which setting failed and not necessarily why it failed (Most of the time Device logs like Console Logs will be needed for that).
	 

    ```
    //To see more information on the processing of a policy (Compliance, Device configuration, apps and app configuration policies)
    //works for macOS, iOS/iPadOS
    let IntuneDeviceID = "xxxxx";//Paste the device ID Here
    let PolicyID = "xxxx";//Paste the PolicyID here
    IntuneEvent
    | where env_time between (datetime(2026-03-08 00:00)..datetime(2026-03-09 23:59))
    | where SourceNamespace in ("IntunePE","IntuneFXP")
    | where ActivityId == IntuneDeviceID
    | where Col1 has tostring(split(PolicyID, "-")[-1])//Use this filter only if you know the policyID
    //| where Col1 has "allowLockScreenNotificationsView"//Use this filter if you are trying to identify a specific restriction/setting and find which policy it came from
    | project env_time, ColMetadata, Col1,Col2,Col3,Col4,Col5,Col6,env_cloud_name,AccountId,UserId
    ```
	 
   - Use these tips to help you parse thru the information received.
     - "Processing Cild AC_<AccountID>/LogicalName<Policy ID>"" (For events when the device started to process the policy)
     - "Done Processing Rule" will show each individual policy setting that got evaluated and return its result (Compliant,NotCompliant or error).
     - "Compliance state for CiId AC_<AccountID>/LogicalName<Policy ID>" (For events when the device finished processing the policy, as this will show if it was Compliant,NotCompliant or error).
     - Or just the individual setting name (If you happen to know it) in this case it was [ForceOnDeviceOnlyDictation](https://developer.apple.com/documentation/devicemanagement/restrictions)

       ![](../.attachments/Dev-Config-restriction/iOS/KustoiOSDeviceTemplate.png) 
			
   - Other Device profiles like Features or Settings catalog policies might show up differently but we should still be abel to tell the setting configured and the result of the setting: 
     - Device Features:
        ![](../.attachments/Dev-Config-restriction/iOS/KustoiOSDeviceFeatures.png) 
  
     - Settings Catalog:  
     ![](../.attachments/Dev-Config-restriction/iOS/KustoiOSSettingsCatalog.png) 
  
   - Here is an example of a policy setting failing for reference:
     - Done processing Rule '' 'PolicyType.IndividualPolicySettingName 

       ![](../.attachments/Dev-Config-restriction/iOS/KustoTS5b.png) 		
			
		 
6. These are the Policy Types in Rave that you can use to filter out policies and help you identify Device Configuration related policies on customer's tenant. They are all self-explanatory so here is just the list.
	 
		IOSDeviceFeaturesConfiguration
		IOSGeneralDeviceConfiguration
		IOSCustomConfiguration
		IOSUpdateConfiguration
		IOSTrustedRootCertificate
		IOSScepCertificateProfile
		IOSVPNConfiguration
		IOSWiFiConfiguration
		IOSEnterpriseWiFiConfiguration
		IOSEasEmailProfileConfiguration
		IOSDerivedCredentialAuthenticationConfiguration
		 
	 
7. The ultimate place to validate a particular setting/restriction applied to the device is the device itself. If the setting/s are listed there, then most likely the issue is a reporting one (portal showing error even though the policy applied) or customer's expectation about the restriction are incorrect (he expects A to happen instead of B) and validating the expected behavior and goal would help answer this question.
		 
   - On OS 15+ Settings App -> General -> VPN & Device Management -> Management profile -> Restrictions 
		 
      **Note**: This will show the restrictions applied to the device from all the policies applying to it (not just the one you might be troubleshooting). Also, the remote Management profile will not be visible of iPadOS devices enrolled as Shared iPads and that is expected and by design.

       ![](../.attachments/Dev-Config-restriction/iOS/KustoTS7.jpg) 	
		 
8. If facing reporting/cosmetic issues (policy applies as expected but just report the incorrect status) first validate that forcing a sync and waiting a couple of minutes does not resolve the issue.
   - If the issue persists, collect Capture a browser trace for troubleshooting while navigating to the blade in MEM Admin Center where the reporting problem is.
   - On the problem blade, press **Ctrl + Alt + D**, then take a **legible fulll screen shot** of the blade.

## -  Log Files

- **Company Portal Logs:** When troubleshooting Device configuration issues, Company portal logs can help identifying the state of the device and validate the device is checking in with the service. However, they **will not contain any information regarding device configuration policy evaluation** and that when Kusto or Console logs will help you better understand what is happening.
    ```
    *************** SSP STATES ***************
    Device info: 
    	App name: /private/var/containers/Bundle/Application/E62EE2ED-D47C-4D22-8323-FCC283ED3E29/Company Portal.app
    	Build version: 53.2401563.001
    	Bundle Version: 5.2401.0
    	Device model: iPhone XS
    	Device type: iPhone
    	Local device aad id: EntraDeviceIDHEre
    	Local device compliance state: finished(state: CommonFramework.ReportedComplianceState.compliant)
    	Local device intune id: IntuneDeviceIDHere
    	Local device lastContactNotificationTime: 2024-02-2 21:56:19 +0000
    	Local device lastContactTime: 2024-03-05 16:22:24 +0000
    	OS version: 17.3.1
    	SSP Version For Upgrade Notification: 53.2401563.001
    Enrollment: 
    	CA state: Quarantine Not Set
    	Current enrollments: 
    		MDM Enrolled: true
    		WPJed: true
    	Enroll completion time: 2024-02-26 16:38:09 +0000
    	Enrollment Remediation State: notRequired
    	Enrollment state: enrolled
    	Login State (Login Manager): LoggedIn
    Managed App Config: 
    	IntuneCompanyPortalEnrollmentAfterUDA: 
    		EnrollmentType: 19
    		IntuneDeviceId: IntuneDeviceIDHere
    		SignedBlobExpiryUTC: 
    		SignedDeviceIdBlob: 
    		UserId: UserIDHere
    <<givenName>> info: 
    	Aad authority: https://login.microsoftonline.com/common
    	Account id: 
    	Account maintenance state: 0
    	Environment: RTM
    	Installation ID: 
    	Is system user: false / true (whether the account is a DEM admin or not)
    	Login State (Authentication): loginCompletedSameUser
    	Tenant id: ContextID/TenantID
    	User id: 
    *************** END OF SSP STATES ***************
    ```

- **Console Logs from a macOS or Windows (if using the [Intune internal tool](https://eng.ms/docs/microsoft-security/management/intune/microsoft-intune/intune/archive/intunewiki/docs/iosconsolesupporttoolforpc):** Make sure to collect Console logs while forcing a device sync with Intune (from CP app or Intune console) because that's when the MDM evaluates the policy with the device.
    - Then you to help you parse thru the logs, look for the name of the restriction or configuration (the name given by Apple and that appears on [Apple Developer documentation](https://developer.apple.com/documentation/devicemanagement/restrictions)this is just an example and it does not contain all the possible configurations by Apple)

- **Sysdiagnose Logs:** these logs are only collected by support and are to be reviewed by Apple Support or Intune Engineering https://developer.apple.com/bug-reporting/profiles-and-logs/.

# FAQ

- **How often does Intune try to push/deploy a device configuration/restriction?** [Policy refresh intervals](https://learn.microsoft.com/en-us/mem/intune/configuration/device-profile-troubleshoot#policy-refresh-intervals)
- **Other common questions can be found in** [Common questions, answers, and scenarios with policies and profiles in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/device-profile-troubleshoot)
- [Known issues with Intune ](https://learn.microsoft.com/en-us/troubleshoot/mem/intune/known-issues)
- [What's new in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/fundamentals/whats-new)


#Training Videos
In this section, you can find a few presentations from devs, a Technical Growth program, and external videos related to iOS:

All PMs/devs presentations for existing an upcoming features can be found here [Intune Features Deep Dive Archives](https://microsoft.sharepoint.com/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/Forms/AllItems.aspx) **(Internal Only)**:
- [2109 - New macOS, iOS, iPadOS device restriction settings](https://microsoft.sharepoint.com/:f:/r/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/2109%20-%20New%20macOS,%20iOS,%20iPadOS%20device%20restriction%20settings?csf=1&web=1&e=Bjil7y)
- [2008 - Support tool for gathering iOS console logs on Windows 10](https://microsoft.sharepoint.com/:f:/r/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/2008%20-%20Support%20tool%20for%20gathering%20iOS%20console%20logs%20on%20Windows%2010?csf=1&web=1&e=kwfs2G)
- [2003 - Microsoft Azure AD SSO App Extension](https://microsoft.sharepoint.com/:f:/r/teams/LearnCSSIntune/IntuneFeaturesDeepDiveArchives/2003-%20%5BiOS%5D%20Microsoft%20Azure%20AD%20SSO%20App%20Extension?csf=1&web=1&e=Atpku4)


All Technical Growth Program presentations can be found here [TGP Recordings](https://microsoft.sharepoint.com/teams/LearnCSSIntune/Stream%20on%20SharePoint/Forms/AllItems.aspx?id=/teams/LearnCSSIntune/Stream%20on%20SharePoint/TGP/TGP%20Recordings_Decks_Internal%20articles&viewid=3d246d60-fdc7-4528-9ca8-667d98dbc9c8)**(Internal Only)**
 
- [Overview of ADE process and troubleshooting](https://microsoft.sharepoint.com/:v:/r/teams/LearnCSSIntune/Stream%20on%20SharePoint/TGP/TGP%20Recordings_Decks_Internal%20articles/TGP%20Presentation_%20Automated%20Device%20Enrollment%20--%20Shared%20iPad-kiwilso.mp4?csf=1&web=1&e=DZWeta)
- [Automated Device Enrollment -- Shared iPad](https://msit.microsoftstream.com/video/2ca30840-98dc-a505-e508-f1ec75153e62)
- [ADE Modern Auth + JIT Enrollment](https://msit.microsoftstream.com/video/c49a0840-98dc-997c-efbe-f1ecb05eece5)

[Synergy Presentations](https://microsoft.sharepoint.com/:f:/r/teams/LearnCSSIntune/Stream%20on%20SharePoint/Synergy?csf=1&web=1&e=eJZ1tE)**(Internal Only)**

**Public videos:**

These videos provide a brief summary of every you need to know about device restriction and feature settings: 

- [iOS Device Restrictions-Microsoft Intune](https://www.youtube.com/watch?v=JhfecIfBn2c)
- [iOS Device Features-Microsoft Intune](https://www.youtube.com/watch?v=X1QBQxB-U-s)

#Additional Documentation
**Microsoft's Documentation:**

- [Configure device restriction settings in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/device-restrictions-configure)
- [iOS and iPadOS device settings to allow or restrict features using Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/device-restrictions-ios)   
- [iOS and iPadOS device settings to use common iOS/iPadOS features in Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/ios-device-features-settings)
- [Use custom settings for iOS and iPadOS devices in Microsoft Intune](https://learn.microsoft.com/en-us/mem/intune/configuration/custom-settings-ios) 
- [Add iOS/iPadOS software update policies in Intune](https://learn.microsoft.com/en-us/mem/intune/protect/software-updates-ios)
- [Managed software updates with the settings catalog
](https://learn.microsoft.com/en-us/mem/intune/protect/managed-software-updates-ios-macos)


**Apple's documentation:**

- Restrictions overview: [Profile-Specific Payload Keys | Apple Developer Documentation](https://developer.apple.com/documentation/devicemanagement/profile-specific_payload_keys#overview)
- iOS/iPadOS/macOS functionality restrictions: [Restrictions | Apple Developer Documentation](https://developer.apple.com/documentation/devicemanagement/restrictions)
- iOS/iPadOS/macOS [supported commands and Queries](https://developer.apple.com/documentation/devicemanagement/commands_and_queries)
- [Use MDM to deploy software updates to Apple devices
](https://support.apple.com/guide/deployment/use-mdm-to-deploy-software-updates-depafd2fad80/web)
- [iOS/iPadOS Software Updates](https://developer.apple.com/documentation/devicemanagement/softwareupdate)
- [Schedule an OS Update](https://developer.apple.com/documentation/devicemanagement/schedule_an_os_update)


#Getting Help
If you're an Intune engineer and you need assistance with a Device configuration case/question:

1. Review and collect **all the information listed** in [Scoping Questions](#Scoping-questions)
2. Consult with your TA/TL.
3. Post your question in the appropriate Teams Channel and tag "iOS Device - Config Feature, restriction" SME's.
	
	Device - Config - Features, Restriction: https://aka.ms/Intune-DevConfig
	
4. Join the Automated Device Enrollment (ADE Formerly DEP) and Volume Purchase Program (VPP) Triage, where you can post your question at any time and/or join the weekly Friday call at 10:00 AM EST.
		https://aka.ms/ADEHelp
	
3. Additionally, you can also reach out to our iOS/iPadOS SME's directly on Teams
- Carlos Hernandez (caher)
- Kirllean Varela (kiwilso)
- Adriel Espinoza (jespinoz)
- Kinshuk Sharma (kinsharm)

The most current list of SMEs can be found at https://aka.ms/IntuneSMEs
