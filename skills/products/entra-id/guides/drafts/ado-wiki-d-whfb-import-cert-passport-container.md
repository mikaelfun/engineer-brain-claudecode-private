---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/Certificates related topics/How to import a certificate into a Windows Hello for Business (passport) Container with certutil?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Tips%20%26%20Hints%2FCertificates%20related%20topics%2FHow%20to%20import%20a%20certificate%20into%20a%20Windows%20Hello%20for%20Business%20%28passport%29%20Container%20with%20certutil%3F"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/428663&Instance=428663&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/428663&Instance=428663&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**   
This document provides detailed instructions on how to list, import, and delete certificates stored in the Microsoft Passport container. Follow the steps provided to manage certificates effectively.

[[_TOC_]]

# How to list and find the certificates stored in the Passport container
You can list and find the certificates stored in the Passport container using the following command:

```plaintext
certutil -v -user -key -csp NGC
```

Output:

**Microsoft Passport Key Storage Provider**:

```plaintext
S-1-5-21-498230862-2924710955-1205587603-1120/bdd0e5f0-0827-456d-bb0f-531d9fa58e6d/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/whfbhkt1@whfbHKT.contoso.com
Name: S-1-5-21-498230862-2924710955-1205587603-1120/bdd0e5f0-0827-456d-bb0f-531d9fa58e6d/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/whfbhkt1@whfbHKT.contoso.com
Serial Number: 3c91e05dbc883f924b8aaca2d5a4f16e
Issuer: CN=S-1-5-21-498230862-2924710955-1205587603-1120/bdd0e5f0-0827-456d-bb0f-531d9fa58e6d/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/whfbhkt1@whfbHKT.contoso.com
NotBefore: 2/26/2020 9:58 AM
NotAfter: 2/26/2050 10:08 AM
Subject: CN=S-1-5-21-498230862-2924710955-1205587603-1120/bdd0e5f0-0827-456d-bb0f-531d9fa58e6d/login.windows.net/39b35923-4cbe-4adb-8ab2-24c70b83f77c/whfbhkt1@whfbHKT.contoso.com
Signature matches Public Key
Root Certificate: Subject matches Issuer
Cert Hash(sha1): c5e8a8bdb71dca6594a4abdec4199105caef3518
Private key is NOT exportable
CertUtil: -key command completed successfully.
```

---

# How to import certificates

To import a certificate, use the following command:

```plaintext
certreq -user -p Password -importpfx filename.pfx "Microsoft Passport Key Storage Provider"
```
The parameter `-p` is the password of the PFX file.

![Description of the picture](/.attachments/image-d889cc4b-5b40-4a3a-a2ca-78ef76226d7d.png)

---

# How to delete the key

1. Check the certificate that has the NGC (Next Generation Credentials)/Passport provider using:

    ```plaintext
    certutil -v -user -store my
    ```

    Output:

    ```plaintext
    CERT_KEY_PROV_INFO_PROP_ID(2):
        Key Container = //THIRD_PARTY//-user-SerialNumber
        Provider = Microsoft Passport Key Storage Provider
        ProviderType = 0
    ```

2. Find the name using:

    ```plaintext
    Certutil -v -user -key -csp NGC
    ```

    Output:

    ```plaintext
    Name: S-1-5-21-xxxx/tenantid/THIRD_PARTY//-user-SerialNumber
    ```

3. Delete the key of the corresponding certificate using:

    ```plaintext
    certutil -delkey -csp "Microsoft Passport Key Storage Provider" "S-1-5-21-xxxx/tenantid/THIRD_PARTY//-user-SerialNumber"
    ```