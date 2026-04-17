---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Autopilot"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=%2FAutopilot"
importDate: "2026-04-05"
type: troubleshooting-guide
---
Page Author: @<CAEC069F-A7FC-6933-B98D-C346A7DB1BC0> 

Have feedback on this article? Please contact: IntuneAutopilotSMEs@microsoft.com
[[_TOC_]]

#About Autopilot
Windows Autopilot is an automated process that transforms Windows 10 devices from their initial state as shipped from the OEM into a business ready device with little to no interaction by end users.

Autopilot is unlike a typical operating system (OS) deployment used by organizations. In those deployments, organizations must go through the long process of device imaging which requires a lot of effort and time from an IT engineer. This process starts with creating a new image, installing the needed software and updates, cloning and deploying that image to a wide number of PCÆs using and operating system deployment tool like ConfigMgr, MDT or another third party solution.

**Typical deployment lifecycle**

![evergreen_neutral_73560053-cc4d-4d41-8626-jchap1.png](/.attachments/Autopilot/evergreen_neutral_73560053-cc4d-4d41-8626-jchap1-8843a409-8b74-4918-b213-9a5f71d1360e.png)

With Windows Autopilot all the time consuming operations are eliminated. The devices will be shipped with an OEM-Optimized version of Windows 10 that is pre-installed on the device, and once the device boots up for the first time it will be on its initial state ôOOBE.ö The end users will just connect the device to the internet, enter their corporate credentials and the device will setup automatically without any additional interaction. It will join to either Azure Active Directory or On-Prem AD (Hybrid AAJ), enroll into Intune or any other MDM. Intune or that other MDM will push the corporate apps and policies to the device.

**Deployment Using Autopilot**

![evergreen_neutral_73560053-cc4d-4d41-8626-jchap2.png](/.attachments/Autopilot/evergreen_neutral_73560053-cc4d-4d41-8626-jchap2-bdbcf496-3c86-4bbb-9ce3-6d5f497a6e01.png)

**Autopilot Deployment Scenarios**

Autopilot offers five different deployment scenarios that below is a structure of the available scenarios with brief explanation about the key points for each one of them.

![evergreen_neutral_73560053-cc4d-4d41-8626-jchap3.png](/.attachments/Autopilot/evergreen_neutral_73560053-cc4d-4d41-8626-jchap3-6883e9ac-11a4-4708-bbc2-2c447462c2d5.png)

#Key Components

Before starting with how each deployment scenario works, itÆs important to understand the key components that are included in the Autopilot process and how those components work together to complete the Autopilot deployment lifecycle:

**Device Hardware Hash**

The device hardware hash is a subset of information related to the device hardware. ItÆs a unique identifier for each specific hardware device. Each device will have a different hardware hash. Before starting the Autopilot process, each device hardware hash for the organization should be imported to the Autopilot service. This import action can be done by the reseller, an OEM, or even the organization admins. Normally the Get-WindowsAutopilotInfo.ps1 script is used to generate the hardware hash for a device and this script is available in the PowerShell gallery. This PowerShell script will generate the hardware hash from the device and export it as a CSV file which will contain three main columns for Device Serial Number, Product Id, and the Encoded Hardware Hash. The admins or OEM can import this CSV into the service through Intune/M365/Microsoft Store/Partner center. Note that the hardware hash can be associated with only one tenant. In order to re-associate the device with a different tenant, it should be removed first from the original tenant its imported in.

**Device Directory Service (DDS)**

 Device Directory Service (DDS) is the core Autopilot service. ItÆs the backbone of the Autopilot Process. Note that Autopilot is not a service within Intune or any MDM, but rather it's a separate cloud entity. However, Intune can leverage DDS and use it with the enrollment process. When a device hardware hash is imported via Intune or any other MDM or portal, it is imported into DDS. Intune or any other MDM solution or portal is used as an interface to import the hardware hash into DDS. Users don't have direct access to DDS. Additionally, any Autopilot profile with any deployment scenario created in Intune or any other portal will on the backend will be sent to DDS and correlated with the hardware hash.

**Zero-Touch Device Identifier (ZTDID)**

The ZTDID is a unique identifier used by the Autopilot DDS service. This unique ZTDID is based on the device's hardware hash. IT Pros or Partners will upload the HWHASH to the Autopilot DDS service in the cloud. When a device boots into OOBE, a call is made to the Autopilot DDS service to determine if the ZTDID retrieved from that device is assigned a profile from the tenant's Autopilot devices blade. If no specific Autopilot profile is found, then a default set of Autopilot profile settings are used.

**Offline Domain Join**

Offline Domain Join (ODJ) is a feature which allows joining a device to a domain without the device physically contacting a domain controller. To complete the domain join operation offline, a TXT file that contains a domain join blob for the device needs to be created on the Domain Controller using djoin.exe via the /provision parameter. The TXT file is then imported manually by the user on the device. The TXT file then allows the device to join the domain offline. Intune can use the same method with a Hybrid Domain Join deployment. An Intune domain join connector is installed into an on-prem environment. The Intune domain join connector then requests the domain join blob for each device that is requesting to enroll. This will be covered more in the next section.

#How Windows Autopilot works

Windows Autopilot workflow can be divided into two sections: Service workflow and Device workflow. The service workflow is similar for all scenarios except Autopilot for existing devices. The difference between each scenario can be seen in the device workflow and the enrollment process. LetÆs start with deployment scenarios and describe the workflow for each one:

**Autopilot User-Driven Azure AD Join**

![evergreen_neutral_64fa48fd-67e6-0af3-b9fd-jchap10.png](/.attachments/Autopilot/evergreen_neutral_64fa48fd-67e6-0af3-b9fd-jchap10-8467776f-5878-486e-8513-4691106774b7.png)

1. Admin/OEM will import the device hardware hash into the service through Intune, M365, Microsoft Store, or partner center portal.
1. In the backend, Intune will communicate with the DDS and add this hardware hash into it.
1. DDS will check to make sure that the device doesn't already exist and is associated with any other tenant. It will then assign a ZTDID to the device and initiate a Pre-Creation call with Azure Device registration service to create a synthetic record into Azure Active directory.
1. DDS will create a Device Object in Azure AD for this device. This pre-created device will be in Disabled state and the display name will be the device serial number.
1. The admin will either create a dynamic or static group that will contain all ZTDID devices. To see how to create a dynamic group membership for ZTD devices, refer to the article Create an Autopilot device group using Intune.After creating the Device Group and adding the device to it, the admin will create a user driven AADJ autopilot profile and assign it to that group.
1. Intune will communicate again with the DDS to assign that Autopilot profile for the device in DDS.
1. The device will boot up into the Initial state (OOBE). The first screens will be the Language, region and keyboard. If the device has a wireless NIC and is not connected to a wired ethernet NIC, the Connection page will appear so that the device can connect to a Wi-Fi network. If the device is connected to a wired ethernet NIC, the Connection page won't appear. After initiating the connection, the device will communicate with the DDS and send the hardware ID to DDS. DDS will verify whether or not the device exists in its database. If the device exists in the DDS database, then DDS will send the Autopilot profile associated with that device created in step #6 in JSON format. Once the device installs the Autopilot profile JSON file, the user will enter the corporate credentials. If configured, the company branding page will also appear at this point. It is recommended to configure the company branding page.
1. After entering the corporate credentials, the device will join Azure Active directory and it will associate itself with the Pre-created Device Object created in step #4.
1. After the join operation has completed, the device will automatically enroll to Intune since the automatic MDM enrollment is enabled.
1. Since Intune is now aware of the device and the user, it can send any policy apps to the device/user context. If ESP is enabled, the user will see the Enrollment status page that will track all the apps and policies deployment progress. For more information about ESP, see the article INTUNE :The Enrollment Status Page - Deep Dive.

**Autopilot User-Driven for Hybrid AD Joined Devices (HAADJ)**

![evergreen_neutral_73560053-cc4d-4d41-8626-jchap5.png](/.attachments/Autopilot/evergreen_neutral_73560053-cc4d-4d41-8626-jchap5-290b43d5-2df3-40c1-bca1-72b608d732b5.png)

**From step 1 to step 5, there are no big difference from the User-driven Azure AD Join except that the Autopilot profile join type will be Hybrid AD Join. Additionally, the admin should create the Domain Join configuration profile in Intune and assign it to the Autopilot Device group. The below is a continuation from step 6 from the Autopilot User-Driven Azure AD Join scenario.**

1. After the device contacts DDS and installs its associated Autopilot Hybrid Domain Join profile, the user will be prompted to enter the corporate Azure AD UPN (universal principal name) and password in the company branding page.
1. On the backend, for the hybrid Azure AD join method, the device will be registered to Azure AD but not joined to Azure AD. The device will also enroll into Intune immediately. Once the device gets enrolled into Intune, it will request an Offline Domain Join Blob from Intune.
1. Intune will evaluate whether or not the device is assigned to a domain join profile. If it is, then it will pre-stage the device for the connector with the needed information (domain name, target OU, naming prefix, etc.)
1. The on-prem connector checks with the service every 2 minutes to check if there is any pre-staged device that needs to be created and requesting a offline domain join blob. When the on-prem connector finds that there is a device object that is pre-staged, it will create the device object.
1. The on-prem connector will create the device object in Active Directory as per the domain join profile details. It will then request to generate the offline domain join blob.
1. The on-prem connector will upload the offline domain join blob for that specific device back to Intune.
1. Intune will send the offline domain join blob back to device.
1. The device will apply the offline domain join blob and change the name as created in Active Directory by the on-prem connector. For a typical hybrid Azure AD join deployment, the device should be in the same network as the Active Directory relay. The device should be on the same network because after the offline domain join blob is applied to the device, the device will attempt to contact the domain controller via an ICMP ping. If the domain controller is reachable, then the device will complete the domain join operation and reboot. If the domain controller is not reachable, the device will keep trying for 25 minutes to contact the domain controller. If the domain controller can't be reached after 25 minutes, then the operation will fail with the timeout error Domain not reachable 80070774. When attempting a hybrid Azure AD join over VPN (SkipDomainConnectivityCheck), the ICMP ping step will be skipped, and the device will reboot immediately after applying the offline domain join blob.
1. Once the device bootup again, if ESP is enabled, ESP will appear, and the Intune will start pushing all the policies and apps assigned to the device.
1. If ESP is enabled, after the Device Setup phase is completed, the user will be navigated to the normal windows login page. The user should authenticate with the domain\user on-prem credentials and not with the Azure AD UPN. At this stage itÆs very important to make sure that AD connect tool synced the device to Azure AD as a hybrid Azure AD join device so when the user authenticates, an Azure primary refresh token (PRT) will be obtained. If the device is not synced yet and the ESP User Setup Account Setup is enabled, the ESP may timeout since the user doesnÆt have a valid PRT. A PRT is required to sync with Intune in a user context.

**Autopilot Self-Deploying mode**

Self-Deploying mode is used for scenarios where there is no need for a user to be associated with the device (useless enrollment). The scenario is useful if the organization is looking to deploy kiosks, shared devices, or digital signage devices. The Autopilot self-deploying scenario allows no user interaction (zero touch). When the device boots up, if it is plugged into a wired ethernet connection, the deployment will be fully automated. The TPM attestation will be leveraged in this scenario to securely authorize the device to join Azure AD and enroll into Intune. Intune can deploy a Kiosk profile with the auto login capability. Admins can also setup an auto start application.

This scenario requires:

- Windows 10 1903+
- Physical device with TPM 2.0 (Virtual Machine TPM is not supported and will not work)
- Wired ethernet connectivity to get the Zero-Touch experience
- Wi-Fi connection is supported and will work but the user must manually pass two screens on OOBE to reach the network connection page and connect to Wi-Fi.

**Windows Autopilot for pre-provisioned deployment (formerly known as Autopilot for white-glove deployment)**

In a Windows Autopilot for pre-provisioned deployment, the organization can delegate the OEM, Partners, or the IT Technicians to pre-provision the devices before distributing them to the end users. With Windows Autopilot for pre-provisioned deployment mode, all the time-consuming pieces in Autopilot process like the enrollment, apps, and policies installation can be completed by the technicians. The technicians can then reseal the device and hand it to the end user. The end user just needs to boot the device after the reseal and enter their credentials. After the end user logs in, the device will be ready to use within a few minutes since all the required apps and policies are already installed in the technician phase.

During the technician phase, the self-deploying mode functionality is leveraged. The enrollment and the Azure AD join occurred without user affinity by using the TPM attestation process. The end user phase will be the normal user-driven mode.

This scenario requires:

- Windows 10 1903+
- Physical device with TPM 2.0 (Virtual Machine TPM is not supported and will not work)
- Wired ethernet connectivity (Wi-Fi is not supported in this scenario)

**Process Flow Summary**

![17fb4add-9e07-416b-8a17-07c19995e70b-jchap100.png](/.attachments/Autopilot/17fb4add-9e07-416b-8a17-07c19995e70b-jchap100-8fb43e02-260b-462c-9217-2e868ebef535.png)
![17fb4add-9e07-416b-8a17-07c19995e70b-jchap101.png](/.attachments/Autopilot/17fb4add-9e07-416b-8a17-07c19995e70b-jchap101-5fe5039c-fe58-45ad-835c-1eaeff6a25a0.png)

#Configuring Autopilot Self-Deploying mode
For a detailed, step-by-step tutorial of Autopilot self-deploying mode see [Overview for Windows Autopilot self-deploying mode in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/self-deploying/self-deploying-workflow)

You can find a detailed overview of all Autopilot scenarios here: [Windows Autopilot scenarios](https://learn.microsoft.com/en-us/autopilot/tutorial/autopilot-scenarios)
 
We notice new column called **Userless enrollment status** 

![Userless enrollment status](/.attachments/Autopilot/userlessenrollmentstatus.png)
Starting in 2310, we're making an update to the self-deployment and pre-provisioning modes for manufacturers that have not opted-in to attesting to removal of Windows Autopilot refurbished devices. Customers using these manufacturers were still subjected to the one-time device-based enrollment block in the self-deployment and pre-provisioning modes. This block means that the device could go through self-deployment or pre-provisioning mode once and then get blocked from doing it again. This behavior could cause problems if the device needed to be reset or redeployed. This change in 2310 enables a button in the Windows Autopilot devices section in Intune to manually unblock those devices. This update only works for certain OEMs and doesn't work on the Fix pending status. Reach out to your respective OEM to confirm whether this functionality is enabled for your device. We can select device in Autopilot device list to unblock it. 

#Configuring Windows Autopilot for Pre-Provisioned Deployment

**IMPORTANT!** The Windows Autopilot white glove feature has been renamed to Windows Autopilot for pre-provisioned deployment.

For a detailed, step-by-step tutorial for Windows Autopilot for pre-provisioned deployment Azure AD join in Intune see [Overview for Windows Autopilot for pre-provisioned deployment Azure AD joins in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/pre-provisioning/azure-ad-join-workflow)

For a complete, step-by-step tutorial for Windows Autopilot for pre-provisioned deployment hybrid Azure AD join in Intune see [Overview for Windows Autopilot for pre-provisioned deployment hybrid Azure AD join in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/pre-provisioning/hybrid-azure-ad-join-workflow)

You can find a detailed overview of all Autopilot scenarios here: [Windows Autopilot scenarios](https://learn.microsoft.com/en-us/autopilot/tutorial/autopilot-scenarios)

#Configuring Autopilot for existing devices
For a detailed, step-by-step tutorial for Windows Autopilot deployment for existing devices in Intune and Configuration Manager see [Overview for Windows Autopilot deployment for existing devices in Intune and Configuration Manager](https://learn.microsoft.com/en-us/autopilot/tutorial/existing-devices/existing-devices-workflow)

You can find a detailed overview of all Autopilot scenarios here: [Windows Autopilot scenarios](https://learn.microsoft.com/en-us/autopilot/tutorial/autopilot-scenarios)

#Configuring User Driven Mode for HAADJ devices
For a complete, step-by-step tutorial for Windows Autopilot user-driven hybrid Azure AD join in Intune see [Overview for Windows Autopilot user-driven hybrid Azure AD join in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/user-driven/hybrid-azure-ad-join-workflow)

For a complete, step-by-step tutorial for Windows Autopilot for pre-provisioned deployment hybrid Azure AD join in Intune see [Overview for Windows Autopilot for pre-provisioned deployment hybrid Azure AD join in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/pre-provisioning/hybrid-azure-ad-join-workflow)

You can find a detailed overview of all Autopilot scenarios here: [Windows Autopilot scenarios](https://learn.microsoft.com/en-us/autopilot/tutorial/autopilot-scenarios)

# Configuring HoloLens 2 Autopilot
HoloLens 2 Autopilot Configuration (supporting link: [https://learn.microsoft.com/en-us/hololens/hololens2-autopilot](https://learn.microsoft.com/en-us/hololens/hololens2-autopilot))

**Overview**

HoloLens 2 Autopilot features its own Autopilot Profile within the Endpoint Administrator portal and follows the Self-Deploy method. This means HoloLens 2 devices configured by Autopilot will not have user affinity and cannot access resources that require affinity (such as a personalized Company Portal experience). HoloLens 2 can be configured for User-Affinity without Autopilot if user-affinity is desired.

**Requirements and Prerequisites**

HoloLens (i.e. HoloLens 1) is not supported for Windows Autopilot.

All requirements for Windows Autopilot https://learn.microsoft.com/en-us/autopilot/requirements?tabs=configuration and steps for self deployind mode: https://learn.microsoft.com/en-us/autopilot/tutorial/self-deploying/self-deploying-workflow#workflow  must be met.

Active Directory Join (Domain join) or Hybrid Azure AD Join scenarios are not supported with Autopilot for HoloLens 2 profiles.

HoloLens 2 must be using Windows Holographic version 2004 (build 19041.1103 or later). Since these are pre-installed OS builds the customer may have older versions that arenÆt supported (like 1903). If this is the case the customer may use the ARC tool (referenced in the HoloLens AP doc) to update the latest OS. In general, itÆs best practice for customers to work with their sellers to ensure they have up-to-date devices shipped to them.

In the 2004 release, devices need to be connected to the internet via ethernet before turning on the HoloLens and initiating the Autopilot provisioning process. In 20H2 (19041.1128+) devices can use either Wi-Fi or Ethernet to provision via Autopilot.

**How to Collect Logs if there is an issue with HoloLens Autopilot**

Retrieving diagnostic logs can be performed by pressing the Power and Volume Down buttons at the same time and then releasing them. This generates a .zip file of the device diagnostics and hardware hash that can be extracted using a USB-C cable connection to a computer and navigating to ôThis PC\<Device Name>\Internal Storage\Documents\AutopilotDiagnostics.zipö file.

**Known Issues**

Since HoloLens Autopilot uses Self-Deploy it may have the same known issues. This area will be updated as issues are found or identified.

#Configuring Autopilot User Driven mode (AADJ)

For a detailed, step-by-step tutorial for Windows Autopilot user-driven Azure AD join in Intune see [Overview for Windows Autopilot user-driven Azure AD join in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/user-driven/azure-ad-join-workflow)

For a detailed, step-by-step tutorial for Windows Autopilot for pre-provisioned deployment Azure AD join in Intune see [Overview for Windows Autopilot for pre-provisioned deployment Azure AD joins in Intune](https://learn.microsoft.com/en-us/autopilot/tutorial/pre-provisioning/azure-ad-join-workflow)

You can find a detailed overview of all Autopilot scenarios here: [Windows Autopilot scenarios](https://learn.microsoft.com/en-us/autopilot/tutorial/autopilot-scenarios)

#Setting time zones in OOBE

In most builds, the time zones get automatically updated, however for Enterprise customers this experience can vary.  Windows Autopilot has a variety of customers that want different setup experiences for their users and there are a few options outlined below you can consider customizing this experience for your users. 

:rotating_light: <span style="color:red;font-weight:bold">IMPORTANT!</span> :rotating_light: When using a Virtual Private Network (VPN), the time zone configuration should be applied before connecting to VPN. 

Whether you are using Autopilot registered or unregistered out of box experience (OOBE), setting time zones for your users can be simple and tailored to what works best for you.  

**Method 1: Enable privacy page**

Enabling the privacy page in the Windows Autopilot profile settings allows users to select their time zone. By default, the privacy settings page is set to Hide on the Windows Autopilot profile page but if you set it to Show, you can allow your users to determine which settings they want to enable.  

![jchAPTimeZone1](/.attachments/Autopilot/jchAPTimeZone1.png)

**Method 2: Enable through the settings catalog**

If showing the privacy page isn't an option for the customer, you can use the settings catalog to turn on location services without requiring the user to configure anything. This typically is applied during the user account setup phase in the Enrollment Status Page (ESP).

Autopilot applies the device policy and application configuration assigned to the Microsoft Entra ID device object which is pre-created for each device registration. You can apply configuration by creating dynamic Entra security groups based on the pre-created device objectsÆ properties. The æDevicePhysicalIdsÆ property of that object can be configured with attributes such as the æOrderIdÆ which can then be leveraged in Dynamic Security Group rules. The æOrderIdÆ for an Autopilot device can be configured at the time a device is registered or, later through the Intune admin center.

Autopilot also replicates the information contained in the æDevicePhysicalIdsÆ property from the pre-created Microsoft Entra ID device object to the Microsoft Entra hybrid device object for Autopilot hybrid configurations. This is done to ensure that the memberships for the Autopilot device remain consistent as the device switches its identity from the  Microsoft Entra ID device to the Microsoft Entra hybrid joined device.

![jchAPTimeZone2](/.attachments/Autopilot/jchAPTimeZone2.png)

**Method 3: PowerShell scripts:**
Windows PowerShell is a helpful tool that can be used to customize the deployment experience for your users.

If you only want to set the time zone once and know where the user sits without turning on location services during setup you can use the time zone command. For example:

**Tzutil /g ôEastern Standard Timeö**

#Scoping Questions

- Is this a new Autopilot deployment? If yes, confirm the [prerequisites](https://learn.microsoft.com/en-us/autopilot/requirements) are met
- What type of Autopilot deployment are you currently using? Auto-pilot user-driven, Autopilot self-deploying , Autopilot for pre-provisioned deployment, or Windows Autopilot for existing devices?
- Is this a Hybrid AD Join or AD Join deployment? If this is a Hybrid Deployment confirm the [prerequisites](https://learn.microsoft.com/en-us/autopilot/requirements) are met.
- Are you getting any specific error message? If yes, when does the error shows up?
- Are currently using a physical device or a virtual machine? If using a virtual machine, consider Autopilot for pre-provisioned deployment method is not supported.

**NOTE** Every time a device needs to be re-enroll with Autopilot it must be reset. Do not reset the client device using a revert option on the virtual manager tool. An Intune Wipe needs to be triggered so the device records (Intune and Azure) are deleted correctly. Otherwise, re-enrollment will fail.

- What is the UPN of the affected user?
- What device, model, OS Version, serial number is currently impacted?
- Was the Autopilot deployment working fine and it suddenly stopped, or it never completed successfully?
- When does this problem started?
- What is the name of the affected Autopilot deployment profile and targeted group (Dynamic or assigned group)? If using Hybrid AD Join also ask for the Domain Join profile.

#Support Boundaries
Intune supports the Autopilot process as well as the Enrollment Status Page (ESP). There are exceptions however, including the following:
- If the Autopilot (AAD Device) objects have the correct ZTDID and Group Tags, but dynamically assigned AAD Device groups are not adding them as members, consult with the AAD Account management team.
- If there is a generic Out-of-Box-Experience (OOBE) or setup issue happening before the Tenant login screen, consult the Windows Devices and Deployment (D&D) team.
- If the Autopilot process starts but then experiences authentication issues during enrollment, consult the AAD Authentication team.

#Troubleshooting Autopilot
- [Windows Autopilot troubleshooting overview](https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq)
- [Troubleshoot Autopilot device import and enrollment](https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq)
- [Troubleshoot Autopilot OOBE issues](https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq)
- [Troubleshoot Windows Autopilot Azure AD join issues](https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq)
- [Tropubleshoot Windows Autopilot policy conflicts](https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq)
- [Windows Autopilot known issues](https://learn.microsoft.com/en-us/autopilot/known-issues)
- [Windows Autopilot resolved issues](https://learn.microsoft.com/en-us/autopilot/known-issues)

##Access to UDiag utility

UDiag is an excellent troubleshooting utility that will help process your Autopilot.cab. It may see existing or known issues, but more importantly it provides a cleaner/easier way to view the contents of your Autopilot.cab with the ability to search, sort and it auto color-codes. In order to get to the file share to download Udiag, you must join a specific MyAccess group. Here are those details:

<br><br>
**For UDiag Access:**
<br>


Go to https://coreidentity.microsoft.com/manage/entitlement/entitlement/winaponcalli-ehqv 
and Request Access to:
<br>
![image.png](/.attachments/Autopilot/image-4fbbd27a-f168-431e-b334-3f3cbf31a509.png)

<br> <br>
And the justification is: _"For the ability to use UDIAG by Intune CSS."_
<br>
After access is granted, then you will be able to access this file share when on CorpNet (Azure) VPN:  **\\\fsu\shares\udiag\prod\UDiag.application**
 
<br>
**UDiag usage note** : for now, always choose the following for any Autopilot cab:

![image.png](/.attachments/Autopilot/image-497f0284-4458-412f-a2f1-a68c6f5f2ee1.png)
<br>
##Known Issues
- This is _**Microsoft-Internal-Only**_ information: TPM attestation MAY fail for **Manufacturer Name: NTZ** TPM chips that were produced prior to August 2022. This is across various firmware versions. The issue is fixed by NTZ for TPM chips produced after August 2022. 
  - The easiest check for this is running:        `certreq -enrollaik -config ""`
  - The command above will succeed for NTZ chips manufactured after August 2022 and _will fail for NTZ chips produced before August 2022_.
    - The failure message will say: _"Bad Request No valid TPM EK/Platform certificate provided in the TPM identity request message."_
  - If your customer has an NTZ TPM chip produced before August 2022 (the command above fails) then the customer will not be able to do AP Pre-Provisioning on that device, this issue is a manufacturer issue and not resolvable by Microsoft. The customer should contact and work with NTZ for their TPM chip.

#FAQ
- [Autopilot FAQ](https://learn.microsoft.com/en-us/autopilot/faq)

#Training and Videos for Autopilot
**Cloud Academy Training for Autopilot**

[https://aka.ms/scim-mgmtsupready](https://aka.ms/scim-mgmtsupready "https://aka.ms/scim-mgmtsupready") >> Training Catalog >> Keyword search "Autopilot" under the Microsoft Intune dropdown. Engineers can then go directly to each of the trainings' under "View Training".

![image.png](/.attachments/Autopilot/image-dcce9c1c-4dcf-4bbc-b7a8-a5f527654645.png)

**Learning Bytes Training for Autopilot**

[https://aka.ms/scim-mgmtsupready](https://aka.ms/scim-mgmtsupready "https://aka.ms/scim-mgmtsupready") Look under Learning Bytes 

![image.png](/.attachments/Autopilot/image-c92c3af5-a1e0-4173-9b9b-6dadd6362443.png)


**March 8, 2023 - Allowing admins to install required applications but not fail pre-provisioning if a non-blocking application fails.**
- Recording: [Install required apps during pre-provisioning-Meeting Recording.mp4](https://nam06.safelinks.protection.outlook.com/?url=https:%2f%2fmicrosoft.sharepoint.com%2f:v:%2ft%2fCxERSC%2fET824E72T4RMlA0JzbRU7cMBW8UUlGtv-llXQqHRGQbgbA?e%3DwZv4Wv&data=05%7c01%7cjchornbe%40microsoft.com%7c26fb696f33a745915fee08db21837b74%7c72f988bf86f141af91ab2d7cd011db47%7c1%7c0%7c638140621078206673%7cUnknown%7cTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7c3000%7c%7c%7c&sdata=x8YpJnShZhfYdsmfZAkwvzjDOIusdmXbyp0kxUXoZmY%3D&reserved=0)
- Deck: [Install required apps during pre-provisioning.pptx](https://nam06.safelinks.protection.outlook.com/ap/p-59584e83/?url=https:%2f%2fmicrosoft.sharepoint.com%2f:p:%2ft%2fCxERSC%2fEV8N5a9CTtdBqOp1IWWq_DwBdEC36e6qhCJp6hBcqHopzg?e%3DaTDufH&data=05%7c01%7cjchornbe%40microsoft.com%7c26fb696f33a745915fee08db21837b74%7c72f988bf86f141af91ab2d7cd011db47%7c1%7c0%7c638140621078206673%7cUnknown%7cTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7c3000%7c%7c%7c&sdata=dvn0Oao9R6K7VMioig5QK765vrVwMIY2UI2f8b00OmU%3D&reserved=0)
- Q&A: [Install required apps during pre-provisioning - QA.pdf](https://nam06.safelinks.protection.outlook.com/ap/b-59584e83/?url=https:%2f%2fmicrosoft.sharepoint.com%2f:b:%2ft%2fCxERSC%2fEWL0PDnZxwRNj2rNjucy9LIBnPhPePFf0E-FvV_dclgZGQ?e%3DjlnShy&data=05%7c01%7cjchornbe%40microsoft.com%7c26fb696f33a745915fee08db21837b74%7c72f988bf86f141af91ab2d7cd011db47%7c1%7c0%7c638140621078206673%7cUnknown%7cTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7c3000%7c%7c%7c&sdata=B2gML%2B%2B2n%2B8bTJfxh7aItL9jRwwkfi7YAiQv7USixpE%3D&reserved=0)
- Blog: [Update to Windows Autopilot pre-provisioning process for app installs](https://nam06.safelinks.protection.outlook.com/?url=https:%2f%2faka.ms%2fIntune%2fAutopilot%2fpre-provisioning-updates&data=05%7c01%7cjchornbe%40microsoft.com%7c26fb696f33a745915fee08db21837b74%7c72f988bf86f141af91ab2d7cd011db47%7c1%7c0%7c638140621078206673%7cUnknown%7cTWFpbGZsb3d8eyJWIjoiMC4wLjAwMDAiLCJQIjoiV2luMzIiLCJBTiI6Ik1haWwiLCJXVCI6Mn0%3D%7c3000%7c%7c%7c&sdata=Fd2H4bVDuXgAvY53gv1Mxv%2f%2B5z6iues6lxno7wNG%2BUo%3D&reserved=0)

> :warning: **NOTE**: The following videos were hosted on Microsoft Stream Classic, which was **retired on April 15, 2024**. These links are no longer accessible. Check with the TGP recordings on SharePoint or contact the original authors for updated content.
> - *Autopilot End To End Workflow & Troubleshooting* ù Mohammad Bazzari
> - *Autopilot with Hybrid Azure AD Join - Part 1* ù Timofei Tonu
> - *Autopilot with Hybrid Azure AD Join - Part 2* ù Kushal Mishra
> - *Windows Autopilot for white glove deployment* ù Matthew Gardner
> - *Hybrid Autopilot Overview* ù Betty Jia

[S01E38 - Advanced AutoPilot Troubleshooting with Michael Niehaus](https://www.youtube.com/watch?v=ej8C-3xSjMU) - (I.T)

[Re-enrolling autopilot device fails with "Securing your hardware, Failed: 0x800705b4](https://internal.evergreen.microsoft.com/en-us/topic/9a8a2d4c-8ca6-0089-2ff5-87e852dbee02) - Yagyesh Agarwal


**TGP Presentations**

**Vimaldas Changarath**

- [TGP TGP Intune_ Autopilot, User driven hybrid autopilot in-depth troubleshooting-20231003_193317-Meeting Recording.mp4](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles%2FTGP%20Intune%5F%20Autopilot%2C%20%20User%20driven%20hybrid%20autopilot%20in%2Ddepth%20troubleshooting%2D20231003%5F193317%2DMeeting%20Recording%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E129dcfa1%2D182a%2D438e%2D8472%2Dd94d62f504c8)
- [Deck User driven hybrid autopilot in-depth troubleshooting - Vimaldas Changarath.pptx](https://microsoft.sharepoint.com/:p:/r/teams/LearnCSSIntune/_layouts/15/Doc.aspx?sourcedoc=%7BF420B4C8-267F-4E68-B403-172AF58C8FB2%7D&file=User%20driven%20hybrid%20autopilot%20in-depth%20troubleshooting%20-%20Vimaldas%20Changarath.pptx&action=edit&mobileredirect=true)
- Internal article - [Intune: Troubleshooting effective group membership for app targeting/evaluation in Autopilot ESP (microsoft.com)](https://internal.evergreen.microsoft.com/en-us/topic/5d1a6247-ba69-fcc4-889b-16a9a1fd6485)

**Ibrahim Soliman**

- [TGP Presentation Intune Autopilot Pre-Provisioning](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles%2FTGP%20Presentation%20Intune%20Autopilot%20Pre%2DProvisioning%20%2D%20TPM%20Attestation%20Station%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E48429af6%2D6dd8%2D4cf0%2Db31e%2D1dc947f0f11a)
- [Intune Autopilot PreProvisioning - TPM Attestation Station](https://microsoft.sharepoint.com/:p:/r/teams/LearnCSSIntune/_layouts/15/Doc.aspx?sourcedoc=%7BCCB634C2-9450-445C-AFAB-19F9F13FBB96%7D&file=Intune%20Autopilot%20PreProvisioning%20-%20TPM%20Attestation%20Station%20-%20isoliman.pptx&action=edit&mobileredirect=true)
- Internal article [Intune: Autopilot TPM Attestation Workflow and Troubleshooting](https://internal.evergreen.microsoft.com/en-us/topic/2d93d04f-6887-dc9e-a86d-51abced4f1ae)

**Mohamed Elkadry**

- [TGP Presentation Networking Inside Autopilot](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles%2FTGP%20Presentation%20Networking%20Inside%20Autopilot%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E76461a9f%2D7617%2D44f9%2Db7d5%2D193b7a347af7)
- Deck - [Networking Inside Autopilot](https://microsoft.sharepoint.com/:p:/r/teams/LearnCSSIntune/_layouts/15/Doc.aspx?sourcedoc=%7B10B2F9B9-99F3-4E1F-86E1-19C36D25EE4C%7D&file=Networking%20Inside%20Autopilot%20-%20melkadry.pptx&action=edit&mobileredirect=true)

**Fernando Lizano**

- [TGP Presentation Autopilot Into Co-Management](https://microsoft.sharepoint.com/teams/LearnCSSIntune/_layouts/15/stream.aspx?id=%2Fteams%2FLearnCSSIntune%2FStream%20on%20SharePoint%2FTGP%2FTGP%20Recordings%5FDecks%5FInternal%20articles%2FTGP%20Presentation%20Autopilot%20Into%20Co%2DManagement%2Emp4&referrer=StreamWebApp%2EWeb&referrerScenario=AddressBarCopied%2Eview%2E8e365156%2D29e9%2D44d0%2D915a%2Db5c7f40c1ae6)
- [Autopilot Into Co-Management](https://microsoft.sharepoint.com/:p:/r/teams/LearnCSSIntune/_layouts/15/Doc.aspx?sourcedoc=%7B5C8A4AE0-C305-47DB-9AB9-15FC5E528434%7D&file=Autopilot%20Into%20Co-Management%20-%20felizano.pptx&action=edit&mobileredirect=true)
- Internal Article Intune: [Troubleshooting Co-Management settings for Autopilot SCCM client installation issues](https://internal.evergreen.microsoft.com/en-us/topic/54106815-6138-e126-d24a-77162270ebc7)

#Additional Documentation

- Windows Autopilot Self-Deploying Mode: https://learn.microsoft.com/en-us/autopilot/self-deploying
- Windows Autopilot deployment process (Flow chart): https://learn.microsoft.com/en-us/autopilot/deployment-process
- Inside Windows Autopilot self-deploying mode: https://oofhours.com/2019/10/01/inside-windows-autopilot-self-deploying-mode/
- How to turn on Automatic Logon in Windows: https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/turn-on-automatic-logon
- Michael Nielhaus: Windows Autopilot device provisioning network traffic, annotated: https://oofhours.com/2019/09/03/windows-autopilot-device-provisioning-network-traffic-annotated/
- Intune: Autopilot detailed troubleshooting: https://internal.evergreen.microsoft.com/en-us/topic/3f8e7c6e-9cdd-9fd7-b0d7-80eda4b1f595
- Troubleshooting Windows Autopilot: https://learn.microsoft.com/en-us/autopilot/troubleshooting-faq
- Userless enrollment status: https://learn.microsoft.com/en-us/autopilot/whats-new#unblock-fix-pending-state-for-self-deploying-and-pre-provisioning-mode-for-disabled-oems 

**Third-party documentation**

- https://www.anoopcnair.com/guide-windows-autopilot-process/
- https://www.anoopcnair.com/windows-autopilot-troubleshooting-guide/


# Getting Help with Cases
## Collaborating with SMEs
- Please leverage the MS-Teams based **Autopilot Technical Community** here: https://teams.microsoft.com/l/channel/19%3A88e9d65483b343108bd5c56a51dd910f%40thread.tacv2/Autopilot?groupId=7ade7659-5114-40df-adc9-55fb5d3460ac&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47 
## Escalations such as RFC or IET requests

- For APv1 cases, in lieu of this function,   
_GetZTDidAADidAndIntuneIDFromAnyOfThoseIDs(<Any of the IDs such as AAD, Intune or ZTD>)_, in the Autopilot ICM template, you must use the following Kusto from Assist365 Kusto Explorer:
```
  
let currentTenantId = 'accountId'; //Account ID here
let DeviceID = 'AnyDeviceorZTDIdHere';
ZTDDevice_Snapshot
| where AccountId == currentTenantId
| where ZTDRegistrationId == DeviceID or DeviceDataStoreAzureADDeviceId == DeviceID or AADObjectId á== DeviceID or CreateIntuneDeviceId == DeviceID
| project ZTDCreatedTime, ZTDRegistrationId, IntuneProfileIdentifier, IntuneProfileAssignmentStatus, ZTDOemManufacturer, ZTDModelName, IsDeleted, DeviceDeletionStatus, DeviceId, DeviceDataStoreAzureADDeviceId, AADObjectId
```
- Please collect the Autopilot.cab for essentially any APv1 or APv2 case <br>

The Autopilot.cab file. As soon as the error/timeout is displayed, press Shift+F10 to bring up a Command Prompt window and run the following command:

Can only be run in an elevated CMD prompt, cannot be run from PowerShell:
```
type 'cmd.exe' then,
c:
cd\
md temp
MdmDiagnosticsTool.exe -area DeviceEnrollment;Autopilot;TPM;DeviceProvisioning -cab C:\temp\non-working-%COMPUTERNAME%.cab
```

***^^note** that starting with Windows 10 build 2004, you must write to a temp folder, not directly to the root of C:\

^^the last line is a single line that roughly looks like this: <br>
![image.png](/.attachments/autopilot/mdmdiagpic.gif)
<br>

**NOTE:**
If this is HYBRID-Join, then, additionally collect: <br>
From the client device, please grab: %windir%\debug\netsetup.log

From the Intune Connector (ODJ Connector) Server, grab the ODJ Connector Service Operational and Admin event log at the same time as you grab the client's netsetup.log file above. (They should be collected within 1 hour of the issue occurring)

![image.png](/.attachments/Autopilot/image-cad0292a-91b0-44ef-b659-213ddc782bb1.png =300x)

-   
:::template /.templates/admin-ui-escalations.md
:::
-----------
Page Author: @<CAEC069F-A7FC-6933-B98D-C346A7DB1BC0> 

Have feedback on this article? Please contact: IntuneAutopilotSMEs@microsoft.com