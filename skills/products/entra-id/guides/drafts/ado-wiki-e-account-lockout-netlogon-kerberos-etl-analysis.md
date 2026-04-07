---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/Account Lockouts/Workflow: Account Lockout: Data Collection - Reactive/Workflow: Account Lockout: Data Analysis - Netlogon and Kerberos ETL Logs"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAccount%20Lockouts%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Collection%20-%20Reactive%2FWorkflow%3A%20Account%20Lockout%3A%20Data%20Analysis%20-%20Netlogon%20and%20Kerberos%20ETL%20Logs"
importDate: "2026-04-07"
type: troubleshooting-guide
---

This article provides detailed instructions on how to collect and analyze Netlogon logs for account lockout troubleshooting. It includes steps for locating the originating domain controller (DC), enabling Netlogon debug logging, and filtering logs for specific error codes. Examples are provided to illustrate common scenarios.

# Data analysis description

It's crucial to collect logs from the correct resource with recommended audit settings. Check Workflow: Account Lockout: Data Collection - Reactive section on how to find the originating domain controller (DC) locking the account. It's recommended to have Netlogon debug logging enabled on all DCs as any of the DCs may authenticate the user's request.

---

# Netlogon logs

The netlogon.log file is located in the **%SystemRoot%\Debug** directory of a DC. A flag like **0x2080FFFF** will help to monitor verbose session management and mailslot messages as well as logon processing for NTLM (Windows NT LAN Manager) authentication. Kerberos authentication requests **_will not be_** logged in Netlogon.log.

_(Although PAC (Privilege Attribute Certificate) validation information passes over and through the NTLM provider and from there over the Netlogon secure channel. This request will be available in Netlogon log. Kerberos authentication should succeed in order to have the PAC validation process run hence it would not be a scenario for account lockouts.)_

- When user credentials are passed to the file server, it's displayed in the **Network Logon** section in the Netlogon.log file.
- The file server will pass-through authentication to a domain controller and this will be displayed as **Transitive Network logon** in the Netlogon.log file.
- If the password is incorrect or if it is not the same as the password that is stored by the authenticating domain controller, the authenticating DC chains the credentials to the Primary Domain Controller (PDC) for validation. This is displayed as **Transitive Network Logon** in the Netlogon.log file.

You may use any text editor for your convenience to filter out the logs with the username and error code _0xC000006A_. A simple filtering can be done with findstr:

```
findstr /i corp\testuser netlogon.log >> testuser_failed.txt   
findstr /i 0xC000006A netlogon.log >> failed_attempts.txt
```

---

## Netlogon log error codes:

| Error Code  | Translation |
|:--:|:--:|
|0x0| Successful login|
|0xC0000064| The specified user does not exist |
|**0xC000006A**| The value provided as the current password is not correct |
|0xC000006C |Password policy not met |
|0xC000006D |The attempted logon is invalid due to a bad user name |
|0xC000006E |User account restriction has prevented successful login |
|0xC000006F |The user account has time restrictions and may not be logged onto at this time |
|0xC0000070 |The user is restricted and may not log on from the source workstation |
|0xC0000071| The user account's password has expired| 
|0xC0000072| The user account is currently disabled| 
|0xC000009A |Insufficient system resources| 
|0xC0000193| The user's account has expired |
|0xC0000224| User must change his password before he logs on the first time |
|**0xC0000234**| The user account has been automatically locked |

---

## Examples

1. Sample from PDC - Request coming from another DC

   - **Transitive Network Logon (Pass-Through Authentication)**  
`09/04 11:01:23 [LOGON] [860] CORP: SamLogon: Transitive Network logon of CORP\testuser from Client1 (via DC02) Returns 0xC000006A`

   - **Next Action**   
   Check the Netlogon log and/or Security events from the originating DC. In this case, it is the DC named DC02. User logs on to Client1 and sends an authentication request to DC02. DC02 then forwards it to PDCe to check if the bad password is in password history.

2. Sample from Authenticating DC - Request coming from a member server/workstation:
   - **Transitive Network Logon (Pass-Through Authentication)**   
`09/04 11:01:22 [LOGON] [750] CORP: SamLogon: Transitive Network logon of CORP\testuser from Client1 (via FS01) Returns 0xC000006A`   

   - **Next Action**   
   Check the Security events on the member server named FS01. Make sure that audit settings are configured properly to be able to capture the source application. User logs on to Client1 and tries to log on to an Application Server - FS01. It then forwards the request to DC02 on which the Netlogon log is collected.

3. Network Logon
   - **Sample from the Member Server**  
`09/04 11:01:20 [LOGON] [780] CORP: SamLogon: Network logon of CORP\testuser from Client1 Returns 0xC000006A`

   - **Next Action**   
   Analyze the Security events on the member server to find the application sending the bad password request. Event 4625 may contain the process information for the same request which matches the timestamp of the request in the Netlogon.log. It's crucial to understand the role of the member server as it may help to identify what possible application or services might be running on the server to authenticate the domain users.

4. Request coming with no source or domain information
   - **Transitive Network Logon (Pass-Through Authentication)**   
`09/04 11:01:23 [LOGON] [860] CORP: SamLogon: Transitive Network logon of (null)\testuser from Returns 0xC000006A`
   - **Next Action**  
   This is a LOGON event hence the user should log on to that server either locally or remotely. The way the application handles the incoming request does not have the domain name of the user. This is why it's shown as **NULL**. If the log is generated frequently, collecting network traces may help to identify the source IP address. Generally, load balancers may not forward client IP addresses hence the source field can be empty. You may observe the log on the authenticating DC or the member server receiving the authentication request.

---

# Kerberos ETL log

## Example

```
[0] 02B7.177C::9/11/18-12:34:23.1284574 [winnt5] logonapi_cxx3228 KerbGetAuthenticationTicketEx() - KerbGetAuthenticationTicket sending preauth enctype 18, length 143, Primar Credentials-
[0] 02B7.177C::9/11/18-12:34:23.1674974 [winnt5] logonapi_cxx8907 KerblLogonUserEx2() - LogonUser: Failed to get TGT for CORP\testuser: 0xc000006a
```
