---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/ADLDS/ADLDS Authentication/ADLDS authentication troubleshooter"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FADLDS%2FADLDS%20Authentication%2FADLDS%20authentication%20troubleshooter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

**Summary:**

This guide helps you troubleshoot authentication issues in Active Directory Lightweight Directory Services (AD LDS). Follow these steps to diagnose and resolve common problems.

#### Scoping

1. What is the exact user name used by the LDAP client?
2. What is the authentication method used by the LDAP client?
3. Is TLS being used?
4. Can you authenticate using LDP.EXE using the same parameters? (Follow instructions in TechNet to get this to work.)
5. Are there any error messages in the LDAP client app and/or LDP?
6. Are you able to perform a Security Identifier (SID) to name lookup on the account from the ADAM/AD LDS server?
7. Is the account in Active Directory (AD) disabled?
8. Are you able to perform a name to SID lookup on the account from the ADAM/AD LDS server?
9. If no to 3), ensure clear-text simple bind is allowed.
8. If yes to 3), ensure TLS succeeds negotiating the certificate.

#### Data to Gather

1. Gather a double-sided network trace to rule out network issues.
2. Collect a Kerberos/NTLM related Event Logging Tool (ELT) trace (AuthScript).

For cases where Bind redirection authentication is used, also gather:

1. Use `psgetsid` to confirm that the AD LDS server can resolve the SID and the name of the user attempting to authenticate against AD.
   ```plaintext
   Psgetsid domain\username >c:\psget_name.txt
   Psgetsid SID >c:\psget_sid.txt
   ```

#### Troubleshooting Tips

##### Bind Redirection

1. Check the user name used by the LDAP client matches one of the supported simple Bind logon types.
2. Check the expected Sid is resolved in LSP.LOG against the DC of the domain the LDS is member of, and the lookup succeeds.
3. Check if the account has been disabled in AD.
4. Use `psgetsid` to confirm that the ADAM/AD LDS server can resolve the SID and the name of the user attempting to authenticate against AD. Are you using the same Sid as you see in 2)?
5. Review the network trace to confirm if any port is blocked between AD and the ADLDS instance. If Kerberos is attempted, it requires DNS, UDP/389 and TCP/88. The LDS server as a domain member needs more ports, also for its own purposes like group policy.

##### Simple Bind Authentication

If the user is created in ADLDS, it is disabled by default. To bind using an ADLDS account, ensure:

1. The account is enabled.
2. The user has created a password for the ADLDS account.
