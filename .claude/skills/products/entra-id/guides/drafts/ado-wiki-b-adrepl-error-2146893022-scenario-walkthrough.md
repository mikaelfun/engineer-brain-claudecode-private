---
source: ado-wiki
sourceRef: "Supportability/WindowsDirectoryServices/WindowsDirectoryServices:/AD Replication/Workflow: Common Solutions to Replication Failures/Error -2146893022: \"The target principal name is incorrect\"/Scenario walkthrough: ADREPL status -2146893022"
sourceUrl: "https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices?pagePath=%2FAD%20Replication%2FWorkflow%3A%20Common%20Solutions%20to%20Replication%20Failures%2FError%20-2146893022%3A%20%22The%20target%20principal%20name%20is%20incorrect%22%2FScenario%20walkthrough%3A%20ADREPL%20status%20-2146893022"
importDate: "2026-04-07"
type: troubleshooting-guide
---

<div id='cssfeedback-start'></div>

<span style="color:Orange">**CSS Feedback |**</span> [Did you like this page?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423199&Instance=423199&Feedback=1) or [Is there something to improve?](https://aka.ms/css-feedback?ID=CF8f362571&URL=https://dev.azure.com/Supportability/WindowsDirectoryServices/_wiki/wikis/WindowsDirectoryServices/423199&Instance=423199&Feedback=2)

___
<div id='cssfeedback-end'></div>

**Summary:** This guide helps troubleshoot and resolve AD replication error -2146893022, "The target principal name is incorrect," using tools like `repadmin.exe` and `nltest.exe`.

## **Why is time important to Active Directory?**

It's not just about Kerberos and authentication.

- AD replication errors -2146893022, 8614, and 8606 routinely go hand in hand. When all are seen together (or at least the first two), it is a good indicator that the domain controller's time changed by greater than the tombstone lifetime.
  - Consider:
    - Machine account passwords change every 30 days by default.
    - Tombstone Lifetime is usually 60 or 180 days.
- Pay attention to:
  - Domain controllers (DCs) without time safeguards in place.
  - Virtualized DC guests configured to sync time with their hosts.
- For more information, see "Fixing When Your Domain Traveled Back In Time, the Great System Time Rollback to the Year 2000" article linked to in the References section.

## **Scenario**

DC2 is failing to replicate from DC1 with error -2146893022, "The target principal name is incorrect." You will use DC1 and DC2 in this exercise.

## **Task 1 - Use repadmin and the system event log to see the symptoms of this problem**

Use one of the methods from exercise 1 to review the replication status for DC1. Verify the last replication status result from DC2 lists error -2146893022 / the target principal name is incorrect.

Output from `repadmin /showrepl DC2`:
```plaintext
DC=root,DC=contoso,DC=com
    Boulder\DC1 via RPC
        DSA object GUID: 70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e
        Last attempt @ 2013-12-09 12:53:48 failed, result -2146893022 (0x80090322):
            The target principal name is incorrect.
        17 consecutive failure(s).
        Last success @ 2012-11-26 14:50:47.
```

**Test basic LDAP connectivity from DC2**

- From DC2, attempt to use `repadmin` to bind to DC1:
  - `Repadmin /bind DC1`
  - What error is displayed?
```plaintext
"LDAP Error 82(0x52): Local Error"
```

- Attempt to initiate AD replication from DC1 to DC2 using `repadmin`:
  - `Repadmin /replicate dc2 dc1 "dc=root,dc=contoso,dc=com"`
  - `Repadmin /replicate` syntax:
```plaintext
/replicate <Dest_DCs> <Source DC> <Naming Context> [/force] [/async] [/full] [/addref] [/readonly]
```
```plaintext
DsReplicaSync() failed with status -2146893022 (0x80090322):
The target principal name is incorrect
```

On DC2, open up the event viewer (`eventvwr.msc`), and review the system event log for event ID 4. You can also see this event via Server Manager's Local Server node, EVENTS pane on DC2.

![image.png](/.attachments/image-13124a79-1ac7-4a0d-8ffc-f64ddcdf2512.png)

- Among other things, the text of event ID 4 indicates the problem can be caused by, "the target service account password is different than what is configured on the Kerberos Key Distribution Center for that target service."

For this scenario, that means:
**DC1's computer account password is different than the password stored in AD for DC1 on the KDC (DC2)**

## **Task 2 - Determine cause of the AD replication failure**

In this task, you will use `repadmin /showobjmeta` to determine if DC1's computer account password matches what is stored on DC2.

**TIP:**
**How you can quickly identify if attributes on a given object are the same on a given set of DCs: repadmin /showobjmeta**
- The `/showobjmeta` parameter is used to display the replication metadata for a given object. If the attribute values of a given object are in sync amongst DCs, the version information reported in the output will be the same when compared with the replication metadata from other DCs.

Perform this task on DC1.
- Open a command prompt on DC1.
- Obtain replication metadata of the source DC's computer object from both DCs:
  - `Repadmin /showobjmeta dc1 "cn=dc1,ou=domain controllers,dc=root,dc=contoso,dc=com" >dc1objmeta.txt`
  - `Repadmin /showobjmeta dc2 "cn=dc1,ou=domain controllers,dc=root,dc=contoso,dc=com" >>dc1objmeta.txt`

- Open up the `dc1objmeta.txt` file with Notepad.exe and observe the version number differences for the password-related attributes: (dBCSPwd, UnicodePWD, NtPwdHistory, PwdLastSet, and lmPwdHistory). The version number is the second to last column with the heading of "Ver".

**Table 1: dc1objmeta.txt - partial repadmin /showobjmeta output of DC1's computer object**

| DC1 object replication metadata according to: | Ver | Attribute |
|--|--|--|
| DC1 | 19 | dBCSPwd  |
| DC2 | 11 | dBCSPwd  |

The replication metadata reveals that DC2 has old password information for DC1. The Kerberos operation failed because DC1 was unable to decrypt the Service Ticket presented by DC2. Review the Kerberos details section for Exercise 2 in the appendix for more information.

## **Task 3 - Resolve the AD replication failure**

The KDC running on DC2 cannot be used for Kerberos operations with DC1 since DC2 has old password information for DC1. In this task, you will force DC2 to use the KDC on DC1 so that the replication operation will complete.

Perform this task on DC2:
- From DC2 stop the Kerberos Key Distribution Center service:
  - `Net stop kdc`
- Initiate replication of the Root partition using `repadmin`:
  - `Repadmin /replicate dc2 dc1 "dc=root,dc=contoso,dc=com"`
  - If replication still fails, clear any cached Kerberos tickets for the Local System account on DC2 using the `klist.exe` utility from a command prompt:
    - `Klist.exe -li 0x3e7 purge`
    - (The logon ID for Local System is 0x3e7)

If replication of the root partition was successful, DC2 now has the updated password information for DC1, so DC2 can now be used for KDC operations. You can confirm this if you like by running the two `repadmin /showobjmeta` commands from task 2.

- Start the Kerberos Key Distribution Center service on **DC2**:
  - `Net start kdc`
- **An alternative method to resolve this issue**:
  - In this exercise, we simply stop the KDC to force DC2 to use DC1 as the KDC. We know this will work because DC1 has the updated password. This is a small environment, so doing the same thing in a larger environment may not be an option since we cannot control what new KDC will be contacted. If all other KDCs are up to date, this will work. Another method to resolve this is to reset DC1's computer account password manually and specify DC2 as the DC to update with the information. The following command will cause DC1 to reset its computer account password and update DC2 with this information:
    - On **DC1** open a command prompt and enter the following command:
      - `Netdom resetpwd /server:192.168.10.2 /userd:root\administrator /passwordd:adrepl123!`
      - The command instructs DC1 to change its password and tell the DC specified with the `/server` parameter the new password.

## **Additional background info and log details**

The Kerberos client received a `KRB_AP_ERR_MODIFIED` error from the server dc1$. The target name used was `E3514235-4B06-11D1-AB04-00C04FC2DCD2/70ff33ce-2f41-4bf4-b7ca-7fa71d4ca13e/root.contoso.com@root.contoso.com`. This indicates that the target server failed to decrypt the ticket provided by the client. This can occur when the target server principal name (SPN) is registered on an account other than the account the target service is using. Ensure that the target SPN is only registered on the account used by the server. This error can also happen if the target service account password is different than what is configured on the Kerberos Key Distribution Center for that target service. Ensure that the service on the server and the KDC are both configured to use the same password. If the server name is not fully qualified, and the target domain (ROOT.CONTOSO.COM) is different from the client domain (ROOT.CONTOSO.COM), check if there are identically named server accounts in these two domains, or use the fully-qualified name to identify the server.

## **Kerberos details**

| Operation  | AD replication attempt from DC1 to DC2 fails with -2146893022 |
|--|--|
| Kerberos client | DC2 |
| Kerberos target | DC1 |
| KDC  | DC2 |

- This replication error occurs because the source DC (DC1 - Kerberos target) failed to verify the AP request that DC2 sent. Specifically, the source DC (DC1) attempted to decrypt the service ticket in the AP request and failed.
- The Service Ticket was encrypted by the KDC (DC2) with the password hash of DC1's computer account stored in AD (the KDC's version of the password).
- The Service Ticket decryption takes place on the Kerberos target (DC1). It attempts to decrypt the ticket with its actual password (which differs from what is stored in AD on the KDC).
- Since the Service Ticket was encrypted with the wrong computer account password, the operation fails.

For more information, see:
- [Troubleshooting AD Replication error -2146893022: The target principal name is incorrect](http://support.microsoft.com/kb/2090913)


**Repadmin /bind failure log details**

| Troubleshooting Operation  | Repadmin /bind dc2 |
|--|--|
| Kerberos client | Win8Client |
| Kerberos target | DC2 |
| KDC  | DC1 |

Network trace of the LDAP bind failure:

![image.png](/.attachments/image-c68f7a53-00e0-447d-81e5-13342eb0f5eb.png)

Figure 3 Network trace of LDAP bind failure:

![image.png](/.attachments/image-67976b93-a262-427f-8783-08298028b2d9.png)

Figure 4 Network trace with Netmon 3.4 Authentication traffic filter applied:

![image.png](/.attachments/image-2af6c3a0-4e0a-44db-b2a0-ea2712c87a3d.png)

Figure 5 Kerberos error in LDAP bind response
```plaintext
System event log
Log Name:      System
Source:        Microsoft-Windows-Security-Kerberos
Event ID:      4
Level:         Error
Computer:      win8client.root.contoso.com
Description:
The Kerberos client received a KRB_AP_ERR_MODIFIED error from the server dc2$. The target name used was LDAP/DC2.root.contoso.com/root.contoso.com@ROOT.CONTOSO.COM. This indicates that the target server failed to decrypt the ticket provided by the client. This can occur when the target server principal name (SPN) is registered on an account other than the account the target service is using. Ensure that the target SPN is only registered on the account used by the server. This error can also happen if the target service account password is different than what is configured on the Kerberos Key Distribution Center for that target service. Ensure that the service on the server and the KDC are both configured to use the same password. If the server name is not fully qualified, and the target domain (ROOT.CONTOSO.COM) is different from the client domain (ROOT.CONTOSO.COM), check if there are identically named server accounts in these two domains, or use the fully-qualified name to identify the server.
```