---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/Azure AD Authentication General/Microsoft Entra Certificate Authorities"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FAzure%20AD%20Authentication%20General%2FMicrosoft%20Entra%20Certificate%20Authorities"
importDate: "2026-04-07"
type: troubleshooting-guide
---

---
Tags:
- cw.AAD
- cw.AAD-Authentication
- cw.AzureAD
- cw.Azure-AD
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   

[**Tags**](/Tags): [AAD](/Tags/AAD) [AAD-Authentication](/Tags/AAD%2DAuthentication) [AzureAD](/Tags/AzureAD) [Azure-AD](/Tags/Azure%2DAD)     

[[_TOC_]]

# Microsoft Entra Certificate Authorities 

Microsoft is implementing new certificate authorities for server certificates for the login.microsoftonline.com domain to enhance the security and improve the resiliency of this domain by having more than one certificate provider and certificate chain available for this domain in the event one would become unavailable.  The new certificate authorities are Microsoft Azure CA's and have their own root and subordinate CA servers and are cross certified with the existing DigiCert Certificates already in use for this domain.   The Azure Root and Subordinate certificate authorities have been propagated through the standard root and subordinate certificate propagation process as defined by each supported operating system and application. 

Microsoft will maintain a few IPs that are exclusively serving the existing CA (DigiCert). This is to ensure that any customer that breaks due to the new CA, can directly connect to those IPs and restore connectivity. This can be done by updating the DNS resolutions on their end for the login.microsoftonline.com domain. These are the mitigation IPs based on geo where client is located:

 | <br><br> | EU<br> | APAC<br> | NA<br> |
| --- | --- | --- | --- |
| IP<br> | 20.190.177.19<br> | 20.190.141.32<br> | 20.190.152.19<br> |

To achieve this, clients need to update the hosts file and hardcode the IP address for login.microsoftonline.com domain. This can be a quicker mitigation, then they still need to ensure they trust the new CA's so they don't break again.

Specific information about the Azure Certificate Authorities can be found here:

[Azure Certificate Authority details | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-ca-details?tabs=root-and-subordinate-cas-list#certificate-authority-details)

#### **Known Issues**

**Issue 1: Propagation of these new root and subordinate Certificate Authorities**

While every effort has been made to ensure propagation and compatibility with the new Azure Certificate Authorities there still may be situations that arise where manual steps may need to be take by an organization to update their systems to work with these new Certificate Authorities

- Update to a supported version of the required OS.

  The CAs used by Azure are compatible with the following OS versions:

  |     Windows     |   Firefox   |  iOS   |         macOS          |     Android      |        Java         |
  | :-------------: | :---------: | :----: | :--------------------: | :--------------: | :-----------------: |
  | Windows XP SP3+ | Firefox 32+ | iOS 7+ | OS X Mavericks (10.9)+ | Android SDK 5.x+ | Java JRE 1.8.0_101+ |

- If you can't change the OS version, you may need to manually update the trusted root store to include the new CAs. Refer to documentation provided by the manufacturer.

- If your scenario includes disabling the trusted root store or running the Windows client in disconnected environments, ensure that all root CAs are included in the Trusted Root CA store and all sub CAs listed in this article are included in the Intermediate CA store.

- Many distributions of **Linux** require you to add CAs to /etc/ssl/certs. Refer to the distribution’s documentation.

- Ensure that the **Java** key store contains the CAs listed in this article. For more information, see the [Java applications](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-ca-details?tabs=root-and-subordinate-cas-list#java-applications) section of this article.

**Issue 2: Certificate Pinning** 

- If your application explicitly specifies a list of acceptable CAs, check to see if you need to update the pinned certificates when CAs change or expire. For a smooth transition of this change it will be essential for the new Microsoft Certificate Authorities to be added to the trusted allow / accepted list along side of the existing DigiCert Certificates. Customers using Azure and Entra services who only trust DigiCert certificates should update their settings to accommodate this change, ensuring uninterrupted service and secure connections to Microsoft Cloud Services. 
  - For more information, see [Certificate pinning](https://learn.microsoft.com/en-us/azure/security/fundamentals/certificate-pinning).
- As there's no single web standard for how certificate pinning is performed, we can't offer direct guidance in detecting its usage. While we don't recommend against certificate pinning, customers should be aware of the limitations this practice creates if they choose to use it.
  - Ensure that the pinned certificates can be updated on short notice.
  - Industry requirements, such as the [CA/Browser Forum’s Baseline Requirements for the Issuance and Management of Publicly-Trusted Certificates](https://cabforum.org/about-the-baseline-requirements/) require rotating and revoking certificates in as little as 24 hours in certain situations.

# Public Docs

- [Azure Certificate Authority details | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/azure-ca-details?tabs=root-and-subordinate-cas-list)
- [Certificate pinning - Certificate pinning and Azure services | Microsoft Learn](https://learn.microsoft.com/en-us/azure/security/fundamentals/certificate-pinning)

# ICM Path

- **Owning services**: AAD Gateway/Gateway
- **Owning team**: AAD Gateway

