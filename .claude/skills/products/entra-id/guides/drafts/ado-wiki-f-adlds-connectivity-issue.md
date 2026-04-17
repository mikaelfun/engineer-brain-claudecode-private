---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS Connectivity issue"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20Connectivity%20issue"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**
This document provides guidance on troubleshooting and configuring Active Directory Lightweight Directory Services (AD LDS) instances, including diagnosing errors, gathering necessary data, and setting up LDAPS connections.

---

**Overview**

An AD LDS instance uses a specified port to complete all LDAP connections and synchronization. To list all AD LDS instances and ports configured and running on a server, use `dsdbutil "list instance"`:

```shell
PS C:\Windows\system32> dsdbutil "list instance"

Instance Name:         instance1
Long Name:             instance1
LDAP Port:             50000
SSL Port:              50001
Install folder:        C:\Windows\
Database file:         C:\Program Files\Microsoft ADAM\instance1\data\adamntds.dit
Log folder:            C:\Program Files\Microsoft ADAM\instance1\data
Service state:         Running
```

**Scope**

- What is the error you are getting?
- Have you used another tool such as ADSI Edit (ADSIedit.msc) or LDP.EXE to perform the same action (LDAP add, modify)?
- What is the user account you are attempting the add/modification/deletion with?
- What port is the instance on?
- Who (user or application) is attempting to connect to the server?
- Is anyone able to connect to the server?

**Data to gather**

1. Gather a double-sided network trace to rule out network issues. (If the client is not a Windows-based application, at least collect a network trace on the AD LDS server side.)
2. Increase diagnostic logging (useful for replication and LDAP query issues).
3. Gather the ADAM event log of the target instance.
4. Collect the LDAP server ETL, which is sometimes useful for troubleshooting.

   Start tracing:
   ```plaintext
   logman create trace "LDAP" -ow -o c:\LDAP.etl -p {90717974-98DB-4E28-8100-E84200E22B3F} 0x8 0xff -nb 16 16 -bs 1024 -mode Circular -f bincirc -max 1024 -ets
   ```

   Stop tracing:
   ```plaintext
   logman stop "LDAP" -ets
   ```

**To summarize data collection:**

1. Error screenshot
2. Double-sided network trace
3. ADAM event log of the target instance
4. LDAP server ETL (optional)
5. LDAP client ETL (optional if the client is Windows)

**LDAPS connection to AD LDS**

AD LDS follows AD LDAPS instructions to encrypt LDAP traffic. The certificate must meet the following requirements:

- The certificate must be valid for the purpose of server authentication (OID: 1.3.6.1.5.5.7.3.1).
- The subject name or the first name in the SAN must match the FQDN of the host machine (e.g., Subject:CN=server1.contoso.com).
- The host machine account/AD LDS service account must have access to the private key.

If you want to specify a certain certificate for LDAPS traffic:

1. Open the service store and locate the AD LDS service.
2. Import the certificate with the private key into the store.
3. Note down the service store name (e.g., ADAM_instance1).
4. Run: `CertUtil -verifystore -v -service -service adam_instance1\My`
5. Locate the key container name for the certificate with the private key.
6. Navigate to `C:\ProgramData\Microsoft\Crypto` and find the corresponding private key file.
