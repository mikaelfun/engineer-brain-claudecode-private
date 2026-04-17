---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Step by Step Guides/Renew the Enterprise Online Subordinate CA Certificate (Existing Key pair)"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Step%20by%20Step%20Guides/Renew%20the%20Enterprise%20Online%20Subordinate%20CA%20Certificate%20%28Existing%20Key%20pair%29"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/979082&Instance=979082&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/979082&Instance=979082&Feedback=2)

___
<div id='cssfeedback-end'></div>

[[_TOC_]]

**Author:** Jim Tierney (jtierney)

**Support topic:** Routing Windows V3\Certificates and Public Key Infrastructure\Active Directory Certificate Services (ADCS)

# Summary

The subordinate Certification Authority (CA) certificate will be renewed with an existing key pair. This means the renewed certificate Subject Key Identifier (SKI) extension remains the same as the previous certificate. Certificates issued before renewal contain an Authority Key Identifier (AKI) extension value that points to (matches) the SKI value of the certificate issuer.

As a result, all previously issued certificates will chain up to the new CA certificate. Once the renewed certificate (existing/same key) is available within a client Trusted Root Store, you can remove the previous certificate before it expires, but this is not necessary.

# Pre-flight check

On the CA where you are renewing the certificate, run `PKIVIEW.msc` and validate the current health of the Public Key Infrastructure (PKI) environment.

This should be done as a part of any case involving PKI and Certificate Services technologies.

Help the customer to address and correct any Certificate Distribution Point (CDP) / Authority Information Access (AIA) configuration errors prior to renewing the Enterprise Online Subordinate Issuing CA Certificate.

Keep in mind that after the renewal is completed, a new Certificate Revocation List (CRL) file will be published by the renewed CA. This should also be verified using `PKIVIEW.msc`.

On the CA where you are renewing the certificate, check for the existence of a `CAPolicy.inf` file. This file is located in the **%Systemroot% (Windows)** folder on the server with the CA role installed. Any settings contained in this file will be used when the CA certificate is renewed, and some customers may not be aware of its existence.

# Renewing the subordinate CA certificate

The following screenshots illustrate the Subordinate CA renewal process with an existing key pair:

:memo: **Note:** As we are updating attributes and objects in the configuration partition in Active Directory (AD), you should be logged on to the Subordinate Online Enterprise CA as an Enterprise Administrator.

![Capture of Right-click in the Subordinate CA console and click All tasks > Renew CA Certificate](/.attachments/Picture01-691deb4b-6b95-48a1-855a-7264c900c841.png)

Right-click the Subordinate CA and click **All tasks > Renew CA Certificate** as shown above.

![GUI Notification Certificate services must be stopped before certificate renewal, click Yes](/.attachments/Picture02-1d35157e-20fe-4140-938a-dd9771ae0c33.png)

Certificate services must be stopped before certificate renewal. Click **Yes**.

![GUI capture of Key Pair option for CA certificate renewal (Select No to use the existing public / private key pair).](/.attachments/Picture03-51fd40c3-52dc-4b0e-be55-4bff3573d12f.png)

Select **No** to use the existing public/private key pair. There is nothing wrong or incorrect if you renew with the existing key pair (unless the keys are compromised) or the existing CRLs are extremely large. **It is an administrative decision that must be made by the customer**.

![GUI prompt to select an online CA to send the request.](/.attachments/Picture04-36065f56-038a-4ca7-899c-2c002f411e7a.png)

You will be prompted to select an online CA to send the request. If the Parent CA (Root CA) is offline, the request will be saved to the path specified in the CA Certificate Request dialog and then must be copied to the Root CA and submitted for issuance.

Locate the subordinate CA certificate request saved in the root of the System drive as indicated in the CA Certificate Request above, and copy it to the file system of the Root CA.

On the Root CA, start the Certification Authority snap-in. In the CA snap-in, right-click on the CA name, select **All Tasks**, and then select **Submit a new request**.

![Root CA Console GUI to select "Submit new request"](/.attachments/Picture05-165a4e5c-d428-4868-907d-68b8eb65ddbf.png)

When prompted, navigate to the Subordinate CA certificate request file that was copied to the file system previously, and click Open. The request will then be submitted to the Root CA and placed in the **Pending Requests** folder.

![Root CA GUI of pending request](/.attachments/Picture06-605b3374-58a9-4980-b375-4e3c07b21426.png)

Right-click on the pending request, select **All Tasks**, and then select **Issue**.

![Root CA GUI of Issued Certificates](/.attachments/Picture07-aafefa0f-a508-492d-8c9b-6be7c91700d1.png)

The CA issues the certificate and places it in the **Issued Certificates** folder. Right-click on the issued certificate, select **All Tasks**, and then select **Export Binary Data**.

![Root CA GUI of Issued Certificate (Select the CA In the drop-down list, select Binary Certificate, then select Save binary data to a file.)](/.attachments/Picture08-abb10e0d-45b3-4593-97ff-ec09f34a0017.png)

In the drop-down list, select **Binary Certificate**, then select **Save binary data to a file**. Click **Ok**.

![GUI prompt to save the file as <CA Name.cer>.](/.attachments/Picture09-3c2de892-aafe-4223-af89-6399d3d476c0.png)

Save the file as <CA Name.cer>. For example, for the purposes of this guide the issued certificate is saved as **FourthCoffee Issuing CA 01.cer**.

Copy the Subordinate CA certificate .CER file back to the Subordinate issuing CA server.

On the issuing CA, launch the **Certification Authority** snap-in.

In the CA snap-in, right-click on the CA name, select **All Tasks**, and then select **Install CA Certificate**.

![Sub CA GUI showing "All Tasks", then "Install CA Certificate" option](/.attachments/Picture010-6b4b8752-7b10-4365-8be1-2216f23b7094.png)

Navigate to the Subordinate CA certificate and click **Open**. You should not see a warning that the subordinate CA chains up to an untrusted Root CA. If this does happen, verify the following:

a. The offline Root CA certificate has been published to Active Directory.

b. The local domain controllers have replicated.

c. Group Policy has refreshed. You can force group policy to refresh by running `gpupdate /force`.

Start Certificate Services. You are done. Subordinate CA certificate renewal has been completed successfully.

# References

[Root CA certificate renewal](https://social.technet.microsoft.com/wiki/contents/articles/2016.root-ca-certificate-renewal.aspx)

[Certification Authority](https://aka.ms/CertificationAuthority)