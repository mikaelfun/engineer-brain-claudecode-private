---
source: ado-wiki
sourceRef: "Supportability/AzureDev/Dev_ARM:/[ARM] Azure Resource Manager (ARM)/Architecture/Azure CLI/TLS handshake"
sourceUrl: "https://dev.azure.com/Supportability/AzureDev/_wiki/wikis/Dev_ARM?pagePath=/[ARM] Azure Resource Manager (ARM)/Architecture/Azure CLI/TLS handshake"
importDate: "2026-04-05"
type: troubleshooting-guide
---

## How Azure CLI establishes the TLS handshake

Azure CLI establishes the TLS handshake using Python OpenSSL libraries.

Ciphers are determined by engineering, and they are not usually changed.

SSL requirements are determined by the Python version shipped with CLI, and they are set on the OpenSSL libraries. This is done using the SECLEVEL property offered in Azure CLI.

What the above means is that the TLS handshake might fail because of security requirements, so it is necessary to understand what version of CLI is failing, to determine what version of Python is being used, to determine what SECLEVEL is set by Python against OpenSSL on that specific version, to then determine what the requirements are for that SECLEVEL value.

SECLEVEL requirements are based on a number starting at 0, and can be seen on this [link](https://www.openssl.org/docs/man1.1.1/man3/SSL_CTX_set_security_level.html). Microsoft servers should be ok meeting the security requirements, but if the customer has a proxy that decrypts https traffic (Fiddler or others), the proxy certificate might not be very secure.

As per the version of the OpenSSL libraries, that should not be relevant, as Python keeps them up to date regardless of version. What is really relevant is the SECLEVEL property which can vary across Python versions.

Based on the error message, knowing the SECLEVEL and understanding the requirements of that specific SECLEVEL value, a Wireshark trace should help determine the source of the failure to show the customer.

## Troubleshooting Steps

1. **Identify Azure CLI version** - determine which Python version is bundled
2. **Determine SECLEVEL** - check what SECLEVEL the Python version sets for OpenSSL
3. **Check SECLEVEL requirements** - reference OpenSSL documentation for that SECLEVEL value
4. **Check for proxy** - if customer uses an HTTPS-decrypting proxy, check its certificate key size
5. **Capture Wireshark trace** - analyze the TLS handshake to identify the specific failure point
6. **Compare error message with SECLEVEL requirements** - confirm which requirement is not met

## Sample Cases

### SSL handshake failing with `dh key too small` error

**Symptom:** Customer was getting error `dh key too small` when trying to run `az connect` with Azure CLI. Previous versions of python worked correctly. Customer had a proxy that decrypted https traffic.

**Cause:** The latest version of Azure CLI at the time (2.37.0) moved to Python 3.10. Python 3.10 increased the SECLEVEL value to `2`. SECLEVEL 2 required certificate public keys to have 2048 bits at minimum, but the customer proxy certificate was 1024 bits, which resulted in Python OpenSSL libraries rejecting the TLS handshake.

**Workarounds:**
- Use a previous version of Python and install CLI package manually.
- Use a previous version of Azure CLI which included an older version of Python where the SECLEVEL property was lower than 2.

**Solution:** Customer had to upgrade the proxy configuration to use a certificate that met SECLEVEL 2 requirement.
