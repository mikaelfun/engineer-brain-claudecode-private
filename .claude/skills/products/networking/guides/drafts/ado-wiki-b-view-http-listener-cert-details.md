---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure Application Gateway/How To/How to view HTTP Listener cert details from Public Certificate Data"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=%2FAzure%20Application%20Gateway%2FHow%20To%2FHow%20to%20view%20HTTP%20Listener%20cert%20details%20from%20Public%20Certificate%20Data"
importDate: "2026-04-06"
type: troubleshooting-guide
---

# How to view HTTP Listener cert details from Public Certificate Data

[[_TOC_]]

## Description

How to view certificate details from Application Gateway SSL Listener using the Public Certificate Data field available in Azure Support Center.

## Issue Definition

During troubleshooting, the Public Certificate Data field (BASE64) can be obtained from Azure Support Center. This allows SEs to inspect certificate details (subject, issuer, validity dates, etc.) without accessing the customer's environment directly.

Example from ASC:
```
Public Certificate Data: MIIPmwYJKoZIhvcNAQcCoIIPjDCCD4gCAQExADALBgkqhkiG9w0BBwGggg9wMIIG9zCCBd+gAwIBAgIQD3lmvLnoJ...
```

## Steps to Convert Certificate (BASE64)

1. **Save** the Public Cert Data (from "MII..." onwards) into a file with extension `.p7b`
2. **Open in Windows Explorer** — double-click the `.p7b` file to open it with Windows Certificate Manager

## Alternative: CertUtil.exe on Windows

Use `CertUtil.exe -dump` to view the BASE64 file directly from PowerShell/Command Prompt:

```powershell
certutil -dump cert.p7b
```

**Example output:**
```
PKCS7 Message:
  CMSG_SIGNED(2)
  ...
Certificates:
X509 Certificate:
Version: 3
Serial Number: 06d8d904d5584346f68a2fa754227ec4
NotBefore: 2021-04-14 8:00 AM
NotAfter: 2031-04-14 7:59 AM
Subject:
    CN=DigiCert TLS RSA SHA256 2020 CA1
    O=DigiCert Inc
    C=US
...
CertUtil: -dump command completed successfully.
```

This allows verification of certificate subject, issuer, validity period, and public key algorithm without needing direct environment access.
