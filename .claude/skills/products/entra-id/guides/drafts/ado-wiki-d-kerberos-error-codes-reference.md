---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: References/Kerberos: Error Codes"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20References/Kerberos%3A%20Error%20Codes"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414196&Instance=414196&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/414196&Instance=414196&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides a comprehensive list of Kerberos error codes, including their hexadecimal values and meanings. It distinguishes between errors returned by the Key Distribution Center (KDC) and those returned within the application protocol.

[[_TOC_]]

# Introduction
Kerberos error codes

Note:     
There are two types of Kerberos error codes:

- Prefix **KDC_ERR_** indicates the error is returned by the **Key Distribution Center (KDC)** and is visible in common network monitor Kerberos parsers.
- Prefix **KRB_AP_** indicates the error is returned within the **application protocol**, typically from the server to the client (if the payload is not encrypted).

In a Kerberos or KDC Event Trace Log (ETL) trace, you may encounter the hex value of these errors.

From \ds\security\protocols\msv_sspi\test\inc\kerberr.h 

// These are the error codes as defined by the Kerberos V5 R5.2  // spec, section 8.3 

| Error Code | Hex Value | Meaning |
|:--|:--|:--|
|KDC_ERR_NONE| (0x0) | // 0 No error |
|KDC_ERR_NAME_EXP| (0x1)| // 1 Client's entry in database has expired | 
| KDC_ERR_SERVICE_EXP| (0x2) | // 2 Server's entry in database has expired |
| KDC_ERR_BAD_PVNO | (0x3) | // 3 Requested protocol version number not supported |
| KDC_ERR_C_OLD_MAST_KVNO | (0x4)| // 4 Client's key encrypted in old master key |
| KDC_ERR_S_OLD_MAST_KVNO | (0x5) | // 5 Server's key encrypted in old master key |
| KDC_ERR_C_PRINCIPAL_UNKNOWN | (0x6)| // 6 Client not found in Kerberos database |
| KDC_ERR_S_PRINCIPAL_UNKNOWN| (0x7) | // 7 Server not found in Kerberos database |
| KDC_ERR_PRINCIPAL_NOT_UNIQUE|(0x8)| // 8 Multiple principal entries in database |
| KDC_ERR_NULL_KEY | (0x9)| // 9 The client or server has a null key |
| KDC_ERR_CANNOT_POSTDATE | (0xA) | // 10 Ticket not eligible for postdating |
| KDC_ERR_NEVER_VALID | (0xB) | // 11 Requested start time is later than end time |
| KDC_ERR_POLICY | (0xC)| // 12 KDC policy rejects request |
| KDC_ERR_BADOPTION| (0xD)| // 13 KDC cannot accommodate requested option |
| KDC_ERR_ETYPE_NOTSUPP| (0xE)| // 14 KDC has no support for encryption type |
| KDC_ERR_SUMTYPE_NOSUPP | (0xF)| // 15 KDC has no support for checksum type |
| KDC_ERR_PADATA_TYPE_NOSUPP |(0x10)| // 16 KDC has no support for padata type |
| KDC_ERR_TRTYPE_NO_SUPP | (0x11)| // 17 KDC has no support for transited type |
| KDC_ERR_CLIENT_REVOKED | (0x12)| // 18 Client's credentials have been revoked |
| KDC_ERR_SERVICE_REVOKED | (0x13) | // 19 Credentials for server have been revoked |
| KDC_ERR_TGT_REVOKED | (0x14)| // 20 Ticket Granting Ticket (TGT) has been revoked |
| KDC_ERR_CLIENT_NOTYET | (0x15) | // 21 Client not yet valid - try again later |
| KDC_ERR_SERVICE_NOTYET | (0x16)| // 22 Server not yet valid - try again later |
| KDC_ERR_KEY_EXPIRED | (0x17) | // 23 Password has expired - change password to reset |
| KDC_ERR_PREAUTH_FAILED| (0x18)| // 24 Pre-authentication information was invalid |
| KDC_ERR_PREAUTH_REQUIRED | (0x19) | // 25 Additional pre-authentication required |
| KDC_ERR_SERVER_NOMATCH | (0x1A) | // 26 Requested server and ticket don't match |
| KDC_ERR_MUST_USE_USER2USER |(0x1B)| // 27 Server principal valid for user-to-user only |
| KDC_ERR_PATH_NOT_ACCEPTED| (0x1C)| // 28 KDC Policy rejects transited path |
| KDC_ERR_SVC_UNAVAILABLE | (0x1D)| // 29 A service is not available |
| KRB_AP_ERR_BAD_INTEGRITY| (0x1F)| // 31 Integrity check on decrypted field failed |
| KRB_AP_ERR_TKT_EXPIRED | (0x20) | // 32 Ticket expired |
| KRB_AP_ERR_TKT_NYV | (0x21) | // 33 Ticket not yet valid |
| KRB_AP_ERR_REPEAT | (0x22) | // 34 Request is a replay |
| KRB_AP_ERR_NOT_US| (0x23) | // 35 The ticket isn't for us |
| KRB_AP_ERR_BADMATCH | (0x24)| // 36 Ticket and authenticator don't match |
| KRB_AP_ERR_SKEW | (0x25)| // 37 Clock skew too great |
| KRB_AP_ERR_BADADDR| (0x26)| // 38 Incorrect net address |
| KRB_AP_ERR_BADVERSION | (0x27)| // 39 Protocol version mismatch |
| KRB_AP_ERR_MSG_TYPE| (0x28)| // 40 Invalid message type |
| KRB_AP_ERR_MODIFIED | (0x29)| // 41 Message stream modified |
| KRB_AP_ERR_BADORDER| (0x2A) | // 42 Message out of order |
| KRB_AP_ERR_ILL_CR_TKT | (0x2B)| // 43 Illegal cross-realm ticket |
| KRB_AP_ERR_BADKEYVER | (0x2C)| // 44 Specified version of key is not available |
| KRB_AP_ERR_NOKEY | (0x2D) | // 45 Service key not available |
| KRB_AP_ERR_MUT_FAIL| (0x2E) | // 46 Mutual authentication failed |
| KRB_AP_ERR_BADDIRECTION | (0x2F) | // 47 Incorrect message direction |
| KRB_AP_ERR_METHOD | (0x30)| // 48 Alternative authentication method required |
| KRB_AP_ERR_BADSEQ | (0x31)| // 49 Incorrect sequence number in message |
| KRB_AP_ERR_INAPP_CKSUM| (0x32)| // 50 Inappropriate type of checksum in message |
| KRB_AP_PATH_NOT_ACCEPTED | (0x33)| // 51 Policy rejects transited path |
| KRB_ERR_RESPONSE_TOO_BIG | (0x34)| // 52 Response too big for UDP, retry with TCP |
| KRB_ERR_GENERIC | (0x3C)| // 60 Generic error (description in e-text) |
| KRB_ERR_FIELD_TOOLONG | (0x3D)| // 61 Field is too long for this implementation |
| KDC_ERR_CLIENT_NOT_TRUSTED| (0x3E) | // 62 (pkinit) |
| KDC_ERR_KDC_NOT_TRUSTED | (0x3F)| // 63 (pkinit) |
| KDC_ERR_INVALID_SIG | (0x40) | // 64 (pkinit) |
| KDC_ERR_KEY_TOO_WEAK | (0x41)| // 65 (pkinit) |
| KDC_ERR_CERTIFICATE_MISMATCH(0x42) |(0x42)| // 66 (pkinit) |
| KRB_AP_ERR_NO_TGT | (0x43) | // 67 (user-to-user) |
| KDC_ERR_WRONG_REALM | (0x44) | // 68 (user-to-user) |
| KRB_AP_ERR_USER_TO_USER_REQUIRED| ( 0x45)| // 69 (user-to-user) |
| KDC_ERR_CANT_VERIFY_CERTIFICATE| ( 0x46)| // 70 (pkinit) |
| KDC_ERR_INVALID_CERTIFICATE | (0x47)| // 71 (pkinit) |
| KDC_ERR_REVOKED_CERTIFICATE| (0x48) | // 72 (pkinit) |
| KDC_ERR_REVOCATION_STATUS_UNKNOWN | ( 0x49)| // 73 (pkinit) |
| KDC_ERR_REVOCATION_STATUS_UNAVAILABLE |( 0x4a)| // 74 (pkinit) |
| KDC_ERR_CLIENT_NAME_MISMATCH| (0x4b)| // 75 (pkinit) |
| KDC_ERR_KDC_NAME_MISMATCH | (0x4c)| // 76 (pkinit) |
| KDC_ERR_INCONSISTENT_KEY_PURPOSE | (0x4d) | // 77 (pkinit)| 
| KDC_ERR_PA_CHECKSUM_MUST_BE_INCLUDED| (0x4f)|  // 79 (pkinit) | 
| KDC_ERR_DIGEST_IN_SIGNED_DATA_NOT_ACCEPTED| (0x50)|  // 80 (pkinit)| 
| KRB_AP_ERR_IAKERB_KDC_NOT_FOUND | (0x55) | // 85 (iakerb)| 
| KRB_AP_ERR_IAKERB_KDC_NO_RESPONSE | (0x56) | // 86 (iakerb)| 
| KDC_ERR_PREAUTH_EXPIRED | (0x5a) | // 90 RFC 6113| 
| KDC_ERR_MORE_PREAUTH_DATA_REQUIRED | (0x5b) | // 91 RFC 6113|
| KDC_ERR_PREAUTH_BAD_AUTHENTICATION_SET |      (0x5c) | // 92 RFC 6113
| KDC_ERR_UNKNOWN_CRITICAL_FAST_OPTIONS    |    (0x5d) | // 93 critical FAST option is not supported|