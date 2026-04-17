---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Kerberos/Kerberos: Protocol Flow/Kerberos: Example Reference/Kerberos: Trusts/Kerberos: MIT Kerberos Interoperability"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FKerberos%2FKerberos%3A%20Protocol%20Flow%2FKerberos%3A%20Example%20Reference%2FKerberos%3A%20Trusts%2FKerberos%3A%20MIT%20Kerberos%20Interoperability"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1191904&Instance=1191904&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/1191904&Instance=1191904&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:**  
This guide provides detailed instructions on integrating Windows with non-Windows Kerberos implementations based on MIT Kerberos. It covers topics such as configuring MIT clients and servers in a Windows domain, setting up a Windows client in an MIT Kerberos realm, establishing trust between MIT Kerberos realms and Windows domains, and handling known issues.

[[_TOC_]]

# Introduction
This guide explains how Windows can integrate with non-Windows Kerberos implementations based on the Massachusetts Institute of Technology (MIT) Kerberos.

---

# Topics

- MIT client/server in Windows domain
- Windows client in MIT Kerberos realm
- Trust between MIT Kerberos realm and Windows domain

---

# MIT client/server in Windows domain

- **MIT Kerberos differences:**
  - Performs only authentication, no authorization (no Privilege Attribute Certificate (PAC)).
  - Private keys are stored in Keytab files.

- **MIT Kerberos client in Windows domain:**
  - Login with `KINIT` (getting Ticket Granting Ticket (TGT), automated referencing keytab file), logoff with `KDESTROY` (purge credential cache).
  - File-based configuration `/etc/krb5.conf` (realms, encryption types).

- **MIT Kerberos server in Windows domain:**
  - Configuration per `/etc/krb5.conf`.
  - Create a service account for authentication in Active Directory (AD).
  - Use `KTPASS` to create the corresponding .keytab file, for example:
    ```
    ktpass /princ host/Sample1.contoso.com@CONTOSO.COM /mapuser Sample1 /out Sample1.keytab /crypto all /ptype KRB5_NT_PRINCIPAL /mapop set
    ```
    Refer to `Ktpass`.
  - `/princ` (case-sensitive userPrincipalName); `/mapuser` (samAccountName=displayName).
  - Copy or merge the file to the MIT server, for example, `/etc/krb5.keytab`.
  - MIT supports Kerberos UDP only: Consider the `userAccountControl` setting `NO_AUTH_DATA_REQUIRED`, flag `0x2000000` (no authorization PAC required) when MIT Kerberos release requires UDP for Kerberos (only possible without PAC). We recommend using an updated MIT version supporting TCP.

---

# Windows client in MIT Kerberos realm

Windows Client WINWKS in Workgroup, MIT Realm REALM.FABRIKAM.COM:

On MIT KDC:
```
kadmin q "ank pw <WIN_password> HOST/WINWKS.REALM.FABRIKAM.COM
```

On Windows Client:
1. Set Kerberos realm: `Ksetup /setdomain REALM.FABRIKAM.COM`
2. Add KDC server: `Ksetup /addkdc REALM.FABRIKAM.COM kdc.realm.FABRIKAM.com`
3. Set local machine account password: `Ksetup /setmachpassword <WIN_password>`
4. For single-sign-on to local accounts, map local machine SAM accounts to Kerberos principals (UPN logon only):
   ```
   Ksetup /mapuser <MIT_USER>@REALM.FABRIKAM.COM <SAM_USER>
   ```
   or
   ```
   C:> Ksetup /mapuser * *
   ```
   (using same names)

---

# Trust between MIT Kerberos realm and Windows domain

- Trust between MIT Kerberos Realm REALM.FABRIKAM.COM and Windows Domain FABRIKAM.COM.
- Windows Client and KDC need explicit settings to be aware of remote MIT realm KDC:
  ```
  Ksetup /addkdc REALM.FABRIKAM.COM kdc.realm.FABRIKAM.com
  ```
  **or** GPO Computer Configuration\Policies\Administrative Templates\System\Kerberos\Define interoperable Kerberos V5 realm settings (RealmFlags per MIT Version).

  - Parameter `addkdc` creates RegKey:
    ```
    HKLM\System\CurrentControlSet\Control\LSA\Kerberos\Domains\REALM.FABRIKAM.COM
    ```
    RegValue `KdcNames` (REG_MULTI_SZ)
    ```
    kdc.realm.FABRIKAM.com
    ```
    --> This KDC(s) will be used for UPN user logon, for example, UserXYZ@REALM.FABRIKAM.COM.

- For getting a Ticket Granting Service (TGS) for an MIT Service Principal Name (SPN) target, you may configure `SpnMappings` for the host, for example, for SPN `ldap/ldaphost.realm.FABRIKAM.com`:
  ```
  ksetup /addhosttorealmmap ldaphost.REALM.FABRIKAM.COM REALM.FABRIKAM.COM
  ```
  - Parameter `Addhosttorealmmap` creates RegKey:
    ```
    HKLM\System\CurrentControlSet\Control\LSA\Kerberos\HostToRealm\REALM.FABRIKAM.COM
    ```
    RegValue: `SpnMappings` (REG_MULTI_SZ)
    ```
    ldaphost.realm.FABRIKAM.com
    ```

[Kerberos Realm to Host mapping policy limitations](https://internal.evergreen.microsoft.com/en-us/topic/kerberos-realm-to-host-mapping-policy-limitations-8223b319-cc5a-9d5f-8d07-ac1c82cb6ef8)

---

# Windows side

- Configure Trust MIT Realm - Windows Domain.
- Create MIT Realm Trust with Domain.msc or `NETDOM /TRUST /REALM`.
- For authorization (PAC), you need a User Name Mapping in AD. Right-click the User account, and select Name Mappings.  
![User Name Mapping](/.attachments/image-f72a21dd-dcc8-4b97-8a74-fb10d47c896f.png)

 Now you can authenticate with the trusted MIT realm account, but for authorization, AD will use Security Identifier (SID) information from the mapped account creating the PAC.

- MIT KDC needs cross-realm principals:
  ```
  Kadmin q "ank pw password krbtgt/FABRIKAM.COM@REALM.FABRIKAM.COM
  Kadmin q "ank pw password krbtgt/REALM.FABRIKAM.COM@FABRIKAM.COM
  ```

- Fallback to NTLM requires password synchronization.

- MIT KDC Logging:
  - `krb5kdc.log` (authentication requests)
  - `kdc.log` (application information)
  - `kadmin.log` (KDC database changes)

  Per `krb5.conf` on KDC:
  ```
  [logging]
  default = FILE:/var/log/krb5libs.log
  kdc = FILE:/var/log/krb5kdc.log
  admin_server = FILE:/var/log/kadmind.log
  ```

 Logging options may vary, depending on the implemented MIT version. The received result may need a MIT/Unix Kerberos expert to be analyzed.

---

# Known issues

[Win11: ADDS: Windows 11 22H2 Breaks Kerberos Interop with Legacy MIT Kerberos realms](https://internal.evergreen.microsoft.com/en-us/topic/win11-ADDS-windows-11-22H2-breaks-kerberos-interop-with-legacy-mit-kerberos-realms-8223b319-cc5a-9d5f-8d07-ac1c82cb6ef8)
