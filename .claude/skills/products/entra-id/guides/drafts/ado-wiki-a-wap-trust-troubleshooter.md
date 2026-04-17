---
source: ado-wiki
sourceRef: "Supportability/AzureAD/AzureAD:/GeneralPages/AAD/AAD Authentication/ADFS and WAP/ADFS WAP Trust/Web Application Proxy Trust Troubleshooter"
sourceUrl: "https://dev.azure.com/Supportability/AzureAD/_wiki/wikis/AzureAD?pagePath=%2FGeneralPages%2FAAD%2FAAD%20Authentication%2FADFS%20and%20WAP%2FADFS%20WAP%20Trust%2FWeb%20Application%20Proxy%20Trust%20Troubleshooter"
importDate: "2026-04-07"
type: troubleshooting-guide
---

## WAP - AD FS Trust Troubleshooter for Windows Server 2012 R2 and 2016

This document contains troubleshooting steps to address the majority of WAP AD FS trust issues which are identified by event ID 422 in the AD FS admin event log on WAP:

```
Log Name:      AD FS/Admin
Source:        AD FS
Event ID:      422
Level:         Error
Description:   Unable to retrieve proxy configuration data from the Federation Service.
```

-----

Follow all the steps carefully and correct all errors before attempting to reset the WAP trust at step 27.

When resetting the WAP trust with AD FS, the account used for establishing the trust needs to have administrator rights on the AD FS servers.
Don't rely on the AD FS service account because it doesn't require local admin rights.
If there is a Load Balancer or Firewall that does SSL offloading then it's not a supported configuration.
Run all commands from elevated powershell.

-----

1. **Verify time is correct** on all AD FS and WAP servers. Check the time AND TIME ZONE. It should be within a 5-minute offset of the active directory domain. Compare time against the domain controllers within the same active directory site as the AD FS servers.

2. **Verify updates are installed** on ALL AD FS and WAP servers:
   ```powershell
   (get-item c:\windows\adfs\microsoft.identityserver.dll).VersionInfo.FileVersion
   # minimum version 6.3.9600.17567
   # KB2919355, KB3000850

   (get-item c:\windows\adfs\microsoft.identityserver.dkm.dll).VersionInfo.FileVersion
   # minimum version 6.3.9600.17564
   # KB3020773
   ```

3. **Obtain the federation service name**:
   ```powershell
   Get-AdfsProperties | select hostname
   ```

4. **Obtain the AD FS service account**:
   ```powershell
   Get-ItemProperty -Path HKLM:\SYSTEM\CURRENTCONTROLSET\SERVICES\ADFSSRV | Select ObjectName
   ```

5. **On WAP servers**, ping the federation service name and verify it resolves to an IP with a route to the AD FS servers (either AD FS server IP or VIP of load balancer).

6. **Attempt authentication** to: `https://<federation service name>/adfs/ls/idpinitiatedsignon.aspx` with an account that has admin rights on AD FS servers.

7. **Get service communication cert thumbprint** (on primary AD FS or any if using SQL):
   ```powershell
   Get-AdfsCertificate -CertificateType Service-Communications | select Thumbprint
   ```

8. **Check MachineKeys ACL**:
   ```powershell
   get-acl "C:\ProgramData\Microsoft\Crypto\RSA\MachineKeys" | fl
   ```
   Permissions should apply to "This Folder Only" — permissions that apply to subfolders/files will alter private key storage behavior.

9. **Verify cert private key access**:
   ```powershell
   Certutil -v -verifystore my <thumbprint from step 7> | select-string Allow,KeySpec
   ```

10. **If KeySpec is not 1_AT_KEYEXCHANGE**, refer to: [ADFS and keyspec property](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/technical-reference/ad-fs-and-keyspec-property)

11. **Verify certificate permissions** — NT Service\adfssrv or ADFS service account must have at least Allow Read. If missing:
    1. Open certlm.msc > Certificates (Local Computer) > Personal
    2. Right click service communication cert > All tasks > Manage Private Keys
    3. Grant ADFS service account Read permissions

12. **Check SSL bindings** — Run `netsh http show sslcert` on primary AD FS server:
    - hostname:port must match federation service name
    - certhash must match service communication cert thumbprint from step 7
    - Check Ctl Store Name
    - For 0.0.0.0:443 binding with appid starting with 5d89a20c: certhash must match, CTL store must be AdfsTrustedDevices

13. **Repeat step 12** on remaining AD FS and WAP servers.

14. **Fix SSL binding mismatches**:
    ```powershell
    # AD FS
    Set-AdfsSslCertificate -Thumbprint <thumbprint from step 7>
    # WAP
    Set-WebApplicationProxySslCertificate -Thumbprint <thumbprint from step 7>
    ```

15. **Verify changes**. If they didn't take effect:
    ```powershell
    netsh http delete sslcert hostname=<federation service name>
    netsh http add sslcert hostname=<federation service name>:443 certhash=<thumbprint> appid="{5d89a20c-beab-4389-9447-324788eb944a}" sslctlstorename=<AdfsTrustedDevices|null>
    ```

16. **For 0.0.0.0:443**:
    ```powershell
    netsh http delete sslcert ipport=0.0.0.0:443
    netsh http add sslcert ipport=0.0.0.0:443 certhash=<thumbprint> appid="{5d89a20c-beab-4389-9447-324788eb944a}" sslctlstorename=AdfsTrustedDevices
    ```

17. **Check for non-self-signed certs in Trusted Root** on all servers:
    ```powershell
    Get-Childitem cert:\LocalMachine\root -Recurse | Where-Object {$_.Issuer -ne $_.Subject} | Format-List * | Out-File "c:\CARootNonSelfSignedCerts.txt"
    ```

18. **Move non-self-signed certs** from Trusted Root CA to Intermediate CA store (cut/paste in certlm.msc).

19. **Check AdfsTrustedDevices store**:
    ```powershell
    Get-Childitem cert:\LocalMachine\AdfsTrustedDevices -Recurse | Where-Object {$_.Issuer -ne $_.Subject} | Format-List * | Out-File "c:\AdfsTrustedDevicesNonSelfSignedCerts.txt"
    ```

20. **Delete non-self-signed certs** from AdfsTrustedDevices store (do not move, delete them).

21. **Verify WID sync** — Open AD FS MMC on secondary servers, check last sync time. If stale:
    ```powershell
    Restart-Service adfssrv
    ```

22. **Verify HOST SPN**:
    ```powershell
    setspn -f -q host/<federation service name>
    ```
    HOST SPN should resolve to AD FS service account. Fix duplicates or missing SPNs.

23. **Verify HTTP SPN** (not required but if exists, must point to AD FS service account):
    ```powershell
    setspn -f -q http/<federation service name>
    # To delete errant SPN:
    setspn -d http/<federation service name> <account>
    ```

24. **Repeat SPN check** using server FQDNs — they should resolve to corresponding computer accounts.

25. **TLS configuration** — Verify TLS 1.0 status and configure TLS 1.2 if needed. Reference: KB3194197 "Considerations for disabling and replacing TLS 1.0 in AD FS".

26. **Check published apps** — Run `Get-WebApplicationProxyApplication`. Ensure no published apps have invalid characters (like `_`) in the hostname URL. Remove with `Remove-WebApplicationProxyApplication` if found.

27. **Reset WAP trust** (after all issues from above are corrected):
    ```powershell
    Install-WebApplicationProxy -FederationServiceName <federation service name> -CertificateThumbprint <thumbprint>
    ```

28. **If reset fails** — Take simultaneous network traces from WAP and AD FS:
    ```powershell
    netsh trace start capture=yes maxsize=4092 tracefile=c:\netcap.etl
    # Reproduce issue, then:
    netsh trace stop
    ```

### References
- KB3134906: Unable to establish trust between WAP and AD FS with event ID 422
- KB3092945: AD FS WAP Proxy trust fails to renew if errant SPN exists
