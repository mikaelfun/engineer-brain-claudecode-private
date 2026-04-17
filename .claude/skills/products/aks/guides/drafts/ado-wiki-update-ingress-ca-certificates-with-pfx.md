---
source: ado-wiki
sourceRef: "Supportability/AzureContainers/Containers Wiki:/Azure Kubernetes Service Wiki/AKS/How Tos/Security and Identity/Update Ingress ca certificates with new .pfx file"
sourceUrl: "https://dev.azure.com/Supportability/AzureContainers/_wiki/wikis/Containers%20Wiki?pagePath=%2FAzure%20Kubernetes%20Service%20Wiki%2FAKS%2FHow%20Tos%2FSecurity%20and%20Identity%2FUpdate%20Ingress%20ca%20certificates%20with%20new%20.pfx%20file"
importDate: "2026-04-05"
type: troubleshooting-guide
---

# Update Ingress CA Certificates with New .pfx File

## Overview

When customer SSL/TLS certificates expire, they get the new/renewed certificates from certificate providers (Eg: digicert, comodo, acme) in `.pfx` format. If a customer has a .pfx file and wants to replace or renew their ingress certificates, they can follow the steps outlined below.

## How to Replace/Renew Ingress Certificates using a .pfx File

1. **Extract the `pfx` file into `.cert` and `.key` files.**

    `openssl pkcs12 -in C:\PathToThePFXfile\myPFXfileName.pfx -out certificate.txt -nodes`

2. **Copy the `.key` (private key) and `.crt` from the `certificate.txt` file.**

    Make sure the `.crt` file has the `leaf -> intermediate -> root` order if customer has intermediate SSL/TLS certificate.

   ```
   -----BEGIN CERTIFICATE-----
   (Your Primary SSL certificate: your_domain_name.crt)
   -----END CERTIFICATE-----
   -----BEGIN CERTIFICATE-----
   (Your Intermediate certificate: DigiCertCA.crt)
   -----END CERTIFICATE-----
   -----BEGIN CERTIFICATE-----
   (Your Root certificate: TrustedRoot.crt)
   -----END CERTIFICATE-----
   ```

3. **Create new files for the `.key` and `.crt.`**
    Name them `tls.crt` and `tls.key`.

4. **Create a secret using the `tls.crt` and `tls.key` files.**

    `kubectl create secret generic my-certs --from-file=tls.crt=tls.crt --from-file=tls.key=tls.key -n appservices`

5. **Update the secret name in your ingress yaml file.**

6. **Restart the ingress pods (if necessary).**
