---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Windows Hello and Modern Credential Providers/WHfB/WHFB: Tips & Hints/Certificates related topics/Issuing CA certificate in Ntauth:verifications"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FWindows%20Hello%20and%20Modern%20Credential%20Providers%2FWHfB%2FWHFB%3A%20Tips%20%26%20Hints%2FCertificates%20related%20topics%2FIssuing%20CA%20certificate%20in%20Ntauth%3Averifications"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/428659&Instance=428659&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/428659&Instance=428659&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
 This guide helps you verify and troubleshoot certificate issues by using certutil commands, checking for common errors, and ensuring proper certificate publication and replication.

1. **Export the certificate to a .cer file and run the following command:**

    ```plaintext
    Certutil -verify -enterprise [filename.cer] > output.txt
    ```

2. **Review `output.txt` for chaining errors and revocation errors.**  
    Ensure there are no errors. If errors are present, resolve them first.

3. **Check `output.txt` for a 0x800b0112 error.**  
    If you see this error, run the following command:

    ```plaintext
    CertUtil -enterprise -store NTAuth > NTAuthCA.txt
    ```

4. **Check if the issuing Certificate Authority (CA) certificate is in the store.**  
    If it is not, you likely have an Active Directory (AD) replication problem of the configuration partition because an enterprise CA root certificate is automatically added to the NTAuth store.

5. **Publish the certificate and force replication of the configuration partition.**  
    After replication is complete, on the client, type `certutil -pulse` and repeat the verify command.



Basic Public Key Infrastructure (PKI) requires the client to trust the enterprise root certificate and that the Certificate Revocation List (CRL) for the CA be published to a location where a non-domain joined client can read the CRL.

1. Does the client have the root certificate of the issuing CA?
1. Is the CRL published