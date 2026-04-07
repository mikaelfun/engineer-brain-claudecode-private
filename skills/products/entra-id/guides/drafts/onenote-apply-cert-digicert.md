# Apply SSL Certificate via DigiCert (for ADFS/Azure)

> Source: OneNote - Mooncake POD Support Notebook / Azure AD / Readiness path / Apply Cert in DigiCert

## Overview
Step-by-step guide for creating CSR, obtaining certificate from DigiCert, and installing on Windows servers (e.g., for ADFS).

## Step 1: Create CSR (Certificate Signing Request)
1. Login to the target server
2. Open MMC (`mmc.exe`) > Add Certificate snap-in > Local Computer
3. Right-click **Personal** > All Tasks > Advanced Operations > **Create Custom Request**
4. In Certificate Enrollment, click **Properties**:
   - Set Friendly Name (recommended)
   - **Subject**: CN=*.domain.com or ADFS service name
   - **SAN (DNS)**: `enterpriseregistration.domain.name` and `*.domain.com`
   - **Key size**: 2048 or larger
   - **Key exportable**: Enable if cert needs to be installed on other servers
5. Save the CSR file

> Note: The CSR process generates a certificate with private key in local machine store (under Certificate Enrollment Requests). The CSR file itself does NOT contain the private key.

## Step 2: Submit CSR to DigiCert
1. Go to https://www.digicert.com/secure/
2. Upload the CSR file, review content, submit
3. Go to Orders page, click order number to check status
4. Add TXT DNS records for domain validation (for each domain in the cert)
5. Verify DNS records in DigiCert portal
6. Download completed certificate as `.p7b`

## Step 3: Install Certificate
1. Open MMC Certificate snap-in
2. Import the `.p7b` file to **Personal** store
3. After installation, the Certificate Enrollment Requests entry should be cleared

## Step 4: Export with Private Key (Optional)
If the certificate needs to be installed on other servers:
1. Right-click the installed certificate > All Tasks > Export
2. Select **Yes, export the private key**
3. Choose PFX format
4. Set a password
5. Copy PFX to target server and import

## Reference
- [PEM, DER, CRT, and CER: X.509 Encodings and Conversions - SSL.com](https://www.ssl.com/guide/pem-der-crt-and-cer-x-509-encodings-and-conversions/)
