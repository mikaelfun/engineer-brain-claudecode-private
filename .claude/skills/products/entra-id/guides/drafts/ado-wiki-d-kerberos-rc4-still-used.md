---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Security Enhancements & Changes/Kerberos: 11B.22 - KrbtgtFullPacSignature DefaultDomainSupportedEncTypes/Tips from Kerberos and Netlogon/EType values set - RC4 still used?"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/Kerberos/Kerberos%3A%20Security%20Enhancements%20%26%20Changes/Kerberos%3A%2011B.22%20-%20KrbtgtFullPacSignature%20DefaultDomainSupportedEncTypes/Tips%20from%20Kerberos%20and%20Netlogon/EType%20values%20set%20-%20RC4%20still%20used%3F"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283337&Instance=1283337&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1283337&Instance=1283337&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This document provides information on the use of encryption types in Kerberos, specifically addressing whether RC4 is still used. It explains the default encryption types policy, the implications of deleting the supported encryption type attribute, and the longstanding policy regarding encryption types for Kerberos.

[[_TOC_]]

# Audience
<SPAN style="color:red">****This content is internal, do not share****</SPAN>

# Question
EType values set - RC4 still used?

# Answer
Any computer object will reapply its supported encryption type attribute. Deleting the attribute is only a valid operation where an administrator has explicitly set a value on an account that is not subject to automatic management. Besides accounts that were given specific encryption type settings, this can also wipe out additional information stored in the high bits of the field, such as whether service tickets to the account should be issued using compound authorization data.

## What does the default encryption types policy do?
It allows the Key Distribution Center (KDC) to assume that those encryption types are supported by accounts when no information to the contrary is available. It does not prevent other ciphers from being chosen when information is available. 

For example, here is an excerpt from the ASN.1 module in the appendix of the Kerberos RFC:

```
KDC-REQ-BODY    ::= SEQUENCE {
        kdc-options             [0] KDCOptions,
        cname                   [1] PrincipalName OPTIONAL
                                    -- Used only in AS-REQ --,
        realm                   [2] Realm
                                    -- Server's realm
                                    -- Also client's in AS-REQ --,
        sname                   [3] PrincipalName OPTIONAL,
        from                    [4] KerberosTime OPTIONAL,
        till                    [5] KerberosTime,
        rtime                   [6] KerberosTime OPTIONAL,
        nonce                   [7] UInt32,
        etype                   [8] SEQUENCE OF Int32 -- EncryptionType
                                    -- in preference order --,
        addresses               [9] HostAddresses OPTIONAL,
        enc-authorization-data  [10] EncryptedData OPTIONAL
                                    -- AuthorizationData --,
        additional-tickets      [11] SEQUENCE OF Ticket OPTIONAL
                                        -- NOTE: not empty
}
```

When a client makes a request to the KDC, part of that request is a list of the encryption types that the client can support. Imagine a user account that is used from multiple computers. That account can be used from a new computer that supports the latest and greatest cryptography as well as an older computer that cannot. It is only because the caller provides the encryption types in the request that it is able to use the new cryptography when operating from the new computer.

There is a longstanding policy "Network security: Configure encryption types allowed for Kerberos" that sets the encryption types that may be used. If you set this on the client computer, then it will be reflected in the types offered in the request. If you set this on a domain controller, then it will limit the ciphers that the KDC can use.