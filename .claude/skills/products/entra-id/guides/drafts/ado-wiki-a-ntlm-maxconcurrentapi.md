---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/NTLM/Workflow: NTLM: Troubleshooting/Workflow: NTLM: MaxConcurrentAPI for NTLM Authentication"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=/NTLM/Workflow%3A%20NTLM%3A%20Troubleshooting/Workflow%3A%20NTLM%3A%20MaxConcurrentAPI%20for%20NTLM%20Authentication"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415193&Instance=415193&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/415193&Instance=415193&Feedback=2)

___
<div id='cssfeedback-end'></div>

**MaxConcurrentApi**

MaxConcurrentApi controls the number of concurrent NTLM (NT LAN Manager) authentication attempts on a Windows system.

- The value for MaxConcurrentApi defines the number of threads within lsass.exe available to Netlogon for NTLM or Digest authentication and Kerberos PAC (Privilege Attribute Certificate) validation functions per secure channel.
- There are a maximum number of these threads that are available to handle these requests concurrently.
- This is a limit for the maximum number of NTLM or Kerberos PAC password validations a server can process at a time.
- If the requests exceed the availability of the threads and the requests cannot wait any longer, authentication time-outs occur.

**Configuration**

**Default Values:**
- Domain-joined workstations: 1. One call at a time per secure channel on member workstations.
- Domain-joined servers: 10 beginning with Windows Server 2012. 10 threads for member servers. (Prior to Windows Server 2012, the default was 2.)
- Domain controllers: 10 beginning with Windows Server 2012. 10 threads for domain controllers. (Prior to Windows Server 2012, the default was 1.)

**Maximum Values:**
- Windows Server 2008 R2 and earlier: 10
- Windows Server 2008 R2 SP1 (with hotfix) and later: 150
- Windows Server 2012 and later: 9999

- It is possible to add the MaxConcurrentAPI entry to the registry to increase its value.
  - MaxConcurrentApi registry key location:
  - _HKLM\SYSTEM\CurrentControlSet\Services\Netlogon\Parameters_

**Warning:**
- Increasing the MaxConcurrentApi value to greater than 10 may result in other resource bottlenecks such as exhausting the resources of the contacted domain controller or pass-through domain controllers or impact host performance.
- It is recommended to test the desired setting in a nonproduction environment that mimics the live environment before you implement the change in a production environment.

**Common Symptoms**
- If the number of concurrent requests ever exceeds MaxConcurrentAPI, the excess requests are queued and then serviced randomly.
- The bottleneck occurs when a thread waits for 45 seconds and more Net Logon service requests are being issued.
- Customers can experience a Windows Authentication or line-of-business application outage due to a low default value for MaxConcurrentAPI.
- **Client-side symptoms** - You are intermittently prompted for credentials or experience time-outs when you connect to authenticated services: KB975363

**Potential Causes**
- Authentication performance bottlenecks may be caused by a combination of any or all of the following factors:
  - High volume of NTLM authentication.
  - Kerberos PAC validation.
  - Network delays and problems.
  - Applications that submit authentication poorly.
  - Delays from secure channel domain controller or trusted domain controller - This condition occurs when the delays are further along the secure channel, on another computer.
    - This condition will have semaphore waiters, semaphore holders less than the number of MaxConcurrentApi, and semaphore timeouts.
  - Local computer MaxConcurrentApi load bottleneck - This condition occurs when the local computer is seeing more authentication load than it can service quickly enough. This condition will have semaphore waiters and semaphore timeouts.
  - Local computer MaxConcurrentApi delays for user authentication without timeout errors - This condition occurs when the local computer is seeing enough load to produce delays, or is seeing delays without errors from a domain controller. This condition will have semaphore waiters only.
  - Local computer MaxConcurrentApi timeout errors in the recent past - This condition occurs as a result of the Netlogon performance counters having evidence of past semaphore timeout errors however no current load while the diagnostic was running. This condition will have semaphore timeouts only.

**Troubleshooting**

- **Enable debug logging for the Netlogon service** on the server where the authentication requests are slow or timing-out - NetLogon debug logging: [KB109626](https://support.microsoft.com/en-us/help/109626/enabling-debug-logging-for-the-netlogon-service)

- To enable Netlogon logging:
  - Open a Command Prompt window (administrative Command Prompt window for Windows Server 2008 and later versions).
  - Type the following command, and then press Enter:
    - `Nltest /DBFlag:2080FFFF`

- Parse this log for interesting data during the time of failure(s) and attempt to identify patterns:

```shell
C:\> findstr /i NlAllocateClientApi Server02Netlogon.log > AllocateAPI.txt
```

Search the log for entries such as the ones below:
````
12/13 16:53:58 [CRITICAL] SomeCompany: NlAllocateClientApi timed out: 0 258 
12/13 16:53:58 [CRITICAL] SomeCompany: NlpUserValidateHigher: Can't allocate Client API slot. 
12/13 16:53:58 [LOGON] SamLogon: Network logon of SomeCompany\User7161 from ClientMachine16151 Returns 0xC000005E 

12/13 16:53:59 [CRITICAL] SomeCompany: NlAllocateClientApi timed out: 0 258 
12/13 16:53:59 [CRITICAL] SomeCompany: NlpUserValidateHigher: Can't allocate Client API slot. 
12/13 16:53:59 [LOGON] SamLogon: Network logon of SomeCompany\User23423 from ClientMachine435 Returns 0xC000005E 
````

- Identify the **domain controller** with which the affected server holds a secure channel.
  - `Nltest /sc_query:DomainName`

- Enable the Net Logon performance object counters.

- MaxConcurrentAPI is implemented using semaphore objects, which will be displayed in the performance monitoring tool.
  - **Semaphore holders** - This is the current number of MaxConcurrentApi threads being used.
  - **Semaphore timeouts** - This number indicates clients who have gotten a credential prompt or error.
  - **Semaphore waiters** - This number indicates clients who are waiting to authenticate.
  - **Semaphore acquires** - Cumulative number of NTLM or PAC validation along the secure channel.
  - **Average semaphore hold time** - The average amount of time that a client who had the thread had to wait until authentication.

_By default, these counters are present in Windows Server 2008 and in later versions of Windows._

- The Net Logon performance object is discussed in more detail in the following article in the Microsoft [KB928576](https://internal.evergreen.microsoft.com/en-us/topic/78353cc0-7164-79e8-2b90-d9cfbcdbd1ad) Netlogon counters for Windows Server 2003

- **Monitoring NetLogon performance** is advised as the MaxConcurrentApi value might need to be changed if the service load changes significantly.

- To calculate the appropriate value to set MaxConcurrentAPI and configure it, see: [How to do performance tuning for NTLM authentication by using the MaxConcurrentApi setting](http://support.microsoft.com/kb/2688798).

**More Information**

[Windows: Configuring MaxConcurrentAPI for NTLM Pass-Through Authentication](https://social.technet.microsoft.com/wiki/contents/articles/9759.windows-configuring-maxconcurrentapi-for-ntlm-pass-through-authentication.aspx)

[Overview: Identify and remediate MaxConcurrentApi issues that affect user authentication](https://social.technet.microsoft.com/wiki/contents/articles/9759.windows-configuring-maxconcurrentapi-for-ntlm-pass-through-authentication.aspx)