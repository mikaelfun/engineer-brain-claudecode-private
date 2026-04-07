---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/PKI - AD Certificate Services/Step by Step Guides/Offline ROOT CA certificate renewal using existing key"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/PKI%20-%20AD%20Certificate%20Services/Step%20by%20Step%20Guides/Offline%20ROOT%20CA%20certificate%20renewal%20using%20existing%20key"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/570949&Instance=570949&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/570949&Instance=570949&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide provides step-by-step instructions for renewing a standalone or enterprise Root Certificate Authority (CA) certificate using an existing key pair. It includes visual aids and detailed explanations to ensure clarity and accuracy.

[[_TOC_]]

# Renew standalone / enterprise root CA certificate (existing key pair)

The Root CA certificate will be renewed with an existing key pair. This means the renewed certificate Subject Key Identifier (SKI) extension remains the same as the previous certificate. Certificates issued before renewal contain an Authority Key Identifier (AKI) extension value which matches the SKI value of the certificate issuer.

As a result, all previously issued certificates will chain up to the new CA certificate. Once the renewed certificate (existing/same key) is available within a client trusted root store, you can remove the previous certificate before it expires, **but it is not necessary**.

**The following screenshots below illustrate the Root CA renewal process with an existing key pair:**

![Root CA renewal process step 1]( /.attachments/image-7e25216f-fd17-4824-b48b-ef35995d2f1e.png)

Right-click Root CA and click **All tasks\Renew CA Certificate** as shown above.

![Stopping certificate services GUI notification]( /.attachments/image-5fbbc685-494d-479c-ad4b-4fcdde20ebd2.png)

Certificate services must be stopped before certificate renewal, click **Yes**.

![prompt for selecting Key pair option for renewal ]( /.attachments/image-ffb2cbe4-01f0-4f76-9443-3d5eb6db31f6.png)

Accept the default value of No and click **OK**.

![CA Console GUI showing certificate is renewed]( /.attachments/image-6828cde1-76c6-4445-89ab-fb1ac5b4499a.png)

Certificate got renewed.

![Capture of the 2 certificates side by side showing the Extended validity of the new certificate]( /.attachments/image-77551ba6-6787-4d9c-8919-7652bf1309e1.png)

When comparing before and after, we see that the Root CA certificate validity is extended for the next 10 years until 2028. Also, the valid from date is the same for both certificates.

# CA index

![Windows Explorer capture showing CA index (1) for the new CA certificate]( /.attachments/image-80986179-7fef-4fd7-bfcd-89b7525c3d2c.png)

We can see that the new Certificate index is increased by 1 as shown above. This is useful to keep the certificate's versioning track. **SRCA_RootCA.crt** (Certificate **0**) is the previous certificate and **SRCA_RootCA(1).crt** (Certificate **1**) is the new certificate. When you renew a CA certificate with an existing key pair, the renewed certificate will be generated with the existing certificate public and private key, and the existing Certificate Revocation List (CRL) will be continued (RootCA.crl).

# Subject Key Identifier (SKI)

Since the certificate is renewed with an existing key pair, the renewed certificate Subject Key Identifier (SKI) value remains the same as the previous certificate, as shown below.

Ultimately, the renewal process increases the existing certificate validity period in terms of a renewed certificate. Certificates issued **before and after** renewal would validate and chain up with the new certificate.

![SKI value comparison for certificate 0]( /.attachments/image-c8eda0fa-3d8d-4214-b93f-ccd4ee1e55c1.png)

![SKI value comparison for certificate 1]( /.attachments/image-61a13fe5-a286-4da4-9e34-631e927f8242.png)

# CA version

![CA version value comparison for certificate 0 showing value 0.0]( /.attachments/image-a6d31aac-1022-42d5-bf74-51dc5b0c1d9c.png)

The first certificate, which was created during CA installation, will have CA version 0.0 as shown above.

![CA version value comparison for certificate 1 showing value 1.0]( /.attachments/image-6f7fd704-99b1-4824-8606-f482677673ae.png)

After the renewal with the existing key pair, the CA version number increased by 1.0 as shown above.

Here, 1 represents the CA certificate index and 0 represents the certificate key index. Since we used an existing key, the key index value did not change. Every time you renew a CA certificate (regardless of existing or new key pair), the CA certificate index would be increased by 1 as shown below.

CA version keeps track of certificate revisions. The CA Version extension allows building correct chains in the case when a particular CA has more than one certificate because of renewal.

1. Copy the .CRT and .CRL files to a computer with access to Active Directory.
2. Log on as a member of the Enterprise Admins group.
3. Run the following commands:

```shell
certutil -f -dspublish <.CRT file> RootCA
certutil -dspublish <.CRL file>
```

Your output should look like this:

![Command output of certutil -dspublish]( /.attachments/image-5bb4b9de-db11-48bf-9f07-307754a0a88e.png)

# References

[Root CA certificate renewal](https://social.technet.microsoft.com/wiki/contents/articles/2016.root-ca-certificate-renewal.aspx)

[Certification](https://social.technet.microsoft.com/wiki/contents/articles/2016.root-ca-certificate-renewal.aspx)