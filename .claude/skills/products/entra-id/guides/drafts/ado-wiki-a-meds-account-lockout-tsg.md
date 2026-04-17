---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Account Management/Microsoft Entra Domain Services/Microsoft Entra Domain Services Account Lockout Troubleshooting"
importDate: "2026-04-06"
type: troubleshooting-guide
---

---
Tags:
- cw.Entra
- cw.EntraID
- cw.comm-orgmgt
- cw.AADDS
- cw.TSG
- cw.TSG-AADDS
- cw.comm-orgmgt-tsg
- Account-Lockout
---
:::template /.templates/Shared/findAuthorContributor.md
:::
   
:::template /.templates/Shared/MBIInfo.md
:::
   
[[_TOC_]]

# What is account lockout?

1. 5 bad password attempts to Microsoft Entra DS joined resource in 2 minutes == account locked out for 30 minutes
   
   NOTE: Customer's can confirm this is their MEDS policy via logging into management VM joined to MEDS and running Get-ADDefaultPasswordPolicy or "net accounts".


2. Why: To protect our customers from spray attacks and ?the bad guys? coming in

# Why is my account locked out?

It is most likely one of the following reasons

1. You locked yourself out ? did you forget your password?

2. There is something that has your old password and is constantly trying to log in using the old password.

3. You changed your password and the new password hasn?t sync?d in from Entra ID to Microsoft Entra DS and you lock yourself out by trying the new password to soon. It takes ~ 30 seconds for new password hash to sync from Entra to Microsoft Entra DS.

4. There is an evil among us ? a hacker is trying to get into the domain!!

#How do we know what is actually happening?

Note: until you know it?s a hacker ? don?t say it?s a hacker! Don?t want to freak customer out.


## Use Azure Support Center to Confirm Lockout

1. Browse to customer's Domain Services resource in Azure Support Center -> Resource Explorer -> Customer Subscription -> Resource Provider = Microsoft.AAD
2. Type in user's UPN or Object I in Diagnostics -> User Object Comparison
3. Review user's AAD DS object properties for BadPwdCount, BadPasswordTime, PasswordLastSet, and UserAccountControl to determine if user has been locked out or not.

   NOTE: **If BadPwdCount = 5** and **BadPasswordTime is less than 30 minutes ago** the account is locked out and **won't be unlocked until 30 minutes past the last BadPasswordtime**
4. After asking user to change their password in Entra ID via [Password Change](https://mysignins.microsoft.com/security-info/password/change) or reset their password in Entra ID via [Microsoft Online Password Reset](https://passwordreset.microsoftonline.com/), ask them to wait 30 minutes for their account to be unlocked and retry login with their newly set password.
5. Verify with User Object Comparison, that you see PasswordLastSet timestamp updated on user's MEDS User Object and that BadPwdCount has been reset to 0 (indicating account is unlocked)


   Example:

   ![image.png](/.attachments/image-98cc764f-f9d8-4e1f-99b4-6d8bb352ead8.png)

   **NOTE**: The MEDS attribute **UserAccountControl** can be used to determine status of account.  [Reference](http://woshub.com/decoding-ad-useraccountcontrol-value/). This attribute will NOT reflect a locked out user however, for that review **BadPasswordAccount = 5**
   ```
   66080 = Normal state of MEDS user (w/o an Entra password expiration policy applied)
   66082 = Disabled MEDS user (w/o an Entra password expiration policy applied)
   544 = Normal state of MEDS  user (with default Entra password expiration policy applied)
   546 = Disabled MEDS user (with default Entra password expiration policy) : Note Guest user's fall into this category
   ```

## Ask customer to enable MEDS security auditing
Before you try to help customer troubleshoot the issue, ask them to help themselves. Recommend Customers to Enable Security Audits for MEDS(In Preview currently) Link: [Enable security and DNS audits for Microsoft Entra Domain Services](https://learn.microsoft.com/en-us/entra/identity/domain-services/security-audit-events) . This should be the first step to be tried out and let the customer help themselves.

There is a section for sample queries to query for Account Lockout Events

Examples:
```
AADDomainServicesAccountManagement
| where TimeGenerated >= ago(7d)
| where OperationName has "4740"
| sort by TimeGenerated asc
```
or for a particular user with username `User.Name` to see the lockouts (4740) + bad password logins (4771) this query would work.  Ensure that the AccountLogon + AccountManagement diagnostic settings are enabled 
```
union withsource=sourcetable AADDomain*
| where * contains "User.Name"
| where OperationName has_any ("4771", "4740")
| project-reorder sourcetable
```
   

 Log Analytics Query Result:

[![image.png](/.attachments/image-a6bd15a2-4ab3-4b0c-8dab-a5d6f6d10d24.png =800x)](/.attachments/image-a6bd15a2-4ab3-4b0c-8dab-a5d6f6d10d24.png)

## Perform review of MEDS Service Logs to find lockout cause
If after that Customer still has issues follow the below steps

(Only after Enabling Security Audit hasn?t helped)

<table style="margin-left:.34in">
  <tr style="background:lightyellow;color:black">
    <td>
      <small>&#128276; <b>Note</b> &#128276
      <p style="margin-left:.27in">As of 2023-06 the below logs that utilize dcaasfleetprod namespace now require you to authenticate with a  <a href="https://dev.azure.com/msazure/AzureWiki/_wiki/wikis/AzureWiki.wiki/29758/Account-Creation-and-YubiKeys">@ame.gbl account</a> with AME\AAD-TA security group membership from a <a href="https://aka.ms/sawvm">SAW</a>  . Contact an AAD TA, or AAD DS EEE team member if these queries are required for troubleshooting.<br><br><b>TAs:</b> Please add Scenarios\ICM\Cases to <a href="https://aka.ms/cssaadlogaccess">CSS AAD Log Access Tracking Spreadsheet</a> so we may better understand how often we need access to these logs</small>
    </td>    
  </tr>
</table>

1. First step: find a user who you know is being locked out

   a. Bonus: if you know about when the first account lockout occurred will make things much easier and quicker for you ? but if the customer didn?t provide that info you don?t have to wait for it.

2. Find out when they started getting locked out a. Use this Jarvis query: https://jarvis-west.dc.ad.msft.net/185B88FE

   b. Filter by tenant ID

   c. Filter by username

      Note: only use the username not the full email or else you won?t get all of the events

   d. Look for first time they are locked out by changing the ?PreciseTimestamp? column to sort from oldest to newest

3. Find out WHY they were locked out

   a. Change time to the first account lockout (copy and paste from first lockout)

   b. Change to + - 1 hours

   c. Remove the ?a user account was locked out? scoping condition

   d. Search ? now look in the "Data4" column of the logs for that first locked out attempt. The 4 attempts before the user was locked out will tell the story 4. If you click on each event in Jarvis, there will be an error code to each event. Use this website to help understand, but here?s what you need to know

       a. 0x0 means no errors [successful]
       b. 0xC0000071 means they logged on with an expired password (possibly an old service account using their old password)
       c. 0xC000006A means they are logging on with a misspelled or bad password. This is when it /COULD/ be a spray attack
       d. 0xC0000234 means that they are attempting to log on with the account locked. This means they were locked out before that attempt.
       e. 0xC0000064 means an attempt to login to a username that does not exist was made.  This could also be a spray attack

4. The number of attempts will also give you an idea on whether this is automated or by human
5. To get a summary of the number of user's who are locked out (0xC0000234) and trying to sign or login attempts with invalid usernames (0xC0000064) try the following query:

    a. https://jarvis-west.dc.ad.msft.net/6D828269 

    Note: If there are a ton of signins with invalid usernames (0xC0000064) this could be a spray attack as well and customer should review AAD DS subnet NSG to verify TCP\3389 for RDP is not open to the public internet.

# Now we know why ? What should you do?

The failed attempts are happening mainly 2 causes.

1. Some source is constantly trying to attempt login with old passwords

2. MEDS managed domain is having issues with Sync

Below steps help identify each area

## Identify the source of the invalid logon attempts 

1. Use this template Jarvis query to identify the source of the bad logon attempts :
 https://jarvis-west.dc.ad.msft.net/BD01CDDE

**Note:**
Modify the query with customer specific data
* Change the **Time Range** to the approximate time user was locked out.
* Under **Scoping condition** change the `Role` value to use the customer's MEDS managed domain name
      (Or use the dropdown to change `Role` to `Tenant` and change the value to use the Entra ID tenant ID (directory id)
* Under **Filtering conditions** change the `AnyField` value condition to the account that was locked out.

     ![accountLockout.jpg](/.attachments/accountLockout-f812680f-43db-4865-a07c-21d20e47af44.jpg)

2. Run the query by selecting the magnifying glass button

3. Review the output:  Under the **EventDescription** column identify the source of the authentication requests that have locked out the account through the `Source Workstation` attribute in the output:

  ![AccountLockoutEvent.JPG](/.attachments/AccountLockoutEvent-c65d1106-fd4f-4bdc-b2b2-906afba11016.JPG)

**Note:**
If the 'Source Workstation' is not populated, then proceed with step 5

4. On the machine(s) identified in step 3 as source of the account lockouts, recommend customer check the following places for invalid stored credentials:
   
   * Windows Services: (Start -> Services.msc) review the "Log On As" column for the account
   *  Task Scheduler (Start -> taskschd.msc) review task history for failed logins using account.
   *  [Credentials Manager](
) (Control Panel -> User Accounts -> Credential Manager)
   *  Stored Network Credentials (Start -> Run -> Cmd -> "net use" to view stored credentials, then Start Run -> Cmd -> "net use * /delete" to delete stored credentials
   * Examining which applications and service are running on the client and stopping each to isolate the issue.
   * Clear Kerberos Cache (Start -> Run -> Admin command prompt -> "klist purge"
   * Use TCPView from Sysinternals or Netstat are also good for this kind of investigation, matching the process ID (PID) of a service or application that creates a socket connection with a bad password attempt in the Netlogon log of a DC [TCPView for Windows - Sysinternals | Microsoft Learn](https://learn.microsoft.com/sysinternals/downloads/tcpview)
   * A network trace from the client while reproducing the failed logon. For that purpose, you can use Netmon, Wireshark or Netsh (see example below):   

         **Using Netsh from cmd line:**

            netsh trace start capture=yes tracefile=c:\net.etl persistent=yes maxsize=4096
            <repro the issue>
            netsh trace stop

   
   Also, tools like [LockoutStatus.exe](https://www.microsoft.com/en-gb/download/details.aspx?id=15201) run from another domain joined workstation can be helpful in diagnosing source of lockouts as well.  [Public guide on using LockOutStatus.exe](https://community.spiceworks.com/how_to/48758-trace-the-source-of-a-bad-password-and-account-lockout-in-ad)

5. If you cannot identify the source of the bad logon attempts, raise an IcM to the EEE team to help identify the source that is sending the bad authentication requests.




##Identify the Sync issue

Sometimes the issue can be because Sync isn?t behaving properly which causes the passwords to not sync in time or fails to sync. In those cases we need to investigate whether its an issue syncing passwords.

1. Refer to the Password Sync TSG : https://www.csssupportwiki.com/index.php/curated:Azure_AD_Domain_Services_-_Sync_Troubleshooting

2. Otherwise you can also use this as a quick check on whether the password was sync?d

3. Jarvis queries a. https://jarvis-west.dc.ad.msft.net/3FDB3C08 b. https://jarvis-west.dc.ad.msft.net/746D9486

   Add Scoping conditions using either

   Role = <AADDS managed domain name>

   or Tenant = <TenantId> to filter for specific tenant

4. Look for the specific username on the client query side and see if it shows up in logs around the timeframe when password was updated and no failure shows up.

5. Use ASC to make sure that they do not have network configuration issues as it can block sync

# Escalating Account Lockout Issues
If there needs to be an escalation, please file an IcM to Azure Identity \ CID TA Triage for review by TA and submit to Microsoft Entra Domain Services/[NOT ENTRA ID] Triage with the following information.

    a. User info that is getting locked out
    b. TenantId and AADDS Managed Domain name
    c. ASC Link
    d. Jarvis links for identifying Account lockout source
    e. Jarvis links for identifying password sync issues
    f. Network trace ( https://aka.ms/networktrace )of the login failure from client machine

6. What will we do?

   a. We will enable extended logging on the DC and then port a bunch of information in a text file. From this text file we can usually find the source computer.
7. What we cannot do?

   i. We cannot stop this entity from attempting to log into their domain

   ii. We can?t unlock that specific account.

# What can a customer do to avoid this in the future?

1. Follow Up (Preview)Coming Soon Enable Security Audit for Microsoft Entra Domain Services so that customer can get some of that data and self-serve.

2. Edit the fine-grained password policy (FGPP) to be more lenient

   NOTE: this is a double-edged sword. If you are allowing more attempts, this makes it easier for spray attacks to occur. I would highly recommend for customers who are experiencing a spray attack to NOT relax their account lockout policies.

3. Lock down their managed domain by creating an NSG

4. Block access from the internet to their VMs
