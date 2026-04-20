# AVD 连接通用 — Troubleshooting Workflow

**Scenario Count**: 15
**Generated**: 2026-04-18

---

## Scenario 1: AVD RemoteApp keeps asking for credentials when launching se...
> Source: OneNote | Applicable: ✅

### Troubleshooting Steps
- By design. Workaround: Keep at least one RemoteApp open to maintain Active session. Configure SSO/credential delegation. Educate users this is expected

**Root Cause**: Expected behavior. When all RemoteApps close, shared session enters Disconnected state. New RemoteApp launch treated as new connection requiring authentication

## Scenario 2: HTTP 5xx server error when using Windows 365 Power Platform ...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- 1) Retry operation after a few minutes for transient issues
- 2) If persists, create ICM to CloudPC Service/Windows 365 IT Pro Experience with: full error response, request-id, client-request-id, timestamp, connector type, operation, tenant ID
- 3) Use Power Automate flow checker to view error codes.

**Root Cause**: Backend service issues, service deployment/configuration problems, or transient infrastructure failures

## Scenario 3: Server or remote session hang, slow system/application perfo...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Phase 1: Enable Group Policy 'Delete cached copies of roaming profiles' (Computer Configuration > Administrative Templates > System > User Profiles) to prevent future accumulation. Phase 2: Download FWCLEAN.EXE + FWCLEAN.PS1 from https://aka.ms/fwclean, run on each affected server to clean up leftover rules. Consider scheduling periodic cleanup via scheduled task.

**Root Cause**: Firewall rules accumulate in the AppIso and IfIso registry keys over time as different users log on. Rules are not purged when user profiles are deleted, causing registry bloat.

## Scenario 4: VPN disconnect on Cloud PC; manual reconnect works
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Use split tunneling; exempt core RD traffic

**Root Cause**: VPN IKEV2 changes default route or End Existing Traffic setting

## Scenario 5: VPN disconnect; reconnect fails until CPC reboot
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Allow required W365 endpoints through VPN; use split tunneling

**Root Cause**: VPN tunnel blocks all traffic preventing AVD endpoint access

## Scenario 6: ReverseConnectInvalidCertificate error when connecting to AV...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Diagnostic steps: 1) Query DiagActivity for error details (SessionHostIP). 2) Query RDPCoreTSEventLog (TaskName='HttpConnect') to verify gateway resolution. 3) Query RDInfraTrace (Msg contains 'proxy') to find X-ProxyUser-IP. 4) Check if the proxy IP is a Microsoft IP via csstoolkit.azurewebsites.net/Home/MicrosoftIPs. 5) If non-MS IP found, try accessing https://<IP> to identify the appliance. Customer must fix or remove the proxy/tunnel from the AVD connection path.

**Root Cause**: A third-party network appliance (e.g. Palo Alto firewall/proxy) intercepts the reverse connect traffic between the session host and AVD gateway, causing a certificate mismatch. The proxy IP is visible in RDInfraTrace (Msg contains 'proxy') but not in basic DiagActivity.

## Scenario 7: X224SecFilterFailedActivate error during AVD connection. Use...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Add 'Remote Desktop' as the value for the SelfSignedCertStore registry key at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations, then restart TermService (termsvc). Verify with MSRD-Collect: check Certificates-RemoteDesktop.txt to confirm certificate is present. Diagnostic Kusto: query RDInfraTrace (Msg contains 'cert') for 'RetrieveSerializedCertificate failed'; query RDPCoreTSEventLog for X224SecFilterFailedActivate and SecurityFilter events.

**Root Cause**: The RDP listener certificate is missing - the SelfSignedCertStore registry key at HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations is empty. Without a valid certificate, the security filter cannot activate and x224 negotiation fails.

## Scenario 8: Could not connect to remote PC because of a security error
> Source: MS Learn | Applicable: ✅

### Troubleshooting Steps
- Fix the security policy to include appropriate user groups

**Root Cause**: Allow log on through Remote Desktop Services policy misconfigured

## Scenario 9: Cannot connect to remote computer - 'a security package erro...
> Source: ADO Wiki | Applicable: ✅

### Troubleshooting Steps
- Check for TLS or Cipher Mismatch. Reference: https://dev.azure.com/Supportability/WindowsVirtualDesktop/_wiki/wikis/WindowsVirtualDesktop/464991/TLS-or-Cipher-Mismatch

**Root Cause**: TLS or Cipher Mismatch between the RDP client and the session host

## Scenario 10: WVD gateway error. Kusto shows Failed to add user to Remote ...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Use actual domain UPN instead of email account.

**Root Cause**: UPN translation fails in cross-domain trust scenarios.

## Scenario 11: Few users unable to login to AAD joined AVD VMs. Error: 'Sig...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Remove duplicate UPN entries in on-prem AD and reset passwords for affected users.

**Root Cause**: Duplicate UPN entries for affected user accounts in on-prem AD synced via Azure AD Connect.

## Scenario 12: Few users unable to login to AAD joined AVD VMs. Error: Sign...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Remove the duplicate UPN entries in on-prem AD and reset the password for the affected users.

**Root Cause**: Duplicate UPN entries for the affected user accounts in on-prem AD synced to Azure AD via Azure AD Connect.

## Scenario 13: Customer has Azure monitor for AVD set up and has LA queries...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Resolution : &nbsp; 
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

**Root Cause**: Expected behavior.

## Scenario 14: User Unable to connect to AVD with Below Error.  &quot;A use...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Customer
removed the user from few unnecessary security group that fixed the issue.

**Root Cause**: User was
part of too many security groups. &nbsp; When
same user tried connecting with direct RDP we got below error. &nbsp; &quot;During
a logon attempt, the user's security context accumulated too many security IDs.
Please try again or consult your system administrator.&quot; &nbsp; The issue occurs
when the logon user is an explicit or transitive member of about 1,010 or more
security groups.  Logging on a user account fails - Windows Server | Microsoft Learn

## Scenario 15: After creating a new WVD Host Pool, users see a Gateway erro...
> Source: ContentIdea | Applicable: ✅

### Troubleshooting Steps
- Redeploy the Host Pool using an "RDS Owner" account sourced from the Windows Server AD.

**Root Cause**: The AAD account used as an RDS Owner for the tenant is not associated with a Windows Server AD account.
