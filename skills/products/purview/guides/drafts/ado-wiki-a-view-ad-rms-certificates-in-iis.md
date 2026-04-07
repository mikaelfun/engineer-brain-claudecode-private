---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/How To: AD RMS/How To: View AD RMS Certificates in IIS"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FHow%20To%3A%20AD%20RMS%2FHow%20To%3A%20View%20AD%20RMS%20Certificates%20in%20IIS"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction
AD RMS servers may use HTTPS for the service URLs. This requires an SSL certificate in IIS.

The purpose for this article is to find and view the AD RMS certificate in IIS.

# AD RMS Console
Open AD RMS console and make sure the AD RMS service is configured to use the **HTTPS** URLs. If it is using only **HTTP**, then there is no need to configure SSL certificate in IIS.

# IIS

Use the Internet Information Services (IIS) MMC to view the certificate bound to IIS for AD RMS service. 

## Find the certificate
1. Open the IIS MMC.
2. Navigate to the Default Web Site.
3. On the right hand side select `Bindings...`
4. In the `Site Bindings` dialog, select `https` and choose `Edit...`
5. In the `Edit Site Binding` window click `View...` on the SSL certificate already bound to the site.

The certificate dialog opens.

## View the certificate

- The `General` tab shows the:
    - Name (_Issued to_),
    - Validity range, and
    - Private key status of the certificate.
- The `Details` tab displays other information.
- The `Certification Path` presents the:
    - Certificate hierarchy, and 
    - Certificate status.

## Verify the certificate
 - On the `General` tab check the certificate is issued to the server name (or RMS cluster name), is valid per the date, and has the private key.
 - On the `Certification Path` tab ensure we trust the issuing certification authorities (CAs) and the certificate state is OK.
