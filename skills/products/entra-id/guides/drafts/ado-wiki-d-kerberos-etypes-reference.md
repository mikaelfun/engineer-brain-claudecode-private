---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: References/Kerberos: ETypes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20References/Kerberos%3A%20ETypes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414194&Instance=414194&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414194&Instance=414194&Feedback=2)

___
<div id='cssfeedback-end'></div>

# Kerberos encryption types - ETypes

**Summary**  
This page provides details about Kerberos encryption types (ETypes) as part of the DS Kerberos wiki under "References." It includes information from OS 22h2_release and other relevant updates.

[[_TOC_]]

## Kerberos encryption types - ETypes

ETypes (extract) from OS 22h2_release \onecore\com\netfx\windowsbuilt\public\sdk\inc\**ntsecapi.h**

```cpp
// Encryption Types:   
// These encryption types are supported by the default MS KERBSUPP DLL   
// as crypto systems. Values over 127 are local values, and may be changed   
// without notice.
```

| Name  | Value |
|:--:|:--:|
| KERB_ETYPE_NULL | 0 |
| KERB_ETYPE_DES_CBC_CRC | 1 |
| KERB_ETYPE_DES_CBC_MD4 | 2 |
| KERB_ETYPE_DES_CBC_MD5 | 3 |
| KERB_ETYPE_AES128_CTS_HMAC_SHA1_96 | 17 |
| KERB_ETYPE_AES256_CTS_HMAC_SHA1_96 | 18 |
| KERB_ETYPE_OLD_RC4_MD4 | 128 |
| KERB_ETYPE_OLD_RC4_PLAIN | 129 |
| KERB_ETYPE_OLD_RC4_LM | 130 |
| KERB_ETYPE_OLD_RC4_SHA | 131 |
| KERB_ETYPE_OLD_DES_PLAIN | 132 |
| KERB_ETYPE_RC4_MD4 | -128 |
| KERB_ETYPE_RC4_PLAIN2 | -129 |
| KERB_ETYPE_RC4_LM | -130 |
| KERB_ETYPE_RC4_SHA | -131 |
| KERB_ETYPE_DES_PLAIN | -132 |
| KERB_ETYPE_RC4_HMAC_OLD | -133 |
| KERB_ETYPE_RC4_PLAIN_OLD | -134 |
| KERB_ETYPE_RC4_HMAC_OLD_EXP | -135 |
| KERB_ETYPE_RC4_PLAIN_OLD_EXP | -136 |
| KERB_ETYPE_RC4_PLAIN | -140 |
| KERB_ETYPE_RC4_PLAIN_EXP | -141 |

```cpp
// used internally by userapi.cxx
```

| Name | Value |
|:--:|:--:|
| KERB_ETYPE_AES128_CTS_HMAC_SHA1_96_PLAIN | -148 |
| KERB_ETYPE_AES256_CTS_HMAC_SHA1_96_PLAIN | -149 |

```cpp
// Unsupported but defined types
```

| Name  | Value |
|:--:|:--:|
| KERB_ETYPE_DES3_CBC_MD5 | 5 |
| KERB_ETYPE_DES3_CBC_SHA1 | 7 |
| KERB_ETYPE_DES3_CBC_SHA1_KD | 16 |

```cpp
// In use types
```

| Name  | Value |
|:--:|:--:|
| KERB_ETYPE_DES_CBC_MD5_NT | 20 |
| KERB_ETYPE_RC4_HMAC_NT | 23 |
| KERB_ETYPE_RC4_HMAC_NT_EXP | 24 |

## Kerberos protocol extensions

For more details, refer to the [MS-KILE](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-kile/2a32282e-dd48-4ad9-a542-609804b02cc9) documentation. This section includes information on supported encryption types and their bit flags.

![Supported Encryption Types Bit Flags](/.attachments/image-f910a696-2ffb-4898-bfe9-e2aa5379be17.png)

![Supported Encryption Types Bit Flags](/.attachments/image-ec27c0c9-2682-4a6b-bbb1-abc0b82e513c.png)

### Example

The Windows default setting 0x1C has a flag value of 00011100, indicating the following ETypes are configured:

![Configured ETypes](/.attachments/image-73b972e2-7067-43be-9247-bac3de8199c4.png)

## Updates since 11B.22

Refer to the following link for details on Kerberos and NETLOGON Protocol protections: [Servicing: 11B.22](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-kerberos-and-netlogon-protocol-protections-for-cve-2022-38023-cve-2022-37966-and-cve-2022-37977-in-november-8-2022-updates-2fa14ba8-d568-db55-e7a7-18cbf3f01b05).

If the `msds-supportedEncryptionType` attribute is not set, the updates from November 11, 2022, and newer Windows Updates will assume a `msds-supportedEncryptionType` value of 0x27.

```cpp
//#define KERB_ENCTYPES_DEFAULT_DOMAIN_POLICY (KERB_ENCTYPE_DES_CBC_CRC | KERB_ENCTYPE_DES_CBC_MD5 | KERB_ENCTYPE_RC4_HMAC_MD5 | KERB_ENCTYPE_AES256_CTS_HMAC_SHA1_96_SK)
```

### Note

For trusts, AES support is assumed unless configured otherwise via `ksetup.exe` or the UI. For Computers and Users, the default is 0x27. Future updates may change this to AES-only unless a user sets the associated registry key.

```cpp
//#define KERB_ENCTYPE_DES_CBC_CRC 0x00000001
//#define KERB_ENCTYPE_DES_CBC_MD5 0x00000002
//#define KERB_ENCTYPE_RC4_HMAC_MD5 0x00000004
//#define KERB_ENCTYPE_AES128_CTS_HMAC_SHA1_96 0x00000008
//#define KERB_ENCTYPE_AES256_CTS_HMAC_SHA1_96 0x00000010
//#define KERB_ENCTYPE_AES256_CTS_HMAC_SHA1_96_SK 0x00000020 // The client supports AES session keys but does not have AES long-term keys
```

The 0x20 flag was added on October 8, 2022. Both `Learn: 2.2.7 Supported Encryption Types Bit Flags` and tools like LDP will need updates to correctly display this flag. Ignoring the `_SK` flag, this is the system default for the past 20 years. The `_SK` flag enforces AES session keys even if RC4 is chosen for encryption.

In summary, 0x27 Hex = 39 Decimal = 00100111, keeping:

- A and B are DES
- D and E are AES
- ^6 is session key protection

Where bit position ^6 next to E is the new, currently undocumented bit added by 11B.22 that triggers session key protection. (supported_encryption_type_bitmask.png)

For more details, visit:   
[Servicing: 11B.22: Populating the high bits of msds-supportedEncryptionTypes without an encryption type causes Kerberos auth failures on 11B-patched DCs](https://internal.evergreen.microsoft.com/en-us/topic/servicing-11b-22-populating-the-high-bits-of-msds-supportedencryptiontypes-without-an-encryption-type-causes-kerberos-auth-failures-on-11b-patched-dcs-icm-351890484-136073c6-24d6-ad6a-9d85-d24f3c5c2bb9).

[Parsing KDC event ID 14, 16, 26, 27 to understand the reason for the encryption type mismatch](https://internal.evergreen.microsoft.com/en-us/topic/adds-parsing-kdc-event-id-14-16-26-27-to-understand-the-reason-for-the-etype-mismatch-5904cb65-c9b0-e639-ec24-2881c46beed4)

For issues with pre-Windows Server 2008, Vista, and legacy Linux devices, visit:   
[Servicing: 11B.22: Resource access and interop fails with pre-Windows Server 2008, Vista, and legacy Linux devices](https://internal.evergreen.microsoft.com/).