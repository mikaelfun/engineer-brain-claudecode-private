# DEFENDER Defender for Identity (MDI) — Comprehensive Troubleshooting Guide

**Entries**: 21 | **Draft sources**: 0 | **Kusto queries**: 0
**Generated**: 2026-04-07

---

## Troubleshooting Flow

### Phase 1: Mdi
> Sources: mslearn

**1. Defender for Identity sensor service fails to start with error: CreateLdapConnectionAsync failed to retrieve group managed service account password**

- **Root Cause**: Domain controller lacks rights to access the gMSA account password, or the gMSA was not added to the PrincipalsAllowedToRetrieveManagedPassword security group
- **Solution**: Verify gMSA permissions with Get-ADServiceAccount; add DC or security group to PrincipalsAllowedToRetrieveManagedPassword; reboot DC or purge Kerberos ticket (klist -li 0x3e7 purge)
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**2. Defender for Identity sensor installation fails with 'The sensor failed to register due to licensing issues' (LicenseInvalid) when using a proxy**

- **Root Cause**: Proxy responds with HTTP 401/403 instead of 407 during authentication; sensor misinterprets this as a licensing error rather than proxy auth failure
- **Solution**: Ensure sensor can browse to *.atp.azure.com through the configured proxy without authentication; configure proxy bypass for Defender for Identity endpoints
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**3. Defender for Identity sensor installation fails with 'The sensor failed to connect to service' connection error**

- **Root Cause**: Trusted root certification authority certificates (DigiCert Global Root G2 for commercial, DigiCert Global Root CA for GCC High) required by Defender for Identity are missing from the local machine certificate store
- **Solution**: Verify certificates with Get-ChildItem -Path 'Cert:\LocalMachine\Root'; download and install the missing DigiCert root certificate using Import-Certificate cmdlet
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**4. Defender for Identity silent installation via PowerShell fails with: Unexpected token '/quiet' in expression or statement**

- **Root Cause**: Missing the ./ prefix when running the sensor setup executable in PowerShell
- **Solution**: Use the complete command with ./ prefix: ./"Azure ATP sensor Setup.exe" /quiet NetFrameworkCommandLineArguments="/q" AccessKey="<Access Key>"
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**5. Defender for Identity sensor on VMware VM shows health alerts: 'Some network traffic is not being analyzed' and 'Network configuration mismatch for sensors running on VMware'**

- **Root Cause**: VMware Guest OS NIC has IPv4 TSO Offload / Large Send Offload (LSO) enabled, causing configuration mismatch with MDI sensor requirements
- **Solution**: Disable IPv4 TSO Offload in VM NIC settings; run Disable-NetAdapterLso -Name {adapter-name}; may require VM restart
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**6. Defender for Identity sensor installation fails with 'ApplyInternal failed two way SSL connection to service'**

- **Root Cause**: Registry values SystemDefaultTlsVersions and SchUseStrongCrypto under .NET Framework v4.0.30319 are not set to their default value of 1, or SSL inspection proxy is interfering
- **Solution**: Set both SystemDefaultTlsVersions and SchUseStrongCrypto to DWORD 1 in HKLM\SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319 and HKLM\SOFTWARE\Microsoft\.NETFramework\v4.0.30319
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**7. Defender for Identity sensor installation fails on Windows Server 2019 with KB5009557 or hardened EventLog permissions with: System.UnauthorizedAccessException**

- **Root Cause**: Hardened EventLog permissions or KB5009557 security update restricts the sensor installation process
- **Solution**: Install sensor via PSExec: psexec -s -i; or create a Scheduled Task configured to run as LocalSystem
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**8. Defender for Identity sensor installation fails with error 0x80070643 'Failed to install MSI package'**

- **Root Cause**: Installation process cannot reach Defender for Identity cloud services (*.atp.azure.com) for sensor registration due to network/proxy issues
- **Solution**: Ensure sensor can browse to *.atp.azure.com directly or through proxy; set proxy via command line with ProxyUrl/ProxyUserName/ProxyUserPassword parameters
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**9. Defender for Identity workspace creation fails with 'a security group with the same name already exists in Microsoft Entra ID'**

- **Root Cause**: Previous MDI workspace license expired and was deleted, but associated Entra ID groups (Azure ATP *Administrators/Viewers/Users) were not cleaned up
- **Solution**: Rename old groups in Entra ID > Groups by adding ' - old' suffix, then create new workspace in Microsoft Defender portal
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**10. Defender for Identity sensor fails to enumerate event logs; limited security alerts with EventLogException: The handle is invalid**

- **Root Cause**: DACL on Security Event Log restricts access by the AATPSensor service Local Service account
- **Solution**: Add DACL entry (A;;0x1;;;S-1-5-80-818380073-2995186456-1411405591-3990468014-3617507088) to Security Event Log; verify with wevtutil.exe gl security; check if configured by GPO
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**11. Defender for Identity sensor installation fails with COMException 0x80090008 NTE_BAD_ALGID: Invalid algorithm specified**

- **Root Cause**: Certificate management client (e.g., Entrust Entelligence Security Provider) prevents the sensor from creating a self-signed certificate
- **Solution**: Uninstall certificate management client, install MDI sensor, then reinstall certificate management client; note self-signed cert renews every 2 years, same issue may recur
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**12. MDI health alert: Sensor stopped communicating - no data received from sensor for over 5 minutes**

- **Root Cause**: Network issue between sensor and MDI cloud service; router/firewall blocking communication; or server restart exceeding acceptable time frame
- **Solution**: Check that communication between sensor and MDI cloud service is not blocked by routers or firewalls; verify connectivity to *.atp.azure.com
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**13. MDI health alert: Directory services user credentials are incorrect**

- **Root Cause**: Directory service account username/password/domain configured incorrectly in MDI settings; for gMSA accounts prerequisites not met
- **Solution**: Verify username password and domain in Directory services config page; for gMSA verify all prerequisites per MDI documentation
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**14. MDI health alert: Low success rate of active name resolution - IP to device name resolution failing >90%**

- **Root Cause**: Required ports (135 for NTLM over RPC, 137 for NetBIOS) not open for inbound from sensors; reverse DNS lookup zones not enabled
- **Solution**: Open port 135 (NTLM/RPC) and port 137 (NetBIOS) inbound from MDI sensors; verify sensors can reach DNS server with Reverse Lookup Zones enabled
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**15. MDI health alert: No traffic received from domain controller - standalone sensor receives no mirrored traffic**

- **Root Cause**: Port mirroring from DCs to standalone MDI sensor not configured or not working; Receive Segment Coalescing (RSC) enabled on capture NIC
- **Solution**: Verify port mirroring on network devices; disable Receive Segment Coalescing (IPv4/IPv6) in sensor capture NIC Advanced Settings
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**16. MDI health alert: Read-only user password expired - all sensors stop running no new data collected**

- **Root Cause**: The directory service account password used for LDAP queries against AD has expired
- **Solution**: Change domain connectivity password and update Directory Service account password in MDI settings; monitor password-to-expire-shortly warning (30-day advance)
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**17. MDI health alert: Sensor has issues with packet capturing component - WinPcap instead of Npcap or outdated Npcap**

- **Root Cause**: Sensor installed with legacy WinPcap drivers; or Npcap version older than minimum required; or Npcap missing required config options
- **Solution**: Install/upgrade Npcap per MDI docs (https://aka.ms/mdi/npcap); sensor version 2.184+ includes Npcap 1.0 OEM
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**18. MDI health alert: NTLM Auditing is not enabled - event ID 8004 not being collected**

- **Root Cause**: NTLM Auditing for event ID 8004 not enabled on the domain controller where sensor is installed
- **Solution**: Enable NTLM Auditing events per MDI docs: Configure Windows Event collection > Configure NTLM auditing
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

**19. Defender for Identity sensor fails to start; gMSA PasswordLastSet and LastLogonDate show a future date**

- **Root Cause**: Secure Time Seeding known scenario causes gMSA PasswordLastSet attribute to be set to a future date, making the sensor unable to authenticate
- **Solution**: Create a new gMSA account with correct date attributes as interim fix; open support request with Directory Services to investigate root cause
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

**20. Defender for Identity sensor on Entra Connect loses database permissions after Microsoft Entra Connect update; EXECUTE permission denied on mms_get_globalsettings/mms_get_connectors**

- **Root Cause**: Updating Microsoft Entra Connect resets previously configured database permissions for the MDI sensor
- **Solution**: Reconfigure database permissions following the MDI documentation for AD FS/Entra Connect sensor deployment
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 5.0/10 — MS Learn]`

### Phase 2: Xdr
> Sources: mslearn

**1. Defender for Identity alerts not showing up in Microsoft Defender XDR incidents**

- **Root Cause**: Microsoft Defender for Cloud Apps and Defender for Identity integration is not enabled
- **Solution**: Enable the Defender for Cloud Apps and Defender for Identity integration in the Microsoft Defender portal settings
- ⚠️ **21V/Mooncake**: Not applicable
- `[Score: 🔵 6.0/10 — MS Learn]`

---

## Known Issues Reference

| # | Symptom | Root Cause | Solution | Score | Source |
|---|---------|-----------|----------|-------|--------|
| 1 ⚠️ | Defender for Identity sensor service fails to start with error: CreateLdapConnectionAsync failed ... | Domain controller lacks rights to access the gMSA account password, or the gMSA was not added to ... | Verify gMSA permissions with Get-ADServiceAccount; add DC or security group to PrincipalsAllowedT... | 🔵 6.0 | MS Learn |
| 2 ⚠️ | Defender for Identity sensor installation fails with 'The sensor failed to register due to licens... | Proxy responds with HTTP 401/403 instead of 407 during authentication; sensor misinterprets this ... | Ensure sensor can browse to *.atp.azure.com through the configured proxy without authentication; ... | 🔵 6.0 | MS Learn |
| 3 ⚠️ | Defender for Identity sensor installation fails with 'The sensor failed to connect to service' co... | Trusted root certification authority certificates (DigiCert Global Root G2 for commercial, DigiCe... | Verify certificates with Get-ChildItem -Path 'Cert:\LocalMachine\Root'; download and install the ... | 🔵 6.0 | MS Learn |
| 4 ⚠️ | Defender for Identity silent installation via PowerShell fails with: Unexpected token '/quiet' in... | Missing the ./ prefix when running the sensor setup executable in PowerShell | Use the complete command with ./ prefix: ./"Azure ATP sensor Setup.exe" /quiet NetFrameworkComman... | 🔵 6.0 | MS Learn |
| 5 ⚠️ | Defender for Identity sensor on VMware VM shows health alerts: 'Some network traffic is not being... | VMware Guest OS NIC has IPv4 TSO Offload / Large Send Offload (LSO) enabled, causing configuratio... | Disable IPv4 TSO Offload in VM NIC settings; run Disable-NetAdapterLso -Name {adapter-name}; may ... | 🔵 6.0 | MS Learn |
| 6 ⚠️ | Defender for Identity sensor installation fails with 'ApplyInternal failed two way SSL connection... | Registry values SystemDefaultTlsVersions and SchUseStrongCrypto under .NET Framework v4.0.30319 a... | Set both SystemDefaultTlsVersions and SchUseStrongCrypto to DWORD 1 in HKLM\SOFTWARE\WOW6432Node\... | 🔵 6.0 | MS Learn |
| 7 ⚠️ | Defender for Identity sensor installation fails on Windows Server 2019 with KB5009557 or hardened... | Hardened EventLog permissions or KB5009557 security update restricts the sensor installation process | Install sensor via PSExec: psexec -s -i; or create a Scheduled Task configured to run as LocalSystem | 🔵 6.0 | MS Learn |
| 8 ⚠️ | Defender for Identity sensor installation fails with error 0x80070643 'Failed to install MSI pack... | Installation process cannot reach Defender for Identity cloud services (*.atp.azure.com) for sens... | Ensure sensor can browse to *.atp.azure.com directly or through proxy; set proxy via command line... | 🔵 6.0 | MS Learn |
| 9 ⚠️ | Defender for Identity alerts not showing up in Microsoft Defender XDR incidents | Microsoft Defender for Cloud Apps and Defender for Identity integration is not enabled | Enable the Defender for Cloud Apps and Defender for Identity integration in the Microsoft Defende... | 🔵 6.0 | MS Learn |
| 10 ⚠️ | Defender for Identity workspace creation fails with 'a security group with the same name already ... | Previous MDI workspace license expired and was deleted, but associated Entra ID groups (Azure ATP... | Rename old groups in Entra ID > Groups by adding ' - old' suffix, then create new workspace in Mi... | 🔵 6.0 | MS Learn |
| 11 ⚠️ | Defender for Identity sensor fails to enumerate event logs; limited security alerts with EventLog... | DACL on Security Event Log restricts access by the AATPSensor service Local Service account | Add DACL entry (A;;0x1;;;S-1-5-80-818380073-2995186456-1411405591-3990468014-3617507088) to Secur... | 🔵 6.0 | MS Learn |
| 12 ⚠️ | Defender for Identity sensor installation fails with COMException 0x80090008 NTE_BAD_ALGID: Inval... | Certificate management client (e.g., Entrust Entelligence Security Provider) prevents the sensor ... | Uninstall certificate management client, install MDI sensor, then reinstall certificate managemen... | 🔵 6.0 | MS Learn |
| 13 ⚠️ | MDI health alert: Sensor stopped communicating - no data received from sensor for over 5 minutes | Network issue between sensor and MDI cloud service; router/firewall blocking communication; or se... | Check that communication between sensor and MDI cloud service is not blocked by routers or firewa... | 🔵 6.0 | MS Learn |
| 14 ⚠️ | MDI health alert: Directory services user credentials are incorrect | Directory service account username/password/domain configured incorrectly in MDI settings; for gM... | Verify username password and domain in Directory services config page; for gMSA verify all prereq... | 🔵 6.0 | MS Learn |
| 15 ⚠️ | MDI health alert: Low success rate of active name resolution - IP to device name resolution faili... | Required ports (135 for NTLM over RPC, 137 for NetBIOS) not open for inbound from sensors; revers... | Open port 135 (NTLM/RPC) and port 137 (NetBIOS) inbound from MDI sensors; verify sensors can reac... | 🔵 6.0 | MS Learn |
| 16 ⚠️ | MDI health alert: No traffic received from domain controller - standalone sensor receives no mirr... | Port mirroring from DCs to standalone MDI sensor not configured or not working; Receive Segment C... | Verify port mirroring on network devices; disable Receive Segment Coalescing (IPv4/IPv6) in senso... | 🔵 6.0 | MS Learn |
| 17 ⚠️ | MDI health alert: Read-only user password expired - all sensors stop running no new data collected | The directory service account password used for LDAP queries against AD has expired | Change domain connectivity password and update Directory Service account password in MDI settings... | 🔵 6.0 | MS Learn |
| 18 ⚠️ | MDI health alert: Sensor has issues with packet capturing component - WinPcap instead of Npcap or... | Sensor installed with legacy WinPcap drivers; or Npcap version older than minimum required; or Np... | Install/upgrade Npcap per MDI docs (https://aka.ms/mdi/npcap); sensor version 2.184+ includes Npc... | 🔵 6.0 | MS Learn |
| 19 ⚠️ | MDI health alert: NTLM Auditing is not enabled - event ID 8004 not being collected | NTLM Auditing for event ID 8004 not enabled on the domain controller where sensor is installed | Enable NTLM Auditing events per MDI docs: Configure Windows Event collection > Configure NTLM aud... | 🔵 6.0 | MS Learn |
| 20 ⚠️ | Defender for Identity sensor fails to start; gMSA PasswordLastSet and LastLogonDate show a future... | Secure Time Seeding known scenario causes gMSA PasswordLastSet attribute to be set to a future da... | Create a new gMSA account with correct date attributes as interim fix; open support request with ... | 🔵 5.0 | MS Learn |
| 21 ⚠️ | Defender for Identity sensor on Entra Connect loses database permissions after Microsoft Entra Co... | Updating Microsoft Entra Connect resets previously configured database permissions for the MDI se... | Reconfigure database permissions following the MDI documentation for AD FS/Entra Connect sensor d... | 🔵 5.0 | MS Learn |
