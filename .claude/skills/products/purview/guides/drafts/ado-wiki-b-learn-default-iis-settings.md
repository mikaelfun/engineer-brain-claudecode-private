---
source: ado-wiki
sourceRef: "ASIM-Security/Compliance/Information Protection:/AD RMS/Learn: AD RMS/Learn - Default IIS Settings"
sourceUrl: "https://dev.azure.com/ASIM-Security/Compliance/_wiki/wikis/Information%20Protection?pagePath=%2FAD%20RMS%2FLearn%3A%20AD%20RMS%2FLearn%20-%20Default%20IIS%20Settings"
importDate: "2026-04-06"
type: troubleshooting-guide
---

[[_TOC_]]

# Introduction

When it comes to IIS and AD RMS, in a perfect world one would use the role install & configuration process to configure IIS. After installation one may bind a certificate in IIS for SSL. Other than that, _no one would ever change anything in IIS_ on the AD RMS server. And please, do not change the authentication settings.

However, it is not a perfect world. And customers like to break things. This document highlights some of the common default IIS settings on working AD RMS server.

Included are some NTFS permissions.

# IIS

## SSL Settings

In IIS, under _Default Web Site_, select `SSL Settings`.

The default settings are as follows.
 - Require SSL: **_Unchecked_**
 - Client Certificates: **_Ignore_**

## Authentication

The authentication settings start at the _Default Web Site_ and through the child objects under that. 
 - Default Web Site has only Anonymous Authentication configured.
 - All other pipelines, including _wmcs, admin, certification, decommission, groupexpansion, and licensing, only have Windows Authentication enabled.

### Default Web Site
 - Only `Anonymous Authentication` is enabled.

### _wmcs
 - Only `Windows Authentication` is enabled. 

### Certification
 - Only `Windows Authentication` is enabled.

### Licensing
 - Only `Windows Authentication` is enabled.

# File System

Occasionally, with AD RMS, one may need to modify permissions on the ServerCertification.asmx file. This was done when integrating Exchange or SharePoint with AD RMS. 

## Default file locations
 - AD RMS IIS files: `C:\inetpub\wwwroot\_wmcs`
 - ServerCertification.asmx: `C:\inetpub\wwwroot\_wmcs\certification\ServerCertification.asmx`
 - License.asmx: `C:\inetpub\wwwroot\_wmcs\licensing\License.asmx`
