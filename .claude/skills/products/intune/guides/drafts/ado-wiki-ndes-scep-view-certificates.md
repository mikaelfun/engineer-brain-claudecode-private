---
source: ado-wiki
sourceRef: "Supportability/Intune/Intune:/Device Config Certificates Email VPN Wifi/NDES and SCEP/View Certificates"
sourceUrl: "https://dev.azure.com/Supportability/Intune/_wiki/wikis/Intune?pagePath=/Device%20Config%20Certificates%20Email%20VPN%20Wifi/NDES%20and%20SCEP/View%20Certificates"
importDate: "2026-04-20"
type: guide-draft
---

# View Certificates

_Applies to_

<div style="text-align: left; display: inline-block; display: flex; flex-wrap: wrap; justify-content: space-between;">
<span style="flex: 1 1 auto;background-color: rgb(000, 120, 215); color: white; border: 1.5px solid black;"><b>&nbsp;Intune&nbsp;</b></span>
<span style="flex: 1 1 auto;background-color: rgb(0,139,139); color: white; border: 1.5px solid black;"><b>&nbsp;Directory Service&nbsp;</b></span>
<span style="flex: 1 1 auto;background-color: rgb(0,191,255); color: white; border: 1.5px solid black;"><b>&nbsp;SCEP&nbsp;</b></span>
<span style="flex: 1 1 auto;background-color: rgb(139, 0, 0); color: white; border: 1.5px solid black;"><b>&nbsp;PKCS (PFX)&nbsp;</b></span>

</div><br>

Author: @<62124E61-CC0E-4D2A-82B8-1F12D3A46D08>, @<65A43B31-1210-6D44-B708-AAAF766C2FBC> 

[[_TOC_]]

In this article we will show how to look at the Trusted and SCEP certificates for all platforms, within each operating system.  

>:bulb: **TIP**: In all operating systems, except Windows, the Thumbprint will be seen under the ***SHA-1*** value.  
<br></br>

# 1. Android Personally Owned Work profile (BYOD)  

To view the troubleshooting article referencing this data, go to: [**1. Android Personally Owned Work profile (BYOD)** :link:](../.././Device-Config-Certificates-Email-VPN-Wifi/NDES-and-SCEP/Troubleshooting/Android.md) 

## Trusted Certificates view in Settings:

- In Android (may vary depending on the OEM) go to Settings and in the search bar type "Certificates".  
- Tap "View security certificates".  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidWcertsearch.png)

- Tap again "View security certificates" -> User -> Under "Work" you will see the trusted root certificates pushed by Intune.  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/doidWroots.png)

- Click on the certificate to view its information. Keywords to look at: **Issued to**, **Validity**, **SHA-1** 

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidrootd.png)
    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidissuingd.png)  

## Trusted Certificates view in X-509 app:

- To view the SCEP certificate and its complete chain, you will need to use a third party application such as "[**X509 Certificate Viewer Tool**](https://internal.evergreen.microsoft.com/en-us/topic/8cf2ba71-efb4-35f7-7a06-5e62a8e5d791)", to validate that the SCEP certificate is present.  

    Since this is an Enterprise enrollment, you will need to push the application through Intune via the Managed Google Play Store. If the user opens their regular store, it will only look within the personal profile, not the work profile, and will still not be able to see the certificates.

    Make sure the app is installed within the Work profile. If so, it will have the badge icon on the lower right corner. You can see in the following screenshots the badge icon even when the app is open.

- Open the app and select the SCEP certificate (more on that below). Once you are on the certificate, you will be able to see the entire chain on top. Select the needed Trusted certificate.  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwrootx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwrootx2.png)  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwissx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwissx2.png)  

## SCEP Certificate view in X-509 app:

- Open the app and you will see a few certificates. The SCEP certificate delivered through Intune profile will show as User***Thumbprint***.  In this example, will be *UserF1EA2F39EA7ACEBA5E6DD8BCFF4DEB1F2B5001B6*. It will always have the word 'User', not the actual UserName.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwscepx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwscepx2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwscepx3.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidwscepx4.png)  

# 2. Android Device Owner profiles (DO)  

To view the troubleshooting article referencing this data, go to: [**2. Android Device Owner profiles (DO)** :link:](https://supportability.visualstudio.com/Intune/_wiki/wikis/Intune/1668236/Android?anchor=2.-android-device-owner-profiles-(do))  

## Trusted Certificates view in Settings:

- In Android (may vary depending on the OEM) go to Settings and in the search bar type "Certificates".  
- Tap "View security certificates".  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidWcertsearch.png)

- Tap again "View security certificates" -> User.  
  Here you will see the trusted root certificates pushed by Intune.  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidDOroots.png)

- Click on the certificate to view its information. Keywords to look at: **Issued to**, **Validity**, **SHA-1** 

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidrootd.png)
    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidissuingd.png)  

## Trusted Certificates view in X-509 app:

- To view the SCEP certificate and its complete chain, you will need to use a third party application such as "[**X509 Certificate Viewer Tool**](https://internal.evergreen.microsoft.com/en-us/topic/8cf2ba71-efb4-35f7-7a06-5e62a8e5d791)", to validate that the SCEP certificate is present.  

    Since this is an Enterprise enrollment, you will need to push the application through Intune via the Managed Google Play Store.  
    
- Open the app and select the SCEP certificate (more on that below). Once you are on the certificate, you will be able to see the entire chain on top. Select the needed Trusted certificate.  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddorootx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddorootx2.png)  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddoissx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddoissx2.png)  

## SCEP Certificates view Settings:

- You can view if the certificate is installed in Settings, but you will only be able to view its name. There are no additional details in this view. 

- Go to Settings and in the search bar type "Certificates".
- Tap "User certificates".

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidDOuc.png)

- Here you will see several user certificates. The one we want to see will be called "User *policyID*.  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidDOuc2.png)

- Tapping the certificate will not show additional details

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droidDOucd.png)
  


## SCEP Certificates view in X-509 app:

- To view the SCEP certificate details and its complete chain, you will need to use a third party application such as "[**X509 Certificate Viewer Tool**](https://internal.evergreen.microsoft.com/en-us/topic/8cf2ba71-efb4-35f7-7a06-5e62a8e5d791)", to validate that the SCEP certificate is present.  

    Since this is an Enterprise enrollment, you will need to push the application through Intune via the Managed Google Play Store.  

- Open the app and you will see a few certificates. The SCEP certificate delivered through Intune profile will show as User ***PolicyID***.  In this example, will be *User 113122ab-xxxx-xxxx-xxxx-4cc5e955becd*. It will always have the word 'User', not the actual UserName.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddoscepx1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddoscepx2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/droiddoscepx3.png)    

# 3. iOS Profiles  

To view the troubleshooting article referencing this data, go to: [**1. iOS Profiles** :link:](../.././Device-Config-Certificates-Email-VPN-Wifi/NDES-and-SCEP/Troubleshooting/Apple.md)  

## Trusted Certificates view in Management Profile:

- Go to Settings > General > VPN & Device Management > Management Profile.
- Here you will see under Contains, how many certificates are installed. This includes all MDM certificates as well.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/ioscmp.png)

- Tap on "More Details" and scroll down to Certificates. You will see the trusted root certificates pushed by Intune. To identify them, they will be named by their respective CAs, and will be issued by them. Ignore all the ones issued by Microsoft.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosroots.png) 

- Click on the Root certificate to view its details. Once opened, you will see the main Root certificate title as '*Credential Profile - thumbprint*' and the Intermediate profiles will show as '*PKCS1 Credential Profile - thumbprint*'. Keywords** to look at: **Subject Name**, **Validity Period**, **SHA-1**  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosroot1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosroot2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosroot3.png) 

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosiss1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosiss2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosiss3.png) 

## SCEP Certificates view in Management Profile:

- Go to Settings > General > VPN & Device Management > Management Profile > More Details > scroll down to '**SCEP DEVICE IDENTITY CERTIFICATES**' all the installed authentication certs. This includes all MDM certificates as well, so be mindful to look for the ones sent by the Intune policy only.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep.png)

    You can see here the "<font color=Blue>'**policyID**"</font> as per the LogicalName, the "<font color="DAA520">'**Issuing CA**"</font> where you want to look for the local CA that issued the SCEP certs, ignoring all the Microsoft Intune or MS-Organization-Access certificates.

- Click on the certificate to view its details. Keywords** to look at: **Subject Name**, **Validity Period**, **Subject Alternative Name**, **SHA-1**  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep3.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep4.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/iosscep5.png)  
    
:bulb: **Note**: In iOS devices you might see duplicate certifcates for SCEP. This platform will install one certificate per dependent profile sent. For reference, see the NOTE at the end of this article: [*Create and assign SCEP certificate profiles in Intune* :link:](https://learn.microsoft.com/en-us/mem/intune/protect/certificates-profile-scep#assign-the-certificate-profile)  


# 4. macOS Profiles  

To view the troubleshooting article referencing this data, go to: [**2. macOS Profiles** :link:](../.././Device-Config-Certificates-Email-VPN-Wifi/NDES-and-SCEP/Troubleshooting/Apple.md)  

## Trusted Certificates view in Management Profile:  

- In macOS 14 and below: Go to Settings > Privacy & Security > Profiles  
- Starting in macOS 15: Go to Settings > General > Device Management  
- Here you will see them under Device (Managed):  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macmp.png)

    Main Root will show as "**Credential Profile - *thumbprint***"  
    Intermediates will show as "**PKCS1 Credential Profile - *thumbprint***"  
    SCEP will show as "**SCEP Profile - ModelName=AC_*accountId*/LogicalName_*policyId***"

- Click on the Root certificate to view some of the profile detail. Here you will not see the certificate's detailed information, just some basic info. Keywords to look at: **Certificate**, **Expires**

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macrootmp.png)  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macissmp.png)  


## Trusted Certificates view in Keychain:  

- Open Keychain Access > System > Certificates. Here you will see the certificates by their Subject name.

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/mack.png)

- Click on the Root certificate to view its details. Once opened, you will see the all the Root certificate details.  
  For the Issuing certificate, you will also see the CRL Distribution Point.
Keywords** to look at: **Subject Name**, **Not Valid Before/After**, **SHA-1**  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macrootk.png)  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macissk1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macissk2.png)  

## SCEP Certificates view in Management Profile:  

- Go to Settings > Privacy & Security > Profiles
- Here you will see them under Device (Managed). Click on the SCEP Profile certificate to view some of the profile detail. Here you will not see the certificate's detailed information, just some basic info. Keywords to look at: **Certificate**, **Expires**, **Server** (*this will show the NDES URL where this cert was requested from - should match the one in the Intune profile*)

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepmp.png)  

## SCEP Certificates view in Keychain:  

- Open Keychain Access > System > Certificates. Here you will see the certificates by their Subject name.

- Click on the SCEP certificate to view its details. Once opened, you will see the all the certificate details.  
  Keywords** to look at: **Subject Name**, **Not Valid Before/After**, **Subject Alternate Name**, **CRL Distribution Points**, **SHA-1**  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepk1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepk2.png)  

## SCEP Certificates Certification Path:  

- In order to see the entire chain of the SCEP certificate in macOS, you can do so by:
 1. Open the Keychain and select the SCEP certificate (do not click on it, just select it).  
 2. Click on Keychain Access menu on top left corner > Certificate Assistant > Evaluate "*certificate name*"
 3. Certificate Assistant window will open. Leave on **Generic** > Continue
 4. "Specify Certificates To Be Viewed and Evaluated" > select the certificate > Done  

    View of chain will show, where you can see the Certificate Path (root and intermediates for this cert).  

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepchain1.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepchain2.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepchain3.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/macscepchain4.png)  

# 5. Windows Profiles  

To view the troubleshooting article referencing this data, go to: [**Windows Profiles** :link:](../.././Device-Config-Certificates-Email-VPN-Wifi/NDES-and-SCEP/Troubleshooting/Windows.md)  

## Trusted Certificates view Microsoft Management Console (mmc):  

- Go to Windows Start Menu and search for "mmc"
- Once mmc is open go to File > Add/Remove Snap-in > Certificates > Add > Computer Account > Finish > Ok
- Under the Console Root, expand Certificates (Local Computer) > Trusted Root Certification Authorities > Certificates. This will contain all trusted certificates that have been installed by any site or app. Scroll down to find the certificate issued by the CA.
  
  Keywords** to look at: **Issued to**, **Valid From**, **Thumbprint**, **Certification Path**

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winroot.png)

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winrootg.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winroott.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winrootp.png)  
    
- For the Intermediate certificates, go to Certificates (Local Computer) > Intermediate Certification Authorities > Certificates

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winint.png)  
    
    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winissg.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winisst.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winissp.png)  

## SCEP Certificates view Microsoft Management Console (mmc):

- Open certs in Microsoft Management Console:
- Go to File > Add/Remove Snap-in > Certificates > Add
  - Here you will need to select the appropriate container depending on the Certificate Profile Type. If looking for a User certificate, then snap-in 'My User Account'. If looking for a Device certificate, then snap-n 'Computer Account'
- Finish > Ok
- Under the Console Root, expand either 'Certificates - Current User' (*for User certificates*) or 'Certificates (Local Computer)' (*for Device certificates*) > Personal > Certificates.  
This will contain all certificates that have been issued to this user or device.

    Keywords** to look at: **Issued to**, **Valid From**, **Subject**, **Subject Alternative Name**,  **Thumbprint**, **Certification Path**

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winscep.png)

    ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winscepg.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winsceps.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winscepsan.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winscept.png) ![](../../.attachments/Dev-Config-Certs/Troubleshooting/winscepp.png)  


------------
:thought_balloon:Have feedback on this workflow? Please contact: [Jesus Santaella](mailto:jesantae@microsoft.com)