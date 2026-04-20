---
source: ado-wiki
sourceRef: "Supportability/AzureNetworking/Wiki:/Azure ExpressRoute/How To/Microsoft Peering Prefix Validation"
sourceUrl: "https://dev.azure.com/Supportability/AzureNetworking/_wiki/wikis/Wiki?pagePath=/Azure%20ExpressRoute/How%20To/Microsoft%20Peering%20Prefix%20Validation"
importDate: "2026-04-18"
type: troubleshooting-guide
---

# Microsoft Peering Prefix Validation

*11/19/25 - Please note that this is currently in public preview*

[[_TOC_]]

## Description

This documents the process customers must follow for Microsoft Prefix Validation. The new prefixes are verified with the RIR/IRR by validating a signed digital certificate associated with each prefix configured.

## Process

### Step 1: Generate keys and certificate

1. Generate a private key:
   ```
   openssl.exe genpkey -algorithm rsa -out privkey.pem -pkeyopt rsa_keygen_bits:4096
   ```

2. Generate the corresponding public key:
   ```
   openssl rsa -in privkey.pem -outform PEM -pubout -out pubkey.pem
   ```

3. Generate a Certificate Signing Request (CSR):
   ```
   openssl req -new -key privkey.pem -out request.csr
   ```

4. Generate a self-signed public certificate:
   ```
   openssl x509 -req -days 365 -in request.csr -signkey privkey.pem -out certificate.crt
   ```

### Step 2: Upload certificate to Internet Routing Registry

Upload the public certificate to the IRR. Example: [RADb Query](https://www.radb.net/query)

### Step 3: Keep private key secret

Save the private key securely - it will be used to sign all IP addresses belonging to the prefix block.

### Step 4: Get the Validation ID

From the portal or API. Format:
```
Azure-SKEY|000000-0000-0000-0000-000000000000|x.x.x.x/32|ASN-xxxx
```

### Step 5: Save Validation ID

Save to a text file with UTF-8 encoding. Ensure no extra spaces or lines.

### Step 6: Generate and submit signature

1. Save validationId to `validationId.txt`
2. Sign with openssl:
   ```
   openssl.exe dgst -sha256 -sign .\privkey.pem -out .\signature.txt .\validationId.txt
   ```
3. Get base64 format:
   ```
   openssl.exe base64 -in .\signature.txt
   ```
4. Submit the base64 signature as a single line string via portal or API.

## Validation State Codes

| Code | Description |
|--|--|
| NotConfigured | Prefix is Not configured |
| Configuring | Prefix configuration in progress |
| Configured | Prefix is validated and configured successfully |
| ManuallyVerified | Verified using old method |
| ValidationNeeded | State when peering is created |
| AsnValidationFailed | Failed due to ASN mismatch |
| CertificateMissingInRoutingRegistry | Record in registry has no certificate |
| InvalidSignatureEncoding | Signature encoding is invalid format |
| SignatureVerificationFailed | Signature verification failed |
