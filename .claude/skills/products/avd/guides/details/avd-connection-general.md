# AVD AVD 连接通用 - Comprehensive Troubleshooting Guide

**Entries**: 15 | **Generated**: 2026-04-18

---

## Troubleshooting Flow

### Phase 1: Initial Assessment

> Sources: ADO Wiki, ContentIdea, MS Learn, OneNote

**Symptom matching:**

| Condition | Meaning | Next Action |
|-----------|---------|-------------|
| AVD RemoteApp keeps asking for credentials when launching second Remot... | Expected behavior. When all RemoteApps close, shared session enters Di... | By design. Workaround: Keep at least one RemoteApp open to maintain Ac... |
| HTTP 5xx server error when using Windows 365 Power Platform connector ... | Backend service issues, service deployment/configuration problems, or ... | 1) Retry operation after a few minutes for transient issues. 2) If per... |
| Server or remote session hang, slow system/application performance, sl... | Firewall rules accumulate in the AppIso and IfIso registry keys over t... | Phase 1: Enable Group Policy 'Delete cached copies of roaming profiles... |
| VPN disconnect on Cloud PC; manual reconnect works | VPN IKEV2 changes default route or End Existing Traffic setting | Use split tunneling; exempt core RD traffic |
| VPN disconnect; reconnect fails until CPC reboot | VPN tunnel blocks all traffic preventing AVD endpoint access | Allow required W365 endpoints through VPN; use split tunneling |
| ReverseConnectInvalidCertificate error when connecting to AVD session ... | A third-party network appliance (e.g. Palo Alto firewall/proxy) interc... | Diagnostic steps: 1) Query DiagActivity for error details (SessionHost... |
| X224SecFilterFailedActivate error during AVD connection. Users cannot ... | The RDP listener certificate is missing - the SelfSignedCertStore regi... | Add 'Remote Desktop' as the value for the SelfSignedCertStore registry... |
| Could not connect to remote PC because of a security error | Allow log on through Remote Desktop Services policy misconfigured | Fix the security policy to include appropriate user groups |
| Cannot connect to remote computer - 'a security package error occurred... | TLS or Cipher Mismatch between the RDP client and the session host | Check for TLS or Cipher Mismatch. Reference: https://dev.azure.com/Sup... |
| WVD gateway error. Kusto shows Failed to add user to Remote Desktop Us... | UPN translation fails in cross-domain trust scenarios. | Use actual domain UPN instead of email account. |
| Few users unable to login to AAD joined AVD VMs. Error: 'Sign in faile... | Duplicate UPN entries for affected user accounts in on-prem AD synced ... | Remove duplicate UPN entries in on-prem AD and reset passwords for aff... |
| Few users unable to login to AAD joined AVD VMs. Error: Sign in failed... | Duplicate UPN entries for the affected user accounts in on-prem AD syn... | Remove the duplicate UPN entries in on-prem AD and reset the password ... |
| Customer has Azure monitor for AVD set up and has LA queries configure... | Expected behavior. | Resolution : &nbsp;   It is      expected for AVD agent to disconnect ... |
| User Unable to connect to AVD with Below Error.  &quot;A user account ... | User was part of too many security groups. &nbsp; When same user tried... | Customer removed the user from few unnecessary security group that fix... |
| After creating a new WVD Host Pool, users see a Gateway error when the... | The AAD account used as an RDS Owner for the tenant is not associated ... | Redeploy the Host Pool using an "RDS Owner" account sourced from the W... |

### Phase 2: Detailed Investigation

#### Entry 1: AVD RemoteApp keeps asking for credentials when launching se...
> Source: OneNote | ID: avd-onenote-051 | Score: 8.5

**Symptom**: AVD RemoteApp keeps asking for credentials when launching second RemoteApp after closing the first one

**Root Cause**: Expected behavior. When all RemoteApps close, shared session enters Disconnected state. New RemoteApp launch treated as new connection requiring authentication

**Solution**: By design. Workaround: Keep at least one RemoteApp open to maintain Active session. Configure SSO/credential delegation. Educate users this is expected

> 21V Mooncake: Applicable

#### Entry 2: HTTP 5xx server error when using Windows 365 Power Platform ...
> Source: ADO Wiki | ID: avd-ado-wiki-255 | Score: 8.0

**Symptom**: HTTP 5xx server error when using Windows 365 Power Platform connector actions or triggers - internalServerError or serviceException

**Root Cause**: Backend service issues, service deployment/configuration problems, or transient infrastructure failures

**Solution**: 1) Retry operation after a few minutes for transient issues. 2) If persists, create ICM to CloudPC Service/Windows 365 IT Pro Experience with: full error response, request-id, client-request-id, timestamp, connector type, operation, tenant ID. 3) Use Power Automate flow checker to view error codes.

> 21V Mooncake: Applicable

#### Entry 3: Server or remote session hang, slow system/application perfo...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-004 | Score: 8.0

**Symptom**: Server or remote session hang, slow system/application performance, slow logons, black screen when logging in, Start menu issues on Windows Server 2016/2019 RDS/AVD servers or Windows 10/11 multi-session VMs. Large number of registry keys accumulated under FirewallPolicy RestrictedServices AppIso FirewallRules and FirewallPolicy RestrictedInterfaces IfIso FirewallRules.

**Root Cause**: Firewall rules accumulate in the AppIso and IfIso registry keys over time as different users log on. Rules are not purged when user profiles are deleted, causing registry bloat.

**Solution**: Phase 1: Enable Group Policy 'Delete cached copies of roaming profiles' (Computer Configuration > Administrative Templates > System > User Profiles) to prevent future accumulation. Phase 2: Download FWCLEAN.EXE + FWCLEAN.PS1 from https://aka.ms/fwclean, run on each affected server to clean up leftover rules. Consider scheduling periodic cleanup via scheduled task.

> 21V Mooncake: Applicable

#### Entry 4: VPN disconnect on Cloud PC; manual reconnect works
> Source: ADO Wiki | ID: avd-ado-wiki-a-r12-002 | Score: 8.0

**Symptom**: VPN disconnect on Cloud PC; manual reconnect works

**Root Cause**: VPN IKEV2 changes default route or End Existing Traffic setting

**Solution**: Use split tunneling; exempt core RD traffic

> 21V Mooncake: Applicable

#### Entry 5: VPN disconnect; reconnect fails until CPC reboot
> Source: ADO Wiki | ID: avd-ado-wiki-a-r12-003 | Score: 8.0

**Symptom**: VPN disconnect; reconnect fails until CPC reboot

**Root Cause**: VPN tunnel blocks all traffic preventing AVD endpoint access

**Solution**: Allow required W365 endpoints through VPN; use split tunneling

> 21V Mooncake: Applicable

#### Entry 6: ReverseConnectInvalidCertificate error when connecting to AV...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-008 | Score: 8.0

**Symptom**: ReverseConnectInvalidCertificate error when connecting to AVD session host. Proxy/tunnel IP appears in Kusto traces (X-ProxyUser-IP) that is different from client IP and VM IP, but basic diagnostics do not show proxy involvement.

**Root Cause**: A third-party network appliance (e.g. Palo Alto firewall/proxy) intercepts the reverse connect traffic between the session host and AVD gateway, causing a certificate mismatch. The proxy IP is visible in RDInfraTrace (Msg contains 'proxy') but not in basic DiagActivity.

**Solution**: Diagnostic steps: 1) Query DiagActivity for error details (SessionHostIP). 2) Query RDPCoreTSEventLog (TaskName='HttpConnect') to verify gateway resolution. 3) Query RDInfraTrace (Msg contains 'proxy') to find X-ProxyUser-IP. 4) Check if the proxy IP is a Microsoft IP via csstoolkit.azurewebsites.net/Home/MicrosoftIPs. 5) If non-MS IP found, try accessing https://<IP> to identify the appliance. Customer must fix or remove the proxy/tunnel from the AVD connection path.

> 21V Mooncake: Applicable

#### Entry 7: X224SecFilterFailedActivate error during AVD connection. Use...
> Source: ADO Wiki | ID: avd-ado-wiki-a-r3-010 | Score: 8.0

**Symptom**: X224SecFilterFailedActivate error during AVD connection. Users cannot connect. ErrorInternal=true, ErrorSource=Stack. x224 negotiation fails. Stack trace shows ActivateInternal failure in rdpencsecfilter.cpp related to certificate error.

**Root Cause**: The RDP listener certificate is missing - the SelfSignedCertStore registry key at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations is empty. Without a valid certificate, the security filter cannot activate and x224 negotiation fails.

**Solution**: Add 'Remote Desktop' as the value for the SelfSignedCertStore registry key at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations, then restart TermService (termsvc). Verify with MSRD-Collect: check Certificates-RemoteDesktop.txt to confirm certificate is present. Diagnostic Kusto: query RDInfraTrace (Msg contains 'cert') for 'RetrieveSerializedCertificate failed'; query RDPCoreTSEventLog for X224SecFilterFailedActivate and SecurityFilter events.

> 21V Mooncake: Applicable

#### Entry 8: Could not connect to remote PC because of a security error
> Source: MS Learn | ID: avd-mslearn-061 | Score: 7.0

**Symptom**: Could not connect to remote PC because of a security error

**Root Cause**: Allow log on through Remote Desktop Services policy misconfigured

**Solution**: Fix the security policy to include appropriate user groups

> 21V Mooncake: Applicable

#### Entry 9: Cannot connect to remote computer - 'a security package erro...
> Source: ADO Wiki | ID: avd-ado-wiki-0814 | Score: 7.0

**Symptom**: Cannot connect to remote computer - 'a security package error occurred at the transport layer' error when connecting to AVD session host

**Root Cause**: TLS or Cipher Mismatch between the RDP client and the session host

**Solution**: Check for TLS or Cipher Mismatch. Reference: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464991/TLS-or-Cipher-Mismatch

> 21V Mooncake: Applicable

#### Entry 10: WVD gateway error. Kusto shows Failed to add user to Remote ...
> Source: ContentIdea | ID: avd-contentidea-kb-009 | Score: 6.5

**Symptom**: WVD gateway error. Kusto shows Failed to add user to Remote Desktop Users group: Win32.ERROR_NO_SUCH_MEMBER.

**Root Cause**: UPN translation fails in cross-domain trust scenarios.

**Solution**: Use actual domain UPN instead of email account.

> 21V Mooncake: Applicable

#### Entry 11: Few users unable to login to AAD joined AVD VMs. Error: 'Sig...
> Source: ContentIdea | ID: avd-contentidea-kb-067 | Score: 6.5

**Symptom**: Few users unable to login to AAD joined AVD VMs. Error: 'Sign in failed. Please check your user name and password.' RDSTLS authentication error code 1326.

**Root Cause**: Duplicate UPN entries for affected user accounts in on-prem AD synced via Azure AD Connect.

**Solution**: Remove duplicate UPN entries in on-prem AD and reset passwords for affected users.

> 21V Mooncake: Applicable

#### Entry 12: Few users unable to login to AAD joined AVD VMs. Error: Sign...
> Source: ContentIdea | ID: avd-contentidea-kb-072 | Score: 6.5

**Symptom**: Few users unable to login to AAD joined AVD VMs. Error: Sign in failed. Please check your user name and password. RD console shows LogonFailed(10006) with RDSTLS authentication error code=1326.

**Root Cause**: Duplicate UPN entries for the affected user accounts in on-prem AD synced to Azure AD via Azure AD Connect.

**Solution**: Remove the duplicate UPN entries in on-prem AD and reset the password for the affected users.

> 21V Mooncake: Applicable

#### Entry 13: Customer has Azure monitor for AVD set up and has LA queries...
> Source: ContentIdea | ID: avd-contentidea-kb-130 | Score: 6.5

**Symptom**: Customer has Azure monitor
for AVD set up and has LA queries configured to send email alerts as soon as
the VM goes unavailable. However customer has been
receiving false/positive alters post the configuration. Alert email has been
sent stating that the VM has been unavailable but the status of the actual VM
in AVD hostpool was always available.  There were no connection
issues/impacts reported during the mentioned time. There are no service restarts
or any other alarming errors on the VM event logs on the specified time. Kusto queries also confirm
that the VM has been available. It is confirmed that the VMs
status was available but LA is reporting the VM as unavailable.

**Root Cause**: Expected behavior.

**Solution**: Resolution : &nbsp; 
 It is
     expected for AVD agent to disconnect &amp; re-connect to the back AVD
     service momentarily for few secs. This is
     by-design and does not impact the production and moreover the VM would
     still show as available. However
     LA triggers an alert for this expected disconnect/re-connect.   
 
  &nbsp; To
avoid this, PG has suggested to change the LA query in way that it only alerts
VMs that have been in unavailable state for over 2mins. This would eliminate
the expected false positives alerts &amp; provide an alert only when the VM is
really impacted &amp; unavailable.

> 21V Mooncake: Applicable

#### Entry 14: User Unable to connect to AVD with Below Error.  &quot;A use...
> Source: ContentIdea | ID: avd-contentidea-kb-136 | Score: 6.5

**Symptom**: User
Unable to connect to AVD with Below Error.  &quot;A user account restriction (for
example, a time-of-day restriction) is preventing you from logging on. For
assistance, contact your system administrator or technical
support.&quot;,&quot;Error code: 0xc07&quot;, &quot;Extended error code:
0x600&quot; &nbsp; If we
check the activity id in Kusto these are Error code we could see.  
 
  
  ErrorSource 
  
  
  ReportedBy 
  
  
  ErrorOperation 
  
  
  ErrorCode 
  
  
  ErrorInternal 
  
  
  ErrorCodeSymbolic 
  
  
  ErrorMessage 
  
 
 
  
  RDStack 
  
  
  RDStack 
  
  
  Authentication 
  
  
  81 
  
  
  False 
  
  
  AuthenticationFailed 
  
  
  Authentication
  failed. See code for details. Error code: 0xd000006e. 
  
  &nbsp;

**Root Cause**: User was
part of too many security groups. &nbsp; When
same user tried connecting with direct RDP we got below error. &nbsp; &quot;During
a logon attempt, the user's security context accumulated too many security IDs.
Please try again or consult your system administrator.&quot; &nbsp; The issue occurs
when the logon user is an explicit or transitive member of about 1,010 or more
security groups.  Logging on a user account fails - Windows Server | Microsoft Learn

**Solution**: Customer
removed the user from few unnecessary security group that fixed the issue.

> 21V Mooncake: Applicable

#### Entry 15: After creating a new WVD Host Pool, users see a Gateway erro...
> Source: ContentIdea | ID: avd-contentidea-kb-005 | Score: 6.5

**Symptom**: After creating a new WVD Host Pool, users see a Gateway error when they try to connect.

**Root Cause**: The AAD account used as an RDS Owner for the tenant is not associated with a Windows Server AD account.

**Solution**: Redeploy the Host Pool using an "RDS Owner" account sourced from the Windows Server AD.

> 21V Mooncake: Applicable

### Phase 3: Kusto Diagnostics

> Refer to Kusto skill references for relevant queries.
